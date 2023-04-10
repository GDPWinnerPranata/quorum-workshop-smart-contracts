import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/config";
import { getNode } from "./src/scripts/helper/node";
import "./src/tasks";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  paths: {
    sources: "./src/contracts",
    tests: "./src/test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "quorum",
  networks: {
    quorum: {
      url: getNode().httpUrl,
      accounts: [getNode().accountPrivateKey],
    },
  },
};

export default config;
