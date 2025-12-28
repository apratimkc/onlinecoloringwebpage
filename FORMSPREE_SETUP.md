# Formspree Setup Guide - Contact Form Integration

## What is Formspree?

Formspree is a form backend service that forwards form submissions to your email. It's free for up to 50 submissions per month and **works with any hosting provider** (Netlify, GitHub Pages, Vercel, etc.).

---

## Why Use Formspree?

✅ **Hosting Independent** - Not tied to Netlify or any specific host
✅ **Free tier** - 50 submissions/month (enough for starting out)
✅ **No backend code** - Just change the form action URL
✅ **Spam protection** - Built-in anti-spam features
✅ **Easy setup** - Takes 5 minutes

---

## Setup Steps

### Step 1: Create Formspree Account

1. Go to https://formspree.io
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with **apratim.056@gmail.com**
4. Verify your email address

### Step 2: Create a New Form

1. After logging in, click **"+ New Form"**
2. Form name: `MagicPencil Contact Form`
3. Your email: `apratim.056@gmail.com`
4. Click **"Create Form"**

### Step 3: Get Your Form Endpoint

After creating the form, you'll see:
```
https://formspree.io/f/YOUR_FORM_ID
```

Copy this URL - you'll need it next.

### Step 4: Update contact.html

Open `contact.html` and find line 179:

**BEFORE:**
```html
<form class="contact-form" id="contact-form" action="#" method="POST">
```

**AFTER:**
```html
<form class="contact-form" id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Replace `YOUR_FORM_ID` with the actual ID from Step 3.

### Step 5: Test the Form

1. Deploy your changes to Netlify (commit and push)
2. Visit your live site: https://magicpencil.fun/contact.html
3. Fill out the form with test data
4. Submit the form
5. You should receive an email at apratim.056@gmail.com

---

## Formspree Dashboard Features

Once set up, you can:

- **View submissions** - See all form submissions in the dashboard
- **Export data** - Download submissions as CSV
- **Configure notifications** - Customize email notifications
- **Add spam filtering** - Enable reCAPTCHA or honeypot
- **Set up autoresponders** - Send automatic thank you emails

---

## Free Tier Limits

- **50 submissions per month**
- Unlimited forms
- Basic spam filtering
- Email notifications

If you exceed 50 submissions/month, you can upgrade to:
- **Gold Plan: $10/month** - 1,000 submissions
- **Platinum Plan: $40/month** - 10,000 submissions

---

## Important Notes

1. **Form field names must match** - Formspree uses the `name` attribute from your form fields
2. **Current form fields:**
   - `name` - User's name
   - `email` - User's email
   - `subject` - Subject dropdown
   - `message` - Message textarea

3. **These are already correct in contact.html** - No changes needed!

---

## Alternative: Netlify Forms

If you want to stick with Netlify (but remember, you'll be locked to Netlify hosting):

1. Open `contact.html`
2. Change line 179 from:
   ```html
   <form class="contact-form" id="contact-form" action="#" method="POST">
   ```
   To:
   ```html
   <form class="contact-form" id="contact-form" netlify method="POST">
   ```

3. Add a hidden field:
   ```html
   <input type="hidden" name="form-name" value="contact" />
   ```

**That's it!** Netlify will automatically handle form submissions.

---

## Recommendation

**Use Formspree** for better flexibility and future-proofing. You won't be locked to Netlify and can switch hosting providers anytime.

---

## Support

- Formspree Documentation: https://help.formspree.io
- Formspree Support: support@formspree.io
- Netlify Forms Docs: https://docs.netlify.com/forms/setup/

---

**Created:** 2025-12-28
**Last Updated:** 2025-12-28
