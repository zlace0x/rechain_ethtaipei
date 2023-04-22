import { InfuraProvider, isAddress, JsonRpcProvider, Provider } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

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
  console.log(chainId);
  if (!isAddress(address)) {
    res.status(400).json({ message: "Invalid address format" });
    return;
  }
  //chainId = '1';
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
    let proxy = await isTransparentProxy(address, provider);
    let enteraddress = proxy === '0x00'?address:proxy;
    info.contractABI = await getContractABI(enteraddress as string);
  }

  return res.status(200).json(info);
}

async function getContractABI(address: string) {
  
  const response = await fetch(
    `https://api.arbiscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ARBISCAN_API_KEY}&position=3`
  );
  const data = await response.json();
  if (data.status !== "1") return null;   
  return data.result;
}


const BEACON_PROXY_STORAGE_SLOTS = {
  implementation: 1,
  admin: 2,
  pendingAdmin: 3
};


async function isTransparentProxy(proxyAddress: string, provider: Provider): Promise<string> {
  const code = await provider.getCode(proxyAddress);
  const target = ethers.toBeHex(await provider.getStorage(proxyAddress, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',));
  //console.log(typeof(target));
  return target;
}

