import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Deploy() {
  const [token, setToken] = useState('')
  const [model, setModel] = useState('claude-3-5-sonnet-20241022')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(-1)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const steps = [
    'Validating token...',
    'Pulling SecureClaw image...',
    'Configuring NemoClaw privacy...',
    'Launching agent...',
    'Agent is live! 🚀'
  ]

  const deploy = async () => {
    if (!token.trim()) {
      setError('Please enter your Telegram Bot Token')
      return
    }

    setError('')
    setLoading(true)
    setResult(null)

    // Simulate progress
    for (let i = 0; i < steps.length - 1; i++) {
      setStep(i)
      await new Promise(resolve => setTimeout(resolve, 900))
    }

    try {
      const res = await fetch(`${API}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramToken: token,
          aiModel: model,
          userId: 'u_' + Math.random().toString(36).substr(2, 8),
          plan: 'starter'
        })
      })

      const data = await res.json()

      if (data.success) {
        setStep(4)
        setResult(data.deployment)
      } else {
        setError(data.error || 'Deployment failed')
      }
    } catch (e) {
      console.error(e)
      setError('Connection error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Deploy — SecureClaw</title>
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f7ff, #eef3ff, #fde8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        padding: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '48px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 20px 60px rgba(59,111,240,0.12)',
          border: '1.5px solid #dde8ff'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/">
              <h1 style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#12132a',
                letterSpacing: '-1px',
                marginBottom: '6px',
                cursor: 'pointer'
              }}>
                Secure<span style={{ color: '#2251cc' }}>Claw</span>
              </h1>
            </Link>
            <p style={{ fontSize: '14px', color: '#8589b0' }}>
              Paste token → Agent live in 60s
            </p>
          </div>

          {/* Deploy Form */}
          {!result ? (
            <>
              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a4d72',
                display: 'block',
                marginBottom: '8px'
              }}>
                Telegram Bot Token
              </label>
              <input
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="1234567890:ABCdef..."
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #dde8ff',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  background: '#f8f7ff',
                  boxSizing: 'border-box',
                  marginBottom: '4px'
                }}
              />
              <p style={{ fontSize: '11px', color: '#8589b0', marginBottom: '20px' }}>
                Get from @BotFather on Telegram
              </p>

              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a4d72',
                display: 'block',
                marginBottom: '8px'
              }}>
                AI Model
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #dde8ff',
                  fontSize: '13px',
                  background: '#f8f7ff',
                  boxSizing: 'border-box',
                  marginBottom: '24px'
                }}
              >
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet ⭐</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="nemotron-local">NVIDIA Nemotron (Local)</option>
              </select>

              {/* Progress Steps */}
              {loading && (
                <div style={{
                  background: '#f8f7ff',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  {steps.map((stepText, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '5px 0',
                        fontSize: '13px',
                        color: index < step ? '#56d364' : index === step ? '#2251cc' : '#c0c4d6',
                        fontWeight: index === step ? '600' : '400'
                      }}
                    >
                      <span>{index < step ? '✓' : index === step ? '▸' : '○'}</span>
                      {stepText}
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  background: '#fff0f3',
                  border: '1px solid #ffc0cb',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: '#c0392b',
                  marginBottom: '16px'
                }}>
                  ❌ {error}
                </div>
              )}

              <button
                onClick={deploy}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: loading ? '#a0b4e8' : '#2251cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                {loading ? 'Deploying...' : '🚀 Deploy My Agent'}
              </button>
            </>
          ) : (
            /* Success State */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#12132a',
                marginBottom: '8px'
              }}>
                Agent is Live!
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#8589b0',
                marginBottom: '20px'
              }}>
                Your secure AI agent is running
              </p>

              <div style={{
                background: '#f8f7ff',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#8589b0',
                  marginBottom: '4px'
                }}>
                  YOUR AGENT URL
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#2251cc',
                  fontWeight: '600'
                }}>
                  {result.subdomain}
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid #bbf7d0',
                fontSize: '13px',
                color: '#16a34a'
              }}>
                ✅ NemoClaw privacy layer active
              </div>

              <button
                onClick={() => {
                  setResult(null)
                  setStep(-1)
                  setToken('')
                }}
                style={{
                  marginTop: '24px',
                  padding: '12px 24px',
                  background: '#2251cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Deploy Another Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}