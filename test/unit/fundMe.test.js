const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat") //{} abstracts deployments, getNamedAccounts, and ethers from hardhat which is very simlular to the hre used before

describe("FundMe", async function () {
    let fundMe
    let deployer
    let MockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function () {
        //deploy our fundMe contract
        //using Hardhat-deploy
        //const accounts = awiat ethers/getSigners() ==> this will automaticaly get the account under you networks account section in hardhat.config
        deployer = (await getNamedAccounts()).deployer //{} abstracts just the deployer from getNamedAccounts, and assigns that object to deployer. When used in getContract, fundMe will automaticaly be from the deployer
        await deployments.fixture(["all"]) //when we the fixtures command we will run all of our scripts with the tag "all"
        fundMe = await ethers.getContract("FundMe", deployer) //hardhat-deploy wrapes ethers with a getContract function. This funtion gets the most recent deployment of whatever contract we tell it
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.priceFeed()
            assert.equal(response, MockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("fails if you don't send enough ETH", async function () {
            //await fundMe.fund() ==> we want this to fail but our tests need to know that. Solution below!
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("updated the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmountFunded(deployer) //you can call mappings like funtions
            assert.equal(response.toString(), sendValue.toString())
        })
        it("checks to see if the address is added to the funders array", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })
    describe("withdraw", async function () {
        //explained at 11:34 ==> watch on return :)
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraw ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Assert
            // Maybe clean up to understand the testing
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("allows us to withdraw with multiple funders", async function () {
            //arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    //we create new objects/accounts to connect to the contract
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            //assert
            //make sure that the funders array is reset properly
            await expect(fundMe.funders(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.addressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        it("allows only the owner to withdraw funds", async function () {
            const accounts = await await ethers.getSigners()
            const fundMeConnectedContract = await fundMe.connect(accounts[1])
            await expect(fundMeConnectedContract.withdraw()).to.be.reverted
        })
    })
})
