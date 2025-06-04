const fs = require('fs');

function jsonToCsvFile(inputFilePath, outputFilePath) {
  try {
    const jsonString = fs.readFileSync(inputFilePath, 'utf-8');
    const jsonArray = JSON.parse(jsonString);

    if (!jsonArray || jsonArray.length === 0) {
      console.log("JSON file is empty or invalid.");
      return;
    }

    const headers = Object.keys(jsonArray[0]);
    const csvRows = [];

    csvRows.push(headers.join(","));

    for (const row of jsonArray) {
      const values = headers.map((header) => {
        const value = row[header];
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\\n");

    fs.writeFileSync(outputFilePath, csvString, 'utf-8');

    console.log(`Successfully converted ${inputFilePath} to ${outputFilePath}`);
  } catch (error) {
    console.error("Error converting JSON to CSV:", error.message);
  }
}

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!inputFilePath || !outputFilePath) {
  console.log("Usage: node json-to-csv.js <input.json> <output.csv>");
  process.exit(1);
}

jsonToCsvFile(inputFilePath, outputFilePath);