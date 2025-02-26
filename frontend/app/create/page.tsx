"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Upload, Camera, X } from "lucide-react";

export default function CreateAgent() {
  const [platform, setPlatform] = useState("base");
  const [tokenType, setTokenType] = useState("new");

  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    bio: "",
    agentType: "",
    imageUrl: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      agentType: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://heroku-hackathon-agent-52a7eec1e3e5.herokuapp.com/create_agent', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'X-API-Key': 'some_secret_key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          agent_id: Date.now().toString(), // Generate a temporary ID
          image_address: formData.imageUrl || "https://placeholder.com/image", // Default placeholder
          onchain_address: "0x" + Math.random().toString(16).slice(2, 10), // Generate a temporary address
          persona: `You are a ${formData.agentType} AI agent named ${formData.name}. ${formData.bio}`,
          goals: [
            "Get latest news",
            "Make profitable signals for users",
            "Make trades if tools are available"
          ],
          restrictions: [
            "Do not lie or make up info"
          ],
          tools: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      // Handle successful creation (e.g., redirect or show success message)
      console.log('Agent created successfully');
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const renderImageSection = () => (
    <div className="space-y-2">
      <Label className="text-white flex gap-1">
        Profile Picture <span className="text-red-500">*</span>
      </Label>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16">
          {formData.imageUrl ? (
            <div className="relative h-16 w-16">
              <img
                src={formData.imageUrl}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
              />
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, imageUrl: "" }));
                }}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-white/50" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-white/50">
            Upload an image. JPG, PNG, WEBP and GIF files supported.
          </div>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="file-upload"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Implement file upload to S3
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="text-white border-white/10 hover:bg-white/5"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-white/10 bg-black">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-6">
            {/* <span className="text-white font-semibold">Logo</span> */}
            <div className="space-x-4 text-sm text-white/80"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                type="search"
                placeholder="Search"
                className="w-64 bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/50"
              />
            </div>
            {/* <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white"
              onClick={() => {
                window.location.href = `/create`;
              }}
            >
              Create New Agent
            </Button> */}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          Create New Agent
          <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </span>
        </h1>

        <div className="space-y-6">
          <RadioGroup value={tokenType} onValueChange={setTokenType}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="new"
                  id="new"
                  className="border-white/50 text-teal-500"
                />
                <Label htmlFor="new" className="text-white">
                  I want to launch an AI Agent with a new token
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="existing"
                  id="existing"
                  className="border-white/50 text-teal-500"
                />
                <Label htmlFor="existing" className="text-white">
                  I want to launch an AI Agent on an existing token
                </Label>
              </div>
            </div>
          </RadioGroup>

          {renderImageSection()}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white flex gap-1">
              AI Agent Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              className="bg-white/5 border-white/10 text-white"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticker" className="text-white flex gap-1">
              Ticker <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                $
              </span>
              <Input
                id="ticker"
                className="bg-white/5 border-white/10 text-white pl-7"
                value={formData.ticker}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white flex gap-1">
              Biography <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="This is the short bio that will be shown at your agent's profile"
              className="bg-white/5 border-white/10 text-white h-32 placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-white flex gap-1">
              Agent Type <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="type1">Type 1</SelectItem>
                <SelectItem value="type2">Type 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-white/50">
            Disclaimer: Avoid using third-party token lockers during the bonding
            stage, as it may lead to token loss. Instead, send tokens to 
            wallet #x86k6k639PFB5G2f89x65DA5F1D9aFaB52A2E32 for a secure,
            immediate 6-month lock.
          </p>

          <div className="flex items-center gap-4">
            <Button 
              className="bg-teal-500 text-white hover:bg-teal-600"
              onClick={handleSubmit}
            >
              Next
            </Button>
            <Button
              variant="ghost"
              className="bg-white/5 border-white/10 text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
