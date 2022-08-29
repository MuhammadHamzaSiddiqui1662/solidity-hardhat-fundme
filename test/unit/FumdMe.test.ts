import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { assert, expect } from 'chai';
import { deployments, ethers, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { FundMe, MockV3Aggregator } from '../../typechain-types';

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
    let fundMe: FundMe;
    let mockV3Aggregator: MockV3Aggregator;
    let deployer: SignerWithAddress;
    const sendValue = ethers.utils.parseEther("1");
    beforeEach(async () => {
      await deployments.fixture(["all"]);
      deployer = (await ethers.getSigners())[0]
      fundMe = await ethers.getContract("FundMe", deployer);
      mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    })

    describe("constructor", async () => {
      it("sets the aggregator address correctly", async () => {
        const response = await fundMe.getPriceFeed();
        assert.equal(response, mockV3Aggregator.address);
      })
    })

    describe("fund", async () => {
      it("Fails if youn don't send enough ETH", async () => {
        await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
      })
      it("update the amount funded data structure", async () => {
        await fundMe.fund({ value: sendValue });
        const response = await fundMe.getAddressToAmountFunded(deployer.address);
        assert.equal(response.toString(), sendValue.toString());
      })
      it("add funder to array of funders", async () => {
        await fundMe.fund({ value: sendValue });
        const funder = await fundMe.getFunders(0);
        assert.equal(funder, deployer.address);
      })
    })

    describe("withdraw", async () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      })

      it("withdraw eth from a singler founder", async () => {
        const deployersStartingBalance = await fundMe.provider.getBalance(deployer.address);
        const contractStartingBalance = await fundMe.provider.getBalance(fundMe.address);

        const transactionResponce = await fundMe.withdraw();
        const transactionRecipt = await transactionResponce.wait(1);
        const { gasUsed, effectiveGasPrice } = transactionRecipt;
        const gasCost = gasUsed.mul(effectiveGasPrice);

        const deployersEndingBalance = await fundMe.provider.getBalance(deployer.address);
        const contractEndingAddress = await fundMe.provider.getBalance(fundMe.address);

        assert.equal(contractEndingAddress.toString(), "0");
        assert.equal(deployersStartingBalance.add(contractStartingBalance).toString(), deployersEndingBalance.add(gasCost).toString());
      })

      it("allow us to withdraw from multiple funders", async () => {
        const accounts = await ethers.getSigners();
        for (let i = 1; i < 6; i++) {
          const fundMeConnectedContract = await fundMe.connect(accounts[i]);
          await fundMeConnectedContract.fund({ value: sendValue });
        }

        const deployersStartingBalance = await fundMe.provider.getBalance(deployer.address);
        const contractStartingBalance = await fundMe.provider.getBalance(fundMe.address);

        const transactionResponce = await fundMe.withdraw();
        const transactionRecipt = await transactionResponce.wait(1);
        const { gasUsed, effectiveGasPrice } = transactionRecipt;
        const gasCost = gasUsed.mul(effectiveGasPrice);

        const deployersEndingBalance = await fundMe.provider.getBalance(deployer.address);
        const contractEndingAddress = await fundMe.provider.getBalance(fundMe.address);

        assert.equal(contractEndingAddress.toString(), "0");
        assert.equal(deployersStartingBalance.add(contractStartingBalance).toString(), deployersEndingBalance.add(gasCost).toString());

        await expect(fundMe.getFunders(0)).to.be.reverted;

        for (let i = 1; i < 6; i++) {
          assert.equal(await (await fundMe.getAddressToAmountFunded(accounts[i].address)).toString(), "0");
        }
      })

      it("cheaperWithdraw testing", async () => {
        const accounts = await ethers.getSigners();
        for (let i = 1; i < 6; i++) {
          const fundMeConnectedContract = await fundMe.connect(accounts[i]);
          await fundMeConnectedContract.fund({ value: sendValue });
        }
        const deployersStartingBalance = await fundMe.provider.getBalance(deployer.address);
        const contractStartingBalance = await fundMe.provider.getBalance(fundMe.address);
        
        const transactionResponce = await fundMe.cheaperWithdraw();
        const transactionRecipt = await transactionResponce.wait(1);
        const { gasUsed, effectiveGasPrice } = transactionRecipt;
        const gasCost = gasUsed.mul(effectiveGasPrice);
        
        const deployersEndingBalance = await fundMe.provider.getBalance(deployer.address);
        const contractEndingAddress = await fundMe.provider.getBalance(fundMe.address);
        
        assert.equal(contractEndingAddress.toString(), "0");
        assert.equal(deployersStartingBalance.add(contractStartingBalance).toString(), deployersEndingBalance.add(gasCost).toString());
        
        await expect(fundMe.getFunders(0)).to.be.reverted;
        for (let i = 1; i < 6; i++) {
          assert.equal((await fundMe.getAddressToAmountFunded(accounts[i].address)).toString(), "0");
        }
      })

      it("only allow owner to withdraw the funds", async () => {
        const accounts = await ethers.getSigners();
        const attacker = accounts[1];
        const attackerConnectedContract = await fundMe.connect(attacker);
        expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner");
      })
    })
  })