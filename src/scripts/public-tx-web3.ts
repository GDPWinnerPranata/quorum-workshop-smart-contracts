import { readFileSync } from "fs";
import { resolve } from "path";
import Web3 from "web3";
import { getNode } from "./helper/node";

const CHAIN_ID = 1337;
const CONTRACT_NAME = "SimpleCounter";
const NODE = getNode();

function createWeb3Object() {
  return new Web3(NODE.httpUrl);
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

async function deploySimpleCounter() {
  // -------- CREATE WEB3 OBJECT --------
  const web3 = createWeb3Object();

  // -------- DECRYPT SIGNING ACCOUNT --------
  const accountKey = NODE.accountKeystore;
  const accountPassword = NODE.accountPassword;
  const signingAccount = web3.eth.accounts.decrypt(accountKey, accountPassword);

  // -------- GET NONCE FROM TX COUNT --------
  const accountAddress = NODE.accountAddress;
  const txCount = await web3.eth.getTransactionCount(accountAddress);

  // -------- GET CONTRACT BYTECODE --------
  const { bytecode: contractBytecode } = getContractJSON(CONTRACT_NAME);

  // -------- INITIALIZE CONSTRUCTOR WITH PARAMETER 47 (sliced '0x') --------
  const contractConstructorInit = web3.eth.abi
    .encodeParameter("uint256", "47")
    .slice(2);

  // -------- INITIALIZE CONTRACT DEPLOYMENT TRANSACTION --------
  const txOptions = {
    chainId: CHAIN_ID,
    nonce: txCount,
    gas: "0x0",
    gasPrice: "0x0",
    gasLimit: "0xFFFFFF",
    value: "0x0",
    data: contractBytecode + contractConstructorInit,
    from: signingAccount.address,
  };

  // -------- SIGN TRANSACTION --------
  const signedTx = await web3.eth.accounts.signTransaction(
    txOptions,
    NODE.accountPrivateKey
  );

  // -------- EXECUTE SIGNED TRANSACTION --------
  const txReceipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction!
  );

  console.log(
    `[${NODE.nodeName}]: *Deployed SimpleCounter Contract @ ${txReceipt.contractAddress}*`
  );
  return txReceipt;
}

async function getSimpleCounterValue(contractAddress: string) {
  // -------- CREATE WEB3 OBJECT --------
  const web3 = createWeb3Object();

  // -------- GET CONTRACT INSTANCE --------
  const { abi: contractABI } = getContractJSON(CONTRACT_NAME);
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // -------- CALL GET FUNCTION --------
  const result = await contract.methods.counter().call();

  console.log(`[${NODE.nodeName}]: *Counter Value: ${result}*`);
  return result;
}

async function addSimpleCounterValue(
  contractAddress: string,
  valueToAdd: number
) {
  // -------- CREATE WEB3 OBJECT --------
  const web3 = createWeb3Object();

  // -------- GET CONTRACT INSTANCE --------
  const contractName = "SimpleCounter";
  const contractJSON = getContractJSON(contractName);
  const contractABI = contractJSON.abi;
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // ------- INITIALIZE ADD TRANSACTION ---------
  const accountAddress = NODE.accountAddress;
  const txOptions = {
    from: accountAddress,
    gasPrice: "0x0",
    gasLimit: "0xFFFFFF",
  };

  // -------- CALL ADD FUNCTION --------
  const result = await contract.methods.addCounter(valueToAdd).send(txOptions);

  console.log(
    `[${NODE.nodeName}]: *Called '.AddCounter(amount)' with amount: '${valueToAdd}'*`
  );
  return result;
}

async function timeoutForPropagation(timeout = 5000) {
  console.log(`*Timeout for propagation: ${timeout}ms*`);
  await new Promise((r) => setTimeout(r, timeout));
}

async function run() {
  // ======== CONTRACT DEPLOYMENT ========
  const { contractAddress } = await deploySimpleCounter();

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER ========
  getSimpleCounterValue(contractAddress!);

  // ======== ADD COUNTER ========
  const valueToAdd = 53;
  await addSimpleCounterValue(contractAddress!, valueToAdd);

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER AFTER ADDING ========
  getSimpleCounterValue(contractAddress!);
}

run();
