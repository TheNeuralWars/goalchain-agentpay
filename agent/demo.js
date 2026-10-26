// A2A narrative: Scout agent (A) offers a player-card loan + match stake to Trader agent (B).
// B accepts -> A issues HSP payment request -> B pays within spend cap -> both stake in MatchEscrow -> oracle settles.
const { createHSPClient } = require("./hsp");
const { SpendPolicy } = require("./policy");
const USDT = "USDT"; // HashKey Chain token address: see docs.hashkeychain.net Token-Contracts
async function main() {
  const hsp = createHSPClient();
  const scout = { name: "ScoutAgent", addr: "0xA0000000000000000000000000000000000000A1" };
  const trader = { name: "TraderAgent", addr: "0xB0000000000000000000000000000000000000B2",
    policy: new SpendPolicy({ perTx: 5_000000, daily: 20_000000, allowTokens: [USDT, "HSK"] }) };
  const offer = { matchId: "SERIE-A-2026-11-01-HELLAS-VERONA-vs-INTER", loanFee: 2_000000, stake: 3_000000, token: USDT };
  console.log(`[${scout.name}] offer:`, offer);
  for (const [label, amt] of [["loan fee", offer.loanFee], ["stake", offer.stake], ["oversized", 9_000000]]) {
    const chk = trader.policy.check(offer.token, amt);
    if (!chk.ok) { console.log(`[${trader.name}] REJECT ${label}: ${chk.reason}`); continue; }
    const req = await hsp.createPaymentRequest({ from: scout.addr, to: trader.addr, token: offer.token, amount: amt, memo: `${label} ${offer.matchId}` });
    console.log(`[${scout.name}] HSP request ${req.id} for ${label} (${amt}) ref=${req.ref.slice(0,18)}…`);
    await hsp.payRequest(req.id, trader.addr); trader.policy.record(amt);
    console.log(`[${trader.name}] paid ${req.id} -> ${await hsp.getStatus(req.id)}; spent today=${trader.policy.spent}`);
    if (label === "stake") console.log(`  -> on-chain: MatchEscrow.createDeal(trader, USDT, ${amt}, matchId, hspRef=${req.ref.slice(0,18)}…) then fund() by both; oracle settle(winner)`);
  }
}
main();
