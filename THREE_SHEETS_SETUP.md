# Three-Sheet Automation Setup

Your original data stays in **Genxie Pin Queue** (untouched).
Your automation runs from **three new separate sheets** (below).

---

## NEW SHEETS (Created Today)

### 1. Granny YouTube Automation
https://docs.google.com/spreadsheets/d/1k47LHV0C0c-KVN_00M-gIss1mznLnzLmAJul8x1qTU8/

### 2. Closet Rebel YouTube Automation
https://docs.google.com/spreadsheets/d/1MVWua6BbW-R5WeWP6OCrom8O2cm1cLnc5lPcl9L6sNc/

### 3. Etsy Automation
https://docs.google.com/spreadsheets/d/11hZKiHAp12b4_Lgxy39AgEKbbvdCX3QlaoK78kRwbqg/

---

## SETUP STEPS (For Each Sheet)

### Step 1: Add Column Headers
In each new sheet, add headers in row 1:
- A: Date
- B: Title
- C: Description
- D: Tags
- E: API Key
- F: Post URL
- G: Status (leave blank for pending)
- H: Error Notes
- I: Last Updated

### Step 2: Copy Your Content
**From Genxie Pin Queue**, copy your content rows into the matching sheet:
- **Granny**: YouTube story rows → Granny YouTube Automation
- **Rebel**: YouTube shorts rows → Closet Rebel YouTube Automation
- **Etsy**: Etsy product rows → Etsy Automation

### Step 3: Add Apps Script to Each Sheet

For **Granny YouTube Automation**:
1. Extensions > Apps Script
2. Delete any code
3. Copy entire `Code_Granny.gs` from your Brain folder
4. Paste into Apps Script editor
5. Click **Save**

Repeat for **Closet Rebel** (use `Code_Rebel.gs`) and **Etsy** (use `Code_Etsy.gs`).

### Step 4: Set Up Triggers

In each sheet's Apps Script editor:

1. Click **Triggers** (clock icon on left)
2. Click **+ Add Trigger** (bottom right)
3. Configure:
   - Function: `runGrannyAutomation` (or `runRebelAutomation` / `runEtsyAutomation`)
   - Event source: **Time-driven**
   - Type: **Minutes timer**
   - Interval: **Every 15 minutes**
4. Click **Save**

### Step 5: Test

In Apps Script editor, click the play button next to `testGranny()` (or `testRebel()` / `testEtsy()`).
Check the **Execution log** to verify it's working.

---

## YOUR DATA STRUCTURE

Each row needs:
- Column A (Date): YYYY-MM-DD format
- Column B (Title): Content title
- Column C (Description): Details
- Column D (Tags): Comma-separated
- Column E (API Key): Vidu key (YouTube) or Etsy key
- Column F (Post URL): Filled by system after posting
- Column G (Status): Leave blank for new rows. System fills with "success" or "error"

---

## WHAT HAPPENS NOW

✅ Original Genxie Pin Queue stays untouched (existing automations use it)
✅ Three new sheets read their own data independently
✅ Each sheet runs on 15-minute timer
✅ Each sends only its channel's data to Cloud Function
✅ Cleaner, simpler, less confusion

---

## TODAY'S CONTENT (May 13-14-15)

Add these rows to the appropriate sheets:
- **May 13**: Granny YouTube → Row 2
- **May 14**: Closet Rebel YouTube → Row 2
- **May 14**: Etsy → Row 2

Leave Status column blank. System will post them within 15 minutes of saving.

---

## Cloud Function URL (Same for All Three)
```
https://autonomous-income-engine-260985892935.us-central1.run.app/process_income_engine_pipeline
```

(Already in Code_Granny.gs, Code_Rebel.gs, Code_Etsy.gs)
