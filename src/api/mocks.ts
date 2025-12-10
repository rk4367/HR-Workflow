import { http, HttpResponse, delay } from 'msw';
import { setupWorker } from 'msw/browser';
import type { 
  AutomationAction, 
  SimulationResult, 
  SimulationStep, 
  WorkflowEdge, 
  WorkflowNode, 
  WorkflowNodeType 
} from '@/types/workflow';

export const automationTemplates: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
];

const buildExecutionStep = (node: WorkflowNode, timestamp: number): SimulationStep => {
  const nodeType = node.type as WorkflowNodeType;
  const title = node.data.title || nodeType;

  const outcomes: Record<WorkflowNodeType, () => Pick<SimulationStep, 'status' | 'message'>> = {
    start: () => ({ status: 'success', message: 'Workflow initiated' }),
    task: () => {
      const taskData = node.data as { assignee?: string; description?: string };
      if (!taskData.assignee) {
        return { status: 'warning', message: 'Task created without an assignee' };
      }
      return { status: 'success', message: `Task assigned to ${taskData.assignee}` };
    },
    approval: () => {
      const approvalData = node.data as { approverRole?: string; autoApproveThreshold?: number };
      const threshold = approvalData.autoApproveThreshold ?? 0;
      if (threshold > 0) {
        return { status: 'success', message: `Auto-approved (threshold: ${threshold}%)` };
      }
      return { status: 'success', message: `Awaiting approval from ${approvalData.approverRole || 'approver'}` };
    },
    automated: () => {
      const automationData = node.data as { actionId?: string };
      const action = automationTemplates.find(a => a.id === automationData.actionId);
      if (!action) {
        return { status: 'error', message: 'Automation action not configured' };
      }
      return { status: 'success', message: `Executed: ${action.label}` };
    },
    end: () => {
      const endData = node.data as { endMessage?: string };
      return { status: 'success', message: endData.endMessage || 'Workflow ended' };
    },
  };

  const result = outcomes[nodeType]?.() ?? { status: 'success', message: 'Step executed' };

  return {
    nodeId: node.id,
    nodeType,
    title,
    timestamp,
    ...result,
  };
};

const runSimulation = (nodes: WorkflowNode[], edges: WorkflowEdge[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const startNode = nodes.find(n => n.type === 'start');

  if (!startNode) {
    return { success: false, steps: [], summary: 'No start node found in workflow' };
  }

  const adjacencyMap = new Map<string, string[]>();
  edges.forEach(edge => {
    const existing = adjacencyMap.get(edge.source) || [];
    existing.push(edge.target);
    adjacencyMap.set(edge.source, existing);
  });

  adjacencyMap.forEach((targets, key) => {
    const sorted = [...targets];
    sorted.sort();
    adjacencyMap.set(key, sorted);
  });

  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  let currentTime = Date.now();

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    currentTime += 500;
    steps.push(buildExecutionStep(node, currentTime));

    const nextNodes = adjacencyMap.get(nodeId) || [];
    nextNodes.forEach(nextId => {
      if (!visited.has(nextId)) {
        queue.push(nextId);
      }
    });
  }

  const hasError = steps.some(step => step.status === 'error');
  const reachedEnd = steps.some(step => step.nodeType === 'end');
  const success = reachedEnd && !hasError;

  return {
    success,
    steps,
    summary: success
      ? 'Workflow completed successfully'
      : hasError
        ? 'Workflow completed with errors'
        : 'Workflow did not reach end node',
  };
};

export const handlers = [
  http.get('/automations', async () => {
    await delay(150);
    return HttpResponse.json(automationTemplates);
  }),
  http.post('/simulate', async ({ request }) => {
    const body = await request.json() as { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
    await delay(250);
    return HttpResponse.json(runSimulation(body?.nodes || [], body?.edges || []));
  }),
];

export const worker = setupWorker(...handlers);

export const setupMocks = async () => {
  if (typeof window === 'undefined') return;
  await worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
  });
};
