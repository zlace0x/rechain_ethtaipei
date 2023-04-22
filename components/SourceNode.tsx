import { isAddress } from "ethers";
import { ChangeEvent, useCallback, useState } from "react";
import { Handle, Position, Node, NodeProps, NodeToolbar } from "reactflow";
import useAddressInfo from "../hooks/useAddressInfo";
import EventLogs from "./EventLogs";
import { ChainId } from "../lib/network";
import NetworkSelect, { NetworkIcon } from "./NetworkSelect";
import useStore, { RFState } from "../lib/store";
import { shallow } from "zustand/shallow";

type NodeData = {
  chainId: number;
  address: string;
  outputEvents: Array<any>;
};

const selector = (state: RFState) => ({
  updateNode: state.updateNode,
});

export default function EventSourceNode({ selected, id }: NodeProps<NodeData>) {
  const [contract, setContract] = useState("");
  const [chainId, setChainId] = useState<ChainId>(1);
  const { updateNode } = useStore(selector, shallow);

  const onChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    setContract(evt.target.value);
    updateNode(id, { data: { address: evt.target.value } });
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
      <NodeToolbar>
        <NetworkSelect chainId={chainId} setChainId={setChainId} />
      </NodeToolbar>
      <div
        className={`flex flex-col items-center p-1 bg-white border rounded shadow-sm ${
          selected && "border-blue-400"
        }`}
      >
        <div className="absolute p-1 right-1 top-1">
          <NetworkIcon chainId={chainId} />
        </div>
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
            className={`rounded w-full nodrag ring-1 ${
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
