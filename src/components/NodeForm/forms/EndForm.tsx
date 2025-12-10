import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { EndNodeData } from '@/types/workflow';

interface EndFormProps {
  data: EndNodeData;
  onUpdate: (data: Partial<EndNodeData>) => void;
}

const EndForm = ({ data, onUpdate }: EndFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={data.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="End"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endMessage">End Message</Label>
        <Textarea
          id="endMessage"
          value={data.endMessage || ''}
          onChange={(e) => onUpdate({ endMessage: e.target.value })}
          placeholder="Message displayed when workflow completes..."
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
        <div className="space-y-0.5">
          <Label htmlFor="summary" className="cursor-pointer">
            Generate Summary
          </Label>
          <p className="text-xs text-muted-foreground">
            Create a summary report on completion
          </p>
        </div>
        <Switch
          id="summary"
          checked={data.summary ?? true}
          onCheckedChange={(checked) => onUpdate({ summary: checked })}
        />
      </div>
    </div>
  );
};

export default EndForm;
