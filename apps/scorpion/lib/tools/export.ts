/**
 * Export utilities for user tools (PDF, Markdown, JSON)
 */

/**
 * Export content as Markdown file
 */
export function exportAsMarkdown(content: string, filename: string = 'export.md'): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export content as JSON file
 */
export function exportAsJSON(data: any, filename: string = 'export.json'): void {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export content as PDF (client-side using browser print)
 * For server-side PDF generation, use a library like puppeteer
 */
export function exportAsPDF(content: string, filename: string = 'export.pdf'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export as PDF');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          pre { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        ${content.replace(/\n/g, '<br>')}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Format content as Markdown
 */
export function formatAsMarkdown(title: string, content: string, metadata?: Record<string, any>): string {
  let markdown = `# ${title}\n\n`;
  
  if (metadata) {
    markdown += '---\n\n';
    for (const [key, value] of Object.entries(metadata)) {
      markdown += `**${key}**: ${value}\n\n`;
    }
    markdown += '---\n\n';
  }
  
  markdown += content;
  
  return markdown;
}

