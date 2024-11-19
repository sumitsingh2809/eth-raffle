import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";

const deployRaffle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();
  const isDevelopmentChain = developmentChains.includes(network.name);

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: [],
    log: true,
    ...(!isDevelopmentChain && { waitConfirmations: 6 }),
  });
};

deployRaffle.tags = ["all", "Raffle"];

export default deployRaffle;
