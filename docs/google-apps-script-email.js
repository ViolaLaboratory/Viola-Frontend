/**
 * Google Apps Script Code for Waitlist Form with Email Confirmation
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this code
 * 4. Click "Deploy" > "New deployment"
 * 5. Choose "Web app" as the type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click "Deploy" and copy the URL
 * 9. Update the URL in Waitlist.tsx (line 58)
 *
 * This script will:
 * - Save form submissions to a Google Sheet
 * - Send a confirmation email to the user
 */

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Get or create the spreadsheet
    const sheet = getOrCreateSheet();

    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'First Name', 'Last Name', 'Email', 'Relation to Music Industry', 'Favorite Song']);
    }

    // Append the data to the sheet
    sheet.appendRow([
      new Date(),
      data.firstName,
      data.lastName,
      data.email,
      data.relation,
      data.favoriteSong
    ]);

    // Send confirmation email
    sendConfirmationEmail(data);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Form submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  // Replace with your own spreadsheet ID, or it will create a new one
  // To get your spreadsheet ID: Open your Google Sheet and look at the URL
  // https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit

  const SPREADSHEET_ID = ''; // Leave empty to create a new sheet, or paste your sheet ID here

  let spreadsheet;
  if (SPREADSHEET_ID) {
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    // Create a new spreadsheet if none exists
    spreadsheet = SpreadsheetApp.create('Viola Waitlist Submissions');
  }

  return spreadsheet.getActiveSheet();
}

function sendConfirmationEmail(data) {
  const recipientEmail = data.email;
  const firstName = data.firstName;

  const subject = "You're on the Viola Waitlist! 🎵";

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 30px 0;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 36px;
          font-weight: bold;
          color: #E4EA04;
          margin-bottom: 10px;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .highlight {
          color: #E4EA04;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          padding: 14px 32px;
          background: #E4EA04;
          color: #000000;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">VIOLA</div>
        <p style="color: #ffffff; margin: 0;">The future of music discovery</p>
      </div>

      <div class="content">
        <h1 style="color: #000000; margin-top: 0;">Welcome to Viola, ${firstName}!</h1>

        <p>Thank you for joining our waitlist. We're excited to have you on board as we build the future of AI-powered music discovery.</p>

        <p>Here's what happens next:</p>

        <ul>
          <li><strong>Early Access:</strong> You'll be among the first to try Viola when we open early access</li>
          <li><strong>Exclusive Updates:</strong> We'll keep you posted on our progress and new features</li>
          <li><strong>Special Perks:</strong> Waitlist members get preferred pricing and direct access to our team</li>
        </ul>

        <p>In the meantime, feel free to share Viola with your network:</p>

        <a href="${PropertiesService.getScriptProperties().getProperty('WEBSITE_URL') || 'https://yourwebsite.com'}/waitlist" class="cta-button">
          Share with Friends
        </a>

        <p style="margin-top: 30px;">We're building something special for tastemakers like you. Stay tuned!</p>

        <p style="margin-top: 30px; margin-bottom: 0;">
          Best,<br>
          <strong>The Viola Team</strong>
        </p>
      </div>

      <div class="footer">
        <p>You received this email because you signed up for the Viola waitlist.</p>
        <p>Questions? Reply to this email or reach us at <a href="mailto:viola@theviola.co">viola@theviola.co</a></p>
      </div>
    </body>
    </html>
  `;

  const plainBody = `
Welcome to Viola, ${firstName}!

Thank you for joining our waitlist. We're excited to have you on board as we build the future of AI-powered music discovery.

Here's what happens next:

• Early Access: You'll be among the first to try Viola when we open early access
• Exclusive Updates: We'll keep you posted on our progress and new features
• Special Perks: Waitlist members get preferred pricing and direct access to our team

In the meantime, feel free to share Viola with your network at ${PropertiesService.getScriptProperties().getProperty('WEBSITE_URL') || 'https://yourwebsite.com'}/waitlist

We're building something special for tastemakers like you. Stay tuned!

Best,
The Viola Team

---
You received this email because you signed up for the Viola waitlist.
Questions? Reply to this email or reach us at viola@theviola.co
  `;

  // Send the email
  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    htmlBody: htmlBody,
    body: plainBody,
    name: 'Viola'
  });
}

// Optional: Set up script properties for configuration
// Run this once to set your website URL
function setupProperties() {
  PropertiesService.getScriptProperties().setProperty('WEBSITE_URL', 'https://yourwebsite.com');
}
