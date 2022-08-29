import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DECIMALS, developmentChains, INITIAL_ANSWER } from '../helper-hardhat-config';

const deployMocks = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("Local Network Detected! Deploying Mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true
    })
    log("Mocks Deployed!");
    log("----------------------------------------")
  }
}

export default deployMocks;
deployMocks.tags = ["all", "mocks"]