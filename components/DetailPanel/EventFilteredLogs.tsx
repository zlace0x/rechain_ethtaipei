import { useState } from "react";
import useLogEvents from "../../hooks/useLogEvents";
import { Condition } from "../FilterNode";
import useFilterEvents, { FormattedLog } from "../../hooks/useFilteredEvents";
import { truncate } from "../../lib/utils";

export default function EventFilteredLogs({
  address,
  chainId,
  condition,
}: {
  address: string;
  chainId: string | number;
  condition: Condition;
}) {
  const { logs, filteredLogs, isLoading } = useFilterEvents(address, chainId, condition);
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <span className="text-sm">
        Events ({filteredLogs?.length || 0} matched from {logs?.length || 0} total):
      </span>
      <ul className="text-xs nodrag">
        {filteredLogs &&
          filteredLogs.map((log) => <EventListItem key={log.id} log={log} />)}
      </ul>
    </div>
  );
}

function EventListItem({ log }: { log: FormattedLog }) {
  const [isOpen, setIsOpen] = useState(false);

  const { name, params } = log;
  const paramsString = Object.keys(params)
    .map((p) => `${p}: ${params[p]}`)
    .join(", ");
  return (
    <li
      onClick={() => setIsOpen(!isOpen)}
      className={`cursor-pointer ${isOpen ? "border" : ""}`}
    >
      <div className="flex flex-row gap-1">
        {log.blockNumber} -
        <div className={`hover:underline ${isOpen && "font-bold"}`}>{name}</div>
        <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
          {truncate(log.hash)}
        </a>
      </div>

      {isOpen && <div className="max-w-sm text-xs text-gray-700">{paramsString}</div>}
    </li>
  );
}
