import { NextApiRequest, NextApiResponse } from "next";
import * as api from "@furucombo/composable-router-api";
import * as common from "@furucombo/composable-router-common";
import { Wallet } from "ethers";
import { providerHandler } from "../../../lib/network";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === "OPTIONS") {
    return res.status(200); // CORS
  }

  if (req.method !== "POST") return res.status(501);

  const { sourceToken, destinationToken, amount } = req.body;

  const chainId = common.ChainId.mainnet;

  const pKey = process.env.DEMO_WALLET;
  if (!pKey) {
    throw new Error("No private key found");
  }
  const wallet = new Wallet(pKey);
  const provider = await providerHandler(chainId);

  const signer = wallet.connect(provider);

  const USDC = {
    chainId: 1,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
  };
  const WBTC = {
    chainId: 1,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 8,
    symbol: "WBTC",
    name: "Wrapped BTC",
  };

  const WETH = {
    chainId: 1,
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 18,
    symbol: "WETH",
    name: "Wrapped ETH",
  };

  const swapQuotation = await api.protocols.uniswapv3.getSwapTokenQuotation(chainId, {
    input: { token: USDC, amount: "1000" },
    tokenOut: WBTC,
  });

  const swapLogic = api.protocols.uniswapv3.newSwapTokenLogic(swapQuotation);

  const routerData: api.RouterData = {
    chainId,
    account: signer.address,
    logics: [swapLogic],
    slippage: 100, // 1%
  };

  const estimateResult = await api.estimateRouterData(routerData);

  res.status(200).json(estimateResult);
  //   for (const approval of estimateResult.approvals) {
  //     const tx = await signer.sendTransaction(approval);
  //   }
  //   const permitSig = await signer._signTypedData(
  //     permitData.domain,
  //     permitData.types,
  //     permitData.values
  //   );

  //   routerData.permitData = estimateResult.permitData;
  //   routerData.permitSig = permitSig;
}
