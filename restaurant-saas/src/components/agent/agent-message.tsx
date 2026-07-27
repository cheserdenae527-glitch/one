"use client";
import { Bot, User, FileImage, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MessageAttachment {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
}

interface Message {
  id: string;
  role: "agent" | "user";
  content: string;
  actions?: Array<{ label: string; action: string }>;
  attachments?: MessageAttachment[];
}

/** Splits on blank lines into paragraphs, and single newlines into <br/>,
 *  so multi-line agent replies actually read like text instead of one
 *  run-on block. */
function FormattedContent({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="space-y-2.5">
      {paragraphs.map((para, i) => (
        <p key={i} className="leading-relaxed">
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function AttachmentThumb({ attachment }: { attachment: MessageAttachment }) {
  if (attachment.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.url}
        alt={attachment.name}
        className="w-24 h-24 object-cover rounded-lg border"
      />
    );
  }
  return (
    <div className="w-24 h-24 rounded-lg border bg-muted/40 flex flex-col items-center justify-center gap-1 text-muted-foreground">
      <FileVideo className="w-5 h-5" />
      <span className="text-[10px] px-1 truncate max-w-full">{attachment.name}</span>
    </div>
  );
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
      <div className={`flex-1 min-w-0 flex flex-col ${isAgent ? "items-start" : "items-end"}`}>
        <div className={`text-sm px-4 py-3 rounded-2xl max-w-[92%] ${
          isAgent
            ? "bg-muted/50 border"
            : "bg-primary text-primary-foreground"
        }`}>
          <FormattedContent text={message.content} />

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {message.attachments.map(att => (
                <AttachmentThumb key={att.id} attachment={att} />
              ))}
            </div>
          )}
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
