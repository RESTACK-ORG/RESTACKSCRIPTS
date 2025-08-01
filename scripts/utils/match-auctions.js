import { readFile, writeFile } from 'fs/promises';

const file1Path = 'exports/main.json';
const file2Path = 'exports/acn_properties.json';
const outputPath = 'exports/matched-auctions.json';

const loadJson = async (path) => {
  const data = await readFile(path, 'utf8');
  return JSON.parse(data);
};

const findMatches = (arr1, arr2) => {
  const matches = [];

  const arr2Map = new Map();
  for (const obj2 of arr2) {
    const key = `${obj2.assetType}`;
    if (!arr2Map.has(key)) {
      arr2Map.set(key, []);
    }
    arr2Map.get(key).push(obj2);
  }

  for (const obj1 of arr1) {
    const potentialMatches = arr2Map.get(`${obj1.assetType}`) || [];
    for (const obj2 of potentialMatches) {
      for (const auc1 of obj1.auctions || []) {
        for (const auc2 of obj2.auctions || []) {
          if (auc1.auctionDate !== auc2.auctionDate) continue;

          for (const unit1 of auc1.units || []) {
            for (const unit2 of auc2.units || []) {
              if (unit1.reservePrice === unit2.reservePrice) {
                matches.push({
                  fromFile1: obj1.id,
                  fromFile2: obj2.id,
                  auctionDate: auc1.auctionDate,
                  reservePrice: unit1.reservePrice
                });
              }
            }
          }
        }
      }
    }
  }

  return matches;
};

const run = async () => {
  try {
    const [data1, data2] = await Promise.all([
      loadJson(file1Path),
      loadJson(file2Path),
    ]);

    const matchedData = findMatches(data1, data2);

    if (matchedData.length > 0) {
      await writeFile(outputPath, JSON.stringify(matchedData, null, 2));
      console.log(`✅ ${matchedData.length} matches written to ${outputPath}`);
    } else {
      console.log('❌ No matches found');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
};

run();
