const MyTunes = artifacts.require("MyTunes");

module.exports = function (deployer) {
  deployer.deploy(MyTunes, { gas: 6000000 });
};

