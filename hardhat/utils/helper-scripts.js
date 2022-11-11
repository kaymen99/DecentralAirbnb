const { ethers } = require("hardhat");

const developmentChains = ["hardhat", "localhost", "ganache"];

function getAmountInWei(amount) {
  return ethers.utils.parseEther(amount.toString(), "ether");
}
function getAmountFromWei(amount) {
  return Number(ethers.utils.formatUnits(amount.toString(), "ether"));
}

module.exports = {
  developmentChains,
  getAmountFromWei,
  getAmountInWei,
};
