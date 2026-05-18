/**
 * Etsy Automation - Apps Script
 * Reads Etsy sheet and sends to Cloud Function
 */

const SECURITY_TOKEN = "closetrebel2026";
const CLOUD_FUNCTION_URL = "https://autonomous-income-engine-260985892935.us-central1.run.app/process_income_engine_pipeline";

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

    // Column G = Status, skip if completed
    const status = row[6] ? String(row[6]).toLowerCase() : "";
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
        date: row[0],
        title: row[1],
        description: row[2],
        tags: row[3],
        apiKey: row[4],
        postUrl: row[5],
        status: row[6],
        notes: row[7]
      }
    };

    // Send to Cloud Function
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(CLOUD_FUNCTION_URL, options);
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
