import { create } from "zustand";
import { FormattedLog } from "../hooks/useFilteredEvents";
import { Condition } from "../components/FilterNode";
import { AddressInfo } from "../pages/api/address/info";
import { Interface, Log, LogDescription } from "ethers";

export type SourceInfo = {
  chainId: number;
  address: string;
  addressInfo: AddressInfo;
  condition?: Condition;
  id: string;
};
export type EventState = {
  sources: Record<string, SourceInfo>;
  latestEvents: Record<string, FormattedLog[]>;
  addSource: (source: SourceInfo) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<EventState>((set, get) => ({
  sources: {},
  latestEvents: {},
  fetchLatestEvents: async () => {
    const allReq = Object.keys(get().sources).map(async (k) => {
      const source = get().sources[k];
      let url = `/api/contract/events?address=${source.address}&chainId=${source.chainId}`;
      if (source.condition) {
        url += `&topic=${source.condition.event.topicHash}`;
      }
      const result = await fetch(
        `/api/contract/logs?address=${source.address}&chainId=${source.chainId}`
      );
      return {
        id: source.id,
        events: parseLogs(await result.json(), source.addressInfo.abi || "[]"),
      };
    });
    const allResults = await Promise.all(allReq);
    set((state) => {
      const currentEvents = state.latestEvents;
      return {};
    });
  },
  addSource: (source: SourceInfo) => {
    set((state) => ({
      sources: {
        ...state.sources,
        [source.id]: source,
      },
    }));
  },
}));
export default useStore;

export function parseLogs(logs: Log[], abi: string): FormattedLog[] {
  const contractInterface = new Interface(abi);
  const formattedLogs = logs.map((log) => {
    let event: LogDescription | null;
    try {
      event = contractInterface.parseLog({
        topics: log.topics.filter((topic) => topic !== null) as string[],
        data: log.data,
      });
    } catch (e) {
      console.log("e", e);
      return null;
    }
    // If no ABI matches the signature, return null;
    if (!event) {
      return null;
    }

    // Extract human-readable event parameters
    const eventParameters: Record<string, any> = {};
    event.fragment.inputs.forEach((input, index) => {
      eventParameters[input.name] = event!!.args[index];
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
