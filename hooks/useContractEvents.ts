import { useEvmContractLogs } from "@moralisweb3/next";
import { Interface } from "ethers";
import { EvmTransactionLog } from "moralis/common-evm-utils";
import useAddressInfo from "./useAddressInfo";

export default function useContractEvents(contract: string, chainId: string|number) {
  let fetchResult, _isFetching=true
  if (chainId === "100" || chainId === 100){
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      "method": "eth_getLogs",
      "params": [
        {
          "toBlock":"latest",
          "fromBlock":"earliest",
          "address": contract
        }
      ],
      "id": 1,
      "jsonrpc": "2.0"
    });

    let requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://intensive-polished-gas.xdai.quiknode.pro/4bd2790c7745c2d9231c55d9a9dd86c06c77dee2/", requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log('[useContractEvents.ts] Gnosis data: ', result)
        fetchResult = result
        _isFetching = false
      })
      .catch(error => {
        console.log('[useContractEvents.ts] error:  ', error)
        _isFetching = false
      });
  }
  else {
    const { data, isFetching } = useEvmContractLogs({
      chain: chainId,
      address: contract,
    });
    fetchResult = data
    _isFetching = isFetching
  }

  console.log('[useContractEvents.ts] data: ', fetchResult)

  const { data: addressInfo } = useAddressInfo(contract, chainId);

  const parsedLogs =
    addressInfo && parseUniqueLogs(fetchResult || [], addressInfo?.contractABI || "[]");

  return { fetchResult, parsedLogs, _isFetching };
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
