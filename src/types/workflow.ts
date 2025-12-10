import type { Node, Edge } from '@xyflow/react';

// Node Types
export type WorkflowNodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

// Base node data
export interface BaseNodeData extends Record<string, unknown> {
  title: string;
  label?: string;
}

// Start Node
export interface StartNodeData extends BaseNodeData {
  metadata: Record<string, string>;
}

// Task Node
export interface TaskNodeData extends BaseNodeData {
  description: string;
  assignee: string;
  dueDate: string;
  customFields: Record<string, string>;
}

// Approval Node
export interface ApprovalNodeData extends BaseNodeData {
  approverRole: string;
  autoApproveThreshold: number;
}

// Automated Node
export interface AutomatedNodeData extends BaseNodeData {
  actionId: string;
  params: Record<string, string>;
}

// End Node
export interface EndNodeData extends BaseNodeData {
  endMessage: string;
  summary: boolean;
}

// Union type for all node data
export type WorkflowNodeData = 
  | StartNodeData 
  | TaskNodeData 
  | ApprovalNodeData 
  | AutomatedNodeData 
  | EndNodeData;

// Workflow Node with proper typing
export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;

// Workflow Edge
export interface WorkflowEdge extends Edge {
  animated?: boolean;
}

// Automation Action from API
export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

// Simulation result
export interface SimulationStep {
  nodeId: string;
  nodeType: WorkflowNodeType;
  title: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  summary: string;
}

// Validation
export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

// Palette item for sidebar
export interface PaletteItem {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: string;
}

// Default data creators
export const createDefaultNodeData = (type: WorkflowNodeType): WorkflowNodeData => {
  switch (type) {
    case 'start':
      return { title: 'Start', metadata: {} } as StartNodeData;
    case 'task':
      return { 
        title: 'New Task', 
        description: '', 
        assignee: '', 
        dueDate: '',
        customFields: {} 
      } as TaskNodeData;
    case 'approval':
      return { 
        title: 'Approval', 
        approverRole: '', 
        autoApproveThreshold: 0 
      } as ApprovalNodeData;
    case 'automated':
      return { 
        title: 'Automation', 
        actionId: '', 
        params: {} 
      } as AutomatedNodeData;
    case 'end':
      return { 
        title: 'End', 
        endMessage: 'Workflow completed', 
        summary: true 
      } as EndNodeData;
  }
};
