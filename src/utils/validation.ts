import type { WorkflowNode, WorkflowEdge, ValidationError, AutomationAction } from '@/types/workflow';
import { automationTemplates } from '@/api/mocks';

// Validate workflow structure
export const validateWorkflow = (
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[],
  automations?: AutomationAction[]
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const automationCatalog = (automations?.length ? automations : automationTemplates) ?? [];

  // Check for start node
  const startNodes = nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have exactly one Start node',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'error',
      message: 'Workflow can only have one Start node',
    });
  } else {
    const startNode = startNodes[0];
    const hasIncomingToStart = edges.some(e => e.target === startNode.id);
    if (hasIncomingToStart) {
      errors.push({
        type: 'error',
        message: 'Start node cannot have incoming connections',
        nodeId: startNode.id,
      });
    }
  }

  // Check for end node
  const endNodes = nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have at least one End node',
    });
  }

  // Check for disconnected nodes
  const connectedNodes = new Set<string>();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  nodes.forEach(node => {
    if (node.type === 'start') {
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasOutgoing) {
        errors.push({
          type: 'error',
          message: `Start node "${node.data.title}" must connect to at least one step`,
          nodeId: node.id,
        });
      }
      return;
    }

    if (node.type === 'end') {
      const hasIncoming = edges.some(e => e.target === node.id);
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasIncoming) {
        errors.push({
          type: 'error',
          message: `End node "${node.data.title}" must have an incoming connection`,
          nodeId: node.id,
        });
      }
      if (hasOutgoing) {
        errors.push({
          type: 'error',
          message: `End node "${node.data.title}" should not have outgoing connections`,
          nodeId: node.id,
        });
      }
      return;
    }

    const hasIncoming = edges.some(e => e.target === node.id);
    const hasOutgoing = edges.some(e => e.source === node.id);

    if (!hasIncoming && !hasOutgoing) {
      errors.push({
        type: 'error',
        message: `Node "${node.data.title}" is disconnected`,
        nodeId: node.id,
      });
    } else if (!hasIncoming) {
      errors.push({
        type: 'error',
        message: `Node "${node.data.title}" requires an incoming connection`,
        nodeId: node.id,
      });
    } else if (!hasOutgoing) {
      errors.push({
        type: 'error',
        message: `Node "${node.data.title}" requires an outgoing connection`,
        nodeId: node.id,
      });
    }
  });

  // Check for cycles using DFS
  const cycleErrors = detectCycles(nodes, edges);
  errors.push(...cycleErrors);

  // Validate required fields per node type
  nodes.forEach(node => {
    const fieldErrors = validateNodeFields(node, automationCatalog);
    errors.push(...fieldErrors);
  });

  return errors;
};

// Detect cycles using DFS
const detectCycles = (
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const adjacencyMap = new Map<string, string[]>();
  
  // Build adjacency list
  edges.forEach(edge => {
    const existing = adjacencyMap.get(edge.source) || [];
    existing.push(edge.target);
    adjacencyMap.set(edge.source, existing);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (nodeId: string, path: string[]): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyMap.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path, nodeId])) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        const node = nodes.find(n => n.id === nodeId);
        const targetNode = nodes.find(n => n.id === neighbor);
        errors.push({
          type: 'error',
          message: `Cycle detected: "${node?.data.title || nodeId}" → "${targetNode?.data.title || neighbor}"`,
          nodeId: nodeId,
        });
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  // Start DFS from all unvisited nodes
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  });

  return errors;
};

// Validate required fields per node type
const validateNodeFields = (
  node: WorkflowNode,
  automations: AutomationAction[]
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const data = node.data;

  switch (node.type) {
    case 'task':
      if (!data.title || data.title.trim() === '') {
        errors.push({
          type: 'error',
          message: 'Task node requires a title',
          nodeId: node.id,
        });
      }
      break;
    case 'automated': {
      const automatedData = data as { actionId?: string; params?: Record<string, string> };
      if (!automatedData.actionId) {
        errors.push({
          type: 'error',
          message: `Automated node "${data.title}" requires an action`,
          nodeId: node.id,
        });
        break;
      }

      const action = automations.find((a) => a.id === automatedData.actionId);
      if (!action) {
        errors.push({
          type: 'error',
          message: `Automation action "${automatedData.actionId}" is unavailable`,
          nodeId: node.id,
        });
        break;
      }

      const params = automatedData.params || {};
      const missingParam = action.params.some(
        (param) => !params[param] || `${params[param]}`.trim() === ''
      );

      if (missingParam) {
        errors.push({
          type: 'error',
          message: `Automated node "${data.title}" requires all action parameters: ${action.params.join(', ')}`,
          nodeId: node.id,
        });
      }
      break;
    }
  }

  return errors;
};

// Check if workflow can be simulated
export const canSimulate = (errors: ValidationError[]): boolean => {
  return !errors.some(e => e.type === 'error');
};
