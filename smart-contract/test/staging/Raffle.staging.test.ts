import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { Address } from "hardhat-deploy/types";
import { developmentChains } from "../../helper-hardhat-config";
import { Raffle } from "../../typechain-types";
import { RaffleInterface } from "../../typechain-types/Raffle";

/**
 * 1. Get subId for Chainlink VRF
 * 2. Deploy Raffle Contract using subId
 * 3. Register Raffle Contract with Chainlink VRF & its subId
 * 4. Register Raffle Contract with Chainlink Automation
 * 5. Run staging test
 */

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let deployer: Address;
      let raffle: Raffle;
      let raffleEntranceFee: bigint;
      let interval: bigint;
      let raffleInterface: RaffleInterface;
      const RaffleState = { OPEN: 0n, CALCULATING: 1n };

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;

        raffle = await ethers.getContractAt(
          "Raffle",
          (
            await deployments.get("Raffle")
          ).address,
          await ethers.getSigner(deployer)
        );
        raffleInterface = raffle.interface;
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
      });

      describe("fulfillRandomWords", () => {
        it("works with live Chainlink automation and Chainlink VRF, we get a random winner", async () => {
          const startingTimeStamp = await raffle.getLatestTimeStamp();

          await new Promise((resolve, reject) => {
            raffle.once(raffle.filters.WinnerPicked(), async () => {
              console.log("WinnerPicked event fired!");
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const endingTimestamp = await raffle.getLatestTimeStamp();
                const winnerEndingBalance = await ethers.provider.getBalance(deployer);

                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner, deployer);
                assert.equal(raffleState, RaffleState.OPEN);
                assert(endingTimestamp > startingTimeStamp);
                assert.equal(winnerEndingBalance, winnerStartingBalance + raffleEntranceFee);
                resolve("");
              } catch (err) {
                console.log(err);
                reject(err);
              }
            });
          });

          await raffle.enterRaffle({ value: raffleEntranceFee });
          const winnerStartingBalance = await ethers.provider.getBalance(deployer);
        });
      });
    });
