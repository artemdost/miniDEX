// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";

/**
 * @author  .
 * @title   .
 * @dev     .
 * @notice  .
 */

contract First is ERC20 {

    uint dollarPrice = 5;

    constructor(string memory name_, string memory symbol_, uint decimals_, uint256 initialSupply) ERC20(name_, symbol_, decimals_) {
        owner = msg.sender;
        Mint(initialSupply * 10 ** decimals_);
    }


    function Mint(uint _toMint) public isOwner(){
        _totalSupply += _toMint;
        _balances[owner] += _toMint;
    } 

    function setPrice(uint _dollars) public isOwner(){
        dollarPrice = _dollars;
    }

    function setDecimals(uint decimals_) public isOwner(){
        _decimals = decimals_;
    }
}
