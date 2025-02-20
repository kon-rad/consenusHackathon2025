from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import List, Dict, Optional
import random
import asyncio
import json
import uuid
from datetime import datetime
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import Any
import openai
from typing import List, Dict, Any
import time
import re
import random
from tavily import TavilyClient
import os
import requests
from moralis import evm_api
import openai
from typing import List, Dict, Any
import time
import re
import random
import pymongo
from datetime import datetime
from moralis import evm_api
import requests
import random
import statistics
from web3 import Web3
from eth_account import Account
import json
from dotenv import load_dotenv


load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# allow origin call from ANYWHERE FOR NOW
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# System-level API key verification
SYSTEM_API_KEY = "some_secret_key"
API_KEY_HEADER = APIKeyHeader(name="X-API-Key")

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI")
# connect to local MONGO_URI
DATABASE_NAME = "chat_database"
CHAT_COLLECTION_NAME = "agents_chats"
AGENT_COLLECTION_NAME = "agents_profiles"

# Initialize MongoDB connection
client = pymongo.MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
chats_collection = db[CHAT_COLLECTION_NAME]
agents_collection = db[AGENT_COLLECTION_NAME]

# System auth verification
def verify_system_token(api_key: str = Security(API_KEY_HEADER)) -> str:
    if api_key != SYSTEM_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid system API key")
    return api_key

async def verify_websocket_token(websocket: WebSocket) -> bool:
    try:
        # Check headers first
        headers = dict(websocket.headers)
        token = headers.get("authorization", "").replace("Bearer ", "")
        
        # If no token in headers, check query parameters
        if not token:
            query = dict(websocket.query_params)
            token = query.get("token", "")
        
        if not token or token != SYSTEM_API_KEY:
            await websocket.close(code=4001, reason="Unauthorized")
            return False
        return True
    except:
        await websocket.close(code=4001, reason="Authentication failed")
        return False

# Chat management
def generate_chat_id() -> str:
    return str(uuid.uuid4())

def get_latest_block_number(chain, api_key):
    """
    Fetch the latest block number for a given blockchain using Moralis API.

    :param chain: The blockchain to query (e.g., "eth", "bsc", "polygon").
    :param api_key: Your Moralis API key.
    :return: The latest block number or an error message.
    """
    try:
        # Moralis endpoint for fetching the latest block number
        url = f"https://deep-index.moralis.io/api/v2.2/latestBlockNumber/{chain}"
        
        # Headers with the API key
        headers = {
            "accept": "application/json",
            "X-API-Key": api_key
        }
        
        # Send the GET request
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            # Parse the JSON response
            data = response.json()
            return data
        else:
            # Handle errors
            return f"Error: Received status code {response.status_code}. Response: {response.text}"

    except Exception as e:
        return f"Error fetching latest block number: {str(e)}"
    
# Models
class ConversateRequest(BaseModel):
    chat_id: Optional[str] = None
    # user must provide either agent_id or on_chain_address
    agent_id: Optional[str] = None
    onchain_address: Optional[str] = None
    # it is optional string
    user_message: str = ""
    model: str = "default"
    function_to_execute: Optional[str] = None

class ConversateResponse(BaseModel):
    reply: str
    chat_id: str
    tool_executed: Any = None  # This allows for any type of value

class GetMessagesResponse(BaseModel):
    # can be a dict to ANY
    messages: List[Dict[str, Any]]

def init_db():
    """
    Initialize the MongoDB database.
    If the collection doesn't exist, it will be created automatically when inserting data.
    """
    if AGENT_COLLECTION_NAME not in db.list_collection_names():
        agents_collection.insert_one({"_id": "init_marker", "data": "initialization"})
    
    if CHAT_COLLECTION_NAME not in db.list_collection_names():
        chats_collection.insert_one({"_id": "init_marker", "data": "initialization"})

def save_message(
        agent_id: str,
        chat_id: str, 
        role: str, 
        content: str, 
        tool_executed: dict = {}):
    """
    Save a single message to the specified chat in MongoDB.
    If the chat does not exist, it will create it.
    """
    message = {
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow().isoformat(),
        "tool_executed": tool_executed
    }
    
    chats_collection.update_one(
        {"_id": chat_id,
         "agent_id": agent_id
         },
        {"$push": {"messages": message}},  # Push the new message into the messages array
        upsert=True  # Create the document if it doesn't exist
    )

class DefinedTool:
    def __init__(self, name, description, input_args):
        self.name = name
        self.description = description
        self.input_args = input_args
        
    def build_tool_representation_for_llm(self):
        tool_call_format = ""
        if len(self.input_args) == 0:
            tool_call_format = f"{self.name}()"
        else:
            tool_call_format = f"{self.name}({', '.join(self.input_args)})"
    
        # add description to the tool representation
        tool_representation = f"{tool_call_format} - Description : {self.description}"

        return tool_representation


    def run_tool(self, input_dict):
        raise NotImplementedError
    
    def test_tool_status(self):
        raise NotImplementedError
    
class PersonaOSAgent:
    def __init__(self, 
                    agent_id : str,
                    name : str,
                    image_address: str,
                    persona: str,
                    goals : List[str],
                    restrictions : List[str],
                    short_term_memory : List[Dict[str, Any]] = None,
                    long_term_memory_rag_url : str = None,
                    run_interval : int = 60,
                    tools : List[DefinedTool] = [],
                    max_history_messages = 10
                    ):
        # generate a unique id for the agent
        self.agent_id = agent_id
        self.image_address = image_address
        self.name = name
        self.persona = persona
        self.goals = goals
        self.restrictions = restrictions
        self.short_term_memory = short_term_memory
        self.long_term_memory_rag_url = long_term_memory_rag_url
        self.run_interval = run_interval
        self.status_active = True
        self.system_prompt = None
        self.tools = tools
        self.short_term_memory_length = 5
        self.messages = []
        self.last_state = None
        self.current_state = None
        self.future_state = None
        self.human_feedback = None
        self.last_run_time = 0 


        self.max_history_messages = max_history_messages
        self.address = None
        self.chat_id = None

    def set_address(self, address):
        self.address = address

    def get_short_term_memory(self):
        raise NotImplementedError
    
    def update_short_term_memory(self, data):
        raise NotImplementedError
    
    def get_long_term_memory(self):
        raise NotImplementedError
    
    def search_long_term_memory(self, query):
        raise NotImplementedError

    def update_long_term_memory(self, data):
        raise NotImplementedError
    
    def update_tools(self, tools):
        self.tools.extend(tools)
    
    def build_tool_representation_for_llm(self):
        return [tool.build_tool_representation_for_llm() for tool in self.tools]
    
    def update_messages_list(self, messages):
        self.messages.extend(messages)

    def run_ai_model(self, messages: List[str],platform='openai', model="gpt-4o"):
        if platform == "openai":
            response = openai.ChatCompletion.create(
                model=model,
                messages=messages
            )
            return response
        
        raise NotImplementedError

    def update_history_on_chain(self):
        raise NotImplementedError
    
    def trigger_execution_of_tool(self):
        # Regex pattern to match the tool call
        pattern = r'execute_tool\[(.*?)\]'
        # Find all matches
        matches = re.findall(pattern, self.current_state)

        # Print the extracted function calls
        for match in matches:
            print()
            print("=============Core Tool Call=================")
            print(f'execute_tool[{match}]')
            
            # Extract the tool name and arguments
            tool_name = match.split("(")[0]
            input_args = match.split("(")[1].split(")")[0]  # Extract content inside the parentheses

            input_dict_format = {}

            # Parse arguments into a dictionary
            if input_args != '':
                # Split by commas, but handle cases where values may include commas (e.g., strings)
                arg_pairs = re.split(r',\s*(?![^\[\]]*\])', input_args)  # Handles cases like `key="value1,value2"`
                for arg_val in arg_pairs:
                    key, value = arg_val.split("=")
                    key = key.strip()
                    value = value.strip().strip("'").strip('"')  # Remove quotes from string values
                    input_dict_format[key] = value

                    
            print(f"Tool Name: {tool_name}")
            print(f"Input Dict: {input_dict_format}")
            print("=====================================")
            print()

            # find the tool in the tools with name tool_name
            tool = [tool for tool in self.tools if tool.name == tool_name][0]

            # execute the tool
            tool_output = tool.run_tool(input_dict_format)

            return tool_name, input_dict_format, tool_output

        return None, None, None

    def run(self):
        # Check if the agent is allowed to run
        if self.last_run_time + self.run_interval < time.time() and self.status_active:
            self.last_run_time = time.time()

            # # get long term memory
            # long_term_memory = self.get_long_term_memory()

            # build the system prompt
            self.build_system_prompt()

            self.update_messages_list([{"role" : "system", "content" : self.system_prompt}])

            # run the openai model
            response = self.run_ai_model(self.messages)

            # update current state
            self.current_state = response.choices[0].message.content

            # Regular expression to match execute_tool function calls
            tool_name, input_dict_format, tool_output = self.trigger_execution_of_tool()

            # add the tool output to the current state end
            if tool_name is not None:
                self.current_state += f"\nThe tool {tool_name} was executed with the following parameters: {input_dict_format}."
                self.current_state += f"\nThe output of the tool was: {tool_output}"


            return self.current_state, tool_name, input_dict_format, tool_output
            
        else:
            raise Exception("Agent is not allowed to run yet. Please wait for the run interval to pass.")

    def pause(self):
        if not self.status_active:
            raise Exception("Agent is already paused.")
        self.status_active = False

    def resume(self):
        if self.status_active:
            raise Exception("Agent is already running.")
        self.status_active = True

    def fetch_messages_from_db(self,chat_id):
        # get messages from the database with the chat_id without the _id field
        messages_dict = chats_collection.find_one({"_id": chat_id}, {"_id": 0})

        if not messages_dict:
            self.messages = []
        else:
            # get the messages key
            self.messages = messages_dict.get("messages")


    def update_chat_id(self, chat_id):
        self.chat_id = chat_id

        # fetch messages into the messages list
        self.fetch_messages_from_db(chat_id)

    def update_messages_list(self, messages,tool_executed={}):
        message = messages[0]

        # add the message to the messages list
        self.messages.append(message)

        # update the message in the database
        save_message(
            self.agent_id,
            self.chat_id, 
            message["role"], 
            message["content"], 
            tool_executed)

    def build_system_prompt(self):
        # get name
        name = self.name
        # get goals
        goals = self.goals
        # get restrictions
        restrictions = self.restrictions
        # build tools representation for the model
        tools_representation = self.build_tool_representation_for_llm()
        # set last state to current state of previous run
        last_state = self.current_state
        # build system prompt for agent
        system_prompt = f"Your an Agentic chatbot, called {name}."
        system_prompt += f"Your persona : {self.persona}"
        system_prompt += "Please always keep the above personality and background in mind when interacting with users with any responses."
        system_prompt += f"You are running with the following parameters: \n"
        system_prompt += f"You have access to the following tools: {tools_representation}. To call a tool, include this in the message execute_tool[tool_name(arg1='smth',arg2=99,...)]"
        system_prompt += "IMPORTANT : Remember to enclose the call with execute_tool[....] - MUST HAVE SQUARE BRACKETS [] ELSE IT WILL NOT CALL. Also ONLY CALL 1 tool per message at MOST. \n "
        system_prompt += f"Goals: {goals} \n"
        system_prompt += f"Restrictions: {restrictions} \n"
        system_prompt += f"Last State: {last_state} \n"
        system_prompt += f"Please use the above following rules and info to answer the user and decide what to execute for the AI agent. Go step by step at each interval. \n"
        self.system_prompt = system_prompt

        return self.system_prompt
 
    def conversate(self, 
                   user_input=None, 
                   self_execution_message=None,
                   function_to_execute=None):
        
        print("USER INPUT ============ ",user_input)

        # if self.messages longer than 10, remove the first message
        if len(self.messages) > self.max_history_messages:
            self.messages.pop(0)

        # add the latest state to the messages
        self.build_system_prompt()

        if function_to_execute is not None:
            # append the request to call the function to execute for the bot in system prompt
            input_args = {}
            # get from ACTIVE_TOOLS
            for tool in self.tools:
                if tool.name == function_to_execute:
                    input_args = tool.input_args

            self.system_prompt += f"\nThe User wants you to Execute this Function: {function_to_execute}. Please do so according to the defined rules and restrictions and ask the user to define the needed input for the function. {input_args}. Do not execute ANY OTHER function in the next message and remind the user if they ask to exexcute anything other than {function_to_execute}."

        self.update_messages_list([{"role" : "system", "content" : self.system_prompt}])

        # add the user input to the messages
        if user_input is not None and user_input != "":
            self.update_messages_list([{"role" : "user", "content" : user_input}])
        else:
            self.update_messages_list([
                {
                "role" : "user", 
                "content" : self_execution_message if self_execution_message else "Please plan your next step according to your persona and execute the next tool relevant to your tool. Do not ASK the user for any input in the next message or question the user. Just plan your next step and execute the relevant tool if any."
                }])

        # run the openai model
        response = self.run_ai_model(self.messages)

        # update the current state
        self.current_state = response.choices[0].message.content

        # call the execute_tool function
        tool_name, input_dict_format, tool_output = self.trigger_execution_of_tool()

        tool_executed = None
        # add the tool output to the current state end
        if tool_name is not None:
            self.current_state += f"\nThe tool {tool_name} was executed with the following parameters: {input_dict_format}."
            self.current_state += f"\nThe output of the tool was: {tool_output}"
            self.current_state += f"\ You will now Summarize the output of the tool and respond to the user."
            
            tool_executed = {"tool_name" : tool_name, "args" : input_dict_format, "output" : tool_output}


            self.update_messages_list([{"role" : "system", "content" : self.current_state}],tool_executed)
            
            # pass the message back into message list to be used in the next iteration
            response = self.run_ai_model(self.messages)

            # update the current state
            self.current_state = response.choices[0].message.content

        # update the messages list
        self.update_messages_list([{"role" : "assistant", "content" : self.current_state}])

        return self.current_state, tool_executed
    


class SellAPTOnAPTOS(DefinedTool):
    def __init__(self, name="sell_apt_on_aptos", description="Call this to sell your APT when you feel like it.", input_args=[]):
        super().__init__(name, description, input_args)

    def run_tool(self, input_dict):
        url = os.getenv("APTOS_SELL_URL")
        response = requests.post(url)

        if response.status_code == 200 or response.status_code == 201:
            return f"Successfully sold your APT on APTOS"
        else:
            return f"Failed to sell your APT on APTOS with status code {response.status_code}"
        
class BuyAPTOnAPTOS(DefinedTool):
    def __init__(self, name="buy_apt_on_aptos", description="Call this to buy your APT when you feel like it.", input_args=[]):
        super().__init__(name, description, input_args)

    def run_tool(self, input_dict):
        url = os.getenv("APTOS_BUY_URL")
        response = requests.post(url)

        if response.status_code == 200 or response.status_code == 201:
            return f"Successfully bought the APT on APTOS"
        else:
            return f"Failed to buy your APT on APTOS with status code {response.status_code}"



    def test_tool_status(self):
        raise NotImplementedError




class GetLatestCryptoNews(DefinedTool):
    def __init__(self, name="get_latest_crypto_news", description="Gets the latest crypto news", input_args=[]):
        super().__init__(name, description, input_args)

    def run_tool(self, input_dict):
        url = os.getenv("CRYPTO_NEWS_URL")
        
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            news = data['results']
            return f"Got the latest crypto news from the world: {news}"
        else:
            return f"Failed to get the latest crypto news"
        


    def test_tool_status(self):
        raise NotImplementedError
    
class SearchOnlineLinks(DefinedTool):
    def __init__(self, name="search_online_links", description="Search for information online via an input query", input_args=["query"]):
        super().__init__(name, description, input_args)
    
    def run_tool(self, input_dict):
        try:
            # create random comments
            tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
            response = tavily_client.search(query=input_dict['query'])

            return f"Got online links for the query {input_dict['query']}: {response}"
        except:
            return f"Failed to get online links for the query {input_dict['query']}"
    
    def test_tool_status(self):
        raise NotImplementedError    

class GetTokenInfo(DefinedTool):
    def __init__(self, name="get_token_info", description="Get information about a token by inputting an address and a chain. Chains can only be eth, base and solana.", input_args=["chain","address"]):
        super().__init__(name, description, input_args)
    
    def run_tool(self, input_dict):
        api_key = os.getenv("MORALIS_API_KEY")
        params = {
        "chain": input_dict['chain'],
            "addresses": [input_dict['address']],
        }
        try:
            result = evm_api.token.get_token_metadata(
            api_key=api_key,
            params=params,
            )

            return f"Got token information for the address {input_dict['address']} on chain {input_dict['chain']}: {result}"
        
        except:
            return f"Failed to get token information for the address {input_dict['address']} on chain {input_dict['chain']}"


    def test_tool_status(self):
        raise NotImplementedError
    
class GetPricePredictions(DefinedTool):
    def __init__(self, name="get_price_predictions", description="Get price predictions for a token based on historical price data, YOU MUST INPUT A VALID 0x based address or tell the user to provide an ETH EVM Address.  It gets it from specific block intervals. This function fetches past prices for a token at regular block intervals (every 1000 blocks), calculates relevant statistics such as moving average, momentum, and volatility, and predicts the token price for the next 1000 blocks. The prediction dynamically adjusts based on trends and market volatility to provide a robust estimate.", input_args=["token_address","chain"]):
        self.name = name
        self.description = description
        self.input_args = input_args

    def run_tool(self, input_dict):
        try:
            token_address = input_dict.get("token_address")
            if not token_address:
                return "Error: Token address is required."
            
            chain = input_dict.get("chain")
            if not chain:
                return "Error: Blockchain chain is required."

            # Get the past 3 days of price data
            prices, block_ranges = self.get_past_prices(token_address,chain)

            # Calculate statistics from the historical prices
            stats = self.calculate_statistics(prices)

            # Extract metrics from statistics
            moving_average = stats.get("moving_average", 0)
            momentum = stats.get("momentum", 0)
            volatility = stats.get("volatility", 0)

            # Robust prediction logic
            # Next day's price is influenced by:
            # 1. Moving average (baseline price prediction)
            # 2. Momentum (price trend over the past 3 days)
            # 3. Volatility (adjustment factor: higher volatility suggests less confidence in the trend)
            if volatility > 0:
                next_day_prediction = moving_average + (momentum / len(prices)) - (0.1 * volatility)
            else:
                next_day_prediction = moving_average + (momentum / len(prices))

            # Return the results in a structured format
            result = {
                "token_address": token_address,
                "past_prices": prices,
                "statistics": stats,
                "start_block_number": block_ranges[0],
                "end_block_number": block_ranges[-1],
                "next_1000_block_prediction": next_day_prediction,
                "IMPORTANT NOTICE FOR MODEL RESPONSE":"This is for educational purposes only - any financial decisions and their outcomes are solely your responsibility. Not financial advice. Technical chart analysis features currently under development.",
                "EXTRA" : "TELL THE USER THAT TECHNICAL CHART ANALYSIS FEATURES ARE CURRENTLY UNDER DEVELOPMENT AND COMING SOON"
            }

            return result

        except Exception as e:
            return f"An error occurred: {str(e)}"

    def calculate_statistics(self, prices):
        """
        Calculate useful statistics from historical prices.

        :param prices: A list of historical prices.
        :return: A dictionary of calculated metrics.
        """
        if not prices:
            return {}

        # Moving Average
        moving_average = sum(prices) / len(prices)

        # Volatility (Standard Deviation)
        volatility = statistics.stdev(prices) if len(prices) > 1 else 0.0

        # Momentum: Difference between the last and first price
        momentum = prices[-1] - prices[0]

        # Maximum and Minimum Prices
        max_price = max(prices)
        min_price = min(prices)

        return {
            "moving_average": moving_average,
            "volatility": volatility,
            "momentum": momentum,
            "max_price": max_price,
            "min_price": min_price
        }
    
    def get_past_prices(self, token_address,chain):
        """Fetch past 3 days' prices of the token using Moralis."""
        try:
            # Replace with your Moralis API key
            # api_key = "YOUR_MORALIS_API_KEY"
            api_key = os.getenv("MORALIS_API_KEY")
            chain = chain
            historical_prices = []

            # Define block ranges (e.g., fetch prices for blocks 3 days apart)
            # Replace these block numbers with dynamically determined values if needed
            # block_ranges = [16323500, 16323510, 16323520]
            # get latest base block
            # latest_block = evm_api.block.getLatestBlockNumber(api_key=api_key, params={"chain": chain})
            latest_block = get_latest_block_number(chain, api_key)
            block_number = int(latest_block)

            # get the block number in past 10 range of 1000
            block_ranges = [block_number - i for i in range(0, 10000, 1000)]

            for to_block in block_ranges:
                # Fetch token price for the specific block
                params = {
                    "address": token_address,
                    "chain": chain,
                    "to_block": to_block,
                }
                result = evm_api.token.get_token_price(api_key=api_key, params=params)

                # Extract and store the price
                price = result.get("usdPrice")
                if price is not None:
                    historical_prices.append(float(price))
                else:
                    print(f"No price data found for block {to_block}. Response: {result}")

            return historical_prices, block_ranges

        except Exception as e:
            print(f"Error fetching prices: {str(e)}")
            return []

    def test_tool_status(self):
        """Test if the tool is functioning as expected."""
        try:
            # Use a sample token address for testing
            sample_token_address = "0x0000000000000000000000000000000000000000"  # Replace with a valid token address
            test_result = self.run_tool({"token_address": sample_token_address})
            return test_result
        except Exception as e:
            return f"Test failed: {str(e)}"

class GetTrendingTokens(DefinedTool):
    def __init__(self, name="get_trending_tokens", description="Get the trending tokens from Moralis", input_args=[]):
        super().__init__(name, description, input_args)
    
    def run_tool(self, input_dict):
        API_KEY = os.getenv("MORALIS_API_KEY")

        url = "https://deep-index.moralis.io/api/v2.2/discovery/tokens/trending"
        headers = {
            "Accept": "application/json",
            "X-API-Key": API_KEY
        }
        response = requests.request("GET", url, headers=headers)


        if response.status_code == 200:
            return response.json()
        
        return f"Failed to get trending tokens {response.json()}"

    
    def test_tool_status(self):
        raise NotImplementedError

class GetTopTokens(DefinedTool):
    def __init__(self, name="get_top_tokens", description="Get the top tokens from Moralis", input_args=[]):
        super().__init__(name, description, input_args)
    
    def run_tool(self, input_dict):
        API_KEY =  os.getenv("MORALIS_API_KEY")

        url = "https://deep-index.moralis.io/api/v2.2/market-data/erc20s/top-tokens"
        headers = {
            "Accept": "application/json",
            "X-API-Key": API_KEY
        }
        response = requests.request("GET", url, headers=headers)

        if response.status_code == 200:
            return response.json()
        
        return f"Failed to get top tokens"


    def test_tool_status(self):
        raise NotImplementedError

class GetTopMovers(DefinedTool):
    def __init__(self, name="get_top_movers", description="Get the top movers from Moralis", input_args=[]):
        super().__init__(name, description, input_args)
    
    def run_tool(self, input_dict):
        API_KEY = os.getenv("MORALIS_API_KEY")

        url = "https://deep-index.moralis.io/api/v2.2/market-data/erc20s/top-movers"
        headers = {
            "Accept": "application/json",
            "X-API-Key": API_KEY
        }
        response = requests.request("GET", url, headers=headers)

        if response.status_code == 200:
            return response.json()
        
        return f"Failed to get top movers"


    def test_tool_status(self):
        raise NotImplementedError

class GetExchangeRateOfBaseAndQuote(DefinedTool):
    def __init__(self, name="get_exchange_rate_of_base_and_quote", description="Get the exchange rate of a base and quote asset", input_args=["base_asset", "quote_asset"]):
        super().__init__(name, description, input_args)
    
    def run_tool(self, input_dict):
        API_KEY = os.getenv("COINAPI_API_KEY")
        asset_id_base = input_dict['base_asset']
        asset_id_quote = input_dict['quote_asset']

        url = f"https://rest.coinapi.io/v1/exchangerate/{asset_id_base}/{asset_id_quote}"

        payload = {}
        headers = {
        'Accept': 'text/plain',
        'X-CoinAPI-Key': API_KEY
        }

        response = requests.request("GET", url, headers=headers, data=payload)

        if response.status_code == 200:
            data = response.json()
            exchange_rate = data
            return f"Got exchange rate for {asset_id_base} to {asset_id_quote}: {exchange_rate}"

        else:
            return f"Failed to get exchange rate for {asset_id_base} to {asset_id_quote}"
    
    def test_tool_status(self):
        raise NotImplementedError


ACTIVE_TOOLS = [
    GetLatestCryptoNews(),
    SearchOnlineLinks(),
    GetTokenInfo(),
    GetPricePredictions(),
    GetExchangeRateOfBaseAndQuote(),
    GetTopTokens(),
    GetTopMovers(),
    SellAPTOnAPTOS(),
    BuyAPTOnAPTOS(),
]

# create endpoint to give names of all active tools
@app.get("/active_tools")
async def get_active_tools(api_key: str = Depends(verify_system_token)):
    # return tool names, descriptions and input args
    tools = [{"name": tool.name, "description": tool.description, "input_args": tool.input_args} for tool in ACTIVE_TOOLS]
    return {"tools": tools}

# Create endpoint to create an agent with 
# goals, restrictions, persona, name and tools -> Save that into collection called agent_profiles


class AgentProfile(BaseModel):
    name: str
    agent_id: str
    image_address: str
    onchain_address: str
    persona: str
    goals: List[str]
    restrictions: List[str]
    tools: Optional[List[str]] = None

@app.post("/create_agent")
async def create_agent(agent: AgentProfile, api_key: str = Depends(verify_system_token)):
    # create unique agent_id
    agent.agent_id = str(uuid.uuid4())

    # call dummy api to create agent on chain and get address
    def dummy_api_call(agent_id):
        return "0x1234567890"
    
    deployed_address = dummy_api_call(agent.agent_id)
    agent.onchain_address = deployed_address

    # insert agent into the agent_profiles collection
    agents_collection.insert_one(agent.dict())

    return {"message": "Agent created successfully"}


@app.get("/get_agents")
async def get_agents(api_key: str = Depends(verify_system_token)):
    agents = agents_collection.find({}, {"_id": 0})
    return {"agents": list(agents)}

# Routes
@app.post("/conversate", response_model=ConversateResponse)
async def conversate(
    data: ConversateRequest,
    api_key: str = Depends(verify_system_token)
):
    # if chat_id KEY is not provided, generate a new one
    chat_id = data.chat_id or generate_chat_id()

    # get the agent profile from the database
    agent = agents_collection.find_one({"onchain_address": data.onchain_address}) if data.onchain_address else agents_collection.find_one({"agent_id": data.agent_id})

    # if chat_id is given as empty space, generate a new one
    if chat_id == '':
        chat_id = generate_chat_id()

    function_to_execute = data.function_to_execute
    if function_to_execute == '':
        function_to_execute = None

    # initialize the agent
    # Create a new agent
    agent = PersonaOSAgent(
        agent_id = agent["agent_id"],
        image_address=agent["image_address"],
        name = agent["name"],
        persona = agent["persona"],
        goals = agent["goals"],
        restrictions = agent["restrictions"],
        tools = ACTIVE_TOOLS
        )

    agent.update_chat_id(chat_id)    
    reply, tool_executed = agent.conversate(
        user_input = data.user_message, 
        function_to_execute = function_to_execute)
    is_tool_executed = True if tool_executed else False
    
    return {"reply": reply, "chat_id": chat_id, "tool_executed": None if not is_tool_executed else tool_executed}

@app.get("/messages/{chat_id}", response_model=GetMessagesResponse)
async def get_messages(
    chat_id: str,
    api_key: str = Depends(verify_system_token)
):
    messages = chats_collection.find_one({"_id": chat_id}, {"_id": 0})
    return {"messages": messages}

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)