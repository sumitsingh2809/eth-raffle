import { run } from "hardhat";

const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying Contract...");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });

    console.log("Contract Verified.");
  } catch (err) {
    console.log(err);
  }
};

export { verify };
