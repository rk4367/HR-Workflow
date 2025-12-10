import { memo } from 'react';
import { Play, ClipboardList, UserCheck, Zap, Flag } from 'lucide-react';
import type { WorkflowNodeType, PaletteItem } from '@/types/workflow';

const paletteItems: PaletteItem[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: 'play',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Assign work to someone',
    icon: 'clipboard',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Request approval from role',
    icon: 'user-check',
  },
  {
    type: 'automated',
    label: 'Automated',
    description: 'Run automated action',
    icon: 'zap',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: 'flag',
  },
];

const iconMap: Record<string, React.ReactNode> = {
  play: <Play className="w-5 h-5" />,
  clipboard: <ClipboardList className="w-5 h-5" />,
  'user-check': <UserCheck className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  flag: <Flag className="w-5 h-5" />,
};

const colorMap: Record<WorkflowNodeType, string> = {
  start: 'bg-node-start text-node-start-foreground',
  task: 'bg-node-task text-node-task-foreground',
  approval: 'bg-node-approval text-node-approval-foreground',
  automated: 'bg-node-automated text-node-automated-foreground',
  end: 'bg-node-end text-node-end-foreground',
};

const NodePalette = memo(() => {
  const onDragStart = (event: React.DragEvent, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-full bg-white px-2 py-3 flex flex-col h-full overflow-x-hidden">
      <div className="mb-3 px-2">
        <h2 className="text-base font-semibold text-sidebar-foreground">Node Palette</h2>
        <p className="text-[11px] text-muted-foreground mt-1">
          Drag nodes onto the canvas
        </p>
      </div>
      
      <div className="space-y-2 flex-1 px-1">
        {paletteItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border cursor-grab hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all active:cursor-grabbing group"
          >
            <div className={`p-2 rounded-md ${colorMap[item.type]} transition-transform group-hover:scale-105`}>
              {iconMap[item.icon]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground">
                {item.label}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

NodePalette.displayName = 'NodePalette';

export default NodePalette;
