import { Node, getIncomers, getOutgoers } from "reactflow";
import useStore, { RFState } from "../../../lib/store";
import { shallow } from "zustand/shallow";
import { FilterNodeData } from "../../FilterNode";
import { ActionLog, ActionNodeData, ActionType, ActionTypeLabel } from "../../ActionNode";
import FuruSwap from "../../Actions/FuruSwap";
import EthTransfer from "../../Actions/EthTransfer";
import useAction from "../../../hooks/useAction";
import { useEffect, useMemo, useState } from "react";
import { SourceNodeData } from "../../SourceNode";
import useFilterEvents, { FormattedLog } from "../../../hooks/useFilteredEvents";

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
  const { actionType, actionParams, actionLog, actionResult } = node.data;

  const incomers = getIncomers(node, nodes, edges);

  const sourcesData: (SourceNodeData & FilterNodeData)[] = useMemo(() => {
    const sources: (SourceNodeData & FilterNodeData)[] = [];
    const filterNodes = incomers;
    filterNodes.forEach((filterNode) => {
      const source = getIncomers(filterNode, nodes, edges);
      const sourceNode: SourceNodeData = source?.[0]?.data;
      if (!sourceNode.address) return;
      sources.push({
        ...sourceNode,
        ...filterNode.data,
      });
    });
    return sources;
  }, [incomers]);

  const firstSource = sourcesData?.[0];

  const { logs, filteredLogs, isLoading } = useFilterEvents(
    firstSource?.address,
    firstSource?.chainId,
    firstSource?.condition
  );

  useEffect(() => {
    if (!filteredLogs) return;
    const newTriggers = actionResult
      ? filteredLogs.filter((l) => !(l.id in actionResult))
      : filteredLogs;

    newTriggers.forEach((l) => {
      console.log("Trigger: " + l.id);
      eventTrigger(l);
    });
  }, [filteredLogs, actionResult]);

  const ActionSetting = actionType ? actionConfigs[actionType] : null;

  const updateActionParams = (params: any, isValid = true) => {
    updateNode(node.id, {
      isValid,
      actionParams: params,
    });
  };

  const eventTrigger = async (event: FormattedLog) => {
    const result = await runAction(node.data);

    const newActionLog = [...actionLog];
    const newEntry = {
      id: event.id,
      timestamp: Date.now(),
      triggerBy: event.id,
      results: result,
    };
    newActionLog.push(newEntry);
    updateNode(node.id, {
      actionLog: newActionLog,
      actionResult: {
        ...actionResult,
        [newEntry.id]: newEntry,
      },
    });
  };

  const manualTrigger = async () => {
    if (isBusy) return;
    setIsBusy(true);
    const result = await runAction(node.data);

    const newActionLog = [...actionLog];
    const newEntry = {
      id: `manual-${Date.now()}`,
      timestamp: Date.now(),
      triggerBy: "manual",
      results: result,
    };
    newActionLog.push(newEntry);
    updateNode(node.id, {
      actionLog: newActionLog,
      actionResult: {
        ...actionResult,
        [newEntry.id]: newEntry,
      },
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
          {actionLog &&
            actionLog.map((action) => (
              <ActionLogItem key={action.id} actionLog={action} />
            ))}
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
