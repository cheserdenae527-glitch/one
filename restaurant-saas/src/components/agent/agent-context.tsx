"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface AgentSkillRef {
  id: string;
  name: string;
  description: string;
}

interface AgentContextValue {
  isOpen: boolean;
  openAgent: (prefill?: string) => void;
  closeAgent: () => void;
  toggleAgent: () => void;
  pendingPrefill: string | null;
  consumePrefill: () => string | null;
  selectedSkill: string | null;
  setSelectedSkill: (id: string | null) => void;
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  availableSkills: AgentSkillRef[];
  setAvailableSkills: (skills: AgentSkillRef[]) => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrefill, setPendingPrefill] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<AgentSkillRef[]>([]);

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
      value={{
        isOpen, openAgent, closeAgent, toggleAgent,
        pendingPrefill, consumePrefill,
        selectedSkill, setSelectedSkill,
        selectedAgentId, setSelectedAgentId,
        availableSkills, setAvailableSkills,
      }}
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
