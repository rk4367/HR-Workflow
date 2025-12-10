import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { UserCheck, Percent } from 'lucide-react';
import type { ApprovalNodeData } from '@/types/workflow';

const ApprovalNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as ApprovalNodeData;
  
  return (
    <div className={`workflow-node min-w-[150px] max-w-[210px] border-node-approval ${selected ? 'selected ring-2 ring-node-approval ring-offset-2' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-approval"
      />
      <div className="bg-node-approval text-node-approval-foreground px-3 py-1.5 rounded-t-md flex items-center gap-2">
        <UserCheck className="w-4 h-4" />
        <span className="font-medium text-sm truncate">{nodeData.title || 'Approval'}</span>
      </div>
      <div className="px-3 py-2 space-y-2">
        {nodeData.approverRole && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Role:</span> {nodeData.approverRole}
          </div>
        )}
        {nodeData.autoApproveThreshold > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded w-fit">
            <Percent className="w-3 h-3" />
            <span>Auto: {nodeData.autoApproveThreshold}%</span>
          </div>
        )}
        {!nodeData.approverRole && nodeData.autoApproveThreshold === 0 && (
          <p className="text-xs text-muted-foreground italic">Click to configure</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-node-approval"
      />
    </div>
  );
});

ApprovalNode.displayName = 'ApprovalNode';

export default ApprovalNode;
