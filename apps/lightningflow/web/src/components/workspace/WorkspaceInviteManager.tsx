'use client'
import { apiPath } from '@/lib/base-path';

import { useState, useEffect } from 'react'
import { useWorkspace, useWorkspacePermissions } from '@/lib/workspace-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Mail, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Invite {
  id: string
  email: string
  role: string
  token: string
  created_at: string
}

export function WorkspaceInviteManager() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  
  const { currentWorkspace } = useWorkspace()
  const { canManageMembers } = useWorkspacePermissions()

  const fetchInvites = async () => {
    try {
      const response = await fetch(apiPath('/api/workspace/invite'))
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites)
      }
    } catch (error) {
      console.error('Error fetching invites:', error)
    }
  }

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(apiPath('/api/workspace/invite'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Invitation sent successfully!')
        setEmail('')
        setRole('viewer')
        await fetchInvites()
      } else {
        toast.error(data.error || 'Failed to send invitation')
      }
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(apiPath(`/api/workspace/invite?id=${inviteId}`), {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Invitation cancelled')
        await fetchInvites()
      } else {
        toast.error('Failed to cancel invitation')
      }
    } catch (error) {
      toast.error('Failed to cancel invitation')
    }
  }

  const copyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`
    await navigator.clipboard.writeText(inviteUrl)
    setCopiedToken(token)
    toast.success('Invite link copied to clipboard!')
    
    setTimeout(() => setCopiedToken(null), 2000)
  }

  useEffect(() => {
    if (canManageMembers) {
      fetchInvites()
    }
  }, [canManageMembers])

  if (!canManageMembers) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">You don't have permission to manage invitations.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Send Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite New Member
          </CardTitle>
          <CardDescription>
            Send an invitation to add a new member to {currentWorkspace?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Manage pending invitations to your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-muted-foreground">No pending invitations</p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{invite.email}</span>
                      <Badge variant="secondary">{invite.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteLink(invite.token)}
                    >
                      {copiedToken === invite.token ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelInvite(invite.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 