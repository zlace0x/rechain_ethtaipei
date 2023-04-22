import { useEvmContractLogs } from "@moralisweb3/next";
import { EventFragment, Interface } from "ethers";
import { EvmTransactionLog } from "moralis/common-evm-utils";
import useAddressInfo from "./useAddressInfo";
import { formatHexChainId } from "../lib/network";

export default function useContractEvents(contract: string, chainId: string | number) {
  const hexChainId = formatHexChainId(chainId);
  const { data, isFetching } = useEvmContractLogs({
    chain: hexChainId,
    address: contract,
  });

  const { data: addressInfo } = useAddressInfo(contract, chainId);

  const parsedLogs = addressInfo && parseUniqueLogs(data || [], addressInfo?.abi || "[]");

  return { data, parsedLogs, isFetching };
}

//** Filters for unique events and parses them */
function parseUniqueLogs(logs: EvmTransactionLog[], abi: string) {
  const contractInterface = new Interface(abi);
  const formattedLogs = filterUniqueTopics(logs).map((log) => {
    const event = contractInterface.parseLog({
      topics: log.topics.filter((topic) => topic !== null) as string[],
      data: log.data,
    });

    // If no ABI matches the signature, return null;
    if (!event) {
      return null;
    }

    // Extract human-readable event parameters
    const eventParameters: Record<string, any> = {};
    event.fragment.inputs.forEach((input, index) => {
      eventParameters[input.name] = event.args[index];
    });

    return {
      name: event.name,
      ...eventParameters,
    };
  });

  return formattedLogs.filter((e): e is Exclude<typeof e, null> => !!e);
}

function filterUniqueTopics(logs: EvmTransactionLog[]): EvmTransactionLog[] {
  const uniqueTopics = new Set<string>();
  const uniqueLogs: EvmTransactionLog[] = [];
  logs.forEach((log) => {
    const topic = log.topics[0];
    if (topic && !uniqueTopics.has(topic)) {
      uniqueTopics.add(topic);
      uniqueLogs.push(log);
    }
  });
  return uniqueLogs;
}

export function filterABIEvents(abi: string): EventFragment[] {
  const contractInterface = new Interface(abi);
  const events: EventFragment[] = [];
  contractInterface.forEachEvent((evt) => {
    events.push(evt);
    return evt;
  });
  return events;
}
