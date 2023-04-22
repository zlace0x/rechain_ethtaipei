import ActionNode from "../components/ActionNode";
import EventFilterNode from "../components/FilterNode";
import EventSourceNode from "../components/SourceNode";

import { Node } from "reactflow";

export const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "eventSourceNode",
    position: { x: 100, y: 200 },
    data: {},
  },
];
// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component

export const nodeTypes = {
  eventSourceNode: EventSourceNode,
  eventFilterNode: EventFilterNode,
  actionNode: ActionNode,
};

export type NodeType = keyof typeof nodeTypes;

export const nodeLabels: Record<NodeType, string> = {
  eventSourceNode: "Event source",
  eventFilterNode: "Event Condition Filter",
  actionNode: "Action Definition",
};
