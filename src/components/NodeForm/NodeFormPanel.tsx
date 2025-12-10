import { X, Trash2, Play, ClipboardList, UserCheck, Zap, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StartForm from './forms/StartForm';
import TaskForm from './forms/TaskForm';
import ApprovalForm from './forms/ApprovalForm';
import AutomatedForm from './forms/AutomatedForm';
import EndForm from './forms/EndForm';
import type { 
  WorkflowNode, 
  WorkflowNodeData, 
  AutomationAction,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '@/types/workflow';

interface NodeFormPanelProps {
  node: WorkflowNode | undefined;
  automations: AutomationAction[];
  onUpdate: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

const nodeTypeIcons = {
  start: <Play className="w-5 h-5" />,
  task: <ClipboardList className="w-5 h-5" />,
  approval: <UserCheck className="w-5 h-5" />,
  automated: <Zap className="w-5 h-5" />,
  end: <Flag className="w-5 h-5" />,
};

const nodeTypeColors = {
  start: 'bg-node-start text-node-start-foreground',
  task: 'bg-node-task text-node-task-foreground',
  approval: 'bg-node-approval text-node-approval-foreground',
  automated: 'bg-node-automated text-node-automated-foreground',
  end: 'bg-node-end text-node-end-foreground',
};

const nodeTypeLabels = {
  start: 'Start Node',
  task: 'Task Node',
  approval: 'Approval Node',
  automated: 'Automated Node',
  end: 'End Node',
};

const NodeFormPanel = ({ node, automations, onUpdate, onDelete, onClose }: NodeFormPanelProps) => {
  if (!node) {
    return (
      <div className="w-72 bg-panel-bg border-l border-panel-border p-8 flex flex-col items-center justify-center h-full text-center gap-3">
        <div className="p-4 bg-muted rounded-full">
          <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">No Node Selected</h3>
        <p className="text-sm text-muted-foreground">
          Click on a node in the canvas to configure it
        </p>
      </div>
    );
  }

  const handleUpdate = (data: Partial<WorkflowNodeData>) => {
    onUpdate(node.id, data);
  };

  const renderForm = () => {
    switch (node.type) {
      case 'start':
        return <StartForm data={node.data as StartNodeData} onUpdate={handleUpdate} />;
      case 'task':
        return <TaskForm data={node.data as TaskNodeData} onUpdate={handleUpdate} />;
      case 'approval':
        return <ApprovalForm data={node.data as ApprovalNodeData} onUpdate={handleUpdate} />;
      case 'automated':
        return (
          <AutomatedForm
            data={node.data as AutomatedNodeData}
            onUpdate={handleUpdate}
            automations={automations}
          />
        );
      case 'end':
        return <EndForm data={node.data as EndNodeData} onUpdate={handleUpdate} />;
      default:
        return <p className="text-muted-foreground">Unknown node type</p>;
    }
  };

  return (
    <div className="w-full lg:w-72 bg-panel-bg border-t lg:border-t-0 lg:border-l border-panel-border flex flex-col h-full lg:h-auto max-h-[50vh] lg:max-h-none animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-panel-border flex items-center gap-3">
        <div className={`p-2 rounded-md ${nodeTypeColors[node.type || 'task']}`}>
          {nodeTypeIcons[node.type || 'task']}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">
            {node.data.title || nodeTypeLabels[node.type || 'task']}
          </h3>
          <p className="text-xs text-muted-foreground">
            {nodeTypeLabels[node.type || 'task']}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderForm()}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-panel-border">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
};

export default NodeFormPanel;
