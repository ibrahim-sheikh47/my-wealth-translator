const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json"); // Your Firebase key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const livingData = {
  "Alabama": 88.2, "Alaska": 127.1, "Arizona": 106.2, "Arkansas": 88.4,
  "California": 139.5, "Colorado": 105.8, "Connecticut": 113.5, "Delaware": 101.2,
  "Florida": 102.8, "Georgia": 91.6, "Hawaii": 182.4, "Idaho": 99.8,
  "Illinois": 91.4, "Indiana": 90.6, "Iowa": 89.5, "Kansas": 87.8,
  "Kentucky": 89.9, "Louisiana": 92.4, "Maine": 111.9, "Maryland": 113.2,
  "Massachusetts": 149.1, "Michigan": 91.7, "Minnesota": 94.6, "Mississippi": 85.8,
  "Missouri": 88.9, "Montana": 104.1, "Nebraska": 91.8, "Nevada": 101.9,
  "New Hampshire": 115.4, "New Jersey": 114.5, "New Mexico": 94.2, "New York": 128.5,
  "North Carolina": 96.5, "North Dakota": 94.9, "Ohio": 91.5, "Oklahoma": 86.4,
  "Oregon": 115.2, "Pennsylvania": 99.4, "Rhode Island": 113.3, "South Carolina": 94.7,
  "South Dakota": 94.1, "Tennessee": 90.5, "Texas": 93.4, "Utah": 104.9,
  "Vermont": 115.3, "Virginia": 103.5, "Washington": 115.8, "West Virginia": 89.5,
  "Wisconsin": 95.1, "Wyoming": 93.2
};

async function seedLiving() {
  const batch = db.batch();
  const collectionRef = db.collection("cost_of_living");

  console.log("Starting upload...");

  for (const [state, index] of Object.entries(livingData)) {
    const docRef = collectionRef.doc(state);
    batch.set(docRef, {
      index: index,
      lastUpdated: "Feb 2026", // This is what shows on your UI
      category: "state_index"
    });
  }

  await batch.commit();
  console.log("Successfully seeded 50 states!");
}

seedLiving();