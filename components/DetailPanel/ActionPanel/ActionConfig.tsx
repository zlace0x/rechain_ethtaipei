import { Node, getIncomers, getOutgoers } from "reactflow";
import useStore, { RFState } from "../../../lib/store";
import { shallow } from "zustand/shallow";
import { FilterNodeData } from "../../FilterNode";
import { ActionNodeData, ActionType, ActionTypeLabel } from "../../ActionNode";
import FuruSwap from "../../Actions/FuruSwap";
import EthTransfer from "../../Actions/EthTransfer";

type Props = {
  node: Node<ActionNodeData>;
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  updateNode: state.updateNode,
});

const actionConfigs: Record<ActionType, any> = {
  [ActionType.FURU_UNISWAP]: FuruSwap,
  [ActionType.ETH_TRANSFER]: EthTransfer,
};

export default function ActionConfig({ node }: Props) {
  const { nodes, edges, updateNode } = useStore(selector, shallow);

  const { actionType, actionParams } = node.data;

  const incomers = getIncomers(node, nodes, edges);

  const ActionSetting = actionType ? actionConfigs[actionType] : null;

  const updateActionParams = (params: any, isValid = true) => {
    updateNode(node.id, {
      isValid,
      actionParams: params,
    });
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-gray-600">{ActionTypeLabel[actionType]}</div>
      {ActionSetting && (
        <ActionSetting
          actionParams={actionParams}
          updateActionParams={updateActionParams}
        />
      )}
    </div>
  );
}
