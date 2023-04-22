import { isAddress } from "ethers";
import useSWR from "swr";
import { ErrorMessage } from "../pages/api/contract/info";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useLogEvents(address: string, chainId: number | string) {
  console.log('[useLogEvents] chainId: ', chainId)
  const isValidAddress = isAddress(address);

  return useSWR<ErrorMessage>(
    isValidAddress ? `/api/contract/info?address=${address}&chainId=${chainId}` : null,
    fetcher
  );
}
