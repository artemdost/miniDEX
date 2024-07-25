// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./Second.sol";
import "./First.sol";
import "./IERC20.sol";


contract Swap{
    First first;
    Second second;
    uint rate2to1;
    address ownerSwap;
    constructor(address _first, address _second, uint _rate2to1){
        first = First(_first);
        second = Second(_second);
        ownerSwap = msg.sender;
        rate2to1 = _rate2to1;
    }
    
    function setRate(uint _rate2to1) public {
        require(msg.sender == ownerSwap, "You are not an owner");
        rate2to1 = _rate2to1;
    }

    function buyToken(uint _tokenId) public payable{
        uint token1price = 1000;
        uint token2price = token1price * rate2to1;

        if (_tokenId == 1){
            uint _amount = msg.value / token1price;
            require(first.balanceOf(address(this)) - _amount >= 0, "Insufficient balance");
            first.transfer(msg.sender, _amount * 10 ** first.decimals());

        } else {
            uint _amount = msg.value / token2price;
            require(second.balanceOf(address(this)) - _amount >= 0, "Insufficient balance"); 
            second.transfer(msg.sender, _amount * 10 ** second.decimals());
        }   
    }
    
    function swap(uint _tokenId, uint256 amount) public returns (bool){ // amount вводим в формате x * 10 ** decimals.

        if (_tokenId == 1){ // меняем первый токен на второй
            require(first.allowance(msg.sender, address(this)) - amount >= 0, "Insufficient allowance");
            bool successFrom = first.transferFrom(msg.sender, address(this), amount);
            if (successFrom){
                // вычисляем разницу для amount
                if (second.decimals() > first.decimals()){
                    amount = amount * 10 ** (second.decimals() - first.decimals());
                } else {
                    amount = amount / 10 ** (first.decimals() - second.decimals());
                }

                require(second.balanceOf(address(this)) - amount / rate2to1 >= 0, "Insufficient balance of contract");
                bool successTo = second.transfer(msg.sender, amount / rate2to1);
                if (successTo){
                    return true;
                }
            }
        } else if (_tokenId == 2){ // меняем второй токен на первый
            require(second.allowance(msg.sender, address(this)) - amount >= 0, "Insufficient allowance");
            bool successFrom = second.transferFrom(msg.sender, address(this), amount);
            if (successFrom){

                // вычисляем разницу для amount
                if (second.decimals() > first.decimals()){
                    amount = amount / 10 ** (second.decimals() - first.decimals());
                } else {
                    amount = amount * 10 ** (first.decimals() - second.decimals());
                }

                require(first.balanceOf(address(this)) - amount >= 0, "Insufficient balance of contract");
                bool successTo = first.transfer(msg.sender, amount * rate2to1);
                if (successTo){
                    return true;
                }
            }
        } return false;
    }

    
}