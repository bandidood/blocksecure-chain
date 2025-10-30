const hre = require("hardhat");

async function main() {
  console.log("Deploying SecurityOracle contract...");

  const SecurityOracle = await hre.ethers.getContractFactory("SecurityOracle");
  const securityOracle = await SecurityOracle.deploy();

  await securityOracle.waitForDeployment();

  const address = await securityOracle.getAddress();
  console.log(`SecurityOracle deployed to: ${address}`);

  // Wait for a few block confirmations
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await securityOracle.deploymentTransaction().wait(5);

    console.log("Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
