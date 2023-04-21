import { isAddress } from "ethers";
import useSWR from "swr";
import { AddressInfo, ErrorMessage } from "../pages/api/address/info";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useAddressInfo(address: string) {
  const chainId = 42161; // TODO: use web3 provider or config
  const isValidAddress = isAddress(address);

  return useSWR<AddressInfo, ErrorMessage>(
    isValidAddress ? `/api/address/info?address=${address}&chainId=${chainId}` : null,
    fetcher
  );
}
