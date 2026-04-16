# PathFinder SA — Career Guidance Platform

A Next.js web application providing AI-powered career guidance for South African Grade 9 students.

---

## Quick Start (5 steps to go live)

### Step 1 — Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/pathfinder-sa.git
cd pathfinder-sa
npm install
```

### Step 2 — Set up Supabase (free)
1. Go to https://supabase.com and create a free account
2. Create a new project (choose a region close to South Africa — e.g. eu-west-1)
3. Go to **SQL Editor** → **New Query** → paste the entire contents of `supabase-schema.sql` → click **Run**
4. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3 — Configure environment variables
```bash
cp .env.local.example .env.local
```
Open `.env.local` and fill in all values. See comments in the file for where to get each one.

**Minimum required to run locally:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` (from https://console.anthropic.com)
- `ADMIN_EMAIL` + `ADMIN_PASSWORD` (choose anything for local testing)
- `JWT_SECRET` (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Step 4 — Run locally
```bash
npm run dev
```
Open http://localhost:3000

**PayFast is in sandbox mode by default** — you can complete the full flow without a real PayFast account. Payment will be skipped automatically.

### Step 5 — Deploy to Vercel
1. Push your code to GitHub (the `.env.local` file is in `.gitignore` — it will NOT be pushed)
2. Go to https://vercel.com → Import your GitHub repo
3. In Vercel's project settings → **Environment Variables** → add all variables from `.env.local`
4. Deploy!

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/register` | User registration |
| `/login` | User login |
| `/payment` | Payment page (PayFast or sandbox) |
| `/assessment` | 45-question assessment |
| `/report/[id]` | Career report |
| `/admin` | Admin panel (requires ADMIN_EMAIL/ADMIN_PASSWORD) |

---

## Admin Panel (`/admin`)

Log in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD` (set in env vars).

From the admin panel you can:
- **API Keys tab**: Update Anthropic, SendGrid, PayFast keys without redeploying
- **Services tab**: Toggle sandbox mode, pause registrations, check service status
- **Pricing tab**: Change assessment price and VAT rate live
- **Users tab**: See all registered users, payment status, report status
- **Audit Log tab**: See all changes made in the admin panel

---

## Email Setup (SendGrid)

1. Create a free account at https://sendgrid.com
2. Verify your sender email domain
3. Go to Settings → API Keys → Create API Key (Full Access)
4. Add the key as `SENDGRID_API_KEY` in your env vars
5. Set `SENDGRID_FROM_EMAIL` to your verified sender address

---

## Going Live with PayFast

1. Sign up at https://www.payfast.co.za
2. Get your Merchant ID and Merchant Key from your dashboard
3. Set a Passphrase in PayFast settings
4. Add all three to env vars
5. In Admin Panel → Services tab → turn off sandbox mode
6. Set `PAYFAST_SANDBOX=false` in Vercel env vars

---

## Costs (estimated, as of 2025)

| Service | Free tier | Paid tier |
|---------|-----------|-----------|
| Vercel | Free for hobby | $20/month Pro |
| Supabase | 500MB DB, 1GB storage | $25/month Pro (8GB DB, 100GB storage) |
| Anthropic API | Pay per use | ~R1.80–R9 per assessment (Haiku/Sonnet) |
| SendGrid | 100 emails/day free | $19.95/month for 50,000 emails |
| PayFast | Free setup | 3.5% + R2 per transaction |

**Total at launch (under 100 students/month):** ~R0–R500/month
**At 1,000 students/month:** ~R2,000–R3,500/month running costs

---

## Tech Stack

- **Frontend**: Next.js 14 (React)
- **Database + Storage**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Payments**: PayFast
- **Email**: SendGrid via Nodemailer SMTP
- **Auth**: JWT (custom, cookie-based)
- **Hosting**: Vercel
