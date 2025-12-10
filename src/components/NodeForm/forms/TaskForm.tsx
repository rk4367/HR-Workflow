import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import type { TaskNodeData } from '@/types/workflow';

interface TaskFormProps {
  data: TaskNodeData;
  onUpdate: (data: Partial<TaskNodeData>) => void;
}

const TaskForm = ({ data, onUpdate }: TaskFormProps) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddCustomField = () => {
    if (newKey.trim()) {
      onUpdate({
        customFields: {
          ...data.customFields,
          [newKey.trim()]: newValue,
        },
      });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemoveCustomField = (key: string) => {
    const newFields = { ...data.customFields };
    delete newFields[key];
    onUpdate({ customFields: newFields });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={data.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe the task..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignee">Assignee</Label>
        <Input
          id="assignee"
          value={data.assignee || ''}
          onChange={(e) => onUpdate({ assignee: e.target.value })}
          placeholder="e.g., john@company.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={data.dueDate || ''}
          onChange={(e) => onUpdate({ dueDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Custom Fields</Label>
        <div className="space-y-2">
          {Object.entries(data.customFields || {}).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <span className="font-mono text-xs flex-1 truncate">{key}</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-mono text-xs flex-1 truncate">{value}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveCustomField(key)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Field name"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1"
          />
          <Button size="icon" onClick={handleAddCustomField} disabled={!newKey.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
