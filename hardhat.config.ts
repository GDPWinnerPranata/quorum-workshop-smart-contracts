import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig, task } from "hardhat/config";
import { getNode } from "./src/scripts/helper/node";
import { getSimpleCounterValue } from "./src/scripts/read-counter";

task("readCounter", "Read counter on simpleCounter contract address")
  .addPositionalParam("contractAddress")
  .setAction(async (taskArgs) => {
    const { contractAddress } = taskArgs;
    await getSimpleCounterValue(contractAddress);
  });

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
