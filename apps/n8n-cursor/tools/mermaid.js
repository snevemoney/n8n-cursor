export function generateMermaidDiagram(parsedWorkflow) {
  const { name, nodes, edges } = parsedWorkflow;
  const triggerNodes = nodes.filter(node => node.isTrigger);
  
  // Generate raw Mermaid content (for .mmd and .svg)
  const raw = [
    'flowchart TD',
    // Add nodes
    ...nodes.map(node => {
      const shortType = node.type.split('.').pop() || node.type;
      const label = `"${node.name}\\n(${shortType})"`;
      return `    ${node.id}[${label}]`;
    }),
    '',
    // Add edges
    ...edges.map(edge => {
      const label = edge.label ? ` --|${edge.label}| ` : ' --> ';
      return `    ${edge.from}${label}${edge.to}`;
    }),
    '',
    // Add styles for triggers
    ...triggerNodes.map(node => 
      `    style ${node.id} fill:#fffbcc,stroke:#e1b000,stroke-width:3px`
    )
  ].join('\n');
  
  // Generate fenced Markdown content
  const fenced = `# ${name}

\`\`\`mermaid
${raw}
\`\`\`

**Status:** ${parsedWorkflow.isActive ? '🟢 Active' : '🔴 Inactive'}  
**Last Updated:** ${new Date(parsedWorkflow.updatedAt).toLocaleString()}  
**Nodes:** ${nodes.length} | **Triggers:** ${triggerNodes.length}

`;
  
  return { raw, fenced };
}
