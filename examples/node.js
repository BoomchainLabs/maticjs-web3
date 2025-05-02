const { use, POSClient } = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require("@maticnetwork/maticjs-web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const dotenv = require('dotenv');
const path = require('path');
const env = dotenv.config({
    path: path.join(__dirname, '.env')
});

const { user1, rpc, pos } = require("./config");

use(Web3ClientPlugin);

const from = user1.address;
const privateKey = user1.privateKey;

const { AssetAndCallReceiverABI } = require("../../ABIs/AssetAndCallReceiver");

const execute = async () => {
    const matic = new POSClient();
    await matic.init({
        // log: true,
        network: 'testnet',
        version: 'mumbai',
        parent: {
            provider: new HDWalletProvider(privateKey, rpc.root),
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

    const rootTokenErc20 = matic.erc20(pos.parent.erc20, true);

    const balanceRoot = await rootTokenErc20.getBalance(from)
    console.log('balanceRoot', balanceRoot);

    // Initialize the Agglayer client.
    const client = await getLxLyClient();

    // Set the token to the zero address (native ETH).
    const token = "0x0000000000000000000000000000000000000000";

    // Define the asset amount to be transferred.
    // In this example, 0.01 ETH = 10^16 wei = 0x2386F26FC10000 (in hexadecimal).
    const amount = "0x2386F26FC10000";

    // Define the source and destination networks.
    // Source: Cardona (network ID: 1)
    // Destination: Sepolia (network ID: 0)
    const sourceNetwork = 1;
    const destinationNetwork = 0;

    // Replace the value below with your deployed AssetAndCallReceiver contract address on Sepolia.
    const callAddress = "0xYourDeployedAssetAndCallReceiverAddress";

    // Set the fallback address (usually the sender's address) in case the call fails.
    const fallbackAddress = from;

    // Flag to update the global exit root (set to true if required by your deployment).
    const forceUpdateGlobalExitRoot = true;

    // Create an instance of the AssetAndCallReceiver contract.
    const callContract = client.contract(AssetAndCallReceiverABI, callAddress, destinationNetwork);

    // Prepare the call data by encoding the processTransferAndCall function with the asset amount.
    const callData = await callContract.encodeAbi("processTransferAndCall", amount);

    let result;
    // Call the bridgeAndCall API; include an optional permitData parameter for testnet if needed.
    if (client.client.network === "testnet") {
        console.log("Running on testnet");
        result = await client.bridgeExtensions[sourceNetwork].bridgeAndCall(
            token,
            amount,
            destinationNetwork,
            callAddress,
            fallbackAddress,
            callData,
            forceUpdateGlobalExitRoot,
            "0x0" // Optional permitData parameter.
        );
    } else {
        console.log("Running on mainnet");
        result = await client.bridgeExtensions[sourceNetwork].bridgeAndCall(
            token,
            amount,
            destinationNetwork,
            callAddress,
            fallbackAddress,
            callData,
            forceUpdateGlobalExitRoot
        );
    }

    console.log("Bridge and Call Asset Result:", result);

    // Retrieve and log the transaction hash.
    const txHash = await result.getTransactionHash();
    console.log("Transaction Hash:", txHash);

    // Retrieve and log the transaction receipt.
    const receipt = await result.getReceipt();
    console.log("Transaction Receipt:", receipt);
}

execute().then(_ => {
    process.exit(0)
}).catch(err => {
    console.error("error", err);
    process.exit(0);
})
