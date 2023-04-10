import { Contract } from "ethers";
import { ethers } from "hardhat";
import { getNode } from "./helper/node";

const CONTRACT_NAME = "SimpleCounter";
const NODE = getNode();

async function deploySimpleCounter() {
  // -------- CREATE CONTRACT FACTORY OBJECT --------
  const simpleCounterFactory = await ethers.getContractFactory(CONTRACT_NAME);

  // -------- DEPLOY CONTRACT FROM CONTRACT FACTORY WITH PARAMETER 47 --------
  const simpleCounter = await simpleCounterFactory.deploy(47);

  console.log(
    `[${NODE.nodeName}]: *Deployed SimpleCounter Contract @ ${simpleCounter.address}*`
  );
  return simpleCounter;
}

async function getSimpleCounterValue(contract: Contract) {
  // -------- CALL GET FUNCTION --------
  const result = await contract.counter();

  console.log(`[${NODE.nodeName}]: *Counter Value: ${result}*`);
  return result;
}

async function addSimpleCounterValue(contract: Contract, valueToAdd: number) {
  // ------- INITIALIZE ADD TRANSACTION ---------
  const result = await contract.addCounter(valueToAdd);

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
  const simpelCounter = await deploySimpleCounter();

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER ========.
  getSimpleCounterValue(simpelCounter);

  // ======== ADD COUNTER ========
  const valueToAdd = 53;
  await addSimpleCounterValue(simpelCounter, valueToAdd);

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER AFTER ADDING ========
  getSimpleCounterValue(simpelCounter);
}

run();
