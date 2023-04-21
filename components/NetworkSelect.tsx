import { CHAIN_INFO, ChainId } from "../lib/network";

export default function NetworkSelect({
  chainId,
  setChainId,
}: {
  chainId: ChainId;
  setChainId: (chainId: ChainId) => void;
}) {
  const icon_options = Object.keys(CHAIN_INFO).map((k) => {
    return (
      <NetworkIcon
        key={k}
        chainId={k}
        isSelected={chainId == k}
        onClick={() => setChainId(k)}
      />
    );
  });

  return (
    <div className="flex flex-row gap-1">
      <span className="text-xs">Network:</span>
      {icon_options}
    </div>
  );
}

export function NetworkIcon({
  chainId,
  isSelected = false,
  className,
  ...rest
}: {
  chainId: ChainId;
  isSelected?: boolean;
  className?: string;
  onClick?: any;
}) {
  return (
    <img
      src={CHAIN_INFO[chainId].logo}
      className={`w-4 h-4 ${isSelected && "border border-blue-500"} ${className}`}
      {...rest}
      alt={CHAIN_INFO[chainId].chainName}
    />
  );
}
