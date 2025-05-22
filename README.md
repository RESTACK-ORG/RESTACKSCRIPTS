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
This script exports data from a specified Firestore collection to a JSON file.

### Uploads data to Firestore.
Command: `npm run upload-firestore`
This script uploads data from a JSON file to a specified Firestore collection.

### Uploads files to Storage.
Command: `npm run upload-storage`
This script uploads files from a local directory to a Firebase Storage bucket.

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

**Note:** Place your Firebase service account key files (e.g., `acn.json`) inside the `secrets/service-accounts` directory. These files are not tracked by Git for security reasons.

54 |
55 | ## Utility Scripts
56 |
57 | ### Converts JSON to CSV.
58 | This script converts a JSON file to a CSV file.
59 | Command: `node scripts/utils/json-to-csv.js <input_file> <output_file>`
60 |
61 | ### Converts CSV to JSON.
62 | This script converts a CSV file to a JSON file.
63 | Command: `node scripts/utils/csv-to-json.js <input_file> <output_file>`
64 |
65 | ### Matches two CSV files based on a common column.
66 | This script matches two CSV files based on a common column and merges the data.
67 | Command: `node scripts/utils/match-2-csvs.mjs <file1> <file2> <column_name> <output_file>`