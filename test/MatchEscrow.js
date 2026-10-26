const { expect } = require("chai"); const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
describe("MatchEscrow", () => {
  async function setup() { const [owner, a, b, oracle] = await ethers.getSigners(); const c = await ethers.deployContract("MatchEscrow", [oracle.address]); return { c, a, b, oracle }; }
  const mid = ethers.id("match1"), ref = ethers.id("hsp1"), stake = ethers.parseEther("0.01");
  it("settles native HSK to winner", async () => {
    const { c, a, b, oracle } = await setup(); const dl = (await time.latest()) + 3600;
    await c.connect(a).createDeal(b.address, ethers.ZeroAddress, stake, mid, ref, dl);
    await c.connect(a).fund(0, { value: stake }); await c.connect(b).fund(0, { value: stake });
    await expect(c.connect(a).settle(0, a.address)).to.be.revertedWith("oracle");
    await expect(c.connect(oracle).settle(0, b.address)).to.changeEtherBalance(b, stake * 2n);
  });
  it("refunds after deadline", async () => {
    const { c, a, b } = await setup(); const dl = (await time.latest()) + 60;
    await c.connect(a).createDeal(b.address, ethers.ZeroAddress, stake, mid, ref, dl);
    await c.connect(a).fund(0, { value: stake });
    await expect(c.refund(0)).to.be.revertedWith("too early");
    await time.increase(120);
    await expect(c.refund(0)).to.changeEtherBalance(a, stake);
  });
});
