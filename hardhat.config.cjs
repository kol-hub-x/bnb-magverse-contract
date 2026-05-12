require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

// Etherscan multichain API v2：apiKey 必须是「单个字符串」。
// 若为对象（按网络分 key），插件会走各站点的 V1 /api，BscScan 已弃用 V1 → 报 deprecated。
// 见 @nomicfoundation/hardhat-verify internal/etherscan.js（typeof apiKey === "string" 才走 v2）。
const etherscanApiKey =
  (process.env.ETHERSCAN_API_KEY && process.env.ETHERSCAN_API_KEY.trim()) ||
  (process.env.BSCSCAN_API_KEY && process.env.BSCSCAN_API_KEY.trim()) ||
  "";

// 若你所在网络访问 api.etherscan.io 经常超时，可设 DISABLE_ETHERSCAN_VERIFY=true，
// 仅用 Sourcify 完成「源码可复现」验证；BscScan 页面上的 Verified 徽章可能仍需在能访问 Etherscan API 的环境提交一次。
const disableEtherscanVerify =
  String(process.env.DISABLE_ETHERSCAN_VERIFY || "").toLowerCase() === "true";

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "shanghai",
    },
  },
  networks: {
    hardhat: {},
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL ?? "",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    bscMainnet: {
      url: process.env.BSC_MAINNET_RPC_URL ?? "",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: etherscanApiKey,
    enabled: !disableEtherscanVerify,
  },
  sourcify: {
    enabled: true,
  },
};
