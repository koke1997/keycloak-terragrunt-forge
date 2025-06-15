
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface XPMessage {
  id: string;
  role: string;
  content: string;
  timestamp: Date;
  type: 'suggestion' | 'implementation' | 'question' | 'feedback';
  relatedFiles?: string[];
}

interface XPConversationProps {
  messages: XPMessage[];
  projectConfig: any;
  userInput: string;
  onUserInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export function XPConversation({ 
  messages, 
  projectConfig, 
  userInput, 
  onUserInputChange, 
  onSendMessage 
}: XPConversationProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Development Conversation</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 mb-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-50 ml-8'
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {message.role === 'user' ? 'You' : 
                     projectConfig.roles.find((r: any) => r.id === message.role)?.name || message.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Textarea
            placeholder="Share your thoughts, feedback, or requirements..."
            value={userInput}
            onChange={(e) => onUserInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={onSendMessage} disabled={!userInput.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
