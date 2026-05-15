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

**All environment variables are configured in Vercel project settings** (not local .env files). Configure these in **Vercel Dashboard → Settings → Environment Variables**:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Anthropic AI**: `ANTHROPIC_API_KEY` and `AI_MODEL` (claude-sonnet-4-6 for production)
- **JWT Auth**: `JWT_SECRET` (must be a 32-byte hex string)
- **App URL**: `NEXT_PUBLIC_APP_URL` — The live domain (e.g., `https://pickmypath.co.za`) — used for email verification links and password reset URLs
- **Admin Credentials**: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **Firebase & Google OAuth**:
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID (e.g., `pathfinder-55a19`)
  - `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase web app API key
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — custom auth domain for redirects (e.g., `pickmypath.co.za`)
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth 2.0 Client ID from Google Cloud Console
- **Email**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER` (email address), `SMTP_PASS` (password)
- **Payments**: `NEXT_PUBLIC_PAYFAST_SANDBOX` (set to false for live transactions)

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

## Testing Notes

- **No automated test suite** — test manually on the live Vercel deployment
- **PayFast sandbox** allows full payment flow testing without real transactions (enable with `NEXT_PUBLIC_PAYFAST_SANDBOX=true` in Vercel env vars)
- **Admin panel** (`/admin`) accessible with `ADMIN_EMAIL` and `ADMIN_PASSWORD` credentials from Vercel env vars

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

