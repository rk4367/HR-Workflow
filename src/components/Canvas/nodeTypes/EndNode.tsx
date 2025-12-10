import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Flag, FileText } from 'lucide-react';
import type { EndNodeData } from '@/types/workflow';

const EndNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as EndNodeData;
  
  return (
    <div className={`workflow-node min-w-[130px] max-w-[190px] border-node-end ${selected ? 'selected ring-2 ring-node-end ring-offset-2' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-end"
      />
      <div className="bg-node-end text-node-end-foreground px-3 py-1.5 rounded-t-md flex items-center gap-2">
        <Flag className="w-4 h-4" />
        <span className="font-medium text-sm truncate">{nodeData.title || 'End'}</span>
      </div>
      <div className="px-3 py-2 space-y-2">
        {nodeData.endMessage && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {nodeData.endMessage}
          </p>
        )}
        {nodeData.summary && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded w-fit">
            <FileText className="w-3 h-3" />
            <span>Generate summary</span>
          </div>
        )}
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';

export default EndNode;
