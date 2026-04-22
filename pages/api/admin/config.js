import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { data: rows } = await db.from('system_config').select('key_name, plain_value, encrypted_value').order('key_name')
    const config = {}
    rows?.forEach(r => {
      // For display: show plain values; encrypted values show masked
      config[r.key_name] = r.plain_value || (r.encrypted_value ? '••••••••' : null)
    })
    return res.status(200).json({ config })
  }

  if (req.method === 'POST') {
    const { keyName, value } = req.body
    if (!keyName) return res.status(400).json({ error: 'keyName required' })

    // Sensitive keys store as encrypted_value (placeholder — in production use proper encryption)
    const sensitiveKeys = ['anthropic_api_key', 'sendgrid_api_key', 'payfast_passphrase']
    const isSensitive = sensitiveKeys.includes(keyName)

    const updateData = isSensitive
      ? { encrypted_value: value, plain_value: null, updated_at: new Date().toISOString() }
      : { plain_value: value, encrypted_value: null, updated_at: new Date().toISOString() }

    const { error } = await db.from('system_config')
      .upsert({ key_name: keyName, ...updateData, last_updated_by: 'admin' }, { onConflict: 'key_name' })

    if (error) return res.status(500).json({ error: 'Failed to save config' })

    // Write to audit log
    await db.from('audit_log').insert({
      action: `Config updated: ${keyName}`,
      details: isSensitive ? 'Sensitive value updated (masked)' : `New value: ${value}`,
      performed_by: 'admin',
    })

    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
