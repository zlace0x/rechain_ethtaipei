import { useState } from "react";
import useContractEvents from "../../hooks/useContractEvents";

export default function EventLogs({
  address,
  chainId,
}: {
  address: string;
  chainId: string | number;
}) {
  const { parsedLogs, isFetching } = useContractEvents(address, chainId);
  if (isFetching) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <span className="text-sm">Events:</span>
      <ul className="text-xs nodrag">
        {parsedLogs && parsedLogs.map((log) => <EventListItem key={log.name} {...log} />)}
      </ul>
    </div>
  );
}

type Event = {
  name: string;
  [key: string]: any;
};

function EventListItem(event: Event) {
  const [isOpen, setIsOpen] = useState(false);

  const { name, ...params } = event;
  const paramsString = Object.keys(params)
    .map((p) => `${p}: ${params[p]}`)
    .join(", ");
  return (
    <li
      onClick={() => setIsOpen(!isOpen)}
      className={`cursor-pointer ${isOpen ? "border" : ""}`}
    >
      <div className={`hover:underline ${isOpen && "font-bold"}`}>{name}</div>
      {isOpen && <div className="max-w-sm text-xs text-gray-700">{paramsString}</div>}
    </li>
  );
}
