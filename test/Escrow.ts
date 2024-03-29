import { expect } from 'chai'
import { ethers, artifacts } from 'hardhat'
import { parseUnits } from 'ethers/lib/utils'
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

    const [owner, sender, reciever, newOwner, orgReferrer, contReferrer] = await ethers.getSigners()

    const mockUsdcFactory = new ethers.ContractFactory(MockUSDC.abi, MockUSDC.bytecode, owner)
    const mockUsdcContract = await mockUsdcFactory.deploy()

    const escrowFactory = new ethers.ContractFactory(EscrowArtifact.abi, EscrowArtifact.bytecode, owner)
    const escrowContract = await escrowFactory.deploy()

    await escrowContract.addToken(mockUsdcContract.address, { gasLimit: 5000000 })

    return { owner, sender, reciever, newOwner, mockUsdcContract, escrowContract, orgReferrer, contReferrer }
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
        await senderEscrow.newEscrow(
          reciever.address,
          data.jobId,
          data.amount,
          false,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          false,
          false,
          mockUsdcContract.address)
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
      await senderEscrow.newEscrow(
        sender.address,
        data.jobId,
        data.amount,
        false,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        false,
        false,
        mockUsdcContract.address
      )
      await senderEscrow.setContributor(data.escrowId, reciever.address, ethers.constants.AddressZero, false)

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
      await senderEscrow.newEscrow(
        sender.address,
        data.jobId,
        data.amount,
        false,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        false,
        false,
        mockUsdcContract.address)
      await senderEscrow.setContributor(data.escrowId, reciever.address, ethers.constants.AddressZero, false)

      expect(await ownerEscrow.escrowDecision(data.escrowId, false))
        .to.emit(escrowContract, 'TransferAction')
        .withArgs(data.escrowId, sender.address, data.expectedWithdrawnFee, data.expectedWithdrawnFee)
      expect(JSON.parse(await mockUsdcContract.balanceOf(owner.address))).to.equal(13)
    })
  })

  describe('Referral system', async () => {
    it('Should apply benefits if organization is referred', async () => {
      const { owner, sender, reciever, mockUsdcContract, escrowContract, orgReferrer } = await loadFixture(escrowSetup)

      await mockUsdcContract.mint(sender.address, parseUnits('3.0', 'ether'))

      const senderUsdc = mockUsdcContract.connect(sender)
      const senderEscrow = escrowContract.connect(sender)

      await senderUsdc.approve(escrowContract.address, 1015)
      
      await expect(await senderEscrow.newEscrow(reciever.address, data.jobId, 1000, false, orgReferrer.address, ethers.constants.AddressZero, true, false, mockUsdcContract.address))
        .to.emit(escrowContract, 'EscrowAction')
        .withArgs(data.escrowId, 15, 1000, sender.address, data.jobId, mockUsdcContract.address)

      await expect(await senderEscrow.withdrawn(data.escrowId))
        .to.emit(escrowContract, 'TransferAction')
        .withArgs(data.escrowId, reciever.address, 100, 900)
      
      expect(JSON.parse(await mockUsdcContract.balanceOf(owner.address))).to.equal(106)
      expect(JSON.parse(await mockUsdcContract.balanceOf(orgReferrer.address))).to.equal(9)
    })

    it('Should apply benefits if contributor is referred', async () => {
      const { owner, sender, reciever, mockUsdcContract, escrowContract, contReferrer } = await loadFixture(escrowSetup)

      await mockUsdcContract.mint(sender.address, parseUnits('3.0', 'ether'))

      const senderUsdc = mockUsdcContract.connect(sender)
      const senderEscrow = escrowContract.connect(sender)

      await senderUsdc.approve(escrowContract.address, 1030)
      
      await expect(await senderEscrow.newEscrow(
        reciever.address,
        data.jobId,
        1000,
        false,
        ethers.constants.AddressZero,
        contReferrer.address,
        false,
        true,
        mockUsdcContract.address
      ))
        .to.emit(escrowContract, 'EscrowAction')
        .withArgs(data.escrowId, 30, 1000, sender.address, data.jobId, mockUsdcContract.address)

      await expect(await senderEscrow.withdrawn(data.escrowId))
        .to.emit(escrowContract, 'TransferAction')
        .withArgs(data.escrowId, reciever.address, 50, 950)
      
      expect(JSON.parse(await mockUsdcContract.balanceOf(owner.address))).to.equal(71)
      expect(JSON.parse(await mockUsdcContract.balanceOf(contReferrer.address))).to.equal(9)
    })

    it('Should apply benefits if organization and contributor are referred by different users', async () => {
      const { owner, sender, reciever, mockUsdcContract, escrowContract, orgReferrer, contReferrer } = await loadFixture(escrowSetup)

      await mockUsdcContract.mint(sender.address, parseUnits('3.0', 'ether'))

      const senderUsdc = mockUsdcContract.connect(sender)
      const senderEscrow = escrowContract.connect(sender)

      await senderUsdc.approve(escrowContract.address, 1015)
      
      await expect(await senderEscrow.newEscrow(
        reciever.address,
        data.jobId,
        1000,
        false,
        orgReferrer.address,
        contReferrer.address,
        true,
        true,
        mockUsdcContract.address
      ))
        .to.emit(escrowContract, 'EscrowAction')
        .withArgs(data.escrowId, 15, 1000, sender.address, data.jobId, mockUsdcContract.address)

      await expect(await senderEscrow.withdrawn(data.escrowId))
        .to.emit(escrowContract, 'TransferAction')
        .withArgs(data.escrowId, reciever.address, 50, 950)
      
      expect(JSON.parse(await mockUsdcContract.balanceOf(owner.address))).to.equal(47)
      expect(JSON.parse(await mockUsdcContract.balanceOf(orgReferrer.address))).to.equal(9)
      expect(JSON.parse(await mockUsdcContract.balanceOf(contReferrer.address))).to.equal(9)
    })
  })
})
