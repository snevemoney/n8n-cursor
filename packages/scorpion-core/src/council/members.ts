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
  },
  {
    name: "Nexus",
    role: "Integration Specialist",
    specialty: "API design, data flows, webhooks",
    weight: 1.1,
    goal: "Ensure seamless communication between all services."
  },
  {
    name: "Sentinel",
    role: "Security & Performance",
    specialty: "Security, rate limiting, optimization",
    weight: 1.2,
    goal: "Protect system integrity and maximize performance."
  },
  {
    name: "Catalyst",
    role: "Innovation Advisor",
    specialty: "New technologies, AI trends, experimentation",
    weight: 0.9,
    goal: "Identify opportunities for cutting-edge improvements."
  },
  {
    name: "Oracle",
    role: "Data & Analytics",
    specialty: "Metrics, insights, predictive analytics",
    weight: 1.1,
    goal: "Turn data into actionable intelligence."
  }
];

