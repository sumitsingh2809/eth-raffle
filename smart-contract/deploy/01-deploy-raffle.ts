import { EventLog } from "ethers";
import { ethers, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { VRFCoordinatorV2_5Mock } from "../typechain-types";
import { verify } from "../utils/verify";

const deployRaffle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();
  const isDevelopmentChain = developmentChains.includes(network.name);
  const chainId = network.config.chainId;
  if (!chainId) throw new Error("ChainId not defined");

  let vrfCoordinatorAddress: string;
  let subscriptionId: string;
  let vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock;
  if (isDevelopmentChain) {
    const vrfCoordinatorV2_5MockDeployment = await deployments.get("VRFCoordinatorV2_5Mock");
    vrfCoordinatorAddress = vrfCoordinatorV2_5MockDeployment.address;

    // creating subscription programmatically
    // https://docs.chain.link/vrf/v2-5/subscription/test-locally
    vrfCoordinatorV2_5Mock = await ethers.getContractAt("VRFCoordinatorV2_5Mock", vrfCoordinatorAddress);
    const createSubscriptionTxn = await vrfCoordinatorV2_5Mock.createSubscription();
    const createSubscriptionReceipt = await createSubscriptionTxn.wait(1);
    if (!createSubscriptionReceipt) throw new Error("createSubscriptionReceipt not found");
    const subscriptionCreatedEvent = createSubscriptionReceipt.logs[0] as EventLog;
    subscriptionId = subscriptionCreatedEvent.args["subId"];

    // Fund Subscription
    const VRF_SUB_FUND_AMOUNT = ethers.parseEther("100");
    await vrfCoordinatorV2_5Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
  } else {
    vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  const entranceFee = networkConfig[chainId]["entranceFee"];
  const keyHash = networkConfig[chainId]["keyHash"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const interval = networkConfig[chainId]["interval"];
  const args = [vrfCoordinatorAddress, entranceFee, keyHash, subscriptionId, callbackGasLimit, interval];

  // Deploy Contract
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[chainId]["waitConfirmations"],
  });

  // Add Consumer
  if (isDevelopmentChain) {
    await vrfCoordinatorV2_5Mock!.addConsumer(subscriptionId, raffle.address);
    log("Added Consumer to mock:", raffle.address);
  }

  // Verify Contract
  if (!isDevelopmentChain && process.env.ETHERSCAN_API_KEY) {
    await verify(raffle.address, args);
  }

  log("Raffle deployed!");
  log("------------------------------------------------------------------------------------------");
};

deployRaffle.tags = ["all", "Raffle"];

export default deployRaffle;
