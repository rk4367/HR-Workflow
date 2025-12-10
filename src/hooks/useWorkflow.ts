import { useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowNodeType, 
  WorkflowNodeData,
  AutomationAction,
  ValidationError,
  SimulationResult 
} from '@/types/workflow';
import { createDefaultNodeData } from '@/types/workflow';
import { validateWorkflow } from '@/utils/validation';
import { api } from '@/api/client';
import { automationTemplates } from '@/api/mocks';

export const useWorkflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Normalize edges so imported payloads get consistent styling/animation
  const normalizeEdges = useCallback((incoming: WorkflowEdge[]): WorkflowEdge[] => {
    return incoming.map((edge) => ({
      animated: true,
      style: { stroke: 'hsl(var(--primary))' },
      ...edge,
      id: edge.id || `${edge.source}-${edge.target}`,
    }));
  }, []);

  // Fetch automations on mount
  useEffect(() => {
    api
      .getAutomations()
      .then(setAutomations)
      .catch((err) => {
        console.warn('Failed to fetch automations, using fallback list', err);
        setAutomations(automationTemplates);
      });
  }, []);

  // Validate workflow when nodes or edges change
  useEffect(() => {
    const errors = validateWorkflow(nodes as WorkflowNode[], edges, automations);
    setValidationErrors(errors);
  }, [nodes, edges, automations]);

  // Get selected node
  const selectedNode = nodes.find(n => n.id === selectedNodeId) as WorkflowNode | undefined;

  // Handle edge connections
  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({
      ...connection,
      animated: true,
      style: { stroke: 'hsl(var(--primary))' },
    }, eds));
  }, [setEdges]);

  // Add a new node
  const addNode = useCallback((type: WorkflowNodeType, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: uuidv4(),
      type,
      position,
      data: createDefaultNodeData(type),
    };
    setNodes(nds => [...nds, newNode]);
    return newNode.id;
  }, [setNodes]);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, data: Partial<WorkflowNodeData>) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  }, [setNodes]);

  // Delete a node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [setNodes, setEdges, selectedNodeId]);

  // Delete an edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(eds => eds.filter(e => e.id !== edgeId));
  }, [setEdges]);

  // Select a node
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setNodes(nds => 
      nds.map(node => ({
        ...node,
        selected: node.id === nodeId,
      }))
    );
  }, [setNodes]);

  // Run simulation
  const runSimulation = useCallback(async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    
    try {
      const result = await api.simulate(nodes as WorkflowNode[], edges);
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown simulation error';
      setSimulationResult({
        success: false,
        steps: [],
        summary: `Simulation failed: ${message}`,
      });
    } finally {
      setIsSimulating(false);
    }
  }, [nodes, edges]);

  // Clear simulation result
  const clearSimulation = useCallback(() => {
    setSimulationResult(null);
  }, []);

  // Clear all nodes and edges
  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSimulationResult(null);
  }, [setNodes, setEdges]);

  // Load workflow from serialized payload (e.g., import or template)
  const loadWorkflow = useCallback((nextNodes: WorkflowNode[], nextEdges: WorkflowEdge[]) => {
    setNodes(nextNodes);
    setEdges(normalizeEdges(nextEdges));
    setSelectedNodeId(null);
    setSimulationResult(null);
  }, [setNodes, setEdges, normalizeEdges]);

  // Snapshot current workflow (for export)
  const getSnapshot = useCallback(() => ({ nodes, edges }), [nodes, edges]);

  return {
    // State
    nodes,
    edges,
    selectedNode,
    selectedNodeId,
    automations,
    validationErrors,
    simulationResult,
    isSimulating,
    
    // Actions
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteNode,
    deleteEdge,
    selectNode,
    runSimulation,
    clearSimulation,
    clearWorkflow,
    loadWorkflow,
    getSnapshot,
  };
};
