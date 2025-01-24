import { ethers } from "hardhat";

type NetworkConfig = {
  [key: number]: {
    name: string;
    vrfCoordinatorV2: string;
    entranceFee: bigint;
    keyHash: string;
    subscriptionId: string;
    callbackGasLimit: string;
    interval: string;
    waitConfirmations: number;
  };
};

const networkConfig: NetworkConfig = {
  31337: {
    name: "hardhat",
    vrfCoordinatorV2: "",
    entranceFee: ethers.parseEther("0.01"),
    keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    subscriptionId: "",
    callbackGasLimit: "500000",
    interval: "30",
    waitConfirmations: 1,
  },
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B", // https://vrf.chain.link/sepolia
    entranceFee: ethers.parseEther("0.01"),
    keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae", // https://docs.chain.link/vrf/v2-5/supported-networks#configurations
    subscriptionId: "56632358460561774273725512224055215542271065813915521748028300346501978426517",
    callbackGasLimit: "500000",
    interval: "30",
    waitConfirmations: 6,
  },
  // 137: {
  //   name: "polygon",
  //   vrfCoordinatorV2: "0xec0Ed46f36576541C75739E915ADbCb3DE24bD77", // https://vrf.chain.link/polygon
  //   entranceFee: ethers.parseEther("0.01"),
  // },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 2000_00000000;

export { DECIMALS, developmentChains, INITIAL_ANSWER, networkConfig };
