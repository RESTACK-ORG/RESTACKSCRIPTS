# Project

This project contains scripts for interacting with Firebase.


## Getting Started

1.  Install the required packages:

    ```
    npm install firebase-admin
    ```

2.  Configure the project:

    *   Firebase service account key (update the path in the scripts)
    *   Firebase storage bucket URL (for `upload-to-storage.js`, update the URL in the script)
    *   Firestore collection name (for `upload-to-firestore.js` and `export-from-firestore.js`, update the collection name in the scripts)
    *   Input file path (for `upload-to-firestore.js`, update the file path in the script)
    *   Output file path (for `export-from-firestore.js`, update the file path in the script)


## Running the Scripts

### Exports data from Firestore.
Command: `npm run export-firestore`

### Uploads data to Firestore.
Command: `npm run upload-firestore`

### Uploads files to Storage.
Command: `npm run upload-storage`

## Initialization

To initialize the project and create necessary directories, run the following script:

```bash
./init.sh
```

This script will:

1.  Create the `data` directory.
2.  Create the `keys/service-accounts` directory to store Firebase service account keys.
3.  Create the `exports` directory to store exported data.
4.  Create the `upload-doc` directory to store files to be uploaded to Firebase Storage.
5.  Add the created directories to the `.gitignore` file to prevent them from being tracked by Git.

**Note:** Place your Firebase service account key files (e.g., `rera.json`) inside the `keys/service-accounts` directory. These files are not tracked by Git for security reasons.