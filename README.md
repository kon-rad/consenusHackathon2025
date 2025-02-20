# Consenus Hackathon 2025

### Video Demo

https://www.youtube.com/watch?v=fo6iL6anvJ8

### Canva slides


https://www.canva.com/design/DAGfmUtZfvU/3achEYVyAOVqwqt2pKuR3A/edit?utm_content=DAGfmUtZfvU&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton





This is a monorepo setup for the Consenus Hackathon 2025, containing:

1. **Frontend** - A Next.js 14 application using TypeScript
2. **Backend** - An Express.js application using TypeScript
3. **PostgreSQL** - A PostgreSQL database running via Docker Compose

## Getting Started

1. Clone this repo:
   \`\`\`bash
   git clone <repository_url>
   cd consenusHackathon2025
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run Docker Compose to start the services:
   \`\`\`bash
   docker compose up
   \`\`\`

4. Access the frontend at \`http://localhost:3000\`
5. Access the backend at \`http://localhost:5000\`

## Notes

- Make sure Docker and Docker Compose are installed on your machine.

# Repository Structure

```
├── .gitignore
├── README.md
├── agent-os/
│ ├── .env
│ └── main.py
├── backend/
│ ├── .env.dist
│ ├── .eslintrc.js
│ ├── .gitignore
│ ├── .prettierrc
│ ├── Dockerfile
│ ├── README.md
│ ├── nest-cli.json
│ ├── package.json
│ ├── src/
│ │ ├── Agent/
│ │ │ ├── Controller/
│ │ │ │ ├── AgentController.ts
│ │ │ │ └── MerkleTradeController.ts
│ │ │ ├── Model/
│ │ │ │ ├── Agent.ts
│ │ │ │ └── agentEntities.ts
│ │ │ ├── Service/
│ │ │ │ ├── AgentService.ts
│ │ │ │ ├── Dto/
│ │ │ │ │ ├── AgentDto.ts
│ │ │ │ │ └── CreateAgentDto.ts
│ │ │ │ ├── MerkleTradeClient.ts
│ │ │ │ ├── createAndFundAccount.ts
│ │ │ │ └── loadAccountFromPrivateKey.ts
│ │ │ └── AgentModule.ts
│ │ ├── AppModule.ts
│ │ ├── Shared/
│ │ │ └── IdGenerator.ts
│ │ ├── dataSource/
│ │ │ ├── cleanMigration.ts
│ │ │ ├── dataSource.ts
│ │ │ ├── entities.ts
│ │ │ └── index.ts
│ │ ├── index.ts
│ │ ├── main.ts
│ │ └── migrations/
│ │ ├── 1739961531325-AddAgent.ts
│ │ └── 1739968247165-AddMetadataToAgent.ts
│ ├── tsconfig.build.json
│ ├── tsconfig.json
│ └── artifacts/
│ ├── \_environment-config/
│ │ └── http-client.env.json
│ ├── agent.http
│ └── merkle.http
├── docker-compose.prod.yml
├── docker-compose.yml
├── frontend/
│ ├── Dockerfile
│ ├── README.md
│ ├── app/
│ │ ├── create/
│ │ │ └── page.tsx
│ │ ├── detail/
│ │ │ ├── chart.tsx
│ │ │ └── page.tsx
│ │ ├── fonts/
│ │ │ ├── GeistMonoVF.woff
│ │ │ └── GeistVF.woff
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── components/
│ │ ├── ui/
│ │ │ ├── avatar.tsx
│ │ │ ├── button.tsx
│ │ │ ├── input.tsx
│ │ │ ├── label.tsx
│ │ │ ├── radio-group.tsx
│ │ │ ├── select.tsx
│ │ │ ├── tabs.tsx
│ │ │ └── textarea.tsx
│ ├── lib/
│ │ └── utils.ts
│ ├── next-env.d.ts
│ ├── next.config.mjs
│ ├── package.json
│ ├── postcss.config.mjs
│ ├── tailwind.config.ts
│ ├── tsconfig.json
│ └── components.json
├── nginx/
│ ├── Dockerfile
│ └── conf.d/
│ └── site.conf
└── start-dev.sh
```

# Backend

The backend is built using FastAPI and provides several endpoints for managing AI agents and interacting with blockchain services.

Key Files and Directories
main.py: The main entry point for the FastAPI application.
src/Agent/Controller/: Contains the controllers for handling API requests related to agents and Merkle trades.
src/Agent/Model/: Contains the data models for the agents.
src/Agent/Service/: Contains the services for managing agents and interacting with external APIs.
src/dataSource/: Contains the data source configuration for TypeORM.
src/migrations/: Contains the database migration files.
Running the Backend
To run the backend, use the following commands:

# Frontend

The frontend is built using Next.js and provides a user interface for interacting with the AI agents.

Key Files and Directories

app/: Contains the main application pages and components.
components/ui/: Contains reusable UI components.
lib/: Contains utility functions.
tailwind.config.ts: Tailwind CSS configuration file.

Video Streaming
- uses Deepgram for text to speech
- Sadltalker model on Fal.ai for image to video

# Agent-OS

Agent-OS is a backend service built with FastAPI that provides APIs for managing AI agents and interacting with various blockchain and AI services. This service is part of the Consensus Hackathon 2025 project.

Key Features
AI Agents: Manage AI agents with specific personas, goals, and tools.
Blockchain Integration: Interact with blockchain services using Moralis API.
AI Integration: Utilize OpenAI's GPT models for AI functionalities.
Database: Store and manage chat data and agent profiles using MongoDB.
Repository Structure
Main Components
main.py
This is the main entry point for the FastAPI application. It includes the following key functionalities:

API Endpoints: Provides endpoints for managing AI agents, conversing with agents, and fetching messages.
Middleware: Configures CORS middleware to allow cross-origin requests.
Database Initialization: Connects to MongoDB and initializes collections.
Models: Defines Pydantic models for request and response validation.
Tools: Implements various tools that agents can use, such as fetching crypto news, getting token information, and predicting token prices.

# Environment Variables

Environment Variables
The project uses environment variables for configuration. The following environment variables are required:

OPENAI_API_KEY: API key for OpenAI.
MONGO_URI: URI for connecting to MongoDB.
APTOS_SELL_URL: URL for selling APT on Aptos.
APTOS_BUY_URL: URL for buying APT on Aptos.
CRYPTO_NEWS_URL: URL for fetching the latest crypto news.
TAVILY_API_KEY: API key for Tavily.
COINAPI_API_KEY: API key for CoinAPI.
MORALIS_API_KEY: API key for Moralis.
