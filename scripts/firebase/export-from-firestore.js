import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const serviceAccount = JSON.parse(
  fs.readFileSync("secrets/service-accounts/masal.json", "utf-8") // uncomment this line and update the service account key path when you run the script
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const exportData = async () => {
    const usersRef = db.collection('assetData')
  const snapshot = await usersRef.get();

  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }

  const data = [];

  snapshot.forEach((doc) => {
    const docData = doc.data();

   if (docData.auction === true || docData.auction === false) {
    data.push({
      id: doc.id,
      ...docData
    });
  }

  });

  const json = JSON.stringify(data, null, 2);
    fs.writeFileSync('exports/auction_properties.json', json);  // update exported file path
  console.log("Data exported successfully");
};

exportData().catch(console.error);
