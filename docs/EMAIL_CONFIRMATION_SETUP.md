# Email Confirmation Setup Guide

This guide will help you set up automated email confirmations for the Viola waitlist form.

## Option 1: Google Apps Script (Recommended - Free & Easy)

### Step 1: Create or Update Your Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. If you already have a script for your form, open it. Otherwise, create a new project
3. Replace the code with the contents of `google-apps-script-email.js` in this folder
4. Save the project (give it a name like "Viola Waitlist Handler")

### Step 2: Configure Email Settings

The script is already configured to send professional-looking HTML emails. You can customize:
- The email subject line (line 81)
- The email template (lines 85-157)
- Your website URL for the share button

To set your website URL (optional):
1. In your Apps Script project, click on "Run" > "Run function" > "setupProperties"
2. Grant the necessary permissions
3. Edit line 175 to include your actual website URL

### Step 3: Connect to Google Sheets (Optional)

If you want to save submissions to a Google Sheet:
1. Create a new Google Sheet or use an existing one
2. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`
3. Paste the ID on line 62 of the script where it says `const SPREADSHEET_ID = '';`

### Step 4: Deploy the Script

1. Click "Deploy" > "New deployment"
2. Click the gear icon next to "Select type" and choose "Web app"
3. Fill in the deployment settings:
   - **Description**: "Viola Waitlist v1" (or any description)
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click "Deploy"
5. Review and authorize the permissions:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" > "Go to [Your Project Name] (unsafe)"
   - Click "Allow"
6. Copy the "Web app URL" that appears

### Step 5: Update Your Frontend

The form is already set up correctly, but verify the URL in `src/pages/Waitlist.tsx`:
- Line 58 should have your Google Apps Script web app URL
- The current URL in the code needs to be replaced with your new deployment URL

### Step 6: Test the Email

1. Submit a test form on your waitlist page
2. Check the email inbox you used
3. You should receive a confirmation email within a few seconds

**Note**: Emails sent from Google Apps Script come from your Gmail address. If you want to use a custom "from" address, see Option 2 below.

---

## Option 2: Using a Professional Email Service (Resend, SendGrid, etc.)

If you want more control over your emails (custom domain, better deliverability, analytics), you can use a service like Resend.

### Why Use Resend?
- ✅ Free tier: 3,000 emails/month
- ✅ Custom domain support (emails from noreply@viola.com)
- ✅ Better deliverability than Gmail
- ✅ Email analytics
- ✅ Easy API

### Setup with Resend

1. **Sign up**: Go to [resend.com](https://resend.com) and create an account

2. **Get your API key**:
   - Go to API Keys in your Resend dashboard
   - Create a new API key
   - Copy it (you'll need it in a moment)

3. **Create a backend endpoint** (you'll need a simple server):
   - You can use Vercel, Netlify Functions, or Cloudflare Workers
   - Example code is below

4. **Update your frontend** to call your new endpoint instead of Google Sheets

### Example Vercel Serverless Function

Create a file at `api/send-confirmation.js`:

\`\`\`javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName } = req.body;

  try {
    await resend.emails.send({
      from: 'Viola <noreply@yourwebsite.com>',
      to: email,
      subject: "You're on the Viola Waitlist! 🎵",
      html: \`
        <h1>Welcome to Viola, \${firstName}!</h1>
        <p>Thank you for joining our waitlist...</p>
      \`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
\`\`\`

---

## Testing Your Setup

1. Fill out the waitlist form with your email
2. Submit the form
3. Check your inbox (and spam folder)
4. Verify you received the confirmation email

## Troubleshooting

### Emails not sending from Google Apps Script
- Make sure you authorized all permissions
- Check that MailApp has permission to send emails on your behalf
- Verify the recipient email address is valid

### Emails going to spam
- This is common with Google Apps Script emails
- For production, consider using Option 2 with a professional email service
- If using a custom domain, set up SPF and DKIM records

### Form submission works but no email
- Check the Google Apps Script logs: View > Logs (or Executions)
- Look for any error messages
- Verify the email address in the form data is correct

## Need Help?

If you run into issues:
1. Check the Google Apps Script execution logs
2. Make sure all permissions are granted
3. Test with different email addresses
4. Check your spam folder

---

**Current Status**: The waitlist form is configured to use Google Apps Script at the URL in `Waitlist.tsx`. Update the script code to enable email confirmations.
