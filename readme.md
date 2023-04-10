# Quorum Workshop Smart Contracts

## Installation

1. Install dependencies

```
npm install
```

2. Copy `.env.example` to `.env`

```
cp .env.example .env
```

3. Modify `.env` accordingly

## Running

To run public transaction demo with EthersJS

```
npm run public-tx-ethers
```

To run public transaction demo with web3

```
npm run public-tx-quorum
```

To run private transaction demo with web3quorum

```
npm run private-tx-web3quorum
```

To read the counter value of a specific contract

```
npm run read-counter -- {contract address}
```
