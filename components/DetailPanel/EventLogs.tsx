import { useState } from "react";
import useLogEvents from "../../hooks/useLogEvents";
import { Condition } from "../FilterNode";

export default function EventLogs({
  address,
  chainId,
  condition,
}: {
  address: string;
  chainId: string | number;
  condition?: Condition;
}) {
  const { logs, filteredLogs, isLoading } = useLogEvents(address, chainId, condition);
  if (isLoading) return <div>Loading...</div>;

  const numFiltered =
    !!condition && filteredLogs && logs ? logs?.length - filteredLogs?.length : 0;

  const isFiltered = !!condition;
  return (
    <div className="w-full">
      <span className="text-sm">
        Events ({isFiltered ? `${filteredLogs?.length || 0} matched` : logs?.length}):
      </span>
      <ul className="text-xs nodrag">
        {isFiltered &&
          filteredLogs &&
          filteredLogs.map((log) => <EventListItem key={log.id} log={log} />)}
        {!isFiltered &&
          logs &&
          logs.map((log) => <EventListItem key={log.id} log={log} />)}
      </ul>
    </div>
  );
}

type Event = {
  name: string;
  [key: string]: any;
};

function EventListItem({ log }: { log: Event }) {
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
      </div>

      {isOpen && <div className="max-w-sm text-xs text-gray-700">{paramsString}</div>}
    </li>
  );
}
