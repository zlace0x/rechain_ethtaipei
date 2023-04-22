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

  const provider = await providerHandler(chainId);
  console.log('[info.ts] provider is: ', provider)
  const isContract = await hasContractCode(provider, address as string);
  const info: AddressInfo = {
    address: address as string,
    isContract,
  };
  if (isContract) {
    info.contractABI = await getContractABI(address as string, chainId as string);
  }

  return res.status(200).json(info);
}

async function getContractABI(address: string, chainId: string) {
  let fetchUrl = ""
  // console.log('[info.ts] chainId is: ', chainId)
  // console.log('[info.ts] address is: ', address)
  switch(chainId){
    case "100":{
      console.log('[info.ts] chainId is: ', 100)
      fetchUrl = `https://api.gnosisscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.GNOSISSCAN_API_KEY}`
      break
    }
    default:{
      console.log('[info.ts] chainId is: ', 0)
      fetchUrl = `https://api.arbiscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ARBISCAN_API_KEY}`
    }
  }
  const response = await fetch(
    fetchUrl
  );
  const data = await response.json();
  // console.log('[info.ts] getContractABI is: ', data)
  if (data.status !== "1") return null;
  return data.result;
}

async function providerHandler(chainId: any){
  if(chainId === '100'){
    let url = process.env.QUICKNODE_PROVIDER;
    var customHttpProvider = new JsonRpcProvider(url);
    customHttpProvider.getBlockNumber().then((result) => {
        console.log("Current block number: " + result);
    });
    return customHttpProvider;
  }
  else {
    var provider = new InfuraProvider(
      parseInt(chainId as string),
      process.env.INFURA_API_KEY
    );
    return provider;
  }

}