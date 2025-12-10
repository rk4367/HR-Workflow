import NodePalette from './NodePalette';

interface AppSidebarProps {
  showPalette: boolean;
}

const AppSidebar = ({ showPalette }: AppSidebarProps) => {
  return (
    <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r bg-white flex flex-col max-h-[50vh] lg:max-h-none overflow-hidden">
      <div className="h-16 px-4 flex items-center gap-3 border-b flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">HR Workflow Designer</p>
          <p className="text-xs text-muted-foreground">Visual workflow automation</p>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-3 overflow-auto">
        {showPalette ? (
          <NodePalette />
        ) : (
          <div className="text-xs text-muted-foreground px-2 py-3">
            Palette hidden. Toggle to show draggable nodes.
          </div>
        )}
      </div>

      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        Click a node on canvas to configure
      </div>
    </aside>
  );
};

export default AppSidebar;

