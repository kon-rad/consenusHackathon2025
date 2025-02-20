import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-8">
            {/* <Image
              src=""
              alt="Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            /> */}
            {/* <div className="hidden space-x-6 md:flex">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                Sentient
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                Prototype
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                Try G.A.M.E
              </Button>
            </div> */}
          </div>

          <div className="flex flex-1 justify-center px-16">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search"
                className="w-full bg-black pl-10 text-white placeholder-gray-500 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white"
            >
              Create New Agent
            </Button>
            <Button variant="ghost">All</Button>
            <Button variant="ghost">Connect</Button>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="border-b border-gray-800 px-4">
        <div className="flex space-x-4 py-2">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            Market Cap
          </Button>
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            New Pairs
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="mb-4 grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-4 text-sm text-gray-400">
          <div className="pl-16">AI Agents</div>
          <div className="text-right">Market Cap</div>
          <div className="text-right">Token Price</div>
          <div className="text-right">Created At</div>
          <div>Created By</div>
        </div>

        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-4 rounded-lg p-4 hover:bg-gray-800/50"
            >
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-12">
                  <Image
                    src={agent.avatar || "/placeholder.svg"}
                    alt={agent.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  {agent.verified && (
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-1">
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12">
                        <path
                          fill="currentColor"
                          d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{agent.name}</span>
                    <span className="text-sm text-gray-500">
                      ${agent.symbol}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{agent.hash}</span>
                    <span className="rounded bg-gray-800 px-2 py-0.5">
                      {agent.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">${agent.marketCap}k</div>
              <div className="text-right">${agent.tokenPrice}</div>
              <div className="text-right">{agent.createdAt}</div>
              <div className="flex items-center space-x-2">
                <Image
                  src={agent.creatorAvatar || "/placeholder.svg"}
                  alt="Creator"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm text-gray-500">
                  {agent.creatorHash}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const agents = [
  {
    id: 1,
    name: "MKTrader",
    symbol: "MKTT",
    hash: "0x2099...F037EA",
    category: "AI Trader",
    avatar: "/agentA.png?height=48&width=48",
    verified: true,
    marketCap: "5.97",
    tokenPrice: "0.000006",
    createdAt: "an hour ago",
    creatorAvatar: "/agentA.png?height=24&width=24",
    creatorHash: "AFPc...6KG",
  },
  {
    id: 2,
    name: "aimon_agent",
    symbol: "AIMON",
    hash: "0x5559...d73e00",
    category: "AI Trader",
    avatar: "/agentB.png?height=48&width=48",
    verified: true,
    marketCap: "6.3",
    tokenPrice: "0.000006",
    createdAt: "2 hours ago",
    creatorAvatar: "/agentB.png?height=24&width=24",
    creatorHash: "0x82...331",
  },
  // Add more agents as needed...
];
