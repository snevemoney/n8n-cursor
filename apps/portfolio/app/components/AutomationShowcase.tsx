'use client';

type Workflow = {
  id: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  screenshot?: string;
};

const workflows: Workflow[] = [
  {
    id: "elevenlabs",
    title: "ElevenLabs POST Call Workflow",
    category: "Voice & Content",
    description:
      "n8n workflow that sends scripts to ElevenLabs via POST call, generates voice assets, handles retries, and stores results with logs.",
    tech: ["n8n", "ElevenLabs API", "Webhooks", "File Management"],
    screenshot: "/workflows/elevenlabs-post-call.png",
  },
  {
    id: "inbound-assistant",
    title: "Inbound Assistant",
    category: "AI Assistant",
    description:
      "Inbound messages (email/forms/webhooks) are routed to an AI assistant, which crafts responses and sends replies automatically. Includes calendar, email, contact, and FAQ agents.",
    tech: ["n8n", "OpenAI", "Email", "Webhooks", "VAPI"],
    screenshot: "/workflows/inbound-assistant.png",
  },
  {
    id: "social-media-finder",
    title: "Social Profile Finder",
    category: "Research",
    description:
      "Given a name or brand, the workflow searches and returns main social profiles (Instagram, LinkedIn, Twitter, TikTok, Facebook) to support research, outreach, or lead generation.",
    tech: ["n8n", "Web Scraping", "APIs"],
    screenshot: "/workflows/social-media-finder.png",
  },
  {
    id: "text-to-image-video",
    title: "AI Nana - Text to Image & Video",
    category: "Creative Automation",
    description:
      "Transforms text prompts into images, then into UGC-style videos using external APIs. Handles Telegram triggers, image generation, video creation, and automated delivery.",
    tech: ["n8n", "Text-to-Image", "Image-to-Video", "Telegram", "OpenAI"],
    screenshot: "/workflows/text-to-image-video.png",
  },
  {
    id: "email-notifications",
    title: "Email Notification System",
    category: "Data & Operations",
    description:
      "Routes incoming emails by type and sends automated responses. Handles welcome emails, verification, password resets, work orders, compliance alerts, and monthly reports.",
    tech: ["n8n", "Email", "Routing", "Automation"],
    screenshot: "/workflows/email-notifications.png",
  },
  {
    id: "lead-capture",
    title: "Website Lead Capture with Apollo.io",
    category: "Data Pipeline",
    description:
      "Captures leads from webhooks, enriches data from Apollo.io, creates contacts in HubSpot, and sends automated thank you and team notifications.",
    tech: ["n8n", "Apollo.io", "HubSpot", "Gmail", "Webhooks"],
    screenshot: "/workflows/lead-capture.png",
  },
  {
    id: "rag-chatbot",
    title: "RAG Agent / PI Attorney Lead Qualifier",
    category: "AI & RAG",
    description:
      "Retrieval-augmented chatbot combining custom documents with an LLM to answer context-aware questions. Includes Google Drive ingestion, vector store, and chat interface.",
    tech: ["n8n", "RAG", "OpenAI", "Supabase Vector Store", "Google Drive"],
    screenshot: "/workflows/rag-chatbot.png",
  },
  {
    id: "voice-assistant",
    title: "Voice Assistant Agent (Telegram)",
    category: "AI Assistant",
    description:
      "Voice-enabled Telegram assistant that transcribes audio, processes requests through specialized agents (email, calendar, contact, YouTube, web), and responds with audio or text.",
    tech: ["n8n", "Telegram", "OpenAI", "Audio Transcription", "AI Agents"],
    screenshot: "/workflows/voice-assistant.png",
  },
];

export function AutomationShowcase() {
  return (
    <section className="mb-20 md:mb-32">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Featured Automation Work</h2>
        <p className="text-lg text-[rgba(228,232,238,0.8)] max-w-3xl">
          I don&apos;t just build one-off flows — I&apos;ve built a full library of reusable workflows for content, operations, and data. 
          You didn&apos;t just learn n8n, you built a small automation agency in your VPS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((flow) => (
          <div
            key={flow.id}
            className="border border-[rgba(255,255,255,0.08)] rounded-lg p-6 bg-[#0f1318] hover:border-[#13c6a8] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-[rgba(228,232,238,0.9)]">{flow.title}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-[rgba(19,198,168,0.1)] border border-[rgba(19,198,168,0.3)] text-[#13c6a8] whitespace-nowrap">
                {flow.category}
              </span>
            </div>

            {flow.screenshot && (
              <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0d10]">
                <img
                  src={flow.screenshot}
                  alt={`${flow.title} workflow screenshot`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image if it doesn't exist yet
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <p className="text-sm text-[rgba(228,232,238,0.7)] mb-4 leading-relaxed">
              {flow.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {flow.tech.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(228,232,238,0.7)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

