import { expect } from 'chai'
import { ethers, artifacts } from 'hardhat'
import { parseUnits, formatEther } from 'ethers/lib/utils'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

describe('Lending', async () => {
  const data = {
    amount: 1000,
    projectId: 'testId'
  }

  async function setup() {
    const MockUSDC = await artifacts.readArtifact('MockUSDC')
    const Artifact = await artifacts.readArtifact('Lending')

    const [owner, sender, reciever] = await ethers.getSigners()

    const mockUSDCFactory = new ethers.ContractFactory(MockUSDC.abi, MockUSDC.bytecode, owner)
    const mockUSDCContract = await mockUSDCFactory.deploy()
    const factory = new ethers.ContractFactory(Artifact.abi, Artifact.bytecode, owner)
    const contract = await factory.deploy()

    await contract.addToken(mockUSDCContract.address)

    return { owner, sender, reciever, mockUSDCContract, contract }
  }

  describe('Make Lending and Borrowing', async () => {
    it('Lend and Borrow', async () => {
      const { owner, sender, reciever, mockUSDCContract, contract } = await loadFixture(setup)

      await mockUSDCContract.mint(sender.address, data.amount)

      const senderUsdc = mockUSDCContract.connect(sender)
      const senderContract = contract.connect(sender)
      const ownerContract = contract.connect(owner)

      await expect(await ownerContract.createProject(data.projectId, data.amount, mockUSDCContract.address))
        .to.emit(contract, 'ProjectCreateAction')
        .withArgs(data.projectId, owner.address, data.amount, mockUSDCContract.address)


      // await ownerEscrow.transferOwnership(newOwner.address)

      await expect(await senderUsdc.approve(contract.address, data.amount))
        .to.emit(senderUsdc, 'Approval')
        .withArgs(sender.address, contract.address, data.amount)


      await expect(await senderContract.lending(data.projectId, data.amount))
        .to.emit(contract, 'LoanAction')
        .withArgs(data.amount, data.projectId, sender.address)

      expect(JSON.parse(await mockUSDCContract.balanceOf(contract.address))).to.equal(data.amount)

      await expect(await ownerContract.borrow(data.projectId))
        .to.emit(contract, 'BorrowAction')
        .withArgs(data.projectId, owner.address, data.amount)

      expect(JSON.parse(await mockUSDCContract.balanceOf(owner.address))).to.equal(data.amount)
    })
  })
})
