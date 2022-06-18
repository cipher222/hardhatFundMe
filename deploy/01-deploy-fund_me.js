const { networkConfig, developmentChains } = require("../helper-hardhat-config") //same as writing const helperConfig = require("../helper-hardhat-config"), const networkConfig = helperConfig.networkConfig
const { network } = require("hardhat")
const { verify } = require("../utils/verify") //imports verify funtion
/*
 module.exports = function deployFunc(hre) {  [passes the hardhat object into hre]
     console.log("Hi")
     hre.getNamedAccounts
 }
module.exports.default = deployFunc(hre){}   [sets this funtion to be the default. This works becasue of hardhat-deploy plugin)
module.exports = async (hre) => {    [This is an anyonomis funtion and is identical to the example code above
    const {getNamedAccounts, deployments} = hre    [weird syntax that means hre.getNamedAccounts. hre is the same as using hardhat to import variables. Basicaly a way to import variables so everything can talk to echother 
*/
module.exports = async ({ getNamedAccounts, deployments }) => {
    /*this is a syntactical way to write the code above. Extrapolates the variables right in the funtion decloration. 
The Hardhat Runtime Environment, or HRE for short, is an object containing all the functionality that Hardhat exposes when running a task, 
test or script. In reality, Hardhat is the HRE. When adding the variable names of some of hre's variables in our constructor we let the hardhat-deploy plugin know
we want the hre funtionality passed into those variables (in this case getNamedAccounts, deployments*/

    const { deploy, log } = deployments //imports deploy and log funtions from deployments
    const { deployer } = await getNamedAccounts() //this is a function returning an object whose keys are names and values are addresses. It is parsed from the namedAccounts hardhat.config.js
    const chainId = network.config.chainId

    //if chain id is X  use address Y
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator") //get gets the most recent deployed contract with the name MockV3Aggregator
        ethUsdPriceFeedAddress = ethUsdAggregator.address //gets mock constract address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] //gets the actual address from the .config file
    }
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put pricefeed address becuase that is passed into the constructor
        log: true, //gives us the transaction address
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
        //if the development chains not include
    }
    log("------------------------------------------------")
}
module.exports.tags = ["all", "fundme"]
