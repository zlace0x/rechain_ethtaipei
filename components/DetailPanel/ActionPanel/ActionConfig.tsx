import { Node, getIncomers, getOutgoers } from "reactflow";
import useStore, { RFState } from "../../../lib/store";
import { shallow } from "zustand/shallow";
import { FilterNodeData } from "../../FilterNode";
import { ActionLog, ActionNodeData, ActionType, ActionTypeLabel } from "../../ActionNode";
import FuruSwap from "../../Actions/FuruSwap";
import EthTransfer from "../../Actions/EthTransfer";
import useAction from "../../../hooks/useAction";
import { useState } from "react";

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
  const [isBusy, setIsBusy] = useState(false);
  const { runAction } = useAction();
  const { actionType, actionParams, actionLog } = node.data;

  const incomers = getIncomers(node, nodes, edges);

  const ActionSetting = actionType ? actionConfigs[actionType] : null;

  const updateActionParams = (params: any, isValid = true) => {
    updateNode(node.id, {
      isValid,
      actionParams: params,
    });
  };

  const manualTrigger = async () => {
    if (isBusy) return;
    setIsBusy(true);
    const result = await runAction(node.data);

    const newActionLog = [...actionLog];
    newActionLog.push({
      timestamp: Date.now(),
      triggerBy: "manual",
      results: result,
    });
    updateNode(node.id, {
      actionLog: newActionLog,
    });

    setIsBusy(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <div className="flex flex-col border-b">
        <div className="text-gray-600">{ActionTypeLabel[actionType]}</div>
        {ActionSetting && (
          <ActionSetting
            actionParams={actionParams}
            updateActionParams={updateActionParams}
          />
        )}
      </div>

      <div className="flex flex-col w-full p-4">
        <div className="flex justify-between">
          <div className="text-gray-800">Action Log</div>
          <div
            className="w-32 px-2 text-sm text-center border rounded hover:underline"
            onClick={manualTrigger}
          >
            {!isBusy ? "Manual Trigger" : "..."}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {actionLog && actionLog.map((action) => <ActionLogItem actionLog={action} />)}
        </div>
      </div>
    </div>
  );
}

function ActionLogItem({ actionLog }: { actionLog: ActionLog }) {
  const time = new Date(actionLog.timestamp);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs" onClick={() => setIsOpen(!isOpen)}>
        {time.toTimeString()} - {actionLog.triggerBy}
      </div>
      {isOpen && (
        <div className="max-w-sm text-xs text-gray-700">
          {JSON.stringify(actionLog.results)}
        </div>
      )}
    </div>
  );
}
