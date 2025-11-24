# OCR Workflow - Complete Command Reference

## Overview
This document describes all commands and tools needed for the OCR (Optical Character Recognition) workflow in Scorpion.

## Available Tools

### 1. `kb.list` - List Knowledge Items
**Purpose**: Find JPEG/images in the knowledge base directly without relying on search.

**Usage**:
```typescript
{
  category: 'media',        // Filter by category (use 'media' for images)
  includeImages: true,      // Include images in results (default: true)
  limit: 50                 // Maximum number of items (default: 50, max: 100)
}
```

**Returns**:
- `ok`: boolean - Success status
- `hits`: Array of knowledge items with:
  - `id`: string - Knowledge item ID
  - `title`: string - Item title
  - `isImage`: boolean - Whether this is an image
  - `category`: string - Category (should be 'media' for images)
  - `tags`: string[] - Tags (includes 'jpeg', 'jpg', 'png', 'image', etc.)
  - `ocrText`: string | undefined - Pre-extracted OCR text if available
  - `fullDescription`: string - Full description including OCR text

**Image Detection**:
The tool finds images using multiple criteria:
- Category === 'media'
- Tags include: 'image', 'jpeg', 'jpg', 'png'
- Filename ends with: .jpeg, .jpg, .png, .gif, .webp, .svg
- Description contains: 'extracted text (ocr)', 'image:', 'image file uploaded'

### 2. `kb.search` - Search Knowledge Base
**Purpose**: Semantic search for images and other knowledge items.

**Usage**:
```typescript
{
  query: 'jpeg image OCR',  // Search query
  limit: 10                  // Maximum results (default: 5, max: 20)
}
```

**Returns**: Similar structure to `kb.list` but with relevance scores.

**Special Behavior**:
- For image searches, automatically tries `findByCategory('media')` if no results
- Boosts images significantly in search results
- Uses lower similarity threshold (0.25) for image searches

### 3. `ocr.extract` - Extract Text from Image
**Purpose**: Perform OCR on an image to extract text.

**Usage**:
```typescript
{
  imageId: 'uploaded-1234567890-abc-test.jpg',  // ID from knowledge base (preferred)
  // OR
  imageUrl: 'data:image/jpeg;base64,...',       // Data URL or HTTP URL
  // OR
  imageData: 'base64encodeddata...',            // Direct base64 data
  language: 'eng'                               // OCR language (default: 'eng')
}
```

**Returns**:
- `ok`: boolean - Success status
- `text`: string - Extracted text
- `confidence`: number - OCR confidence (0-100)
- `characterCount`: number - Number of characters extracted
- `imageId`: string - Image ID used
- `error`: string - Error message if failed

**Image Sources**:
1. **imageId** (preferred): Looks up image in knowledge base by ID
   - Finds knowledge item with matching ID and category === 'media'
   - Extracts base64 data from `contentUrl` (data URL)
   
2. **imageUrl**: Direct URL or data URL
   - Supports `data:image/...;base64,...` format
   - Supports HTTP/HTTPS URLs
   
3. **imageData**: Direct base64 encoded image data

## Complete Workflow

### Step 1: Find JPEG Images
```typescript
// Use kb.list to find all JPEG images
const result = await executeTool('kb.list', {
  category: 'media',
  includeImages: true,
  limit: 50
});

// Filter for JPEG images
const jpegImages = result.hits.filter(hit => 
  hit.isImage && 
  (hit.tags?.includes('jpeg') || 
   hit.tags?.includes('jpg') || 
   hit.title?.toLowerCase().includes('.jpeg') ||
   hit.title?.toLowerCase().includes('.jpg'))
);
```

### Step 2: Extract OCR from Each Image
```typescript
// For each JPEG image found
for (const image of jpegImages) {
  const ocrResult = await executeTool('ocr.extract', {
    imageId: image.id,
    language: 'eng'
  });
  
  if (ocrResult.ok) {
    console.log(`Extracted text from ${image.title}:`);
    console.log(ocrResult.text);
    console.log(`Confidence: ${ocrResult.confidence}%`);
  }
}
```

## Image Upload Requirements

When uploading images to the knowledge base:

1. **Category**: Automatically set to `'media'` (regardless of form selection)
2. **Tags**: Automatically includes:
   - `'uploaded'`
   - File extension (`'jpeg'`, `'jpg'`, `'png'`, etc.)
   - `'image'`, `'picture'`, `'photo'`, `'media'`
   - Format-specific tags (`'jpeg'`, `'jpg'` for JPEG files)

3. **Content**: Includes:
   - Image metadata (filename, size, type)
   - Keywords for searchability
   - OCR extracted text (if available) in format: `Extracted Text (OCR):\n<text>`

4. **contentUrl**: Stored as data URL (`data:image/jpeg;base64,...`)

## Fallback Plan for Image Searches

When the planner fails to generate JSON, the system uses a fallback plan:

```typescript
{
  objective: "Find JPEG images and extract OCR text",
  plan: [
    {
      id: 's1',
      title: 'Find all JPEG images in knowledge base',
      tool: 'kb.list',
      args: { category: 'media', includeImages: true, limit: 50 }
    },
    {
      id: 's2',
      title: 'Extract OCR text from first JPEG image',
      tool: 'ocr.extract',
      args: { language: 'eng' },
      dependsOn: ['s1']  // Runs after s1 completes
    },
    {
      id: 's3',
      title: 'Extract OCR text from second JPEG image (if available)',
      tool: 'ocr.extract',
      args: { language: 'eng' },
      dependsOn: ['s1']
    },
    {
      id: 's4',
      title: 'Extract OCR text from third JPEG image (if available)',
      tool: 'ocr.extract',
      args: { language: 'eng' },
      dependsOn: ['s1']
    }
  ]
}
```

**Dynamic Image ID Population**:
- The execution engine automatically populates `imageId` for `ocr.extract` steps
- Uses results from `kb.list` (step s1) to find JPEG images
- Maps step IDs to image indices (s2 = first image, s3 = second image, etc.)

## Error Handling

### No Images Found
- `kb.list` returns empty `hits` array
- `ocr.extract` steps are skipped with error: "No JPEG image found"
- System continues gracefully

### Image Not Found in Knowledge Base
- `ocr.extract` returns: `{ ok: false, error: 'Image with ID ... not found' }`

### OCR Extraction Fails
- Returns: `{ ok: false, error: 'OCR extraction failed', text: '' }`
- System logs error but continues

## Testing

### Manual Test
1. Upload a JPEG image via `/knowledge` page
2. Ask chat: "show me all JPEG images with OCR text"
3. System should:
   - Use `kb.list` to find images
   - Use `ocr.extract` on each found image
   - Display extracted text in summary

### Automated Test
Run: `pnpm test:ocr` (if test script exists)

## Troubleshooting

### Images Not Found
- Check that images are categorized as 'media'
- Verify tags include 'jpeg' or 'jpg'
- Check that `kb.list` is searching all knowledge (not just category 'media')
- Review logs: `tail -f /tmp/scorpion-dev.log | grep -E "kb.list|Total images"`

### OCR Not Working
- Verify `tesseract.js` is installed: `npm list tesseract.js`
- Check image data format (must be valid JPEG/PNG)
- Verify `contentUrl` is a valid data URL
- Review logs: `tail -f /tmp/scorpion-dev.log | grep -E "ocr.extract|OCR"`

### Runtime Errors
- All DOM focus operations have error handling
- Check browser console for "Element not found" errors
- Verify React components handle missing elements gracefully

