"use client";
import { Send, PenLine, MessageSquare, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHORTCUTS = [
  { icon: PenLine, label: "写文案" },
  { icon: MessageSquare, label: "看热点" },
  { icon: CalendarDays, label: "周计划" },
];

export function AgentInput({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="border-t p-3 space-y-2 bg-background">
      <div className="flex gap-1.5">
        {SHORTCUTS.map(s => (
          <Button
            key={s.label}
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground flex-1"
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSend()}
          placeholder="问点什么..."
          className="flex-1 h-9 px-3 text-sm rounded-lg border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={onSend}
          disabled={!value.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
