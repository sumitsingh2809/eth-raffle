import { ethers, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const FRONT_END_ABI_FILE = path.join(__dirname, "../../", "frontend/constants/abi.json");
const FRONT_END_ADDRESSES_FILE = path.join(__dirname, "../../", "frontend/constants/contractAddresses.json");

const updateFrontend: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!process.env.UPDATE_FRONT_END) {
    return;
  }

  console.log("updating frontend");

  const { deployments } = hre;
  const { log } = deployments;
  const chainId = network.config.chainId?.toString();
  if (!chainId) return;

  const raffleDeployment = await deployments.get("Raffle");
  const raffle = await ethers.getContractAt("Raffle", raffleDeployment.address);
  const raffleAddress = await raffle.getAddress();

  const currentAbi = JSON.parse(readFileSync(FRONT_END_ABI_FILE, "utf-8"));
  const currentAddresses = JSON.parse(readFileSync(FRONT_END_ADDRESSES_FILE, "utf-8"));

  log({ currentAbi, currentAddresses });

  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(raffleAddress)) {
      currentAddresses[chainId].push(raffleAddress);
    }
  } else {
    currentAddresses[chainId] = [raffleAddress];
  }

  writeFileSync(FRONT_END_ABI_FILE, raffle.interface.formatJson(), "utf8");
  writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses), "utf8");
};

updateFrontend.tags = ["all", "frontend"];

export default updateFrontend;
