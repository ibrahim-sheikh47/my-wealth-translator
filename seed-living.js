const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

/**
 * SOURCE DATA KEY (Updated Feb 24, 2026):
 * index: MERIC 2025 Annual Average
 * medianRent: Census Bureau / Zillow 2026 Estimate
 * medianHome: FRED Q4 2025 / Jan 2026 Actuals
 * gasPrice: AAA Regular Avg (Feb 23, 2026)
 * elecBill: EIA/SaveOnEnergy Feb 2026 Report
 * docVisit: Sidecar Health 2026 Cash Price Avg
 */
const stateData = {
  "Alabama": { index: 88.1, housing: 71.2, grocery: 97.5, utilities: 98.0, trans: 90.5, health: 91.2, medianRent: 1410, medianHome: 282000, gasPrice: 2.62, elecBill: 183.79, docVisit: 105 },
  "Alaska": { index: 124.9, housing: 119.7, grocery: 127.2, utilities: 156.8, trans: 117.1, health: 144.8, medianRent: 1550, medianHome: 388000, gasPrice: 3.56, elecBill: 165.20, docVisit: 142 },
  "Arizona": { index: 110.7, housing: 128.2, grocery: 102.4, utilities: 106.3, trans: 103.7, health: 93.8, medianRent: 1650, medianHome: 458000, gasPrice: 3.23, elecBill: 135.40, docVisit: 119 },
  "Arkansas": { index: 90.1, housing: 78.8, grocery: 94.3, utilities: 94.3, trans: 90.7, health: 87.3, medianRent: 1150, medianHome: 255000, gasPrice: 2.45, elecBill: 138.10, docVisit: 104 },
  "California": { index: 142.3, housing: 200.1, grocery: 109.8, utilities: 142.0, trans: 135.9, health: 106.5, medianRent: 2750, medianHome: 835000, gasPrice: 4.63, elecBill: 160.51, docVisit: 130 },
  "Colorado": { index: 102.7, housing: 108.7, grocery: 100.7, utilities: 88.6, trans: 100.8, health: 103.5, medianRent: 1850, medianHome: 585000, gasPrice: 2.70, elecBill: 110.20, docVisit: 115 },
  "Connecticut": { index: 111.7, housing: 117.2, grocery: 102.5, utilities: 135.2, trans: 105.5, health: 112.3, medianRent: 2150, medianHome: 418000, gasPrice: 2.91, elecBill: 187.79, docVisit: 125 },
  "Delaware": { index: 103.1, housing: 102.3, grocery: 101.3, utilities: 97.6, trans: 100.6, health: 103.9, medianRent: 1720, medianHome: 355000, gasPrice: 2.95, elecBill: 171.36, docVisit: 122 },
  "Florida": { index: 101.4, housing: 103.5, grocery: 104.3, utilities: 98.1, trans: 99.8, health: 92.7, medianRent: 1980, medianHome: 415000, gasPrice: 2.87, elecBill: 174.21, docVisit: 115 },
  "Georgia": { index: 92.2, housing: 79.7, grocery: 97.8, utilities: 100.6, trans: 95.7, health: 97.2, medianRent: 1650, medianHome: 368000, gasPrice: 2.69, elecBill: 155.40, docVisit: 108 },
  "Hawaii": { index: 185.0, housing: 304.2, grocery: 133.5, utilities: 204.4, trans: 136.5, health: 123.4, medianRent: 2700, medianHome: 745000, gasPrice: 4.38, elecBill: 198.99, docVisit: 110 },
  "Idaho": { index: 99.3, housing: 100.3, grocery: 98.9, utilities: 73.0, trans: 106.5, health: 106.9, medianRent: 1680, medianHome: 488000, gasPrice: 2.97, elecBill: 115.64, docVisit: 106 },
  "Illinois": { index: 95.0, housing: 84.3, grocery: 99.8, utilities: 99.0, trans: 100.5, health: 104.1, medianRent: 2050, medianHome: 288000, gasPrice: 2.95, elecBill: 125.80, docVisit: 120 },
  "Indiana": { index: 90.7, housing: 75.4, grocery: 99.2, utilities: 95.0, trans: 101.0, health: 96.3, medianRent: 1350, medianHome: 258000, gasPrice: 2.68, elecBill: 142.30, docVisit: 110 },
  "Iowa": { index: 89.8, housing: 77.7, grocery: 96.6, utilities: 88.0, trans: 99.5, health: 95.9, medianRent: 1250, medianHome: 230000, gasPrice: 2.55, elecBill: 112.74, docVisit: 100 },
  "Kansas": { index: 88.4, housing: 76.9, grocery: 95.9, utilities: 98.1, trans: 90.7, health: 94.5, medianRent: 1340, medianHome: 282000, gasPrice: 2.46, elecBill: 128.50, docVisit: 103 },
  "Kentucky": { index: 91.5, housing: 74.8, grocery: 99.8, utilities: 88.0, trans: 96.0, health: 93.5, medianRent: 1340, medianHome: 265000, gasPrice: 2.58, elecBill: 135.20, docVisit: 106 },
  "Louisiana": { index: 92.9, housing: 84.5, grocery: 96.4, utilities: 83.6, trans: 97.3, health: 93.4, medianRent: 1270, medianHome: 252000, gasPrice: 2.51, elecBill: 110.00, docVisit: 117 },
  "Maine": { index: 113.0, housing: 133.8, grocery: 101.3, utilities: 115.2, trans: 104.8, health: 115.4, medianRent: 2000, medianHome: 385000, gasPrice: 2.90, elecBill: 145.20, docVisit: 106 },
  "Maryland": { index: 98.9, housing: 82.2, grocery: 102.4, utilities: 113.1, trans: 103.0, health: 92.2, medianRent: 1900, medianHome: 418000, gasPrice: 2.98, elecBill: 198.25, docVisit: 125 },
  "Massachusetts": { index: 141.2, housing: 196.2, grocery: 105.5, utilities: 153.2, trans: 105.4, health: 122.2, medianRent: 2880, medianHome: 618000, gasPrice: 2.90, elecBill: 177.95, docVisit: 129 },
  "Michigan": { index: 91.9, housing: 78.3, grocery: 99.3, utilities: 99.1, trans: 100.2, health: 90.0, medianRent: 1430, medianHome: 252000, gasPrice: 2.84, elecBill: 132.40, docVisit: 119 },
  "Minnesota": { index: 93.6, housing: 80.6, grocery: 100.6, utilities: 95.0, trans: 96.2, health: 102.4, medianRent: 1660, medianHome: 358000, gasPrice: 2.70, elecBill: 111.57, docVisit: 134 },
  "Mississippi": { index: 86.0, housing: 71.6, grocery: 95.5, utilities: 89.4, trans: 88.3, health: 94.3, medianRent: 1350, medianHome: 255000, gasPrice: 2.49, elecBill: 177.21, docVisit: 107 },
  "Missouri": { index: 88.9, housing: 77.5, grocery: 95.9, utilities: 92.0, trans: 87.2, health: 100.3, medianRent: 1360, medianHome: 261000, gasPrice: 2.51, elecBill: 138.40, docVisit: 106 },
  "Montana": { index: 96.8, housing: 94.4, grocery: 101.6, utilities: 81.5, trans: 99.5, health: 106.5, medianRent: 1730, medianHome: 528000, gasPrice: 2.75, elecBill: 109.23, docVisit: 110 },
  "Nebraska": { index: 91.8, housing: 78.7, grocery: 98.6, utilities: 89.6, trans: 93.8, health: 99.6, medianRent: 1360, medianHome: 292000, gasPrice: 2.55, elecBill: 119.69, docVisit: 107 },
  "Nevada": { index: 99.7, housing: 110.7, grocery: 102.7, utilities: 85.6, trans: 115.3, health: 89.3, medianRent: 1550, medianHome: 458000, gasPrice: 3.68, elecBill: 142.10, docVisit: 113 },
  "New Hampshire": { index: 111.4, housing: 117.7, grocery: 99.8, utilities: 117.3, trans: 102.9, health: 106.4, medianRent: 2160, medianHome: 488000, gasPrice: 2.85, elecBill: 162.30, docVisit: 114 },
  "New Jersey": { index: 115.1, housing: 141.2, grocery: 103.9, utilities: 101.5, trans: 103.1, health: 109.3, medianRent: 2450, medianHome: 525000, gasPrice: 2.92, elecBill: 135.80, docVisit: 138 },
  "New Mexico": { index: 93.7, housing: 88.6, grocery: 97.0, utilities: 83.8, trans: 93.6, health: 108.3, medianRent: 1410, medianHome: 361000, gasPrice: 2.59, elecBill: 102.09, docVisit: 105 },
  "New York": { index: 125.1, housing: 174.6, grocery: 104.4, utilities: 100.1, trans: 106.4, health: 110.2, medianRent: 2500, medianHome: 580000, gasPrice: 3.00, elecBill: 158.40, docVisit: 130 },
  "North Carolina": { index: 97.9, housing: 94.0, grocery: 99.0, utilities: 94.7, trans: 92.2, health: 110.2, medianRent: 1580, medianHome: 372000, gasPrice: 2.71, elecBill: 145.20, docVisit: 104 },
  "North Dakota": { index: 91.1, housing: 75.7, grocery: 96.8, utilities: 83.2, trans: 99.9, health: 108.8, medianRent: 1190, medianHome: 285000, gasPrice: 2.56, elecBill: 125.40, docVisit: 116 },
  "Ohio": { index: 94.6, housing: 87.6, grocery: 99.4, utilities: 98.3, trans: 97.6, health: 97.0, medianRent: 1360, medianHome: 245000, gasPrice: 2.85, elecBill: 138.90, docVisit: 108 },
  "Oklahoma": { index: 84.7, housing: 68.8, grocery: 95.4, utilities: 98.2, trans: 88.8, health: 97.1, medianRent: 1080, medianHome: 248000, gasPrice: 2.34, elecBill: 150.20, docVisit: 116 },
  "Oregon": { index: 110.0, housing: 131.7, grocery: 103.0, utilities: 90.9, trans: 113.3, health: 112.0, medianRent: 1760, medianHome: 508000, gasPrice: 3.89, elecBill: 128.40, docVisit: 118 },
  "Pennsylvania": { index: 97.1, housing: 86.8, grocery: 98.5, utilities: 108.7, trans: 104.0, health: 93.7, medianRent: 1810, medianHome: 288000, gasPrice: 3.14, elecBill: 162.30, docVisit: 121 },
  "Rhode Island": { index: 110.6, housing: 113.5, grocery: 101.0, utilities: 136.4, trans: 96.4, health: 101.7, medianRent: 2200, medianHome: 492000, gasPrice: 2.87, elecBill: 174.75, docVisit: 130 },
  "South Carolina": { index: 92.7, housing: 80.6, grocery: 99.0, utilities: 96.9, trans: 96.4, health: 94.2, medianRent: 1640, medianHome: 385000, gasPrice: 2.61, elecBill: 168.20, docVisit: 111 },
  "South Dakota": { index: 91.8, housing: 85.9, grocery: 97.7, utilities: 85.2, trans: 93.6, health: 106.5, medianRent: 1230, medianHome: 325000, gasPrice: 2.62, elecBill: 135.40, docVisit: 103 },
  "Tennessee": { index: 90.1, housing: 82.4, grocery: 96.8, utilities: 88.1, trans: 88.7, health: 86.4, medianRent: 1550, medianHome: 385000, gasPrice: 2.55, elecBill: 155.60, docVisit: 104 },
  "Texas": { index: 91.1, housing: 79.4, grocery: 95.3, utilities: 102.9, trans: 92.9, health: 96.8, medianRent: 1460, medianHome: 342000, gasPrice: 2.55, elecBill: 175.80, docVisit: 112 },
  "Utah": { index: 99.5, housing: 108.8, grocery: 96.9, utilities: 82.4, trans: 104.1, health: 90.9, medianRent: 1640, medianHome: 552000, gasPrice: 2.75, elecBill: 101.16, docVisit: 117 },
  "Vermont": { index: 113.6, housing: 129.9, grocery: 105.3, utilities: 113.3, trans: 97.8, health: 112.9, medianRent: 2180, medianHome: 392000, gasPrice: 3.00, elecBill: 142.10, docVisit: 115 },
  "Virginia": { index: 102.2, housing: 106.7, grocery: 99.7, utilities: 97.5, trans: 95.5, health: 107.6, medianRent: 1990, medianHome: 448000, gasPrice: 2.83, elecBill: 165.40, docVisit: 112 },
  "Washington": { index: 114.1, housing: 125.7, grocery: 106.2, utilities: 95.2, trans: 121.7, health: 115.4, medianRent: 2050, medianHome: 635000, gasPrice: 4.33, elecBill: 132.80, docVisit: 125 },
  "West Virginia": { index: 88.0, housing: 71.2, grocery: 96.3, utilities: 90.7, trans: 97.8, health: 95.2, medianRent: 1300, medianHome: 252000, gasPrice: 2.82, elecBill: 148.90, docVisit: 112 },
  "Wisconsin": { index: 98.5, housing: 99.0, grocery: 99.5, utilities: 91.2, trans: 99.0, health: 99.8, medianRent: 1620, medianHome: 315000, gasPrice: 2.54, elecBill: 118.62, docVisit: 118 },
  "Wyoming": { index: 94.6, housing: 87.1, grocery: 99.8, utilities: 97.2, trans: 91.9, health: 99.0, medianRent: 1360, medianHome: 488000, gasPrice: 2.70, elecBill: 120.04, docVisit: 115 },
  "District of Columbia": { index: 138.8, housing: 212.2, grocery: 105.3, utilities: 101.3, trans: 106.7, health: 121.0, medianRent: 2480, medianHome: 648000, gasPrice: 3.11, elecBill: 165.20, docVisit: 121 }
};

async function seed() {
  const batch = db.batch();
  for (const [state, data] of Object.entries(stateData)) {
    const ref = db.collection("cost_of_living").doc(state);
    batch.set(ref, data);
  }
  await batch.commit();
  console.log("Database seeded with February 2026 actual market rates.");
}
seed();