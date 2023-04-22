import { Handle, Position, NodeProps, getIncomers, Connection } from "reactflow";
import { shallow } from "zustand/shallow";
import useStore, { RFState } from "../lib/store";
import { EventFragment, ParamType } from "ethers";
import Warning from "./Icons/Warning";

export type Rule = {
  type: "eq" | "gt" | "lt" | "lte" | "gte";
  value: string;
  param: ParamType;
};

export type Condition = {
  event: EventFragment;
  rules?: Record<string, Rule>;
};

export type FilterNodeData = {
  condition: Condition;
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export default function EventFilterNode({
  selected,
  id,
  data,
}: NodeProps<FilterNodeData>) {
  const { nodes, edges } = useStore(selector, shallow);
  const node = nodes.find((n) => n.id === id);
  if (!node) return null;
  const incomers = getIncomers(node, nodes, edges);

  const { condition } = data;
  return (
    <div
      className={`w-full p-4 bg-gray-100 rounded-lg border ${
        selected && "border-blue-400"
      }`}
    >
      <div className="flex gap-2">
        <div className="text-xs text-gray-600">Event Filter</div>
        {!condition && <Warning className="w-3 h-3 text-orange-500" />}
      </div>
      {!incomers.length && <div className="text-xs text-gray-800">Connect source</div>}
      {!!condition?.event && (
        <div className="text-sm text-gray-800">{condition.event.name}</div>
      )}
      <Handle
        type="target"
        position={Position.Left}
        id="eventInput-a"
        isConnectable={incomers.length == 0}
      />
      {!!condition && (
        <Handle type="source" position={Position.Right} id="eventOutput-a" />
      )}
    </div>
  );
}
