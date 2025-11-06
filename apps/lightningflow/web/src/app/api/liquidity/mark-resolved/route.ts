import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user settings to mark liquidity warning as acknowledged
    const { error: updateError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        liquidity_warning_acknowledged: true,
        last_liquidity_fix: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating user settings:', updateError);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    // Log the action for audit purposes
    try {
      await supabase.from('user_actions').insert({
        user_id: user.id,
        action_type: 'liquidity_fix_acknowledged',
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'boost_liquidity_page'
        }
      });
    } catch (logError) {
      console.error('Failed to log user action:', logError);
      // Don't fail the request if logging fails
    }

    // Optionally, trigger a re-check of liquidity status
    // This could be used to update the dashboard status
    try {
      await fetch(`${request.nextUrl.origin}/api/liquidity/check`, {
        method: 'GET',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Cookie': request.headers.get('Cookie') || ''
        }
      });
    } catch (recheckError) {
      console.error('Failed to re-check liquidity:', recheckError);
      // Don't fail the request if re-check fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Liquidity warning acknowledged. Earnings monitoring resumed.',
      redirect: '/dashboard?liquidity_fixed=true'
    });

  } catch (error) {
    console.error('Error marking liquidity as resolved:', error);
    return NextResponse.json({ 
      error: 'Failed to mark liquidity as resolved' 
    }, { status: 500 });
  }
} 