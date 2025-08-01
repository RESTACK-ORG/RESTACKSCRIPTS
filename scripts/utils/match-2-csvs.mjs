import fs from 'fs';
import csv from 'csv-parser';

const csvFilePath = 'exports/builder_name.csv';   // csv path
const jsonFilePath = 'exports/acn_properties.json';   // json path

async function matchCsvAndJson() {
  const builderNames = {};

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // adjust column names to match
      const propertyId = row['property-id'];
      const builderName = row['builder_name'];
      builderNames[propertyId] = builderName;
    })
    .on('end', () => {
      fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          return;
        }

        let properties;
        try {
          properties = JSON.parse(data);
        } catch (parseError) {
          console.error('Error parsing JSON file:', parseError);
          return;
        }

        properties.forEach((property) => {
          const propertyId = property.id;
          if (builderNames[propertyId]) {
            property.builder_name = builderNames[propertyId];
          }
        });

        // writing back to the original file
        const updatedJson = JSON.stringify(properties, null, 2);
        fs.writeFile(jsonFilePath, updatedJson, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('Error writing updated JSON file:', writeErr);
            return;
          }
          console.log('Successfully matched and added builder names!');
        });
      });
    });
}

matchCsvAndJson();