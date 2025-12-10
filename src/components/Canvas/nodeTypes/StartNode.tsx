import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { StartNodeData } from '@/types/workflow';

const StartNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as StartNodeData;
  
  return (
    <div className={`workflow-node min-w-[120px] border-node-start ${selected ? 'selected ring-2 ring-node-start ring-offset-2' : ''}`}>
      <div className="bg-node-start text-node-start-foreground px-3 py-1.5 rounded-t-md flex items-center gap-2">
        <Play className="w-4 h-4" />
        <span className="font-medium text-sm">{nodeData.title || 'Start'}</span>
      </div>
      <div className="px-3 py-2 text-xs text-muted-foreground">
        Workflow begins here
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-node-start"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';

export default StartNode;
