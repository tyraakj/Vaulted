// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Escrow is Ownable {
    IERC20 public mockUSD;

    enum JobStatus { Open, Active, Complete, Released, Disputed }

    struct Job {
        uint256 id;
        string title;
        string description;
        address client;
        address freelancer;
        uint256 amount;
        JobStatus status;
        uint256 createdAt;
        uint256 autoReleaseAt;
    }

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;

    event JobCreated(uint256 indexed jobId, address indexed client, uint256 amount);
    event JobAccepted(uint256 indexed jobId, address indexed freelancer);
    event MilestoneSubmitted(uint256 indexed jobId);
    event PaymentReleased(uint256 indexed jobId, address indexed freelancer, uint256 amount);
    event JobDisputed(uint256 indexed jobId, address indexed by);

    constructor(address _mockUSD) Ownable(msg.sender) {
        require(_mockUSD != address(0), "mockUSD address zero");
        mockUSD = IERC20(_mockUSD);
    }

    function createJob(string memory title, string memory description, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(mockUSD.transferFrom(msg.sender, address(this), amount), "transferFrom failed");

        jobCount += 1;
        uint256 jobId = jobCount;

        jobs[jobId] = Job({
            id: jobId,
            title: title,
            description: description,
            client: msg.sender,
            freelancer: address(0),
            amount: amount,
            status: JobStatus.Open,
            createdAt: block.timestamp,
            autoReleaseAt: block.timestamp + 604800
        });

        emit JobCreated(jobId, msg.sender, amount);
    }

    function acceptJob(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.status == JobStatus.Open, "Job not open");
        require(msg.sender != j.client, "Client cannot accept their own job");

        j.freelancer = msg.sender;
        j.status = JobStatus.Active;

        emit JobAccepted(jobId, msg.sender);
    }

    function submitMilestone(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.status == JobStatus.Active, "Job not active");
        require(msg.sender == j.freelancer, "Only freelancer can submit");

        j.status = JobStatus.Complete;

        emit MilestoneSubmitted(jobId);
    }

    function releasePayment(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.status == JobStatus.Complete, "Job not complete");
        require(msg.sender == j.client, "Only client can release payment");

        _releasePayment(jobId);
    }

    function disputeJob(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(msg.sender == j.client || msg.sender == j.freelancer, "Only client or freelancer can dispute");
        require(j.status == JobStatus.Active || j.status == JobStatus.Complete, "Cannot dispute at this stage");

        j.status = JobStatus.Disputed;

        emit JobDisputed(jobId, msg.sender);
    }

    function autoRelease(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(block.timestamp > j.autoReleaseAt, "Auto-release time not reached");
        require(j.status == JobStatus.Complete, "Job not complete");

        _releasePayment(jobId);
    }

    function _releasePayment(uint256 jobId) internal {
        Job storage j = jobs[jobId];

        address freelancer = j.freelancer;
        uint256 amount = j.amount;

        j.status = JobStatus.Released;

        require(mockUSD.transfer(freelancer, amount), "transfer failed");

        emit PaymentReleased(jobId, freelancer, amount);
    }
}