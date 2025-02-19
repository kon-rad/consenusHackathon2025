"use client";

import { useState } from "react";
import { Search, Twitter, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import dynamic from "next/dynamic";

// Dynamically import the chart to avoid SSR issues
const Chart = dynamic(() => import("./chart"), { ssr: false });

export default function Page() {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="min-h-screen bg-[#001a1a] bg-opacity-90 text-gray-200">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Protocol</h1>
          <div className="hidden md:flex gap-6">
            <Button variant="ghost">Sentiment</Button>
            <Button variant="ghost">Prototype</Button>
            <Button variant="ghost">Try G.A.M.E</Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search"
              className="w-[300px] pl-10 bg-gray-900/50 border-gray-700"
            />
          </div>
          <Button variant="outline" className="border-teal-500 text-teal-500">
            Create New Agent
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6 p-6">
        <main className="space-y-6">
          {/* Token Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-19%20at%205.50.12%E2%80%AFPM-yzYkxP0a7s67iqOYp8QHKeCc5aOtdj.png"
                  alt="Claira"
                />
              </Avatar>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Claira
                  <span className="text-sm text-gray-400">$CLAIRA</span>
                </h2>
                <div className="text-sm text-gray-400">
                  0x2099...F037EA • Information
                </div>
              </div>
            </div>
            <div className="text-right">
              <div>Market Cap</div>
              <div className="text-xl font-bold">$228.51k</div>
              <div className="text-sm text-gray-400">4 months ago</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[400px] bg-gray-900/30 rounded-lg p-4">
            <Chart />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="border-b border-gray-800 w-full justify-start rounded-none bg-transparent">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 rounded-none"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="terminal"
                className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 rounded-none"
              >
                Terminal
              </TabsTrigger>
              <TabsTrigger
                value="holders"
                className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 rounded-none"
              >
                Holders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Biography</h3>
                <p className="text-gray-400">
                  Meet Claira, your AI travel guide! $Claira is an AI-powered
                  token designed to connect, incentivize, and enhance travel
                  experiences across multiple platforms, including Web3
                  communities, travel apps, and decentralized networks. It
                  creates a community-driv...
                </p>
                <Button variant="link" className="text-teal-500 p-0 h-auto">
                  Show More
                </Button>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Framework</h3>
                <div className="flex items-center gap-2">
                  <span>G.A.M.E</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Capabilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "Post Tweet",
                    "Reply Tweet",
                    "Like Tweet",
                    "Quote Tweet",
                    "Retweet",
                    "Search Internet",
                  ].map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      className="border-gray-700"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Swap Card */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">Swap</h3>
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>0</span>
                  <span>VIRTUAL</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">
                    10
                  </Button>
                  <Button variant="outline" size="sm">
                    100
                  </Button>
                  <Button variant="outline" size="sm">
                    1000
                  </Button>
                </div>
                <Button className="w-full">Connect Wallet</Button>
              </div>
            </Tabs>
          </div>

          {/* Token Data */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">Token Data</h3>
            <div className="space-y-4">
              <div>
                <h4 className="flex items-center gap-2">
                  Ascension Progress
                  <span className="text-teal-500">95.83%</span>
                </h4>
                <p className="text-sm text-gray-400">
                  An additional 19,936.27 VIRTUAL is needed before the price
                  increases. Progress increases as the price rises.
                </p>
              </div>
              <div className="flex justify-between">
                <span>$228.51k</span>
                <span>364</span>
              </div>
            </div>
          </div>

          {/* Developer */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">Developer</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-19%20at%205.50.12%E2%80%AFPM-yzYkxP0a7s67iqOYp8QHKeCc5aOtdj.png"
                    alt="Developer"
                  />
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span>0xef96...</span>
                    <span className="text-gray-400">191906</span>
                  </div>
                  <Button
                    variant="link"
                    className="text-teal-500 p-0 h-auto text-sm"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-bold mb-2">Biography</h4>
              <p className="text-sm text-gray-400">
                Obsessed with blockchain, ai, and gaming. Building Claira
                Travels.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
