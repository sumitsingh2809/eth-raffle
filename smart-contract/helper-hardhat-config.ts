import { Address } from "hardhat-deploy/types";

type NetworkConfig = {
  [key: number]: {
    name: string;
    vrfCoordinatorV2: Address;
  };
};

const networkConfig: NetworkConfig = {
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B", // https://vrf.chain.link/sepolia
  },
  137: {
    name: "polygon",
    vrfCoordinatorV2: "0xec0Ed46f36576541C75739E915ADbCb3DE24bD77", // https://vrf.chain.link/polygon
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 2000_00000000;

export { DECIMALS, developmentChains, INITIAL_ANSWER, networkConfig };
