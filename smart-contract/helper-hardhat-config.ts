type NetworkConfig = {
  [key: number]: {
    name: string;
    ethUsdPriceFeed: string;
  };
};

const networkConfig: NetworkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 2000_00000000;

export { DECIMALS, INITIAL_ANSWER, developmentChains, networkConfig };
