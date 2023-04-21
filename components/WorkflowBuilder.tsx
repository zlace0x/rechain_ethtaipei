import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Panel,
} from "reactflow";
import EventSourceNode from "./EventSourceNode";
import "reactflow/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "eventSourceNode",
    position: { x: 100, y: 200 },
    data: { value: 123 },
  },
];
// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component

const nodeTypes = { eventSourceNode: EventSourceNode };
let nodeId = 1;
export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addSourceNode = useCallback(() => {
    const id = `${++nodeId}`;
    const newNode = {
      id,
      type: "eventSourceNode",
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        value: nodeId,
      },
    };
    setNodes((ns) => ns.concat(newNode));
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Panel position="top-left">
          <div
            className="px-4 py-2 border rounded shadow-lg bg-gray-50"
            onClick={addSourceNode}
          >
            Add source
          </div>
        </Panel>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
