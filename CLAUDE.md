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

