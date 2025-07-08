import { readFile, writeFile } from 'fs/promises';
import { convertDateToUnix } from '../helper/dateTime.js';

const filePath = 'exports/main.json';

const processFile = async () => {
  try {
    const data = await readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    jsonData.forEach(item => {
      if (Array.isArray(item.auctions)) {
        item.auctions.forEach(auction => {
          if (auction.auctionDate) {
            auction.auctionDate = convertDateToUnix(auction.auctionDate);
          }
          if (auction.emdSubmissionDate) {
            auction.emdSubmissionDate = convertDateToUnix(auction.emdSubmissionDate);
          }
        });
      }
    });

    await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log('✅ Dates converted to Unix timestamps and file updated:', filePath);
  } catch (err) {
    console.error('❌ Error processing the file:', err);
  }
};

processFile();
