// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/interfaces/IERC20.sol';

contract Donate is Ownable {
    address payable private _owner;
    uint256 private ownerFee = 1;

    IERC20[] public validTokens;

    error NotEnoughFunds(uint requested, uint available);

    event Donation(uint256 feeamount, uint256 donationamount, address recieverOrg);

    struct OrganizationData {
        address sender;
        uint fullamount;
        uint netamount;
        string jobId;
    }

    mapping(address => OrganizationData[]) recieverHistory;

    constructor() {
        address msgSender = _msgSender();
        _owner = payable(msgSender);
        emit OwnershipTransferred(address(0), msgSender);
    }

    function donate(string memory _jobId, address _targetAddress, uint256 _amount, IERC20 _token) external {
        require(_token.balanceOf(msg.sender) >= _amount, 'Not enough funds');
        require(_token.allowance(msg.sender, address(this)) >= _amount, 'Not enough allowance');

        uint256 _feeamount = (_amount / 100) * getFee();
        uint256 _newamount = _amount - _feeamount;

        recieverHistory[_targetAddress].push(
            OrganizationData({ sender: msg.sender, fullamount: _amount, netamount: _newamount, jobId: _jobId })
        );

        bool sucessFee = _token.transferFrom(msg.sender, _owner, _feeamount);
        require(sucessFee, 'Fee payment has failed');
        bool successDonation = _token.transferFrom(msg.sender, _targetAddress, _newamount);
        require(successDonation, 'Donation has failed');
        emit Donation(_feeamount, _newamount, _targetAddress);
    }

    function getTokens() public view onlyOwner returns (IERC20[] memory) {
        return validTokens;
    }

    function getFee() public view returns (uint) {
        return ownerFee;
    }

    /* --------------------- Admin actions ---------------------------- */

    function changeFee(uint _newFee) public onlyOwner {
        require(_newFee != getFee());
        ownerFee = _newFee;
    }

    function addToken(IERC20 _token) public onlyOwner returns (bool) {
        if (_tokenExists(_token)) {
            return false;
        }

        validTokens.push(_token);
        return true;
    }

    /* ------------------------ Internals ----------------------------- */
    function _tokenExists(IERC20 _token) internal view returns (bool) {
        for (uint i = 0; i < validTokens.length; i++) {
            if (validTokens[i] == _token) {
                return true;
            }
        }
        return false;
    }
}
