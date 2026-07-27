"use client";
import { useRef, useState, useEffect } from "react";
import { Send, Paperclip, X, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PendingAttachment {
  id: string;
  file: File;
  type: "image" | "video";
  previewUrl: string;
}

export function AgentInput({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: (attachments: PendingAttachment[]) => void;
}) {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text box grows with content instead of staying a fixed single line.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  // Revoke any object URLs still held locally, but only on unmount — not on
  // every attachments change, since sending hands ownership of these URLs
  // off to the message bubble that renders them.
  useEffect(() => {
    return () => {
      attachments.forEach(a => URL.revokeObjectURL(a.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSend = value.trim().length > 0 || attachments.length > 0;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next: PendingAttachment[] = Array.from(files)
      .filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .map(f => ({
        id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2)}`,
        file: f,
        type: f.type.startsWith("video/") ? "video" : "image",
        previewUrl: URL.createObjectURL(f),
      }));
    setAttachments(prev => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const target = prev.find(a => a.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSend = () => {
    if (!canSend) return;
    onSend(attachments);
    setAttachments([]);
  };

  return (
    <div className="border-t p-3 space-y-2 bg-background">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map(att => (
            <div key={att.id} className="relative w-14 h-14 rounded-lg border overflow-hidden bg-muted/40 group">
              {att.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={att.previewUrl} alt={att.file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <FileVideo className="w-5 h-5" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(att.id)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="移除附件"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          aria-label="上传图片或视频"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={e => onChange(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey && !isComposing) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="问点什么...（Shift+Enter 换行）"
          className="flex-1 max-h-40 min-h-9 px-3 py-2 text-sm rounded-lg border bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleSend}
          disabled={!canSend}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
