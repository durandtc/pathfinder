import { supabaseAdmin } from '../../lib/supabase'
import puppeteer from 'puppeteer'
import archiver from 'archiver'

export default async function handler(req, res) {
  // Security: Only POST method allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Security: Token-based authentication
  const token = req.headers['x-export-token'] || req.body.token
  const expectedToken = process.env.REPORT_EXPORT_TOKEN

  if (!expectedToken) {
    return res.status(500).json({ error: 'Export token not configured' })
  }

  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized: invalid token' })
  }

  try {
    const { report_ids, format = 'zip' } = req.body

    if (!report_ids || !Array.isArray(report_ids) || report_ids.length === 0) {
      return res.status(400).json({ error: 'report_ids array required' })
    }

    if (report_ids.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 reports per request' })
    }

    // Fetch reports from database
    const db = supabaseAdmin()
    const { data: reports, error: fetchError } = await db
      .from('reports')
      .select('id, user_id, top_careers, generated_at')
      .in('id', report_ids)

    if (fetchError || !reports || reports.length === 0) {
      return res.status(404).json({ error: 'No reports found' })
    }

    // Fetch user info for naming
    const userIds = reports.map(r => r.user_id)
    const { data: users } = await db
      .from('users')
      .select('id, student_name, email')
      .in('id', userIds)

    const userMap = {}
    users?.forEach(u => { userMap[u.id] = u })

    // Launch browser for PDF generation
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/tmp/puppeteer/chrome/linux-152.0.7977.42/chrome-linux64/chrome'
    })

    if (format === 'zip') {
      // Return ZIP file with multiple PDFs
      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', 'attachment; filename="reports.zip"')

      const archive = archiver('zip')
      archive.pipe(res)

      for (const report of reports) {
        const user = userMap[report.user_id]
        const filename = `${user?.student_name || 'Student'}_${report.id.slice(0, 8)}.pdf`

        const pdf = await generateReportPDF(browser, report, user)
        archive.append(pdf, { name: filename })
      }

      await archive.finalize()
      await browser.close()
    } else if (format === 'individual') {
      // Return first report as single PDF (for testing)
      const report = reports[0]
      const user = userMap[report.user_id]
      const pdf = await generateReportPDF(browser, report, user)

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${user?.student_name || 'report'}.pdf"`)
      res.send(pdf)
      await browser.close()
    } else {
      return res.status(400).json({ error: 'Invalid format. Use "zip" or "individual"' })
    }
  } catch (error) {
    console.error('Report export error:', error)
    return res.status(500).json({ error: 'PDF generation failed', details: error.message })
  }
}

async function generateReportPDF(browser, report, user) {
  const page = await browser.createPage()

  // HTML rendering of the report
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Career Report - ${user?.student_name || 'Report'}</title>
      <style>
        * { margin: 0; padding: 0; }
        body { font-family: Georgia, serif; color: #333; line-height: 1.6; }
        .header { background: #0f1f3d; color: #fff; padding: 2rem; text-align: center; }
        .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .header p { color: rgba(255,255,255,0.8); font-size: 0.9rem; }
        .section { padding: 2rem; border-bottom: 1px solid #ddd; }
        .section h2 { color: #0f1f3d; font-size: 1.3rem; margin-bottom: 1rem; }
        .career { margin-bottom: 2rem; padding: 1rem; background: #f9f9f9; border-left: 4px solid #c9973a; }
        .career h3 { color: #0f1f3d; margin-bottom: 0.5rem; }
        .career p { font-size: 0.9rem; margin-bottom: 0.5rem; }
        .match-pct { font-size: 1.5rem; color: #c9973a; font-weight: bold; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${user?.student_name || 'Career Assessment Report'}'s Career Report</h1>
        <p>Generated ${new Date(report.generated_at).toLocaleDateString('en-ZA')}</p>
      </div>

      <div class="section">
        <h2>Your Top Career Matches</h2>
        ${(report.top_careers?.careers || []).slice(0, 6).map((career, i) => `
          <div class="career">
            <h3>Rank ${i + 1}: ${career.title}</h3>
            <div class="match-pct">${career.match_pct || 85}% Match</div>
            <p><strong>Summary:</strong> ${career.summary || 'N/A'}</p>
            ${career.salary_range ? `<p><strong>Salary Range:</strong> Entry: ${career.salary_range.entry || 'N/A'}</p>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="section" style="text-align: center; color: #666; font-size: 0.85rem;">
        <p>This report was generated by PickMyPath — AI-powered career guidance for South African students.</p>
        <p>For questions, contact: support@pickmypath.co.za</p>
      </div>
    </body>
    </html>
  `

  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdf = await page.pdf({ format: 'A4', margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' } })
  await page.close()

  return pdf
}
