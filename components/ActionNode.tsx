import { NodeProps, getIncomers } from "reactflow";
import useStore, { RFState } from "../lib/store";
import { shallow } from "zustand/shallow";

export const ActionType = {
  FURU_UNISWAP: "FURU_UNISWAP",
} as const;
export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export type ActionNodeData = {
  actionType: ActionType;
  actionParams: any;
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
});
export default function ActionNode({ selected, id }: NodeProps<ActionNodeData>) {
  const { nodes, edges } = useStore(selector, shallow);
  const node = nodes.find((n) => n.id === id)!!;
  const incomers = getIncomers(node, nodes, edges);

  return <div></div>;
}
