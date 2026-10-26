// Spend-cap policy stub: human sets caps, agent must stay inside.
class SpendPolicy {
  constructor({ perTx, daily, allowTokens }) { this.perTx = BigInt(perTx); this.daily = BigInt(daily); this.allow = new Set(allowTokens); this.spent = 0n; this.day = new Date().toISOString().slice(0,10); }
  check(token, amount) {
    amount = BigInt(amount);
    const today = new Date().toISOString().slice(0,10); if (today !== this.day) { this.day = today; this.spent = 0n; }
    if (!this.allow.has(token)) return { ok: false, reason: `token ${token} not allowed` };
    if (amount > this.perTx) return { ok: false, reason: `exceeds per-tx cap ${this.perTx}` };
    if (this.spent + amount > this.daily) return { ok: false, reason: `exceeds daily cap ${this.daily}` };
    return { ok: true };
  }
  record(amount) { this.spent += BigInt(amount); }
}
module.exports = { SpendPolicy };
