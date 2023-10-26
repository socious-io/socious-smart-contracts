import { expect } from 'chai'
import { ethers, artifacts } from 'hardhat'
import { parseUnits, formatEther } from 'ethers/lib/utils'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

describe('Lending', async () => {
  const data = {
    amount: 200000,
    lender1Amount: 80000,
    lender2Amount: 120000,
    monthly: 50650,
    fee: 650,
    repaymentPeriod: 4,
    projectId: 'testId'
  }

  async function setup() {
    const MockUSDC = await artifacts.readArtifact('MockUSDC')
    const Artifact = await artifacts.readArtifact('Lending')

    const [owner, sender, sender2] = await ethers.getSigners()

    const mockUSDCFactory = new ethers.ContractFactory(MockUSDC.abi, MockUSDC.bytecode, owner)
    const mockUSDCContract = await mockUSDCFactory.deploy()
    const factory = new ethers.ContractFactory(Artifact.abi, Artifact.bytecode, owner)
    const contract = await factory.deploy()

    await contract.addToken(mockUSDCContract.address)

    return { owner, sender, sender2, mockUSDCContract, contract }
  }

  describe('Make Lending and Borrowing', async () => {
    it('Lend and Borrow', async () => {
      const { owner, sender, sender2, mockUSDCContract, contract } = await loadFixture(setup)

      await mockUSDCContract.mint(sender.address, data.lender1Amount)
      await mockUSDCContract.mint(sender2.address, data.lender2Amount)

      const senderUsdc = mockUSDCContract.connect(sender)
      const sender2Usdc = mockUSDCContract.connect(sender2)
      const senderContract = contract.connect(sender)
      const sender2Contract = contract.connect(sender2)
      const ownerContract = contract.connect(owner)
      const ownerUsdc = mockUSDCContract.connect(owner)

      await expect(
        await ownerContract.createProject(data.projectId, data.amount, data.repaymentPeriod, mockUSDCContract.address)
      )
        .to.emit(contract, 'ProjectCreateAction')
        .withArgs(data.projectId, owner.address, data.amount, mockUSDCContract.address)

      await expect(await senderUsdc.approve(contract.address, data.lender1Amount))
        .to.emit(senderUsdc, 'Approval')
        .withArgs(sender.address, contract.address, data.lender1Amount)

      await expect(await sender2Usdc.approve(contract.address, data.lender2Amount))
        .to.emit(sender2Usdc, 'Approval')
        .withArgs(sender2.address, contract.address, data.lender2Amount)

      await expect(await senderContract.lending(data.projectId, data.lender1Amount))
        .to.emit(contract, 'LoanAction')
        .withArgs(data.lender1Amount, data.projectId, sender.address)

      await expect(await sender2Contract.lending(data.projectId, data.lender2Amount))
        .to.emit(contract, 'LoanAction')
        .withArgs(data.lender2Amount, data.projectId, sender2.address)

      expect(JSON.parse(await mockUSDCContract.balanceOf(contract.address))).to.equal(data.amount)

      await expect(await ownerContract.borrow(data.projectId))
        .to.emit(contract, 'BorrowAction')
        .withArgs(data.projectId, owner.address, data.amount)

      expect(JSON.parse(await mockUSDCContract.balanceOf(owner.address))).to.equal(data.amount)

      await expect(await ownerUsdc.approve(contract.address, data.monthly))
        .to.emit(ownerUsdc, 'Approval')
        .withArgs(owner.address, contract.address, data.monthly)

      await expect(await ownerContract.repayment(data.projectId))
        .to.emit(contract, 'RepaymentAction')
        .withArgs(data.projectId, data.monthly, data.fee)

      // TODO: check history
    })
  })
})
