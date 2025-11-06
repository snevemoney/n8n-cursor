/**
 * Council Members Configuration
 */

export interface CouncilMember {
  name: string;
  role: string;
  specialty: string;
  weight: number;
  goal: string;
}

export const councilMembers: CouncilMember[] = [
  {
    name: "Architectus",
    role: "System Architect",
    specialty: "Monorepo, services, modularity",
    weight: 1.5,
    goal: "Keep Scorpion scalable and extensible."
  },
  {
    name: "Analytica",
    role: "Knowledge & RAG Strategist",
    specialty: "RAG, embeddings, retrieval quality",
    weight: 1.2,
    goal: "Maximize reuse of past side hustles and docs."
  },
  {
    name: "Pragmaton",
    role: "Execution Engineer",
    specialty: "n8n, automation, API wiring",
    weight: 1.3,
    goal: "Translate council output into workflows."
  },
  {
    name: "Satori",
    role: "Alignment & Safety",
    specialty: "user intent, privacy, business rules",
    weight: 1.0,
    goal: "Ensure decisions match Evens' goals and values."
  }
];

