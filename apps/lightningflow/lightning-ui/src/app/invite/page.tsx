/**
 * Referral Invitation Page
 * 
 * Allows users to:
 * - Generate and share referral codes
 * - Track referral performance
 * - View earnings and rewards
 * - Share via multiple channels
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useSupabaseUser } from "../../lib/auth/useSupabaseUser"
import { useRouter } from "next/navigation"
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  QrCode,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Clock,
  Gift,
  ExternalLink,
  RefreshCw,
  Download
} from "lucide-react"
import { toast } from "sonner"

interface ReferralData {
  code: string
  totalReferrals: number
  convertedReferrals: number
  conversionRate: number
  totalEarned: number
  referralsThisMonth: number
  pendingRewards: number
}

interface ReferralHistory {
  id: string
  referee_email: string
  status: 'pending' | 'converted' | 'paid'
  reward_amount: number
  created_at: string
  converted_at?: string
}

export default function InvitePage() {
  const { user, role } = useSupabaseUser()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)
  const [referralData, setReferralData] = useState<ReferralData>({
    code: '',
    totalReferrals: 0,
    convertedReferrals: 0,
    conversionRate: 0,
    totalEarned: 0,
    referralsThisMonth: 0,
    pendingRewards: 0
  })

  const [referralHistory, setReferralHistory] = useState<ReferralHistory[]>([])

  useEffect(() => {
    if (user) {
      fetchReferralData()
    }
  }, [user])

  const fetchReferralData = async () => {
    try {
      setLoading(true)
      
      // In production, this would call your Supabase function
      // const response = await supabase.rpc('get_referral_analytics', { user_id: user.id })
      
      // Mock data for demo
      setTimeout(() => {
        setReferralData({
          code: 'LIGHTNING2024',
          totalReferrals: 12,
          convertedReferrals: 7,
          conversionRate: 58.3,
          totalEarned: 175.00,
          referralsThisMonth: 3,
          pendingRewards: 75.00
        })

        setReferralHistory([
          {
            id: '1',
            referee_email: 'user1@example.com',
            status: 'converted',
            reward_amount: 25,
            created_at: '2024-01-15T10:30:00Z',
            converted_at: '2024-01-16T14:20:00Z'
          },
          {
            id: '2',
            referee_email: 'user2@example.com',
            status: 'pending',
            reward_amount: 25,
            created_at: '2024-01-20T09:15:00Z'
          },
          {
            id: '3',
            referee_email: 'user3@example.com',
            status: 'paid',
            reward_amount: 25,
            created_at: '2024-01-10T16:45:00Z',
            converted_at: '2024-01-11T11:30:00Z'
          }
        ])
        
        setLoading(false)
      }, 1000)
      
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
      toast.error('Failed to load referral data')
      setLoading(false)
    }
  }

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`
    
    try {
      setCopying(true)
      await navigator.clipboard.writeText(referralLink)
      toast.success('Referral link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    } finally {
      setCopying(false)
    }
  }

  const shareViaEmail = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`
    const subject = encodeURIComponent('Join me on Lightning Platform!')
    const body = encodeURIComponent(
      `I've been using Lightning Platform to manage my Bitcoin node and it's amazing! ` +
      `You can get started with a free account and get $10 off your first month: ${referralLink}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaTwitter = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`
    const text = encodeURIComponent(
      `Just discovered Lightning Platform - the easiest way to run a Bitcoin Lightning node! ` +
      `Get $10 off your first month: ${referralLink} #Bitcoin #Lightning`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`)
  }

  const shareViaLinkedIn = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground mb-4">You need to be signed in to access referrals</p>
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invite Friends</h1>
          <p className="text-muted-foreground mt-2">
            Earn rewards by referring others to Lightning Platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchReferralData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Referral Code Card */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <Gift className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Share this code to earn $25 for each friend who subscribes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Referral Code</div>
              <div className="text-2xl font-mono font-bold text-yellow-900">
                {referralData.code}
              </div>
            </div>
            <Button 
              onClick={copyReferralLink}
              disabled={copying}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {copying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              onClick={shareViaEmail}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button 
              variant="outline"
              onClick={shareViaTwitter}
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button 
              variant="outline"
              onClick={shareViaLinkedIn}
              className="flex items-center gap-2"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground">{referralData.totalReferrals}</p>
                <p className="text-xs text-blue-600">{referralData.referralsThisMonth} this month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{referralData.conversionRate}%</p>
                <p className="text-xs text-green-600">
                  {referralData.convertedReferrals}/{referralData.totalReferrals} converted
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(referralData.totalEarned)}
                </p>
                <p className="text-xs text-purple-600">All time</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Rewards</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(referralData.pendingRewards)}
                </p>
                <p className="text-xs text-orange-600">Processing...</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="referrals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="program">Program Info</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
              <CardDescription>Track your referred users and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {referralHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start sharing your referral code to see your progress here
                  </p>
                  <Button onClick={copyReferralLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Referral Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {referralHistory.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          referral.status === 'paid' ? 'bg-green-500' :
                          referral.status === 'converted' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium">{referral.referee_email}</p>
                          <p className="text-sm text-muted-foreground">
                            Referred on {formatDate(referral.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          referral.status === 'paid' ? 'default' :
                          referral.status === 'converted' ? 'secondary' : 'outline'
                        }>
                          {referral.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(referral.reward_amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward Breakdown</CardTitle>
              <CardDescription>See how your earnings are calculated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">For You (Referrer)</h4>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Per Successful Referral</span>
                      <span className="font-medium">{formatCurrency(25)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Paid when your referral subscribes to any paid plan
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Bonus (5+ referrals)</span>
                      <span className="font-medium">{formatCurrency(100)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      One-time bonus for reaching 5 successful referrals
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">For Your Friend</h4>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Welcome Discount</span>
                      <span className="font-medium">{formatCurrency(10)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      $10 credit applied to their first month
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Extended Trial</span>
                      <span className="font-medium">30 days</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Extended trial period vs 14 days for regular signups
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Payment Schedule</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Rewards are processed monthly on the 1st</p>
                  <p>• Minimum payout threshold: $50</p>
                  <p>• Payments via Lightning Network or bank transfer</p>
                  <p>• Referrals must remain active for 30 days to qualify</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="program" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program Terms</CardTitle>
              <CardDescription>Everything you need to know about our referral program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    How It Works
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>1. Share your unique referral code</p>
                    <p>2. Friends sign up using your code</p>
                    <p>3. They get $10 off their first month</p>
                    <p>4. You earn $25 when they subscribe</p>
                    <p>5. Rewards are paid monthly</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Program Rules
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• No self-referrals allowed</p>
                    <p>• Referred users must be new to the platform</p>
                    <p>• Rewards paid for legitimate subscriptions only</p>
                    <p>• Program terms subject to change</p>
                    <p>• Fraudulent activity will result in account suspension</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Need Help?</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Terms
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 