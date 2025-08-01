import { readFile, writeFile } from "fs/promises";
import { convertDateToUnix } from "../helper/dateTime.js";
import { convertToCrore } from "../helper/costFormat.js";
import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  fs.readFileSync("secrets/service-accounts/masal.json", "utf-8")
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const filePath = "exports/main.json";

// Get base count only once
const getAssetDataStartIndex = async () => {
  const snapshot = await db.collection("assetData").get();
  return snapshot.size + 1;
};

const processFile = async () => {
  try {
    const data = await readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);

    let currentIndex = await getAssetDataStartIndex();

    for (const item of jsonData) {
      // Assign new ID and increment
      item.id = `P00${currentIndex++}`;

      if (Array.isArray(item.auctions)) {
        for (const auction of item.auctions) {
          if (auction.auctionDate) {
            auction.auctionDate = convertDateToUnix(auction.auctionDate);
          }
          if (auction.emdSubmissionDate) {
            auction.emdSubmissionDate = convertDateToUnix(
              auction.emdSubmissionDate
            );
          }
          if (auction.units) {
            for (const unit of auction.units) {
              unit.reservePrice = convertToCrore(unit.reservePrice);
            }
          }
        }
      }

      // Normalize assetType
      switch (item.assetType) {
        case "Plot":
          item.assetType = "plot";
          break;
        case "Villa":
          item.assetType = "villa";
          break;
        case "Independent Building":
          item.assetType = "independentBuilding";
          break;
        case "Apartment":
          item.assetType = "apartment";
          break;
        case "Commercial":
          item.assetType = "commercial";
          break;
      }

      // Ensure default values
      if (!item.auction) item.auction = false;
      if (!item.configurations) item.configurations = [];
      if (!item.data) item.data = [];
      if (!item.availability) item.availability = {};
    }

    await writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf8");
    console.log(
      "✅ Property IDs assigned, dates converted, prices formatted, and file updated:",
      filePath
    );
  } catch (err) {
    console.error("❌ Error processing the file:", err);
  }
};

processFile();
