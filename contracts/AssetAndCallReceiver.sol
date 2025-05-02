pragma solidity ^0.8.0;

contract AssetAndCallReceiver {
    uint256 public totalTransferred;
    uint256 public callCounter;

    event AssetReceived(address indexed sender, uint256 amount);
    event CallExecuted(
        address indexed caller,
        uint256 assetAmount,
        uint256 totalTransferred,
        uint256 callCounter
    );

    // This function receives an asset (ETH) and processes a call.
    // The sent ETH (msg.value) must match the specified assetAmount.
    function processTransferAndCall(uint256 assetAmount) external payable {
        require(msg.value == assetAmount, "Asset amount mismatch");

        totalTransferred += assetAmount;
        callCounter++;

        emit AssetReceived(msg.sender, assetAmount);
        emit CallExecuted(msg.sender, assetAmount, totalTransferred, callCounter);
    }
}
