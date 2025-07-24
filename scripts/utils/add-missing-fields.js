import fs from 'fs';

function loadDataset(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

function modifyAndSaveDataset(inputFilePath, outputFilePath) {
  const dataset = loadDataset(inputFilePath);

  console.log(dataset)

dataset.forEach(item => {
    if (Array.isArray(item.auctions)) {
      item.auctions.forEach(auction => {
        auction.verified = false; // Add the verified property
        auction.units.forEach(unit => {
          const max
        })
      });
    }
  });

  fs.writeFileSync(outputFilePath, JSON.stringify(dataset, null, 2));
}

const inputFilePath = 'exports/main.json';
const outputFilePath = 'exports/main2.json';

modifyAndSaveDataset(inputFilePath, outputFilePath);
