import fs from "fs";
import { createReport } from "../functions/createReport.js";


function loadDataset(filePath) {
  const rawData = fs.readFileSync(filePath);
  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error parsing JSON file ${filePath}:`, error);
    return null;
  }
}

const DEFAULT_TENURE = 20;
const DEFAULT_INTEREST_RATE = 8.5;
const SELLING_YEARS = 4;


function modifyAndSaveDataset(inputFilePath, outputFilePath) {
  const dataset = loadDataset(inputFilePath);

  if (!dataset) {
    console.error("Failed to load dataset. Aborting.");
    return;
  }

    dataset.forEach((eachData) => {
        // Destructure the eachData object
        const { handOverDate, assetType, cagr, data, projectName } = eachData || {};

        if (
            handOverDate &&
            assetType &&
            cagr &&
            data &&
            data.length > 0
        ) {
            console.log(`Processing project: ${projectName}`);

            const minAcqPrice = data.reduce((min, property) => {
                return property.totalPrice && property.totalPrice < min
                    ? property.totalPrice
                    : min;
            }, data[0]?.totalPrice);

            const loanPercentage = assetType === "plot" ? 75 : 85;
            const cagrToConsider = parseFloat(cagr) / 100;
            const estimatedSellingPrice = parseInt(minAcqPrice * Math.pow(1 + cagrToConsider, SELLING_YEARS), 10);

            // Format the handOverDate to MM-DD-01
            const [day, month] = handOverDate.split("/");
            const handOverDateFormatted = `${month}-${day}-01`;

            const reportData = createReport({
                acquisitionPrice: minAcqPrice,
                constructionCompletionDate: handOverDateFormatted,
                finalPrice: estimatedSellingPrice,
                tenure: DEFAULT_TENURE,
                holdingPeriod: SELLING_YEARS,
                interestRate: DEFAULT_INTEREST_RATE,
                loanPercentage,
                selectedCharge: "Stamp Duty",
                assetType: assetType,
            });

            if (reportData?.xirr === "#NUM" || reportData?.xirr === "#NUM!") {
                reportData.xirr = null;
            }
            eachData.xirr = reportData.xirr

        } else {
            console.log(`Skipped project: ${projectName || "Unnamed Project"}`);
        }
    });

    fs.writeFileSync(outputFilePath, JSON.stringify(dataset, null, 2));
}

const inputFilePath = 'exports/masal_properties.json';
const outputFilePath = 'outputs/properties-with-xirr.json';

modifyAndSaveDataset(inputFilePath, outputFilePath);
