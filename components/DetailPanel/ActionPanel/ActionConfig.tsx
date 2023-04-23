import { Node, getIncomers, getOutgoers } from "reactflow";
import useStore, { RFState } from "../../../lib/store";
import { shallow } from "zustand/shallow";
import { FilterNodeData } from "../../FilterNode";
import {
  ActionLog,
  ActionNodeData,
  ActionType,
  ActionTypeLabel,
  SourceMonitor,
} from "../../ActionNode";
import FuruSwap from "../../Actions/FuruSwap";
import EthTransfer from "../../Actions/EthTransfer";
import useAction from "../../../hooks/useAction";
import { useEffect, useMemo, useState } from "react";
import { SourceNodeData } from "../../SourceNode";
import useFilterEvents, { FormattedLog } from "../../../hooks/useFilteredEvents";
import { useNotificationQueue } from "../../../provider/NotificationProvider";

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
  const { status, actionType, actionParams, actionLog, actionResult } = node.data;

  const notification = useNotificationQueue();

  const incomers = getIncomers(node, nodes, edges);

  const sourcesData: SourceMonitor[] = useMemo(() => {
    const sources: SourceMonitor[] = [];
    const filterNodes = incomers;
    filterNodes.forEach((filterNode) => {
      const source = getIncomers(filterNode, nodes, edges);
      const sourceNode: SourceNodeData = source?.[0]?.data;
      if (!sourceNode.address) return;
      sources.push({
        ...sourceNode,
        ...filterNode.data,
        status: "running",
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

  const startMonitor = () => {
    const sources: SourceMonitor[] = [];
    const filterNodes = incomers;
    filterNodes.forEach((filterNode) => {
      const source = getIncomers(filterNode, nodes, edges);
      const sourceNode: SourceNodeData = source?.[0]?.data;
      if (!sourceNode.address) return;
      sources.push({
        ...sourceNode,
        ...filterNode.data,
        status: "running",
      });
    });

    updateNode(node.id, {
      status: "running",
      monitors: sources,
    });
  };

  const stopMonitor = () => {
    updateNode(node.id, {
      status: "stopped",
      monitors: null,
    });
  };

  const isRunning = status == "running";

  useEffect(() => {
    if (!filteredLogs) return;
    if (!isRunning) return;
    const newTriggers = actionResult
      ? filteredLogs.filter((l) => !(l.id in actionResult))
      : filteredLogs;

    newTriggers.forEach((l) => {
      console.log("Trigger: " + l.id);
      notification.add(`event-${l.id}`, {
        message: "New event triggered",
        level: "info",
      });
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
    const id = `manual-${Date.now()}`;
    notification.add(`action-${id}`, {
      message: "Manual action triggered",
      level: "info",
    });
    const result = await runAction(node.data);

    const newActionLog = [...actionLog];
    const newEntry = {
      id: id,
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

      <div className="flex flex-col w-full p-4 text-xs">
        <div
          onClick={isRunning ? stopMonitor : startMonitor}
          className={`rounded ${
            isRunning ? "bg-red-400" : "bg-green-600"
          } p-2 font-bold text-center w-40 text-white`}
        >
          {isRunning ? "Stop" : "Start"}
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
