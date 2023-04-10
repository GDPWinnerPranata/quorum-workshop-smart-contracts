import { config } from "dotenv";
import { readFileSync } from "fs";

export type Keystore = {
  version: number;
  id: string;
  address: string;
  crypto: {
    ciphertext: string;
    cipherparams: { iv: string };
    cipher: string;
    kdf: string;
    kdfparams: { dklen: number; salt: string; n: number; r: number; p: number };
    mac: string;
  };
};
export type QuorumNode = {
  nodeName: string;
  publicAddress: string;
  gethP2PPort: string;
  gethRAFTPort: string;
  gethHTTPPort: string;
  gethWSPort: string;
  tesseraP2PPort: string;
  tessera3rdPartyPort: string;
  nodeAddress: string;
  nodePublicKey: string;
  nodePrivateKey: string;
  accountAddress: string;
  accountPrivateKey: string;
  accountPassword: string;
  accountKeystore: Keystore;
  tesseraPublicKey: string;
  httpUrl: string;
  wsUrl: string;
  privateUrl: string;
};

export function getNode(debug = false): QuorumNode {
  config();

  const gethDirPath = process.env.GETH_DIR_PATH ?? undefined;
  const tesseraDirPath = process.env.TESSERA_DIR_PATH ?? undefined;

  function getValueFromFile(path: string) {
    try {
      return readFileSync(path).toString();
    } catch (e) {
      if (debug) console.error(`[!] CANNOT FIND '${path}'!`);
      return undefined;
    }
  }

  const nodeName = process.env.NODE_NAME ?? "";
  const publicAddress = process.env.IP_ADDRESS ?? "";
  const gethP2PPort = process.env.GETH_P2P_PORT ?? "";
  const gethRAFTPort = process.env.GETH_RAFT_PORT ?? "";
  const gethHTTPPort = process.env.GETH_HTTP_PORT ?? "";
  const gethWSPort = process.env.GETH_WS_PORT ?? "";
  const tesseraP2PPort = process.env.TESSERA_P2P_PORT ?? "";
  const tessera3rdPartyPort = process.env.TESSERA_3RD_PARTY_PORT ?? "";
  const nodeAddress = getValueFromFile(`${gethDirPath}/address`) ?? "";
  const nodePublicKey = getValueFromFile(`${gethDirPath}/nodekey.pub`) ?? "";
  const nodePrivateKey = getValueFromFile(`${gethDirPath}/nodekey`) ?? "";
  const accountAddress =
    getValueFromFile(`${gethDirPath}/keystore/accountAddress`) ?? "";
  const accountPrivateKey =
    getValueFromFile(`${gethDirPath}/keystore/accountPrivateKey`) ?? "";
  const accountPassword =
    getValueFromFile(`${gethDirPath}/keystore/accountPassword`) ?? "";
  const accountKeystore = JSON.parse(
    getValueFromFile(`${gethDirPath}/keystore/accountKeystore`) ?? "{}"
  );
  const tesseraPublicKey =
    getValueFromFile(`${tesseraDirPath}/tessera.pub`) ?? "";
  const httpUrl = `http://${process.env.IP_ADDRESS ?? ""}:${
    process.env.GETH_HTTP_PORT ?? ""
  }`;
  const wsUrl = `ws://${process.env.IP_ADDRESS ?? ""}:${
    process.env.GETH_WS_PORT ?? ""
  }`;
  const privateUrl = `http://${process.env.IP_ADDRESS ?? ""}:${
    process.env.TESSERA_3RD_PARTY_PORT ?? ""
  }`;

  return {
    nodeName,
    publicAddress,
    gethP2PPort,
    gethRAFTPort,
    gethHTTPPort,
    gethWSPort,
    tesseraP2PPort,
    tessera3rdPartyPort,
    nodeAddress,
    nodePublicKey,
    nodePrivateKey,
    accountAddress,
    accountPrivateKey,
    accountPassword,
    accountKeystore,
    tesseraPublicKey,
    httpUrl,
    wsUrl,
    privateUrl,
  };
}
