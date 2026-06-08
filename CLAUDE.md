# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**PickMyPath** is a Next.js-based career guidance platform for South African Grade 9 students. The app combines AI-powered assessment (via Anthropic Claude) with a multi-stage user flow: registration → email verification → payment → 45-question assessment → AI-generated career report.

---

## Development Workflow

**Important**: This project uses **Vercel-only deployment**. There is no local `.env.local` development.

- All code changes are pushed to GitHub
- Vercel automatically builds and deploys on push
- All environment variables are configured in **Vercel project settings** (not local .env files)
- Testing always happens on the **live Vercel deployment** (production parity from the start)

**Local setup** (for code editing only):
```bash
npm install           # Install dependencies (no npm run dev needed)
git push              # Push to GitHub → Vercel auto-deploys
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
  5. In **Vercel project settings**, set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to your custom domain (not Firebase default)
- **Environment variables required** (set in Vercel):
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID
  - `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase API key from web app config
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — custom auth domain for redirects (e.g., `pickmypath.co.za`)
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth client ID from Google Cloud Console
- **Testing**: After updating, test login on the live Vercel deployment to verify redirect works

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
  - **Registration** (`pages/register.js` → `/api/auth/register`): Captures both account holder name and student name separately; **requires explicit acceptance of Terms of Service and Privacy Policy** via checkbox before account creation (enforced on both frontend and API)
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
- **Configuration**: Merchant credentials stored in Vercel environment variables (not in database)
- **Sandbox mode**: When `PAYFAST_SANDBOX=true`, payments auto-complete without hitting PayFast (for testing)
- **Live mode**: When `PAYFAST_SANDBOX=false`, real payments are processed via PayFast
- **ITN Callback**: PayFast sends server-to-server notifications to `/api/payment/verify` with payment status
- **Flow**: 
  1. User initiates payment → `/api/payment/initiate` generates signed PayFast form data
  2. Frontend submits form to PayFast payment page
  3. User completes payment on PayFast
  4. PayFast redirects user back to success URL (`/payment/success?payment_id=X`)
  5. PayFast sends ITN callback to `/api/payment/verify` (server-to-server)
  6. API verifies signature, marks payment completed, creates assessment record
- **Code files**: `pages/api/payment/initiate.js`, `pages/api/payment/verify.js`, `pages/payment.js`
- **Setup**: Add `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_SANDBOX` to Vercel env vars, then configure ITN URL in PayFast dashboard

### Admin Panel & Auditing

- **Status**: Not currently implemented — admin panel UI does not exist in the codebase
- **Note**: PayFast credentials are managed via Vercel environment variables, not an admin panel
- **Future**: If building an admin panel, configure routes in `pages/api/admin/` and protect with `getAdminFromRequest()` from `lib/auth.js`
- **Credentials**: `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in Vercel env vars but currently unused (admin panel not built)

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

**All environment variables are configured in Vercel project settings** (not local .env files). Configure these in **Vercel Dashboard → Settings → Environment Variables**:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Anthropic AI**: `ANTHROPIC_API_KEY` and `AI_MODEL` (claude-sonnet-4-6 for production)
- **JWT Auth**: `JWT_SECRET` (must be a 32-byte hex string)
- **App URL**: `NEXT_PUBLIC_APP_URL` — **CRITICAL: Required for PayFast payment callbacks to work.** Set to the exact domain users access (e.g., `https://www.pickmypath.co.za`). Without this, PayFast ITN callbacks fail silently and payments never complete. Also used for email verification links and password reset URLs.
- **Admin Credentials**: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **Firebase & Google OAuth**:
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID (e.g., `pathfinder-55a19`)
  - `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase web app API key
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — custom auth domain for redirects (e.g., `pickmypath.co.za`)
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth 2.0 Client ID from Google Cloud Console
- **Email**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER` (email address), `SMTP_PASS` (password)
- **Payments (PayFast)**:
  - `PAYFAST_MERCHANT_ID` — Your PayFast merchant ID
  - `PAYFAST_MERCHANT_KEY` — Your PayFast merchant key
  - `PAYFAST_SANDBOX` — Set to `true` for sandbox mode (auto-complete payments, no PayFast redirect), `false` for live transactions

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

### Making changes
1. Edit code locally and push to GitHub
2. Vercel automatically deploys on push
3. Verify changes on the live Vercel deployment
4. To add/update environment variables, go to Vercel project settings → Environment Variables

---

## Deployment & Scaling

### Free Tier Limits

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited serverless function calls
- Unlimited deployments
- **Capacity**: ~5,000 concurrent users/month before bandwidth becomes constraint

**Supabase Free Tier** ⚠️ (More restrictive):
- 500 MB database storage
- 2 GB bandwidth/month
- 50,000 monthly active users (auth)
- 200 concurrent real-time connections
- **Capacity**: ~200–300 completed assessments before hitting storage limit

### Data Usage Estimates

- User record: ~2 KB
- Assessment response (45 questions): ~10–20 KB
- Generated report: ~20–50 KB
- **Per completed assessment cycle**: ~40–70 KB total

### When to Upgrade

**Upgrade Supabase to Pro** ($25/month) when:
- Database storage reaches **400 MB** (monitor on Supabase dashboard)
- This occurs after roughly **200–250 completed assessments**
- Pro tier provides: unlimited storage, 5 GB bandwidth, better performance

**Upgrade Vercel to Pro** ($20/month) when:
- Bandwidth usage approaches 100 GB/month (rare unless extremely high traffic)
- Not needed for initial school rollouts

### Monitoring Checklist

Check these metrics regularly (especially as adoption grows):
1. **Supabase Dashboard** → **Project Settings** → Storage usage (most critical)
2. **Supabase Dashboard** → **Database** → Size indicator
3. **Vercel Dashboard** → **Analytics** → Bandwidth usage
4. **Vercel Dashboard** → **Function** → Error rate and latency

---

## Testing Notes

- **No automated test suite** — test manually on the live Vercel deployment
- **PayFast sandbox** allows full payment flow testing without real transactions (set `PAYFAST_SANDBOX=true` in Vercel env vars)
- **Admin panel** (`/admin`) not yet implemented; PayFast credentials managed via Vercel env vars

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

### Parent Handoff Alert Banner

**Problem**: During the assessment, the parent notification signaling the handoff (parent observations & marks sections) was a small inline badge that was easily missed by students focused on answering questions.

**Solution**: Replaced small badge with a prominent **sticky alert banner** that appears at the top of the page and stays visible while the parent fills in marks/observations.

**Banner Features**:
- **Fixed positioning** — Stays at top of viewport as parent scrolls
- **Gold gradient background** — Eye-catching but on-brand styling
- **Clear messaging** — "👨‍👩‍👧‍👦 Parent / Guardian — It's Your Turn Now" with context about why their input matters
- **Slide-down animation** — Draws attention when section first loads
- **Dynamic padding** — Main content has extra top padding when banner is visible (prevents content from hiding behind banner)

**When Banner Appears**:
- Parent Observations section (questions answered by parent about student)
- Marks section (parent enters student's academic marks)

**Files Modified**:
- `pages/assessment.js` — Replaced inline badge with sticky banner component, added slide-down animation, adjusted content padding for parent sections

---

## Recent Updates (May 2026 — continued)

### Print/PDF Report Fixes

Two critical print layout bugs fixed in `pages/report/[id].js`.

**1. Heading not starting at top of page 1**
- **Root cause**: `div[role="main"]` had `margin: '0 auto'` as an inline style. The print CSS rule `margin: 0` lacked `!important`, so the inline style always won, leaving an unintended top offset.
- **Fix**: Added `!important` to both `margin` and `padding` on `div[role="main"]` in `PRINT_STYLES`.
- **Also fixed**: Added `height: 0 !important; overflow: hidden !important` to the `nav` print rule — a `position: sticky` nav can retain phantom height in some browsers even when `display: none`.
- **Also**: Reduced `@page` top margin from `0.25in` to `0.2in`.

**2. Excessive page breaks on pages 3 & 6**
- **Root cause**: Career cards had `page-break-inside: avoid` on the entire card wrapper. When a card was taller than the remaining page space, the browser pushed the whole card to the next page, leaving a large blank gap. For cards taller than a full page this is also impossible to honour, creating further unpredictable breaks.
- **Fix**: Changed career card wrapper to `page-break-inside: auto` (allow breaks within the card). The card title/header `div:first-child` still has `avoid` so the rank, title, and match % never orphan at the bottom of a page.
- **Also**: Removed `print-no-break` class from the career card JSX wrapper to match.

**Files Modified**:
- `pages/report/[id].js` — Fixed `margin !important`, nav height, @page margin, career card page-break behaviour

---

### Assessment Session Isolation Fix

**Problem**: Assessment progress (`pmp_answers`, `pmp_marks`, `pmp_currentQ`) was saved to localStorage with no user scope. When a new user logged in on the same browser, the old session's question index was restored — causing the assessment to jump straight to the marks screen (end of assessment).

**Fix** (`pages/assessment.js` — `useEffect`):
- On load, compare `pmp_session_uid` in localStorage against the current user's ID.
- If they differ, clear `pmp_answers`, `pmp_marks`, and `pmp_currentQ` before restoring progress.
- Save current user's ID as `pmp_session_uid` for the next check.
- Added range validation: only restore `pmp_currentQ` if `0 ≤ idx ≤ questions.length`.

**Files Modified**:
- `pages/assessment.js` — Added user-scoped session guard to `useEffect`

---

### Go-to-Market Strategy: Psychometrist Partnerships

**Decision**: Begin outreach to professional psychometrists for partnership and market validation.

**Rationale**:
- Psychometrist partnerships provide credibility and professional endorsement — schools trust practitioners, not just tech platforms
- Natural distribution channel — psychometrists have existing relationships with schools and guidance counselors
- Professional review validates assessment quality and AI output alignment with career development best practices
- Market positioning: position PickMyPath as complementary tool (reduces admin burden, improves assessment quality) rather than competitive threat

**Pilot Approach**:
1. Identify and contact 3–5 psychometrists (research their background, school affiliations, published work)
2. Personalized outreach (specific references, small ask — 15 min feedback, not partnership pitch)
3. Secure one school pilot test with interested psychometrist
4. Gather feedback on assessment framework, AI output quality, school integration
5. Iterate based on professional input before broader rollout

**Outreach Email Strategy**:
- Lead with their expertise, not your product
- Specific and personal (reference their work, school, insights)
- Short and respectful of time (no headers, no template feel)
- Tiny ask (feedback, not partnership) — reduces friction
- Demo-first option (let them poke around before committing to a call)

---

### Report Gold Standard Upgrade — May 2026

**Problem**: The report was professional and well-structured, but didn't deliver the "wow factor" that makes parents tell friends. Critical gaps:
- No day-in-the-life descriptions (careers felt abstract)
- No salary/earnings data (parents paying R399 wanted ROI proof)
- No career progression timeline (no answer to "where does this lead?")
- Generic parent guidance (no specific support actions)
- Vague action items

**Solution**: Enhanced the AI prompt and report display with 7 new fields that answer the 4 parent questions: *What will my child DO? What will they EARN? Where does this LEAD? What do WE do NOW?*

#### New AI Report Fields (JSON structure)

**Per-career fields** (added to each of the 3 ranked careers in `top_careers.careers[n]`):
- **`day_in_the_life`** — 2-3 sentences painting a vivid Tuesday: specific activities, tools, environments (e.g., "morning collecting water samples from a township borehole, afternoon running statistical analysis, evening writing reports")
- **`salary_range`** — Object: `{ entry: "R180k–280k/yr", mid: "R380k–550k/yr", senior: "R650k–950k+/yr" }` — displayed as three salary pills in the report
- **`career_progression`** — Timeline string: "Year 1–3: [junior] → Year 4–8: [mid] → Year 9–15: [senior] → 15+: [director]"
- **`exploration_tip`** — One concrete action for THIS WEEK: specific YouTube channel, organisation to contact, person type to shadow, or free course

**Top-level report fields**:
- **`report_headline`** — Punchy one-liner: "A systems thinker who builds things that actually help people" — captures student's unique RIASEC profile
- **`career_choice_rationale`** — 2 sentences explaining why these 3 careers ranked above all others, referencing patterns in the assessment data
- **`parent_action_plan`** — Exactly 3 specific, doable bullets for parents to do in next 30 days (e.g., "Arrange a 2-hour shadow day at [org]", "Discuss [topic] over dinner", "Attend [university open day]")

**Improved existing fields**:
- **`motivational_note`** — Now explicitly must acknowledge ONE specific struggle found in their data (e.g., math confidence gap), reframe it as a strength-in-progress, and end with a sentence that makes them feel genuinely seen
- **`subject_or_next_steps_advice`** — Now ends with 4 numbered ACTION ITEMS (specific, doable steps)

#### Changes to `lib/generateReport.js`
- Updated Claude prompt JSON schema to include all 7 new fields with detailed instructions
- Changed default AI model: `claude-haiku-4-5-20251001` → `claude-sonnet-4-6` (better quality for paid product)
- Increased `max_tokens` from 8000 → 12000 to accommodate richer outputs
- Added examples and specific guidance for each new field to ensure Claude generates vivid, actionable content

#### Changes to `pages/report/[id].js`
- **Header section**: Added `report_headline` (gold italic quote) and `career_choice_rationale` (context) below student name
- **Each career card — new sections added in order**:
  1. **Day in the Life** (📅) — Cream-colored callout box with vivid description
  2. **Salary & Career Progression** (💰) — Three salary pills (Entry/Mid/Senior) in a flex row, followed by italic timeline text
  3. **Exploration Tip** (🔍) — Green-tinted callout box with concrete weekly action
- **Parent section — restructured**:
  - Now renders `parent_action_plan` as bullet list FIRST (with subheader "Action items for the next 30 days")
  - Visual divider line separates action items from prose
  - `parent_note` rendered below as warm supportive prose
  - Title changed to "For your parent / support person"
- **Motivational note section — enhanced**:
  - Larger padding (2rem) and gold left-border accent for prominence
  - Personalized title: "✨ What we see in you, [first name]" (extracts student's first name if available)
  - Larger font (0.95rem) and generous line-height (1.8) for readability
- **Graceful fallback**: All new fields have `&&` conditional guards for backward compatibility with old reports

#### Changes to `styles/globals.css`
- Added `.salary-pill` utility class for the three salary level badges
- Added `.day-in-the-life-box` and `.exploration-tip-box` classes for callout styling
- Enhanced print media queries for new sections (tight 0.75rem font sizes, page-break-inside: avoid to prevent content splitting)

#### Files Modified
- `lib/generateReport.js` — Expanded prompt schema, model upgrade, token increase
- `pages/report/[id].js` — New report sections (day-in-the-life, salary, exploration, parent action plan), enhanced motivational note
- `styles/globals.css` — Utility classes and print overrides for new sections

#### Impact
- **For parents**: Report now answers the 4 critical questions (what, earn, timeline, action) — strong driver for word-of-mouth ("This report told me exactly what to do")
- **For students**: Day-in-the-life makes careers tangible; personalized note makes them feel genuinely understood; exploration tip gives immediate next step
- **For business**: Report justifies R399 price point; positioned as premium, personalized career guidance tool
- **Technical**: No database schema changes needed — all new fields stored in existing `top_careers JSONB` column; fully backward-compatible with old reports

#### No Deployment Changes Required
- All changes are client-side (AI prompt enhancement, report rendering, CSS)
- Vercel `AI_MODEL` environment variable already set in project settings
- On next report generation, AI will include all new fields
- Old reports render gracefully (missing fields don't break the UI)

---

### Legal & Compliance: Comprehensive Disclaimers — May 2026 (continued)

**Problem**: PickMyPath needed clear legal disclaimers to avoid liability risks when approaching schools. The messaging needed to distinguish between "career guidance tool" (what we are) and "professional psychometric assessment" (what we're not), reducing legal exposure while building school trust.

**Solution**: Added comprehensive disclaimers across the platform + two new legal pages (Terms of Service, Privacy Policy). All messaging emphasizes PickMyPath as a *guidance tool for exploration*, not a substitute for professional career counseling.

#### Key Messaging (Consistent Across All Pages)

1. **"Career guidance tool for exploration"** — Not a professional assessment
2. **"AI-generated content"** — Can be inaccurate, outdated, or generic
3. **"Discuss with your school counselor"** — Directs users to qualified professionals
4. **"Not a substitute for professional counseling"** — Removes ambiguity
5. **"Verify information independently"** — Especially salary data and university requirements
6. **"Limited liability"** — PickMyPath not responsible for user decisions based on reports

#### Changes to Existing Pages

**Home Page (`pages/index.js`)**
- Softened expertise claim: Removed "Coming soon: Expert review by a registered psychometrist"
- Replaced with: "Research-backed frameworks...we recommend discussing results with your school counselor or a qualified career advisor"
- Updated footer: Added links to `/terms` and `/privacy`

**Assessment Page (`pages/assessment.js`)**
- Added disclaimer banner on first question: "This is a career guidance assessment, not a professional psychometric evaluation"
- Red alert box (#fff0f0) appears once per session
- Reinforces: "We recommend discussing results with your school counselor"

**Report Page (`pages/report/[id].js`)**
- Added footer disclaimer section before action buttons
- Gray box (#f5f5f5) with three key points:
  1. "AI-powered career guidance tool for exploration only"
  2. "Should not replace consultation with professional counselor/advisor"
  3. "Verify career info and admission requirements directly with institutions"

#### New Pages Created

**Terms of Service (`pages/terms.js`)**
- 9 sections covering:
  1. **Guidance Tool, Not Professional Assessment** — Explicit list of what PickMyPath is NOT
  2. **AI-Generated Content** — Transparent about AI limitations and inaccuracies
  3. **User Responsibility** — Users must verify info before making decisions
  4. **Limitation of Liability** — PickMyPath not liable for user decisions or outcomes
  5. **Data Privacy** — Links to privacy policy
  6. **Payment & Refunds** — Clear refund policy (non-refundable unless technical failure)
  7. **User Conduct** — What users cannot do (false info, hacking, harassment, etc.)
  8. **Changes to Terms** — How updates will be communicated
  9. **Contact & Support** — Email and hours for support requests
- Includes safety box: "By proceeding, you acknowledge you've read these terms"

**Privacy Policy (`pages/privacy.js`)**
- 13 sections covering:
  1. **Overview** — What PickMyPath collects and why
  2. **What Information We Collect** — Account info, assessment data, payment info
  3. **How We Use Your Information** — Service delivery, platform improvement, legal compliance
  4. **Who We Share Data With** — Transparent list (Supabase, Anthropic Claude, PayFast, Vercel, email provider)
  5. **AI and Assessment Data Processing** — Explicit disclosure that Claude API receives responses for report generation
  6. **Data Retention** — How long data is kept, deletion policy
  7. **Security** — HTTPS, password hashing, JWT tokens, no credit card storage
  8. **Your Rights** — Access, rectify, delete, portability, object (GDPR-style)
  9. **Cookies & Tracking** — What we use, what we don't (no Google Analytics)
  10. **Third-Party Links** — Not responsible for external sites
  11. **Children & Minors** — Parental consent required for under-13, designed for Grade 8–12
  12. **Changes to Policy** — How updates communicated
  13. **Contact Us** — Support email and hours
- South African POPIA-compliant messaging
- Transparent about Anthropic's Claude API data handling

#### Files Modified
- `pages/index.js` — Softened expertise claim, added TOS/Privacy links to footer
- `pages/assessment.js` — Added first-question disclaimer banner
- `pages/report/[id].js` — Added footer disclaimer before action buttons
- `pages/terms.js` — NEW, comprehensive Terms of Service
- `pages/privacy.js` — NEW, comprehensive Privacy Policy

#### Legal Compliance Notes

**What This Protects**:
- ✅ Clear legal disclaimer protects against liability claims
- ✅ Honest messaging about AI limitations
- ✅ Transparent about data handling (POPIA-compliant)
- ✅ Limitation of liability clause in ToS reduces exposure
- ✅ Privacy Policy explains Anthropic Claude API usage

**Next Steps Before School Launch**:
1. ⚠️ **Have a South African lawyer review** `pages/terms.js` and `pages/privacy.js` — ensure POPIA and consumer protection compliance
2. Adjust terminology if needed to match your brand
3. Update contact email (currently `support@pickmypath.co.za`) once you have one
4. Test all pages on live deployment
5. Use ToS + Privacy Policy as credibility assets when approaching schools ("We have comprehensive legal disclosures")

#### Impact & Positioning
- **For schools**: Shows professionalism and legal responsibility — reduces adoption friction
- **For parents**: Clear messaging builds trust ("This is honest about what it is")
- **For you**: Reduced legal liability while still delivering a valuable product
- **For students**: Encourages healthy skepticism ("explore, but verify") instead of blind faith

#### No Technical Debt
- All new pages use standard Next.js patterns
- No database schema changes
- No API changes
- Pages are static content (no dynamic data)
- Print/PDF friendly (similar to existing pages)

---

### Registration Terms Acceptance — May 2026 (continued)

**Problem**: Terms of Service and Privacy Policy pages existed, but users registering were not required to explicitly accept them. This created legal exposure — users could later claim they didn't know about terms.

**Solution**: Added a prominent, required checkbox to the registration form that users must check before creating an account. The checkbox links directly to the legal pages and is validated both on the frontend and API.

#### Changes to `pages/register.js`

- Added `termsAccepted` state variable to track checkbox state
- Created prominent checkbox component with:
  - Light gray background box that highlights with navy border when checked
  - Clear wording: "I accept the Terms of Service and Privacy Policy" with clickable links
  - Positioned immediately above the submit button (impossible to miss)
  - Positioned above error messages (so it's seen before any validation errors)
- Updated form submission to validate that checkbox is checked before sending request
- Updated submit button to be **disabled** until checkbox is checked (in addition to other validation)

#### Changes to `pages/api/auth/register.js`

- Added `termsAccepted` parameter validation
- Returns 400 error if `termsAccepted` is not true
- Ensures users cannot bypass the checkbox via direct API calls

#### Files Modified
- `pages/register.js` — Added state, checkbox component, form validation
- `pages/api/auth/register.js` — Added API-side validation

#### Legal Protection
- ✅ Users cannot claim they didn't see terms (checkbox is prominent and required)
- ✅ Checkbox links directly to legal pages (no "hidden at bottom" excuse)
- ✅ Both frontend and API validate acceptance (cannot bypass with direct requests)
- ✅ Clear error message if checkbox is unchecked (guides user to correct action)

#### User Experience
- Checkbox is intuitive and follows standard patterns
- Visual feedback (navy border highlight) when checked
- Not disruptive to the registration flow
- Mobile-friendly (checkbox scales appropriately)

---

### Google OAuth Terms Acceptance & Centralized Pricing — May 2026 (continued)

**Problem 1**: Google OAuth users bypassed the Terms of Service requirement entirely, creating legal exposure. Email-registered users had a required checkbox, but OAuth users could sign in without explicit consent.

**Problem 2**: Assessment price was hardcoded as "R399" in two places in `pages/dashboard.js`, while all other price references used the `NEXT_PUBLIC_ASSESSMENT_PRICE` environment variable.

#### Solution 1: Terms Acceptance for Google OAuth

**Database** (`supabase-schema.sql`):
- Added `terms_accepted` (boolean, default false) column to users table
- Added `terms_accepted_at` (timestamptz) column to record when terms were accepted
- Backfilled existing users with `terms_accepted = true` (they were already using the service)

**API Changes**:
- **`pages/api/auth/register.js`** — Now saves `terms_accepted: true` and `terms_accepted_at: now()` when email users register (previously validated but didn't save to DB)
- **`pages/api/auth/google.js`** — Added `needsTermsAccepted: !user.terms_accepted` flag to response (tells frontend if user needs to accept terms)
- **`pages/api/auth/accept-terms.js`** — NEW endpoint: `POST { }` (authenticated users only) → updates user with `terms_accepted = true, terms_accepted_at = now()`

**Frontend** (`components/GoogleSignInButton.js`):
- Added third modal in the Google OAuth flow: stage → student name → **terms acceptance** → dashboard
- Modal shows checkbox linking to `/terms` and `/privacy` pages
- Submit button disabled until checkbox is checked
- Calls `/api/auth/accept-terms` on submit, then redirects to dashboard
- Falls back gracefully: if API call fails, user still proceeds to dashboard (terms can be set later, but flag remains in DB)
- Updated all modal transitions to check `needsTermsAccepted` flag at each step

**User Flow** (new users via Google):
1. Sign in with Google
2. See stage selector modal → submit
3. See student name modal → submit
4. See terms acceptance modal (new) → check box → submit
5. Redirect to dashboard

**User Flow** (existing users, returning):
- If `terms_accepted = true`: go straight to dashboard (no modal)
- If `terms_accepted = false`: show terms modal before dashboard access

**Database Record**:
- ✅ Every user has `terms_accepted` boolean + timestamp
- ✅ Legal compliance: can prove when each user accepted terms
- ✅ Backcompat: existing users auto-marked as having accepted

#### Solution 2: Centralized Assessment Price

**Problem**: Dashboard had hardcoded R399 in:
1. Retake assessment confirmation dialog (line ~42)
2. Payment CTA button text (line ~126)

Other pages already used `process.env.NEXT_PUBLIC_ASSESSMENT_PRICE`:
- `pages/index.js` ✓
- `pages/payment.js` ✓
- `pages/api/payment/initiate.js` (reads from database config, falls back to env var) ✓

**Fix** (`pages/dashboard.js`):
- Added at component top: `const price = process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399'`
- Replaced both hardcoded R399 strings with dynamic `R${price}`

**Benefit**: Future price changes (e.g., R499) require only updating Vercel env var or system_config in admin panel — no code changes needed.

#### Files Modified
- `supabase-schema.sql` — Added terms_accepted migration + backfill
- `pages/api/auth/register.js` — Saves terms_accepted for email users
- `pages/api/auth/google.js` — Returns needsTermsAccepted flag
- `pages/api/auth/accept-terms.js` — NEW: saves terms acceptance
- `components/GoogleSignInButton.js` — Added terms acceptance modal + logic
- `pages/dashboard.js` — Centralized price via env var

#### Database Migration Required
Before deploying, run in Supabase SQL Editor:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
UPDATE users SET terms_accepted = true WHERE terms_accepted = false;
```

#### Verification
1. **New Google user**: Goes through all 3 modals (stage → name → terms) → terms_accepted = true in DB
2. **Email user**: Checkbox still required → terms_accepted = true in DB
3. **Returning user (no modal)**: Goes straight to dashboard if already accepted
4. **Dashboard price**: CTA shows dynamic price, matches Vercel env var setting
5. **Graceful fallback**: If terms API fails, user still proceeds (won't block access)

---

### Dashboard & Legal Page Fixes — May 2026 (final)

**Problem 1**: Dashboard "Want a fresh perspective?" button still showed hardcoded "R399 + VAT" instead of using the centralized `NEXT_PUBLIC_ASSESSMENT_PRICE` environment variable.

**Problem 2**: When users clicked Terms of Service or Privacy Policy links from the registration form, clicking "Back" on those pages returned them to the home page instead of back to the registration form — forcing them to re-enter all their details if they wanted to continue registering.

#### Solution 1: Complete Price Centralization

**Fix** (`pages/dashboard.js`):
- Line 181: Changed button text from `"Retake for R399 + VAT"` to `"Retake for R${price} + VAT"`
- The `price` variable was already defined at component top (line 9): `const price = process.env.NEXT_PUBLIC_ASSESSMENT_PRICE || '399'`
- All three price displays now use the same dynamic variable:
  1. Retake confirmation dialog (line 43)
  2. Payment CTA button (line 127)
  3. Retake card button (line 181)

#### Solution 2: Smart Registration → Legal Page Navigation

**Problem**: Links to Terms/Privacy from registration page went to `/terms` and `/privacy` with no way to return to the form.

**Solution**: Use `returnTo` query parameter to remember where user came from.

**Changes**:
- **`pages/register.js`** — Updated links to include `?returnTo=/register`:
  - `/terms?returnTo=/register` (was `/terms`)
  - `/privacy?returnTo=/register` (was `/privacy`)
- **`pages/terms.js`** — Smart back button:
  - Added `useRouter()` hook to read `returnTo` query param
  - Back link now uses `returnTo` query param, defaults to `/` if not provided
  - Button text changed from "← Back to Home" to "← Back" (more generic)
- **`pages/privacy.js`** — Same logic as Terms page

**User Flow**:
- **From registration**: User clicks Terms/Privacy → form data stays in localStorage → user reads page → clicks "Back" → returns to registration form ✓
- **From home page**: User clicks Terms/Privacy link in footer → clicks "Back" → returns to home ✓
- **Direct URL**: User visits `/terms` or `/privacy` directly → clicks "Back" → goes to home ✓

#### Files Modified
- `pages/dashboard.js` — Fixed hardcoded price in "Retake for R399 + VAT" button text
- `pages/register.js` — Added `?returnTo=/register` to Terms and Privacy links
- `pages/terms.js` — Added returnTo query param handling with smart back button
- `pages/privacy.js` — Added returnTo query param handling with smart back button

#### Impact
- ✅ All prices now centralized — future changes only need Vercel env var update
- ✅ Users won't lose their registration progress when reading legal docs
- ✅ Improved user experience and reduced frustration
- ✅ More graceful navigation across the site

---

### PayFast Payment Integration — May 2026 (final)

**Problem**: Yoco payment gateway was unable to accept new online merchant customers due to system upgrades. Required replacement with alternative payment processor.

**Solution**: Replaced Yoco with PayFast (South African payment processor). All configuration via Vercel environment variables (no admin panel required).

#### Payment Flow

1. **Initiation** (`pages/api/payment/initiate.js`):
   - Creates payment record in database
   - Sandbox mode: Auto-completes payment, redirects to assessment
   - Live mode: Generates signed PayFast form with MD5 signature, returns form data

2. **Payment Form Submission** (`pages/payment.js`):
   - Frontend creates hidden form with PayFast data
   - Auto-submits to PayFast payment page
   - User enters card details on PayFast

3. **PayFast Callback** (`pages/api/payment/verify.js`):
   - PayFast sends ITN (Instant Transaction Notification) POST callback
   - API verifies MD5 signature to ensure legitimacy
   - Marks payment as completed in database
   - Creates assessment record for user

#### Setup Checklist

1. **Add Vercel environment variables**:
   - `PAYFAST_MERCHANT_ID` — Your PayFast merchant ID
   - `PAYFAST_MERCHANT_KEY` — Your PayFast merchant key
   - `PAYFAST_SANDBOX` — `true` for testing, `false` for live

2. **Configure PayFast dashboard**:
   - Log into PayFast account
   - Go to **Settings** → **Integration** → **ITN Status** (Instant Transaction Notification)
   - Set notification URL to: `https://pickmypath.co.za/api/payment/verify`
   - Enable and save

3. **Test sandbox mode**:
   - Leave `PAYFAST_SANDBOX=true` in Vercel
   - Go to payment page, click "Pay"
   - Should redirect to PayFast **sandbox** (test environment)
   - Use test card credentials to complete payment
   - Verify payment marked as completed in database

4. **Go live**:
   - Change `PAYFAST_SANDBOX=false` in Vercel
   - Real card payments now processed
   - Test with real payment before promoting to users

#### Security Features

- **MD5 Signature Verification**: Both initiation and callback verify data integrity via signed hashes
- **Merchant ID Validation**: Callback validates merchant ID matches configured value
- **No Card Storage**: Credit cards handled entirely by PayFast, never touched by our server
- **HTTPS Only**: All payment data encrypted in transit

#### Code Changes

**Files Modified**:
- `pages/api/payment/initiate.js` — Switched from Yoco API to PayFast form-based integration
- `pages/api/payment/verify.js` — Replaced Yoco webhook handler with PayFast ITN verification
- `pages/payment.js` — Changed redirect logic to form submission (PayFast requirement)
- `CLAUDE.md` — Updated documentation with PayFast details

**Removed Code**:
- Yoco API integration (all references to Yoco API endpoints)
- Yoco secret key configuration
- Yoco-specific parsing logic

#### Testing & Verification

- **Sandbox testing**: Payments auto-complete without hitting PayFast when `PAYFAST_SANDBOX=true`
- **Live testing**: Can test real payments with PayFast sandbox before going live
- **ITN verification**: Callback signature validation prevents spoofed payment notifications
- **Database audit**: All payment transactions logged to `audit_log` table

#### No Technical Debt

- Vercel environment variables used instead of building admin panel (simpler, maintains current architecture)
- Payment code follows existing API patterns
- No database schema changes required
- Fully backward-compatible — old reports and assessments unaffected

---

### PayFast Signature Bug Fixes — May 29, 2026

**Problem**: During initial live testing, PayFast was rejecting payments with error: "Generated signature does not match submitted signature."

**Root Cause**: **Inverted sandbox logic** (`pages/api/payment/initiate.js`, line 25):
- Code was: `const sandbox = process.env.PAYFAST_SANDBOX !== 'true'`
- Meant: If `PAYFAST_SANDBOX=true`, the code treated it as `false` and forced live mode
- This caused the code to attempt PayFast live integration when testing with sandbox mode

**Solution**: Changed line 25 to: `const sandbox = process.env.PAYFAST_SANDBOX === 'true'`

**Files Modified**:
- `pages/api/payment/initiate.js` — Fixed sandbox logic

---

### PayFast Merchant Key Fix — May 29, 2026 (continued)

**Problem**: After fixing sandbox logic, new error appeared: "400 Bad Request - The merchant key field is required."

**Root Cause**: Previous documentation incorrectly stated that `merchant_key` should be removed from `paymentData`. However, PayFast's API **requires** the merchant_key to be included in the request data (it's not just for signature generation — it must be transmitted to PayFast).

**Solution**: 
- **Line 57**: Added `merchant_key: merchantKey` back to `paymentData` object
- The signature generation already uses merchant_key (line 10); it also needs to be in the request

**Corrected Code** (`pages/api/payment/initiate.js`):
```javascript
const paymentData = {
  merchant_id: merchantId,
  merchant_key: merchantKey,  // ← Required by PayFast API
  return_url: ...,
  ...
}
paymentData.signature = generatePayFastSignature(paymentData, merchantKey)
```

**Files Modified**:
- `pages/api/payment/initiate.js` — Added merchant_key to paymentData

**Verification**:
- Push changes to GitHub → Vercel redeploys
- Try another payment — should no longer get "merchant key field is required" error
- User will be redirected to PayFast payment page

---

### Support Email Footer & Legal Page Contact — May 2026 (final)

**Problem**: Footer had a non-functional "Admin" link that pointed to `/admin` (admin panel never implemented). Users had no obvious way to contact support.

**Solution**: Replaced Admin link with direct support email contact. Added prominent support contact callout boxes to Terms and Privacy pages for easy discovery.

#### Changes to `pages/index.js`

- **Footer**: Replaced `<Link href="/admin">Admin</Link>` with `<a href="mailto:support@pickmypath.co.za">Support</a>`
- Email now styled consistently with other footer links (rgba(255,255,255,0.5))
- Users can click directly to open their email client and contact support

#### Changes to `pages/terms.js`

- **Added support callout box** immediately after "Last updated" section
- Gold-bordered (#fef8f0 cream background) box with heading: "❓ Questions about these terms?"
- Shows email and hours: `support@pickmypath.co.za` (Monday–Friday, 9am–5pm SAST)
- Clickable mailto link (color: #0f1f3d, fontWeight: 500)
- Complements existing "Contact & Support" section (section 9) at bottom of page

#### Changes to `pages/privacy.js`

- **Added support callout box** immediately after "Last updated" section
- Identical styling to Terms page for consistency
- Heading: "❓ Questions about your privacy?"
- Same email/hours contact info and styling
- Complements existing "Contact Us" section (section 13) at bottom of page

#### Files Modified
- `pages/index.js` — Replaced Admin link with mailto support email in footer
- `pages/terms.js` — Added prominent support contact callout box at top
- `pages/privacy.js` — Added prominent support contact callout box at top

#### User Experience Impact
- ✅ Footer no longer has dead Admin link
- ✅ Support email is prominently displayed (3 locations: footer, Terms callout, Privacy callout)
- ✅ Users can immediately email support without searching for contact info
- ✅ Legal pages show support contact upfront before users read lengthy content
- ✅ Callout boxes use eye-catching gold borders so users see contact info instantly

#### Notes
- Admin panel (`/admin`, `pages/admin/`) and admin environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) remain in codebase but unused
- If admin panel is built in future, the `/admin` route can be restored
- Support email is customer-facing; currently monitored at `calvin.du.randt@gmail.com`

---

### Marketing Flyers — May 2026 (final)

**Purpose**: Print-ready flyers for school distribution, bulletin boards, and parent handouts to drive awareness and direct students to `pickmypath.co.za`.

#### Flyer Versions

**A6 Flyer v4** (`a6-flyer-v4.html`)
- **Size**: A6 (105mm × 148mm) — pocket-sized postcard
- **Use cases**: Hand-outs during school visits, inclusion in parent packs, fridge magnets
- **Layout**: 3-section design (What You Get, Based On, For You) with navy/gold branding
- **Content highlights**:
  - Personalized career report with top 3 matches
  - Day-in-the-life descriptions of careers
  - Salary ranges & career progression paths
  - Actionable next steps for exploration
  - Holland RIASEC framework
  - Value proposition: confidence, clarity, real guidance
- **CTA**: "READY TO DISCOVER YOUR PATH?" + website (`pickmypath.co.za`)
- **Branding**: Gold accent bar top, consistent with website theme (#0f1f3d navy, #d4af37 gold)

**A5 Flyer v5** (`a5-flyer-v5.html`)
- **Size**: A5 (148mm × 210mm) — half-letter, larger format
- **Use cases**: Wall posters in school corridors, staff room notices, community centers
- **Layout**: Identical to v4 but scaled up for better readability at distance
- **Advantages**: Larger typography, more prominent branding, better visibility from across a room

#### Branding & Design

- **Color scheme**: Navy gradient (#0f1f3d → #1a2a4d) with gold accents (#d4af37)
- **Typography**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **Logo**: PickMyPath brand name in gold (no separate logo image required)
- **Visual hierarchy**: 
  - Gold section titles (capitalized, 11px)
  - White body text (12px) with gold bullet points
  - Gold website URL in bottom box
- **Accessibility**: High contrast (white/gold on navy), readable when printed in black & white

#### How to Print

1. **Open in browser**: Double-click `a6-flyer-v4.html` or `a5-flyer-v5.html` to open in default browser
2. **Print settings**:
   - Paper size: A6 (105mm × 148mm) or A5 (148mm × 210mm) respectively
   - Orientation: Portrait
   - Margins: None (or 0mm)
   - Scale: 100% (no scaling)
3. **Batch printing**: 
   - A6: Can print 4 per A4 page (arrange 2×2)
   - A5: Prints 2 per A4 page (arrange 1×2)
4. **Export to PDF**: Use browser's print dialog → "Save as PDF" for digital archiving

#### Integration with School Outreach

- **Before approaching schools**: Print sample flyers to include in initial proposal package
- **During school visits**: Hand out A6 postcards to students during assemblies or guidance sessions
- **For staff**: Provide A5 posters for staff rooms and notice boards
- **For parents**: Include A6 flyers in school newsletters or parent communication packs
- **Follow-up**: Posters (A5) in school corridors, flyers in library or guidance office

#### Content & Messaging Strategy

**"What You Get"** — Emphasizes tangible outcomes (not generic benefits):
- Personalized report (not generic assessment)
- Day-in-the-life descriptions (makes careers tangible for students)
- Salary ranges & progression (answers parent question: "Will it pay?")
- Actionable next steps (moves from awareness to action)

**"Based On"** — Builds credibility through methodology:
- 45-question assessment (substantive, not a quick quiz)
- Holland RIASEC framework (established, professional approach)
- Personalized analysis (not template-based)

**"For You"** — Value proposition from student perspective:
- Confidence in career direction (reduces anxiety, increases commitment)
- Clarity on subject choices (immediate practical benefit)
- Real guidance (not generic advice — differentiates from free online tools)

**Website CTA**: No price on flyers; directs to website where full details and pricing are visible. Reduces friction for initial engagement.

#### Files
- `a6-flyer-v4.html` — A6 pocket-sized flyer
- `a5-flyer-v5.html` — A5 larger poster flyer

#### No Code Changes Required
- Flyers are static HTML/CSS, not integrated into Next.js app
- Entirely separate from website codebase
- Can be updated independently by editing HTML files
- Print-friendly CSS ensures quality output

---

### PayFast Signature Hash Bug Fix — May 29, 2026 (continued)

**Problem**: After merchant_key was added to paymentData and the sandbox logic was fixed, payments still failed with "400 Bad Request - generated signature does not match submitted signature."

**Root Cause**: The signature hash was incorrectly including `merchant_key` in the string that gets hashed. PayFast's signature verification excludes `merchant_key` from the calculation (it's only appended at the end of the string to hash, not included as a field). When PayFast recalculated the signature on their side, it didn't match because the code was hashing different data.

**Solution**: Updated the `generatePayFastSignature()` function in `pages/api/payment/initiate.js` to exclude both `merchant_key` and `signature` fields from the hash calculation, matching PayFast's expected behavior.

**Changed Code** (`pages/api/payment/initiate.js`, lines 4–11):
```javascript
function generatePayFastSignature(data, merchantKey) {
  const str = Object.entries(data)
    .filter(([k, v]) => k !== 'merchant_key' && k !== 'signature' && v !== null && v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return crypto.createHash('md5').update(str + merchantKey).digest('hex')
}
```

**Key Change**: Added `k !== 'merchant_key' &&` to the filter to exclude merchant_key from the hash string.

**Files Modified**:
- `pages/api/payment/initiate.js` — Fixed signature generation to exclude merchant_key

**Verification**:
- Push changes to GitHub → Vercel redeploys
- Try another payment — should redirect to PayFast payment page without signature error
- Payment should complete successfully

---

### PayFast Signature Algorithm Rewrite — May 29, 2026 (final)

**Problem**: Payments continued to fail with "400 Bad Request - generated signature does not match submitted signature" even after all previous fixes.

**Root Cause**: Three fundamental bugs were identified in the signature generation:

1. **`merchant_key` excluded from hash (wrong)** — PayFast includes ALL POST fields except `signature` itself in the hash calculation. The code was incorrectly filtering out `merchant_key`.

2. **Passphrase handled incorrectly** — PayFast uses a separate account-level passphrase (set in PayFast merchant account → Settings → Integration) that is appended to the hash string as `&passphrase=VALUE`. The code was appending the `merchant_key` directly instead, which is a completely different value.

3. **URL encoding mismatch** — PayFast's backend uses PHP's `urlencode()` which encodes spaces as `+`. JavaScript's `encodeURIComponent` encodes spaces as `%20`. Fields like `item_name` and `item_description` contain spaces, causing hash mismatches.

**Solution**: Complete rewrite of `generatePayFastSignature()`:

```javascript
function generatePayFastSignature(data, passphrase = null) {
  const str = Object.entries(data)
    .filter(([k, v]) => k !== 'signature' && v !== null && v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
    .join('&')
  const hashStr = passphrase ? `${str}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : str
  return crypto.createHash('md5').update(hashStr).digest('hex')
}
```

And the call site updated to use a separate passphrase env var:
```javascript
const passphrase = process.env.PAYFAST_PASSPHRASE || null
paymentData.signature = generatePayFastSignature(paymentData, passphrase)
```

**New Environment Variable Required**:
- `PAYFAST_PASSPHRASE` — Set in Vercel to match the passphrase configured in PayFast merchant account (Settings → Integration → Passphrase). If no passphrase is set in PayFast, leave this env var empty or omit it entirely.

**Environment Variables Summary (complete list)**:
- `PAYFAST_MERCHANT_ID` — Merchant ID from PayFast account
- `PAYFAST_MERCHANT_KEY` — Merchant key from PayFast account
- `PAYFAST_PASSPHRASE` — Account passphrase from PayFast Settings → Integration (optional, but must match exactly if set)
- `PAYFAST_SANDBOX` — `true` for auto-complete sandbox mode, `false` for live payments

**Files Modified**:
- `pages/api/payment/initiate.js` — Rewrote signature function (include merchant_key in hash, fix passphrase handling, fix URL encoding)

---

### Payment Page: Conditional Sandbox Banner — May 29, 2026

**Problem**: The "🧪 Testing mode: PayFast sandbox is active" banner was hardcoded on the payment page and always visible — even in live mode, where it would confuse paying customers.

**Solution**: Made the banner conditional on `isSandbox` state, which is only set to `true` after the payment initiation API responds with `data.sandbox === true`. With `PAYFAST_SANDBOX=false`, the banner never renders.

**Changes** (`pages/payment.js`):
- Added `isSandbox` state (default `false`)
- Set `isSandbox(true)` only when API returns `data.sandbox` flag
- Wrapped banner in `{isSandbox && (...)}` conditional

**Files Modified**:
- `pages/payment.js` — Made sandbox testing banner conditional on API response

---

### Critical Fix: Missing NEXT_PUBLIC_APP_URL Environment Variable — June 1, 2026

**Problem**: PayFast ITN (Instant Transaction Notification) callbacks were failing silently. After a user completed payment on PayFast, they were redirected back to the site with a "Payment not yet confirmed" message. The payment record was created but never marked as completed, blocking access to the assessment.

**Root Cause**: The `NEXT_PUBLIC_APP_URL` environment variable was not set in Vercel. In `pages/api/payment/initiate.js` line 32:
```javascript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.co.za'
```

Without the env var, the fallback default `'https://yourdomain.co.za'` was being used. This caused the ITN callback URL to be sent to PayFast as `https://yourdomain.co.za/api/payment/verify` — a non-existent domain. PayFast tried to POST the payment confirmation to that domain, failed, and gave up silently.

**Solution**: Add `NEXT_PUBLIC_APP_URL` to Vercel environment variables:
1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://www.pickmypath.co.za` (must match the exact domain users access)
   - **Environment**: Production (or all environments if desired)
3. Save and redeploy

**Why This Matters**:
- The ITN callback URL must be reachable by PayFast's servers
- The domain must match exactly what the user accesses (if they use `www.pickmypath.co.za`, the callback URL must also use `www`, not just `pickmypath.co.za`)
- Without this, all PayFast callbacks fail silently and payments never complete

**Verification**:
1. After setting the env var and redeploying, initiate a new payment
2. Complete payment on PayFast
3. You should be redirected back and see "Payment successful" immediately (or after a few seconds as the ITN callback processes)
4. Check Supabase `audit_log` table for "PayFast payment completed" entry
5. Check `payments` table to confirm `status = 'completed'` and `payfast_payment_id` is set (not NULL)
6. User should now have access to the assessment

**Files Modified**: None (configuration only — environment variable in Vercel)

**Related Files**:
- `pages/api/payment/initiate.js` — Uses `NEXT_PUBLIC_APP_URL` to construct the notify_url sent to PayFast
- `pages/payment.js` — Frontend payment page that redirects to PayFast

---

### PayFast ITN Signature Verification Bug Fix — June 1, 2026

**Problem**: Even after setting `NEXT_PUBLIC_APP_URL` and deploying, payments received by PayFast still never completed in the database. The ITN callback was reaching the server but the payment remained `pending`.

**Root Cause**: Two bugs in `verifyPayFastSignature()` inside `pages/api/payment/verify.js` caused every incoming ITN to fail signature validation silently:

1. **Wrong URL encoding** — The function used `encodeURIComponent(v)` which encodes spaces as `%20`. PayFast's backend uses PHP's `urlencode()` which encodes spaces as `+`. Fields like `item_name` ("PickMyPath Career Assessment") contain spaces, so the computed hash never matched PayFast's hash.

2. **Wrong passphrase handling** — The function appended `merchantKey` directly to the hash string (`str + merchantKey`). PayFast's algorithm appends a separate account-level passphrase as `&passphrase=VALUE` (from `PAYFAST_PASSPHRASE` env var). Using the wrong value produced a completely different hash.

Because signature verification failed, the function returned a 200 (required by PayFast) but never updated the payment status — silently keeping every payment as `pending`.

**Solution**: Rewrote `verifyPayFastSignature()` to match the same algorithm used by `generatePayFastSignature()` in `initiate.js` and by PayFast's own backend:

```javascript
function verifyPayFastSignature(data, signature) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || null
  const str = Object.entries(data)
    .filter(([k, v]) => k !== 'signature' && v !== null && v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
    .join('&')
  const hashStr = passphrase ? `${str}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : str
  const expectedSignature = crypto.createHash('md5').update(hashStr).digest('hex')
  return signature === expectedSignature
}
```

Also removed the now-unused `merchantKey` argument from the call site.

**Files Modified**:
- `pages/api/payment/verify.js` — Fixed `verifyPayFastSignature()`: PHP-compatible encoding (`%20` → `+`), passphrase from `PAYFAST_PASSPHRASE` env var, removed merchantKey argument

**Recovering stuck payments**: Any payments that were received by PayFast but stayed `pending` due to this bug must be manually completed in Supabase SQL Editor:
```sql
UPDATE payments SET status = 'completed', paid_at = now(), payfast_payment_id = 'MANUAL-FIX-01'
WHERE status = 'pending' AND user_id = '<user-id>';

INSERT INTO assessments (user_id, payment_id, status)
SELECT user_id, id, 'not_started' FROM payments
WHERE user_id = '<user-id>' AND status = 'completed'
AND NOT EXISTS (SELECT 1 FROM assessments WHERE payment_id = payments.id);
```

**Verification**:
1. Push fix to GitHub → Vercel redeploys
2. Initiate a new payment and complete it on PayFast
3. Check Supabase `audit_log` for "PayFast payment completed" entry
4. Check `payments` table: `status = 'completed'` and `payfast_payment_id` populated with real PF payment ID

---

### PayFast ITN Diagnostic Logging & Success Page Retry — June 1, 2026

**Problem**: After the ITN signature fix was deployed, a live payment still showed "Payment not yet confirmed" on the success page. Vercel logs confirmed the ITN POST (PayFast server-to-server) arrived and returned 200, but the database was not updated — meaning signature verification was silently failing again.

**Log Pattern to Recognise**:
```
POST 200  /api/payment/initiate   ← user initiates
POST 200  /api/payment/verify     ← PayFast ITN callback (server-to-server)
GET  200  /api/payment/verify     ← success page JS checking DB status
```
The GET is NOT a PayFast request — it comes from the browser on `/payment/success?payment_id=X`. It is correct and expected. If it returns `verified: false`, the ITN POST did not update the database.

#### Fix 1 — Diagnostic Logging in ITN Handler (`pages/api/payment/verify.js`)

When signature verification fails, the audit_log entry now includes:
- `received=<hash>` — the signature PayFast sent
- `computed=<hash>` — the hash our code calculated
- `passphrase_set=true/false` — whether `PAYFAST_PASSPHRASE` env var is configured
- `fields=<list>` — which fields were present in the ITN body

**How to diagnose**: After a failed payment, query Supabase audit_log:
```sql
SELECT * FROM audit_log WHERE action = 'PayFast ITN signature verification failed' ORDER BY created_at DESC LIMIT 5;
```
- If `received` ≠ `computed` and `passphrase_set=false` but PayFast has a passphrase configured → set `PAYFAST_PASSPHRASE` in Vercel
- If fields look wrong or truncated → body parsing issue

#### Fix 2 — Retry Polling on Success Page (`pages/payment/success.js`)

**Problem**: PayFast sometimes redirects the user back to the site milliseconds before the ITN arrives. The success page checked once, found `pending`, and immediately showed "Payment not yet confirmed".

**Solution**: Replaced single fetch with a retry loop — up to 6 attempts, 3 seconds apart (18 seconds total). Shows "Verifying your payment..." while retrying. Only shows the "not confirmed" error after all retries are exhausted.

**User experience**: If ITN arrives within 18 seconds (normal), user sees "Payment confirmed!" automatically without needing to refresh.

#### Files Modified
- `pages/api/payment/verify.js` — Added detailed audit_log entry on signature mismatch (received vs computed hash, passphrase_set flag, field list)
- `pages/payment/success.js` — Replaced single-shot fetch with retry loop (6 × 3s = 18s window)

#### Key Debugging Reference

| Symptom | Likely cause | Fix |
|---|---|---|
| audit_log: `passphrase_set=false`, received ≠ computed | `PAYFAST_PASSPHRASE` not set in Vercel | Add env var matching PayFast merchant account passphrase |
| audit_log: `passphrase_set=true`, received ≠ computed | Passphrase value mismatch | Verify exact passphrase in PayFast → Settings → Integration |
| No audit_log entry at all for failed payment | ITN never reached the server | Check PayFast ITN URL setting; check `NEXT_PUBLIC_APP_URL` in Vercel |
| audit_log shows "PayFast payment completed" but user can't access assessment | Assessment row not created | Run manual SQL fix (see previous section) |

---

### PayFast ITN: Missing Passphrase & 304 Caching Bug — June 1, 2026

**Problem**: Live payments completed on PayFast but database stayed `pending`. Success page showed "Payment not yet confirmed" and retried 6 times before giving up.

**Root Cause 1 — Missing `PAYFAST_PASSPHRASE`**:
- Audit log showed `passphrase_set=false` with signature mismatch: `received` ≠ `computed`
- PayFast signs its ITN callbacks using the account passphrase (set in PayFast merchant account → Settings → Integration)
- `PAYFAST_PASSPHRASE` was not set in Vercel, so our ITN handler computed the hash without the passphrase while PayFast's hash included it — always a mismatch
- **Fix**: Add `PAYFAST_PASSPHRASE` environment variable to Vercel matching the exact passphrase in PayFast merchant account settings

**Root Cause 2 — 304 Caching on GET `/api/payment/verify`**:
- The success page retry loop polls `GET /api/payment/verify?payment_id=X` up to 6 times
- The GET handler returned no `Cache-Control` header, so Next.js auto-added an `ETag`
- The browser sent conditional requests (`If-None-Match`), got `304 Not Modified`, and used the cached `{verified: false}` response for every retry
- Even if the ITN had updated the DB, the success page would never see it
- **Fix**: Added `res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')` to the GET handler, and `cache: 'no-store'` to the `fetch()` call in the success page

#### How to Diagnose Future Signature Failures

Query audit_log immediately after a failed payment:
```sql
SELECT action, details, created_at
FROM audit_log
WHERE created_at > now() - interval '2 hours'
ORDER BY created_at DESC LIMIT 20;
```
- `passphrase_set=false` → `PAYFAST_PASSPHRASE` missing from Vercel env vars
- `passphrase_set=true`, still mismatch → passphrase value doesn't match PayFast account exactly (check for extra whitespace)
- No ITN entry at all → ITN never reached server (check `NEXT_PUBLIC_APP_URL` and PayFast ITN URL config)

#### Files Modified
- `pages/api/payment/verify.js` — Added `Cache-Control: no-store` header to GET handler
- `pages/payment/success.js` — Added `cache: 'no-store'` to fetch() call

#### Environment Variable Required
- `PAYFAST_PASSPHRASE` — Copy exact value from PayFast merchant account → Settings → Integration → Passphrase field. If PayFast has no passphrase set, omit this env var entirely (leave blank = no passphrase in hash).

---

### PayFast Signature Field Order Bug — RESOLVED June 2, 2026

**Status**: RESOLVED

**Problem**: Persistent "400 Bad Request - Generated signature does not match submitted signature" on every live payment attempt. All previous fixes (merchant_key inclusion/exclusion, URL encoding variations, passphrase handling) failed because the underlying cause was never identified.

**Root Cause — Field ordering**: The PayFast integration documentation (page 6) explicitly states:

> *"Variable order: The pairs must be listed in the order in which they appear in the attributes description."*
> *"Do not use the API signature format, which uses alphabetical ordering!"*

Both `initiate.js` and `verify.js` had `.sort(([a], [b]) => a.localeCompare(b))` — **alphabetical ordering**. This is exactly what PayFast forbids for form-based payments. Every single previous fix attempt failed because the field order was always wrong, regardless of what else was changed.

The PHP reference implementation in the official docs simply iterates the data object in insertion order (no sort). Our `paymentData` object was already defined in the correct documented order (merchant details → customer details → transaction details), so only the sort needed to be removed.

**Secondary fixes applied at the same time**:
1. **Removed `merchant_key` exclusion** — `merchant_key` must be included in the hash (the PHP reference iterates all fields)
2. **URL encoding** — `encodeURIComponent(String(v).trim()).replace(/%20/g, '+')` to match PHP's `urlencode()` (spaces as `+`)
3. **Passphrase URL encoding** — passphrase now also encoded the same way before appending

**Correct field order in `paymentData`** (must match this exactly):
1. merchant_id
2. merchant_key
3. return_url
4. cancel_url
5. notify_url
6. name_first
7. name_last
8. email_address
9. m_payment_id
10. amount
11. item_name
12. item_description
13. custom_str1

**Final signature function** (`pages/api/payment/initiate.js`):
```javascript
function generatePayFastSignature(data, passphrase = null) {
  // PayFast requires fields in INSERTION ORDER — alphabetical ordering causes signature mismatch
  // See PayFast docs: "Do not use the API signature format, which uses alphabetical ordering!"
  const str = Object.entries(data)
    .filter(([k, v]) => k !== 'signature' && v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
    .join('&')
  const hashStr = passphrase
    ? `${str}&passphrase=${encodeURIComponent(String(passphrase).trim()).replace(/%20/g, '+')}`
    : str
  return crypto.createHash('md5').update(hashStr).digest('hex')
}
```

**Final ITN verify function** (`pages/api/payment/verify.js`):
```javascript
function verifyPayFastSignature(data, signature) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || null
  // PayFast ITN fields must be processed in RECEIVED ORDER (not alphabetical)
  const str = Object.entries(data)
    .filter(([k]) => k !== 'signature')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
    .join('&')
  const hashStr = passphrase
    ? `${str}&passphrase=${encodeURIComponent(String(passphrase).trim()).replace(/%20/g, '+')}`
    : str
  const expectedSignature = crypto.createHash('md5').update(hashStr).digest('hex')
  return signature === expectedSignature
}
```

**Files Modified**:
- `pages/api/payment/initiate.js` — Removed `.sort()`, removed `merchant_key` exclusion, added proper URL encoding
- `pages/api/payment/verify.js` — Removed `.sort()`, fixed encoding, updated debug log block to match

---

## Recent Updates (June 2026)

### Report Rating System

**Purpose**: Allow users to rate their career report 1–5 stars and leave an optional comment. Provides social proof for school outreach and a quality feedback loop for AI report improvements.

#### Database Migration

Run in Supabase SQL Editor before deploying:
```sql
ALTER TABLE reports ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS rating_comment text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS rated_at timestamptz;
```
Also added to `supabase-schema.sql` for future reference.

#### New API Endpoint

**`POST /api/assessment/rate`** (`pages/api/assessment/rate.js`):
- Body: `{ reportId, userId, rating (1–5), comment (optional string) }`
- Verifies the report belongs to the userId before updating (prevents rating others' reports)
- Updates `reports` table: `rating`, `rating_comment`, `rated_at`
- Returns `{ success: true }`

#### Report Page Changes (`pages/report/[id].js`)

**New state variables**:
- `selectedRating` — star the user clicked (0 = nothing selected)
- `hoveredRating` — star being hovered (for hover highlight effect)
- `ratingComment` — textarea value
- `ratingDone` — true if already rated (loaded from DB) or just submitted
- `ratingSubmitting`, `ratingError` — loading/error state

**New `useEffect`**: Initialises rating state from `report.rating` when report loads (handles returning users who already rated).

**New `submitRating()` function**: POSTs to `/api/assessment/rate`, sets `ratingDone = true` on success.

**Rating UI**: Appears at the bottom of the report page, after the action buttons, inside a `className="action-buttons"` container (so it's hidden on print/PDF). Warm yellow background (`#fffbeb`). Two states:
- **Unrated**: Interactive 5-star buttons with hover effect + optional textarea + "Submit Feedback" button
- **Rated**: "Thank you for your feedback!" message with read-only stars displayed

#### Viewing Ratings

To see aggregate ratings in Supabase:
```sql
SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM reports WHERE rating IS NOT NULL;
```

To see all rated reports with comments:
```sql
SELECT r.id, u.email, r.rating, r.rating_comment, r.rated_at FROM reports r JOIN users u ON r.user_id = u.id WHERE r.rating IS NOT NULL ORDER BY r.rated_at DESC;
```

#### Files Modified
- `supabase-schema.sql` — DB migration
- `pages/api/assessment/rate.js` — NEW endpoint
- `pages/report/[id].js` — rating state, useEffect, submitRating(), rating UI section

### Ratings on Homepage

**Purpose**: Show aggregate star ratings and recent comments on the public homepage as social proof. Section is entirely hidden when no ratings exist — nothing renders until real user ratings are present.

#### New API Endpoint

**`GET /api/assessment/ratings-summary`** (`pages/api/assessment/ratings-summary.js`):
- Queries all non-null `rating` rows from `reports` table
- Returns `{ totalRatings, avgRating, recentComments: [{ rating, comment }] }`
- Returns `{ totalRatings: 0 }` when no ratings exist (homepage hides the section)
- Filters comments to only include those with `> 10 characters` (excludes very short/empty submissions)
- Limits to 3 most recent comments
- Caches for 5 minutes (`Cache-Control: public, s-maxage=300`) to avoid hammering Supabase on every page load

#### Homepage Changes (`pages/index.js`)

- Converted from pure static component to client component with `useState` / `useEffect`
- Added `ratings` state — fetches from `/api/assessment/ratings-summary` on load
- Ratings section renders between the Pricing section and the Footer, **only when `ratings !== null`** (i.e., only when `totalRatings > 0`)
- Section shows:
  - Average score (e.g. **4.8**) in Georgia serif alongside filled/empty star glyphs
  - Total count subtitle ("from 12 completed assessments")
  - Up to 3 recent comment cards in a responsive grid (shown only if comments exist)
  - Comments are quoted and anonymous (no names displayed)

#### Files Modified
- `pages/api/assessment/ratings-summary.js` — NEW public endpoint
- `pages/index.js` — added useState/useEffect import + ratings fetch + conditional ratings section

### Pre-Launch Database Clear

**File**: `clear_user_data.sql` (repo root)

Run this in **Supabase SQL Editor → New Query** before going live to wipe all test data.

**Tables cleared** (in FK-safe order):
1. `answers` (references assessments)
2. `reports` (references assessments + users)
3. `assessments` (references payments + users)
4. `payments` (references users)
5. `audit_log` (independent)
6. `users` (root table, cleared last)

**Tables preserved**: `system_config` — prices and settings are untouched.

After running, the script executes a verification `SELECT` showing remaining row counts for each table. All should be 0.

### Retake Assessment Continue Fix

**Problem**: The "Continue Assessment" banner on the dashboard only showed when `!hasReports`, meaning retake users (who already have completed reports) never saw it. If they dropped mid-retake and came back, the only button was "Retake Assessment" which sent them back to payment again.

**Fix** (`pages/dashboard.js`):
- Removed `!hasReports` condition from the saved-progress banner — it now shows any time there's progress in localStorage, with context-aware title ("You have a retake assessment in progress" vs "You have an assessment in progress")
- Updated `handleRetake()` to check `hasSavedProgress` first: if true, alerts the user and redirects to `/assessment` to continue instead of going to payment

**Files Modified**:
- `pages/dashboard.js` — banner condition and handleRetake guard

### Ratings Display Feature Flag — June 4, 2026

**Problem**: The ratings section was visible on the homepage immediately after the first review was left. As a new platform, early reviews may not all be positive, potentially harming conversion before the product has enough positive social proof.

**Solution**: Added `NEXT_PUBLIC_SHOW_RATINGS` environment variable to toggle the homepage ratings section on/off without losing data.

**How it works**:
- Ratings continue to be collected and stored in the database regardless of the flag
- The `/api/assessment/ratings-summary` endpoint continues to fetch and cache ratings
- The homepage `pages/index.js` checks both `NEXT_PUBLIC_SHOW_RATINGS === 'true'` AND `ratings` exists before rendering the section
- When disabled (default), the ratings section is completely hidden from public view
- When enabled, accumulated ratings display immediately with no code changes needed

**Configuration**:
- Add to Vercel environment variables: `NEXT_PUBLIC_SHOW_RATINGS=true` (default is disabled when unset)
- To toggle: update Vercel env var and redeploy (or git push triggers redeploy)

**Business use case**:
- Launch site and collect first 20–50 reviews privately
- Only enable flag once you have sufficient positive feedback (e.g., avg rating ≥4.0)
- No data loss — all reviews collected during the disabled period appear immediately when enabled

**Files Modified**:
- `pages/index.js` — Added feature flag check to ratings section render condition

### School Pilot Coupon System — June 8, 2026

**Problem**: When piloting with schools, can't expect them to pay full price (R399). Need a way to offer discounted or free assessments to pilot schools while tracking usage and maintaining pricing integrity.

**Solution**: Coupon code system with fixed discount amounts per school, usage limits, and automatic counter decrement on successful payment.

#### Database Schema

**New table: `coupons`**
```sql
id              uuid primary key
school          text not null           -- school name (e.g. "Greenside High")
code            text unique not null    -- coupon code (e.g. "GREENSIDE50")
discount_amount numeric(10,2)           -- fixed ZAR discount (e.g. 199.50)
code_number     int default 0           -- max times code can be used (0 = unlimited)
is_active       boolean default true    -- soft-delete flag
created_at      timestamptz
```

**New column on `payments` table**:
- `coupon_code` text — references coupons(code), tracks which coupon was used

#### API Endpoints

**`GET /api/payment/validate-coupon?code=SCHOOLCODE`**
- Validates coupon code (checks is_active, code_number limit)
- Returns `{ valid: true, discountAmount, school }`
- Returns error if code invalid, inactive, or usage limit reached
- Only counts completed payments toward usage limit (abandoned carts don't count)

**`POST /api/payment/initiate`** (updated)
- Now accepts `couponCode` and `finalAmount` in request body
- Validates coupon on backend (extra safety check)
- Stores coupon_code in payment record
- Applies discount before sending amount to PayFast (avoids signature mismatches)

**`POST /api/payment/verify`** (updated)
- On successful payment (COMPLETE status), decrements coupon `code_number` counter
- Only decrements if code_number > 0 and hasn't been exceeded
- Logs coupon code in audit_log entry for tracking

#### Frontend: Payment Page (`pages/payment.js`)

**New UI section**: Coupon code input below the pricing breakdown
- Text input (case-insensitive, uppercase on display)
- Apply/Clear buttons
- Shows discount amount and school name when applied
- Shows error messages:
  - "Invalid or inactive coupon code" — code doesn't exist or is_active=false
  - "This coupon code has reached its usage limit" — code_number exhausted
- Passes coupon code to payment initiation
- Final amount calculation: `(priceExVat * (1 + VAT%)) - discountAmount`

#### Managing Coupons

**Creating new codes**: Use SQL in Supabase SQL Editor
```sql
INSERT INTO coupons (school, code, discount_amount, code_number, is_active)
VALUES ('School Name', 'SCHOOLCODE', 199.50, 30, true);
```

Example:
- School "Greenside High" → code "GREENSIDE50" → R199.50 discount → max 30 uses
- School "Parktown" → code "PARKTOWN75" → R299.25 discount (75% off) → max 20 uses
- School "Braamfontein" → code "BRAAMFONTEIN100" → R399 discount (free) → max 50 uses

**Checking usage**:
```sql
SELECT c.school, c.code, c.code_number, COUNT(p.id) as times_used
FROM coupons c
LEFT JOIN payments p ON c.code = p.coupon_code AND p.status = 'completed'
WHERE c.is_active = true
GROUP BY c.id, c.school, c.code, c.code_number;
```

**Disabling a code**:
```sql
UPDATE coupons SET is_active = false WHERE code = 'SCHOOLCODE';
```

#### How It Works (User Flow)

1. User arrives at `/payment` page
2. Sees optional "Have a school coupon code?" section below pricing
3. Enters code (e.g., "GREENSIDE50")
4. Clicks Apply → frontend calls `/api/payment/validate-coupon`
5. If valid: shows discount amount and school name, updates total
6. User clicks "Pay R[total]" → sends coupon_code to initiate endpoint
7. Backend validates again, applies discount, sends reduced amount to PayFast
8. User completes payment on PayFast
9. PayFast sends ITN callback → payment marked completed
10. ITN handler decrements coupon `code_number` by 1
11. If code reaches 0 uses, next user gets "usage limit reached" error

#### Discount Applied BEFORE PayFast

Critical: Discount is deducted from the total before sending to PayFast. This avoids signature mismatches (PayFast calculates signatures based on the final amount).

Example: R399 assessment, R199.50 discount → PayFast charged R199.50

#### Files Created/Modified

- `supabase-schema.sql` — Added coupons table, coupon_code column on payments, RLS policy
- `pages/api/payment/validate-coupon.js` — NEW: coupon validation endpoint
- `pages/api/payment/initiate.js` — Now accepts and validates coupon, applies discount
- `pages/api/payment/verify.js` — Decrements coupon counter on payment success
- `pages/payment.js` — Added coupon input UI, discount display, validation logic
- `add-school-coupons.sql` — Reference SQL script for creating coupon codes

#### Testing Checklist

1. Create test coupon in Supabase: `INSERT INTO coupons (school, code, discount_amount, code_number) VALUES ('Test School', 'TEST50', 199.50, 5);`
2. Go to `/payment` page
3. Enter "TEST50" and click Apply → should show "Test School" and "R199.50" discount
4. Click Pay → should charge R199.50 (50% of R399)
5. After payment completes, check coupons table: `code_number` should be 4 (5 - 1)
6. Try applying code 5 more times → 6th attempt should get "usage limit reached" error
7. Try invalid code → should get "Invalid or inactive coupon code" error

