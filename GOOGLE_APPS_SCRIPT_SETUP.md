# Google Apps Script Setup for Waitlist Form

Follow these steps to set up a Google Apps Script Web App that will receive form submissions from your waitlist page and save them to Google Sheets.

## Step 1: Open Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Open the sheet with ID: `1vHgAqdneki1evom1x1rmzoXlc42o-yw1rlTBB64YU6Q`
   - Or create a new sheet if needed

## Step 2: Set Up Sheet Headers

Make sure your first row has these column headers:
- **A1**: Timestamp
- **B1**: First Name
- **C1**: Last Name
- **D1**: Email
- **E1**: Relation to Music Industry
- **F1**: Favorite Song

## Step 3: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. This will open the Apps Script editor in a new tab

## Step 4: Paste the Script

Delete any existing code and paste this script:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Create timestamp
    const timestamp = new Date();

    // Append row with form data
    sheet.appendRow([
      timestamp,
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.relation || '',
      data.favoriteSong || ''
    ]);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Test function
function doGet(e) {
  return ContentService.createTextOutput('Viola Waitlist Web App is running!');
}
```

## Step 5: Deploy as Web App

1. Click the **Deploy** button (top right) → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Viola Waitlist Form Handler"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Important**: Copy the Web App URL that appears (it will look like: `https://script.google.com/macros/s/...`)

## Step 6: Authorize the Script

1. The first time you deploy, you'll need to authorize the script
2. Click **Authorize access**
3. Choose your Google account
4. Click **Advanced** → **Go to [Project Name] (unsafe)**
5. Click **Allow**

## Step 7: Update Your Waitlist Component

Replace the placeholder URL in your `Waitlist.tsx` file:

**Find this line (around line 55):**
```typescript
await fetch("YOUR_GOOGLE_SHEETS_WEB_APP_URL", {
```

**Replace with your actual Web App URL:**
```typescript
await fetch("https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/exec", {
```

## Step 8: Test the Form

1. Go to your waitlist page
2. Fill out the form
3. Submit it
4. Check your Google Sheet - a new row should appear with the form data!

## Troubleshooting

### Form Not Submitting?
- Check browser console for errors
- Make sure the Web App is deployed with "Anyone" access
- Verify the URL in Waitlist.tsx matches your deployment URL

### Data Not Appearing in Sheet?
- Check that your sheet has the correct headers in row 1
- Try viewing the Apps Script logs: In Apps Script editor, click **Executions** on the left sidebar

### Need to Update the Script?
1. Make changes in the Apps Script editor
2. Click **Deploy** → **Manage deployments**
3. Click the pencil icon ✏️ next to your deployment
4. Update the version to "New version"
5. Click **Deploy**

## Security Notes

✅ **Why This is Safe:**
- Script runs server-side on Google's infrastructure
- No API keys or credentials exposed in frontend code
- Only accepts POST requests with form data
- Google handles authentication and authorization

❌ **Do NOT:**
- Put your `.env` file in version control (it's already in `.gitignore`)
- Share your Web App deployment URL publicly (only your frontend should use it)

## Next Steps

After successful testing:
1. Remove the `.env` file (not needed for Google Apps Script approach)
2. Consider adding data validation in the script
3. Optional: Set up email notifications when new submissions arrive

---

Need help? Check the [Google Apps Script documentation](https://developers.google.com/apps-script)
