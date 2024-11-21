import { assert, expect } from "chai";
import { EventLog } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { Address } from "hardhat-deploy/types";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { Raffle, VRFCoordinatorV2_5Mock } from "../../typechain-types";
import { RaffleInterface } from "../../typechain-types/Raffle";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let deployer: Address;
      let raffle: Raffle;
      let vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock;
      let raffleEntranceFee: bigint;
      let interval: bigint;
      let raffleInterface: RaffleInterface;
      // const raffleInterface = new ethers.Interface(raffle.interface.formatJson());
      const chainId = network.config.chainId!;
      const RaffleState = { OPEN: 0n, CALCULATING: 1n };

      beforeEach(async function () {
        await deployments.fixture(["all"]);

        deployer = (await getNamedAccounts()).deployer;
        const signer = await ethers.getSigner(deployer);

        const vrfCoordinatorV2_5MockDeployment = await deployments.get("VRFCoordinatorV2_5Mock");
        vrfCoordinatorV2_5Mock = await ethers.getContractAt(
          "VRFCoordinatorV2_5Mock",
          vrfCoordinatorV2_5MockDeployment.address,
          signer
        );

        const raffleDeployment = await deployments.get("Raffle");
        raffle = await ethers.getContractAt("Raffle", raffleDeployment.address, signer);
        raffleInterface = raffle.interface;

        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
      });

      describe("constructor", async () => {
        it("Initializes the raffle correctly", async () => {
          const raffleState = await raffle.getRaffleState();

          assert.equal(raffleState, RaffleState.OPEN);
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        });
      });

      describe("Enter Raffle", async () => {
        it("reverts when you don't pay enough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(raffle, "Raffle__NotEnoughETHEntered");
        });

        it("records players when they enter", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const playerFromContract = await raffle.getPlayer(0);

          assert.equal(playerFromContract, deployer);
        });

        it("emits event on enter", async () => {
          await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, "RaffleEnter");
          // const raffleInterface = raffle.interface;
          // const eventSignature = raffleInterface.getEvent("RaffleEnter");
        });

        it("doesn't allow entrance when raffle is calculating", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });

          // https://hardhat.org/hardhat-network/docs/reference
          await network.provider.send("evm_increaseTime", [+interval.toString() + 1]);
          await network.provider.send("evm_mine", []);

          // we pretend to be a chainlink keeper
          await raffle.performUpkeep("0x1234");

          await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWithCustomError(
            raffle,
            "Raffle__NotOpen"
          );
        });
      });

      describe("checkUpKeep", async () => {
        it("returns false if people haven't sent any ETH", async () => {
          await network.provider.send("evm_increaseTime", [+interval.toString() + 1]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await raffle.checkUpkeep("0x");

          assert(!upkeepNeeded);
        });

        it("returns false if raffle isn't open", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [+interval.toString() + 1]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep("0x1234");

          const raffleState = await raffle.getRaffleState();
          const { upkeepNeeded } = await raffle.checkUpkeep("0x");

          assert.equal(raffleState, RaffleState.CALCULATING);
          assert.equal(upkeepNeeded, false);
        });

        it("returns false if enough time hasn't passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [+interval.toString() - 2]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await raffle.checkUpkeep("0x");
          assert.equal(upkeepNeeded, false);
        });

        it("returns true if enough time has passed, has players, and is open", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [+interval.toString() + 1]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await raffle.checkUpkeep("0x");
          assert.equal(upkeepNeeded, true);
        });
      });

      describe("performUpKeep", async () => {
        it("it can only run if checkUpKeep is true", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [+interval.toString() + 1]);
          await network.provider.send("evm_mine", []);

          const tx = await raffle.performUpkeep("0x");
          assert(tx);
        });

        it("it reverts if checkUpkeep is false", async () => {
          await expect(raffle.performUpkeep("0x")).to.be.revertedWithCustomError(raffle, "Raffle__UpkeepNotNeeded");
        });

        it("it updates the raffle state, emits event, and calls the vrf coordinator", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [+interval.toString() + 1]);
          await network.provider.send("evm_mine", []);

          const tx = await raffle.performUpkeep("0x");
          const receipt = await tx.wait(1);
          const raffleState = await raffle.getRaffleState();

          const log = receipt?.logs.find(
            (log) => raffleInterface.parseLog(log)?.name === raffleInterface.getEvent("RequestedRaffleWinner")!.name
          ) as EventLog;

          const requestId = log.args["requestId"];

          expect(requestId).to.be.greaterThan(0);
          assert.equal(raffleState, RaffleState.CALCULATING);
        });
      });

      describe("fulfillRandomWords", () => {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [+interval.toString() + 1]);
          await network.provider.send("evm_mine", []);
        });

        it("can only be called after performUpKeep", async () => {
          await expect(
            vrfCoordinatorV2_5Mock.fulfillRandomWords(0, await raffle.getAddress())
          ).to.be.revertedWithCustomError(vrfCoordinatorV2_5Mock, "InvalidRequest");

          await expect(
            vrfCoordinatorV2_5Mock.fulfillRandomWords(1, await raffle.getAddress())
          ).to.be.revertedWithCustomError(vrfCoordinatorV2_5Mock, "InvalidRequest");
        });

        it("picks a winner, resets the lottery, and sends money", async () => {
          const additionalEntrants = 3n;
          const startingAccountIndex = 1; // since deployer = 0
          const accounts = await ethers.getSigners();

          // console.log("account", accounts[0].address);
          for (let i = startingAccountIndex; i < startingAccountIndex + +additionalEntrants.toString(); i++) {
            const account = accounts[i];
            // console.log("account", account.address);
            const raffleConnectedAccount = raffle.connect(account);

            await raffleConnectedAccount.enterRaffle({ value: raffleEntranceFee });
          }

          const startingTimeStamp = await raffle.getLatestTimeStamp();
          // performUpKeep (mock being chainlink keeper)
          // fulfillRandomWords (mock being chainlink VRF)
          // In testnet, we will have to wait for the "fulfillRandomWords" to be called
          await new Promise(async (resolve, reject) => {
            // raffle.once("WinnerPicked", () => {});
            raffle.once(raffle.filters.WinnerPicked(), async (winner) => {
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const endingTimeStamp = await raffle.getLatestTimeStamp();
                const numPlayers = await raffle.getNumberOfPlayers();
                const winnerEndingBalance = await ethers.provider.getBalance(accounts[1]);

                // console.log({ recentWinner, winnerEndingBalance });
                assert.equal(numPlayers, 0n);
                assert.equal(raffleState, RaffleState.OPEN);
                assert(endingTimeStamp > startingTimeStamp);
                assert.equal(
                  winnerEndingBalance,
                  winnerStartingBalance + raffleEntranceFee * additionalEntrants + raffleEntranceFee
                );
              } catch (err) {
                reject(err);
              }
              resolve(winner);
            });

            const tx = await raffle.performUpkeep("0x");
            const receipt = await tx.wait(1);

            const log = receipt?.logs.find(
              (log) => raffleInterface.parseLog(log)?.name === raffleInterface.getEvent("RequestedRaffleWinner")!.name
            ) as EventLog;
            const requestId = log.args["requestId"];

            const winnerStartingBalance = await ethers.provider.getBalance(accounts[1]);
            // console.log({ winnerStartingBalance });
            await vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, await raffle.getAddress());
            // await expect(vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, raffleAddress))
            //   .to.emit(vrfCoordinatorV2_5Mock, "RandomWordsFulfilled")
            //   .withArgs(requestId);
          });
        });
      });
    });
