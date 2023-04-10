import { task } from "hardhat/config";
import {
  addSimpleCounterValue,
  deploySimpleCounter,
  getSimpleCounterValue,
  simulate,
} from "../scripts/public-tx-web3";

task(
  "simulatePublicWeb3",
  "Simulates the whole public tranasction process using web3js"
).setAction(async () => await simulate());

task(
  "deploySimpleCounterPublicWeb3",
  "Deploys SimpleCounter contract publically using web3js"
).setAction(async () => await deploySimpleCounter());

task(
  "getSimpleCounterValuePublicWeb3",
  "Gets counter value publically using web3js"
)
  .addPositionalParam("contractAddress")
  .setAction(
    async ({ contractAddress }) => await getSimpleCounterValue(contractAddress)
  );

task(
  "addSimpleCounterValuePublicWeb3",
  "Adds counter value publically using web3js"
)
  .addPositionalParam("contractAddress")
  .addPositionalParam("valueToAdd")
  .setAction(
    async ({ contractAddress, valueToAdd }) =>
      await addSimpleCounterValue(contractAddress, valueToAdd)
  );
