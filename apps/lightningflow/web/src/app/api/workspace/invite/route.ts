import { NextRequest, NextResponse } from 'next/server'
import { getUserWorkspace } from '@/lib/secure/auth'
import { inviteUser, getWorkspaceInvites, cancelInvite } from '@/lib/workspace/invites'

export async function POST(req: NextRequest) {
  try {
    const { email, role = 'viewer' } = await req.json()
    const { workspaceId } = await getUserWorkspace()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const invite = await inviteUser(email, workspaceId, role)
    
    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        created_at: invite.created_at
      }
    })
  } catch (error: any) {
    console.error('Invite user error:', error)
    
    if (error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite users' },
        { status: 403 }
      )
    }
    
    if (error.message.includes('already a member') || error.message.includes('already sent')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { workspaceId } = await getUserWorkspace()
    const invites = await getWorkspaceInvites(workspaceId)
    
    return NextResponse.json({ invites })
  } catch (error: any) {
    console.error('Get invites error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const inviteId = searchParams.get('id')

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      )
    }

    await cancelInvite(inviteId)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cancel invite error:', error)
    
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    )
  }
} 