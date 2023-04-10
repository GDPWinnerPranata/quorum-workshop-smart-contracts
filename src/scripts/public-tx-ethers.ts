import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getNode } from "./helper/node";

const CONTRACT_NAME = "SimpleCounter";
const NODE = getNode();

export async function deploySimpleCounter(hre: HardhatRuntimeEnvironment) {
  // -------- CREATE CONTRACT FACTORY OBJECT --------
  const simpleCounterFactory = await hre.ethers.getContractFactory(
    CONTRACT_NAME
  );

  // -------- DEPLOY CONTRACT FROM CONTRACT FACTORY WITH PARAMETER 47 --------
  const simpleCounter = await simpleCounterFactory.deploy(47);

  console.log(
    `[${NODE.nodeName}]: *Deployed SimpleCounter Contract @ ${simpleCounter.address}*`
  );
  return simpleCounter;
}

export async function getSimpleCounterValue(
  hre: HardhatRuntimeEnvironment,
  contractAddress: string
) {
  // -------- CREATE CONTRACT FACTORY OBJECT --------
  const simpleCounterFactory = await hre.ethers.getContractFactory(
    CONTRACT_NAME
  );

  //   -------- ATTACH TO CONTRACT BY ADDRESS --------
  const contract = simpleCounterFactory.attach(contractAddress);

  // -------- CALL GET FUNCTION --------
  try {
    const result = await contract.counter();

    console.log(`[${NODE.nodeName}]: *Counter Value: ${result}*`);
    return result;
  } catch (e) {
    console.log(`[${NODE.nodeName}]: *SimpleCounter Contract not found!*`);
  }
}

export async function addSimpleCounterValue(
  hre: HardhatRuntimeEnvironment,
  contractAddress: string,
  valueToAdd: number
) {
  // -------- CREATE CONTRACT FACTORY OBJECT --------
  const simpleCounterFactory = await hre.ethers.getContractFactory(
    CONTRACT_NAME
  );

  //   -------- ATTACH TO CONTRACT BY ADDRESS --------
  const contract = simpleCounterFactory.attach(contractAddress);

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

export async function simulate(hre: HardhatRuntimeEnvironment) {
  // ======== CONTRACT DEPLOYMENT ========
  const simpleCounter = await deploySimpleCounter(hre);

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER ========.
  getSimpleCounterValue(hre, simpleCounter.address);

  // ======== ADD COUNTER ========
  const valueToAdd = 53;
  await addSimpleCounterValue(hre, simpleCounter.address, valueToAdd);

  // -------- TIMEOUT FOR TX PROPAGATION --------
  await timeoutForPropagation();

  // ======== CHECK COUNTER AFTER ADDING ========
  getSimpleCounterValue(hre, simpleCounter.address);
}
