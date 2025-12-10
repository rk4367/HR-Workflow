import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap, Settings } from 'lucide-react';
import type { AutomatedNodeData } from '@/types/workflow';

const AutomatedNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as AutomatedNodeData;
  const hasParams = Object.keys(nodeData.params || {}).length > 0;
  
  return (
    <div className={`workflow-node min-w-[150px] max-w-[210px] border-node-automated ${selected ? 'selected ring-2 ring-node-automated ring-offset-2' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-automated"
      />
      <div className="bg-node-automated text-node-automated-foreground px-3 py-1.5 rounded-t-md flex items-center gap-2">
        <Zap className="w-4 h-4" />
        <span className="font-medium text-sm truncate">{nodeData.title || 'Automation'}</span>
      </div>
      <div className="px-3 py-2 space-y-2">
        {nodeData.actionId ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            <Settings className="w-3 h-3" />
            <span className="truncate">{nodeData.actionId.replace(/_/g, ' ')}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No action selected</p>
        )}
        {hasParams && (
          <div className="text-xs text-muted-foreground">
            {Object.keys(nodeData.params).length} params configured
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-node-automated"
      />
    </div>
  );
});

AutomatedNode.displayName = 'AutomatedNode';

export default AutomatedNode;
