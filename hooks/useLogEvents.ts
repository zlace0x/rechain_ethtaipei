import { EventFragment, Interface, Log, LogDescription, isAddress } from "ethers";
import useSWR from "swr";
import { ErrorMessage } from "../pages/api/contract/info";
import useAddressInfo from "./useAddressInfo";
import { useMemo } from "react";
import { Condition } from "../components/FilterNode";
import { parseLogs } from "../lib/events";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useLogEvents(
  address: string,
  chainId: number | string,
  filter?: Condition
) {
  const isValidAddress = isAddress(address);

  const { data: rawLogs, isLoading: logLoading } = useSWR<{
    logs: Log[];
    blockNumber: number;
  }>(
    isValidAddress ? `/api/contract/info?address=${address}&chainId=${chainId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  console.log("rawLogs", rawLogs?.logs?.length);
  const { data: addressInfo, isLoading: addressLoading } = useAddressInfo(
    address,
    chainId
  );

  const logs = useMemo(() => {
    if (!addressInfo) return;
    if (!rawLogs || rawLogs?.logs?.length === 0) return;
    return parseLogs(rawLogs?.logs || [], addressInfo?.abi || "[]");
  }, [rawLogs, addressInfo]);

  const filteredLogs = useMemo(() => {
    if (!logs || logs?.length === 0) return;
    return processConditions(logs, filter);
  }, [logs, filter]);

  return { logs, filteredLogs, isLoading: logLoading || addressLoading };
}
type FormattedLog = {
  blockNumber: number;
  data: string;
  name: string;
  hash: string;
  id: string;
  event: EventFragment;
  params: any;
};

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
