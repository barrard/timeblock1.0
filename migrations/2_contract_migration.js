var TimeClock = artifacts.require("./TimeClock2.sol");

module.exports = function(deployer, network, account) {
  // console.log(network)
  // console.log(account)
  deployer.deploy(TimeClock);
};
