'use client';

/**
 * Workflow Viewer Component
 * Visual display of n8n workflow nodes and connections using ReactFlow canvas
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ExternalLink, Play, Pause, Code } from 'lucide-react';
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

export function WorkflowViewer({ workflow, onClose }: WorkflowViewerProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [fullWorkflow, setFullWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch full workflow details from n8n when component mounts
  useEffect(() => {
    const fetchWorkflowDetails = async () => {
      // If workflow already has nodes array with data, use it
      if (Array.isArray(workflow.nodes) && workflow.nodes.length > 0) {
        setFullWorkflow(workflow);
        return;
      }

      // If nodes is just a number (count), fetch full details from n8n
      if (workflow.n8nId || workflow.id) {
        setLoading(true);
        try {
          const workflowId = workflow.n8nId || workflow.id;
          const response = await fetch(`/api/workflows/${workflowId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.workflow) {
              setFullWorkflow(data.workflow);
            } else {
              // Fallback to original workflow if fetch fails
              setFullWorkflow(workflow);
            }
          } else {
            // Fallback to original workflow if fetch fails
            setFullWorkflow(workflow);
          }
        } catch (error) {
          console.error('Error fetching workflow details:', error);
          // Fallback to original workflow if fetch fails
          setFullWorkflow(workflow);
        } finally {
          setLoading(false);
        }
      } else {
        setFullWorkflow(workflow);
      }
    };

    fetchWorkflowDetails();
  }, [workflow]);

  // Use fullWorkflow if available, otherwise use original workflow
  const displayWorkflow = fullWorkflow || workflow;

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
      
      // Build node label
      const nodeLabel = (
        <div className="px-3 py-2">
          <div className="font-semibold text-sm text-white">{nodeName}</div>
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
          background: getNodeColor(nodeType),
          color: '#fff',
          border: selectedNode?.id === nodeId ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
          borderRadius,
          minWidth: 150,
          fontSize: 12,
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
                sourceNode.sourcePosition = 'bottom';
              }
              if (targetNode) {
                targetNode.targetPosition = 'top';
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
  }, [displayWorkflow, selectedNode]);

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

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const n8nUrl = displayWorkflow.n8nId || workflow.n8nId
    ? `https://n8ncloud.tech/workflow/${displayWorkflow.n8nId || workflow.n8nId}`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
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
                  {reactFlowNodes.length} nodes • {reactFlowEdges.length} connections • Read-only
                </Panel>
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
          💡 This is a read-only visualization. Edit in n8n to make changes.
        </div>
      </div>
    </div>
  );
}

