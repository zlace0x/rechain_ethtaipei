import React from "react";
import ReactFlow, { Background, Controls, Panel } from "reactflow";
import "reactflow/dist/style.css";
import { shallow } from "zustand/shallow";

import useStore, { RFState } from "../lib/store";
import { nodeTypes } from "../lib/flow";
import DetailPanel from "./DetailPanel";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  selectedNode: state.nodes.filter((n) => n.selected)?.[0],
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNode: state.addNode,
});

export default function WorkflowBuilder() {
  const { nodes, edges, selectedNode, onNodesChange, onEdgesChange, addNode, onConnect } =
    useStore(selector, shallow);

  const addSourceNode = () => {
    addNode("eventSourceNode", { allEvents: [] });
  };

  const addFilterNode = () => {
    addNode("eventFilterNode", {});
  };

  const addActionNode = () => {
    addNode("actionNode", {
      isValid: false,
      actionLog: [],
    });
  };

  return (
    <div className="flex w-screen h-screen">
      <div style={{ width: "75vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Panel position="top-left" className="flex gap-2">
            <div
              className="px-4 py-2 border rounded shadow-lg bg-gray-50"
              onClick={addSourceNode}
            >
              Add source
            </div>

            <div
              className="px-4 py-2 border rounded shadow-lg bg-gray-50"
              onClick={addFilterNode}
            >
              Add Filter
            </div>

            <div
              className="px-4 py-2 border rounded shadow-lg bg-gray-50"
              onClick={addActionNode}
            >
              Add Action
            </div>
          </Panel>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div className="w-[25vw] h-[100vh] border-l shadow-lg overflow-hidden">
        <DetailPanel node={selectedNode} />
      </div>
    </div>
  );
}
