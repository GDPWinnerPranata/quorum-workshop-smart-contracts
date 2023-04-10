//// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

contract SimpleCounter {
    uint256 public counter;

    constructor(uint256 startingValue) {
        counter = startingValue;
    }

    function addCounter(uint256 amount) external {
        counter += amount;
    }
}
