// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/interfaces/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Escrow is Ownable(msg.sender) {
    string public version;
    address public beneficiaryAddress;
    mapping(uint256 => IERC20) public validTokens;
    uint256 public tokensLength;

    uint private noImpactContFee;
    uint private impactContFee;
    uint private noImpactOrgFee;
    uint private impactOrgFee;
    uint private decisionRetentionFee;
    uint private referredOrgFeeDiscount;
    uint private referredContFeeDiscount;
    uint private referringOrgBonus;
    uint private referringContBonus;

    enum EscrowStatus {
        IN_PROGRESS,
        COMPELETED,
        CANCELED
    }
    EscrowStatus choice;
    EscrowStatus constant defaultChoice = EscrowStatus.IN_PROGRESS;

    // Escrow and funds relatios save here
    struct EscrowData {
        address organization;
        address contributor;
        string jobId;
        uint amount; // Escrow amount value
        uint fee; // Fee cost for escrow amount already taken
        bool verifiedOrg;
        address addressReferringOrg; // Null if absent
        address addressReferringCont; // Null if absent
        bool applyOrgFeeDiscount;
        bool applyContFeeDiscount;
        EscrowStatus status;
        IERC20 token;
    }

    // History of transaction
    struct TransactionData {
        uint256 escrowId; // escrow index id
        uint amount; // Transaction amount
        uint fee; // Fee cost for transaction
    }

    mapping(uint256 => EscrowData) public escrowHistory;
    uint256 public escrowHistoryLength;
    mapping(address => TransactionData[]) public transactionsHistory;

    event EscrowAction(uint256 id, uint256 fee, uint256 amount, address organization, string jobId, IERC20 token);

    event TransferAction(uint256 escrowId, address destination, uint256 fee, uint256 amount);

    
    constructor() {
        
        version = '0.1.0';
        noImpactContFee = 10;
        impactContFee = 5;
        noImpactOrgFee = 3;
        impactOrgFee = 2;
        decisionRetentionFee = 1;
        referredOrgFeeDiscount = 50;
        referredContFeeDiscount = 50;
        referringOrgBonus = 1;
        referringContBonus = 1;
        escrowHistoryLength = 0;
        tokensLength = 0;

        beneficiaryAddress = msg.sender;
    }


    /* --------------------- Public actions  ---------------------------- */

    function getNoImpactContFee() public view returns (uint) {
        return noImpactContFee;
    }

    function getNoImpactOrgFee() public view returns (uint) {
        return noImpactOrgFee;
    }

    function getImpactContFee() public view returns (uint) {
        return impactContFee;
    }

    function getImpactOrgFee() public view returns (uint) {
        return impactOrgFee;
    }

    function getDecisionRetentionFee() public view returns (uint) {
        return decisionRetentionFee;
    }

    function getReferredOrgFeeDiscount() public view returns (uint) {
        return referredOrgFeeDiscount;
    }

    function getReferredContFeeDiscount() public view returns (uint) {
        return referredContFeeDiscount;
    }

    function getReferringOrgBonus() public view returns (uint) {
        return referringOrgBonus;
    }

    function getReferringContBonus() public view returns (uint) {
        return referringContBonus;
    }

    function getEscrow(uint256 _escrowId) external view returns (EscrowData memory) {
        EscrowData memory escrow = escrowHistory[_escrowId];
        return escrow;
    }

    function getEscrowId(
      address _organization,
      address _contributor,
      string memory _jobId,
      uint256 _amount
    ) external view returns (uint256) {
    for (uint i; i < escrowHistoryLength; i++) {
        if (
            escrowHistory[i].organization == _organization &&
            escrowHistory[i].contributor == _contributor &&
            keccak256(bytes(escrowHistory[i].jobId)) == keccak256(bytes(_jobId)) &&
            escrowHistory[i].amount == _amount
        ) {
            return i + 1;
        }
    }
    require(false, 'Escrow not found');
    return 0;
    }

    /* --------------------- Organization actions  ---------------------------- */

    function newEscrow(
        address _contributor,
        string memory _jobId,
        uint256 _amount,
        bool _verifiedOrg,
        address _addressReferringOrg, // Null if absent
        address _addressReferringCont, // Null if absent
        bool _applyOrgFeeDiscount,
        bool _applyContFeeDiscount,
        IERC20 _token
    ) external returns (uint256) {
        require(_tokenExists(_token), 'Token is not valid');

        uint256 fee = _calculatesOrgFee(_amount, _verifiedOrg, _applyOrgFeeDiscount);

        // Avoiding "Stack too deep" error with separate scope
        {
          uint256 totalAmount = _amount + fee;

          require(_token.balanceOf(msg.sender) >= totalAmount, 'Not enough funds');
          require(_token.allowance(msg.sender, address(this)) >= totalAmount, 'Not enough allowance');

          bool successLock = _token.transferFrom(msg.sender, address(this), totalAmount);
          require(successLock, 'Funds lockment failed!');
        }

        escrowHistory[escrowHistoryLength] = EscrowData({
                organization: msg.sender,
                contributor: _contributor,
                jobId: _jobId,
                amount: _amount,
                fee: fee,
                token: _token,
                status: EscrowStatus.IN_PROGRESS,
                verifiedOrg: _verifiedOrg,
                addressReferringOrg: _addressReferringOrg,
                addressReferringCont: _addressReferringCont,
                applyOrgFeeDiscount: _applyOrgFeeDiscount,
                applyContFeeDiscount: _applyContFeeDiscount
            });

        uint256 escrowId = escrowHistoryLength;
        escrowHistoryLength++;

        emit EscrowAction(escrowId, fee, _amount, msg.sender, _jobId, _token);
        return escrowId;
    }

    function setContributor(
        uint256 _escrowId,
        address _contributor,
        address _addressReferringCont, // Null if absent
        bool _applyContFeeDiscount
    ) external {
        EscrowData memory escrow = escrowHistory[_escrowId];
        require(_contributor != escrow.contributor || msg.sender == escrow.contributor, 'Not allow');
        require(
            msg.sender == escrow.organization || msg.sender == owner(),
            'Only the organization allow to set Contributer'
        );

        escrowHistory[_escrowId].contributor = _contributor;
        escrowHistory[_escrowId].addressReferringCont = _addressReferringCont;
        escrowHistory[_escrowId].applyContFeeDiscount = _applyContFeeDiscount;
    }

    function withdrawn(uint256 _escrowId) public {
        EscrowData memory escrow = escrowHistory[_escrowId];

        require(
            escrow.organization == msg.sender || owner() == msg.sender,
            'Only the organization allow to withdrawn escrow'
        );
        require(escrow.status == EscrowStatus.IN_PROGRESS, 'Escrow status is not valid to withdrawn');

        uint256 contributorFee = _calculatesContFee(escrow.amount, escrow.verifiedOrg, escrow.applyContFeeDiscount);
        uint256 amount = escrow.amount - contributorFee;
        uint256 ownerFee = escrow.fee + contributorFee;

        require(escrow.token.balanceOf(address(this)) >= amount, 'Not enough funds at the contract');

        // Organization referred
        if (escrow.addressReferringOrg != address(0)) {
          uint256 referringBonus = escrow.amount / 100 * referringOrgBonus;
          ownerFee -= referringBonus;

          bool addressReferringOrgTransfer = escrow.token.transfer(escrow.addressReferringOrg, referringBonus);
          require(addressReferringOrgTransfer, 'Transfer to address referring organization failed');
        }

        // Contributor referred
        if (escrow.addressReferringCont != address(0)) {
          uint256 referringBonus = escrow.amount / 100 * referringContBonus;
          ownerFee -= referringBonus;

          bool addressReferringContTransfer = escrow.token.transfer(escrow.addressReferringCont, referringBonus);
          require(addressReferringContTransfer, 'Transfer to address referring contributor failed');
        }

        bool successTransfer = escrow.token.transfer(escrow.contributor, amount);
        require(successTransfer, 'Transfer to contributor failed');

        bool ownerRewardTransfer = escrow.token.transfer(beneficiaryAddress, ownerFee);
        require(ownerRewardTransfer, 'Transfer fee to owners failed');

        escrowHistory[_escrowId].status = EscrowStatus.COMPELETED;

        transactionsHistory[escrow.contributor].push(
            TransactionData({ escrowId: _escrowId, amount: amount, fee: ownerFee })
        );

        emit TransferAction(_escrowId, escrow.contributor, contributorFee, amount);
    }

    /* --------------------- Admin actions ---------------------------- */

    function escrowDecision(uint256 _escrowId, bool _refund) external onlyOwner {
        EscrowData memory escrow = escrowHistory[_escrowId];
        require(escrow.status == EscrowStatus.IN_PROGRESS, 'Escrow status is not valid for decision');
        if (_refund) {
            uint256 amount = escrow.amount + escrow.fee;
            uint256 fee = (amount / 100) * decisionRetentionFee;
            uint256 refundAmount = amount - fee;

            require(escrow.token.balanceOf(address(this)) >= refundAmount, 'Not enough funds at the contract');

            bool successTransfer = escrow.token.transfer(escrow.organization, refundAmount);
            require(successTransfer, 'Refund to organization failed');

            bool ownerRewardTransfer = escrow.token.transfer(beneficiaryAddress, fee);
            require(ownerRewardTransfer, 'Transfer fee to owners failed');

            transactionsHistory[escrow.organization].push(
                TransactionData({ escrowId: _escrowId, amount: refundAmount, fee: fee })
            );

            escrowHistory[_escrowId].status = EscrowStatus.CANCELED;

            emit TransferAction(_escrowId, escrow.organization, fee, amount);
        } else {
            withdrawn(_escrowId);
        }
    }


    function setBeneficiary(address _address) external onlyOwner {
        beneficiaryAddress = _address;
    }


    function setNoImpactContFee(uint _newFee) external onlyOwner {
        require(_newFee != getNoImpactContFee());
        noImpactContFee = _newFee;
    }

    function setNoImpactOrgFee(uint _newFee) external onlyOwner {
        require(_newFee != getNoImpactOrgFee());
        noImpactOrgFee = _newFee;
    }

    function setImpactContFee(uint _newFee) external onlyOwner {
        require(_newFee != getImpactContFee());
        impactContFee = _newFee;
    }

    function setImpactOrgFee(uint _newFee) external onlyOwner {
        require(_newFee != getImpactOrgFee());
        impactOrgFee = _newFee;
    }

    function setDecisionRetentionFee(uint _newFee) external onlyOwner {
        require(_newFee != getDecisionRetentionFee());
        decisionRetentionFee = _newFee;
    }

    function setReferredOrgFeeDiscount(uint _newDiscount) external onlyOwner {
        require(_newDiscount != getReferredOrgFeeDiscount());
        require(_newDiscount <= 100, "Discount cannot be more than 100%");

        referredOrgFeeDiscount = _newDiscount;
    }

    function setReferredContFeeDiscount(uint _newDiscount) external onlyOwner {
        require(_newDiscount != getReferredContFeeDiscount());
        require(_newDiscount <= 100, "Discount cannot be more than 100%");

        referredContFeeDiscount = _newDiscount;
    }

    function setReferringOrgBonus(uint _newFee) external onlyOwner {
        require(_newFee != getReferringOrgBonus());

        referringOrgBonus = _newFee;
    }

    function setReferringContBonus(uint _newFee) external onlyOwner {
        require(_newFee != getReferringContBonus());

        referringContBonus = _newFee;
    }

    function addToken(IERC20 _token) external onlyOwner returns (bool) {
        if (_tokenExists(_token)) {
            return false;
        }

        validTokens[tokensLength] = _token;
        tokensLength++;
        return true;
    }

    // rewards value
    function collectIncomeValue(IERC20 _token) external view onlyOwner returns (uint256) {
        uint256 balance = _token.balanceOf(address(this));
        uint256 totalAmount = 0;
        for (uint i = 0; i < escrowHistoryLength; i++) {
            if (escrowHistory[i].status == EscrowStatus.IN_PROGRESS) {
                totalAmount += escrowHistory[i].amount;
            }
        }

        return balance - totalAmount;
    }

    /* It may use for transfer assets to new Escrow contract version or
        use for collecting fees
    */
    function transferAssets(address destination, IERC20 _token) external onlyOwner {
        uint256 balance = _token.balanceOf(address(this));
        require(balance >= 0, 'Not enough funds at the contract');

        bool success = _token.transfer(destination, balance);
        require(success, 'Transfer failed');
    }

    /* ------------------------ Internals ----------------------------- */
    function _calculatesOrgFee(uint256 _value, bool _verified, bool _applyOrgFeeDiscount) internal view returns (uint256) {
        uint _fee = noImpactOrgFee;
        if (_verified) _fee = impactOrgFee;

        _fee = (_value / 100) * _fee; // Fee without referring system discount
        if (_applyOrgFeeDiscount) _fee = _fee - (_fee * referredOrgFeeDiscount / 100);

        return _fee;
    }

    function _calculatesContFee(uint256 _value, bool _verified, bool _applyContFeeDiscount) internal view returns (uint256) {
        uint _fee = noImpactContFee;
        if (_verified) _fee = impactContFee;

        _fee = (_value / 100) * _fee; // Fee without referring system discount
        if (_applyContFeeDiscount) _fee = _fee - (_fee * referredContFeeDiscount / 100);

        return _fee;
    }

    function _tokenExists(IERC20 _token) internal view returns (bool) {
        for (uint i = 0; i < tokensLength; i++) {
            if (validTokens[i] == _token) {
                return true;
            }
        }
        return false;
    }
}
