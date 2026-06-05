// scripts/export-firestore-data.mjs
// Run this BEFORE removing Firebase to extract all data from Firestore
// Usage: node scripts/export-firestore-data.mjs
// Requires: .env.local with Firebase credentials

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collections = [
  'portfolio',
  'siteContent',
  'siteSettings',
  'messages',
  'testimonials',
  'services'
];

async function exportCollection(name) {
  try {
    const snapshot = await getDocs(collection(db, name));
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`Exported ${docs.length} documents from ${name}`);
    return docs;
  } catch (error) {
    console.error(`Error exporting ${name}:`, error.message);
    return [];
  }
}

async function main() {
  console.log('Starting Firestore export...\n');
  const data = {};

  for (const col of collections) {
    data[col] = await exportCollection(col);
  }

  const outputPath = 'firestore-export.json';
  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\nAll data exported to ${outputPath}`);
  console.log('You can now use this file to seed PostgreSQL.');
}

main().catch(console.error);
