"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Network, Users, Layers, Eye, EyeOff, ZoomIn, ZoomOut, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Slider } from "./ui/slider"
import { 
  Router, 
  Globe, 
  Search, 
  Bolt,
  RefreshCw,
  Play,
  Pause,
  Settings
} from "lucide-react"

// Types
interface Node {
  id: string
  alias: string
  capacity: number
  channels: number
  color: string
  coordinates: [number, number]
  isYourNode?: boolean
  country?: string
  region?: string
}

interface Channel {
  id: string
  sourceId: string
  targetId: string
  capacity: number
  active: boolean
  activity: number // 0-100 activity level
}

interface Transaction {
  id: string
  sourceId: string
  targetId: string
  amount: number
  speed: number // ms
  path: string[] // Node IDs in the path
  timestamp: Date
  complete: boolean
  type: 'payment' | 'routing'
}

interface LightningNetworkMonitorProps {
  className?: string
}

export function LightningNetworkMonitor({ className }: LightningNetworkMonitorProps) {
  const [view, setView] = useState<'map' | 'globe'>('map')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showChannels, setShowChannels] = useState(true)
  const networkRef = useRef<HTMLDivElement>(null)
  
  // Ensure component only renders dynamic content after mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Enhanced mock data with geographic distribution
  const nodes: Node[] = [
    { id: 'your-node', alias: 'Your Node', capacity: 5000000, channels: 12, color: '#f59e0b', coordinates: [45, 55], isYourNode: true, country: 'USA', region: 'North America' },
    { id: 'node-1', alias: 'ACINQ', capacity: 15000000, channels: 45, color: '#3b82f6', coordinates: [48, 46], country: 'France', region: 'Europe' },
    { id: 'node-2', alias: 'LN+', capacity: 8000000, channels: 28, color: '#10b981', coordinates: [52, 52], country: 'Germany', region: 'Europe' },
    { id: 'node-3', alias: 'Bitfinex', capacity: 12000000, channels: 36, color: '#8b5cf6', coordinates: [75, 35], country: 'Singapore', region: 'Asia' },
    { id: 'node-4', alias: 'LN Markets', capacity: 6000000, channels: 22, color: '#ec4899', coordinates: [49, 48], country: 'Switzerland', region: 'Europe' },
    { id: 'node-5', alias: 'Kraken', capacity: 9500000, channels: 32, color: '#f97316', coordinates: [37, 62], country: 'Canada', region: 'North America' },
    { id: 'node-6', alias: 'River', capacity: 7200000, channels: 26, color: '#06b6d4', coordinates: [42, 58], country: 'USA', region: 'North America' },
    { id: 'node-7', alias: 'Wallet of Satoshi', capacity: 8800000, channels: 30, color: '#84cc16', coordinates: [85, 75], country: 'Australia', region: 'Oceania' },
    { id: 'node-8', alias: 'Breez', capacity: 5500000, channels: 20, color: '#14b8a6', coordinates: [55, 32], country: 'Israel', region: 'Middle East' },
    { id: 'node-9', alias: 'Strike', capacity: 4200000, channels: 18, color: '#f472b6', coordinates: [40, 60], country: 'USA', region: 'North America' },
    { id: 'node-10', alias: 'Muun', capacity: 3800000, channels: 15, color: '#a78bfa', coordinates: [35, 25], country: 'Argentina', region: 'South America' }
  ];
  
  const channels: Channel[] = [
    { id: 'chan-1', sourceId: 'your-node', targetId: 'node-1', capacity: 2000000, active: true, activity: 85 },
    { id: 'chan-2', sourceId: 'your-node', targetId: 'node-2', capacity: 1500000, active: true, activity: 72 },
    { id: 'chan-3', sourceId: 'your-node', targetId: 'node-3', capacity: 1000000, active: true, activity: 91 },
    { id: 'chan-4', sourceId: 'your-node', targetId: 'node-5', capacity: 1200000, active: true, activity: 68 },
    { id: 'chan-5', sourceId: 'node-1', targetId: 'node-2', capacity: 3000000, active: true, activity: 94 },
    { id: 'chan-6', sourceId: 'node-1', targetId: 'node-7', capacity: 2500000, active: true, activity: 76 },
    { id: 'chan-7', sourceId: 'node-2', targetId: 'node-8', capacity: 2200000, active: true, activity: 83 },
    { id: 'chan-8', sourceId: 'node-3', targetId: 'node-6', capacity: 1800000, active: true, activity: 89 },
    { id: 'chan-9', sourceId: 'node-4', targetId: 'node-5', capacity: 2100000, active: true, activity: 77 },
    { id: 'chan-10', sourceId: 'node-5', targetId: 'node-6', capacity: 1600000, active: true, activity: 65 },
    { id: 'chan-11', sourceId: 'node-6', targetId: 'node-9', capacity: 1400000, active: true, activity: 71 },
    { id: 'chan-12', sourceId: 'node-7', targetId: 'node-10', capacity: 1900000, active: true, activity: 88 },
    { id: 'chan-13', sourceId: 'node-8', targetId: 'node-4', capacity: 1700000, active: true, activity: 79 }
  ];
  
  // Add new transaction to the network
  const addRandomTransaction = () => {
    if (!isPlaying || !isMounted) return; // Only run after client mounting
    
    // Select a random path through the network
    const sourceNodeIndex = Math.floor(Math.random() * nodes.length);
    const targetNodeIndex = Math.floor(Math.random() * nodes.length);
    
    if (sourceNodeIndex === targetNodeIndex) return;
    
    // Create intermediate nodes for the path (1-3 hops)
    const hopCount = Math.floor(Math.random() * 3) + 1;
    const path = [nodes[sourceNodeIndex].id];
    
    // Simple pathing logic
    let currentNodeId = nodes[sourceNodeIndex].id;
    for (let i = 0; i < hopCount && i < 2; i++) {
      const possibleChannels = channels.filter(c => 
        c.sourceId === currentNodeId && !path.includes(c.targetId)
      );
      
      if (possibleChannels.length === 0) break;
      
      const randomChannel = possibleChannels[Math.floor(Math.random() * possibleChannels.length)];
      currentNodeId = randomChannel.targetId;
      path.push(currentNodeId);
    }
    
    // Ensure path ends at target node if not already included
    if (path[path.length - 1] !== nodes[targetNodeIndex].id) {
      path.push(nodes[targetNodeIndex].id);
    }
    
    // Generate random transaction
    const amount = Math.floor(Math.random() * 500000) + 10000;
    const speed = Math.floor(Math.random() * 800) + 300;
    const type = Math.random() > 0.3 ? 'routing' : 'payment';
    
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random()}`,
      sourceId: nodes[sourceNodeIndex].id,
      targetId: nodes[targetNodeIndex].id,
      amount,
      speed,
      path,
      timestamp: new Date(),
      complete: false,
      type
    };
    
    setActiveTransactions(prev => [...prev, newTransaction]);
    
    // Simulate completion
    setTimeout(() => {
      setActiveTransactions(prev => 
        prev.map(tx => 
          tx.id === newTransaction.id ? { ...tx, complete: true } : tx
        )
      );
      
      // Remove transaction after animation
      setTimeout(() => {
        setActiveTransactions(prev => prev.filter(tx => tx.id !== newTransaction.id));
      }, 1500);
    }, speed);
  };
  
  // Generate random transactions periodically
  useEffect(() => {
    if (!isMounted) return; // Only run after client-side mounting
    
    setIsLoaded(true);
    
    if (!isPlaying) return;
    
    // Add initial transactions
    for (let i = 0; i < 2; i++) {
      setTimeout(() => addRandomTransaction(), i * 1200);
    }
    
    // Set up interval for new transactions
    const interval = setInterval(() => {
      if (isPlaying) {
        addRandomTransaction();
      }
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isPlaying, isMounted]); // Add isMounted to dependencies
  
  // Get node position based on coordinates and zoom level
  const getNodePosition = (coordinates: [number, number]) => {
    return {
      left: `${coordinates[0]}%`,
      top: `${coordinates[1]}%`,
    };
  };
  
  // Calculate path for transaction visualization
  const getTransactionPath = (transaction: Transaction) => {
    if (transaction.path.length < 2) return '';
    
    const pathPoints = transaction.path.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;
      return `${node.coordinates[0]},${node.coordinates[1]}`;
    }).filter(Boolean);
    
    return `M ${pathPoints.join(' L ')}`;
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3" onClick={addRandomTransaction}>
            <Bolt className="h-4 w-4 mr-1" />
            Send Payment
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3"
            onClick={() => setShowLabels(!showLabels)}
          >
            {showLabels ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            Labels
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Zoom:</span>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider 
            min={0.5} 
            max={2} 
            step={0.1} 
            value={[zoomLevel]} 
            onValueChange={([value]) => setZoomLevel(value)} 
            className="w-20" 
          />
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-950/20 to-purple-950/20 rounded-xl border border-gray-800 overflow-hidden" style={{ height: '400px' }}>
        {/* World Map Background */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            {/* Simplified world map paths */}
            <path d="M15,25 Q20,20 25,25 Q30,30 35,25 Q40,20 45,25" stroke="#4b5563" strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M50,20 Q55,15 60,20 Q65,25 70,20 Q75,15 80,20" stroke="#4b5563" strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M20,35 Q25,30 30,35 Q35,40 40,35" stroke="#4b5563" strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M75,35 Q80,30 85,35 Q90,40 95,35" stroke="#4b5563" strokeWidth="0.5" fill="none" opacity="0.3" />
          </svg>
        </div>

        {!isMounted && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Network className="h-12 w-12 text-gray-500 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400">Loading Lightning Network...</p>
            </div>
          </div>
        )}
        
        {isMounted && (
          <div 
            ref={networkRef}
            className="absolute inset-0 transform-gpu"
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'center',
              transition: 'transform 0.3s ease'
            }}
          >
            {/* Channels */}
            {showChannels && (
              <svg className="absolute inset-0 w-full h-full">
                {channels.map(channel => {
                  const sourceNode = nodes.find(n => n.id === channel.sourceId);
                  const targetNode = nodes.find(n => n.id === channel.targetId);
                  
                  if (!sourceNode || !targetNode) return null;
                  
                  const activityOpacity = channel.activity / 100;
                  
                  return (
                    <g key={channel.id}>
                      <line 
                        x1={`${sourceNode.coordinates[0]}%`}
                        y1={`${sourceNode.coordinates[1]}%`}
                        x2={`${targetNode.coordinates[0]}%`}
                        y2={`${targetNode.coordinates[1]}%`}
                        stroke={channel.active ? '#4b5563' : '#374151'}
                        strokeWidth="1"
                        strokeOpacity={activityOpacity * 0.6}
                      />
                      {/* Activity pulse */}
                      {channel.active && channel.activity > 70 && (
                        <line 
                          x1={`${sourceNode.coordinates[0]}%`}
                          y1={`${sourceNode.coordinates[1]}%`}
                          x2={`${targetNode.coordinates[0]}%`}
                          y2={`${targetNode.coordinates[1]}%`}
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeOpacity="0.4"
                          className="animate-pulse"
                        />
                      )}
                    </g>
                  );
                })}
                
                {/* Active transaction paths */}
                {activeTransactions.map(transaction => {
                  const path = getTransactionPath(transaction);
                  
                  return (
                    <g key={transaction.id}>
                      <path 
                        d={path}
                        fill="none"
                        stroke={transaction.type === 'payment' ? '#f59e0b' : '#10b981'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        className={transaction.complete ? 'animate-pulse' : ''}
                        style={{
                          filter: 'drop-shadow(0 0 4px currentColor)',
                          strokeDasharray: transaction.complete ? 'none' : '5,5',
                          animation: transaction.complete 
                            ? 'none' 
                            : `dash ${transaction.speed}ms linear infinite`
                        }}
                      />
                    </g>
                  );
                })}
              </svg>
            )}
            
            {/* Nodes */}
            {nodes.map(node => (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.6, delay: 0.1 }}
                className={`absolute cursor-pointer group`}
                style={{
                  ...getNodePosition(node.coordinates),
                  transform: 'translate(-50%, -50%)',
                  zIndex: node.isYourNode ? 30 : 20
                }}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
              >
                {/* Node glow effect */}
                <div 
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    backgroundColor: node.color,
                    opacity: 0.2,
                    width: node.isYourNode ? '80px' : '60px',
                    height: node.isYourNode ? '80px' : '60px',
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(8px)'
                  }}
                />
                
                {/* Main node */}
                <div
                  className={`relative rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110
                    ${node.isYourNode ? 'border-4 border-yellow-400' : 'border-2 border-gray-600'}
                    ${selectedNode === node.id ? 'ring-2 ring-white' : ''}
                  `}
                  style={{
                    backgroundColor: node.color,
                    width: node.isYourNode ? '48px' : `${Math.min(36, Math.max(24, node.capacity / 500000))}px`,
                    height: node.isYourNode ? '48px' : `${Math.min(36, Math.max(24, node.capacity / 500000))}px`,
                    boxShadow: `0 0 20px ${node.color}40`
                  }}
                >
                  {node.isYourNode && (
                    <Zap className="h-6 w-6 text-white drop-shadow-lg" />
                  )}
                  {!node.isYourNode && (
                    <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                  )}
                </div>
                
                {/* Node label */}
                {showLabels && (
                  <div
                    className="absolute whitespace-nowrap text-xs font-medium bg-gray-900/90 px-2 py-1 rounded-md backdrop-blur-sm border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '8px',
                      color: node.color,
                      zIndex: 40
                    }}
                  >
                    {node.alias}
                    <div className="text-xs text-gray-400">{node.country}</div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Node info popup when selected */}
            {selectedNode && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="absolute bg-gray-900/95 backdrop-blur-md p-4 rounded-xl shadow-2xl z-50 border border-gray-700"
                  style={{
                    top: '20px',
                    right: '20px',
                    width: '280px'
                  }}
                >
                  {(() => {
                    const node = nodes.find(n => n.id === selectedNode);
                    if (!node) return null;
                    
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-600" 
                            style={{ backgroundColor: node.color }}
                          />
                          <div>
                            <h3 className="font-bold text-white">{node.alias}</h3>
                            <p className="text-xs text-gray-400">{node.country} • {node.region}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Capacity:</span>
                            <span className="text-white font-medium">{(node.capacity / 1000000).toFixed(1)}M sats</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Channels:</span>
                            <span className="text-white font-medium">{node.channels}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Connected:</span>
                            <span className="text-white font-medium">{channels.filter(c => 
                              c.sourceId === node.id || c.targetId === node.id
                            ).length} peers</span>
                          </div>
                          {node.isYourNode && (
                            <div className="mt-3 p-2 bg-yellow-950/30 border border-yellow-800/30 rounded-lg">
                              <p className="text-xs text-yellow-200">This is your Lightning Node</p>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {/* Live Activity Feed */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-300 flex items-center">
            <Bolt className="h-4 w-4 text-yellow-500 mr-2" />
            Live Network Activity
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            {activeTransactions.length} active
          </div>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {activeTransactions.length === 0 ? (
            <div className="text-sm text-gray-500 italic text-center py-2">
              {isPlaying ? 'Waiting for transactions...' : 'Paused - Click play to resume'}
            </div>
          ) : (
            activeTransactions.slice(-3).map(tx => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between text-sm bg-gray-800/50 p-2 rounded-md border border-gray-700/50"
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    tx.complete ? 'bg-green-900/30' : 'bg-yellow-900/30'
                  }`}>
                    {tx.complete ? (
                      <Zap className="h-3 w-3 text-green-400" />
                    ) : (
                      <Bolt className="h-3 w-3 text-yellow-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {tx.amount.toLocaleString()} sats
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-300">
                        {tx.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {tx.path.length - 1} hop{tx.path.length - 1 !== 1 ? 's' : ''} • {tx.speed}ms
                    </div>
                  </div>
                </div>
                <div className={`text-xs font-medium ${tx.complete ? 'text-green-400' : 'text-yellow-400'}`}>
                  {tx.complete ? '✓' : '⚡'}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: 20;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
} 