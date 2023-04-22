import { Node, getIncomers, getOutgoers } from "reactflow";
import useStore, { RFState } from "../../../lib/store";
import { shallow } from "zustand/shallow";
import { useMemo } from "react";
import { EventFragment, ParamType } from "ethers";
import { Condition } from "../../FilterNode";

type Props = {
  condition: Condition;
};

export default function FilterCondition({ condition }: Props) {
  const { event } = condition;
  const { name, inputs } = event;
  return (
    <div className="p-2 py-1 border border-orange-300 rounded-lg">
      <div className="text-xs text-gray-600">{name}</div>
      {inputs.map((input) => (
        <ParamInput param={input}></ParamInput>
      ))}
    </div>
  );
}

function ParamInput({ param }: { param: ParamType }) {
  const { name, components, arrayLength, arrayChildren, type } = param;

  // unsupported tuples type
  if (components != null) return null;

  // unsupported arrays type
  if (arrayLength !== null) return null;

  // unsupported array children
  if (arrayChildren !== null) return null;

  return (
    <div>
      <div className="text-xs text-gray-600">
        {type} {name}
      </div>
      <input type="text" className="p-1 border border-gray-300 rounded-md"></input>
    </div>
  );
}
