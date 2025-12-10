import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import StartNode from './nodeTypes/StartNode';
import TaskNode from './nodeTypes/TaskNode';
import ApprovalNode from './nodeTypes/ApprovalNode';
import AutomatedNode from './nodeTypes/AutomatedNode';
import EndNode from './nodeTypes/EndNode';
import type { WorkflowNode, WorkflowEdge, WorkflowNodeType } from '@/types/workflow';
import type { OnNodesChange, OnEdgesChange, OnConnect, NodeTypes } from '@xyflow/react';

// Register custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange<WorkflowEdge>;
  onConnect: OnConnect;
  onNodeClick: (nodeId: string) => void;
  onAddNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
  onEdgeDelete?: (edgeId: string) => void;
}

const WorkflowCanvasInner = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onAddNode,
  onEdgeDelete,
}: WorkflowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onAddNode(type, position);
    },
    [screenToFlowPosition, onAddNode]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full bg-canvas-bg"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        minZoom={0.5}
        maxZoom={1.5}
        onEdgeClick={(event, edge) => {
          if (onEdgeDelete && (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onEdgeDelete(edge.id);
          }
        }}
        connectionRadius={15}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[10, 10]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.2}
          color="#9fa3aa"
        />
        <Controls className="!bg-card !border-border !shadow-md" />
        <MiniMap
          className="!bg-card !border-border !shadow-md"
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              start: 'hsl(var(--node-start))',
              task: 'hsl(var(--node-task))',
              approval: 'hsl(var(--node-approval))',
              automated: 'hsl(var(--node-automated))',
              end: 'hsl(var(--node-end))',
            };
            return colors[node.type || 'task'] || 'hsl(var(--muted))';
          }}
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>
    </div>
  );
};

const WorkflowCanvas = (props: WorkflowCanvasProps) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;
