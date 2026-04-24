# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**PickMyPath** is a Next.js-based career guidance platform for South African Grade 9 students. The app combines AI-powered assessment (via Anthropic Claude) with a multi-stage user flow: registration → email verification → payment → 45-question assessment → AI-generated career report.

---

## Development Commands

```bash
npm install           # Install dependencies
npm run dev          # Run dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
```

---

## Architecture & Key Patterns

### Authentication & Authorization

- **JWT-based auth** via cookies: tokens stored as `pf_token` cookie (7-day expiry)
- **Two tiers**: user (`isAdmin: false`) vs admin (`isAdmin: true`)
- **Key functions** in `lib/auth.js`:
  - `signToken()` / `verifyToken()` — JWT signing and validation
  - `getTokenFromRequest()` / `getUserFromRequest()` — extract user from request
  - `getAdminFromRequest()` — admin-only access check
- **Password hashing**: bcryptjs (10 salt rounds)
- **Admin panel** (`/admin`) requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars; login creates admin JWT

### Database & Data Layer

- **Supabase (PostgreSQL)** via `lib/supabase.js`:
  - Public client: `supabase` (uses anon key, safe for browser)
  - Server client: `supabaseAdmin()` (uses service role key, API routes only)
- **Key tables**: `users`, `assessments`, `reports`, `payments`, `audit_logs`
- **User flow stages tracked**:
  - `email_verified` (bool)
  - `payment_status` ("pending" | "completed" | null)
  - `assessment_status` ("not_started" | "in_progress" | "completed")
- **Schema files** in repo root:
  - `supabase-schema.sql` — core tables and RLS policies
  - `supabase-add-auth-columns.sql` — optional auth extensions

### API Routes & Patterns

API endpoints follow this structure:
```
/pages/api/[domain]/[action].js
```

- **Auth domain** (`pages/api/auth/`): register, login, verify email, password reset, Google OAuth, stage updates
- **Assessment domain** (`pages/api/assessment/`): submit answers, generate report (calls Claude), fetch user reports
- **Payment domain** (`pages/api/payment/`): initiate PayFast transaction, verify payment callback
- **Admin domain** (`pages/api/admin/`): protected routes requiring `getAdminFromRequest()` check, including config updates, user management, audit logging

**API handler pattern**:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  // Validate input
  const user = getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  // Business logic
  // Return response
}
```

### AI Report Generation

- **File**: `lib/generateReport.js`
- **Flow**: Anthropic Claude API processes 45 assessment answers → generates personalized career guidance report
- **Model selection**: controlled by `AI_MODEL` env var (default: claude-haiku-4-5-20251001 for dev, use claude-sonnet-4-6 for production quality)
- **Stored in DB**: `reports` table with `generated_at`, `career_paths`, `recommendations`

### Email & Notifications

- **Service**: Resend API (`lib/sendEmail.js`)
- **Use cases**: email verification links, password reset, payment receipts
- **Config**: `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` env vars

### Payment Integration

- **Gateway**: PayFast (South African payment processor)
- **Sandbox mode**: enabled by default when `PAYFAST_SANDBOX=true`
- **Flow**: Payment initiation → user redirected to PayFast → callback verification → mark payment as completed in DB
- **Fallback**: PayFast is in sandbox by default; live mode disabled until merchant credentials configured

### Admin Panel & Auditing

- **URL**: `/admin`
- **Tabs**: API Keys, Services, Pricing, Users, Audit Log
- **Key features**:
  - Update Anthropic/PayFast/SendGrid keys without redeploying
  - Toggle sandbox mode and feature flags
  - View all users and payment status
  - Audit log tracks all admin panel changes (who, what, when)
- **Access**: JWT with `isAdmin: true` flag from session cookie

### Questions & Assessment Data (Stage-Specific)

- **File**: `lib/questions.js`
- **Frameworks**: Holland RIASEC, Career Values, Aptitude (based on SDS, SII, MBTI, Kuder, CareerDirect)
- **Structure**: Questions organized by section (interests, values, aptitude, parent observations, academic marks)
- **Stage filtering**: Each question has a `stages` array specifying which career stages can see it
  - **Students (Grade 8-12)**: See all ~49 questions including parent input section and academic marks
  - **Working Adults/Career Change (gap_year, university_student, career_change, working_adult)**: See ~30 questions tailored to professionals (no parent section, no academic marks, no "favorite school subject" questions)
- **Key function**: `getQuestionsForStage(stage)` returns filtered questions/sections based on user's grade/stage
- **Example variants**:
  - Students get "Which school subject do you enjoy?" → Adults get "Which aspect of work energises you?"
  - Students get "What are your academic strengths?" → Adults get "What are your professional strengths?"
- **Client submission**: POST `/api/assessment/submit` with answer array → API uses `getQuestionsForStage()` to validate answers against correct question set

### Configuration & Stages

- **File**: `lib/stageConfig.js`
- **Purpose**: Defines user flow stages and eligibility rules (e.g. can't access assessment without payment)
- **Used by**: Frontend to enable/disable UI, API routes to guard access

---

## Environment Variables

See `.env.local.example` for the full list. Key secrets required to run locally:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` and `AI_MODEL`
- `JWT_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (free choice for local testing)
- `NEXT_PUBLIC_PAYFAST_SANDBOX=true` (default; set false to enable live payment processing)

---

## Common Tasks

### Adding a new API endpoint
1. Create file in `pages/api/[domain]/[action].js`
2. Export default async handler function
3. Extract user/admin via `getUserFromRequest()` or `getAdminFromRequest()` if protected
4. Query Supabase using `supabaseAdmin()` for server-side operations
5. Return JSON response with status code

### Modifying the assessment flow
1. Update questions in `lib/questions.js` if changing question set
2. Update `lib/stageConfig.js` to reflect new eligibility rules
3. Test the full flow: register → verify → payment → assessment submission → report generation

### Deploying to production
1. Set all env vars in Vercel project settings (copy from `.env.local`)
2. Ensure `NEXT_PUBLIC_PAYFAST_SANDBOX=false` if live payments enabled
3. Use `claude-sonnet-4-6` for `AI_MODEL` in production (Haiku is for testing)
4. Deploy via Vercel UI (automatic on GitHub push)

---

## Testing Notes

- **No automated test suite** — test manually via `npm run dev` and browser at http://localhost:3000
- **PayFast sandbox** allows full payment flow testing without real transactions
- **Admin panel** accessible with env var credentials on `/admin`

