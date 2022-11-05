const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
async function getBalance({ address }) {
  return await ethers.provider.getBalance(address);
}

describe("Patreon", () => {

  let patreon, owner, supporter1, supporter2, supporter3;

  before(async () => {
    [ owner, supporter1, supporter2, supporter3 ] = await ethers.getSigners();
    const patreonFactory = await ethers.getContractFactory(process.env.BLIBLOU_PATREON_CONTRACT_NAME);
    patreon = await upgrades.deployProxy(patreonFactory, []);
    await patreon.deployed();
  });

  it("allows supporters to send their support", async () => {
    const support = { value: ethers.utils.parseEther("1") };
    await Promise.all([ supporter1, supporter2, supporter3 ].map(async (supporter, index) => {
      const intialBalance = await getBalance(supporter);
      await patreon.connect(supporter).sendSupport(`Supporter ${index}`, `Supporter ${index} message`, support);
      expect(await getBalance(supporter) < intialBalance.sub(ethers.utils.parseEther("1"))).to.equal(true);
    }));
  });

  it("stores contract's balance", async () => {
    expect(await getBalance(patreon)).to.equal(ethers.utils.parseEther("3"));
  });
  
  it("is upgradeable", async () => {
    const { address } = patreon;
    const patreonFactory = await ethers.getContractFactory(process.env.BLIBLOU_PATREON_CONTRACT_NAME);
    patreon = await upgrades.upgradeProxy(address, patreonFactory);
    await patreon.deployed();
    expect(patreon.address).to.equal(address);
    expect(await getBalance(patreon)).to.equal(ethers.utils.parseEther("3"));
  });

  it("stores supports", async () => {
    const lastBlock = await ethers.provider.getBlock("latest")
    const blocks = [ 
      await ethers.provider.getBlock(lastBlock.number - 2 ),
      await ethers.provider.getBlock(lastBlock.number - 1 ),
      lastBlock
    ];
    (await patreon.getSupports()).forEach(async (support, index) => {
      expect(support.from).to.equal([ supporter1, supporter2, supporter3 ][ index ].address);
      expect(support.timestamp).to.equal(blocks[ index ].timestamp);
      expect(support.name).to.equal(`Supporter ${index}`);
      expect(support.message).to.equal(`Supporter ${index} message`);
    });
  });

  it("Allows owner only to withdraw supoprts", async () => {
    const intialBalance = await getBalance(owner);
    await expect(patreon.connect(supporter1).withdrawSupports()).to.be.revertedWith("Ownable: caller is not the owner");
    await patreon.withdrawSupports();
    expect(await getBalance(patreon)).to.equal(0);
    expect(await getBalance(owner) > intialBalance.add(ethers.utils.parseEther("2.99"))).to.equal(true);
  });
});
