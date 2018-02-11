var TimeClo = artifacts.require("./timeclock.sol");

module.exports = function(deployer, network, account) {
  // console.log(network)
  // console.log(account)
  deployer.deploy(TimeClo);
};
