import { isAddress } from "ethers";
import { ChangeEvent, useCallback, useState } from "react";
import { Handle, Position, Node, NodeProps } from "reactflow";
import EventLogs from "./EventLogs";

type NodeData = {};

export default function FilterNode({}: NodeProps<NodeData>) {
  const [contract, setContract] = useState("");
}
