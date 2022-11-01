require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  networks: {
    defaultNetwork: "hardhat",
    hardhat: {
      chainId: 31337
    },
    ganache: {
      chainId: 1337,
      url: "http://127.0.0.1:7545",
      accounts: ["ganache-private-key"]
    }
    // mumbai: {
    //   url: MUMBAI_RPC_URL,
    //   accounts: [process.env.PRIVATE_KEY],
    //   chainId: 80001,
    // },
    // polygon: {
    //   url: POLYGON_RPC_URL,
    //   accounts: [process.env.PRIVATE_KEY]
    //   chainId: 137,
    // }
  },
  paths: {
    artifacts: "./artifacts"
  },
  etherscan: {
    apikey: process.env.ETHERSCAN_API_KEY,
  }
};

