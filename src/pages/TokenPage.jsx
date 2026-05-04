import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function TokenPage() {
  const { login } = useAuth()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    const t = value.trim()
    if (!t) { setError('Paste your JWT token first.'); return }
    if (!t.startsWith('eyJ')) { setError("Doesn't look like a valid JWT — should start with eyJ..."); return }
    login(t)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--g100)', fontFamily: 'var(--font)' }}>

      {/* Topbar — same as prototype */}
      <div style={{ height: 'var(--th)', background: 'var(--yellow)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, borderBottom: '1px solid rgba(0,0,0,.1)' }}>
        <div style={{ width: 30, height: 30, background: 'var(--g900)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', fontFamily: 'var(--mono)' }}>Z</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>ZeroMoblt</span>
        <span style={{ fontSize: 11, color: 'rgba(0,0,0,.4)', fontFamily: 'var(--mono)' }}>Admin Portal</span>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'var(--w)', border: '1px solid var(--g200)', borderRadius: 'var(--r2)', padding: 32, width: '100%', maxWidth: 500, boxShadow: 'var(--sh2)' }}>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', marginBottom: 6 }}>
              Paste Access Token
            </div>
            <div style={{ fontSize: 13, color: 'var(--g500)', lineHeight: 1.6 }}>
              Get your JWT from{' '}
              <code style={{ fontSize: 11, color: 'var(--blue)', background: 'var(--bl)', padding: '1px 6px', borderRadius: 4 }}>
                app.dev
              </code>
              {' '}or Swagger UI. Session stays active until the token expires.
            </div>
          </div>

          {/* Label */}
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            JWT Access Token
          </div>

          {/* Textarea */}
          <textarea
            value={value}
            onChange={e => { setValue(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder="eyJraWQiOiI3MmhBQlpP..."
            rows={5}
            style={{
              width: '100%', padding: '10px 12px', marginBottom: 6,
              border: `1px solid ${error ? 'var(--red)' : 'var(--g200)'}`,
              borderRadius: 'var(--r)', fontSize: 11,
              fontFamily: 'var(--mono)', color: 'var(--g800)',
              background: 'var(--g50)', outline: 'none',
              resize: 'vertical', lineHeight: 1.6,
              boxShadow: error ? '0 0 0 3px rgba(185,28,28,.1)' : 'none',
              transition: 'border-color .15s, box-shadow .15s',
            }}
          />

          {error && (
            <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 10 }}>⚠ {error}</div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            style={{ width: '100%', padding: '10px 0', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
          >
            Enter Portal →
          </button>

          {/* Hint */}
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--g50)', borderRadius: 'var(--r)', border: '1px solid var(--g200)', fontSize: 11, color: 'var(--g500)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--g700)' }}>Where to find it: </strong>
            Swagger UI → Authorize → copy the token value. Paste a fresh one when it expires (~1 hr).
          </div>
        </div>
      </div>
    </div>
  )
}