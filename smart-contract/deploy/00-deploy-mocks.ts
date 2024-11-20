import "dotenv/config";
import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";

// https://docs.chain.link/vrf/v2-5/subscription/test-locally
const BASE_FEE = "100000000000000000";
const GAS_PRICE_LINK = "1000000000";
const WEI_PER_UNIT_LINK = "4808513758349524";

const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const chainId = network.config.chainId;
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;

  const { deployer, tokenOwner } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");

    await deploy("VRFCoordinatorV2_5Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINK, WEI_PER_UNIT_LINK],
      log: true,
    });

    log("Mocks deployed!");
    log("------------------------------------------------------------------------------------------");
  }
};

deployMocks.tags = ["all", "mocks"];

export default deployMocks;
