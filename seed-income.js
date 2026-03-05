const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

/**
 * INCOME CONSTANTS
 * Based on industry-standard financial planning assumptions (Mar 2026)
 *
 * SOURCE:
 * - withdrawal_rule_multiple: 4% rule = 1/0.04 = 25x annual spend
 *   (Trinity Study 1994 — allows sustainable withdrawals for 30yr retirement)
 *
 * NOTE ON TAX & INFLATION:
 * These are NOT stored here intentionally.
 * Both values are collected as mandatory user inputs on the income form
 * because they vary per individual (filing status, country, bracket).
 * Storing a default would produce misleading results.
 *
 * HOW withdrawal_rule_multiple WORKS IN CODE:
 * The base multiple (25) is fetched here and then scaled dynamically
 * by the user's timeframe inside getWithdrawalMultiplier():
 *
 *   timeFrame ≤ 10  →  25 * 0.80 = 20x  (5.0% rule — short horizon)
 *   timeFrame ≤ 20  →  25 * 1.00 = 25x  (4.0% rule — standard)
 *   timeFrame ≤ 35  →  25 * 1.14 = 28x  (3.5% rule — conservative)
 *   timeFrame > 35  →  25 * 1.32 = 33x  (3.0% rule — early retiree)
 *
 * TO SHIFT TO 3.8% RULE GLOBALLY:
 *   Change withdrawal_rule_multiple to 26 here and re-run seed.
 *   The entire curve updates automatically — no code changes needed.
 */
const incomeConfig = {
  withdrawal_rule_multiple: 25,   // 4% rule — client can update to 26 (3.8%) or 28 (3.5%)
  last_updated: new Date().toISOString(),
  notes: "Base withdrawal multiple. Tax and inflation rates are collected from users directly.",
};

async function seed() {
  try {
    const ref = db.collection("income_config").doc("constants");
    await ref.set(incomeConfig);
    console.log("✅ Income configuration seeded successfully!");
    console.log(JSON.stringify(incomeConfig, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding income config:", error);
    process.exit(1);
  }
}

seed();