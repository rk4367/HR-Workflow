import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { ApprovalNodeData } from '@/types/workflow';

interface ApprovalFormProps {
  data: ApprovalNodeData;
  onUpdate: (data: Partial<ApprovalNodeData>) => void;
}

const ApprovalForm = ({ data, onUpdate }: ApprovalFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={data.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Approval step"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="approverRole">Approver Role</Label>
        <Input
          id="approverRole"
          value={data.approverRole || ''}
          onChange={(e) => onUpdate({ approverRole: e.target.value })}
          placeholder="e.g., Manager, HR Director"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Auto-Approve Threshold</Label>
          <span className="text-sm font-mono text-muted-foreground">
            {data.autoApproveThreshold || 0}%
          </span>
        </div>
        <Slider
          value={[data.autoApproveThreshold || 0]}
          onValueChange={([value]) => onUpdate({ autoApproveThreshold: value })}
          max={100}
          step={5}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          {data.autoApproveThreshold > 0
            ? `Requests will be auto-approved ${data.autoApproveThreshold}% of the time during simulation`
            : 'Set to 0 to always require manual approval'}
        </p>
      </div>
    </div>
  );
};

export default ApprovalForm;
