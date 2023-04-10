import { task } from "hardhat/config";
import {
  addSimpleCounterValue,
  deploySimpleCounter,
  getSimpleCounterValue,
  simulate,
} from "../scripts/public-tx-ethers";

task(
  "simulatePublicEthers",
  "Simulates the whole public tranasction process using EthersJS"
).setAction(async (_, hre) => await simulate(hre));

task(
  "deploySimpleCounterPublicEthers",
  "Deploys SimpleCounter contract publically using EthersJS"
).setAction(async (_, hre) => await deploySimpleCounter(hre));

task(
  "getSimpleCounterValuePublicEthers",
  "Gets counter value publically using EthersJS"
)
  .addPositionalParam("contractAddress")
  .setAction(
    async ({ contractAddress }, hre) =>
      await getSimpleCounterValue(hre, contractAddress)
  );

task(
  "addSimpleCounterValuePublicEthers",
  "Adds counter value publically using EthersJS"
)
  .addPositionalParam("contractAddress")
  .addPositionalParam("valueToAdd")
  .setAction(
    async ({ contractAddress, valueToAdd }, hre) =>
      await addSimpleCounterValue(hre, contractAddress, valueToAdd)
  );
