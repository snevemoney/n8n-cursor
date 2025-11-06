import { NextRequest, NextResponse } from 'next/server'
import { getUserWorkspace } from '@/lib/secure/auth'
import { getWorkspaceMembers, updateMemberRole, removeMember } from '@/lib/workspace/management'

export async function GET(req: NextRequest) {
  try {
    const { workspaceId } = await getUserWorkspace()
    const members = await getWorkspaceMembers(workspaceId)
    
    return NextResponse.json({ members })
  } catch (error: any) {
    console.error('Get members error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch workspace members' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { memberId, role } = await req.json()
    const { workspaceId } = await getUserWorkspace()

    if (!memberId || !role) {
      return NextResponse.json(
        { error: 'Member ID and role are required' },
        { status: 400 }
      )
    }

    if (!['owner', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be owner, editor, or viewer' },
        { status: 400 }
      )
    }

    await updateMemberRole(workspaceId, memberId, role)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update member role error:', error)
    
    if (error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update member roles' },
        { status: 403 }
      )
    }
    
    if (error.message.includes('Cannot change owner role')) {
      return NextResponse.json(
        { error: 'Cannot change owner role. Use transfer ownership instead.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get('memberId')
    const { workspaceId } = await getUserWorkspace()

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    await removeMember(workspaceId, memberId)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Remove member error:', error)
    
    if (error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to remove members' },
        { status: 403 }
      )
    }
    
    if (error.message.includes('Cannot remove workspace owner')) {
      return NextResponse.json(
        { error: 'Cannot remove workspace owner' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
} 