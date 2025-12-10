import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import type { StartNodeData } from '@/types/workflow';

interface StartFormProps {
  data: StartNodeData;
  onUpdate: (data: Partial<StartNodeData>) => void;
}

const StartForm = ({ data, onUpdate }: StartFormProps) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddMetadata = () => {
    if (newKey.trim()) {
      onUpdate({
        metadata: {
          ...data.metadata,
          [newKey.trim()]: newValue,
        },
      });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemoveMetadata = (key: string) => {
    const newMetadata = { ...data.metadata };
    delete newMetadata[key];
    onUpdate({ metadata: newMetadata });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={data.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Start"
        />
      </div>

      <div className="space-y-2">
        <Label>Metadata (Key-Value)</Label>
        <div className="space-y-2">
          {Object.entries(data.metadata || {}).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <span className="font-mono text-xs flex-1 truncate">{key}</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-mono text-xs flex-1 truncate">{value}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveMetadata(key)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Key"
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
          <Button size="icon" onClick={handleAddMetadata} disabled={!newKey.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartForm;
