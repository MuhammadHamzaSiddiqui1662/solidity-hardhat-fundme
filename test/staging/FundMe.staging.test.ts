import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert } from "chai";
import { ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { FundMe } from "../../typechain-types";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
    let fundMe: FundMe
		let deployer: SignerWithAddress

		const sendValue = ethers.utils.parseEther("0.1")
		beforeEach(async function () {
				const accounts = await ethers.getSigners()
				deployer = accounts[0]
				fundMe = await ethers.getContract("FundMe", deployer)
		})

		it("Allows people to fund and withdraw", async function () {
				await fundMe.fund({ value: sendValue })
				console.log("funding done...");
			//   await fundMe.withdraw({
			//     gasLimit: 100000,
			//   })
				const transactionResponce = await fundMe.withdraw();
				console.log("waiting for block...");
				const transactionRecipt = await transactionResponce.wait(1);
				console.log("withdrawl done...");
				const endingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
				)
				console.log(
						endingFundMeBalance.toString() +
								" should equal 0, running assert equal..."
				)
				assert.equal(endingFundMeBalance.toString(), "0");
		})
  })