import { NextResponse } from 'next/server';
import { getSystemRAMInfo, detectLightweightMode } from '@/lib/utils/systemResources';
import { getModelRecommendations, getRecommendedModelForRAM } from '@/lib/utils/modelSelector';

export const dynamic = 'force-dynamic';

/**
 * GET /api/system/info
 * Returns system information including RAM, lightweight mode status, and model recommendations
 */
export async function GET() {
  try {
    const ramInfo = getSystemRAMInfo();
    const isLightweight = detectLightweightMode();
    const recommendedModel = getRecommendedModelForRAM();
    const recommendations = getModelRecommendations();
    
    return NextResponse.json({
      success: true,
      system: {
        ramGB: ramInfo.totalGB,
        ramBytes: ramInfo.totalBytes,
        lightweightMode: isLightweight,
      },
      model: {
        recommended: recommendedModel,
        recommendations: recommendations.map(rec => ({
          model: rec.model,
          size: rec.size,
          ramRequired: rec.ramRequired,
          description: rec.description,
          quantized: rec.quantized,
          recommended: rec.model === recommendedModel,
        })),
      },
    });
  } catch (error: any) {
    console.error('[System Info API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get system info',
      },
      { status: 500 }
    );
  }
}

