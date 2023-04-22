import { isAddress } from "ethers";
import useSWR from "swr";
import { AddressInfo, ErrorMessage } from "../pages/api/address/info";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useAddressInfo(
  address: string | undefined,
  chainId: number | string | undefined
) {
  const isValidParam = address && chainId && isAddress(address);

  return useSWR<AddressInfo, ErrorMessage>(
    isValidParam ? `/api/address/info?address=${address}&chainId=${chainId}` : null,
    fetcher
  );
}
