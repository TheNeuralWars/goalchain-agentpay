# Deploy (nothing broadcast yet)
Approved spend: a small amount of HSK gas only, and only at deploy time. The deploy is one contract creation, roughly <0.01 HSK.

## Option A: Nico signs in a wallet UI (recommended, no key on the VPS)
1. In MetaMask or Phantom (EVM), add network HashKey Chain: chainId 177, RPC https://mainnet.hsk.xyz, symbol HSK, explorer https://hashkey.blockscout.com.
2. Make sure the wallet holds about 0.01 HSK.
3. Open Remix (remix.ethereum.org), paste `contracts/MatchEscrow.sol`, compile with 0.8.24 (optimizer 200), then go to Deploy and pick "Injected Provider".
4. Constructor `_oracle` = Nico's address (it can be changed later with setOracle).
5. **Nico signs ONE tx: the contract creation.** Copy the address into the BUIDL form and the README.
6. Optional demo: createDeal + 2x fund (0.001 HSK each) + settle = 4 small txs, all signed by Nico.

## Option B: CLI (only if Nico provides a dedicated throwaway deployer key)
    export DEPLOYER_KEY=...   # never commit, never paste in chat
    npm run deploy:testnet                       # testnet first (faucet HSK)
    CONFIRM_MAINNET=yes npm run deploy:mainnet   # mainnet, only after approval
