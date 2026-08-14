# Bulk Report Export Guide

**Purpose**: Generate PDF reports for multiple students and download them as a ZIP file.

**Security**: Token-based authentication—only you can access this endpoint.

**Use case**: Export assessment reports for non-profits, schools, or partners who tested your system.

---

## Quick Summary: What Happens

1. You provide a list of report IDs
2. API endpoint generates a PDF for each report
3. All PDFs are packaged into a ZIP file
4. You download the ZIP and send it to your contact

**Time**: ~1 minute for 11 reports (puppeteer takes ~5-10 seconds per PDF)

---

## Setup (3 Steps)

### Step 1: Install Dependencies Locally

Open your terminal in the project directory and run:

```bash
npm install puppeteer archiver
```

**What this does:**
- Downloads puppeteer and archiver to your `node_modules/` folder
- Updates your `package.json` file to record these dependencies
- When you push to GitHub, Vercel sees the updated `package.json`
- When Vercel deploys, it automatically runs `npm install` on their servers and downloads these same libraries

**You are NOT uploading the libraries themselves**—just the instruction "use these libraries."

### Step 2: Create Environment Variable

1. Go to **Vercel Dashboard** → Your project
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `REPORT_EXPORT_TOKEN`
   - **Value**: Generate a secure random token. Examples:
     - `sk-export-1234567890abcdefghij`
     - Or use a password generator: https://www.random.org/strings/
   - **Environments**: Select "Production" (or all if testing locally)
4. Click **Save**

**Why a token?** Only you know this secret key. Without it, nobody can access the endpoint.

### Step 3: Push to GitHub

```bash
git add package.json package-lock.json pages/api/export-reports.js
git commit -m "Add bulk report export endpoint with puppeteer PDF generation"
git push
```

Vercel automatically deploys. Wait ~5 minutes for the deployment to complete.

---

## How to Use

### Step 1: Get Report IDs from Database

Open **Supabase Dashboard** → **SQL Editor** and run:

```sql
SELECT 
  r.id as report_id,
  u.student_name,
  r.generated_at
FROM reports r
JOIN assessments a ON r.assessment_id = a.id
JOIN users u ON a.user_id = u.id
WHERE r.generated_at >= '2026-07-23'  -- Change date to match your pilot
ORDER BY r.generated_at DESC
LIMIT 11;
```

**Result**: You'll see a table with report IDs. Copy all the `report_id` values.

Example:
```
report_id                             | student_name      | generated_at
123e4567-e89b-12d3-a456-426614174000  | Alice Johnson     | 2026-07-23
223e4567-e89b-12d3-a456-426614174001  | Bob Smith         | 2026-07-23
323e4567-e89b-12d3-a456-426614174002  | Carol White       | 2026-07-23
... (11 total)
```

### Step 2: Download Reports as ZIP

**Option A: Using curl (Mac/Linux/Windows PowerShell)**

```bash
curl -X POST https://www.pickmypath.co.za/api/export-reports \
  -H "x-export-token: YOUR_SECRET_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "report_ids": [
      "123e4567-e89b-12d3-a456-426614174000",
      "223e4567-e89b-12d3-a456-426614174001",
      "323e4567-e89b-12d3-a456-426614174002"
    ],
    "format": "zip"
  }' \
  -o reports.zip
```

Replace:
- `YOUR_SECRET_TOKEN_HERE` with your actual token (from Step 2)
- The report IDs with the ones from your database query

**Result**: `reports.zip` file downloaded to your computer.

---

**Option B: Using Postman (GUI)**

1. Open Postman
2. Create new request:
   - **Method**: POST
   - **URL**: `https://www.pickmypath.co.za/api/export-reports`
3. Click **Headers** tab, add:
   - **Key**: `x-export-token`
   - **Value**: `YOUR_SECRET_TOKEN_HERE`
4. Click **Body** tab, select "raw" and "JSON", paste:
   ```json
   {
     "report_ids": [
       "123e4567-e89b-12d3-a456-426614174000",
       "223e4567-e89b-12d3-a456-426614174001",
       "323e4567-e89b-12d3-a456-426614174002"
     ],
     "format": "zip"
   }
   ```
5. Click **Send**
6. Response will download as `reports.zip`

---

## Inside the ZIP File

The ZIP contains 11 PDF files:
```
reports.zip
├── Alice Johnson_123e4567.pdf
├── Bob Smith_223e4567.pdf
├── Carol White_323e4567.pdf
├── ... (8 more)
```

Each PDF includes:
- Student name
- Top 6 career matches
- Match percentages
- Career summaries
- Salary ranges
- Report generation date

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **401 Unauthorized** | Check your token is correct. Paste it exactly as shown in Vercel env vars. |
| **404 No reports found** | Verify the report IDs exist in the database. Re-run the SQL query above. |
| **500 Error** | Check deployment finished. Wait 5 minutes after pushing and check Vercel dashboard. |
| **Timeout (>30 sec)** | Vercel has a 30-second limit per request. Limit to 10 reports at a time. |
| **ZIP is empty** | Report IDs may not exist in database. Verify in Supabase first. |

---

## Security Notes

✅ **Token is secret** — Don't share it with anyone. If leaked, you can regenerate it in Vercel.

✅ **HTTPS only** — All communication is encrypted.

✅ **No database changes** — This endpoint only reads; it doesn't modify anything.

✅ **Minimal code** — Simple endpoint, easy to audit.

✅ **Rate-limited** — Maximum 100 reports per request (prevents abuse).

---

## Sending Reports to Non-Profit

Once you have `reports.zip`:

1. Extract all PDFs: Right-click ZIP → Extract
2. Email the 11 PDFs to your contact at the non-profit
3. OR: Upload to Google Drive/Dropbox and share a link

---

## Advanced: Testing Locally (Optional)

If you want to test before pushing to Vercel:

1. Add `REPORT_EXPORT_TOKEN=test-token-123` to your `.env.local`
2. Run `npm run dev` locally
3. Test with: `curl -X POST http://localhost:3000/api/export-reports ...`

---

## Questions?

If you hit issues, check:
1. Is puppeteer installed? Run `npm list puppeteer`
2. Is token in Vercel? Check Settings → Environment Variables
3. Did Vercel deploy? Check dashboard—should show "Ready" status
4. Are report IDs valid? Run SQL query to verify

Need help? Contact support@pickmypath.co.za
