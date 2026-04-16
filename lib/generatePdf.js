// PDF generation runs server-side via API route
// Uses jsPDF to build the report

export function buildPdfBase64(reportData, userName, userEmail) {
  // We return an HTML template — the API route uses puppeteer-less jsPDF
  // This runs in Node.js (API route), not the browser

  const { riasec_profile, careers, subject_advice, motivational_note } = reportData
  const date = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })

  const aiColors = { high: '#2d7a4f', medium: '#854f0b', low: '#a32d2d' }

  // Build HTML that will be returned as the email body (PDF via client-side jsPDF is in pages/assessment/report.js)
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Georgia, serif; color: #1a1a2e; max-width: 680px; margin: 0 auto; padding: 32px; }
  h1 { font-size: 26px; color: #0f1f3d; margin-bottom: 4px; }
  .sub { color: #7a7a9a; font-size: 13px; margin-bottom: 32px; }
  .profile-box { background: #0f1f3d; color: #fff; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; }
  .profile-box h2 { color: #c9973a; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; }
  .profile-box p { font-size: 14px; line-height: 1.6; margin: 0; opacity: 0.85; }
  .career { border: 1px solid #ddd8cc; border-radius: 10px; margin-bottom: 20px; overflow: hidden; }
  .career-header { background: #f8f4ee; padding: 16px 20px; border-bottom: 1px solid #ddd8cc; display: flex; align-items: center; gap: 14px; }
  .rank { width: 32px; height: 32px; background: #0f1f3d; color: #c9973a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 15px; flex-shrink: 0; }
  .career-title { font-size: 17px; font-weight: bold; color: #0f1f3d; flex: 1; }
  .match { font-size: 20px; font-weight: bold; color: #c9973a; }
  .career-body { padding: 16px 20px; }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #c9973a; font-weight: bold; margin: 12px 0 4px; }
  .career-body p { font-size: 13px; color: #4a4a6a; line-height: 1.6; margin: 0 0 8px; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 8px; }
  .tag { background: #e8f0f8; color: #1a3260; border-radius: 5px; padding: 3px 8px; font-size: 12px; }
  .ai-box { background: #fff8ec; border-left: 3px solid #c9973a; padding: 10px 12px; border-radius: 0 6px 6px 0; }
  .ai-box p { font-size: 13px; color: #5a4010; line-height: 1.6; margin: 0; }
  .resilience { font-size: 11px; font-weight: bold; margin-top: 4px; }
  .advice { background: #f0f7ff; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; }
  .advice h3 { font-size: 14px; color: #0f1f3d; margin: 0 0 8px; }
  .advice p { font-size: 13px; color: #4a4a6a; line-height: 1.6; margin: 0; }
  .footer { text-align: center; color: #aaa; font-size: 11px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; }
</style>
</head>
<body>
<h1>PathFinder SA — Career Report</h1>
<div class="sub">${userName} &nbsp;·&nbsp; ${userEmail} &nbsp;·&nbsp; Generated ${date}</div>

<div class="profile-box">
  <h2>Your RIASEC profile — ${riasec_profile.dominant_types.join(' · ')}</h2>
  <p>${riasec_profile.summary}</p>
</div>

${careers.map(c => `
<div class="career">
  <div class="career-header">
    <div class="rank">${c.rank}</div>
    <div class="career-title">${c.title}</div>
    <div class="match">${c.match_pct}%</div>
  </div>
  <div class="career-body">
    <div class="section-label">About this career</div>
    <p>${c.summary}</p>
    <div class="section-label">Required Grade 10–12 subjects</div>
    <div class="tags">${(c.subjects_required || []).map(s => `<span class="tag">${s}</span>`).join('')}</div>
    ${c.subjects_recommended?.length ? `<div class="tags">${c.subjects_recommended.map(s => `<span class="tag" style="background:#e8f5e8;color:#1a4d1a">${s} ✓ recommended</span>`).join('')}</div>` : ''}
    <div class="section-label">NSC grades &amp; APS requirements</div>
    <p><strong>${c.nsc_grades}</strong></p>
    <p>${c.aps_score}</p>
    <p><em>${c.study_path}</em></p>
    <div class="section-label">AI impact on this career</div>
    <div class="ai-box">
      <p>${c.ai_impact}</p>
      <div class="resilience" style="color:${aiColors[c.ai_resilience] || '#854f0b'}">
        AI resilience: ${(c.ai_resilience || 'medium').toUpperCase()}
      </div>
    </div>
  </div>
</div>
`).join('')}

<div class="advice">
  <h3>Subject selection advice</h3>
  <p>${subject_advice}</p>
</div>

<div class="advice" style="background:#f0fff4">
  <h3>A note for you</h3>
  <p>${motivational_note}</p>
</div>

<div class="footer">
  PathFinder SA &nbsp;·&nbsp; Powered by AI &nbsp;·&nbsp; Based on Holland RIASEC + SA CAPS Curriculum<br>
  This report is a guidance tool. We recommend discussing it with a school counsellor or career guidance professional.
</div>
</body>
</html>`

  return html
}
