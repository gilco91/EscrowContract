var EscrowManager = artifacts.require("./EscrowManager.sol");

module.exports = function(deployer) {
  deployer.deploy(EscrowManager);
};