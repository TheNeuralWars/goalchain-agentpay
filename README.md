# GoalChain AgentPay — A2A match settlement on HashKey Chain (HSP)
Hackathon: HashKey Chain Horizon, Mumbai Edition (track: Agent Payments & A2A Settlement), https://dorahacks.io/hackathon/hskchainindia/detail. Built 26 Oct 2026.

- `contracts/MatchEscrow.sol`: escrow holding HSK or ERC20 stablecoin (USDT/USDC) until the oracle reports a winner, with refunds after the deadline.
- `agent/demo.js`: Scout and Trader agents negotiate, issue HSP payment requests, and pay inside a spend cap.
- `agent/policy.js`: spend-cap policy (per-tx, daily, token allowlist).
- `agent/hsp.js`: HSP adapter (mock fallback until the official SDK is wired in).

## Chains
| | chainId | RPC | Explorer |
|---|---|---|---|
| HashKey Chain mainnet | 177 | https://mainnet.hsk.xyz | https://hashkey.blockscout.com |
| HashKey Chain testnet | 133 | https://testnet.hsk.xyz | https://testnet-explorer.hsk.xyz |

## Run
npm install && npx hardhat compile && npx hardhat test && npm run demo

See DEPLOY.md for the mainnet steps.

## Deployed
- Testnet MatchEscrow: [`0xacA461f8345c0B0D717D15618097c2385525EdeB`](https://testnet-explorer.hsk.xyz/address/0xacA461f8345c0B0D717D15618097c2385525EdeB)
- Mainnet: pending
