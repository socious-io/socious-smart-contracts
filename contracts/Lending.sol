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
      string ownerId;
      uint256 goalAmount;
    }

    struct LoanData {
        address lenderAddress;
        string projectId;
        uint256 amount;
        IERC20 token;
    }

    struct PayoutData {
        uint256[] LoanIndexes;
        string projectId;
        address borrower;
        uint amount;
        uint fee;
    }
    Project[] public projects;
    LoanData[] public lendingHistory;
    PayoutData[] public payoutHistory;

    event LoanAction(uint256 amount, string projectId, address lenderAddress, IERC20 token);

    event PayoutAction(uint256[] loans, string projectId, address borrower, uint256 fee, uint256 amount);

    constructor() {
        address msgSender = _msgSender();
        emit OwnershipTransferred(address(0), msgSender);
    }

  /* --------------------- Public actions  ---------------------------- */
  
  /* --------------------- Organization actions  ---------------------------- */

    function lending(
        string memory _projectId,
        string memory _projectOwnerId,
        uint256 _amount,
        uint256 _goalAmount,
        IERC20 _token
    ) public {
        require(_tokenExists(_token), 'Token is not valid');
        require(_token.balanceOf(msg.sender) >= _amount, 'Not enough funds');
        require(_token.allowance(msg.sender, address(this)) >= _amount, 'Not enough allowance');

        bool successLock = _token.transferFrom(msg.sender, address(this), _amount);
        require(successLock, 'Funds lockment failed!');

        _upsertProject(_projectId, _projectOwnerId, _goalAmount);

        lendingHistory.push(LoanData({
          lenderAddress: msg.sender,
          projectId: _projectId,
          amount: _amount,
          token: _token
        }));

        emit LoanAction(_amount, _projectId, msg.sender, _token);
    }

  /* ------------------------ Internals ----------------------------- */

    function _upsertProject(string memory _projectId, string memory _ownerId, uint256 _goalAmount) internal returns (Project) {
        for (uint i = 0; i < projects.length; i++) {
            if (projects[i].id == _projectId) {
                return projects[i];
            }
        }
        Project project = Project({
          id: _projectId,
          ownerId: _ownerId,
          goalAmount: _goalAmount
        });

        projects.push(project);
        return project;
    }
