import fs from 'fs';
import path from 'path';
import { calculateASLC } from '../helper/getASLC.js';

// Get the directory name using import.meta.url
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the JSON data
const data = JSON.parse(fs.readFileSync(path.resolve('exports/canvas-all-leads.json'), 'utf8'));

// Filter data based on agentId and select specific fields
const filterData = (data, agentId) => {
  return data.filter(item => item.agentId === agentId).map(({ name, phoneNumber, tag, lastModified }) => ({
    name, phoneNumber, tag, aslc: calculateASLC(lastModified)
  }));
};

// Get filtered data
const filteredData = filterData(data, 'canv14');
console.log(filteredData)

// Convert filtered data to CSV format
const convertToCSV = (data) => {
  const header = ['name', 'phoneNumber', 'tag', 'aslc'];
  const rows = data.map(item => header.map(fieldName => `"${item[fieldName]}"`).join(','));
  return [header.join(','), ...rows].join('\n');
};

// Save the CSV to a file
const csvData = convertToCSV(filteredData);
fs.writeFileSync(path.join(__dirname, 'exports/filtered_leads.csv'), csvData);

console.log('CSV file successfully written!');
