import { EventFragment, Interface, Log, isAddress } from "ethers";
import useSWR from "swr";
import { ErrorMessage } from "../pages/api/contract/info";
import useAddressInfo from "./useAddressInfo";
import { useMemo } from "react";
import { Condition } from "../components/FilterNode";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useFilterEvents(
  address: string,
  chainId: number | string,
  filter: Condition
) {
  const isValidAddress = isAddress(address);
  console.log("address", address);
  console.log("chainId", chainId);
  console.log("filter", filter);
  const { data: rawLogs, isLoading: logLoading } = useSWR<Log[]>(
    isValidAddress
      ? `/api/contract/logs?address=${address}&chainId=${chainId}&topic=${filter?.event.topicHash}`
      : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: addressInfo, isLoading: addressLoading } = useAddressInfo(
    address,
    chainId
  );

  const logs = useMemo(() => {
    if (!addressInfo) return;
    if (!rawLogs || rawLogs?.length === 0) return;
    return parseLogs(rawLogs || [], addressInfo?.abi || "[]");
  }, [rawLogs, addressInfo]);

  const filteredLogs = useMemo(() => {
    if (!logs || logs?.length === 0) return;
    return processConditions(logs, filter);
  }, [logs, filter]);

  return { logs, filteredLogs, isLoading: logLoading || addressLoading };
}
export type FormattedLog = {
  blockNumber: number;
  data: string;
  name: string;
  hash: string;
  id: string;
  event: EventFragment;
  params: any;
};
function parseLogs(logs: Log[], abi: string): FormattedLog[] {
  const contractInterface = new Interface(abi);
  const formattedLogs = logs.map((log) => {
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
      blockNumber: log.blockNumber,
      data: log.data,
      name: event.name,
      hash: log.transactionHash,
      id: `${log.transactionHash}-${log.index}`,
      event: event.fragment,
      params: eventParameters,
    };
  });

  return formattedLogs
    .filter((e): e is Exclude<typeof e, null> => !!e)
    .sort((a, b) => b.blockNumber - a.blockNumber);
}

function processConditions(logs: FormattedLog[], condition?: Condition): FormattedLog[] {
  if (!condition) return logs;
  const { rules, event } = condition;
  return logs.filter((log) => {
    if (event && log.event.topicHash !== event.topicHash) return false;
    if (!rules || Object.keys(rules).every((key) => !rules[key])) return true;

    return Object.keys(rules).every((key) => {
      const { type, value, param } = rules[key];
      const logValue = log.params[param.name];
      switch (type) {
        case "eq":
          return logValue === value;
        default:
          return false;
      }
    });
  });
}
