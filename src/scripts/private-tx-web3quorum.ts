import { readFileSync } from "fs";
import { resolve } from "path";
import Web3 from "web3";
import Web3Quorum from "web3js-quorum";
import { getNode } from "./helper/node";

const CHAIN_ID = 1337;
const CONTRACT_NAME = "SimpleCounter";
const NODE = getNode();

function createWeb3Object() {
  return new Web3(NODE.httpUrl);
}

function createWeb3QuorumObject(web3?: Web3) {
  // -------- CREATE WEB3QUORUM OBJECT --------
  const web3Quorum = new Web3Quorum(
    web3 ?? createWeb3Object(),
    {
      privateUrl: NODE.privateUrl,
    },
    true
  );

  // -------- EXTENDS QUORUM API RPC METHODS --------
  web3Quorum.extend({
    property: "quorumExtension",
    methods: [
      {
        name: "extendContract",
        call: "quorumExtension_extendContract",
        params: 4,
        inputFormatter: [
          web3Quorum.extend.formatters.inputAddressFormatter,
          null,
          web3Quorum.extend.formatters.inputAddressFormatter,
          web3Quorum.extend.formatters.inputTransactionFormatter,
        ],
      },
      {
        name: "activeExtensionContracts",
        call: "quorumExtension_activeExtensionContracts",
        params: 0,
        inputFormatter: [],
      },
      {
        name: "approveExtension",
        call: "quorumExtension_approveExtension",
        params: 3,
        inputFormatter: [
          web3Quorum.extend.formatters.inputAddressFormatter,
          null,
          web3Quorum.extend.formatters.inputTransactionFormatter,
        ],
      },
      {
        name: "cancelExtension",
        call: "quorumExtension_cancelExtension",
        params: 2,
        inputFormatter: [
          web3Quorum.extend.formatters.inputAddressFormatter,
          web3Quorum.extend.formatters.inputTransactionFormatter,
        ],
      },
      {
        name: "getExtensionStatus",
        call: "quorumExtension_getExtensionStatus",
        params: 1,
        inputFormatter: [web3Quorum.extend.formatters.inputAddressFormatter],
      },
    ],
  });

  return web3Quorum;
}

function getContractJSON(contractName: string) {
  const contractJSONPath = resolve(
    __dirname,
    "../",
    "../",
    `artifacts`,
    `src`,
    `contracts`,
    `${contractName}.sol`,
    `${contractName}.json`
  );
  const contractJSON = JSON.parse(readFileSync(contractJSONPath).toString());
  return contractJSON;
}

export async function deployPrivateSimpleCounter(
  participantTesseraPublicKeys: string[]
) {
  // ++++++++ CREATE WEB3QUORUM OBJECT ++++++++
  const web3Quorum = createWeb3QuorumObject();

  // -------- DECRYPT SIGNING ACCOUNT --------
  const accountKey = NODE.accountKeystore;
  const accountPassword = NODE.accountPassword;
  const signingAccount = web3Quorum.eth.accounts.decrypt(
    accountKey,
    accountPassword
  );

  // -------- GET NONCE FROM TX COUNT --------
  const accountAddress = NODE.accountAddress;
  const txCount = await web3Quorum.eth.getTransactionCount(accountAddress);

  // -------- GET CONTRACT BYTECODE --------
  const { bytecode: contractBytecode } = getContractJSON(CONTRACT_NAME);

  // -------- INITIALIZE CONSTRUCTOR WITH PARAMETER 47 (sliced '0x') --------
  const contractConstructorInit = web3Quorum.eth.abi
    .encodeParameter("uint256", "47")
    .slice(2);

  // ++++++++ INITIALIZE CONTRACT DEPLOYMENT TRANSACTION ++++++++
  const fromAccountPrivateKey = NODE.accountPrivateKey;
  const fromTesseraPublicKey = NODE.tesseraPublicKey;

  const txOptions = {
    chainId: CHAIN_ID,
    nonce: txCount,
    gas: 0x00,
    gasPrice: 0x00,
    gasLimit: 0xffffff,
    value: 0x00,
    data: contractBytecode + contractConstructorInit,
    from: signingAccount,
    isPrivate: true, // ++++++++
    privateKey: fromAccountPrivateKey, // ++++++++
    privateFrom: fromTesseraPublicKey, // ++++++++
    privateFor: participantTesseraPublicKeys, // ++++++++
  };

  // ++++++++ EXECUTE TRANSACTION ++++++++
  const txReceipt = await web3Quorum.priv.generateAndSendRawTransaction(
    txOptions
  );
  console.log(
    `[${NODE.nodeName}]: *Deployed SimpleCounter Contract @ ${txReceipt.contractAddress}*`
  );
  return txReceipt;
}

export async function addPrivateSimpleCounterValue(
  participantTesseraPublicKeys: string[],
  contractAddress: string,
  valueToAdd: number
) {
  // ++++++++ CREATE WEB3QUORUM OBJECT ++++++++
  const web3Quorum = createWeb3QuorumObject();

  // -------- GET CONTRACT INSTANCE --------
  const contractJSON = getContractJSON(CONTRACT_NAME);
  const contractABI = contractJSON.abi;
  const contract = new web3Quorum.eth.Contract(contractABI, contractAddress);

  // ++++++++ INITIALIZE ADD TRANSACTION ++++++++
  const accountAddress = NODE.accountAddress;

  const txOptions = {
    from: accountAddress,
    gasPrice: 0x00,
    gasLimit: 0xffffff,
    isPrivate: true, // ++++++++
    privateFor: participantTesseraPublicKeys, // ++++++++
  };

  // ++++++++ CALL ADD FUNCTION ++++++++
  const result = await contract.methods.addCounter(valueToAdd).send(txOptions);

  console.log(
    `[${NODE.nodeName}]: *Called '.AddCounter(amount)' with amount: '${valueToAdd}'*`
  );
  return result;
}

export async function extendContract(
  contractAddress: string,
  participantTesseraPublicKey: string,
  participantAccountAddress: string,
  participantNodeName = "Participant Node"
) {
  const web3Quorum = createWeb3QuorumObject();

  const txOptions = {
    from: NODE.accountAddress,
    isPrivate: true,
    privateKey: NODE.accountPrivateKey,
    privateFrom: NODE.tesseraPublicKey,
    privateFor: [participantTesseraPublicKey],
  };

  const transactionHash = await web3Quorum.quorumExtension.extendContract(
    contractAddress,
    participantTesseraPublicKey,
    participantAccountAddress,
    txOptions
  );

  console.log(
    `[${NODE.nodeName}]: *Extends contract '${contractAddress}' with: '${participantNodeName}'*`
  );

  return transactionHash;
}

export async function getActiveExtensionContracts() {
  const web3Quorum = createWeb3QuorumObject();
  const activeExtensionContracts =
    await web3Quorum.quorumExtension.activeExtensionContracts();
  console.log(activeExtensionContracts);
  return activeExtensionContracts;
}

export async function approveExtension(
  participantTesseraPublicKey: string,
  extensionManagerAddress: string,
  participantNodeName = "Participant Node",
  vote = true
) {
  const web3Quorum = createWeb3QuorumObject();

  const txOptions = {
    from: NODE.accountAddress,
    isPrivate: true,
    privateKey: NODE.accountPrivateKey,
    privateFrom: NODE.tesseraPublicKey,
    privateFor: [participantTesseraPublicKey],
  };

  const result = await web3Quorum.quorumExtension.approveExtension(
    extensionManagerAddress,
    vote,
    txOptions
  );

  console.log(
    `[${NODE.nodeName}]: *${
      vote ? "Approved" : "Rejected"
    } Contract extension in '${extensionManagerAddress}' by '${participantNodeName}'*`
  );

  return result;
}

export async function cancelExtension(
  participantTesseraPublicKey: string,
  extensionManagerAddress: string,
  participantNodeName = "Participant Node"
) {
  const web3Quorum = createWeb3QuorumObject();

  const txOptions = {
    from: NODE.accountAddress,
    isPrivate: true,
    privateKey: NODE.accountPrivateKey,
    privateFrom: NODE.tesseraPublicKey,
    privateFor: [participantTesseraPublicKey],
  };

  const result = await web3Quorum.quorumExtension.cancelExtension(
    extensionManagerAddress,
    txOptions
  );

  console.log(
    `[${NODE.nodeName}]: *Cancelled Contract extension in '${extensionManagerAddress}' with '${participantNodeName}'*`
  );

  return result;
}
