// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20.sol";

abstract contract ERC20 is IERC20 {
    uint256 _totalSupply;
    bool work = true;
    address owner;

    mapping(address => uint256) _balances;
    mapping(address account => mapping(address spender => uint256)) private _allowances;

    string private _name;
    string private _symbol;
    uint public _decimals;

    /**
     * @dev Sets the values for {name} and {symbol}.
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_, uint decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    modifier isOwner(){
        require(msg.sender == owner, "You are not an owner");
        _;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    function decimals() public view returns (uint){
        return _decimals;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() public view returns (uint256){
        return _totalSupply;
    }

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) public view returns (uint256){
        return _balances[account];
    }

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) public returns (bool){
        require(work == true, "Contract is stopped");
        require(_balances[msg.sender] - value >= 0, "Insufficient balance");
        if (to == address(0)){
            _balances[msg.sender] -= value;
            return true;
        } else {
            _balances[msg.sender] -= value;
            _balances[to] += value;
        }
        emit Transfer(msg.sender, to, value);

        return true;
    }
        
    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address _owner, address spender) public view returns (uint256){
        return _allowances[_owner][spender];
    }

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) public returns (bool){
        _allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool){
        require(work == true, "Contract is stopped");
        require(_allowances[from][msg.sender] - value >= 0, "Insufficient allowance");
        require(_balances[from] - value >= 0, "Insufficient balance");
        if (to == address(0)){
            _balances[from] -= value;
            _allowances[from][msg.sender] -= value;
        } else {
            _balances[from] -= value;
            _balances[to] += value;
            _allowances[from][msg.sender] -= value;
        }
        emit Transfer(from, to, value);
        return true;
    }

    function pause() public isOwner(){
        work = false;
    }

    function start() public isOwner(){
        work = true;
    }
}
