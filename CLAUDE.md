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

### Google OAuth & Firebase Configuration

- **Firebase Project**: `pathfinder-55a19` (Project ID)
- **Google OAuth**: Uses Firebase for OAuth integration with Google Sign-In
- **Key distinction**: Firebase has two separate configuration points:
  1. **Firebase Console → Authorized Domains** — whitelist of domains where auth can redirect *to* (passive allow-list)
  2. **Google Cloud Console → OAuth 2.0 Client Credentials → Authorized redirect URIs** — active list of where OAuth can redirect (must be explicitly configured)
- **Common issue**: Domain whitelisted in Firebase but OAuth redirects still go to Firebase default domain because Google Cloud OAuth credentials lack the redirect URI configuration
- **Setup checklist**:
  1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**
  2. Find the OAuth 2.0 Client ID (type: Web application)
  3. Add **both** `https://www.pickmypath.co.za/api/auth/google/callback` and `https://pickmypath.co.za/api/auth/google/callback` to **Authorized redirect URIs**
  4. Also whitelist both domains in **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
  5. Verify `.env.local` has `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` pointing to custom domain (not Firebase default)
- **Environment variables required**:
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID
  - `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase API key from web app config
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — custom auth domain for redirects (e.g., `pickmypath.co.za`)
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth client ID from Google Cloud Console
- **Testing**: After updating, test login from actual domain (not localhost) to verify redirect works

### Database & Data Layer

- **Supabase (PostgreSQL)** via `lib/supabase.js`:
  - Public client: `supabase` (uses anon key, safe for browser)
  - Server client: `supabaseAdmin()` (uses service role key, API routes only)
- **Key tables**: `users`, `assessments`, `reports`, `payments`, `audit_logs`
- **Users table fields**:
  - `full_name` — account holder name (parent/guardian if they're registering for a child)
  - `student_name` — the student being assessed (may differ from account holder)
  - `email_verified` (bool)
  - `payment_status` ("pending" | "completed" | null)
  - `assessment_status` ("not_started" | "in_progress" | "completed")
- **Schema files** in repo root:
  - `supabase-schema.sql` — core tables, RLS policies, and migrations (includes student_name column migration)
  - `supabase-add-auth-columns.sql` — optional auth extensions
- **Database migration required**: Run the `ALTER TABLE users ADD COLUMN student_name` migration from `supabase-schema.sql` in Supabase SQL Editor

### API Routes & Patterns

API endpoints follow this structure:
```
/pages/api/[domain]/[action].js
```

- **Auth domain** (`pages/api/auth/`): register, login, verify email, password reset, Google OAuth, stage/student name updates
  - **Registration** (`pages/register.js` → `/api/auth/register`): Captures both account holder name and student name separately
  - **Google OAuth** (`/api/auth/google`): 
    - Creates user with Google display name as `full_name` and `student_name` as null
    - Returns `needsStage` and `needsStudentName` flags
    - Frontend shows stage modal first (if needed), then student name modal (if needed)
  - **Update student name** (`/api/auth/update-student-name`): API endpoint to save student name after Google sign-in
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

### AI Report Generation & Display

- **Generation**: `lib/generateReport.js`
  - Anthropic Claude API processes 45 assessment answers → generates personalized career guidance report
  - Model selection: controlled by `AI_MODEL` env var (default: claude-haiku-4-5-20251001 for dev, use claude-sonnet-4-6 for production quality)
  - AI prompt allows markdown formatting (bold `**text**`, bullets `*`, tables `|`) inside JSON field values for structured content
  - Stored in DB: `reports` table with `generated_at`, `career_paths`, `recommendations`
- **Display**: `pages/report/[id].js`
  - Shows student's name (from `student_name` field) on report header
  - Key sections: RIASEC profile, academic observations, top 3 careers, subject advice, parent note, motivational note
  - **Markdown rendering** (using `react-markdown` + `remark-gfm`):
    - All multi-line text fields render with full markdown support (paragraphs, bold, bullets, tables)
    - Subject comparison tables render as proper HTML tables with navy headers and alternating row colors
    - Parent notes and motivational notes render as clean prose (not forced into bullet lists)
    - `MarkdownContent` component wraps ReactMarkdown for consistent styling via `.report-md` CSS class
  - **Text color improvements**:
    - Header section text (stage context + RIASEC summary) now uses `rgba(255,255,255,0.88)` (clear white) instead of #333 (nearly invisible on navy)
    - Gold divider line added between stage context and RIASEC badge for visual separation
  - **Print/PDF styling**:
    - A4 page alignment with proper margins (0.5in)
    - Professional table styling with visible borders and alternating row colors
    - Page-break-inside: avoid to prevent content splitting across pages
    - Navigation and buttons hidden when printing
    - Report starts at top of first page (no offset)

### Email & Notifications

- **Service**: domains.co.za SMTP (via nodemailer) in `lib/sendEmail.js`
- **Use cases**: email verification links, password reset, payment receipts
- **SMTP Server**: `mail.pickmypath.co.za` (port 465 for SSL/TLS, 587 for TLS)
- **Setup**: Create sender email (e.g., `noreply@pickmypath.co.za`) in domains.co.za cPanel; wait 2–3 hours for DNS/SSL propagation
- **Config**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` env vars

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

### Questions & Assessment Data

- **File**: `lib/questions.js`
- **Scope**: High School only (Grade 8–12)
- **Frameworks**: Holland RIASEC, Career Values, Aptitude (based on SDS, SII, MBTI, Kuder, CareerDirect)
- **Structure**: 49 questions organized by section:
  - **Section 1 (Interests)**: 15 RIASEC questions (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
  - **Section 2 (Values)**: 7 questions about work preferences and subject interests
  - **Section 3 (Aptitude)**: 15 questions about academic strengths and abilities
  - **Section 4 (Parent Observations)**: 12 questions (filled by parent/guardian)
  - **Section 5 (Marks)**: Academic subject marks input using CAPS-aligned subjects
- **CAPS Subjects**: `CAPS_SUBJECTS` array contains Grade 8–12 subjects aligned with South African curriculum:
  - Languages: English, Afrikaans, isiZulu, isiXhosa, Sesotho, Setswana (Home and First Additional options)
  - Mathematics: Mathematics, Mathematical Literacy
  - Compulsory: Life Orientation
  - Natural Sciences: Biology, Physics
  - Social Sciences: Geography, History
  - Economic and Management Sciences
  - Technology
  - Creative Arts: Visual Arts, Dramatic Arts, Music, Dance
- **Stage filtering**: Each question has a `stages` array specifying which grades can see it (currently all: grade_8, grade_9, grade_10, grade_11, grade_12)
- **Key function**: `getQuestionsForStage(stage)` returns filtered questions/sections based on user's grade
- **Client submission**: POST `/api/assessment/submit` with answer array → API uses `getQuestionsForStage()` to validate answers

### Configuration & Stages

- **File**: `lib/stageConfig.js`
- **Purpose**: Defines user flow stages and eligibility rules (e.g. can't access assessment without payment)
- **Used by**: Frontend to enable/disable UI, API routes to guard access

---

## Environment Variables

See `.env.local.example` for the full list. Key secrets required to run locally:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Anthropic AI**: `ANTHROPIC_API_KEY` and `AI_MODEL`
- **JWT Auth**: `JWT_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- **Admin Credentials**: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (free choice for local testing)
- **Firebase & Google OAuth**:
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID (e.g., `pathfinder-55a19`)
  - `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase web app API key
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — custom domain for auth redirects (e.g., `pickmypath.co.za`)
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth 2.0 Client ID from Google Cloud Console
- **Email**: `SMTP_HOST=mail.pickmypath.co.za`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER` (email address), `SMTP_PASS` (password)
- **Payments**: `NEXT_PUBLIC_PAYFAST_SANDBOX=true` (default; set false to enable live payment processing)

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

### Adding subjects to the marks section
1. Edit `CAPS_SUBJECTS` array in `lib/questions.js`
2. Ensure subjects align with CAPS curriculum for Grade 8–12
3. Test by submitting marks during assessment

### Modifying the report display
1. Edit `pages/report/[id].js` for styling/layout changes
2. Edit `lib/generateReport.js` if changing AI prompt or response structure
3. Use `student_name` from database (not `full_name`) for report headers
4. Wrap content that should not break across pages with `className="print-no-break"`

### Deploying to production
1. Run database migration: Add `student_name` column via Supabase SQL Editor (already in `supabase-schema.sql`)
2. Set all env vars in Vercel project settings (copy from `.env.local`)
3. Ensure `NEXT_PUBLIC_PAYFAST_SANDBOX=false` if live payments enabled
4. Use `claude-sonnet-4-6` for `AI_MODEL` in production (Haiku is for testing)
5. Deploy via Vercel UI (automatic on GitHub push)

---

## Testing Notes

- **No automated test suite** — test manually via `npm run dev` and browser at http://localhost:3000
- **PayFast sandbox** allows full payment flow testing without real transactions
- **Admin panel** accessible with env var credentials on `/admin`

---

## Recent Updates (April 2026)

### Student Name Feature
- **Database**: Added `student_name` column to users table (separate from `full_name`) to support parents registering for their children
- **Registration Flow** (`pages/register.js`): Now asks for both account holder name and student's name
- **Google OAuth** (`components/GoogleSignInButton.js` + `/api/auth/google.js`): After sign-in, prompts for student name if not already set (handles case where parent uses their Google account)
- **New API**: `/api/auth/update-student-name` — saves student name to database
- **Report Display**: Student name appears on report header (from `student_name` field, not account holder's `full_name`)

### CAPS-Aligned Subjects
- **Updated** `CAPS_SUBJECTS` in `lib/questions.js` to include only Grade 8–12 subjects that match South African CAPS curriculum
- **Subjects now include**: Languages (English, Afrikaans, isiZulu, isiXhosa, Sesotho, Setswana), Mathematics, Life Orientation, Natural Sciences (Biology/Physics), Social Sciences (Geography/History), Economic and Management Sciences, Technology, Creative Arts (Visual Arts, Dramatic Arts, Music, Dance)
- **Removed**: Excessive options like Civil Technology, Electrical Technology, Computer Applications Technology, etc.

### Report Improvements
- **Readability**: Added bullet points to key sections (career summary, subject advice, parent note, motivational note) to improve scannability
- **Visual Design**: Enhanced visual hierarchy with highlighted boxes for "Your current position" section and improved borders/spacing
- **Print/PDF Styling**:
  - Fixed text color from light gray to dark gray (#333) for better readability when printed
  - Proper A4 page alignment (0.5in margins)
  - Report starts at top of first page (no offset)
  - Page-break-inside: avoid on content sections to prevent splitting across pages
  - Navigation and buttons hidden when printing

### Database Migration
- **Required**: Run the student_name migration from `supabase-schema.sql` in Supabase SQL Editor before deploying
- **Schema Fix**: Updated all RLS policies to use `if not exists` to make schema file idempotent (safe to run multiple times)

### Files Modified
- `lib/questions.js` — Updated CAPS_SUBJECTS
- `supabase-schema.sql` — Added student_name migration + fixed policies
- `pages/register.js` — Added student name field to form
- `pages/api/auth/register.js` — Accepts and stores student_name
- `pages/api/auth/google.js` — Sets needsStudentName flag
- `pages/api/auth/update-student-name.js` — New endpoint to save student name
- `pages/api/assessment/report.js` — Fetches and returns student name
- `pages/report/[id].js` — Displays student name, added bullet points, improved print styling
- `components/GoogleSignInButton.js` — Added student name prompt modal
- `CLAUDE.md` — Updated documentation

---

## Recent Updates (May 2026)

### Report Presentation Overhaul

Critical improvements to the report display to deliver a professional, customer-facing product.

#### Dependencies Added
- **`react-markdown`** — Render markdown safely (no dangerouslySetInnerHTML) in React components
- **`remark-gfm`** — GitHub Flavored Markdown support, enables pipe tables in markdown output

#### Bug Fixes

**1. Unreadable Header Text**
- **Problem**: Stage context and RIASEC summary paragraphs used `color: '#333'` (dark gray) on navy background — nearly invisible
- **Fix**: Changed to `color: 'rgba(255,255,255,0.88)'` for clear readability
- **Also**: Added a thin gold divider line between sections for visual separation

**2. Markdown Artifacts in Subject Advice**
- **Problem**: AI generates structured markdown (`**bold**`, `*bullets*`, `| tables |`) inside JSON field values, but frontend was rendering raw text
- **Solution**: Created `MarkdownContent` component that wraps ReactMarkdown with `remark-gfm`, replacing all naive `.split('\n').map(<li>)` patterns
- **Result**: Subject comparison tables now render as proper HTML tables; bold text is bold; bullets are proper lists

#### Component & Styling Changes

**New Component**: `MarkdownContent` in `pages/report/[id].js`
- Wraps `ReactMarkdown` with `remark-gfm` plugin
- Applies `.report-md` CSS class for consistent styling
- Accepts `className` prop for additional styling

**Markdown Content Rendering**:
- `rd.academic_observations` — Now renders prose/bullets properly
- `c.summary` (career summaries) — 2-3 sentence paragraphs render as clean prose
- `rd.subject_or_next_steps_advice` — Tables, sub-headings, and bullets render correctly
- `rd.parent_note` — Prose paragraph renders without forced bullets
- `rd.motivational_note` — Warm paragraph renders with proper formatting

**New CSS in `styles/globals.css`** (`.report-md` class):
- Paragraph and list styling with proper spacing
- Professional table styling:
  - Navy headers with white text
  - Alternating row colors for readability
  - Proper padding and borders
- Bold, italic, and heading support
- All styling scoped to `.report-md` to avoid affecting other parts of the app

#### AI Prompt Updates (`lib/generateReport.js`)

- Changed instruction from "no markdown, no preamble" to "no preamble, no text outside JSON — markdown allowed inside field values"
- Enhanced `subject_or_next_steps_advice` field description to explicitly encourage:
  - Bold career names (e.g., `**Rank 1: UX/UI Designer**`)
  - Markdown tables for subject comparisons
  - Bullet points for clarity
- This tells the AI it can structure information clearly without fighting markdown restrictions

#### Files Modified
- `package.json` — Added react-markdown, remark-gfm
- `pages/report/[id].js` — Added MarkdownContent component, fixed header colors, replaced split/map patterns
- `lib/generateReport.js` — Updated AI prompt instructions
- `styles/globals.css` — Added `.report-md` styling for tables, paragraphs, lists, bold/italic
- `CLAUDE.md` — Updated documentation

#### Customer Impact
- Report header is now readable (critical fix)
- Subject advice section displays correctly with formatted tables and text (critical fix)
- All prose sections render cleanly without forced bullet lists
- Overall professional presentation suitable for paying customers
- Print/PDF export maintains visual quality and readability

### Firebase Google OAuth Configuration

**Problem**: Google OAuth redirects were still using Firebase default domain (`pathfinder-55a19.firebaseapp.com`) even after adding custom domains to Firebase's authorized domains list.

**Root Cause**: Firebase's "Authorized domains" is a whitelist for where auth can redirect *to*, but Google's OAuth credentials require explicit redirect URI configuration. These are two separate systems that must both be configured.

**Solution**: Updated documentation and setup checklist in "Google OAuth & Firebase Configuration" section to clarify the distinction and provide step-by-step configuration.

**Configuration Steps**:
1. **Google Cloud Console** → Add redirect URIs for both `www.pickmypath.co.za` and `pickmypath.co.za`
2. **Firebase Console** → Whitelist both domains in Authentication settings
3. **Environment** → Ensure `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is set to custom domain
4. **Test** → Login from actual domain to verify redirect behavior

#### Files Modified
- `CLAUDE.md` — Added Firebase OAuth troubleshooting and configuration details to "Google OAuth & Firebase Configuration" section and "Environment Variables" section

