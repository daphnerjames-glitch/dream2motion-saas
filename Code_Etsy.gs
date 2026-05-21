/**
 * Etsy Automation - Apps Script
 * Reads Etsy sheet and sends to Closet Rebel Autonomous Income Engine
 */

const SECURITY_TOKEN = "closetrebel2026";
const INCOME_ENGINE_URL = "https://closet-rebel-autonomous-income-engine.vercel.app/api/income_engine";

function runEtsyAutomation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // First sheet
  const timestamp = new Date().toISOString();

  Logger.log("=== Etsy Automation started at " + timestamp);

  const range = sheet.getDataRange();
  const values = range.getValues();

  // Loop through rows (skip header, start at row 2)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowNum = i + 1;

    // Column H = Status, skip if completed
    const status = row[7] ? String(row[7]).toLowerCase() : "";
    if (status === "completed" || status === "error") {
      continue;
    }

    // Found pending row
    const payload = {
      token: SECURITY_TOKEN,
      timestamp: timestamp,
      channel: "etsy",
      rowNumber: rowNum,
      data: {
        date: row[2],
        title: row[0],
        description: row[1],
        tags: row[6],
        price: row[5],
        status: row[7],
        notes: row[8]
      }
    };

    // Send to Income Engine API
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(INCOME_ENGINE_URL, options);
      const responseCode = response.getResponseCode();

      Logger.log("Row " + rowNum + " sent. Response: " + responseCode);

      if (responseCode === 200) {
        sheet.getRange(rowNum, 8).setValue("success");
        sheet.getRange(rowNum, 9).setValue(new Date().toLocaleString());
      } else {
        sheet.getRange(rowNum, 8).setValue("api_error: " + responseCode);
      }
    } catch (err) {
      Logger.log("ERROR: " + err.toString());
      sheet.getRange(rowNum, 8).setValue("error: " + err.toString());
    }
  }

  Logger.log("=== Etsy automation cycle complete ===");
}

function testEtsy() {
  Logger.log("Testing Etsy automation...");
  runEtsyAutomation();
}
