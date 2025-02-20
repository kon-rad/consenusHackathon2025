'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

export function ChatWindow() {
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onResponse: (response) => {
      // Parse the response chunks
      const reader = response.body?.getReader();
      if (!reader) return;

      const decodeChunks = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Split the chunks by newline in case multiple messages are combined
            const text = new TextDecoder().decode(value);
            const chunks = text.split('\n').filter(chunk => chunk.trim());

            for (const chunk of chunks) {
              try {
                const data = JSON.parse(chunk);
                // Only handle video URLs here, text content is handled automatically by useChat
                if (data.type === 'video' && data.videoUrl) {
                  setCurrentVideoUrl(data.videoUrl);
                }
              } catch (e) {
                console.error('Error parsing chunk:', chunk, e);
              }
            }
          }
        } catch (e) {
          console.error('Error in decodeChunks:', e);
        }
      };

      decodeChunks();
    },
  });

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Avatar Image or Video */}
      <div className="w-full flex justify-center">
        {currentVideoUrl ? (
          <div className="w-full max-w-2xl bg-gray-900/30 rounded-lg overflow-hidden aspect-video">
            <video
              key={currentVideoUrl}
              src={currentVideoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <img
            src="/images/konrad.jpg"
            alt="AI Assistant Avatar"
            className="w-full max-w-2xl rounded-lg object-cover aspect-video"
          />
        )}
      </div>

      {/* Chat Container */}
      <div className="flex flex-col h-[400px] bg-gray-900/30 rounded-lg">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-800 p-4 flex gap-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800/50 border-gray-700"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
} 