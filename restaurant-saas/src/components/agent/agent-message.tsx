"use client";
import { Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "agent" | "user";
  content: string;
  actions?: Array<{ label: string; action: string }>;
}

export function AgentMessage({
  message,
  onAction,
}: {
  message: Message;
  onAction?: (action: string) => void;
}) {
  const isAgent = message.role === "agent";

  return (
    <div className={`flex gap-2.5 ${isAgent ? "" : "flex-row-reverse"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        isAgent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      }`}>
        {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className={`flex-1 min-w-0 ${isAgent ? "" : "text-right"}`}>
        <div className={`text-sm p-3 rounded-xl ${
          isAgent
            ? "bg-muted/50 border"
            : "bg-primary text-primary-foreground ml-8"
        }`}>
          {message.content}
        </div>
        {isAgent && message.actions && (
          <div className="flex gap-2 mt-1.5">
            {message.actions.map(action => (
              <Button
                key={action.action}
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2.5 text-primary hover:text-primary"
                onClick={() => onAction?.(action.action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
