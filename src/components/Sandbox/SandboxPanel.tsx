import { Play, AlertTriangle, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ValidationError, SimulationResult, SimulationStep } from '@/types/workflow';
import { canSimulate } from '@/utils/validation';

interface SandboxPanelProps {
  validationErrors: ValidationError[];
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  onSimulate: () => void;
  onClear: () => void;
}

const SandboxPanel = ({
  validationErrors,
  simulationResult,
  isSimulating,
  onSimulate,
  onClear,
}: SandboxPanelProps) => {
  const errors = validationErrors.filter(e => e.type === 'error');
  const warnings = validationErrors.filter(e => e.type === 'warning');
  const canRun = canSimulate(validationErrors);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStepIcon = (step: SimulationStep) => {
    switch (step.status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-node-start" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-node-approval" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-node-end" />;
    }
  };

  const getNodeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      start: 'border-l-node-start',
      task: 'border-l-node-task',
      approval: 'border-l-node-approval',
      automated: 'border-l-node-automated',
      end: 'border-l-node-end',
    };
    return colors[type] || 'border-l-muted';
  };

  return (
    <div className="h-64 bg-panel-bg border-t border-panel-border flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-panel-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">Simulation Sandbox</h3>
          {errors.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-destructive/10 text-destructive rounded-full">
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-node-approval/10 text-node-approval rounded-full">
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {errors.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Fix errors to enable simulation
            </span>
          )}
          {simulationResult && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
          <Button
            size="sm"
            onClick={onSimulate}
            disabled={!canRun || isSimulating}
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Validation Errors */}
          {validationErrors.length > 0 && !simulationResult && (
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                    error.type === 'error'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-node-approval/10 text-node-approval'
                  }`}
                >
                  {error.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span>{error.message}</span>
                    {error.nodeId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Node: <span className="font-mono">{error.nodeId}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Simulation Result */}
          {simulationResult && (
            <div className="space-y-3">
              {/* Summary */}
              <div
                className={`p-3 rounded-md ${
                  simulationResult.success
                    ? 'bg-node-start/10 text-node-start'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {simulationResult.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {simulationResult.summary}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {simulationResult.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-2 bg-muted/50 rounded-md border-l-4 ${getNodeTypeColor(step.nodeType)}`}
                  >
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatTime(step.timestamp)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStepIcon(step)}
                        <span className="font-medium text-sm">{step.title}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          ({step.nodeType})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {validationErrors.length === 0 && !simulationResult && (
            <div className="text-center py-6 text-muted-foreground">
              <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Workflow is valid. Click "Run Simulation" to test.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SandboxPanel;
