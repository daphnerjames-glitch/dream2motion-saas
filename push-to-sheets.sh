#!/bin/bash
# Deploy Apps Script to Google Sheet via clasp

echo "Pushing updated Code.gs to Google Sheets..."
echo "Make sure you have clasp installed: npm install -g @google/clasp"

# Get Script ID from current directory
SCRIPT_ID=$(grep '"scriptId"' .clasp.json | sed 's/.*"scriptId": "\([^"]*\)".*/\1/')

if [ -z "$SCRIPT_ID" ]; then
    echo "ERROR: No .clasp.json found. Run 'clasp clone YOUR_SCRIPT_ID' first."
    exit 1
fi

echo "Deploying to Script ID: $SCRIPT_ID"

# Push the code
clasp push

if [ $? -eq 0 ]; then
    echo "✅ Apps Script updated successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Go to Google Apps Script editor"
    echo "2. Click Triggers (clock icon)"
    echo "3. Add new trigger: runAutonomousIncomeEngine, Time-driven, Every 15 minutes"
    echo "4. Test by clicking play button next to testEngine"
else
    echo "❌ Push failed. Check your authentication."
    exit 1
fi
