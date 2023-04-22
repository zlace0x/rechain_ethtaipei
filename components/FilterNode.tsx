import { Handle, Position, NodeProps, getIncomers, Connection } from "reactflow";
import { shallow } from "zustand/shallow";
import useStore, { RFState } from "../lib/store";
import { EventFragment, ParamType } from "ethers";

export type Rule = {
  type: "eq" | "gt" | "lt" | "lte" | "gte";
  value: string;
  param: ParamType;
};

export type Condition = {
  event: EventFragment;
  rules?: Rule[];
};

export type FilterNodeData = {
  condition: Condition;
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export default function EventFilterNode({ selected, id }: NodeProps<FilterNodeData>) {
  const { nodes, edges } = useStore(selector, shallow);
  const node = nodes.find((n) => n.id === id)!!;
  const incomers = getIncomers(node, nodes, edges);

  return (
    <div
      className={`w-full p-4 bg-gray-100 rounded-lg border ${
        selected && "border-blue-400"
      }`}
    >
      <div className="text-xs text-gray-600">Event Filter</div>
      {!incomers.length && <div className="text-xs text-gray-800">Connect source</div>}
      <Handle
        type="target"
        position={Position.Left}
        id="eventInput-a"
        isConnectable={incomers.length == 0}
      />
    </div>
  );
}
