const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccount = require('../../keys/service-accounts/rera.json');     // update service account keys
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
//   storageBucket: 'gs://rera-mirror.firebasestorage.app'     //  update storage bucket url, can be accessed after initialising storage in firebase console
});

const bucket = admin.storage().bucket();

async function uploadFile(filePath, storagePath) {
  try {
    await bucket.upload(filePath, {
      destination: storagePath,
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    console.log(`${filePath} uploaded to ${storagePath}`);
  } catch (error) {
    console.error(`Error uploading ${filePath} to ${storagePath}:`, error);
  }
}


async function uploadDirectory(dirPath, storageDir) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const storagePath = path.join(storageDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      await uploadFile(filePath, storagePath);
    } else if (stat.isDirectory()) {
      await uploadDirectory(filePath, storagePath);
    }
  }
}

// Main function
async function main() {
  const sourceDir = 'upload-doc';   // source folder where the files are to be picked
  const storageDir = '';

  try {
    await uploadDirectory(sourceDir, storageDir);
    console.log('All files uploaded successfully!');
  } catch (error) {
    console.error('Error uploading files:', error);
  }
}

main();