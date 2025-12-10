import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AutomatedNodeData, AutomationAction } from '@/types/workflow';

interface AutomatedFormProps {
  data: AutomatedNodeData;
  onUpdate: (data: Partial<AutomatedNodeData>) => void;
  automations: AutomationAction[];
}

const AutomatedForm = ({ data, onUpdate, automations }: AutomatedFormProps) => {
  const selectedAction = automations.find(a => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    // Reset params when action changes
    onUpdate({ actionId, params: {} });
  };

  const handleParamChange = (param: string, value: string) => {
    onUpdate({
      params: {
        ...data.params,
        [param]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={data.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Automation step"
        />
      </div>

      <div className="space-y-2">
        <Label>Automation Action</Label>
        <Select value={data.actionId || ''} onValueChange={handleActionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an action..." />
          </SelectTrigger>
          <SelectContent>
            {automations.map((action) => (
              <SelectItem key={action.id} value={action.id}>
                {action.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <Label className="text-muted-foreground">Action Parameters</Label>
          {selectedAction.params.map((param) => (
            <div key={param} className="space-y-1">
              <Label htmlFor={param} className="text-xs capitalize">
                {param.replace(/_/g, ' ')}
              </Label>
              <Input
                id={param}
                value={data.params[param] || ''}
                onChange={(e) => handleParamChange(param, e.target.value)}
                placeholder={`Enter ${param}...`}
              />
            </div>
          ))}
        </div>
      )}

      {!data.actionId && (
        <p className="text-xs text-muted-foreground italic">
          Select an action to configure its parameters
        </p>
      )}
    </div>
  );
};

export default AutomatedForm;
