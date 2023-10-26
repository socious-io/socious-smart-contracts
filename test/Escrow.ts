import { expect } from 'chai'
import { ethers, artifacts } from 'hardhat'
import { parseUnits, formatEther } from 'ethers/lib/utils'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

describe('Escrow', async () => {
  const data = {
    escrowId: 0,
    amount: 100,
    jobId: 'testId',
    expectedEscrowFee: 3,
    expectedAmount: 103,
    expectedWithdrawnAmount: 90,
    expectedWithdrawnFee: 10,
    expectedRefundAmount: 1,
    expectedRefundFee: 1
  }

  async function escrowSetup() {
    const MockUSDC = await artifacts.readArtifact('MockUSDC')
    const EscrowArtifact = await artifacts.readArtifact('Escrow')

    const [owner, sender, reciever, newOwner] = await ethers.getSigners()

    const mockUsdcFactory = new ethers.ContractFactory(MockUSDC.abi, MockUSDC.bytecode, owner)
    const mockUsdcContract = await mockUsdcFactory.deploy()

    const escrowFactory = new ethers.ContractFactory(EscrowArtifact.abi, EscrowArtifact.bytecode, owner)
    const escrowContract = await escrowFactory.deploy()

    await escrowContract.addToken(mockUsdcContract.address, { gasLimit: 5000000 })

    return { owner, sender, reciever, newOwner, mockUsdcContract, escrowContract }
  }

  describe('Validate token interface from Escrow', async () => {
    it('Should bring the properties from the token', async () => {
      const { mockUsdcContract, escrowContract } = await loadFixture(escrowSetup)
      expect(await escrowContract.validTokens(0)).to.equal(mockUsdcContract.address)
    })
  })

  describe('Make and escrow and transfer funds correctly', async () => {
    it('Put and Withdrawn escrow', async () => {
      const { owner, sender, reciever, newOwner, mockUsdcContract, escrowContract } = await loadFixture(escrowSetup)

      await mockUsdcContract.mint(sender.address, data.expectedAmount)

      const senderUsdc = mockUsdcContract.connect(sender)
      const senderEscrow = escrowContract.connect(sender)
      const ownerEscrow = escrowContract.connect(owner)

      await ownerEscrow.setBeneficiary(newOwner.address)

      await expect(await senderUsdc.approve(escrowContract.address, data.expectedAmount))
        .to.emit(senderUsdc, 'Approval')
        .withArgs(sender.address, escrowContract.address, data.expectedAmount)

      await expect(
        await senderEscrow.newEscrow(reciever.address, data.jobId, data.amount, false, mockUsdcContract.address)
      )
        .to.emit(senderEscrow, 'EscrowAction')
        .withArgs(
          data.escrowId,
          data.expectedEscrowFee,
          data.amount,
          sender.address,
          data.jobId,
          mockUsdcContract.address
        )
      await expect(await senderEscrow.withdrawn(data.escrowId))
        .to.emit(escrowContract, 'TransferAction')
        .withArgs(data.escrowId, reciever.address, data.expectedWithdrawnFee, data.expectedWithdrawnAmount)
      expect(JSON.parse(await mockUsdcContract.balanceOf(newOwner.address))).to.equal(13)
    })
  })

  describe('Resolution for escrow decision and helper functions', async () => {
    it('Should refund to organization', async () => {
      const { owner, sender, reciever, mockUsdcContract, escrowContract } = await loadFixture(escrowSetup)

      await mockUsdcContract.mint(sender.address, parseUnits('3.0', 'ether'))

      const senderUsdc = mockUsdcContract.connect(sender)
      const senderEscrow = escrowContract.connect(sender)
      const ownerEscrow = escrowContract.connect(owner)

      await senderUsdc.approve(escrowContract.address, data.expectedAmount)
      await senderEscrow.newEscrow(sender.address, data.jobId, data.amount, false, mockUsdcContract.address)
      await senderEscrow.setContributor(data.escrowId, reciever.address)

      expect(await ownerEscrow.escrowDecision(data.escrowId, true))
        .to.emit(escrowContract, 'TransferAction')
        .withArgs(data.escrowId, sender.address, data.expectedRefundFee, data.expectedRefundAmount)
      expect(JSON.parse(await mockUsdcContract.balanceOf(owner.address))).to.equal(1)
    })

    it('Should refund to contributor', async () => {
      const { owner, sender, reciever, mockUsdcContract, escrowContract } = await loadFixture(escrowSetup)

      await mockUsdcContract.mint(sender.address, parseUnits('3.0', 'ether'))

      const senderUsdc = mockUsdcContract.connect(sender)
      const senderEscrow = escrowContract.connect(sender)
      const ownerEscrow = escrowContract.connect(owner)

      await senderUsdc.approve(escrowContract.address, data.expectedAmount)
      await senderEscrow.newEscrow(sender.address, data.jobId, data.amount, false, mockUsdcContract.address)
      await senderEscrow.setContributor(data.escrowId, reciever.address)

      expect(await ownerEscrow.escrowDecision(data.escrowId, false))
        .to.emit(escrowContract, 'TransferAction')
        .withArgs(data.escrowId, sender.address, data.expectedWithdrawnFee, data.expectedWithdrawnFee)
      expect(JSON.parse(await mockUsdcContract.balanceOf(owner.address))).to.equal(13)
    })
  })
})
