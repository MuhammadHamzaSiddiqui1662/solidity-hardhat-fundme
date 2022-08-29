export interface NetworkConfigInfo {
  [key: string]: NetworkConfigItem
}

export interface NetworkConfigItem {
  chainId?: number,
  ethUsdPriceFeedAddress?: string,
  blockConfirmationNumber?: number
}

// All ETH / USD Address
// https://docs.chain.link/docs/ethereum-addresses/
export const networkConfig: NetworkConfigInfo = {
  goerli: {
    chainId: 5,
    ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    blockConfirmationNumber: 6
  },
  rinkby: {
    chainId: 4,
    ethUsdPriceFeedAddress: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    blockConfirmationNumber: 6
  },
  hardhat: {
    blockConfirmationNumber: 1
  }
}

export const developmentChains = ["hardhat", "localhost"];

export const DECIMALS = 8;

export const INITIAL_ANSWER = 200000000000; 