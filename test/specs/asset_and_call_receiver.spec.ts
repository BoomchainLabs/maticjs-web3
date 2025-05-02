import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('AssetAndCallReceiver', function () {
  let AssetAndCallReceiver;
  let assetAndCallReceiver;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    AssetAndCallReceiver = await ethers.getContractFactory('AssetAndCallReceiver');
    assetAndCallReceiver = await AssetAndCallReceiver.deploy();
    await assetAndCallReceiver.deployed();
  });

  it('should process transfer and call correctly', async function () {
    const assetAmount = ethers.utils.parseEther('1.0');
    const tx = await assetAndCallReceiver.connect(addr1).processTransferAndCall(assetAmount, { value: assetAmount });

    await expect(tx)
      .to.emit(assetAndCallReceiver, 'AssetReceived')
      .withArgs(addr1.address, assetAmount);

    await expect(tx)
      .to.emit(assetAndCallReceiver, 'CallExecuted')
      .withArgs(addr1.address, assetAmount, assetAmount, 1);

    const totalTransferred = await assetAndCallReceiver.totalTransferred();
    expect(totalTransferred).to.equal(assetAmount);

    const callCounter = await assetAndCallReceiver.callCounter();
    expect(callCounter).to.equal(1);
  });

  it('should revert if asset amount mismatch', async function () {
    const assetAmount = ethers.utils.parseEther('1.0');
    await expect(
      assetAndCallReceiver.connect(addr1).processTransferAndCall(assetAmount, { value: ethers.utils.parseEther('0.5') })
    ).to.be.revertedWith('Asset amount mismatch');
  });
});
