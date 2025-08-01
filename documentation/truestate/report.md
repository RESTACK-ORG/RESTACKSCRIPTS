# Report Creation Flow

This document describes the report creation flow implemented in the `createReport` function.

## Overview

The `createReport` function calculates the Internal Rate of Return (IRR) for a property investment based on the provided input data. It takes into account factors such as acquisition price, tenure, holding period, construction completion date, final price, interest rate, loan percentage, and asset type.

## Function Signature

```javascript
function createReport(data) {
  // ...
}
```

## Input Parameters

The `createReport` function accepts a single argument, `data`, which is an object containing the following properties:

-   `acquisitionPrice`: The initial price of the property.
-   `tenure`: The loan tenure in years.
-   `holdingPeriod`: The period for which the property is held in years.
-   `constructionCompletionDate`: The estimated completion date of the construction in `YYYY-MM-DD` format.
-   `finalPrice`: The expected selling price of the property at the end of the holding period.
-   `interestRate`: The annual interest rate on the loan.
-   `loanPercentage`: The percentage of the acquisition price covered by the loan.
-   `assetType`: The type of asset, which can be 'plot', 'apartment', or 'villa'.

## Workflow

1.  **Initialization:**
    -   The function retrieves the input parameters from the `data` object.
    -   It sets a default `constructionCompletionDate` if one is not provided.
    -   It calculates the booking amount (10% of the acquisition price) and the possession amount (minimum of 5% and 90% - loan percentage of the acquisition price).
    -   It determines whether transfer fees (2%) or stamp duty and registration charges (6.5%) apply based on the handover period and holding period.
    -   It calculates the remaining loan amount and the amount to be paid to the builder.

2.  **Loan Disbursement Calculation:**
    -   The function calculates the loan disbursement schedule based on the asset type and the number of quarters between the booking date and the construction completion date.
    -   For 'plot' assets, the loan is disbursed equally over the quarters.
    -   For 'apartment' and 'villa' assets, the loan is disbursed based on predefined distributions for 1, 2, 3, or 4 years.

3.  **Cash Flow Calculation:**
    -   The function generates a monthly cash flow table that includes the opening loan amount, monthly cash flow, EMI, interest, principal, closing loan amount, and amount paid to the builder.
    -   It also generates a yearly cash flow array.
    -   The cash flows take into account the booking amount, possession amount, transfer fees or stamp duty and registration charges, loan repayments, and the final selling price.

4.  **IRR Calculation:**
    -   The function calculates the IRR using the monthly cash flows.
    -   It uses the `calculateIRRMonthly` function to perform the IRR calculation.

5.  **Result:**
    -   The function returns an object containing the calculated IRR (xirr).

## Functions

### `formatCost(price)`

This function formats a number as currency (Indian Rupees) with commas and the ₹ symbol.

### `calculateLoanDisbursement(quarters, totalLoanAmount, assetType)`

This function calculates the loan disbursement schedule based on the asset type and the number of quarters.

### `calculateIRRMonthly(values, initialGuess = 0.05)`

This function calculates the Internal Rate of Return (IRR) for a series of cash flows.

## Example

```javascript
const data = {
  acquisitionPrice: 10000000,
  tenure: 10,
  holdingPeriod: 5,
  constructionCompletionDate: "2027-12-31",
  finalPrice: 15000000,
  interestRate: 8.5,
  loanPercentage: 70,
  assetType: "apartment",
};

const report = createReport(data);
console.log(report);
// Expected output: { xirr: 12.50 } (approximately)
```

## Error Handling

The function includes error handling to catch invalid input and calculation errors. If an error occurs, the function returns an object with an `error` property containing the error message.