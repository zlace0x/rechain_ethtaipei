import { Node } from "reactflow";
import { SourceNodeData } from "../SourceNode";

import EventItem from "./EventItem";

type Props = {
  node: Node<SourceNodeData>;
};

export default function SourceConfig({ node }: Props) {
  const { address, addressInfo, allEvents } = node.data;

  if (!address) return <div>Enter an address</div>;
  return (
    <div className="py-1">
      <div className="text-xs text-gray-600">{node.data.address}</div>
      {addressInfo?.name && (
        <div className="text-xs text-gray-600">({addressInfo?.name})</div>
      )}

      {/* {addressInfo?.isContract && <EventLogs address={address} chainId={chainId} />} */}
      {allEvents && (
        <>
          <div className="text-xs text-gray-600">Events</div>
          <div className="flex flex-col h-[80vh] overflow-y-scroll gap-y-4 p-1">
            {allEvents.map((event) => (
              <EventItem event={event} key={event.name} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
