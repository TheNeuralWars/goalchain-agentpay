// HSP adapter. The official SDK (github.com/project-hsp/hsp) was not publicly reachable on 2026-10-26
// and the docs page returned 500. This adapter isolates the HSP calls so the real SDK can be dropped in:
// replace MockHSP with the SDK client exposing createPaymentRequest / payRequest / getStatus.
const crypto = require("crypto");
class MockHSP {
  constructor() { this.requests = new Map(); }
  async createPaymentRequest({ from, to, token, amount, memo }) {
    const id = "hsp_" + crypto.randomBytes(8).toString("hex");
    const r = { id, from, to, token, amount: String(amount), memo, status: "pending", ref: "0x" + crypto.createHash("sha256").update(id).digest("hex") };
    this.requests.set(id, r); return r;
  }
  async payRequest(id, payer) { const r = this.requests.get(id); if (!r) throw new Error("unknown"); if (r.to !== payer) throw new Error("payer mismatch"); r.status = "paid"; return r; }
  async getStatus(id) { return this.requests.get(id)?.status; }
}
function createHSPClient() {
  try { const sdk = require("@hsp/sdk"); return new sdk.Client({ apiKey: process.env.HSP_API_KEY }); } // TODO: confirm real package name
  catch { return new MockHSP(); }
}
module.exports = { createHSPClient, MockHSP };
