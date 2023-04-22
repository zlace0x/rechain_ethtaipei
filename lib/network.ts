export type ChainId = number | string;

export enum SupportedChainId {
  FURU_MAINNET = 1,
  GOERLI = 5,
  //   POLYGON = 137,
  //   POLYGON_MUMBAI = 80001,
  ARBITRUM_ONE = 42161,
  GNOSIS = 100,
  //   ARBITRUM_GOERLI = 421613,
  //   OPTIMISM = 10,
  //   OPTIMISM_GOERLI = 420,
  //   AVALANCHE = 43114,
  //   BSC = 56,
}

export const CHAIN_INFO: Record<ChainId, any> = {
  [SupportedChainId.FURU_MAINNET]: {
    chainId: 1,
    docs: "https://ethereum.org/en/developers/docs/",
    explorer: "https://ethtaipei-node.furucombo.app/",
    openSea: "https://opensea.io/assets/ethereum/",
    label: "FuruEthereum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    logo: "furu_icon.png",
    chainName: "furufork_mainnet",
    disabled: false,
    rpcUrls: ["https://ethtaipei-node.furucombo.app/node"],
  },
  [SupportedChainId.GOERLI]: {
    chainId: 5,
    docs: "https://docs.uniswap.org/",
    explorer: "https://goerli.etherscan.io/",
    openSea: "https://testnets.opensea.io/assets/goerli/",
    infoLink: "https://info.uniswap.org/#/",
    label: "Görli",
    chainName: "goerli",
    swapLink: "https://app.uniswap.org/#/swap?",
    nativeCurrency: { name: "Görli Ether", symbol: "görETH", decimals: 18 },
    logo: "/eth_goerli.png",
    disabled: false,
    rpcUrls: [`https://rpc.ankr.com/eth_goerli`],
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    chainId: 42161,
    docs: "https://docs.uniswap.org/",
    explorer: "https://arbiscan.io/",
    infoLink: "https://info.uniswap.org/#/",
    label: "Arbitrum",
    swapLink: "https://app.uniswap.org/#/swap?",
    nativeCurrency: { name: "AEther", symbol: "AETH", decimals: 18 },
    logo: "/arbitrum_logo.svg",
    chainName: "arbitrum_one",
    disabled: false,
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
  },
  [SupportedChainId.GNOSIS]: {
    chainId: 100,
    explorer: "https://gnosisscan.io/",
    label: "Gnosis",
    nativeCurrency: { name: "xDAI", symbol: "xDAI", decimals: 18 },
    logo: "/gnosis.webp",
    chainName: "gnosis_chain",
    disabled: false,
    rpcUrls: ["https://rpc.gnosischain.com/"],
  },
};

export const PRIVATE_RPC = {
  [SupportedChainId.GNOSIS]: process.env.QN_GNOSIS_RPC,
  [SupportedChainId.ARBITRUM_ONE]: process.env.QN_ARBITRUM_RPC,
  [SupportedChainId.GOERLI]: process.env.QN_GOERLI_RPC,
  [SupportedChainId.FURU_MAINNET]: "https://ethtaipei-node.furucombo.app/node",
};
