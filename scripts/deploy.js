const hre = require("hardhat");
async function main() {
  const net = hre.network.name;
  if (net === "hashkeyMainnet" && process.env.CONFIRM_MAINNET !== "yes") throw new Error("Set CONFIRM_MAINNET=yes (after Nico approves) to broadcast on mainnet");
  const [d] = await hre.ethers.getSigners();
  const oracle = process.env.ORACLE_ADDRESS || d.address;
  console.log("network", net, "deployer", d.address, "oracle", oracle);
  const c = await hre.ethers.deployContract("MatchEscrow", [oracle]);
  await c.waitForDeployment();
  console.log("MatchEscrow deployed:", await c.getAddress());
}
main().catch(e => { console.error(e); process.exit(1); });
