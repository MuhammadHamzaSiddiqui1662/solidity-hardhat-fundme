import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import verify from '../utils/verify';

const deployFundMe = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId!;

  let ethUsdPriceFeedAddress: string;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  }
  else {
    ethUsdPriceFeedAddress = networkConfig[network.name]["ethUsdPriceFeedAddress"]!;
  }
  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmationNumber
  })
  log("--------------------------------")

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args)
  }
}

export default deployFundMe;
deployFundMe.tags = ["all", "fund-me"]