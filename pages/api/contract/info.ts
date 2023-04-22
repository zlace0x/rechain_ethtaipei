import { isAddress, Interface, EventFragment, JsonRpcProvider, Provider, Log} from "ethers";
import { EvmTransactionLog } from "moralis/common-evm-utils";
import { formatHexChainId } from "../../../lib/network";
import { NextApiRequest, NextApiResponse } from "next";
import { ChainId, PRIVATE_RPC, SupportedChainId } from "../../../lib/network";
import useAddressInfo from "../../../hooks/useAddressInfo";

export type ContractInfo = {
    name?:string[]
  };
  
export type ErrorMessage = {
    message: string;
};

export type AddressInfoResponse = ContractInfo | ErrorMessage;

async function providerHandler(chainId: ChainId) {
    if (!(chainId in PRIVATE_RPC)) throw new Error("Invalid chainId");
  
    let url = PRIVATE_RPC[chainId];
    return new JsonRpcProvider(url);
  }
  
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    return res.status(200); // CORS
  }

  if (req.method !== "GET") return res.status(501);

  const { address, chainId } = req.query;

  if (!address || !chainId) return res.status(400).json({ message: "Bad request" });
  if (!isAddress(address)) {
    res.status(400).json({ message: "Invalid address format" });
    return;
  }
    const provider = await providerHandler(chainId as string);
    const BN = await provider.getBlockNumber()
    const filter = {
        fromBlock: BN-10,
        toBlock: BN,
    }
    const data = await provider.getLogs(filter)
    // const result = await fetch(`http://localhost:3000/api/address/info?address=${address}&chainId=${chainId}`)
    // const _result = await result.json();
// 
  return res.status(200).json(data);
}
/** Filters for unique events and parses them */
function parseUniqueLogs(logs: Log[], abi: string) {
    const contractInterface = new Interface(JSON.parse(abi));
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

function filterUniqueTopics(logs: Log[]): Log[] {
    const uniqueTopics = new Set<string>();
    const uniqueLogs: Log[] = [];
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
