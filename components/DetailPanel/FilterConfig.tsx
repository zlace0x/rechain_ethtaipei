import { Node } from "reactflow";

type Props = {
  node: Node<any>;
};
export default function FilterConfig({ node }: Props) {
  return <div className="p-1">Add condition</div>;
}
