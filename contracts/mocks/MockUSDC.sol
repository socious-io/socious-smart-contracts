// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MockUSDC is ERC20 {
    constructor() ERC20('USD Coin', 'USDC') {}

    function mint(address _account, uint256 _amount) public {
        _mint(_account, _amount);
    }
}
