import { task } from "hardhat/config";
import {
  addPrivateSimpleCounterValue,
  approveExtension,
  cancelExtension,
  deployPrivateSimpleCounter,
  extendContract,
  getActiveExtensionContracts,
} from "../scripts/private-tx-web3quorum";

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
        participantTesseraPublicKeys,
        contractAddress,
        valueToAdd
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
  .addOptionalPositionalParam("vote")
  .addOptionalPositionalParam("participantNodeName")
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
