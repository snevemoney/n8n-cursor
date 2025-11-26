import { NextRequest, NextResponse } from 'next/server';
import { getRAGStore } from '@/lib/shared-stores';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
import { ExtractedKnowledge } from '@scorpion/core';
import { createWorker } from 'tesseract.js';
import { getFileTracker } from '@/lib/chat/file-tracker';

// Dynamic import for pdf-parse to avoid build errors if dependency is incompatible
let pdfParse: any = null;
try {
  // @ts-ignore - pdf-parse uses CommonJS export
  pdfParse = require('pdf-parse');
} catch (error) {
  console.warn('[Upload] pdf-parse not available, PDF text extraction will be skipped');
}

export const maxDuration = 300; // 5 minutes for large files

/**
 * POST /api/project/knowledge/upload - Upload files to knowledge base
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];
  
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const ragStore = await getRAGStore();
  const uploaded: string[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    try {
      const fileName = file.name;
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
      const fileSize = file.size;
      
      // Skip empty files
      if (fileSize === 0) {
        errors.push({ file: fileName, error: 'File is empty' });
        continue;
      }

      // Determine file type and category
      let contentType = 'text';
      let category = 'manual_upload';
      let content = '';
      let codeSnippets: ExtractedKnowledge['codeSnippets'] = [];
      let contentData: any = null; // For storing image data URLs, PDF URLs, etc.

      // Handle text-based files
      const textExtensions = ['txt', 'md', 'json', 'yaml', 'yml', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'sql', 'html', 'css', 'scss', 'sass', 'less', 'xml', 'toml', 'ini', 'conf', 'vue', 'svelte', 'dart', 'r', 'm', 'mm', 'pl', 'pm', 'ex', 'exs', 'elm', 'clj', 'cljs', 'hs', 'lua', 'vim', 'diff', 'patch'];
      
      if (textExtensions.includes(fileExt)) {
        try {
          content = await file.text();
          contentType = 'text';
          
          // Detect code files
          const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cc', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'sql', 'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'conf', 'vue', 'svelte', 'dart', 'r', 'm', 'mm', 'pl', 'pm', 'ex', 'exs', 'elm', 'clj', 'cljs', 'hs', 'lua', 'vim', 'diff', 'patch'];
          
          if (codeExtensions.includes(fileExt)) {
            category = 'code';
            const languageMap: Record<string, string> = {
              'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
              'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cc': 'cpp', 'h': 'c', 'hpp': 'cpp',
              'cs': 'csharp', 'php': 'php', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'swift': 'swift',
              'kt': 'kotlin', 'scala': 'scala', 'sh': 'bash', 'bash': 'bash', 'zsh': 'bash', 'fish': 'bash',
              'ps1': 'powershell', 'sql': 'sql', 'html': 'html', 'css': 'css', 'scss': 'scss', 'sass': 'sass',
              'less': 'less', 'json': 'json', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml', 'toml': 'toml',
              'ini': 'ini', 'conf': 'ini', 'md': 'markdown', 'markdown': 'markdown', 'vue': 'vue',
              'svelte': 'javascript', 'dart': 'dart', 'r': 'r', 'm': 'objectivec', 'mm': 'objectivec',
              'pl': 'perl', 'pm': 'perl', 'ex': 'elixir', 'exs': 'elixir', 'elm': 'elm', 'clj': 'clojure',
              'cljs': 'clojure', 'hs': 'haskell', 'lua': 'lua', 'vim': 'vim', 'diff': 'diff', 'patch': 'diff'
            };
            const language = languageMap[fileExt] || 'text';
            
            codeSnippets = [{
              file: fileName,
              language: language,
              code: content,
              explanation: `Uploaded ${fileName} file`
            }];
          } else if (fileExt === 'md' || fileExt === 'markdown') {
            category = 'documentation';
          } else if (fileExt === 'csv') {
            category = 'data';
            contentType = 'sheet';
          }
        } catch (error: any) {
          errors.push({ file: fileName, error: `Failed to read file: ${error.message}` });
          continue;
        }
      } else if (fileExt === 'pdf') {
        contentType = 'pdf';
        category = 'document';
        
        // Extract text from PDF (if pdf-parse is available)
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          if (pdfParse) {
            const pdfData = await pdfParse(buffer);
            
            // Store extracted text for RAG searchability
            const extractedText = pdfData.text.trim();
            const pdfMetadata = `PDF Document: ${fileName}\nPages: ${pdfData.numpages}\nSize: ${(fileSize / 1024).toFixed(2)} KB\n\nExtracted Text:\n${extractedText}`;
            
            content = extractedText.length > 0 
              ? pdfMetadata 
              : `PDF Document: ${fileName}\n\nNote: No text content could be extracted from this PDF. It may be a scanned image-based PDF. Consider using OCR for image-based PDFs.`;
            
            // Store PDF buffer for frontend display (optional - can be used for iframe rendering)
            contentData = { 
              url: `data:application/pdf;base64,${buffer.toString('base64')}`, 
              type: 'application/pdf',
              pages: pdfData.numpages,
              text: extractedText
            };
          } else {
            // pdf-parse not available, store PDF without text extraction
            content = `PDF Document: ${fileName}\n\nFile uploaded to knowledge base.\nSize: ${(fileSize / 1024).toFixed(2)} KB\n\nNote: PDF text extraction is not available.`;
            contentData = { 
              url: `data:application/pdf;base64,${buffer.toString('base64')}`, 
              type: 'application/pdf'
            };
          }
        } catch (error: any) {
          console.warn(`Failed to extract text from PDF ${fileName}:`, error.message);
          content = `PDF Document: ${fileName}\n\nFile uploaded to knowledge base.\nSize: ${(fileSize / 1024).toFixed(2)} KB\n\nNote: Text extraction failed: ${error.message}`;
          contentType = 'pdf';
        }
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
        contentType = 'image';
        category = 'media';
        
        // Convert image to base64 data URL for storage and display
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString('base64');
          const mimeType = file.type || `image/${fileExt === 'svg' ? 'svg+xml' : fileExt === 'jpg' ? 'jpeg' : fileExt}`;
          const dataUrl = `data:${mimeType};base64,${base64}`;
          
          // Perform OCR on image to extract text (skip SVG as it's vector graphics)
          let ocrText = '';
          if (fileExt !== 'svg' && fileExt !== 'gif') {
            try {
              console.log(`🔍 Performing OCR on ${fileName}...`);
              const worker = await createWorker('eng'); // English language
              const { data: { text } } = await worker.recognize(buffer);
              await worker.terminate();
              
              ocrText = text.trim();
              if (ocrText.length > 0) {
                console.log(`✅ OCR extracted ${ocrText.length} characters from ${fileName}`);
              } else {
                console.log(`⚠️ OCR found no text in ${fileName}`);
              }
            } catch (ocrError: any) {
              console.warn(`⚠️ OCR failed for ${fileName}:`, ocrError.message);
              // Continue without OCR text - image will still be stored
            }
          }
          
          // Build content with OCR text for RAG searchability
          // Include keywords for better searchability
          const imageKeywords = ['image', 'picture', 'photo', 'photo', fileExt, 'jpeg', 'jpg', 'png', 'uploaded', 'upload'];
          const imageMetadata = `Image: ${fileName}\nSize: ${(fileSize / 1024).toFixed(2)} KB\nType: ${mimeType}\nFile Extension: ${fileExt}`;
          content = ocrText.length > 0
            ? `${imageMetadata}\n\nKeywords: ${imageKeywords.join(', ')}\n\nExtracted Text (OCR):\n${ocrText}`
            : `${imageMetadata}\n\nKeywords: ${imageKeywords.join(', ')}\n\nImage file uploaded to knowledge base.${fileExt === 'svg' || fileExt === 'gif' ? ' (OCR skipped for vector/animated images)' : ' (No text detected via OCR)'}`;
          
          // Store data URL in contentUrl for frontend display
          contentData = { 
            url: dataUrl, 
            alt: fileName, 
            type: mimeType,
            ocrText: ocrText || undefined // Include OCR text if available
          };
        } catch (error: any) {
          errors.push({ file: fileName, error: `Failed to process image: ${error.message}` });
          continue;
        }
      } else {
        // Try to read as text for unknown types
        try {
          content = await file.text();
          contentType = 'text';
        } catch {
          content = `Binary file: ${fileName}\n\nFile type: ${file.type || 'unknown'}\nSize: ${(fileSize / 1024).toFixed(2)} KB`;
          contentType = 'binary';
        }
      }

      // Generate a unique ID for the uploaded file
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-').substring(0, 50);
      const id = `uploaded-${timestamp}-${random}-${safeFileName}`;
      
      // Determine knowledge type based on category
      let knowledgeType: ExtractedKnowledge['type'] = 'pattern';
      if (category === 'code') {
        knowledgeType = 'feature';
      } else if (category === 'documentation') {
        knowledgeType = 'best-practice';
      } else if (category === 'data') {
        knowledgeType = 'pattern';
      }
      
      // Create ExtractedKnowledge object
      // For images, include full content (including OCR text) in description for searchability
      // For other files, truncate if too long
      const maxDescriptionLength = contentType === 'image' ? 10000 : 500; // Allow longer descriptions for images with OCR
      const knowledge: ExtractedKnowledge = {
        id,
        source: `manual_upload`,
        type: knowledgeType,
        category: category,
        title: fileName,
        description: content.length > maxDescriptionLength ? content.substring(0, maxDescriptionLength) + '...' : content,
        codeSnippets: codeSnippets,
        patterns: [],
        dependencies: [],
        useCases: [],
        tags: ['uploaded', fileExt, contentType, ...(contentType === 'image' ? ['image', 'picture', 'photo'] : [])],
        extractedAt: new Date().toISOString(),
        filePath: fileName,
        // For images, use the data URL; for others, use filename
        contentUrl: contentData?.url || fileName
      };

      // Add to RAG store
      await ragStore.addKnowledge(knowledge);
      uploaded.push(fileName);
      
      // Track file upload with knowledge base ID
      const tracker = getFileTracker();
      tracker.trackFile({
        path: fileName,
        timestamp: Date.now(),
        source: 'upload',
        contentType: contentType,
        size: fileSize,
        contentPreview: content.substring(0, 200),
        knowledgeBaseId: id, // Store knowledge base ID for uploaded files
      });
      
      console.log(`✅ Uploaded: ${fileName} (${contentType}, ${category})`);
    } catch (error: any) {
      console.error(`❌ Failed to upload ${file.name}:`, error);
      errors.push({ file: file.name, error: error.message || 'Unknown error' });
    }
  }

  return createSuccessResponse({
    uploaded: uploaded.length,
    files: uploaded,
    errors: errors.length > 0 ? errors : undefined
  });
});

