require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY], //this is how you add an account. You can also add more than one account to this array
            chainId: 4,
            blockConfirmations: 6,
        },
        localhosts: {
            url: "http//127.0.0.1:8545/",
            chainId: 31337, //does not need acounts because a local host
        },
        // gasReporter: {
        //     enbled: true,
        //     outputFile: "gas-report.txt",
        //     noColors: true,
        //     currency: "USD",
        //     coinmarketca p: COINMARKETCAP_API_KEY,
        // },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, //the  0ith account is always deployer
        },
    },
}
