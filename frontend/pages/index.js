import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>SecureClaw — Deploy AI Agents in 60 Seconds</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </Head>

      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f7ff 0%, #eef3ff 50%, #fde8f0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          background: '#fde8f0',
          border: '1px solid #f9c8dc',
          borderRadius: '50px',
          padding: '6px 16px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#e8679a',
          marginBottom: '24px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>
          ● Powered by OpenClaw + NVIDIA NemoClaw
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: '700',
          color: '#12132a',
          letterSpacing: '-2px',
          lineHeight: '1.05',
          marginBottom: '20px',
          maxWidth: '700px'
        }}>
          Deploy Secure AI Agents<br/>
          in <span style={{ color: '#2251cc' }}>60 Seconds</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#8589b0',
          maxWidth: '480px',
          lineHeight: '1.7',
          marginBottom: '40px'
        }}>
          Paste your Telegram token. Choose your AI model.
          Your private, secure agent is live instantly.
        </p>

        <div style={{
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link href="/deploy" style={{
            background: '#2251cc',
            color: 'white',
            padding: '15px 34px',
            borderRadius: '50px',
            fontSize: '15px',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(34,81,204,0.30)'
          }}>
            🚀 Deploy Free
          </Link>

          <a href="#pricing" style={{
            background: 'white',
            color: '#12132a',
            padding: '15px 30px',
            borderRadius: '50px',
            fontSize: '15px',
            fontWeight: '500',
            textDecoration: 'none',
            border: '1.5px solid #dde8ff'
          }}>
            View Pricing
          </a>
        </div>

        <div style={{
          marginTop: '60px',
          display: 'flex',
          gap: '48px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            ['60s', 'Deploy time'],
            ['100%', 'Data private'],
            ['99.9%', 'Uptime']
          ].map(([number, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#2251cc'
              }}>{number}</div>
              <div style={{
                fontSize: '13px',
                color: '#8589b0'
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}