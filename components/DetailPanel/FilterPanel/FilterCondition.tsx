import { ParamType } from "ethers";
import { Condition, Rule } from "../../FilterNode";

type Props = {
  condition: Condition;
  setRule: (rule: Rule) => void;
  removeRule: (param: ParamType) => void;
};

export default function FilterCondition({ condition, setRule, removeRule }: Props) {
  const { event, rules } = condition;
  const { name, inputs } = event;
  return (
    <div className="p-2 py-1 border border-gray-300 rounded-lg shadow-md">
      <div className="text-xs text-gray-600">{name}</div>
      {inputs.map((input) => (
        <ParamInput
          param={input}
          isEnabled={!!rules?.[input.name]}
          value={rules?.[input.name]?.value ?? ""}
          setRule={setRule}
          removeRule={removeRule}
        />
      ))}
    </div>
  );
}

function ParamInput({
  param,
  isEnabled,
  value,
  setRule,
  removeRule,
}: {
  param: ParamType;
  isEnabled: boolean;
  value: string | number;
  setRule: (rule: Rule) => void;
  removeRule: (param: ParamType) => void;
}) {
  const { name, components, arrayLength, arrayChildren, type } = param;

  // unsupported tuples type
  if (components != null) return null;

  // unsupported arrays type
  if (arrayLength !== null) return null;

  // unsupported array children
  if (arrayChildren !== null) return null;

  const handleValueChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setRule({
      type: "eq",
      value: evt.target.value,
      param,
    });
  };

  let input = (
    <input
      type="text"
      value={value}
      onChange={handleValueChange}
      className="p-1 text-sm rounded-md ring-1 ring-blue-500"
    ></input>
  );
  if (type.startsWith("uint")) {
    input = (
      <input
        type="number"
        value={value}
        onChange={handleValueChange}
        className="p-1 text-sm rounded-md ring-1 ring-blue-500"
        placeholder="0"
      ></input>
    );
  }
  if (type == "address") {
    input = (
      <input
        type="string"
        value={value}
        onChange={handleValueChange}
        className="p-1 text-sm rounded-md ring-1 ring-blue-500"
        placeholder="0xa80..."
      ></input>
    );
  }

  return (
    <div className="p-1">
      <div className="flex items-center gap-2 mb-1">
        <input
          type="checkbox"
          className="w-3 h-3"
          id={`enable-${name}`}
          onChange={() => (isEnabled ? removeRule(param) : null)}
          checked={isEnabled}
        />
        <label className="text-xs text-gray-600" htmlFor={`enable-${name}`}>
          {type} {name}
        </label>
      </div>
      {input}
    </div>
  );
}
