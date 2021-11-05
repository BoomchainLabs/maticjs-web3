import { POSClient } from "@maticnetwork/maticjs";
import HDWalletProvider from "@truffle/hdwallet-provider";
import { user1, rpc, pos, user2 } from "../config";

const privateKey = user1.privateKey;
export const from = user1.address;
export const to = user2.address;
export const toPrivateKey = user2.privateKey;

export const erc20 = {
    parent: pos.parent.erc20,
    child: pos.child.erc20
}
export const erc721 = {
    parent: pos.parent.erc721,
    child: pos.child.erc721
}

export const posClient = new POSClient({
    // log: true,
    network: 'testnet',
    version: 'mumbai',
    parent: {
        provider: new HDWalletProvider(privateKey, rpc.parent),
        defaultConfig: {
            from
        }
    },
    child: {
        provider: new HDWalletProvider(privateKey, rpc.child),
        defaultConfig: {
            from
        }
    }
});

export const posClientForTo = new POSClient({
    // log: true,
    network: 'testnet',
    version: 'mumbai',
    parent: {
        provider: new HDWalletProvider(toPrivateKey, rpc.parent),
        defaultConfig: {
            from: to
        }
    },
    child: {
        provider: new HDWalletProvider(toPrivateKey, rpc.child),
        defaultConfig: {
            from: to
        }
    }
});