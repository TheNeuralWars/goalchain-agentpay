require("@nomicfoundation/hardhat-toolbox");
const accounts = process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [];
module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    hashkeyTestnet: { url: process.env.HSK_TESTNET_RPC || "https://testnet.hsk.xyz", chainId: 133, accounts },
    hashkeyMainnet: { url: process.env.HSK_MAINNET_RPC || "https://mainnet.hsk.xyz", chainId: 177, accounts },
  },
};
