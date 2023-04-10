import { readFileSync } from "fs";
import { resolve } from "path";
import Web3 from "web3";
import { getNode } from "./helper/node";

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

export async function getSimpleCounterValue(contractAddress: string) {
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
