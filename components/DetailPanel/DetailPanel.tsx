import { Node } from "reactflow";
import FilterConfig from "./FilterConfig";
import SourceConfig from "./SourceConfig";

type Props = {
  node: Node<any>;
};
export default function DetailPanel({ node }: Props) {
  if (!node)
    return (
      <div className="flex flex-col items-center justify-start p-1">
        <div className="text-sm text-gray-600">Select a node to view details</div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-start p-1">
      <div className="text-sm font-bold text-gray-800">
        {node?.type == "eventSourceNode" ? "Event Source" : "Condition"}
      </div>

      {node && node?.type == "eventSourceNode" ? (
        <SourceConfig node={node} />
      ) : (
        <FilterConfig node={node} />
      )}
    </div>
  );
}
