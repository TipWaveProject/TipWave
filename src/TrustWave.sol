// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.30;


contract TrustWave {

    error NameLengthCantBeZero();
    error GoalCantBeZero();
    error NothingToDonate();
    error DonationPoolNotFound();
    error DonationPoolIsNotActive();
    error NothingToWithdraw();
    error InsufficientBalanceOnContract();
    error AmountToWithdrawCantBeZero();
    error TransferFailed();


    event DonationPoolCreated(string name, uint256 goalInWei, uint256 timestamp);
    event Donated(string nickname, string message, uint256 amountInWei);


    struct DonatePool {
        address owner;
        uint256 id;
        string name;
        uint256 goalInWei;
        uint256 tempAmountInWei;
        Donate[] donations;
        bool isActive;

    }

    struct Donate {
        string nickname;
        string message;
        uint256 amountDonatedInWei;
        uint256 timestamp;
    }

    struct User {
        address addr;
        string nickname;
        DonatePool[] createdDonationsPools;
        uint256 balance;
    }

    uint256 totalAmountDonationsPools;
    DonatePool[] donationsPools;
    mapping (address => User) users;

    function addDonationPool(
     string calldata _name,
     uint256 _goalInWei)
     public {
        if (bytes(_name).length == 0) revert NameLengthCantBeZero();
        if (_goalInWei == 0) revert GoalCantBeZero();
        ++totalAmountDonationsPools;

        DonatePool storage donationPool = donationsPools[totalAmountDonationsPools];

        donationPool.owner = msg.sender;
        donationPool.id = totalAmountDonationsPools;
        donationPool.name = _name;
        donationPool.goalInWei = _goalInWei;
        donationPool.tempAmountInWei = 0;
        donationPool.isActive = true;

        users[msg.sender].createdDonationsPools.push(donationPool);

        emit DonationPoolCreated(_name, _goalInWei, block.timestamp);
    }

    function donate(uint256 _poolId, string calldata _message) external payable {
        if (_poolId > totalAmountDonationsPools || _poolId == 0) revert DonationPoolNotFound();
        if (msg.value == 0) revert NothingToDonate();

        DonatePool storage donationPool = donationsPools[_poolId];
        if (!donationPool.isActive) revert DonationPoolIsNotActive();

        User memory user = users[msg.sender];

        Donate memory tempDonate = Donate({
            nickname: user.nickname,
            message: _message,
            amountDonatedInWei: msg.value,
            timestamp: block.timestamp});

        users[donationPool.owner].balance += msg.value;
        donationPool.tempAmountInWei += msg.value;
        donationPool.donations.push(tempDonate);

        emit Donated(user.nickname, _message, msg.value);
    }

    function withdraw(uint256 _amountInWei) external {
        User memory tempUser = users[msg.sender];
        if (_amountInWei == 0) revert AmountToWithdrawCantBeZero();
        if (tempUser.balance == 0) revert NothingToWithdraw();
        if (tempUser.balance > address(this).balance) revert InsufficientBalanceOnContract();
        tempUser.balance -= _amountInWei;

        (bool success, ) = msg.sender.call{value: _amountInWei}("");

        if (!success) revert TransferFailed();

    }






}