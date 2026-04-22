# How to Capture Webhook Data in Make.com

## The Problem
Your Google Docs module in Make.com shows empty fields because the webhook hasn't received any data yet. Make.com can't map fields it hasn't seen.

## The Solution
**Test the webhook by submitting the quiz on your website.** Once Make.com receives real data, it will automatically detect all available fields.

---

## Step 1: Prepare Make.com to receive data

1. Go to [make.com](https://make.com)
2. Open your scenario (the one with the Webhook trigger)
3. **Do NOT add the Google Docs module yet** — just keep the webhook trigger for now
4. Click the **toggle switch** to turn ON the scenario
5. Set it to run **Immediately**

Your scenario should look like:
```
[Webhook] → (nothing after it yet)
```

---

## Step 2: Test the webhook by taking the quiz

1. Go to your MeNova Health website: `https://menovahealth-mbboc9ya.manus.space` (or your custom domain)
2. Click **"Take the Free Symptom Quiz"**
3. Answer all 8 questions (any answers are fine for testing)
4. Enter your name and email
5. Click **"View My Results"**

**Important:** When you click "View My Results", the quiz will send data to your Make.com webhook.

---

## Step 3: Check if Make.com received the data

1. Go back to Make.com
2. In your scenario, click on the **Webhook module** (the first box)
3. Look for a section called **"Output"** or **"Execution history"**
4. You should see a recent execution with data like:

```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "timestamp": "2026-04-06T...",
  "score": 18,
  "maxScore": 48,
  "tier": "Early Stage",
  "answers": {
    "stage": ["peri_early"],
    "hot_flashes": ["mild"],
    ...
  },
  "recommendation": "Based on your assessment..."
}
```

If you see this data, **you're good!** Make.com has captured the webhook payload.

---

## Step 4: Now add the Google Docs module

1. Click the **+** button after the Webhook
2. Search for **Google Docs**
3. Select **Create a Document from a Template**
4. Click **Add**

### Step 5: Connect Google Docs

1. Click **Connection** dropdown
2. Select your Google account (or create a new connection if needed)
3. Click **Save**

### Step 6: Now the magic happens — map the fields

1. In the Google Docs module, you'll see fields like:
   - **Template Document ID**
   - **Document Title**
   - **Folder ID**
   - **Variables** section

2. Click in the **Document Title** field
3. A **popup** will appear showing all available fields from the webhook:
   - `name`
   - `email`
   - `timestamp`
   - `score`
   - `maxScore`
   - `tier`
   - `answers` (with sub-fields like `stage`, `hot_flashes`, etc.)
   - `recommendation`

4. Click on **`name`** to insert it
5. The field will now show: `{{name}}`

**Repeat this for all fields** you want to map.

---

## Step 7: Map each field in Google Docs module

Here's the exact mapping for each field:

| Google Docs Field | Webhook Field to Select |
|---|---|
| Document Title | `name` + " — Assessment — " + `timestamp` |
| Folder ID | (Your Patient Assessments folder ID) |
| Variables → `{{name}}` | `name` |
| Variables → `{{email}}` | `email` |
| Variables → `{{timestamp}}` | `timestamp` |
| Variables → `{{score}}` | `score` |
| Variables → `{{maxScore}}` | `maxScore` |
| Variables → `{{tier}}` | `tier` |
| Variables → `{{answers_stage}}` | `answers` → `stage` → `[0]` (first item) |
| Variables → `{{answers_hot_flashes}}` | `answers` → `hot_flashes` → `[0]` |
| Variables → `{{answers_sleep}}` | `answers` → `sleep` → `[0]` |
| Variables → `{{answers_mood}}` | `answers` → `mood` → `[0]` |
| Variables → `{{answers_brain_fog}}` | `answers` → `brain_fog` → `[0]` |
| Variables → `{{answers_symptoms_multi}}` | `answers` → `symptoms_multi` → join with ", " |
| Variables → `{{answers_impact}}` | `answers` → `impact` → `[0]` |
| Variables → `{{answers_treatment_history}}` | `answers` → `treatment_history` → `[0]` |
| Variables → `{{recommendation}}` | `recommendation` |

---

## Step 8: Test the full flow

1. Go back to your website
2. Take the quiz again (with different test data)
3. Submit it
4. Go to [Google Drive](https://drive.google.com)
5. Open **Patient Assessments** folder
6. You should see a new document created with all fields filled in!

---

## If Make.com didn't receive the webhook data

**Check these things:**

1. **Is the scenario turned ON?**
   - Look for the toggle switch at the top of the scenario
   - It should be **blue/green** (ON), not gray (OFF)

2. **Did you click "View My Results" in the quiz?**
   - The webhook only fires when you submit the contact form
   - Just answering questions doesn't send the data

3. **Check the webhook URL**
   - In Make.com, click the Webhook module
   - Copy the webhook URL it shows
   - Make sure it matches: `https://hook.us2.make.com/q2vzlc48xdjdmchngqbi3j1u0ilq0n4d`

4. **Check Make.com execution history**
   - Click **Scenario** → **Execution history**
   - Look for failed executions (red X)
   - Click on them to see error messages

5. **Check browser console for errors**
   - On your website, open DevTools (F12 or right-click → Inspect)
   - Go to **Console** tab
   - Look for any red error messages
   - If you see "Failed to fetch", the webhook URL might be wrong

---

## Visual Guide: Where to find things in Make.com

```
Make.com Dashboard
    ↓
Your Scenario
    ↓
[Webhook Module] ← Click here to see "Output" with captured data
    ↓
[Google Docs Module] ← Click here to see available fields when you click in a field
    ↓
[Gmail Module] (optional)
```

---

## Summary

1. ✅ Turn ON the scenario
2. ✅ Take the quiz on your website
3. ✅ Click "View My Results" to send data
4. ✅ Check Make.com Webhook output to see the data
5. ✅ Add Google Docs module
6. ✅ Click in each field and select from the popup
7. ✅ Test again with new quiz submission
8. ✅ Check Google Drive for the created document

Let me know when you see the data in Make.com and I can help you map the fields!
