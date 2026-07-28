# PickMyPath — Lawyer Review Package
## IP/Copyright & Legal Compliance Check

**Date**: July 2026  
**Purpose**: South African IP lawyer review of RIASEC framework usage, AI disclosure, and assessment methodology

---

## Part 1: What the Lawyer Needs to Understand

### 1.1 What PickMyPath Claims to Be

**In Terms of Service** (`pages/terms.js`):
- "Career guidance tool for exploration" — NOT a professional psychometric assessment
- "AI-powered content" — not a replacement for professional counseling
- "Research-backed frameworks" (Holland RIASEC, CAPS curriculum)

**In Privacy Policy** (`pages/privacy.js`):
- Anthropic Claude API receives assessment answers for report generation
- We don't store credit card data (PayFast handles it)
- Data retention and deletion policies

**In Disclaimers** (across site):
- "This is not a formal psychometric test"
- "Discuss results with your school counselor"
- "AI-generated content may be inaccurate or outdated"

---

### 1.2 What We Actually Do (Technical)

1. **Student completes 45-question assessment** (55 with new consistency checks)
   - Questions: Original, not copied from SDS, SAVII, or other tests
   - Scoring: Calculate RIASEC totals (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
   - Result: 3-letter RIASEC code (e.g., IRE, SAI, etc.)

2. **We send assessment data to Anthropic Claude API**
   - Input: Assessment answers + marks (if provided) + parent observations
   - Process: Claude generates career report using provided prompt
   - Output: JSON with 6 career recommendations + advice

3. **We store report in Supabase database**
   - Not sent elsewhere
   - User can request deletion anytime

---

### 1.3 Framework Origin & IP Status

**Holland RIASEC Framework**:
- Created by Dr. John Holland in 1966
- Original work likely in public domain (56+ years old)
- RIASEC itself: NOT copyrighted. Anyone can use these 6 categories.

**BUT**: Existing commercial implementations are copyrighted:
- SDS (Self-Directed Search) — owned by PAR (Psychological Assessment Resources)
- SAVII (Self-Directed Search Internet Version) — owned by PAR
- These use copyrighted questions/scoring algorithms
- **PickMyPath does NOT use their questions or algorithms**

**Risk Assessment**:
- ✅ **LOW RISK**: We built original questions based on RIASEC framework
- ✅ **LOW RISK**: We're not copying SDS/SAVII items
- ⚠️ **POTENTIAL ISSUE**: Need to confirm we're not accidentally similar to existing tests

---

## Part 2: Files Lawyer Must Review

### 2.1 Assessment Questions (Original Methodology)

**File**: `lib/questions.js`

**What to check:**
- All 49 original questions (lines 40–97)
- All 6 new rephrased questions (lines 95–115, marked `[CONSISTENCY]`)
- Compare against SDS and SAVII to ensure no similar wording
- Verify questions test RIASEC constructs (not copied items)

**Example format**:
```javascript
{ section: 0, type: 'scale', riasec: 'R', text: 'I enjoy working with my hands — building, fixing, or making things.' }
```

**Lawyer should verify:**
- Questions are original phrasing
- Not closely similar to SDS/SAVII items (can request those tests for comparison)
- Questions appropriately measure Holland RIASEC types

---

### 2.2 AI Prompt (What Claude Sees)

**File**: `lib/generateReport.js` (lines 44–118)

**What to check:**
- Full prompt sent to Anthropic Claude
- Whether we're asking Claude to do anything that claims professional assessment
- Data we send: answers, marks, parent observations (nothing identifying)
- Output: 6 careers, salary ranges, progression, advice

**Lawyer should verify:**
- Prompt doesn't claim to provide "professional psychometric assessment"
- We're transparent that output is "AI-generated"
- We're not asking Claude to diagnose anything (mental health, learning disabilities)
- Prompt acknowledges this is for "exploration" not diagnosis

---

### 2.3 Career Database (Original Mappings)

**File**: `lib/careerDatabase.js`

**What to check:**
- Career mappings for 20+ RIASEC codes
- Careers aren't copying existing career lists from SDS/SAVII
- Descriptions are original, not from other tests
- Salary ranges are from public sources (not proprietary)

**Example**:
```javascript
'IRE': [
  { title: 'Software Engineer / Tech Lead', description: 'Problem-solver who builds systems and leads technical teams' },
  { title: 'Engineering Manager', description: 'Technical expert managing projects and people' },
]
```

**Lawyer should verify:**
- Career selections make sense for RIASEC codes
- Descriptions aren't copied from other assessments
- We're not claiming these are "validated" career matches (just AI-suggested)

---

### 2.4 Legal Disclaimers (IP Disclosure)

**Files to check**:
- `pages/terms.js` — Section 1: "Guidance Tool, Not Professional Assessment"
- `pages/privacy.js` — Section 5: "AI and Assessment Data Processing"

**Key disclaimers that protect us:**
```
"This is a career guidance tool for exploration only. It is NOT a formal 
psychometric test, professional assessment, or substitute for consulting 
with a qualified career advisor or psychologist."

"All career recommendations are AI-generated and may contain inaccuracies, 
outdated information, or generic suggestions. You should verify career 
information independently."

"We use the Holland RIASEC framework but are not affiliated with the 
Self-Directed Search (SDS), SAVII, or other copyrighted instruments."
```

**Lawyer should verify:**
- Disclaimers are clear and prominent
- We're not claiming professional credentials we don't have
- We're transparent about AI limitations
- RIASEC attribution is correct

---

### 2.5 Data Handling (POPIA Compliance)

**Files to check**:
- `pages/privacy.js` — Full privacy policy
- `pages/api/assessment/report.js` — What data is stored
- `clear_user_data.sql` — Ability to delete user data

**Lawyer should verify**:
- POPIA compliance (Personal Information Protection Act)
- Data retention policies
- User can request deletion
- No credit card data stored (PayFast handles it)
- Claude API usage disclosed to users

---

### 2.6 Registration & Consent

**Files to check**:
- `pages/register.js` — Terms checkbox before account creation
- `pages/api/auth/google.js` → `components/GoogleSignInButton.js` — Google OAuth terms modal
- `pages/api/auth/accept-terms.js` — Terms acceptance tracking

**Lawyer should verify**:
- Users cannot create account without accepting Terms
- Google OAuth users also required to accept Terms
- `terms_accepted` field in database proves acceptance
- Email users and OAuth users treated equally

---

## Part 3: Information Package to Provide Lawyer

### 3.1 Create a Comparison Document

**Request from PAR (if possible):**
- Sample questions from SDS or SAVII
- Scoring methodology
- Career lists they use

**Compare to PickMyPath**:
- Our 55 questions (none should match SDS/SAVII closely)
- Our scoring (sum of responses per RIASEC type — standard Holland method)
- Our career database (independently sourced, not from SDS/SAVII)

---

### 3.2 Provide Screenshots of Key Sections

1. **Registration flow** — show Terms checkbox
2. **Sample report** — show disclaimers, AI disclosure
3. **Privacy Policy** — show Claude API disclosure
4. **Terms of Service** — show non-professional-assessment disclaimer

---

### 3.3 Provide Usage Statistics (if applicable)

- Number of users
- Number of completed assessments
- Any complaints or issues reported
- Schools/institutions using PickMyPath

---

### 3.4 Provide Business Context

- Why created (filling gap in affordable career guidance)
- Who target users are (Grade 8–12 South African students)
- Pricing model (R399 one-off payment, no ongoing subscription)
- Go-to-market strategy (school partnerships, not direct-to-consumer)

---

## Part 4: Key Questions for Lawyer

### 4.1 Intellectual Property

1. **RIASEC Framework**: Is Holland's work in public domain in South Africa? Can we use it freely?
2. **Existing Tests**: Are SDS/SAVII copyrighted in South Africa? What are our exposure risks if:
   - Our questions are similar but not identical to theirs?
   - Our RIASEC scoring is the standard Holland method?
   - Our career recommendations are independent?
3. **Fair Use**: Does our "not a professional assessment" disclaimer protect us from claims we're copying professional tests?
4. **Attribution**: Should we add attribution to Holland's RIASEC framework explicitly in our reports/terms?

### 4.2 Professional Liability

1. **Assessment Claims**: By calling it "career guidance," are we vulnerable to claims we should have warned about something?
2. **AI Liability**: Who's liable if Claude generates inaccurate career info — us or Anthropic?
3. **School Liability**: If a school uses PickMyPath and a student complains, who's liable — us or the school?
4. **Insurance**: What professional liability insurance should we carry?

### 4.3 Data & Privacy

1. **POPIA Compliance**: Are our privacy practices POPIA-compliant for students under 13? (Need parental consent)
2. **Claude API**: Is it POPIA-compliant to send assessment data to Anthropic's servers?
3. **Retention**: How long should we keep assessment data/reports? (Currently indefinite unless user requests deletion)

### 4.4 Terms & Disclaimers

1. **Strength of Disclaimers**: Are our disclaimers strong enough to protect us?
2. **Language**: Should we use stronger language like "NOT a professional assessment" throughout?
3. **Liability Limitation**: Should we cap our liability in Terms?
4. **Jurisdiction**: Should we specify South African law governs?

---

## Part 5: What to Ask Lawyer to Review

1. **Draft letter** confirming:
   - We're not infringing on SDS/SAVII copyrights
   - Our use of RIASEC framework is permitted
   - Our disclaimers are adequate protection

2. **Recommended changes** to:
   - Terms of Service
   - Privacy Policy
   - Assessment methodology disclosure
   - Professional liability coverage

3. **Risk assessment**:
   - What are remaining IP risks?
   - What's the likelihood of SDS/SAVII copyright claim?
   - How to minimize that risk?

---

## Part 6: Budget & Timeline

**Estimated lawyer review:**
- Initial consultation: **30 min** (R500–1000)
  - Explain PickMyPath, answer Q&A
- Document review: **2–4 hours** (R2000–4000)
  - Review files listed above
  - Check Terms/Privacy/Disclaimers
- Comparison analysis (if needed): **2–3 hours** (R2000–3000)
  - Compare questions to SDS/SAVII
- Written opinion + recommendations: **1–2 hours** (R1000–2000)
- **Total estimate: R6000–10000 ZAR**

**Timeline:**
- Week 1: Find SA IP lawyer, brief them
- Week 2: Provide files, answer questions
- Week 3: Lawyer reviews, provides opinion
- Week 4: Make any required changes
- Week 5: Ready for school rollout

---

## Part 7: Checklist Before Lawyer Meeting

- [ ] Export all relevant files (see Part 2 above)
- [ ] Create a "PickMyPath Architecture" document explaining data flow
- [ ] Prepare list of your credentials/background
- [ ] Gather sample SDS/SAVII materials for comparison (if possible)
- [ ] Document all disclaimers currently in place
- [ ] Prepare POPIA data retention policy
- [ ] List any feedback from Jo Coertzen or other psychometrists
- [ ] Prepare screenshots of full user journey (register → assessment → report)

---

## Part 8: After Lawyer Review

**Actions based on findings:**

If **Low Risk** (likely):
- Get written confirmation letter
- Add explicit RIASEC attribution in reports
- Use in school proposals as "reviewed by South African IP lawyer"

If **Medium Risk**:
- Add stronger disclaimers
- Consider trademark registration for "PickMyPath"
- Get professional liability insurance
- Modify career database if needed

If **High Risk** (unlikely but possible):
- Consider rebranding assessment framework
- Consult with PAR about licensing agreement
- Delay school rollout until resolved

---

## Summary Table

| Item | File | Lawyer Check | Risk Level |
|------|------|--------------|-----------|
| Assessment Questions | `lib/questions.js` | Compare vs SDS/SAVII | Low |
| AI Prompt | `lib/generateReport.js` | Check for false claims | Low |
| Career Database | `lib/careerDatabase.js` | Verify originality | Low |
| Disclaimers | `pages/terms.js`, `pages/privacy.js` | Check strength | Medium |
| Data Handling | `pages/privacy.js`, database | POPIA compliance | Medium |
| Registration | `pages/register.js` | Terms acceptance | Low |
| **Overall Assessment** | — | **NOT a professional test** | **Low–Medium** |

---

**Next Step**: Find a South African intellectual property lawyer (preferably one with experience in educational technology or SaaS products) and schedule a consultation.

**Recommended search**: "IP lawyer South Africa" + "educational technology" or "software licensing"
