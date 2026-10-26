// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 { function transferFrom(address,address,uint256) external returns (bool); function transfer(address,uint256) external returns (bool); }

/// @title GoalChain AgentPay MatchEscrow
/// @notice Two agents stake HSK (token==address(0)) or an ERC20 stablecoin on a match.
///         Oracle reports winner; funds released. Refund after deadline if unresolved.
contract MatchEscrow {
    enum State { None, Open, Funded, Settled, Refunded }
    struct Deal { address agentA; address agentB; address token; uint256 stake; bytes32 matchId; bytes32 hspRef; uint64 deadline; bool paidA; bool paidB; State state; }

    address public oracle; address public owner;
    uint256 public nextId;
    mapping(uint256 => Deal) public deals;
    bool private locked;

    event DealCreated(uint256 indexed id, address agentA, address agentB, address token, uint256 stake, bytes32 matchId, bytes32 hspRef);
    event Funded(uint256 indexed id, address agent);
    event Settled(uint256 indexed id, address winner, uint256 amount);
    event Refunded(uint256 indexed id);

    modifier nonReentrant() { require(!locked, "reentrant"); locked = true; _; locked = false; }
    constructor(address _oracle) { owner = msg.sender; oracle = _oracle; }
    function setOracle(address o) external { require(msg.sender == owner, "owner"); oracle = o; }

    function createDeal(address agentB, address token, uint256 stake, bytes32 matchId, bytes32 hspRef, uint64 deadline) external returns (uint256 id) {
        require(agentB != address(0) && agentB != msg.sender, "bad counterparty");
        require(stake > 0 && deadline > block.timestamp, "bad params");
        id = nextId++;
        deals[id] = Deal(msg.sender, agentB, token, stake, matchId, hspRef, deadline, false, false, State.Open);
        emit DealCreated(id, msg.sender, agentB, token, stake, matchId, hspRef);
    }

    function fund(uint256 id) external payable nonReentrant {
        Deal storage d = deals[id];
        require(d.state == State.Open, "not open");
        bool isA = msg.sender == d.agentA; require(isA || msg.sender == d.agentB, "not party");
        require(isA ? !d.paidA : !d.paidB, "already paid");
        if (d.token == address(0)) require(msg.value == d.stake, "bad value");
        else { require(msg.value == 0, "no native"); require(IERC20(d.token).transferFrom(msg.sender, address(this), d.stake), "tf fail"); }
        if (isA) d.paidA = true; else d.paidB = true;
        if (d.paidA && d.paidB) d.state = State.Funded;
        emit Funded(id, msg.sender);
    }

    function settle(uint256 id, address winner) external nonReentrant {
        require(msg.sender == oracle, "oracle");
        Deal storage d = deals[id];
        require(d.state == State.Funded, "not funded");
        require(winner == d.agentA || winner == d.agentB, "bad winner");
        d.state = State.Settled;
        _pay(d.token, winner, d.stake * 2);
        emit Settled(id, winner, d.stake * 2);
    }

    function refund(uint256 id) external nonReentrant {
        Deal storage d = deals[id];
        require(d.state == State.Open || d.state == State.Funded, "final");
        require(block.timestamp > d.deadline, "too early");
        d.state = State.Refunded;
        if (d.paidA) _pay(d.token, d.agentA, d.stake);
        if (d.paidB) _pay(d.token, d.agentB, d.stake);
        emit Refunded(id);
    }

    function _pay(address token, address to, uint256 amt) internal {
        if (token == address(0)) { (bool ok,) = to.call{value: amt}(""); require(ok, "send fail"); }
        else require(IERC20(token).transfer(to, amt), "transfer fail");
    }
}
