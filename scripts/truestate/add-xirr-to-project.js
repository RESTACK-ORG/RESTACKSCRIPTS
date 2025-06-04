import fs from "fs";
import { createReport } from "../functions/createReport.js";

function loadDataset(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

function modifyAndSaveDataset(inputFilePath, outputFilePath) {
  const dataset = loadDataset(inputFilePath);

    dataset.forEach((eachData) => {
        if (
            eachData &&
            eachData.handOverDate &&
            eachData.assetType &&
            eachData.cagr &&
            eachData.data &&
            eachData.data.length > 0
        ) {
            console.log(`Processing project: ${eachData.projectName}`);

            const minAcqPrice = eachData.data.reduce((min, property) => {
                return property.totalPrice && property.totalPrice < min
                    ? property.totalPrice
                    : min;
            }, eachData.data[0]?.totalPrice);

            const loanPercentage = eachData.assetType === "plot" ? 75 : 85;
            const cagrToConsider = parseFloat(eachData.cagr) / 100;
            const SellingCost = parseInt(minAcqPrice * Math.pow(1 + cagrToConsider, 4), 10);

            const handOverDateFormatted = `${eachData.handOverDate.split("/")[1]}-${eachData.handOverDate.split("/")[0]}-01`;

            const reportData = createReport({
                acquisitionPrice: minAcqPrice,
                constructionCompletionDate: handOverDateFormatted,
                finalPrice: SellingCost,
                tenure: 20,
                holdingPeriod: 4,
                interestRate: 8.5,
                loanPercentage,
                selectedCharge: "Stamp Duty",
                assetType: eachData.assetType,
            });

            if (reportData?.xirr === "#NUM" || reportData?.xirr === "#NUM!") {
                reportData.xirr = null;
            }

            console.log(reportData.xirr)
            // eachData.xirr = reportData

        } else {
            console.log(`Skipped project: ${eachData?.projectName || "Unnamed Project"}`);
        }
    });

  fs.writeFileSync(outputFilePath, JSON.stringify(dataset, null, 2));
}


const inputFilePath = 'exports/masal_properties.json';
const outputFilePath = 'outputs/properties-with-xirr.json';

modifyAndSaveDataset(inputFilePath, outputFilePath);
