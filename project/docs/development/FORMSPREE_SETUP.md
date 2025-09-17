# Formspree Setup Guide

## Why You're Not Receiving Emails

The forms are currently using default Formspree IDs that belong to test accounts. To receive emails, you need to:

1. **Create your own Formspree forms**
2. **Update the environment variables with YOUR form IDs**

## Step 1: Create Formspree Account

1. Go to https://formspree.io
2. Sign up for a free account
3. Verify your email

## Step 2: Create Your Forms

Create THREE separate forms in Formspree:

### 1. Contact Form
- Name: "Meta3Ventures Contact"
- Note the form ID (looks like: `mXXXXXXX`)

### 2. Application Form  
- Name: "Meta3Ventures Applications"
- Note the form ID

### 3. Newsletter Form
- Name: "Meta3Ventures Newsletter"
- Note the form ID

## Step 3: Update Environment Variables

### For Local Development
Create `.env` file in `/project` directory:
```env
VITE_FORMSPREE_CONTACT_KEY=your_contact_form_id
VITE_FORMSPREE_APPLY_KEY=your_apply_form_id
VITE_FORMSPREE_NEWSLETTER_KEY=your_newsletter_form_id
```

### For Netlify Deployment
1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Add these variables:
   - `VITE_FORMSPREE_CONTACT_KEY` = your_contact_form_id
   - `VITE_FORMSPREE_APPLY_KEY` = your_apply_form_id
   - `VITE_FORMSPREE_NEWSLETTER_KEY` = your_newsletter_form_id
4. Redeploy your site

## Step 4: Configure Email Notifications in Formspree

For each form in Formspree:
1. Click on the form
2. Go to "Settings" → "Email Notifications"
3. Add your email address
4. Configure notification settings

## Current Default IDs (Test Account)
These are currently in use but won't send emails to you:
- Contact: `mldbpggn`
- Apply: `myzwnkkp`
- Newsletter: `xdkgwaaa`

## How It Works

1. When a user submits a form:
   - Data is ALWAYS saved locally in browser storage (backup)
   - If Formspree is configured, it sends email
   - User sees single success toast message

2. If Formspree fails:
   - Data is still saved locally
   - User still sees success message
   - You can access saved data in Admin Dashboard

## Testing

After setup:
1. Submit a test form on your site
2. Check your email for Formspree notification
3. Check Formspree dashboard for submission
4. Check Admin Dashboard for local backup

## Troubleshooting

- **No emails received**: Check spam folder
- **Form says "succeeded" but no email**: Verify form IDs are correct
- **"Failed to submit"**: Check browser console for errors
- **Multiple success messages**: Clear browser cache and refresh

## Note
Forms will work WITHOUT Formspree (data saves locally), but you won't receive email notifications.