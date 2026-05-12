import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("Deploying with:", deployer.address);
  console.log("ChainId:", network.chainId.toString());

  const initialVersion = process.env.INITIAL_VERSION ?? "1.0.0";
  const BscEnrollment = await hre.ethers.getContractFactory("BscEnrollment");

  const proxy = await hre.upgrades.deployProxy(
    BscEnrollment,
    [deployer.address, initialVersion],
    {
      kind: "uups",
      initializer: "initialize",
    }
  );

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("");
  console.log("========== Deployment ==========");
  console.log("Implementation (logic):", implementationAddress);
  console.log("Proxy (user-facing):   ", proxyAddress);
  console.log("================================");
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
