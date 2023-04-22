import { isAddress, JsonRpcProvider } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { ChainId, PRIVATE_RPC } from "../../../lib/network";

export type ContractInfo = {
  name?: string[];
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  const BN = await provider.getBlockNumber();
  const filter = {
    fromBlock: BN - 100,
    toBlock: BN,
  };
  const data = await provider.getLogs(filter);
  // const data = await provider.send("trace_filter", [filter]);

  // console.log("logs", data);
  return res.status(200).json({
    blockNumber: BN,
    logs: data,
  });
}
