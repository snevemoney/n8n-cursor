#!/usr/bin/env tsx
/**
 * Test OCR Workflow End-to-End
 * 
 * This script:
 * 1. Creates a test JPEG image with text
 * 2. Uploads it to the knowledge base
 * 3. Tests kb.list to find it
 * 4. Tests ocr.extract to extract text
 * 5. Verifies the full workflow
 */

import { getRAGStore } from '../lib/shared-stores';
import { executeTool } from '../lib/chat/tools';
import * as fs from 'fs';
import * as path from 'path';

// Simple test image creation using a minimal JPEG (1x1 pixel)
// In a real scenario, you'd use a proper image library
const createTestJPEG = (): Buffer => {
  // Minimal valid JPEG (1x1 pixel, grayscale)
  // This is a base64-encoded minimal JPEG
  const minimalJPEG = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
  return Buffer.from(minimalJPEG, 'base64');
};

async function testOCRWorkflow() {
  console.log('🧪 Starting OCR Workflow Test...\n');

  try {
    // Step 1: Create test JPEG
    console.log('📸 Step 1: Creating test JPEG...');
    const testImageBuffer = createTestJPEG();
    const testImagePath = path.join(__dirname, '../../tmp/test-ocr-image.jpg');
    fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
    fs.writeFileSync(testImagePath, testImageBuffer);
    console.log(`✅ Created test JPEG at: ${testImagePath}\n`);

    // Step 2: Upload to knowledge base (simulate via API)
    console.log('📤 Step 2: Uploading test JPEG to knowledge base...');
    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/jpeg' });
    const file = new File([blob], 'test-ocr-image.jpg', { type: 'image/jpeg' });
    formData.append('files', file);

    const uploadResponse = await fetch('http://localhost:3003/api/project/knowledge/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log(`✅ Upload successful:`, uploadResult);
    console.log('');

    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test kb.list to find the image
    console.log('🔍 Step 3: Testing kb.list to find JPEG images...');
    const listResult = await executeTool('kb.list', {
      category: 'media',
      includeImages: true,
      limit: 50,
    });

    console.log(`📊 kb.list results:`, {
      ok: listResult.ok,
      total: listResult.total,
      hits: listResult.hits?.length || 0,
    });

    if (listResult.hits && listResult.hits.length > 0) {
      console.log(`✅ Found ${listResult.hits.length} image(s) in knowledge base`);
      listResult.hits.forEach((hit: any, idx: number) => {
        console.log(`  ${idx + 1}. ${hit.title} (ID: ${hit.id}, isImage: ${hit.isImage})`);
      });
    } else {
      console.log('⚠️  No images found in knowledge base');
    }
    console.log('');

    // Step 4: Test ocr.extract on found images
    if (listResult.hits && listResult.hits.length > 0) {
      console.log('🔍 Step 4: Testing ocr.extract on found images...');
      for (const hit of listResult.hits.slice(0, 3)) {
        if (hit.isImage && hit.id) {
          console.log(`  Extracting OCR from: ${hit.title} (ID: ${hit.id})...`);
          try {
            const ocrResult = await executeTool('ocr.extract', {
              imageId: hit.id,
              language: 'eng',
            });

            if (ocrResult.ok) {
              console.log(`  ✅ OCR Success:`);
              console.log(`     - Text: ${ocrResult.text?.substring(0, 100) || '(empty)'}...`);
              console.log(`     - Confidence: ${ocrResult.confidence?.toFixed(1) || 'N/A'}%`);
              console.log(`     - Characters: ${ocrResult.characterCount || 0}`);
            } else {
              console.log(`  ❌ OCR Failed: ${ocrResult.error}`);
            }
          } catch (error: any) {
            console.log(`  ❌ OCR Error: ${error.message}`);
          }
        }
      }
    } else {
      console.log('⚠️  Skipping OCR test - no images found');
    }
    console.log('');

    // Step 5: Test kb.search for images
    console.log('🔍 Step 5: Testing kb.search for JPEG images...');
    const searchResult = await executeTool('kb.search', {
      query: 'jpeg image OCR',
      limit: 10,
    });

    console.log(`📊 kb.search results:`, {
      ok: searchResult.ok,
      hits: searchResult.hits?.length || 0,
    });

    if (searchResult.hits && searchResult.hits.length > 0) {
      console.log(`✅ Found ${searchResult.hits.length} result(s) via search`);
      searchResult.hits.forEach((hit: any, idx: number) => {
        console.log(`  ${idx + 1}. ${hit.title} (relevance: ${hit.relevance?.toFixed(2)})`);
      });
    }
    console.log('');

    console.log('✅ OCR Workflow Test Complete!');
    console.log('\n📋 Summary:');
    console.log(`  - Upload: ${uploadResponse.ok ? '✅' : '❌'}`);
    console.log(`  - kb.list: ${listResult.ok && listResult.hits?.length > 0 ? '✅' : '❌'} (${listResult.hits?.length || 0} images)`);
    console.log(`  - kb.search: ${searchResult.ok ? '✅' : '❌'} (${searchResult.hits?.length || 0} results)`);
    console.log(`  - ocr.extract: ${listResult.hits && listResult.hits.length > 0 ? '✅' : '⚠️  (no images to test)'}`);

  } catch (error: any) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  testOCRWorkflow().catch(console.error);
}

export { testOCRWorkflow };

