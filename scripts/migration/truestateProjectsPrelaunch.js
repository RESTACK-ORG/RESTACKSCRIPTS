



import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { monthYearToUnix } from '../helper/dateTime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function transformToPrelaunchSchema(sourceData, startId = 1) {
  const prelaunchProperties = sourceData.filter(property =>
    !property.hasOwnProperty('auction') || (property.auction !== true && property.auction !== false)
  );


  const bhk_values = {
    "studio": 0.5,
    "oneBHK": 1,
    "oneBHKPlus": 1.5,
    "twoBHK": 2,
    "twoBHKPlus": 2.5,
    "threeBHK": 3,
    "threeBHKPlus": 3.5,
    "fourBHK": 4,
    "fourBHKPlus": 4.5,
    "fiveBHK": 5,
    "fiveBHKPlus": 5.5,
    "sixBHK": 6,
  };


  return prelaunchProperties.map((property, index) => {
    const assetType = property.assetType || null;
    const prelaunchId = `PRE${String(startId + index).padStart(3, '0')}`;
    const location = (property.area || property.micromarket || "bangalore").toLowerCase().replace(/\s+/g, '_');

    // Prepare configuration block based on asset type
    let configuration = null;

    if (assetType === 'apartment' && Array.isArray(property.data)) {
      configuration = {
        studio: [],
        oneBHK: [],
        oneBHKPlus: [],
        twoBHK: [],
        twoBHKPlus: [],
        threeBHK: [],
        threeBHKPlus: [],
        fourBHK: [],
        fourBHKPlus: [],
        fiveBHK: [],
        fiveBHKPlus: [],
        sixBHK: [],
      };

      property.data.forEach((config) => {
        const configType = config.configuration;
        const configData = {
          sbua: config.superBuiltUpArea || config.sbua || 0,
          currentPrice: config.currentPrice || config.price || 0,
          carpetArea: config.carpetArea || 0
        };

        if (configType === 'studio' || configType === 0.5) {
          configuration.studio.push(configData);
        } else if (configType === 'oneBHK' || configType === 1) {
          configuration.oneBHK.push(configData);
        } else if (configType === 'oneBHKPlus' || configType === 1.5) {
          configuration.oneBHKPlus.push(configData);
        } else if (configType === 'twoBHK' || configType === 2) {
          configuration.twoBHK.push(configData);
        } else if (configType === 'twoBHKPlus' || configType === 2.5) {
          configuration.twoBHKPlus.push(configData);
        } else if (configType === 'threeBHK' || configType === 3) {
          configuration.threeBHK.push(configData);
        } else if (configType === 'threeBHKPlus' || configType === 3.5) {
          configuration.threeBHKPlus.push(configData);
        } else if (configType === 'fourBHK' || configType === 4) {
          configuration.fourBHK.push(configData);
        } else if (configType === 'fourBHKPlus' || configType === 4.5) {
          configuration.fourBHKPlus.push(configData);
        } else if (configType === 'fiveBHK' || configType === 5) {
          configuration.fiveBHK.push(configData);
        } else if (configType === 'fiveBHKPlus' || configType === 5.5) {
          configuration.fiveBHKPlus.push(configData);
        } else if (configType === 'sixBHK' || configType === 6) {
          configuration.sixBHK.push(configData);
        }
      });
    } else if (assetType === 'villa') {
      configuration = property.data
        ? property.data.map(config => ({
            plotArea: config.plotArea || null,
            pricePerSqft: config.pricePerSqft || null,
            landholdingType: "landRegistration",
            landDetails: {
              landArea: config.landArea || property.sbua || null,
              sbua: config.sbua || property.sbua || null,
            },
          }))
        : [{
            plotArea: property.sbua || null,
            pricePerSqft: property.pricePerSqft || null,
            landholdingType: "landRegistration",
            landDetails: {
              landArea: property.sbua || null,
              sbua: property.sbua || null,
            },
          }];
    } else if (assetType === 'plot') {
      configuration = {
        plotArea: property.sbua || null,
        pricePerSqft: property.pricePerSqft || null,
      };
    }

    return {
      projectId: prelaunchId,
      projectName: property.projectName || null,
      devTier: property.devTier || null,
      assetType,
      micromarket: property.micromarket || null,
      builder: property.developerName || null,
      added:  property.lastUpdated || property.lastUpdated || null,
      verified: property.verified || false,
      Amenities: property.amenities || [],
      locationAnalysis: {
        location: property.location || property.area || null,
        lat: property.lat || null,
        long: property.long || null,
      },
      configuration,
      uploadedAt: property.lastUpdated || property.lastUpdated || null,
      showOnTruEstate: property.showOnTruEstate !== false,
      documents: property.documents || [],
      feedback: property.feedback || null,
      images: property.images || [],
      otherData: {
        reraNumber: property.reraId || property.acknowledgement || "",
      },
      facilities: {
        coveredParking: property.coveredParking || null,
        openParking: property.openParking || null,
        totalTower: property.totalTowers || null,
        metroConnectivity: property.metroConnectivity || null,
        waterSource: property.waterSource || null,
      },
      investmentOverview: {
        estPrice: null,
        value: property.truValue || null,
        xirr: property.xirr || null,
        growth: property.truGrowth || null,
        cagr: property.cagr || null,
        minInvestment: property.minInvestment || null,
        holdingPeriod: assetType === 'plot' ? 3 : 4,
        lastModified: property.lastUpdated || property.lastUpdated || null,
      },
      recommended: property.recommended || false,
      projectOverview: {
        litigation: property.litigation || null,
        stage: property.status || null,
        projectSize: property.projectLandArea || null,
        openArea: property.openAreaPercentage || null,
        handOverDate: property.handOverDate ? monthYearToUnix(property.handOverDate) : null,
        zone: property.area || null,
        launchDate: property.launchDate ? monthYearToUnix(property.launchDate) : null,
        totalUnits: property.totalUnits || null,
        projectDensity: property.projectDensity || null,
        pricePerSqft: property.pricePerSqft || null,
      },
      lastModified: property.lastUpdated || property.lastUpdated || null,
    };
  });
}


async function migratePrelaunchProperties() {
  try {
    const inputPath = path.join(__dirname, '../../exports/assetData.json');
    const outputPath = path.join(__dirname, '../../exports/prelaunchProperties.json');
    
    console.log('Reading source data...');
    const sourceData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    console.log('Transforming properties without auction flags...');
    const transformedData = transformToPrelaunchSchema(sourceData, 1);
    
    console.log(`Found ${transformedData.length} properties without auction flags`);
    
    fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
    console.log(`Migration completed! Output saved to: ${outputPath}`);
    
    return transformedData;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migratePrelaunchProperties();
}

export { migratePrelaunchProperties, transformToPrelaunchSchema };
