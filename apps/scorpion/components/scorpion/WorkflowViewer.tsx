'use client';

/**
 * Workflow Viewer Component
 * Visual display of n8n workflow nodes and connections using ReactFlow canvas
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Play, Pause, Code, Zap, CheckCircle2, XCircle, Clock, ArrowDown, ArrowUp, ChevronRight } from 'lucide-react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position?: [number, number];
  parameters?: any;
}

interface WorkflowViewerProps {
  workflow: {
    id: string;
    name: string;
    nodes: any;
    connections?: any;
    active: boolean;
    n8nId?: string;
  };
  onClose: () => void;
}

// Node type colors (similar to n8n)
const getNodeColor = (type: string) => {
  if (type?.includes('Trigger')) return '#ff6d5a';
  if (type?.includes('Webhook')) return '#ff6d5a';
  if (type?.includes('HTTP')) return '#1f77b4';
  if (type?.includes('Function') || type?.includes('Code')) return '#2ca02c';
  if (type?.includes('Set') || type?.includes('Transform')) return '#9467bd';
  return '#8c564b';
};

interface NodeExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime?: number;
  endTime?: number;
  error?: string;
}

export function WorkflowViewer({ workflow, onClose }: WorkflowViewerProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [detailedNode, setDetailedNode] = useState<WorkflowNode | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [fullWorkflow, setFullWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [executionStates, setExecutionStates] = useState<Record<string, NodeExecutionState>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting and body overflow
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Fetch full workflow details from n8n when component mounts
  useEffect(() => {
    const fetchWorkflowDetails = async () => {
      // If workflow already has nodes array with data, use it
      if (Array.isArray(workflow.nodes) && workflow.nodes.length > 0) {
        setFullWorkflow(workflow);
        return;
      }

      // If nodes is just a number (count) or not an array, fetch full details from n8n
      const workflowId = workflow.n8nId || workflow.id;
      if (workflowId) {
        setLoading(true);
        try {
          console.log('🔄 Fetching workflow details for:', workflowId);
          const response = await fetch(`/api/workflows/${workflowId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Workflow fetch response:', { 
              success: data.success, 
              hasWorkflow: !!data.data?.workflow,
              nodesCount: data.data?.workflow?.nodes?.length || 0 
            });
            if (data.success && data.data?.workflow) {
              setFullWorkflow(data.data.workflow);
            } else {
              console.warn('⚠️ Workflow fetch returned no data, using original workflow');
              setFullWorkflow(workflow);
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Workflow fetch failed:', response.status, errorText);
            setFullWorkflow(workflow);
          }
        } catch (error) {
          console.error('❌ Error fetching workflow details:', error);
          setFullWorkflow(workflow);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn('⚠️ No workflow ID available, using original workflow');
        setFullWorkflow(workflow);
      }
    };

    fetchWorkflowDetails();
  }, [workflow]);

  // Use fullWorkflow if available, otherwise use original workflow
  const displayWorkflow = fullWorkflow || workflow;

  // Load execution states if workflow has n8nId
  useEffect(() => {
    if (displayWorkflow.n8nId || displayWorkflow.id) {
      loadExecutionStates();
    }
  }, [displayWorkflow]);

  const loadExecutionStates = async () => {
    try {
      const workflowId = displayWorkflow.n8nId || displayWorkflow.id;
      const response = await fetch(`/api/workflows/${workflowId}/executions`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Convert execution data to node states
          const states: Record<string, NodeExecutionState> = {};
          result.data.nodes?.forEach((nodeExec: any) => {
            states[nodeExec.nodeId] = {
              nodeId: nodeExec.nodeId,
              status: nodeExec.status,
              startTime: nodeExec.startTime,
              endTime: nodeExec.endTime,
              error: nodeExec.error,
            };
          });
          setExecutionStates(states);
        }
      }
    } catch (error) {
      console.error('Failed to load execution states:', error);
    }
  };

  const simulateWorkflow = async () => {
    if (!displayWorkflow.n8nId && !displayWorkflow.id) return;
    
    setIsSimulating(true);
    setExecutionStates({});
    
    // Simulate execution by updating node states sequentially
    const nodes = Array.isArray(displayWorkflow.nodes) ? displayWorkflow.nodes : [];
    const nodeIds = nodes.map((n: any) => n.id || n.name);
    
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      // Set node to running
      setExecutionStates(prev => ({
        ...prev,
        [nodeId]: {
          nodeId,
          status: 'running',
          startTime: Date.now(),
        },
      }));
      
      // Immediate state update without artificial delay
      // Set node to success (or failed randomly)
      const success = Math.random() > 0.1; // 90% success rate
      setExecutionStates(prev => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          status: success ? 'success' : 'failed',
          endTime: Date.now(),
          error: success ? undefined : 'Simulated error',
        },
      }));
      
      // Use requestAnimationFrame for smooth updates without blocking
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    setIsSimulating(false);
  };

  // Convert n8n workflow to ReactFlow format
  const { reactFlowNodes, reactFlowEdges } = useMemo(() => {
    if (!Array.isArray(displayWorkflow.nodes) || displayWorkflow.nodes.length === 0) {
      return { reactFlowNodes: [], reactFlowEdges: [] };
    }

    const connections = displayWorkflow.connections || {};

    // Convert n8n nodes to ReactFlow nodes
    const nodes: Node[] = displayWorkflow.nodes.map((node: any) => {
      const nodeId = node.id || node.name;
      const nodeName = node.name || nodeId || 'Unnamed Node';
      const nodeType = node.type || 'unknown';
      const position = node.position 
        ? { x: node.position[0] || 0, y: node.position[1] || 0 }
        : { x: 0, y: 0 };

      // Check if this is an AI Agent node
      const isAIAgent = nodeType.includes('langchain.agent') || nodeType.includes('AI Agent');
      
      // Check if this is an AI sub-component (Chat Model, Memory, Tool, etc.)
      // These are nodes that connect to AI Agents via ai_* connection types
      const isAISubComponent = 
        nodeType.includes('langchain.lmChat') || 
        nodeType.includes('langchain.memory') ||
        nodeType.includes('langchain.agentTool') ||
        nodeType.includes('langchain.tool') ||
        nodeName.toLowerCase().includes('chat model') ||
        nodeName.toLowerCase().includes('memory') ||
        // Check if this node is connected via AI connection types
        (connections[nodeName] && Object.keys(connections[nodeName]).some(key => 
          key.startsWith('ai_') && key !== 'ai_languageModel'
        )) ||
        // Check if any node connects TO this node via AI connection types
        Object.values(connections).some((nodeConns: any) => 
          nodeConns && typeof nodeConns === 'object' &&
          Object.keys(nodeConns).some(key => 
            key.startsWith('ai_') && 
            Array.isArray(nodeConns[key]) &&
            nodeConns[key].some((group: any) => 
              Array.isArray(group) && 
              group.some((conn: any) => conn?.node === nodeName)
            )
          )
        );
      
      // Get execution state for this node
      const execState = executionStates[nodeId];
      const nodeStatus = execState?.status || 'pending';
      
      // Build node label with execution status
      const nodeLabel = (
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold text-sm text-white">{nodeName}</div>
            {execState && (
              <div className={`flex items-center gap-1 ${
                nodeStatus === 'success' ? 'text-emerald-400' :
                nodeStatus === 'failed' ? 'text-red-400' :
                nodeStatus === 'running' ? 'text-yellow-400' :
                'text-white/40'
              }`}>
                {nodeStatus === 'success' && <CheckCircle2 className="w-3 h-3" />}
                {nodeStatus === 'failed' && <XCircle className="w-3 h-3" />}
                {nodeStatus === 'running' && <Clock className="w-3 h-3 animate-spin" />}
                {nodeStatus === 'pending' && <Clock className="w-3 h-3" />}
              </div>
            )}
          </div>
          <div className="text-xs text-white/60 mt-0.5">
            {nodeType.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', '')}
          </div>
          {isAIAgent && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="text-xs text-white/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span>Chat Model • Memory • Tools</span>
              </div>
            </div>
          )}
          {execState && execState.error && (
            <div className="mt-2 pt-2 border-t border-red-500/30">
              <div className="text-xs text-red-400">{execState.error}</div>
            </div>
          )}
        </div>
      );

      // Determine node shape: rounded/oval for AI sub-components, square for regular nodes
      const borderRadius = isAISubComponent ? '50px' : '8px';
      
      return {
        id: nodeId,
        type: 'default',
        position,
        data: {
          label: nodeLabel,
          nodeType,
          nodeName,
          parameters: node.parameters || {},
          originalNode: node,
          isAISubComponent,
        },
        style: {
          background: execState 
            ? (nodeStatus === 'success' ? '#10b981' :
               nodeStatus === 'failed' ? '#ef4444' :
               nodeStatus === 'running' ? '#f59e0b' :
               getNodeColor(nodeType))
            : getNodeColor(nodeType),
          color: '#fff',
          border: selectedNode?.id === nodeId 
            ? '2px solid #3b82f6' 
            : execState && nodeStatus === 'running'
            ? '2px solid #f59e0b'
            : '1px solid rgba(255,255,255,0.2)',
          borderRadius,
          minWidth: 150,
          fontSize: 12,
          opacity: execState && nodeStatus === 'pending' ? 0.6 : 1,
        },
        // Main flow connections from sides (for regular nodes)
        // AI sub-components will connect from top/bottom
        sourcePosition: isAISubComponent ? 'bottom' : 'right',
        targetPosition: isAISubComponent ? 'top' : 'left',
      };
    });

    // Convert n8n connections to ReactFlow edges
    // n8n format: { [nodeName]: { [connectionType]: [[{ node: targetNodeName, type: connectionType, index: 0 }]] } }
    const edges: Edge[] = [];
    
    // Create a map of node names to node IDs for connection lookup
    const nodeNameToId = new Map<string, string>();
    displayWorkflow.nodes.forEach((node: any) => {
      const nodeId = node.id || node.name;
      const nodeName = node.name || nodeId;
      nodeNameToId.set(nodeName, nodeId);
    });

    Object.entries(connections).forEach(([sourceNodeName, nodeConnections]: [string, any]) => {
      if (!nodeConnections || typeof nodeConnections !== 'object') return;
      
      const sourceNodeId = nodeNameToId.get(sourceNodeName) || sourceNodeName;

      // Handle all connection types (main, ai_languageModel, ai_memory, ai_tool, etc.)
      Object.entries(nodeConnections).forEach(([connectionType, connectionGroups]: [string, any]) => {
        if (!Array.isArray(connectionGroups)) return;

        // n8n connections are nested arrays: [[{ node: targetName, type: type, index: 0 }]]
        connectionGroups.forEach((connectionGroup: any, groupIndex: number) => {
          if (!Array.isArray(connectionGroup)) return;

          connectionGroup.forEach((conn: any, connIndex: number) => {
            if (!conn || !conn.node) return;

            const targetNodeName = conn.node;
            const targetNodeId = nodeNameToId.get(targetNodeName) || targetNodeName;
            
            // Determine edge style and position based on connection type
            let edgeStyle = { stroke: '#6366f1', strokeWidth: 2 };
            let isDashed = false;
            let sourcePosition: 'right' | 'bottom' = 'right';
            let targetPosition: 'left' | 'top' = 'left';
            let connectionLabel = '';
            
            if (connectionType === 'main') {
              // Main workflow flow - solid blue from sides
              edgeStyle = { stroke: '#6366f1', strokeWidth: 2 };
              sourcePosition = 'right';
              targetPosition = 'left';
            } else if (connectionType === 'ai_languageModel') {
              // Chat Model connection - dashed purple from bottom
              edgeStyle = { stroke: '#a855f7', strokeWidth: 2.5 };
              isDashed = true;
              sourcePosition = 'bottom';
              targetPosition = 'top';
              connectionLabel = 'Chat Model';
            } else if (connectionType === 'ai_memory') {
              // Memory connection - dashed orange from bottom
              edgeStyle = { stroke: '#f59e0b', strokeWidth: 2.5 };
              isDashed = true;
              sourcePosition = 'bottom';
              targetPosition = 'top';
              connectionLabel = 'Memory';
            } else if (connectionType === 'ai_tool') {
              // Tool connection - dashed green from bottom
              edgeStyle = { stroke: '#10b981', strokeWidth: 2.5 };
              isDashed = true;
              sourcePosition = 'bottom';
              targetPosition = 'top';
              connectionLabel = 'Tool';
            } else if (connectionType.startsWith('ai_')) {
              // Other AI connections - dashed cyan from bottom
              edgeStyle = { stroke: '#06b6d4', strokeWidth: 2.5 };
              isDashed = true;
              sourcePosition = 'bottom';
              targetPosition = 'top';
              connectionLabel = connectionType.replace('ai_', '');
            }

            // Get source and target nodes to determine their shapes
            const sourceNode = nodes.find(n => n.id === sourceNodeId);
            const targetNode = nodes.find(n => n.id === targetNodeId);
            const sourceIsAISub = sourceNode?.data?.isAISubComponent;
            const targetIsAISub = targetNode?.data?.isAISubComponent;
            
            // Create edge with appropriate routing
            // For AI connections, route from bottom of source to top of target (top-to-bottom flow)
            const edge: Edge = {
              id: `e${sourceNodeId}-${targetNodeId}-${connectionType}-${groupIndex}-${connIndex}`,
              source: sourceNodeId,
              target: targetNodeId,
              sourceHandle: connectionType === 'main' ? 'main' : `ai-${connectionType}`,
              targetHandle: conn.type || (connectionType === 'main' ? 'main' : `ai-${connectionType}`),
              animated: connectionType === 'main', // Only animate main flow
              // Use smoothstep for AI connections to route bottom-to-top
              // Use default (straight) for main flow left-to-right
              type: connectionType === 'main' ? 'default' : 'smoothstep',
              style: {
                ...edgeStyle,
                strokeDasharray: isDashed ? '8,4' : undefined, // More pronounced dashes for AI connections
              },
              label: connectionLabel,
              labelStyle: {
                fill: edgeStyle.stroke,
                fontWeight: 600,
                fontSize: 10,
              },
              labelBgStyle: {
                fill: '#0a0a0a',
                fillOpacity: 0.8,
              },
            };

            // For AI connections, ensure they route from bottom to top
            if (isDashed) {
              edge.type = 'smoothstep';
              // Force bottom-to-top routing by updating source/target positions if needed
              if (sourceNode) {
                sourceNode.sourcePosition = Position.Bottom;
              }
              if (targetNode) {
                targetNode.targetPosition = Position.Top;
              }
            }

            edges.push(edge);
          });
        });
      });
    });

    // Remove duplicate edges
    const uniqueEdges = edges.filter((edge, index, self) =>
      index === self.findIndex((e) => e.id === edge.id)
    );

    return { reactFlowNodes: nodes, reactFlowEdges: uniqueEdges };
  }, [displayWorkflow, selectedNode, executionStates]);

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Update nodes and edges when workflow data changes
  useEffect(() => {
    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, [reactFlowNodes, reactFlowEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const originalNode = node.data.originalNode;
    setSelectedNode({
      id: node.id,
      name: node.data.nodeName,
      type: node.data.nodeType,
      position: [node.position.x, node.position.y],
      parameters: node.data.parameters,
    });
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    const originalNode = node.data.originalNode;
    setDetailedNode({
      id: node.id,
      name: node.data.nodeName,
      type: node.data.nodeType,
      position: [node.position.x, node.position.y],
      parameters: node.data.parameters,
    });
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Get input/output information for a node
  const getNodeInputOutput = useCallback((nodeId: string, nodeName: string) => {
    if (!displayWorkflow.connections) return { inputs: [], outputs: [] };

    const connections = displayWorkflow.connections;
    const inputs: Array<{ node: string; connectionType: string }> = [];
    const outputs: Array<{ node: string; connectionType: string }> = [];

    // Find nodes that connect TO this node (inputs)
    Object.entries(connections).forEach(([sourceNodeName, nodeConnections]: [string, any]) => {
      if (!nodeConnections || typeof nodeConnections !== 'object') return;
      
      Object.entries(nodeConnections).forEach(([connectionType, connectionGroups]: [string, any]) => {
        if (!Array.isArray(connectionGroups)) return;
        
        connectionGroups.forEach((connectionGroup: any) => {
          if (!Array.isArray(connectionGroup)) return;
          
          connectionGroup.forEach((conn: any) => {
            if (conn?.node === nodeName) {
              inputs.push({ node: sourceNodeName, connectionType });
            }
          });
        });
      });
    });

    // Find nodes that this node connects TO (outputs)
    const nodeConnections = connections[nodeName];
    if (nodeConnections && typeof nodeConnections === 'object') {
      Object.entries(nodeConnections).forEach(([connectionType, connectionGroups]: [string, any]) => {
        if (!Array.isArray(connectionGroups)) return;
        
        connectionGroups.forEach((connectionGroup: any) => {
          if (!Array.isArray(connectionGroup)) return;
          
          connectionGroup.forEach((conn: any) => {
            if (conn?.node) {
              outputs.push({ node: conn.node, connectionType });
            }
          });
        });
      });
    }

    return { inputs, outputs };
  }, [displayWorkflow]);

  const n8nUrl = displayWorkflow.n8nId || workflow.n8nId
    ? `https://n8ncloud.tech/workflow/${displayWorkflow.n8nId || workflow.n8nId}`
    : null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{ 
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'auto'
      }}
    >
      <div 
        className="bg-[#0a0a0a] border border-white/10 rounded-lg w-full max-w-6xl h-[80vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          zIndex: 1000000,
          pointerEvents: 'auto',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{displayWorkflow.name || workflow.name}</h2>
            {loading && (
              <span className="text-xs text-white/40">Loading from n8n...</span>
            )}
            {displayWorkflow.active !== undefined ? displayWorkflow.active : workflow.active ? (
              <span className="flex items-center gap-1.5 text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                <Play className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs px-2 py-1 bg-white/5 text-white/40 rounded border border-white/10">
                <Pause className="w-3 h-3" />
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSimulationMode(!simulationMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                simulationMode
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
              title="Toggle simulation mode"
            >
              <Zap className="w-4 h-4" />
              Simulation
            </button>
            {simulationMode && (
              <button
                onClick={simulateWorkflow}
                disabled={isSimulating}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-sm disabled:opacity-50"
                title="Run simulation"
              >
                <Play className="w-4 h-4" />
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </button>
            )}
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="p-2 hover:bg-white/5 rounded transition-colors"
              title="Toggle raw JSON"
            >
              <Code className="w-4 h-4" />
            </button>
            {n8nUrl && (
              <a
                href={n8nUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors text-sm"
              >
                Open in n8n
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Workflow Canvas */}
          <div className="flex-1 relative">
            {showRaw ? (
              <div className="absolute inset-0 overflow-auto p-6">
                <pre className="text-xs text-white/60 font-mono bg-black/40 p-4 rounded border border-white/10">
                  {JSON.stringify({ nodes: reactFlowNodes, edges: reactFlowEdges, connections: displayWorkflow.connections || workflow.connections }, null, 2)}
                </pre>
              </div>
            ) : loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/40">
                <div className="text-center">
                  <div className="text-sm mb-2">Loading workflow from n8n...</div>
                  <div className="text-xs">Fetching most recent update</div>
                </div>
              </div>
            ) : reactFlowNodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/40">
                <div className="text-center">
                  <Code className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No nodes found in this workflow</p>
                </div>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onPaneClick={onPaneClick}
                fitView
                className="bg-[#0a0a0a]"
                nodeTypes={{}}
              >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#333" />
                <Controls className="bg-[#1a1a1a] border border-white/10 rounded" />
                <MiniMap
                  className="bg-[#1a1a1a] border border-white/10 rounded"
                  nodeColor={(node) => getNodeColor(node.data?.nodeType || '')}
                  maskColor="rgba(0, 0, 0, 0.6)"
                />
                <Panel position="top-left" className="text-xs text-white/60 bg-[#1a1a1a]/80 px-3 py-1.5 rounded border border-white/10">
                  {reactFlowNodes.length} nodes • {reactFlowEdges.length} connections • {simulationMode ? 'Simulation Mode' : 'Read-only'}
                </Panel>
                {simulationMode && Object.keys(executionStates).length > 0 && (
                  <Panel position="top-right" className="text-xs text-white/60 bg-[#1a1a1a]/80 px-3 py-1.5 rounded border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span>Running: {Object.values(executionStates).filter(s => s.status === 'running').length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span>Success: {Object.values(executionStates).filter(s => s.status === 'success').length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span>Failed: {Object.values(executionStates).filter(s => s.status === 'failed').length}</span>
                      </div>
                    </div>
                  </Panel>
                )}
              </ReactFlow>
            )}
          </div>

          {/* Node Details Panel */}
          {selectedNode && !showRaw && (
            <div className="w-96 border-l border-white/10 overflow-auto">
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs text-white/40 mb-1">NODE</div>
                  <div className="font-semibold">{selectedNode.name}</div>
                </div>

                <div>
                  <div className="text-xs text-white/40 mb-1">TYPE</div>
                  <div className="text-sm text-white/60">{selectedNode.type}</div>
                </div>

                {Object.keys(selectedNode.parameters || {}).length > 0 && (
                  <div>
                    <div className="text-xs text-white/40 mb-2">PARAMETERS</div>
                    <div className="space-y-2">
                      {Object.entries(selectedNode.parameters).map(([key, value]) => (
                        <div key={key} className="bg-black/40 p-2 rounded border border-white/5">
                          <div className="text-xs text-white/40 mb-1">{key}</div>
                          <div className="text-sm text-white/80 font-mono break-all">
                            {typeof value === 'object' 
                              ? JSON.stringify(value, null, 2)
                              : String(value)
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(selectedNode.parameters || {}).length === 0 && (
                  <div className="text-sm text-white/40">
                    No parameters configured
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-xs text-white/40">
          💡 This is a read-only visualization. Edit in n8n to make changes. Double-click a node to see detailed parameters, inputs, and outputs.
        </div>
      </div>

      {/* Detailed Node Modal */}
      {detailedNode && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDetailedNode(null);
            }
          }}
          style={{ 
            zIndex: 1000001,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'auto'
          }}
        >
          <div 
            className="bg-[#0a0a0a] border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              zIndex: 1000002,
              pointerEvents: 'auto',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{detailedNode.name}</h3>
                <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded">
                  {detailedNode.type.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', '')}
                </span>
              </div>
              <button
                onClick={() => setDetailedNode(null)}
                className="p-2 hover:bg-white/5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Parameters Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-4 h-4 text-white/60" />
                  <h4 className="text-sm font-semibold text-white/90">Parameters</h4>
                </div>
                {Object.keys(detailedNode.parameters || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(detailedNode.parameters).map(([key, value]) => (
                      <div key={key} className="bg-black/40 p-3 rounded border border-white/10">
                        <div className="text-xs text-white/50 mb-2 font-medium">{key}</div>
                        <div className="text-sm text-white/80 font-mono break-all whitespace-pre-wrap">
                          {typeof value === 'object' && value !== null
                            ? JSON.stringify(value, null, 2)
                            : String(value)
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/40 bg-black/40 p-3 rounded border border-white/10">
                    No parameters configured
                  </div>
                )}
              </div>

              {/* Inputs Section */}
              {(() => {
                const { inputs } = getNodeInputOutput(detailedNode.id, detailedNode.name);
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowDown className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-white/90">Inputs</h4>
                      <span className="text-xs text-white/40">({inputs.length})</span>
                    </div>
                    {inputs.length > 0 ? (
                      <div className="space-y-2">
                        {inputs.map((input, idx) => (
                          <div key={idx} className="bg-blue-500/10 border border-blue-500/20 p-3 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <ChevronRight className="w-3 h-3 text-blue-400" />
                              <span className="text-sm font-medium text-blue-300">{input.node}</span>
                              <span className="text-xs text-white/40 px-1.5 py-0.5 bg-blue-500/20 rounded">
                                {input.connectionType === 'main' ? 'main' : input.connectionType.replace('ai_', '')}
                              </span>
                            </div>
                            <div className="text-xs text-white/50 ml-5">
                              Connection type: <span className="font-mono">{input.connectionType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-white/40 bg-black/40 p-3 rounded border border-white/10">
                        No inputs (this is likely a trigger node)
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Outputs Section */}
              {(() => {
                const { outputs } = getNodeInputOutput(detailedNode.id, detailedNode.name);
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUp className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-semibold text-white/90">Outputs</h4>
                      <span className="text-xs text-white/40">({outputs.length})</span>
                    </div>
                    {outputs.length > 0 ? (
                      <div className="space-y-2">
                        {outputs.map((output, idx) => (
                          <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <ChevronRight className="w-3 h-3 text-emerald-400" />
                              <span className="text-sm font-medium text-emerald-300">{output.node}</span>
                              <span className="text-xs text-white/40 px-1.5 py-0.5 bg-emerald-500/20 rounded">
                                {output.connectionType === 'main' ? 'main' : output.connectionType.replace('ai_', '')}
                              </span>
                            </div>
                            <div className="text-xs text-white/50 ml-5">
                              Connection type: <span className="font-mono">{output.connectionType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-white/40 bg-black/40 p-3 rounded border border-white/10">
                        No outputs (this node doesn't connect to other nodes)
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Node Metadata */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-4 h-4 text-white/60" />
                  <h4 className="text-sm font-semibold text-white/90">Node Information</h4>
                </div>
                <div className="bg-black/40 p-3 rounded border border-white/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-white/50">Node ID:</span>
                    <span className="text-xs text-white/80 font-mono">{detailedNode.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-white/50">Type:</span>
                    <span className="text-xs text-white/80 font-mono">{detailedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-white/50">Position:</span>
                    <span className="text-xs text-white/80 font-mono">
                      ({detailedNode.position?.[0] || 0}, {detailedNode.position?.[1] || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-xs text-white/40">
              💡 Double-click any node to view its details. This view shows parameters, inputs, and outputs.
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render via portal to escape parent stacking context
  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}

