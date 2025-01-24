import { deployments, ethers, getNamedAccounts } from "hardhat";

async function enterRaffle() {
  const { deployer } = await getNamedAccounts();
  const raffleDeployment = await deployments.get("Raffle");
  const raffle = await ethers.getContractAt("Raffle", raffleDeployment.address, await ethers.getSigner(deployer));
  const entranceFee = await raffle.getEntranceFee();

  const tx = await raffle.enterRaffle({ value: entranceFee });
  await tx.wait(1);

  console.log("Entered", tx.hash);
}

enterRaffle()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
