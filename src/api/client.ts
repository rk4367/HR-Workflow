import type { AutomationAction, SimulationResult, WorkflowEdge, WorkflowNode } from '@/types/workflow';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json() as Promise<T>;
};

export const api = {
  async getAutomations(): Promise<AutomationAction[]> {
    const res = await fetch('/automations');
    return handleResponse<AutomationAction[]>(res);
  },

  async simulate(nodes: WorkflowNode[], edges: WorkflowEdge[]): Promise<SimulationResult> {
    const res = await fetch('/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    });
    return handleResponse<SimulationResult>(res);
  },
};
