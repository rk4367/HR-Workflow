import { useWorkflow } from '@/hooks/useWorkflow';
import WorkflowCanvas from '@/components/Canvas/WorkflowCanvas';
import NodePalette from '@/components/Sidebar/NodePalette';
import NodeFormPanel from '@/components/NodeForm/NodeFormPanel';
import SandboxPanel from '@/components/Sandbox/SandboxPanel';
import AppSidebar from '@/components/Sidebar/AppSidebar';
import type { WorkflowNode } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, ChevronDown, Upload, Download } from 'lucide-react';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

const Index = () => {
  const [showPalette, setShowPalette] = useState(true);
  const [showConfig, setShowConfig] = useState(true);
  const [showSandbox, setShowSandbox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevSelectedIdRef = useRef<string | null>(null);

  const {
    nodes,
    edges,
    selectedNode,
    automations,
    validationErrors,
    simulationResult,
    isSimulating,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteNode,
    selectNode,
    runSimulation,
    clearSimulation,
    deleteEdge,
    loadWorkflow,
    getSnapshot,
    clearWorkflow,
  } = useWorkflow();

  const handleExport = useCallback(() => {
    const snapshot = getSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [getSnapshot]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    file.text()
      .then((text) => {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            loadWorkflow(parsed.nodes, parsed.edges);
          } else {
            console.warn('Invalid workflow file shape');
          }
        } catch (err) {
          console.error('Failed to parse workflow file', err);
        }
      })
      .finally(() => {
        event.target.value = '';
      });
  }, [loadWorkflow]);

  const nodeCountLabel = useMemo(
    () => `${nodes.length} node${nodes.length !== 1 ? 's' : ''}`,
    [nodes.length]
  );

  const edgeCountLabel = useMemo(
    () => `${edges.length} connection${edges.length !== 1 ? 's' : ''}`,
    [edges.length]
  );

  const errorCount = useMemo(
    () => validationErrors.filter((v) => v.type === 'error').length,
    [validationErrors]
  );

  const warningCount = useMemo(
    () => validationErrors.filter((v) => v.type === 'warning').length,
    [validationErrors]
  );

  // Auto-open config panel when a node is selected
  useEffect(() => {
    const currentId = selectedNode?.id ?? null;
    const prevId = prevSelectedIdRef.current;
    if (!showConfig && currentId && currentId !== prevId) {
      setShowConfig(true);
    }
    prevSelectedIdRef.current = currentId;
  }, [selectedNode, showConfig]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Always reveal config when a node is explicitly clicked
      setShowConfig(true);
      selectNode(nodeId);
    },
    [selectNode, setShowConfig]
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden flex-col lg:flex-row">
      <div className="order-2 lg:order-1 w-full lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r bg-white">
        <AppSidebar showPalette={showPalette} />
      </div>

      <div className="order-1 lg:order-2 flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header Top Row */}
        <header className="border-b bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <div className="h-14 px-4 sm:px-6 flex items-center relative justify-start">
            <div className="text-center ml-2 sm:ml-4">
              <h1 className="text-base font-semibold text-foreground flex items-center justify-center gap-2">
                User Automation
              </h1>
              <p className="text-[11px] text-muted-foreground">Overview of User Workflows</p>
            </div>
            <div className="absolute right-4 sm:right-6 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleExport} className="gap-2 transition-transform hover:-translate-y-0.5">
                <Upload className="w-4 h-4" />
                Export JSON
              </Button>
              <Button size="sm" variant="outline" onClick={handleImportClick} className="gap-2 transition-transform hover:-translate-y-0.5">
                <Download className="w-4 h-4" />
                Import JSON
              </Button>
              <Button size="sm" variant="ghost" onClick={clearWorkflow} className="transition-transform hover:-translate-y-0.5">
                Clear
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </div>

          {/* Header Stats / Controls Row */}
          <div className="px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-t bg-white/80 backdrop-blur">
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <Badge variant="secondary" className="px-3 py-1 rounded-full shadow-sm">
                {nodeCountLabel}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 rounded-full shadow-sm">
                {edgeCountLabel}
              </Badge>
              <Badge variant={errorCount ? 'destructive' : 'secondary'} className="px-3 py-1 rounded-full shadow-sm">
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </Badge>
              <Badge variant={warningCount ? 'outline' : 'secondary'} className="px-3 py-1 rounded-full shadow-sm">
                {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
              </Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSandbox((v) => !v)}
                className="transition-transform hover:-translate-y-0.5"
              >
                {showSandbox ? 'Hide Simulation' : 'Run Simulation'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfig((v) => !v)}
                className="transition-transform hover:-translate-y-0.5"
              >
                {showConfig ? 'Hide Config' : 'Show Config'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative flex-col lg:flex-row min-h-0">
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/30 min-h-0">
            <div className="flex-1 relative min-h-[320px]">
              <WorkflowCanvas
                nodes={nodes as WorkflowNode[]}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onAddNode={addNode}
                onEdgeDelete={deleteEdge}
              />
            </div>

            {showSandbox && (
              <SandboxPanel
                validationErrors={validationErrors}
                simulationResult={simulationResult}
                isSimulating={isSimulating}
                onSimulate={runSimulation}
                onClear={clearSimulation}
              />
            )}
          </div>

          {showConfig && (
            <NodeFormPanel
              node={selectedNode as WorkflowNode | undefined}
              automations={automations}
              onUpdate={updateNodeData}
              onDelete={deleteNode}
              onClose={() => selectNode(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
