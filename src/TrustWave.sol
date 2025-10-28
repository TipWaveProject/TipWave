// SPDX-License-Identifier: MIT
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
    error DonationNotFound();

    event DonationPoolCreated(uint256 indexed poolId, string name, uint256 goalInWei, uint256 timestamp);
    event Donated(uint256 indexed poolId, address indexed donor, string nickname, string message, uint256 amountInWei);
    event Withdrawn(address indexed recipient, uint256 amountInWei);
    event NicknameSet(address indexed user, string nickname);
    event DonationPoolToggled(uint256 indexed poolId, bool isActive);

    struct Donate {
        address donor;
        string nickname;
        string message;
        uint256 amountDonatedInWei;
        uint256 timestamp;
    }

    struct DonatePool {
        address owner;
        uint256 id;
        string name;
        uint256 goalInWei;
        uint256 tempAmountInWei;
        Donate[] donations;
        bool isActive;
    }

    struct User {
        string nickname;
        uint256[] createdDonationsPools;
        uint256 balance;
    }

    DonatePool[] private donationsPools;
    mapping(address => User) private users;


    function setNickname(string calldata _nickname) external {
        users[msg.sender].nickname = _nickname;
        emit NicknameSet(msg.sender, _nickname);
    }

    function addDonationPool(string calldata _name, uint256 _goalInWei) external {
        if (bytes(_name).length == 0) revert NameLengthCantBeZero();
        if (_goalInWei == 0) revert GoalCantBeZero();

        donationsPools.push();
        DonatePool storage pool = donationsPools[donationsPools.length - 1];

        pool.owner = msg.sender;
        pool.id = donationsPools.length;
        pool.name = _name;
        pool.goalInWei = _goalInWei;
        pool.tempAmountInWei = 0;
        pool.isActive = true;

        users[msg.sender].createdDonationsPools.push(pool.id);

        emit DonationPoolCreated(pool.id, _name, _goalInWei, block.timestamp);
    }

    function donate(uint256 _poolId, string calldata _message) external payable {
        if (_poolId == 0 || _poolId > donationsPools.length) revert DonationPoolNotFound();
        if (msg.value == 0) revert NothingToDonate();

        DonatePool storage pool = donationsPools[_poolId - 1];
        if (!pool.isActive) revert DonationPoolIsNotActive();

        User storage donor = users[msg.sender];

        Donate memory d = Donate({
            donor: msg.sender,
            nickname: donor.nickname,
            message: _message,
            amountDonatedInWei: msg.value,
            timestamp: block.timestamp
        });

        pool.donations.push(d);
        pool.tempAmountInWei += msg.value;

        users[pool.owner].balance += msg.value;

        emit Donated(_poolId, msg.sender, donor.nickname, _message, msg.value);
    }

    function withdraw(uint256 _amountInWei) external {
        if (_amountInWei == 0) revert AmountToWithdrawCantBeZero();
        User storage user = users[msg.sender];
        if (user.balance == 0) revert NothingToWithdraw();
        if (_amountInWei > user.balance) revert AmountToWithdrawCantBeZero();
        if (_amountInWei > address(this).balance) revert InsufficientBalanceOnContract();

        user.balance -= _amountInWei;

        (bool success, ) = msg.sender.call{value: _amountInWei}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, _amountInWei);
    }

    function togglePoolActive(uint256 _poolId, bool _isActive) external {
        if (_poolId == 0 || _poolId > donationsPools.length) revert DonationPoolNotFound();
        DonatePool storage pool = donationsPools[_poolId - 1];
        if (msg.sender != pool.owner) revert DonationPoolNotFound();
        pool.isActive = _isActive;
        emit DonationPoolToggled(_poolId, _isActive);
    }

    function getPoolsCount() external view returns (uint256) {
        return donationsPools.length;
    }

    function getPool(uint256 _poolId) external view returns (
        address owner,
        uint256 id,
        string memory name,
        uint256 goalInWei,
        uint256 tempAmountInWei,
        bool isActive,
        uint256 donationsCount
    ) {
        if (_poolId == 0 || _poolId > donationsPools.length) revert DonationPoolNotFound();
        DonatePool storage pool = donationsPools[_poolId - 1];
        return (
            pool.owner,
            pool.id,
            pool.name,
            pool.goalInWei,
            pool.tempAmountInWei,
            pool.isActive,
            pool.donations.length
        );
    }

    function getDonation(uint256 _poolId, uint256 _donateIndex) external view returns (
        address donor,
        string memory nickname,
        string memory message,
        uint256 amountDonatedInWei,
        uint256 timestamp
    ) {
        if (_poolId == 0 || _poolId > donationsPools.length) revert DonationPoolNotFound();
        DonatePool storage pool = donationsPools[_poolId - 1];
        if (_donateIndex >= pool.donations.length) revert DonationNotFound();
        Donate storage d = pool.donations[_donateIndex];
        return (d.donor, d.nickname, d.message, d.amountDonatedInWei, d.timestamp);
    }

    function getUser(address _user) external view returns (string memory nickname, uint256[] memory createdPoolIds, uint256 balance) {
        User storage u = users[_user];
        return (u.nickname, u.createdDonationsPools, u.balance);
    }

}
