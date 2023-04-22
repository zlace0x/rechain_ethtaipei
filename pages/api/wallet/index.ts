import { NextApiRequest, NextApiResponse } from "next";
import * as api from "@furucombo/composable-router-api";
import * as common from "@furucombo/composable-router-common";
import { TransactionRequest, Wallet } from "ethers";
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

  const { sourceToken, targetToken, amount } = req.body;

  if (!validateParams(sourceToken, targetToken, amount)) {
    throw new Error("Invalid params");
  }

  const chainId = common.ChainId.mainnet;

  const provider = await providerHandler(chainId);

  const signer = wallet.connect(provider);

  const swapQuotation = await api.protocols.uniswapv3.getSwapTokenQuotation(chainId, {
    input: { token: SUPPORTED_TOKENS[sourceToken as SupportedTokens], amount: amount },
    tokenOut: SUPPORTED_TOKENS[targetToken as SupportedTokens],
  });

  const swapLogic = api.protocols.uniswapv3.newSwapTokenLogic(swapQuotation);

  const routerData: api.RouterData = {
    chainId,
    account: signer.address,
    logics: [swapLogic],
    slippage: 100, // 1%
  };

  const estimateResult = await api.estimateRouterData(routerData);

  //   res.status(200).json(estimateResult);

  console.log("estimateResult", estimateResult);
  const approval_txs = [];
  for (const approval of estimateResult.approvals) {
    console.log("sending approval");
    const tx = await signer.sendTransaction(approval as TransactionRequest);
    console.log("approval tx", tx.hash);
    approval_txs.push(tx.hash);
  }

  if (estimateResult.permitData) {
    const permitData = estimateResult.permitData;
    console.log("permitData", permitData);
    const permitSig = await signer.signTypedData(
      permitData.domain as any,
      permitData.types,
      permitData.values
    );

    routerData.permitData = estimateResult.permitData;
    routerData.permitSig = permitSig;
  }

  const transactionRequest = await api.buildRouterTransactionRequest(routerData);

  const tx = await signer.sendTransaction(transactionRequest as TransactionRequest);

  res.status(200).json({
    approval_txs,
    hash: tx.hash,
  });
}

function validateParams(source: string, target: string, amount: string): boolean {
  if (!source || !target || !amount) {
    return false;
  }

  if (!(source in SUPPORTED_TOKENS)) return false;
  if (!(target in SUPPORTED_TOKENS)) return false;

  return true;
}
