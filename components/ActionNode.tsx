import { Handle, NodeProps, Position, getIncomers } from "reactflow";
import useStore, { RFState } from "../lib/store";
import { shallow } from "zustand/shallow";
import Warning from "./Icons/Warning";

export const ActionType = {
  FURU_UNISWAP: "FURU_UNISWAP",
  ETH_TRANSFER: "ETH_TRANSFER",
} as const;
export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export const ActionTypeLabel = {
  [ActionType.FURU_UNISWAP]: "Furu Uniswap",
  [ActionType.ETH_TRANSFER]: "Transfer ETH",
};

export type ActionNodeData = {
  actionType: ActionType;
  actionParams: any;
  isValid: boolean;
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  updateNode: state.updateNode,
});

export default function ActionNode({ selected, id, data }: NodeProps<ActionNodeData>) {
  const { nodes, edges, updateNode } = useStore(selector, shallow);
  const node = nodes.find((n) => n.id === id);
  if (!node) return null;
  const incomers = getIncomers(node, nodes, edges);

  const { isValid, actionType } = data;

  const onSelectAction = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const actionType = event.target.value as ActionType;
    updateNode(id, { actionType });
  };
  return (
    <div
      className={`w-full p-4 bg-white rounded-lg border ${selected && "border-blue-400"}`}
    >
      <div className="flex gap-2">
        <div className="text-xs text-gray-600">Action</div>
        {!isValid && <Warning className="w-3 h-3 text-orange-500" />}
      </div>
      <select
        name=""
        id="actionType"
        value={actionType}
        onChange={onSelectAction}
        defaultValue=""
      >
        <option value="" disabled hidden>
          Choose an action
        </option>
        {Object.keys(ActionType).map((key) => (
          <option key={key} value={key}>
            {ActionTypeLabel[key as ActionType]}
          </option>
        ))}
      </select>
      <Handle
        type="target"
        position={Position.Left}
        id="actionTrigger-a"
        isConnectable={incomers.length < 3}
      />
    </div>
  );
}
