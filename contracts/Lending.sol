// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/interfaces/IERC20.sol';

contract Lending is Ownable {
    string public version = '0.1.0';

    IERC20[] public validTokens;

    uint private payoutFee = 1;
    uint private decisionFee = 1;

    enum Status {
        IN_PROGRESS,
        COMPELETED,
        CANCELED
    }
    Status choice;
    Status constant defaultChoice = Status.IN_PROGRESS;

    struct Project {
        string id;
        address owner;
        uint256 goalAmount;
        Status status;
        IERC20 token;
    }

    struct LoanData {
        address lenderAddress;
        string projectId;
        uint256 amount;
    }

    struct BorrowData {
        string projectId;
        address borrower;
        uint amount;
    }

    Project[] public projects;
    LoanData[] public lendingHistory;
    BorrowData[] public borrowHistory;

    event LoanAction(uint256 amount, string projectId, address lenderAddress);
    event BorrowAction(string projectId, address borrower, uint256 amount);
    event ProjectCreateAction(string projectId, address owner, uint256 goalAmount, IERC20 token);

    constructor() {
        address msgSender = _msgSender();
        emit OwnershipTransferred(address(0), msgSender);
    }

    /* --------------------- Admin actions  ---------------------------- */
    function addToken(IERC20 _token) public onlyOwner returns (bool) {
        if (_tokenExists(_token)) {
            return false;
        }

        validTokens.push(_token);
        return true;
    }

    /* --------------------- Public actions  ---------------------------- */

    function createProject(string memory _projectId, uint256 _goalAmount, IERC20 _token) public {
        int index = _projectExists(_projectId);
        require(index < 0, 'Project already exists');

        projects.push(
            Project({
                id: _projectId,
                goalAmount: _goalAmount,
                owner: msg.sender,
                token: _token,
                status: Status.IN_PROGRESS
            })
        );

        emit ProjectCreateAction(_projectId, msg.sender, _goalAmount, _token);
    }

    function lending(string memory _projectId, uint256 _amount) public {
        int index = _projectExists(_projectId);
        require(index >= 0, 'Project not exists');

        uint i = uint(index);
        IERC20 token = projects[i].token;

        require(_tokenExists(token), 'Token is not valid');
        require(token.balanceOf(msg.sender) >= _amount, 'Not enough funds');
        require(token.allowance(msg.sender, address(this)) >= _amount, 'Not enough allowance');

        bool successLock = token.transferFrom(msg.sender, address(this), _amount);
        require(successLock, 'Funds lockment failed!');

        lendingHistory.push(LoanData({ lenderAddress: msg.sender, projectId: _projectId, amount: _amount }));

        emit LoanAction(_amount, _projectId, msg.sender);
    }

    function borrow(string memory _projectId) public {
        int index = _projectExists(_projectId);
        require(index >= 0, 'Project not exists');

        uint i = uint(index);
        require(projects[i].owner == msg.sender, 'Sender must be owner');
        require(projects[i].status == Status.IN_PROGRESS, 'Project status is not valid for this action');

        uint256 totalAmount = _lendedAmount(_projectId);
        require(totalAmount >= projects[i].goalAmount, 'total amount is less than project goal amount');

        require(projects[i].token.balanceOf(address(this)) >= totalAmount, 'Not enough funds int contract');
        bool successLock = projects[i].token.transfer(msg.sender, totalAmount);
        require(successLock, 'Funds lockment failed!');

        projects[i].status = Status.COMPELETED;

        emit BorrowAction(_projectId, msg.sender, totalAmount);
    }

    /* ------------------------ Internals ----------------------------- */

    function _lendedAmount(string memory _projectId) internal view returns (uint256) {
        uint256 totalAmount = 0;
        for (uint i = 0; i < lendingHistory.length; i++) {
            if (keccak256(abi.encodePacked(lendingHistory[i].projectId)) == keccak256(abi.encodePacked(_projectId))) {
                totalAmount += lendingHistory[i].amount;
            }
        }
        return totalAmount;
    }

    function _projectExists(string memory _projectId) internal view returns (int) {
        for (uint i = 0; i < projects.length; i++) {
            if (keccak256(abi.encodePacked(projects[i].id)) == keccak256(abi.encodePacked(_projectId))) {
                return int(i);
            }
        }
        return -1;
    }

    function _tokenExists(IERC20 _token) internal view returns (bool) {
        for (uint i = 0; i < validTokens.length; i++) {
            if (validTokens[i] == _token) {
                return true;
            }
        }
        return false;
    }
}
