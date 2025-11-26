import { listTools } from '@/lib/chat/tools';
import ToolsList from './ToolsList';

export const dynamic = 'force-dynamic';

export default function ToolsPage() {
    // Fetch tools on the server
    const tools = listTools();

    // Serialize tools for client component (strip Zod schema)
    const serializedTools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        // We can't pass Zod schema to client, so we omit it
        // If we needed schema details, we'd need to generate a JSON schema or string representation here
    }));

    return <ToolsList initialTools={serializedTools as any} />;
}
