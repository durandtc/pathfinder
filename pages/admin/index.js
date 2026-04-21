import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const TABS = ['API Keys', 'Services', 'Pricing', 'Users', 'Audit Log']

export default function AdminPanel() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [config, setConfig] = useState({})
  const [users, setUsers] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [editingKey, setEditingKey] = useState(null)
  const [newKeyValue, setNewKeyValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [stats, setStats] = useState({ users: 0, assessments: 0, reports: 0, revenue: 0 })

  useEffect(() => {
    const a = sessionStorage.getItem('pf_admin')
    if (a === 'true') { setAuthed(true); loadAll() }
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    })
    const data = await res.json()
    if (!res.ok) { setLoginError(data.error || 'Login failed'); return }
    sessionStorage.setItem('pf_admin', 'true')
    setAuthed(true)
    loadAll()
  }

  async function loadAll() {
    try {
      const [cfgRes, usersRes, auditRes, statsRes] = await Promise.all([
        fetch('/api/admin/config'),
        fetch('/api/admin/users'),
        fetch('/api/admin/audit'),
        fetch('/api/admin/stats'),
      ])
      const cfgData   = await cfgRes.json()
      const usersData = await usersRes.json()
      const auditData = await auditRes.json()
      const statsData = await statsRes.json()
      setConfig(cfgData.config || {})
      setUsers(usersData.users || [])
      setAuditLog(auditData.logs || [])
      setStats(statsData.stats || {})
    } catch {}
  }

  async function saveConfigValue(keyName, value) {
    setSaving(true)
    setSaveMsg('')
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyName, value }),
    })
    setSaving(false)
    if (res.ok) {
      setSaveMsg('Saved ✓')
      setConfig(prev => ({ ...prev, [keyName]: value }))
      setEditingKey(null)
      setNewKeyValue('')
      setTimeout(() => setSaveMsg(''), 3000)
    } else {
      setSaveMsg('Save failed')
    }
  }

  function logout() {
    sessionStorage.removeItem('pf_admin')
    setAuthed(false)
  }

  // ── LOGIN SCREEN ─────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: 4 }}>PickMyPath</h1>
          <p style={{ color: 'var(--text-mid)', fontSize: '0.875rem' }}>Admin Panel</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="admin@yourdomain.co.za" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Admin password" />
          </div>
          {loginError && <p className="error-msg">{loginError}</p>}
          <button type="submit" style={{ width: '100%', padding: 13, background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 500, cursor: 'pointer', marginTop: 8 }}>Sign in to Admin</button>
        </form>
      </div>
    </div>
  )

  // ── ADMIN PANEL ──────────────────────────────────────────
  return (
    <>
      <Head><title>Admin — PickMyPath</title></Head>
      <style>{`
        body { background: #f0f2f5; }
        .admin-nav-btn { background: none; border: none; padding: 10px 16px; cursor: pointer; font-size: 0.875rem; border-bottom: 2px solid transparent; color: var(--text-mid); transition: all 0.15s; font-family: sans-serif; }
        .admin-nav-btn.active { color: var(--navy); border-bottom-color: var(--navy); font-weight: 500; }
        .admin-nav-btn:hover { color: var(--navy); }
        .stat-card { background: #fff; border-radius: 10px; padding: 1.25rem; border: 1px solid #e0ddd6; }
        .stat-num { font-family: Georgia,serif; font-size: 2rem; font-weight: 700; color: var(--navy); }
        .stat-lbl { font-size: 0.8rem; color: var(--text-light); margin-top: 2px; }
        .cfg-row { display: grid; grid-template-columns: 180px 1fr 100px; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 0.5px solid #eee; }
        .cfg-row:last-child { border-bottom: none; }
        .cfg-lbl { font-size: 0.875rem; font-weight: 500; color: var(--navy); }
        .cfg-hint { font-size: 0.75rem; color: var(--text-light); margin-top: 2px; }
        .cfg-val { font-family: monospace; font-size: 0.8rem; color: var(--text-mid); background: #f8f4ee; border: 0.5px solid #ddd; border-radius: 6px; padding: 7px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .btn-sm { font-size: 0.8rem; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-family: sans-serif; }
        .btn-sm-navy { background: var(--navy); color: #fff; border: none; }
        .btn-sm-outline { background: transparent; color: var(--navy); border: 1px solid var(--border); }
        .toggle-switch { position: relative; width: 36px; height: 20px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-track { position: absolute; inset: 0; background: #ccc; border-radius: 20px; cursor: pointer; transition: background 0.2s; }
        .toggle-switch input:checked + .toggle-track { background: #185FA5; }
        .toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s; pointer-events: none; }
        .toggle-switch input:checked ~ .toggle-thumb { transform: translateX(16px); }
        .user-row { display: grid; grid-template-columns: 1fr 1fr auto auto; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 0.5px solid #eee; font-size: 0.875rem; }
        .badge { font-size: 0.7rem; padding: 3px 8px; border-radius: 10px; font-weight: 500; }
        .badge-green { background: #e8f5e8; color: #2d7a4f; }
        .badge-gray { background: #f0f0f0; color: #666; }
        .audit-row { display: flex; gap: 12px; padding: 8px 0; border-bottom: 0.5px solid #eee; font-size: 0.8rem; }
        .audit-time { color: #999; min-width: 140px; font-family: monospace; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: 'var(--navy)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <span style={{ fontFamily: 'Georgia,serif', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>PickMyPath <span style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 400 }}>Admin</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>● Live</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: '2rem' }}>
          {[
            ['Total users', stats.users, ''],
            ['Assessments', stats.assessments, ''],
            ['Reports generated', stats.reports, ''],
            ['Revenue (ZAR)', `R${(stats.revenue || 0).toLocaleString()}`, ''],
          ].map(([l, v]) => (
            <div key={l} className="stat-card">
              <div className="stat-num">{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ background: '#fff', borderRadius: '10px 10px 0 0', borderBottom: '1px solid #eee', display: 'flex', padding: '0 8px' }}>
          {TABS.map((t, i) => (
            <button key={t} className={`admin-nav-btn${activeTab === i ? ' active' : ''}`} onClick={() => setActiveTab(i)}>{t}</button>
          ))}
        </div>

        {/* Panel body */}
        <div style={{ background: '#fff', borderRadius: '0 0 10px 10px', padding: '1.5rem', border: '1px solid #eee', borderTop: 'none' }}>

          {saveMsg && <div style={{ background: saveMsg.includes('✓') ? '#e8f5e8' : '#fff0f0', color: saveMsg.includes('✓') ? '#2d7a4f' : '#a32d2d', padding: '8px 14px', borderRadius: 6, fontSize: '0.875rem', marginBottom: 16 }}>{saveMsg}</div>}

          {/* ── API KEYS ── */}
          {activeTab === 0 && (
            <div>
              <div style={{ background: '#fff8ec', border: '1px solid #e8b856', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
                <p style={{ fontSize: '0.825rem', color: '#5a4010', margin: 0 }}>Keys are stored encrypted. Change a key here and it applies immediately — no redeployment needed. Never commit keys to GitHub.</p>
              </div>
              {[
                { key: 'anthropic_api_key',   label: 'Anthropic API key',    hint: 'Powers AI report generation', secret: true },
                { key: 'ai_model',            label: 'AI model',             hint: 'claude-haiku-4-5 (fast) or claude-sonnet-4-6 (best)', secret: false },
                { key: 'sendgrid_api_key',    label: 'SendGrid API key',     hint: 'Email delivery for reports', secret: true },
                { key: 'sendgrid_from_email', label: 'From email address',   hint: 'Sender address on report emails', secret: false },
                { key: 'payfast_merchant_id', label: 'PayFast merchant ID',  hint: 'Your PayFast account ID', secret: false },
                { key: 'payfast_passphrase',  label: 'PayFast passphrase',   hint: 'Payment signing passphrase', secret: true },
                { key: 'payfast_sandbox',     label: 'PayFast sandbox mode', hint: 'true = test mode, false = live payments', secret: false },
              ].map(({ key, label, hint, secret }) => (
                <div key={key} className="cfg-row">
                  <div>
                    <div className="cfg-lbl">{label}</div>
                    <div className="cfg-hint">{hint}</div>
                  </div>
                  <div>
                    {editingKey === key ? (
                      <input
                        type={secret ? 'password' : 'text'}
                        value={newKeyValue}
                        onChange={e => setNewKeyValue(e.target.value)}
                        placeholder={`Enter new ${label}`}
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem', padding: '7px 10px', border: '1.5px solid var(--navy)', borderRadius: 6 }}
                        autoFocus
                      />
                    ) : (
                      <div className="cfg-val">
                        {config[key] ? (secret ? '••••••••••••••••••••' : config[key]) : <span style={{ color: '#ccc' }}>Not set</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {editingKey === key ? (
                      <>
                        <button className="btn-sm btn-sm-navy" onClick={() => saveConfigValue(key, newKeyValue)} disabled={saving}>Save</button>
                        <button className="btn-sm btn-sm-outline" onClick={() => { setEditingKey(null); setNewKeyValue('') }}>✕</button>
                      </>
                    ) : (
                      <button className="btn-sm btn-sm-outline" onClick={() => { setEditingKey(key); setNewKeyValue('') }}>Change</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SERVICES ── */}
          {activeTab === 1 && (
            <div>
              {[
                { key: 'registrations_open', label: 'New registrations', desc: 'Allow new users to register' },
                { key: 'payfast_sandbox',    label: 'PayFast sandbox',   desc: 'Enable for testing — no real payments' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid #eee' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--navy)' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 2 }}>{desc}</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox"
                      checked={config[key] === 'true'}
                      onChange={e => saveConfigValue(key, e.target.checked ? 'true' : 'false')}
                    />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" />
                  </label>
                </div>
              ))}
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Service status</h3>
                {[
                  ['Anthropic AI',     config.anthropic_api_key ? 'Configured' : 'Not configured', !!config.anthropic_api_key],
                  ['PayFast',          config.payfast_merchant_id ? 'Configured' : 'Not configured', !!config.payfast_merchant_id],
                  ['SendGrid',         config.sendgrid_api_key ? 'Configured' : 'Not configured', !!config.sendgrid_api_key],
                  ['Supabase DB',      'Connected via env vars', true],
                ].map(([svc, status, ok]) => (
                  <div key={svc} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #eee', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--navy)', fontWeight: 500 }}>{svc}</span>
                    <span className={`badge ${ok ? 'badge-green' : 'badge-gray'}`}>{ok ? '● ' : '○ '}{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {activeTab === 2 && (
            <div>
              {[
                { key: 'assessment_price_zar', label: 'Assessment price (excl. VAT)', hint: 'In South African Rand', prefix: 'R' },
                { key: 'vat_rate_pct',         label: 'VAT rate',                    hint: 'Percentage, e.g. 15',  suffix: '%' },
                { key: 'school_discount_pct',  label: 'School bulk discount',         hint: 'Percentage off for school orders', suffix: '%' },
              ].map(({ key, label, hint, prefix, suffix }) => (
                <div key={key} className="cfg-row">
                  <div>
                    <div className="cfg-lbl">{label}</div>
                    <div className="cfg-hint">{hint}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {prefix && <span style={{ color: 'var(--text-mid)' }}>{prefix}</span>}
                    <input
                      type="number"
                      value={editingKey === key ? newKeyValue : (config[key] || '')}
                      onChange={e => { setEditingKey(key); setNewKeyValue(e.target.value) }}
                      style={{ width: 100, fontFamily: 'monospace', fontSize: '0.875rem', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6 }}
                    />
                    {suffix && <span style={{ color: 'var(--text-mid)' }}>{suffix}</span>}
                  </div>
                  <button className="btn-sm btn-sm-navy" onClick={() => saveConfigValue(key, editingKey === key ? newKeyValue : config[key])} disabled={saving}>Save</button>
                </div>
              ))}
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 3 && (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 16 }}>{users.length} registered users</div>
              <div className="user-row" style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-light)', borderBottom: '1px solid #ddd' }}>
                <span>Name / Email</span><span>Registered</span><span>Payment</span><span>Report</span>
              </div>
              {users.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', padding: '1rem 0' }}>No users yet. They will appear here after registration.</p>
              ) : users.map(u => (
                <div key={u.id} className="user-row">
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--navy)' }}>{u.full_name}</div>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{u.email}</div>
                  </div>
                  <div style={{ color: 'var(--text-mid)' }}>{new Date(u.created_at).toLocaleDateString('en-ZA')}</div>
                  <span className={`badge ${u.has_payment ? 'badge-green' : 'badge-gray'}`}>{u.has_payment ? 'Paid' : 'Pending'}</span>
                  <span className={`badge ${u.has_report ? 'badge-green' : 'badge-gray'}`}>{u.has_report ? 'Done' : 'None'}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── AUDIT LOG ── */}
          {activeTab === 4 && (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 16 }}>Recent admin actions</div>
              {auditLog.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No audit entries yet.</p>
              ) : auditLog.map(entry => (
                <div key={entry.id} className="audit-row">
                  <span className="audit-time">{new Date(entry.created_at).toLocaleString('en-ZA')}</span>
                  <div>
                    <div style={{ color: 'var(--navy)', fontWeight: 500 }}>{entry.action}</div>
                    {entry.details && <div style={{ color: 'var(--text-mid)', marginTop: 2 }}>{entry.details}</div>}
                    <div style={{ color: '#bbb', fontSize: '0.75rem', marginTop: 2 }}>{entry.performed_by}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
