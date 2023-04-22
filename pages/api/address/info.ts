import { isAddress, JsonRpcProvider, Provider } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { ChainId, PRIVATE_RPC, SupportedChainId } from "../../../lib/network";

export type AddressInfo = {
  address: string;
  isContract: boolean;
  abi?: string;
  name?: string;
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

  const provider = await providerHandler(chainId as string);

  const isContract = await hasContractCode(provider, address as string);
  const info: AddressInfo = {
    address: address as string,
    isContract,
  };

  if (isContract) {
    // TODO: add erc20 detection and get name
    let contractInfo = await getContractInfo(address as string, chainId as string);
    if (contractInfo?.isProxy) {
      contractInfo = await getContractInfo(
        contractInfo.implementation,
        chainId as string
      );
    }
    info.abi = contractInfo?.abi;
    info.name = contractInfo?.name;
  }

  return res.status(200).json(info);
}

async function getContractInfo(address: string, chainId: string) {
  let fetchUrl = "";
  console.log("[info.ts] chainId is: ", chainId);
  switch (chainId) {
    case SupportedChainId.GNOSIS.toString(): {
      fetchUrl = `https://api.gnosisscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.GNOSISSCAN_API_KEY}`;
      break;
    }
    default: {
      fetchUrl = `https://api.arbiscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.ARBISCAN_API_KEY}`;
    }
  }
  const response = await fetch(fetchUrl);
  const data = await response.json();
  if (data.status !== "1") return null;
  const result = data.result[0];
  console.log("Contract info of " + fetchUrl, result);
  return {
    abi: result.ABI,
    name: result.ContractName,
    isProxy: result.Proxy == "1" && !!result.Implementation,
    implementation: result.Implementation,
  };
}

const BEACON_PROXY_STORAGE_SLOTS = {
  implementation: 1,
  admin: 2,
  pendingAdmin: 3,
};

async function getTransparentProxy(
  proxyAddress: string,
  provider: Provider
): Promise<string> {
  const target = ethers.toBeHex(
    await provider.getStorage(
      proxyAddress,
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    )
  );

  return target;
}

async function providerHandler(chainId: ChainId) {
  if (!(chainId in PRIVATE_RPC)) throw new Error("Invalid chainId");

  let url = PRIVATE_RPC[chainId];
  return new JsonRpcProvider(url);
}

export async function getGnosisLog(
  contract:string
  ){
    let result
    let isFetching = true
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      "method": "eth_getLogs",
      "params": [
        {
          "toBlock":"latest",
          "fromBlock":"earliest",
          "address": contract
        }
      ],
      "id": 1,
      "jsonrpc": "2.0"
    });

    let requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    await fetch("https://intensive-polished-gas.xdai.quiknode.pro/4bd2790c7745c2d9231c55d9a9dd86c06c77dee2/", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log('[useContractEvents.ts] Gnosis data: ', result)
      result = result
      isFetching = false
    })
    .catch(error => {
      console.log('[useContractEvents.ts] error:  ', error)
      result = error
      isFetching = false
    });
    return {result, isFetching}
}
