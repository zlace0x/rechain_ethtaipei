import { ActionNodeData, ActionType } from "../components/ActionNode";
import { FuruResponseData } from "../pages/api/wallet/furuswap";

export default function useAction() {
  return {
    runAction: (actionData: ActionNodeData) => {
      if (!actionData.isValid)
        throw new Error(`Action ${actionData.actionType} is not valid`);
      if (actionData.actionType === ActionType.FURU_UNISWAP) {
        return postFuruAPI(actionData.actionParams);
      }

      if (actionData.actionType === ActionType.ETH_TRANSFER) {
        return postEthTransfer(actionData.actionParams);
      }
    },
  };
}

async function postFuruAPI(actionParams: any): Promise<any> {
  const response = await fetch("/api/wallet/furuswap", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceToken: actionParams.sourceToken,
      targetToken: actionParams.targetToken,
      amount: actionParams.amount,
      isSimulated: false,
    }),
  });
  const result: FuruResponseData = await response.json();
  return {
    success: !!result,
    result,
    hash: result.hash,
    log: result.approval_txs,
  };
}

async function postEthTransfer(actionParams: any) {
  throw new Error("Not implemented yet");
  //   const response = await fetch("/api/wallet", {
  //     method: "POST", // or 'PUT'
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       to: actionParams.to,
  //       amount: actionParams.amount,
  //     }),
  //   });
  //   return response.json();
}
