import { isAddress } from "ethers";
import { ChangeEvent, useCallback, useState } from "react";
import { Handle, Position, Node, NodeProps } from "reactflow";
import useAddressInfo from "../hooks/useAddressInfo";
import EventLogs from "./EventLogs";

type NodeData = {
  value: number;
};

export default function EventSourceNode({}: NodeProps<NodeData>) {
  const [contract, setContract] = useState("");

  const onChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    setContract(evt.target.value);
  }, []);

  const isValidAddress = isAddress(contract);
  const {
    data: addressInfo,
    error: addressInfoError,
    isLoading,
  } = useAddressInfo(contract);

  const isContract = !addressInfoError && addressInfo?.isContract;

  const hintText = !isValidAddress
    ? "Enter a contract or account address"
    : isLoading
    ? "Loading..."
    : isContract
    ? "Contract"
    : "EOA";

  return (
    <>
      <div className="flex flex-col items-center p-1 bg-white border rounded shadow-sm">
        <div className="text-xs text-gray-600">Event source</div>
        <div className="text-xs text-gray-800">{hintText}</div>
        <div className="flex w-full gap-2 p-2 text-sm">
          <label htmlFor="text">Address:</label>
          <input
            id="text"
            name="text"
            value={contract}
            placeholder="0x..."
            onChange={onChange}
            className={`rounded nodrag ring-1 ${
              isValidAddress ? "ring-blue-400" : "ring-red-400"
            }`}
          />
        </div>
        {isContract && isValidAddress && <EventLogs address={contract} />}
      </div>
      <Handle type="source" position={Position.Right} id="a" />
    </>
  );
}
