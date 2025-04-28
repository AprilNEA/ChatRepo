"use client";

import { useChat } from "@ai-sdk/react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatInput } from "@/components/ui/chat/chat-input";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAvatar,
} from "@/components/ui/chat/chat-bubble";

interface Message {
  id: string;
  role: "user" | "assistant" | "data" | "system";
  content: string;
}

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="border-b">
          <h2 className="text-2xl font-semibold">AI Chat Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask me anything and I'll help you out!
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[60vh] overflow-hidden">
            <ChatMessageList>
              {messages.map((message: Message) => (
                <ChatBubble
                  key={message.id}
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  <ChatBubbleAvatar
                    src={
                      message.role === "user" ? "/user-avatar.png" : "/ai-avatar.png"
                    }
                    fallback={message.role === "user" ? "U" : "AI"}
                  />
                  <ChatBubbleMessage
                    variant={message.role === "user" ? "sent" : "received"}
                  >
                    {message.content}
                  </ChatBubbleMessage>
                </ChatBubble>
              ))}
              {isLoading && (
                <ChatBubble variant="received">
                  <ChatBubbleAvatar src="/ai-avatar.png" fallback="AI" />
                  <ChatBubbleMessage variant="received" isLoading>
                    Thinking...
                  </ChatBubbleMessage>
                </ChatBubble>
              )}
            </ChatMessageList>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <ChatInput
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
