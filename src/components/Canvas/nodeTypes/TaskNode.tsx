import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ClipboardList, User, Calendar } from 'lucide-react';
import type { TaskNodeData } from '@/types/workflow';

const TaskNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as TaskNodeData;
  
  return (
    <div className={`workflow-node min-w-[160px] max-w-[220px] border-node-task ${selected ? 'selected ring-2 ring-node-task ring-offset-2' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-task"
      />
      <div className="bg-node-task text-node-task-foreground px-3 py-1.5 rounded-t-md flex items-center gap-2">
        <ClipboardList className="w-4 h-4" />
        <span className="font-medium text-sm truncate">{nodeData.title || 'Task'}</span>
      </div>
      <div className="px-3 py-2 space-y-2">
        {nodeData.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {nodeData.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          {nodeData.assignee && (
            <div className="flex items-center gap-1 text-muted-foreground bg-muted px-2 py-1 rounded">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{nodeData.assignee}</span>
            </div>
          )}
          {nodeData.dueDate && (
            <div className="flex items-center gap-1 text-muted-foreground bg-muted px-2 py-1 rounded">
              <Calendar className="w-3 h-3" />
              <span>{nodeData.dueDate}</span>
            </div>
          )}
        </div>
        {!nodeData.description && !nodeData.assignee && !nodeData.dueDate && (
          <p className="text-xs text-muted-foreground italic">Click to configure</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-node-task"
      />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

export default TaskNode;
