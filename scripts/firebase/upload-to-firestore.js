const fs = require("fs");
const admin = require("firebase-admin");
// const serviceAccount = require('../../keys/service-accounts/masal.json');       // uncomment this line and update the service account key path when you run the script

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function loadDataset(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

async function updateFirestoreDocuments(dataset) {
  for (const record of dataset) {
    // const docRef = db.collection("new_users").doc(record.id);    // uncomment this line and update the collection name when you run the script

    try {
      await docRef.set(record, { merge: true });
      console.log(
        `Document with ID ${record.id} has been successfully updated.`
      );
    } catch (error) {
      console.error(`Error updating document with ID ${record.id}:`, error);
    }
  }
  console.log("done");
}

async function main() {
  const inputFilePath = "../../exports/new_users.json";  // update the source file path
  const dataset = loadDataset(inputFilePath);
  await updateFirestoreDocuments(dataset);
}

main().catch(console.error);
