require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();
require("./tasks/withdraw.js");

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: process.env.ALCHEMY_STAGING_URL,
      accounts: [ process.env.PRIVATE_KEY ]
    },
    mainnet: {
      chainId: 1,
      url: process.env.ALCHEMY_PROD_URL,
      accounts: [ process.env.PRIVATE_KEY ]
    }
  }
};
