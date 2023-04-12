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

### Full Simulation

```
npm run public-simulate-web3
```

```
npm run public-simulate-ethers
```

### Contract Deployment

```
npm run public-deploy-contract-web3
```

```
npm run public-deploy-contract-ethers
```

```
npm run private-deploy-contract-web3quorum -- <...participant tessera public keys>
```

### Getting Counter Value

```
npm run public-get-counter-web3 -- <contract address>
```

```
npm run public-get-counter-ethers -- <contract address>
```

### Adding Counter Value

```
npm run public-add-counter-web3 -- <contract address> <value to add>
```

```
npm run public-add-counter-ethers -- <contract address> <value to add>
```

```
npm run private-add-counter-web3quorum -- <contract address> <value to add> <...participant tessera public keys>
```

### Private TX-Exclusive Operations

#### Extend Contract

```
npm run private-extend-contract-web3quorum -- <contract address> <participant tessera public key> <participant account address> [participant node name]
```

#### Get Extension Statuses

```
npm run private-get-active-extension-web3quorum
```

#### Recipient Approve Extension

```
npm run private-approve-extension-web3quorum -- <participant tessera public key> <extension manager address> <vote> [participant node name]
```

#### Cancel Extension

```
npm run private-cancel-extension-web3quorum -- <participant tessera public key> <extension manager address> [participant node name]
```
