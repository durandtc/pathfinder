import { supabaseAdmin } from '../../lib/supabase'

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

    // Return report data as JSON for client-side PDF generation
    const reportData = reports.map(report => ({
      id: report.id,
      student_name: userMap[report.user_id]?.student_name || 'Student',
      generated_at: report.generated_at,
      top_careers: report.top_careers
    }))

    res.status(200).json({
      success: true,
      count: reportData.length,
      reports: reportData
    })
  } catch (error) {
    console.error('Report export error:', error)
    return res.status(500).json({ error: 'PDF generation failed', details: error.message })
  }
}
