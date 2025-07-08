import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputCsvPath = path.join(__dirname, '../../exports/main.csv');
const outputJsonPath = path.join(__dirname, '../../exports/main.json');

// Helper: Simple CSV parser (no external dependencies)
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Convert to object
    const row = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Remove quotes
      value = value.replace(/^"|"$/g, '');
      
      // Try to convert to appropriate type
      if (value === '') {
        row[header] = null;
      } else if (value === 'true') {
        row[header] = true;
      } else if (value === 'false') {
        row[header] = false;
      } else if (!isNaN(value) && !isNaN(parseFloat(value)) && value.trim() !== '') {
        row[header] = parseFloat(value);
      } else {
        row[header] = value;
      }
    });
    
    data.push(row);
  }
  
  return data;
}

// Helper: extract ALL fields by prefix
function extractFields(obj, prefix) {
  const result = {};
  const prefixWithUnderscore = `${prefix}_`;
  
  for (const key in obj) {
    if (key.startsWith(prefixWithUnderscore)) {
      const newKey = key.replace(prefixWithUnderscore, '');
      result[newKey] = obj[key];
    }
  }
  return result;
}

// Helper: remove empty fields
function removeEmpty(obj) {
  const cleaned = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

// Helper: find auction ID field (try different variations)
function findAuctionId(row) {
  const possibleFields = [
    'Auction_ID',
    'auction_ID', 
    'auction_id',
    'auctionId',
    'auctionID',
    'auction_auctionId',
    'auction_auctionID',
    'id',
    'ID'
  ];
  
  for (const field of possibleFields) {
    if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
      return row[field];
    }
  }
  return null;
}

// Helper: generate asset ID from asset fields
function generateAssetId(assetData, rowIndex) {
  const keyFields = ['address', 'micromarket', 'assetType'];
  const idParts = keyFields
    .map(field => assetData[field] || '')
    .filter(val => val !== '')
    .join('_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return idParts || `asset_${rowIndex}`;
}

try {
  const rawData = fs.readFileSync(inputCsvPath, 'utf8');
  const csvData = parseCSV(rawData);

  console.log(`📖 Read ${csvData.length} rows from CSV`);
  
  // Debug: show ALL available fields
  if (csvData.length > 0) {
    console.log('🔍 ALL available fields:');
    Object.keys(csvData[0]).forEach(field => console.log(`  - ${field}`));
    
    const assetFields = Object.keys(csvData[0]).filter(k => k.startsWith('asset_'));
    const auctionFields = Object.keys(csvData[0]).filter(k => k.startsWith('auction_'));
    const unitFields = Object.keys(csvData[0]).filter(k => k.startsWith('unit_'));
    const otherFields = Object.keys(csvData[0]).filter(k => 
      !k.startsWith('asset_') && !k.startsWith('auction_') && !k.startsWith('unit_')
    );
    
    console.log('\n📊 Field breakdown:');
    console.log(`🏢 Asset fields (${assetFields.length}):`, assetFields);
    console.log(`🔨 Auction fields (${auctionFields.length}):`, auctionFields);
    console.log(`🏠 Unit fields (${unitFields.length}):`, unitFields);
    if (otherFields.length > 0) {
      console.log(`❓ Other fields (${otherFields.length}):`, otherFields);
    }
    
    // Check for auction ID
    const sampleAuctionId = findAuctionId(csvData[0]);
    console.log(`\n🆔 Auction ID found:`, sampleAuctionId);
  }

  // Group data by asset and auction
  const assetGroups = {};
  
  csvData.forEach((row, rowIndex) => {
    // Extract ALL asset fields
    const assetData = extractFields(row, 'asset');
    const assetId = generateAssetId(assetData, rowIndex);
    
    if (!assetGroups[assetId]) {
      assetGroups[assetId] = {
        assetData: removeEmpty(assetData),
        auctions: {}
      };
    }
    
    // Get auction ID
    const auctionId = findAuctionId(row);
    if (!auctionId) {
      console.log(`⚠️  Row ${rowIndex + 1} missing auction ID, skipping:`, Object.keys(row));
      return;
    }
    
    if (!assetGroups[assetId].auctions[auctionId]) {
      // Extract ALL auction fields
      const auctionData = extractFields(row, 'auction');
      assetGroups[assetId].auctions[auctionId] = {
        auctionData: removeEmpty(auctionData),
        units: []
      };
    }
    
    // Extract ALL unit fields
    const unitData = removeEmpty(extractFields(row, 'unit'));
    if (Object.keys(unitData).length > 0) {
      assetGroups[assetId].auctions[auctionId].units.push(unitData);
    }
  });

  console.log(`\n🏢 Found ${Object.keys(assetGroups).length} unique assets`);

  const result = [];

  // Convert grouped data to final structure
  Object.entries(assetGroups).forEach(([assetId, assetGroup]) => {
    const asset = {
      id: assetId,
      ...assetGroup.assetData
    };

    // Convert auctions
    const auctions = Object.entries(assetGroup.auctions).map(([auctionId, auctionGroup]) => {
      const auction = {
        id: auctionId,
        ...auctionGroup.auctionData
      };

      // Add units if they exist
      if (auctionGroup.units.length > 0) {
        auction.units = auctionGroup.units;
      }

      return auction;
    });

    if (auctions.length > 0) {
      asset.auctions = auctions;
    }

    result.push(asset);
  });

  // Sort assets by id for consistency
  result.sort((a, b) => a.id.localeCompare(b.id));

  // Write the JSON file
  fs.writeFileSync(outputJsonPath, JSON.stringify(result, null, 2));
  
  console.log(`\n✅ JSON reconstructed at: ${outputJsonPath}`);
  console.log(`📊 Created ${result.length} assets`);
  
  // Log summary statistics
  let totalAuctions = 0;
  let totalUnits = 0;
  result.forEach(asset => {
    if (asset.auctions) {
      totalAuctions += asset.auctions.length;
      asset.auctions.forEach(auction => {
        if (auction.units) {
          totalUnits += auction.units.length;
        }
      });
    }
  });
  
  console.log(`📈 Summary: ${result.length} assets, ${totalAuctions} auctions, ${totalUnits} units`);
  
  // Show sample structure with ALL fields
  if (result.length > 0) {
    console.log('\n📋 Sample asset structure (showing ALL fields):');
    console.log(JSON.stringify(result[0], null, 2));
  }
  
} catch (err) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
}