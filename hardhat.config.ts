import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig, task } from "hardhat/config";
import { getNode } from "./src/scripts/helper/node";
import {
  addPrivateSimpleCounterValue,
  approveExtension,
  cancelExtension,
  deployPrivateSimpleCounter,
  extendContract,
  getActiveExtensionContracts,
} from "./src/scripts/private-tx-web3quorum";
import {
  addSimpleCounterValue as addSimpleCounterValueEthers,
  deploySimpleCounter as deploySimpleCounterEthers,
  getSimpleCounterValue as getSimpleCounterValueEthers,
  simulate as simulateEthers,
} from "./src/scripts/public-tx-ethers";
import {
  addSimpleCounterValue as addSimpleCounterValueWeb3,
  deploySimpleCounter as deploySimpleCounterWeb3,
  getSimpleCounterValue as getSimpleCounterValueWeb3,
  simulate as simulateWeb3,
} from "./src/scripts/public-tx-web3";

// ======== Public Web3JS Tasks ========
task(
  "simulatePublicWeb3",
  "Simulates the whole public tranasction process using web3js"
).setAction(async () => await simulateWeb3());

task(
  "deploySimpleCounterPublicWeb3",
  "Deploys SimpleCounter contract publically using web3js"
).setAction(async () => await deploySimpleCounterWeb3());

task(
  "getSimpleCounterValuePublicWeb3",
  "Gets counter value publically using web3js"
)
  .addPositionalParam("contractAddress")
  .setAction(
    async ({ contractAddress }) =>
      await getSimpleCounterValueWeb3(contractAddress)
  );

task(
  "addSimpleCounterValuePublicWeb3",
  "Adds counter value publically using web3js"
)
  .addPositionalParam("contractAddress")
  .addPositionalParam("valueToAdd")
  .setAction(
    async ({ contractAddress, valueToAdd }) =>
      await addSimpleCounterValueWeb3(contractAddress, valueToAdd)
  );

// ======== Public EthersJS Tasks ========
task(
  "simulatePublicEthers",
  "Simulates the whole public tranasction process using EthersJS"
).setAction(async (_, hre) => await simulateEthers(hre));

task(
  "deploySimpleCounterPublicEthers",
  "Deploys SimpleCounter contract publically using EthersJS"
).setAction(async (_, hre) => await deploySimpleCounterEthers(hre));

task(
  "getSimpleCounterValuePublicEthers",
  "Gets counter value publically using EthersJS"
)
  .addPositionalParam("contractAddress")
  .setAction(
    async ({ contractAddress }, hre) =>
      await getSimpleCounterValueEthers(hre, contractAddress)
  );

task(
  "addSimpleCounterValuePublicEthers",
  "Adds counter value publically using EthersJS"
)
  .addPositionalParam("contractAddress")
  .addPositionalParam("valueToAdd")
  .setAction(
    async ({ contractAddress, valueToAdd }, hre) =>
      await addSimpleCounterValueEthers(hre, contractAddress, valueToAdd)
  );

// ======== Private Web3Quorum Tasks ========
task(
  "deploySimpleCounterPrivateWeb3Quorum",
  "Deploys SimpleCounter contract privately using Web3Quorum"
)
  .addVariadicPositionalParam("participantTesseraPublicKeys")
  .setAction(
    async ({ participantTesseraPublicKeys }) =>
      await deployPrivateSimpleCounter(participantTesseraPublicKeys)
  );

task(
  "addSimpleCounterValuePrivateWeb3Quorum",
  "Adds counter value privately using Web3Quorum"
)
  .addPositionalParam("contractAddress")
  .addPositionalParam("valueToAdd")
  .addVariadicPositionalParam("participantTesseraPublicKeys")
  .setAction(
    async ({ contractAddress, valueToAdd, participantTesseraPublicKeys }) =>
      await addPrivateSimpleCounterValue(
        contractAddress,
        valueToAdd,
        participantTesseraPublicKeys
      )
  );

task(
  "extendContractPrivateWeb3Quorum",
  "Extends contract privately using Web3Quorum"
)
  .addPositionalParam("contractAddress")
  .addPositionalParam("participantTesseraPublicKey")
  .addPositionalParam("participantAccountAddress")
  .addOptionalPositionalParam("participantNodeName")
  .setAction(
    async ({
      contractAddress,
      participantTesseraPublicKey,
      participantAccountAddress,
      participantNodeName,
    }) =>
      await extendContract(
        contractAddress,
        participantTesseraPublicKey,
        participantAccountAddress,
        participantNodeName
      )
  );

task(
  "getActiveExtensionContractsPrivateWeb3Quorum",
  "Gets active extension contracts privately using Web3Quorum"
).setAction(async () => await getActiveExtensionContracts());

task(
  "approveExtensionPrivateWeb3Quorum",
  "Approves contract extension privately using Web3Quorum"
)
  .addPositionalParam("participantTesseraPublicKey")
  .addPositionalParam("extensionManagerAddress")
  .addOptionalPositionalParam("participantNodeName")
  .addOptionalPositionalParam("vote")
  .setAction(
    async ({
      participantTesseraPublicKey,
      extensionManagerAddress,
      participantNodeName,
      vote,
    }) =>
      await approveExtension(
        participantTesseraPublicKey,
        extensionManagerAddress,
        participantNodeName,
        vote !== "false"
      )
  );

task(
  "cancelExtensionPrivateWeb3Quorum",
  "Cancels contract extension privately using Web3Quorum"
)
  .addPositionalParam("participantTesseraPublicKey")
  .addPositionalParam("extensionManagerAddress")
  .addOptionalPositionalParam("participantNodeName")
  .setAction(
    async ({
      participantTesseraPublicKey,
      extensionManagerAddress,
      participantNodeName,
    }) =>
      await cancelExtension(
        participantTesseraPublicKey,
        extensionManagerAddress,
        participantNodeName
      )
  );

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
