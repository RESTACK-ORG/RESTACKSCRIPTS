import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseDateToUnix(dateStr) {
  if (!dateStr) return Math.floor(Date.now() / 1000);

  // Handle MM/YYYY format like "12/2031"
  if (typeof dateStr === "string" && dateStr.includes("/")) {
    const [month, year] = dateStr.split("/");
    return Math.floor(
      new Date(parseInt(year), parseInt(month) - 1, 1).getTime() / 1000
    );
  }

  // Handle timestamp format (already in unix)
  if (typeof dateStr === "number") {
    return dateStr;
  }

  return Math.floor(Date.now() / 1000);
}

function transformToAuctionSchema(sourceData, startId = 1) {
  const auctionProperties = sourceData.filter(
    (property) =>
      property.auction == true || property.auction == false
  );

  const transformedProperties = [];
  let currentId = startId;

  auctionProperties.forEach((property) => {
    const totalUnits = property.totalUnits || null;
    const unitsPerConfig = Math.max(
      1,
      totalUnits
    );

    for (let unitIndex = 0; unitIndex < property.auctions[0].units.length; unitIndex++) {
        const auctionId = `AU${String(currentId).padStart(3, "0")}`;
        currentId++;

        transformedProperties.push({
          projectId: auctionId,
          assetType: property.assetType || null,
          projectType: property.projectType || null,
          commercialType:
            property.auctions?.[0]?.propertyType === "Shop" ? "shop" : null,
          truRecommended: property.recommended || false,
          truVerified: property.verified || false,
          auctionNotice: property.uploadedFile?.[0]?.url || null,
          images: property.images || [],
          documents: property.documents || [],
          added: property.lastModified || property.lastUpdated || null,
          showOnTruEstate: property.auction !== false,
          verificationStatus: {
            legalVerificationStatus:
              property.auctions?.[0]?.legalVerification || null,
            constructionQualityStatus:
              property.auctions?.[0]?.constructionQualityVerification || null,
            localityCheckStatus: property.auctions?.[0]?.localityCheck || null,
          },
          unitDetails: (property.auctions?.[0]?.units || [{ units: 1 }]).map(
            (unit) => ({
              estSellingPriceSqft: unit.estSellingPrice || null,
              currentValue: unit.TruEsmtimatePrice || null,
              units: unit.units || null,
              possession: unit.possession || null,
              lastDate: unit.lastDate || null,
              rentalYield: unit.rentalYield || null, // default/fixed value
              furnished: unit.furnished || null, // old "furnished"
              allInclusivePrice: unit.allInclusivePrice || null, // same
              strategy: unit.strategy || [], // old "strategy"
              demolitionCost: unit.demolitionCost || null, // NEW
              litigation: unit.litigation ? unit.litigation : null, // old "litigation"
              damagesRenovationCost: unit.damagesRenovationCost || null, // same
              reservePrice: unit.reservePrice || null, // same
              cagr: unit.cagr || null, // same
              currentPricePerSqft: unit.currentPricePerSqft || null, // same
              micromarketGrowth: unit.micromarketGrowth || null, // old "micromarketGrowth"
              emdPrice: unit.emdPrice || null, // same
              ownerName: unit.ownerName || null, // same
              costToBuilder: unit.costToBuilder || null, // same
              maintainsDue: unit.maintainsDue || null, // same
              seatsFilled: unit.seatsFilled || null, // same
              truEstimatePrice: unit.truEstimatePrice || null, // same
              minInvestment: unit.minInvestment || null, // same
              holdingPeriodYears: 1 || null, // same
              totalSeats: unit.totalSeats || null, // same
              maxBidPrice: unit.maxBidPrice || null, // same
              interestOfBuyer: unit.interestOfBuyer || null, // old "interestOfBuyer"
              configuration: unit.configuration || null, // NEW
              plotArea: unit.plotArea || null, // same
              uds: unit.uds || null, // NEW
              totalFloors: unit.totalFloors || null,
              floor: unit.floorNo || null,
              sbua: unit.sbua || null,
              carpetArea: unit.carpetArea || null,
            })
          ),
          locationAnalysis: {
            location: property.location || property.area || "",
            lat: property.lat || 0,
            long: property.long || 0,
          },
          auctionOverview: {
            auctionDate: property.auctions[0].auctionDate || null,
            auctionType: property.auctions[0].auctionType || null,
            bankName: property.auctions[0].agentName || null,
            emdSubmissionDate: property.auctions[0].emdSubmissionDate || null,
            stage: property.status || null,
            khataType: property.auctions[0].khataType || null,
            auctionStatus: property.auctions[0].auctionStatus || null,
            exitRisk: property.auctions[0].exitRisk || null,
            auctionValue: property.auctions[0].auctionValue || null,
            riskInfo: property.auctions[0].riskInfo || null,
            loanEligiblity: property.auctions[0].loanEligiblity || null,
            buildingArea: null,
            additionalInfo: property.auctions[0].additionalInfo || null,
            bankType: property.auctions[0].bankType || null,
            agentPhone: property.auctions[0].agentPhone || null,
            agentName: property.auctions[0].agentName || null,
            sourceInternalId: null,
            propertyArea: null,
          },
          builderName: property.developerName || null,
          amenities: property.amenities || [],
          truPotential: null,
          projectName: property.projectName || null,
          zone: property.auctions[0].zone || property.area || null,
          micromarket:
            property.micromarket || property.auctions[0].micromarket || null,
          lastModified: property.lastUpdated || property.lastModified || null,
        });
      }
  });

  return transformedProperties;
}

async function migrateAuctionProperties() {
  try {
    const inputPath = path.join(__dirname, "../../exports/assetData.json");
    const outputPath = path.join(
      __dirname,
      "../../exports/auctionProperties.json"
    );

    console.log("Reading source data...");
    const sourceData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

    console.log("Transforming properties with auction flags...");
    const transformedData = transformToAuctionSchema(sourceData, 1);

    console.log(
      `Found ${transformedData.length} properties with auction flags`
    );

    fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
    console.log(`Migration completed! Output saved to: ${outputPath}`);

    return transformedData;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAuctionProperties();
}

export { migrateAuctionProperties, transformToAuctionSchema };
