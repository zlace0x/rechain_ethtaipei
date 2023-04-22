import { Node } from "reactflow";
import FilterConfig from "./FilterPanel/FilterConfig";
import SourceConfig from "./SourceConfig";
import { NodeType, nodeLabels } from "../../lib/flow";
import ActionConfig from "./ActionPanel/ActionConfig";

type Props = {
  node: Node<any>;
};

const nodeConfigs: Record<NodeType, any> = {
  eventSourceNode: SourceConfig,
  eventFilterNode: FilterConfig,
  actionNode: ActionConfig,
};

export default function DetailPanel({ node }: Props) {
  if (!node || !node.type)
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] p-1">
        <div className="text-sm text-gray-600">Select a node to view details</div>
      </div>
    );

  const Config = nodeConfigs[node.type as NodeType];
  return (
    <div className="flex flex-col items-center justify-start p-1">
      <div className="text-sm font-bold text-gray-800">
        {nodeLabels[node.type as NodeType]}
      </div>

      <Config node={node} />
    </div>
  );
}
