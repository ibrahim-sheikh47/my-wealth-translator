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
 */
const retirementConfig = {
  accumulation_return: 0.07,        // 7% annual return during working years
  drawdown_return: 0.04,            // 4% annual return during retirement
  withdrawal_rule_multiple: 25,     // 4% rule = 25x annual budget needed
   // Account type growth rate assumptions (Feb 2026)
  // FIA: 2.5–6.5% real-world range (source: myannuitystore.com industry study)
  fia_return: 0.045,
  // IUL: 6–7% conservative regulatory illustration standard (source: insurancegeek.com)
  iul_return: 0.060,
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
