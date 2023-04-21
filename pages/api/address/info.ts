import { InfuraProvider, isAddress, JsonRpcProvider } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

export type AddressInfo = {
  address: string;
  isContract: boolean;
  contractABI?: string;
};

export type ErrorMessage = {
  message: string;
};

async function hasContractCode(
  provider: JsonRpcProvider,
  address: string
): Promise<boolean> {
  const code = await provider.getCode(address);
  return code !== "0x";
}
export type AddressInfoResponse = AddressInfo | ErrorMessage;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AddressInfoResponse>
) {
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
  const provider = new InfuraProvider(
    parseInt(chainId as string),
    process.env.INFURA_API_KEY
  );

  const isContract = await hasContractCode(provider, address as string);
  const info: AddressInfo = {
    address: address as string,
    isContract,
  };
  if (isContract) {
    info.contractABI = await getContractABI(address as string);
  }

  return res.status(200).json(info);
}

async function getContractABI(address: string) {
  const response = await fetch(
    `https://api.arbiscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ARBISCAN_API_KEY}`
  );
  const data = await response.json();
  if (data.status !== "1") return null;
  return data.result;
}
