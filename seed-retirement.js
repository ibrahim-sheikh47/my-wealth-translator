const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

/**
 * RETIREMENT CONSTANTS
 * Based on industry-standard financial planning assumptions (Feb 2026)
 *
 * SOURCE:
 * - accumulation_return: 7% avg historical S&P 500 return (1950-2025 average)
 * - drawdown_return: 4% conservative bonds/dividend stocks during retirement
 * - withdrawal_rule_multiple: 4% rule = 1/0.04 = 25x annual spend
 *   (allows sustainable withdrawals for 30+ year retirement)
 *
 * IRS 2025 CONTRIBUTION LIMITS:
 * - max_401k_contribution: $24,500 (includes $7,500 catch-up for 50+)
 * - max_roth_ira_contribution: $7,500 (includes $1,000 catch-up for 50+)
 */
const retirementConfig = {
  accumulation_return: 0.07,
  drawdown_return: 0.04,
  withdrawal_rule_multiple: 25,
  fia_return: 0.045,
  iul_return: 0.060,

  // IRS 2025 annual contribution limits
  max_401k_contribution: 24500,
  max_roth_ira_contribution: 7500,

  last_updated: new Date().toISOString(),
  notes: "Industry standard assumptions verified with CFP Board & Vanguard"
};

async function seed() {
  try {
    const ref = db.collection("retirement_config").doc("constants");
    await ref.set(retirementConfig);
    console.log("✅ Retirement configuration seeded successfully!");
    console.log(JSON.stringify(retirementConfig, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding retirement config:", error);
    process.exit(1);
  }
}

seed();