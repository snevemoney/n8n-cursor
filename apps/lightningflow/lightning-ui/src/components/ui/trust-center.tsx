'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download, 
  Eye, 
  Key,
  Lock,
  Verified,
  FileText,
  History
} from 'lucide-react';
import { getProofs, getProofStats, exportProofs } from '../../core/crypto/proofLog';
import { getExecutionHistory } from '../../core/crypto/signAndExecute';

/**
 * Trust Center Component for Lightning AI Business Node Platform
 * 
 * Displays:
 * - Cryptographic verification status
 * - Signed action history
 * - Trust indicators
 * - Proof export capabilities
 */

interface TrustCenterProps {
  userId?: string;
  className?: string;
}

interface ProofStats {
  totalProofs: number;
  verifiedProofs: number;
  actionBreakdown: Record<string, number>;
  recentActivity: any[];
}

export function TrustCenter({ userId, className }: TrustCenterProps) {
  const [stats, setStats] = useState<ProofStats | null>(null);
  const [recentProofs, setRecentProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    loadTrustData();
  }, [userId]);

  const loadTrustData = async () => {
    try {
      setLoading(true);
      
      // Load proof statistics - fix function call
      const stats = await getProofStats();
      setStats({
        totalProofs: stats.total,
        verifiedProofs: stats.verified,
        actionBreakdown: stats.byAction,
        recentActivity: []
      });

      // Load recent proofs
      const proofsResult = await getProofs({ userId, limit: 20 });
      if (proofsResult.success && proofsResult.proofs) {
        setRecentProofs(proofsResult.proofs);
      }
    } catch (error) {
      console.error('Error loading trust data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrustLevel = (): { level: string; color: string; icon: React.ReactNode } => {
    if (!stats) return { level: 'Unknown', color: 'gray', icon: <AlertTriangle className="w-4 h-4" /> };
    
    const verificationRate = stats.totalProofs > 0 ? stats.verifiedProofs / stats.totalProofs : 0;
    
    if (verificationRate >= 0.95) {
      return { 
        level: 'High Trust', 
        color: 'green', 
        icon: <Shield className="w-4 h-4 text-green-600" /> 
      };
    } else if (verificationRate >= 0.8) {
      return { 
        level: 'Medium Trust', 
        color: 'yellow', 
        icon: <CheckCircle className="w-4 h-4 text-yellow-600" /> 
      };
    } else {
      return { 
        level: 'Low Trust', 
        color: 'red', 
        icon: <AlertTriangle className="w-4 h-4 text-red-600" /> 
      };
    }
  };

  const exportTrustData = async (format: 'json' | 'csv') => {
    try {
      const data = await exportProofs(format);
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trust-proofs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting trust data:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'send_payment':
      case 'receive_payment':
        return <Key className="w-4 h-4" />;
      case 'agent_execution':
        return <Verified className="w-4 h-4" />;
      case 'vault_transfer':
        return <Lock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const trustLevel = getTrustLevel();

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trust Level Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {trustLevel.icon}
            Trust Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Trust Level */}
            <div className="text-center">
              <div className="mb-2">
                <Badge variant={trustLevel.color as any} className="text-lg px-4 py-2">
                  {trustLevel.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Overall Security Rating
              </p>
            </div>

            {/* Verification Stats */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats ? Math.round((stats.verifiedProofs / stats.totalProofs) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-600">
                Actions Verified
              </p>
            </div>

            {/* Total Actions */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalProofs || 0}
              </div>
              <p className="text-sm text-gray-600">
                Total Signed Actions
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>All actions are cryptographically signed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Signatures verified using industry-standard encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Immutable audit trail maintained</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Action Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.actionBreakdown).map(([action, count]) => (
                <div key={action} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {getActionIcon(action)}
                  </div>
                  <div className="font-semibold">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">
                    {action.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Signed Actions
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportTrustData('json')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportTrustData('csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProofs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No signed actions found
              </p>
            ) : (
              recentProofs.map((proof) => (
                <div
                  key={proof.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedProof(proof)}
                >
                  <div className="flex items-center gap-3">
                    {getActionIcon(proof.action)}
                    <div>
                      <div className="font-medium">{proof.human_summary}</div>
                      <div className="text-sm text-gray-600">
                        {formatTimestamp(proof.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {proof.verified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proof Details Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cryptographic Proof Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProof(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Action</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {selectedProof.action}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Human Summary</label>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {selectedProof.human_summary}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Cryptographic Hash</label>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                  {selectedProof.hash}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Signature</label>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                  {selectedProof.signature.slice(0, 64)}...
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Timestamp</label>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {formatTimestamp(selectedProof.timestamp)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Verification Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {selectedProof.verified ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Cryptographically Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-medium">Verification Failed</span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  This proof demonstrates that the action was cryptographically signed and cannot be altered without detection.
                  The signature can be independently verified using the public key and hash.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Cryptographic Standards</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• RSA-SHA256 digital signatures</li>
                <li>• 256-bit cryptographic hashes</li>
                <li>• Timestamp-based replay protection</li>
                <li>• Immutable audit trail storage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Trust Guarantees</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All high-risk actions are signed</li>
                <li>• Signatures cannot be forged</li>
                <li>• Actions cannot be altered post-execution</li>
                <li>• Complete audit trail maintained</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What This Means for You</h4>
            <p className="text-sm text-blue-800">
              Every important action in your Lightning AI Business Node is cryptographically signed and verified. 
              This ensures that all transactions, agent executions, and system changes are authentic, 
              tamper-proof, and can be independently audited. You have complete transparency and control 
              over your sovereign financial operations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 