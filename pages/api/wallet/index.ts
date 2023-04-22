import { NextApiRequest, NextApiResponse } from "next";
import * as common from "@furucombo/composable-router-common";
import { Wallet, isAddress } from "ethers";
import { providerHandler } from "../../../lib/network";

const SUPPORTED_TOKENS = {
  USDC: {
    chainId: 1,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
  },
  WBTC: {
    chainId: 1,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 8,
    symbol: "WBTC",
    name: "Wrapped BTC",
  },
  ETH: {
    chainId: 1,
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    symbol: "ETH",
    name: "Ethereum",
  },
  WETH: {
    chainId: 1,
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 18,
    symbol: "WETH",
    name: "Wrapped ETH",
  },
};

type SupportedTokens = keyof typeof SUPPORTED_TOKENS;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === "OPTIONS") {
    return res.status(200); // CORS
  }

  const pKey = process.env.DEMO_WALLET;
  if (!pKey) {
    throw new Error("No private key found");
  }
  const wallet = new Wallet(pKey);

  if (req.method == "GET") {
    res.status(200).json({ address: wallet.address });
    return;
  }

  if (req.method !== "POST") return res.status(501);

  const { to, amount } = req.body;

  if (!validateParams(to, amount)) {
    throw new Error("Invalid params");
  }

  const chainId = common.ChainId.mainnet;

  const provider = await providerHandler(chainId);

  const signer = wallet.connect(provider);

  const tx = await signer.sendTransaction({ to: to, value: amount });

  res.status(200).json({
    hash: tx.hash,
  });
}

function validateParams(to: string, amount: string): boolean {
  if (!isAddress(to)) return false;
  if (!amount || amount.indexOf(".") != -1) return false;

  return true;
}
