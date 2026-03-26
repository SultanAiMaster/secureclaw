import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Script from 'next/script'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const userId = 'u_' + Math.random().toString(36).substr(2, 8)

export default function Pricing() {
  const [plan, setPlan] = useState(null)
  const [userPlan, setUserPlan] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPlan()
    fetchUserPlan()

    // Scroll reveal - run on client only
    setTimeout(() => {
      const reveals = document.querySelectorAll('.reveal')
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
          }
        })
      }, { threshold: 0.12 })
      reveals.forEach(r => observer.observe(r))
    }, 100)
  }, [])

  const fetchPlan = async () => {
    try {
      const res = await fetch(`${API}/api/plan`)
      const data = await res.json()
      setPlan(data.plan)
    } catch (err) {
      console.error('Failed to fetch plan:', err)
    }
  }

  const fetchUserPlan = async () => {
    try {
      const res = await fetch(`${API}/api/user/plan/${userId}`)
      const data = await res.json()
      setUserPlan(data)
    } catch (err) {
      console.error('Failed to fetch user plan:', err)
    }
  }

  const handlePurchase = async () => {
    setLoading(true)
    setSelectedPlan('trial')

    try {
      const res = await fetch(`${API}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await res.json()

      if (data.success) {
        initRazorpayCheckout(data.order)
      } else {
        alert(data.error || 'Failed to create payment')
      }
    } catch (err) {
      console.error('Payment error:', err)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initRazorpayCheckout = (order) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: order.key_id,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'SecureClaw',
        description: `${order.plan}: ${order.days} day trial`,
        order_id: order.id,
        image: '/logo.png',
        handler: function (response) {
          verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature)
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        notes: {
          userId: userId,
          plan: order.plan
        },
        theme: { color: '#2251cc' },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`)
        setLoading(false)
      })
    }
  }

  const verifyPayment = async (orderId, paymentId, signature) => {
    try {
      const res = await fetch(`${API}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          userId
        })
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        fetchUserPlan()
      } else {
        alert('Payment verification failed')
      }
    } catch (err) {
      console.error('Verification error:', err)
      alert('Verification failed. Please contact support.')
    }
  }

  if (!plan) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'DM Sans, sans-serif' }}>
        Loading pricing...
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Pricing — SecureClaw</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      </Head>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <style jsx>{`
        :root {
          --white: #ffffff;
          --off-white: #f8f7ff;
          --blue-deep: #2251cc;
          --blue-mid: #3b6ff0;
          --blue-light: #dde8ff;
          --blue-pale: #eef3ff;
          --pink-light: #fde8f0;
          --pink-mid: #f9c8dc;
          --pink-accent: #e8679a;
          --text-dark: #12132a;
          --text-mid: #4a4d72;
          --text-light: #8589b0;
          --radius: 20px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--white);
          color: var(--text-dark);
        }

        /* NAV */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 60px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(221,232,255,0.6);
        }

        .logo {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--blue-deep);
          letter-spacing: -0.5px;
          text-decoration: none;
        }

        .logo span { color: var(--pink-accent); }

        .nav-links { display: flex; gap: 36px; list-style: none; }

        .nav-links a {
          text-decoration: none;
          color: var(--text-mid);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: var(--blue-deep); }

        .nav-cta {
          background: var(--blue-deep);
          color: white !important;
          padding: 10px 22px;
          border-radius: 50px;
          font-weight: 600 !important;
          font-size: 13px !important;
          transition: background 0.2s, transform 0.15s !important;
        }

        .nav-cta:hover {
          background: var(--blue-mid) !important;
          transform: translateY(-1px);
          color: white !important;
        }

        /* PRICING SECTION */
        .pricing-section {
          min-height: 100vh;
          padding: 100px 24px;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .section-tag {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--blue-mid);
          margin-bottom: 14px;
        }

        .section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(30px, 5vw, 46px);
          font-weight: 700;
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 18px;
        }

        .section-sub {
          color: var(--text-mid);
          font-size: 16px;
          line-height: 1.7;
          margin: 0 auto 0;
          text-align: center;
        }

        .price-card {
          background: linear-gradient(135deg, var(--blue-deep) 0%, #1a3fa8 100%);
          border: 1.5px solid var(--blue-deep);
          border-radius: 32px;
          padding: 48px 40px;
          text-align: left;
          position: relative;
          margin-top: 60px;
          box-shadow: 0 24px 80px rgba(34,81,204,0.25);
        }

        .price-badge {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--pink-accent);
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 20px;
          border-radius: 50px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .plan-name {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 16px;
          text-align: center;
        }

        .plan-price {
          font-family: 'Fraunces', serif;
          font-size: 64px;
          font-weight: 700;
          letter-spacing: -2px;
          color: white;
          line-height: 1;
          margin-bottom: 4px;
          text-align: center;
        }

        .plan-period {
          font-size: 16px;
          color: rgba(255,255,255,0.55);
          margin-bottom: 32px;
          text-align: center;
        }

        .plan-features {
          list-style: none;
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .plan-features li {
          font-size: 15px;
          color: rgba(255,255,255,0.85);
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .plan-features li::before {
          content: '✓';
          color: var(--pink-mid);
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .btn-plan {
          width: 100%;
          padding: 18px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          text-align: center;
        }

        .btn-plan-white {
          background: white;
          color: var(--blue-deep);
          box-shadow: 0 8px 32px rgba(255,255,255,0.2);
        }

        .btn-plan-white:hover {
          background: var(--pink-light);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255,255,255,0.3);
        }

        .btn-plan-white:disabled {
          background: rgba(255,255,255,0.3);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .button-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          text-align: center;
          margin-top: 12px;
        }

        /* USER PLAN STATUS */
        .user-plan-status {
          max-width: 500px;
          margin: 0 auto 50px;
          background: var(--white);
          padding: 28px 32px;
          border-radius: 16px;
          border: 1.5px solid var(--blue-light);
          text-align: center;
        }

        .current-plan {
          font-size: 15px;
          color: var(--text-mid);
          margin-bottom: 10px;
        }

        .plan-badge-status {
          font-size: 22px;
          font-weight: 700;
          color: var(--blue-deep);
          margin-bottom: 12px;
        }

        .days-remaining {
          font-size: 16px;
          color: var(--text-mid);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .remaining {
          font-size: 14px;
          color: var(--text-light);
        }

        /* SUCCESS */
        .success-box {
          max-width: 500px;
          margin: 0 auto 40px;
          background: #f0fdf4;
          padding: 28px 32px;
          border-radius: 16px;
          border: 1.5px solid #bbf7d0;
          text-align: center;
        }

        .success-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .success-title {
          font-size: 22px;
          font-weight: 700;
          color: #16a34a;
          margin-bottom: 10px;
        }

        .success-message {
          font-size: 14px;
          color: #15803d;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        /* FAQ */
        .faq-section {
          max-width: 700px;
          margin: 60px auto;
          text-align: center;
        }

        .faq-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 30px;
        }

        .faq-item {
          text-align: left;
          margin-bottom: 16px;
          padding: 20px;
          background: var(--white);
          border: 1.5px solid var(--blue-light);
          border-radius: 16px;
        }

        .faq-question {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .faq-answer {
          font-size: 14px;
          color: var(--text-mid);
          line-height: 1.6;
        }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--blue-light);
          padding: 40px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-logo {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--blue-deep);
        }

        .footer-logo span { color: var(--pink-accent); }
        footer p { font-size: 13px; color: var(--text-light); }
        .footer-links { display: flex; gap: 28px; list-style: none; }
        .footer-links a { font-size: 13px; color: var(--text-light); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: var(--blue-deep); }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }

        .reveal.visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 768px) {
          nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .faq-section { padding: 0 16px; }
          footer { padding: 32px 20px; flex-direction: column; align-items: flex-start; }
          .pricing-section { padding: 60px 20px; }
          .price-card { padding: 36px 28px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <Link href="/" className="logo">Secure<span>Claw</span></Link>
        <ul className="nav-links">
          <li><Link href="/#features">Features</Link></li>
          <li><Link href="/pricing" style={{color: 'var(--blue-deep)'}}>Pricing</Link></li>
          <li><Link href="#docs">Docs</Link></li>
          <li><Link href="/deploy" className="nav-cta">Deploy Now</Link></li>
        </ul>
      </nav>

      {/* PRICING --}}
      <section className="pricing-section">
        <div className="section-tag reveal">Pricing</div>
        <h2 className="section-title reveal">One simple price.</h2>
        <p className="section-sub reveal">
          Pay once. Activate for 24 hours. Deploy up to 1 AI agent. No monthly commitments.
        </p>

        {/* USER PLAN STATUS */}
        {userPlan && userPlan.hasActivePlan && (
          <div className="user-plan-status reveal">
            <div className="current-plan">Current Plan Status</div>
            <div className="plan-badge-status">{userPlan.plan.name} - Active</div>
            {userPlan.daysRemaining > 0 ? (
              <div className="days-remaining">
                {userPlan.daysRemaining} {userPlan.daysRemaining === 1 ? 'day' : 'days'} remaining
              </div>
            ) : (
              <div className="days-remaining" style={{color: '#d63384'}}>Plan expired</div>
            )}
            <div className="remaining">
              {userPlan.remainingAgents} agent{userPlan.remainingAgents !== 1 ? 's' : ''} remaining (1 agent max)
            </div>
            {userPlan.expiryDate && (
              <div className="remaining" style={{marginTop: '8px', fontSize: '13px'}}>
                Expires: {new Date(userPlan.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT SUCCESS */}
        {success && (
          <div className="success-box reveal">
            <div className="success-icon">🎉</div>
            <div className="success-title">Payment Successful!</div>
            <div className="success-message">
              Your 1-day trial has been activated! You can now deploy your AI agent for the next 24 hours.
            </div>
            <Link href="/deploy" className="btn-plan btn-plan-white" style={{maxWidth: '240px', margin: '20px auto 0', padding: '14px'}}>
              Deploy Agent Now →
            </Link>
          </div>
        )}

        {/* SINGLE PRICING CARD */}
        {plan && (
          <div className="price-card reveal">
            <div className="price-badge">1-Day Trial</div>
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">₹999</div>
            <div className="plan-period">for 1 day (24 hours)</div>
            <ul className="plan-features">
              <li>1 AI Agent deployment</li>
              <li>All AI models (Claude 3.5, GPT-4o, Gemini)</li>
              <li>512MB memory per agent</li>
              <li>Full privacy protection</li>
              <li>24-hour active period</li>
              <li>No monthly commitment</li>
            </ul>
            <button
              onClick={handlePurchase}
              disabled={loading || (userPlan && userPlan.hasActivePlan)}
              className="btn-plan btn-plan-white"
            >
              {loading ? 'Processing...' : userPlan && userPlan.hasActivePlan ? 'Plan Active' : 'Purchase Now - ₹999'}
            </button>
            <div className="button-sub">
              Pay via UPI (Google Pay, PhonePe, Paytm)
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="faq-section reveal">
          <h2 className="faq-title">Frequently Asked Questions</h2>

          <div className="faq-item">
            <div className="faq-question">💳 Can I pay via UPI?</div>
            <div className="faq-answer">
              Yes! We accept UPI from Google Pay, PhonePe, Paytm, and BHIM. ₹999 instant activation via UPI.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">⏰ How does the 1-day trial work?</div>
            <div className="faq-answer">
              After payment, you get 24 hours (1 day) of access. During this time, you can deploy 1 AI agent. The agent remains active until the expiry time.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">🔄 Can I extend after 1 day?</div>
            <div className="faq-answer">
              Yes! You can purchase another 1-day trial after the current one expires. No monthly commitment needed.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">🤖 Can I deploy more than 1 agent?</div>
            <div className="faq-answer">
              Each ₹999 trial includes up to 1 agent only. For more agents, purchase additional trials.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">🇮🇳 Why定价 in Rupees?</div>
            <div className="faq-answer">
              We're India-first! Pricing in INR (₹), UPI payments accepted, servers in India for low latency.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">🚀 How quickly can I deploy?</div>
            <div className="faq-answer">
              As fast as 60 seconds! After UPI payment confirmation (~5-10 seconds), you can deploy immediately.
            </div>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          flexWrap: 'wrap',
          fontSize: '13px',
          color: 'var(--text-mid)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            🔒 100% Secure Payments
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            📧 24/7 Email Support
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            🇮🇳 Made in India
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Secure<span>Claw</span></div>
        <p>© 2026 SecureClaw. Built with ❤️ in India.</p>
        <ul className="footer-links">
          <li><a href="#privacy">Privacy</a></li>
          <li><a href="#terms">Terms</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="https://github.com/SultanAiMaster/secureclaw">GitHub</a></li>
        </ul>
      </footer>
    </>
  )
}