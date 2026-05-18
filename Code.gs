/**
 * Autonomous Income Engine - Multi-Channel Google Apps Script Orchestrator
 * Handles: Granny YouTube, Closet Rebel YouTube, Etsy
 * Triggers: Time-based (every 15 min) or manual
 */

const SPREADSHEET_ID = "1ybTJYwPR_IK-ef9_V3Tp_a_3l-spCElLKITXTzmRBAs";
const SECURITY_TOKEN = "closetrebel2026";

// Sheet GIDs for each channel
const CHANNELS = {
  granny: { gid: 1637718687, name: "Granny YouTube" },
  rebel: { gid: 1127933626, name: "Closet Rebel YouTube" },
  etsy: { gid: 1860595195, name: "Etsy" }
};

/**
 * Main orchestrator - reads all three channels and routes to Cloud Function
 */
function runAutonomousIncomeEngine() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const timestamp = new Date().toISOString();

  Logger.log("=== Starting Autonomous Income Engine at " + timestamp);

  // Check each channel
  Object.keys(CHANNELS).forEach(channelKey => {
    const channel = CHANNELS[channelKey];
    processChannel(ss, channelKey, channel, timestamp);
  });

  Logger.log("=== Engine cycle complete ===");
}

/**
 * Process a single channel - read pending rows and trigger Cloud Function
 */
function processChannel(ss, channelKey, channel, timestamp) {
  try {
    // Get the sheet by name
    const sheet = ss.getSheetByName(channel.name);
    if (!sheet) {
      Logger.log("ERROR: Sheet '" + channel.name + "' not found");
      return;
    }

    Logger.log("Processing " + channel.name + "...");

    // Get all data from the sheet
    const range = sheet.getDataRange();
    const values = range.getValues();

    // Find rows with status != "completed" (starting from row 2, skip header)
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowNum = i + 1;

      // Column H = Status, skip if already completed
      const status = row[7] ? String(row[7]).toLowerCase() : "";
      if (status === "completed" || status === "error") {
        continue;
      }

      // Found a pending row - prepare payload
      const payload = {
        token: SECURITY_TOKEN,
        timestamp: timestamp,
        channel: channelKey,
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
      const cloudFunctionUrl = "https://autonomous-income-engine-260985892935.us-central1.run.app/process_income_engine_pipeline";
      const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      try {
        const response = UrlFetchApp.fetch(cloudFunctionUrl, options);
        const responseCode = response.getResponseCode();
        const responseText = response.getContentText();

        Logger.log("Row " + rowNum + " sent. Response: " + responseCode);

        if (responseCode === 200) {
          // Update sheet with success
          sheet.getRange(rowNum, 8).setValue("success");
          sheet.getRange(rowNum, 9).setValue(new Date().toLocaleString());
        } else {
          Logger.log("Response: " + responseText);
          sheet.getRange(rowNum, 8).setValue("api_error: " + responseCode);
        }
      } catch (err) {
        Logger.log("ERROR sending row " + rowNum + ": " + err.toString());
        sheet.getRange(rowNum, 8).setValue("error: " + err.toString());
      }
    }
  } catch (err) {
    Logger.log("ERROR in processChannel: " + err.toString());
  }
}

/**
 * Test function - run manually to verify setup
 */
function testEngine() {
  Logger.log("Testing Autonomous Income Engine...");
  runAutonomousIncomeEngine();
  Logger.log("Test complete. Check execution log above.");
}

/**
 * Utility: Reset all status cells for testing
 */
function resetAllStatus() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  Object.keys(CHANNELS).forEach(channelKey => {
    const channel = CHANNELS[channelKey];
    const sheet = ss.getSheetByName(channel.name);
    if (sheet) {
      const range = sheet.getRange("H2:H100");
      range.clearContent();
      Logger.log("Reset status column for " + channel.name);
    }
  });
}
