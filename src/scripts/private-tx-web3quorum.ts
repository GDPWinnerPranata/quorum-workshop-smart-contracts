import { readFileSync } from "fs";
import { resolve } from "path";
import Web3 from "web3";
import Web3Quorum from "web3js-quorum";
import { quorum, QuorumNode, QuorumNodes } from "./static/nodeData";

const CHAIN_ID = 1337;
const CONTRACT_NAME = "SimpleCounter";

function createWeb3Object(node: QuorumNode) {
  return new Web3(node.getHttpUrl());
}

function createWeb3QuorumObject(node: QuorumNode, web3?: Web3) {
  // -------- CREATE WEB3QUORUM OBJECT --------
  const web3Quorum = new Web3Quorum(
    web3 ?? createWeb3Object(node),
    {
      privateUrl: node.getPrivateUrl(),
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

async function deployPrivateSimpleCounter(
  deployer: QuorumNode,
  deployTo: QuorumNode[]
) {
  // ++++++++ CREATE WEB3QUORUM OBJECT ++++++++
  const web3Quorum = createWeb3QuorumObject(deployer);

  // -------- DECRYPT SIGNING ACCOUNT --------
  const accountKey = deployer.accountKeystore;
  const accountPassword = deployer.accountPassword;
  const signingAccount = web3Quorum.eth.accounts.decrypt(
    accountKey,
    accountPassword
  );

  // -------- GET NONCE FROM TX COUNT --------
  const accountAddress = deployer.accountAddress;
  const txCount = await web3Quorum.eth.getTransactionCount(accountAddress);

  // -------- GET CONTRACT BYTECODE --------
  const { bytecode: contractBytecode } = getContractJSON(CONTRACT_NAME);

  // -------- INITIALIZE CONSTRUCTOR WITH PARAMETER 47 (sliced '0x') --------
  const contractConstructorInit = web3Quorum.eth.abi
    .encodeParameter("uint256", "47")
    .slice(2);

  // ++++++++ INITIALIZE CONTRACT DEPLOYMENT TRANSACTION ++++++++
  const fromAccountPrivateKey = deployer.accountPrivateKey;
  const fromTesseraPublicKey = deployer.tesseraPublicKey;
  const toParticipants = deployTo.map((node) => node.tesseraPublicKey);

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
    privateFor: toParticipants, // ++++++++
  };

  // ++++++++ EXECUTE TRANSACTION ++++++++
  const txReceipt = await web3Quorum.priv.generateAndSendRawTransaction(
    txOptions
  );
  console.log(
    `[${deployer.nodeName}]: *Deployed SimpleCounter Contract @ ${txReceipt.contractAddress}*`
  );
  return txReceipt;
}

async function getSimpleCounterValue(
  node: QuorumNode,
  contractAddress: string
) {
  // -------- CREATE WEB3 OBJECT --------
  const web3Quorum = createWeb3QuorumObject(node);

  // -------- GET CONTRACT INSTANCE --------
  const { abi: contractABI } = getContractJSON(CONTRACT_NAME);
  const contract = new web3Quorum.eth.Contract(contractABI, contractAddress);

  // -------- CALL GET FUNCTION --------
  try {
    const result = await contract.methods.counter().call();

    console.log(`[${node.nodeName}]: *Counter Value: ${result}*`);
    return result;
  } catch (e) {
    console.log(`[${node.nodeName}]: *SimpleCounter Contract not found!*`);
  }
}

async function addPrivateSimpleCounterValue(
  initiator: QuorumNode,
  initiateTo: QuorumNode[],
  contractAddress: string,
  valueToAdd: number
) {
  // ++++++++ CREATE WEB3QUORUM OBJECT ++++++++
  const web3Quorum = createWeb3QuorumObject(initiator);

  // -------- GET CONTRACT INSTANCE --------
  const contractJSON = getContractJSON(CONTRACT_NAME);
  const contractABI = contractJSON.abi;
  const contract = new web3Quorum.eth.Contract(contractABI, contractAddress);

  // ++++++++ INITIALIZE ADD TRANSACTION ++++++++
  const accountAddress = initiator.accountAddress;
  const toParticipants = initiateTo.map((node) => node.tesseraPublicKey);

  const txOptions = {
    from: accountAddress,
    gasPrice: 0x00,
    gasLimit: 0xffffff,
    isPrivate: true, // ++++++++
    privateFor: toParticipants, // ++++++++
  };

  // ++++++++ CALL ADD FUNCTION ++++++++
  const result = await contract.methods.addCounter(valueToAdd).send(txOptions);

  console.log(
    `[${initiator.nodeName}]: *Called '.AddCounter(amount)' with amount: '${valueToAdd}'*`
  );
  return result;
}

async function timeoutForPropagation(timeout = 5000) {
  console.log(`*Timeout for propagation: ${timeout}ms*`);
  await new Promise((r) => setTimeout(r, timeout));
}

async function extendContract(
  contractAddress: string,
  deployer: QuorumNode,
  recipient: QuorumNode
) {
  const web3Quorum = createWeb3QuorumObject(deployer);

  const txOptions = {
    from: deployer.accountAddress,
    isPrivate: true,
    privateKey: deployer.accountPrivateKey,
    privateFrom: deployer.tesseraPublicKey,
    privateFor: [recipient.tesseraPublicKey],
  };

  const transactionHash = await web3Quorum.quorumExtension.extendContract(
    contractAddress,
    recipient.tesseraPublicKey,
    recipient.accountAddress,
    txOptions
  );

  console.log(
    `[${deployer.nodeName}]: *Extends contract '${contractAddress}' with: '${recipient.nodeName}'*`
  );

  return transactionHash;
}

async function getActiveExtensionContracts(node: QuorumNode) {
  const web3Quorum = createWeb3QuorumObject(node);
  const activeExtensionContracts =
    await web3Quorum.quorumExtension.activeExtensionContracts();
  return activeExtensionContracts;
}

async function approveExtension(
  deployer: QuorumNode,
  recipient: QuorumNode,
  extensionManagerAddress: string,
  vote = true
) {
  const web3Quorum = createWeb3QuorumObject(recipient);

  const txOptions = {
    from: recipient.accountAddress,
    isPrivate: true,
    privateKey: recipient.accountPrivateKey,
    privateFrom: recipient.tesseraPublicKey,
    privateFor: [deployer.tesseraPublicKey],
  };

  const result = await web3Quorum.quorumExtension.approveExtension(
    extensionManagerAddress,
    vote,
    txOptions
  );

  console.log(
    `[${recipient.nodeName}]: *${
      vote ? "Approved" : "Rejected"
    } Contract extension in '${extensionManagerAddress}' by '${
      deployer.nodeName
    }'*`
  );

  return result;
}

async function cancelExtension(
  deployer: QuorumNode,
  recipient: QuorumNode,
  extensionManagerAddress: string
) {
  const web3Quorum = createWeb3QuorumObject(deployer);

  const txOptions = {
    from: deployer.accountAddress,
    isPrivate: true,
    privateKey: deployer.accountPrivateKey,
    privateFrom: deployer.tesseraPublicKey,
    privateFor: [recipient.tesseraPublicKey],
  };

  const result = await web3Quorum.quorumExtension.cancelExtension(
    extensionManagerAddress,
    txOptions
  );

  console.log(
    `[${deployer.nodeName}]: *Cancelled Contract extension in '${extensionManagerAddress}' with '${recipient.nodeName}'*`
  );

  return result;
}

async function run() {
  // ======== CONTRACT DEPLOYMENT NODE 1, 2, & 3 ========
  const { contractAddress } = await deployPrivateSimpleCounter(quorum.node1, [
    quorum.node2,
    quorum.node3,
  ]);

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER ========
  await Object.keys(quorum).reduce(async (prev, curr) => {
    await prev;
    return getSimpleCounterValue(
      quorum[curr as keyof QuorumNodes],
      contractAddress!
    );
  }, Promise.resolve());

  // ======== ADD COUNTER NODE 1 & 2 ========
  await addPrivateSimpleCounterValue(
    quorum.node1,
    [quorum.node2],
    contractAddress!,
    53
  );

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER AFTER ADDING ========
  await Object.keys(quorum).reduce(async (prev, curr) => {
    await prev;
    return getSimpleCounterValue(
      quorum[curr as keyof QuorumNodes],
      contractAddress!
    );
  }, Promise.resolve());

  // ======== NODE 2 & 3 ADD COUNTER ========
  await addPrivateSimpleCounterValue(
    quorum.node2,
    [quorum.node3],
    contractAddress!,
    70
  );

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER AFTER ADDING ========
  await Object.keys(quorum).reduce(async (prev, curr) => {
    await prev;
    return getSimpleCounterValue(
      quorum[curr as keyof QuorumNodes],
      contractAddress!
    );
  }, Promise.resolve());

  // ======== NODE 3 EXTENDS CONTRACT TO NODE 4 ========
  await extendContract(contractAddress, quorum.node3, quorum.node4);

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== GET ACTIVE EXTENSION CONTRACTS ========
  const activeExtensionContracts = await getActiveExtensionContracts(
    quorum.node3
  );
  console.log(activeExtensionContracts);

  // ======== NODE 4 ACCEPT CONTRACT EXTENSION FROM NODE 3 ========
  const extendedContract = activeExtensionContracts[0];
  await approveExtension(
    quorum.node3,
    quorum.node4,
    extendedContract.managementContractAddress
  );

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation(10000);

  // ======== GET ACTIVE EXTENSION CONTRACTS ========
  console.log(await getActiveExtensionContracts(quorum.node3));

  // ======== CHECK COUNTER AFTER CONTRACT EXTENSION ========
  await Object.keys(quorum).reduce(async (prev, curr) => {
    await prev;
    return getSimpleCounterValue(
      quorum[curr as keyof QuorumNodes],
      contractAddress!
    );
  }, Promise.resolve());

  // ======== NODE 2 & 4 ADD COUNTER ========
  await addPrivateSimpleCounterValue(
    quorum.node2,
    [quorum.node4],
    contractAddress!,
    123
  );

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER AFTER ADDING ========
  await Object.keys(quorum).reduce(async (prev, curr) => {
    await prev;
    return getSimpleCounterValue(
      quorum[curr as keyof QuorumNodes],
      contractAddress!
    );
  }, Promise.resolve());

  // ======== CANCEL ALL CONTRACT EXTENSION ========
  // activeExtensionContracts
  //   .map(({ managementContractAddress }: any) => managementContractAddress)
  //   .reduce(async (prev: Promise<any>, curr: string) => {
  //     await prev;
  //     return cancelExtension(quorum.node1, quorum.node4, curr);
  //   }, Promise.resolve());
}

run();
