
const { ethers, upgrades } = require("hardhat");

async function main() {
  const patreonFactory = await ethers.getContractFactory(process.env.BLIBLOU_PATREON_CONTRACT_NAME);
  const patreon = await upgrades.deployProxy(patreonFactory, []);
  // const patreon = await upgrades.upgradeProxy(process.env.BLIBLOU_PATREON_ADDRESS, patreonFactory);
  await patreon.deployed();
  return patreon.address;
}

main().then(res => {
  console.log(`${process.env.BLIBLOU_PATREON_CONTRACT_NAME} deployed to:`, res);
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
