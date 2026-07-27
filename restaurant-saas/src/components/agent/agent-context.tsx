"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface AgentContextValue {
  /** Whether the Agent panel is currently expanded */
  isOpen: boolean;
  /** Open the Agent panel. Pass `prefill` to have it start analyzing a specific
   *  piece of content (e.g. a hot-content item the user clicked "参考" on). */
  openAgent: (prefill?: string) => void;
  closeAgent: () => void;
  toggleAgent: () => void;
  /** Content waiting to be consumed by AgentPanel on next render */
  pendingPrefill: string | null;
  consumePrefill: () => string | null;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrefill, setPendingPrefill] = useState<string | null>(null);

  const openAgent = (prefill?: string) => {
    if (prefill) setPendingPrefill(prefill);
    setIsOpen(true);
  };
  const closeAgent = () => setIsOpen(false);
  const toggleAgent = () => setIsOpen(v => !v);
  const consumePrefill = () => {
    const p = pendingPrefill;
    setPendingPrefill(null);
    return p;
  };

  return (
    <AgentContext.Provider
      value={{ isOpen, openAgent, closeAgent, toggleAgent, pendingPrefill, consumePrefill }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within an AgentProvider");
  return ctx;
}
