import { isAddress } from "ethers";
import { ChangeEvent, useCallback, useState } from "react";
import { Handle, Position, Node, NodeProps } from "reactflow";
import EventLogs from "./EventLogs";

type NodeData = {};

export default function EventFilterNode({ selected }: NodeProps<NodeData>) {
  return (
    <div
      className={`w-full p-4 bg-gray-100 rounded-lg border ${
        selected && "border-blue-400"
      }`}
    >
      <span className="text-sm">Select event:</span>
      <Handle type="target" position={Position.Left} id="a" />
    </div>
  );
}
