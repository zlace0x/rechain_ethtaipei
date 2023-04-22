import { Node, getIncomers, getOutgoers } from "reactflow";
import useStore, { RFState } from "../../../lib/store";
import { shallow } from "zustand/shallow";
import { useMemo, useState } from "react";
import { EventFragment, ParamType } from "ethers";
import { FilterNodeData, Rule } from "../../FilterNode";
import FilterCondition from "./FilterCondition";

type Props = {
  node: Node<FilterNodeData>;
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  updateNode: state.updateNode,
});

export default function FilterConfig({ node }: Props) {
  const { nodes, edges, updateNode } = useStore(selector, shallow);

  const { condition } = node.data;

  const incomers = getIncomers(node, nodes, edges);
  const outgoers = getOutgoers(node, nodes, edges);

  const sourceEvents: EventFragment[] = useMemo(
    () => incomers?.[0]?.data?.allEvents,
    [incomers]
  );

  const selectEventFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNode(node.id, {
      condition: {
        event: sourceEvents.find((evt) => evt.topicHash === e.target.value)!!,
        rules: {},
      },
    });
  };

  const setRule = (rule: Rule) => {
    updateNode(node.id, {
      condition: {
        event: condition.event,
        rules: {
          ...condition.rules,
          [rule.param.name]: rule,
        },
      },
    });
  };

  const removeRule = (param: ParamType) => {
    updateNode(node.id, {
      condition: {
        event: condition.event,
        rules: {
          ...condition.rules,
          [param.name]: null,
        },
      },
    });
  };

  if (!incomers.length) return <div className="p-1">Connect a source node</div>;
  return (
    <div className="w-4/5 p-1">
      Select event:
      <select
        name="eventFilter"
        onChange={selectEventFilter}
        value={condition?.event?.topicHash}
      >
        <option value="" disabled selected hidden>
          Choose an event
        </option>
        {sourceEvents.map((e) => (
          <option value={e.topicHash} key={e.topicHash}>
            {e.name}
          </option>
        ))}
      </select>
      {condition && (
        <FilterCondition
          condition={condition}
          setRule={setRule}
          removeRule={removeRule}
        />
      )}
    </div>
  );
}
