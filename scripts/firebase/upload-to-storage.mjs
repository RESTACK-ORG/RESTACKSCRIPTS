import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import serviceAccount from '../../secrets/service-accounts/iqol.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://iqol-crm.firebasestorage.app' // update this
});

const bucket = admin.storage().bucket();

async function uploadFile(filePath, storagePath) {
  try {
    await bucket.upload(filePath, {
      destination: storagePath.replace(/\\/g, '/'), // ensure POSIX-style paths
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

async function uploadDirectory(dirPath, storageDir, rootDir) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const relativePath = path.relative(rootDir, filePath); // maintain folder structure
    const storagePath = path.join(storageDir, relativePath);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      await uploadFile(filePath, storagePath);
    } else if (stat.isDirectory()) {
      await uploadDirectory(filePath, storageDir, rootDir);
    }
  }
}

// Main function
async function main() {
  const sourceDir = 'upload-doc';   // source folder where the files are to be picked
  const storageDir = path.basename(sourceDir); // ensure top-level folder is kept

  try {
    await uploadDirectory(sourceDir, storageDir, sourceDir);
    console.log('All files uploaded successfully!');
  } catch (error) {
    console.error('Error uploading files:', error);
  }
}

main();