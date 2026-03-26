import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Script from 'next/script'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const userId = 'u_' + Math.random().toString(36).substr(2, 8)

export default function Pricing() {
  const [plans, setPlans] = useState(null)
  const [userPlan, setUserPlan] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    fetchPlans()
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

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API}/api/plans`)
      const data = await res.json()
      setPlans(data.plans)
    } catch (err) {
      console.error('Failed to fetch plans:', err)
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

  const handlePurchase = async (planName) => {
    if (planName === 'free') {
      // Free plan - activate directly
      setPaymentSuccess(true)
      return
    }

    setLoading(true)
    setSelectedPlan(planName)

    try {
      const res = await fetch(`${API}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planName })
      })

      const data = await res.json()

      if (data.success) {
        setShowCheckout(true)
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
        description: `${order.plan} Plan`,
        order_id: order.id,
        image: '/logo.png',
        handler: function (response) {
          verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature, order.plan)
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
          wallet: true,
          emi: true
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

  const verifyPayment = async (orderId, paymentId, signature, planName) => {
    try {
      const res = await fetch(`${API}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          userId,
          planName
        })
      })

      const data = await res.json()
      if (data.success) {
        setPaymentSuccess(true)
        setShowCheckout(false)
        fetchUserPlan()
      } else {
        alert('Payment verification failed')
      }
    } catch (err) {
      console.error('Verification error:', err)
      alert('Verification failed. Please contact support.')
    }
  }

  if (!plans) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'DM Sans, sans-serif' }}>
        Loading plans...
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
          max-width: 1000px;
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
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 700;
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 18px;
        }

        .section-sub {
          color: var(--text-mid);
          font-size: 16px;
          line-height: 1.7;
          max-width: 600px;
          margin: 0 auto 0;
          text-align: center;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 60px;
        }

        .price-card {
          background: var(--white);
          border: 1.5px solid var(--blue-light);
          border-radius: 24px;
          padding: 36px 28px;
          transition: all 0.25s;
          text-align: left;
          position: relative;
        }

        .price-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(59,111,240,0.14);
        }

        .price-card.featured {
          background: var(--blue-deep);
          border-color: var(--blue-deep);
          color: white;
        }

        .price-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--pink-accent);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 50px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .plan-name {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-light);
          margin-bottom: 10px;
        }

        .price-card.featured .plan-name {
          color: rgba(255,255,255,0.6);
        }

        .plan-price {
          font-family: 'Fraunces', serif;
          font-size: 46px;
          font-weight: 700;
          letter-spacing: -2px;
          color: var(--text-dark);
          line-height: 1;
          margin-bottom: 4px;
        }

        .price-card.featured .plan-price { color: white; }

        .plan-period {
          font-size: 13px;
          color: var(--text-light);
          margin-bottom: 24px;
        }

        .price-card.featured .plan-period {
          color: rgba(255,255,255,0.55);
        }

        .plan-features {
          list-style: none;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .plan-features li {
          font-size: 14px;
          color: var(--text-mid);
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .price-card.featured .plan-features li {
          color: rgba(255,255,255,0.8);
        }

        .plan-features li::before {
          content: '✓';
          color: var(--blue-mid);
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .price-card.featured .plan-features li::before { color: var(--pink-mid); }

        .btn-plan {
          width: 100%;
          padding: 13px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          text-align: center;
          text-decoration: none;
          display: block;
        }

        .btn-plan-outline {
          background: transparent;
          border: 1.5px solid var(--blue-light);
          color: var(--blue-deep);
        }

        .btn-plan-outline:hover {
          border-color: var(--blue-mid);
          background: var(--blue-pale);
        }

        .btn-plan-white {
          background: white;
          color: var(--blue-deep);
        }

        .btn-plan-white:hover {
          background: var(--pink-light);
          transform: translateY(-1px);
        }

        .btn-plan-primary {
          background: var(--blue-deep);
          color: white;
        }

        .btn-plan-primary:hover {
          background: var(--blue-mid);
          transform: translateY(-1px);
        }

        .btn-plan-primary:disabled {
          background: var(--blue-light);
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* PAYMENT METHODS */
        .payment-methods {
          margin-top: 16px;
          font-size: 11px;
          color: var(--text-light);
          text-align: center;
        }

        .payment-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          font-size: 18px;
        }

        /* USER PLAN STATUS */
        .user-plan-status {
          max-width: 600px;
          margin: 0 auto 40px;
          background: var(--white);
          padding: 24px 32px;
          border-radius: 16px;
          border: 1.5px solid var(--blue-light);
          text-align: center;
        }

        .current-plan {
          font-size: 13px;
          color: var(--text-light);
          margin-bottom: 8px;
        }

        .plan-badge {
          font-size: 20px;
          font-weight: 700;
          color: var(--blue-deep);
          margin-bottom: 10px;
        }

        .remaining {
          font-size: 14px;
          color: var(--text-mid);
          margin-bottom: 8px;
        }

        .expiry {
          font-size: 12px;
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
          max-width: 800px;
          margin: 60px auto;
          text-align: center;
        }

        .faq-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 30px;
        }

        .faq-item {
          text-align: left;
          margin-bottom: 20px;
          padding: 20px;
          background: var(--white);
          border: 1.5px solid var(--blue-light);
          border-radius: 16px;
        }

        .faq-question {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .faq-answer {
          font-size: 14px;
          color: var(--text-mid);
          line-height: 1.6;
          padding-left: 36px;
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
          .pricing-grid { grid-template-columns: 1fr; }
          .faq-section { padding: 0 16px; }
          footer { padding: 32px 20px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <Link href="/" className="logo">Secure<span>Claw</span></Link>
        <ul className="nav-links">
          <li><Link href="/#features">Features</Link></li>
          <li><Link href="/pricing" style={{color: 'var(--blue-deep)'}}>Pricing</Link></li>
          <li><Link href="#docs">Docs</Link></li>
          <li><Link href="/deploy" className="nav-cta">Deploy →</Link></li>
        </ul>
      </nav>

      {/* PRICING */}
      <section className="pricing-section">
        <div className="section-tag reveal">Pricing</div>
        <h2 className="section-title reveal">Simple, India-first pricing.</h2>
        <p className="section-sub reveal">
          Start free. Scale as you grow. Pay via UPI. No credit card required.
        </p>

        {/* USER PLAN STATUS */}
        {userPlan && (
          <div className="user-plan-status reveal">
            <div className="current-plan">Current Plan</div>
            <div className="plan-badge">{userPlan.plan.name}</div>
            <div className="remaining">
              {userPlan.remainingAgents} agent{userPlan.remainingAgents !== 1 ? 's' : ''} remaining out of {userPlan.plan.maxAgents}
            </div>
            {userPlan.planExpiry && new Date(userPlan.planExpiry) > new Date() && (
              <div className="expiry">
                Expires: {new Date(userPlan.planExpiry).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT SUCCESS */}
        {paymentSuccess && (
          <div className="success-box reveal">
            <div className="success-icon">🎉</div>
            <div className="success-title">Payment Successful!</div>
            <div className="success-message">
              Your plan has been activated. You can now deploy your AI agents!
            </div>
            <Link href="/deploy" className="btn-plan btn-plan-primary" style={{maxWidth: '200px', margin: '0 auto'}}>
              Deploy Agent Now →
            </Link>
          </div>
        )}

        {/* PRICING GRID - YOUR DESIGN WITH MY PRICING */}
        <div className="pricing-grid">
          {/* STARTER - FREE */}
          <div className="price-card reveal">
            <div className="plan-name">Starter</div>
            <div className="plan-price">FREE</div>
            <div className="plan-period">Forever</div>
            <ul className="plan-features">
              <li>1 AI Agent</li>
              <li>Basic AI models (Claude 3, GPT-4o)</li>
              <li>Custom subdomain</li>
              <li>512MB memory per agent</li>
              <li>Community support</li>
              <li><strong>Zero cost forever</strong></li>
            </ul>
            <Link href="/deploy" className="btn-plan btn-plan-outline">
              Deploy Free
            </Link>
            <div className="payment-methods">
              Pay: No payment needed
            </div>
          </div>

          {/* STARTER PRO - ₹99 */}
          <div className="price-card featured reveal">
            <div className="price-badge">Most Popular</div>
            <div className="plan-name">Starter Pro</div>
            <div className="plan-price">₹99</div>
            <div className="plan-period">per month</div>
            <ul className="plan-features">
              <li>3 AI Agents</li>
              <li>Advanced AI (Claude 3.5, GPT-4o, Gemini)</li>
              <li>Custom domain support</li>
              <li>1GB memory per agent</li>
              <li>Email support</li>
              <li>Priority deployment</li>
            </ul>
            <button
              onClick={() => handlePurchase('starter_pro')}
              disabled={loading}
              className="btn-plan btn-plan-white"
            >
              {loading && selectedPlan === 'starter_pro' ? 'Processing...' : `Buy Now ₹99`}
            </button>
            <div className="payment-methods">
              Pay via UPI
              <div className="payment-icons">
                📱 💳 🏧 🪙
              </div>
            </div>
          </div>

          {/* BUSINESS - ₹699 */}
          <div className="price-card reveal">
            <div className="plan-name">Business</div>
            <div className="plan-price">₹699</div>
            <div className="plan-period">per month</div>
            <ul className="plan-features">
              <li>Unlimited Agents</li>
              <li>All AI models + Nemotron</li>
              <li>Enterprise security suite</li>
              <li>2GB+ memory per agent</li>
              <li>24/7 Priority support</li>
              <li>White-label domain option</li>
            </ul>
            <button
              onClick={() => handlePurchase('business')}
              disabled={loading}
              className="btn-plan btn-plan-outline"
            >
              {loading && selectedPlan === 'business' ? 'Processing...' : `Buy Now ₹699`}
            </button>
            <div className="payment-methods">
              Pay via UPI/Card/Netbanking
              <div className="payment-icons">
                💳 🏧 📧 💵
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section reveal">
          <h2 className="faq-title">Frequently Asked Questions</h2>

          <div className="faq-item">
            <div className="faq-question">💳 Can I pay via UPI?</div>
            <div className="faq-answer">
              Yes! We accept UPI from Google Pay, PhonePe, Paytm, and BHIM. No credit card required.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">💰 Is there a free subscription?</div>
            <div className="faq-answer">
              Yes! Our Starter plan is free forever with 1 AI agent. Perfect for personal use.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">🔄 Can I cancel anytime?</div>
            <div className="faq-answer">
              Absolutely! No contracts, cancel anytime from your dashboard. No questions asked.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">🇮🇳 Why is pricing in Rupees?</div>
            <div className="faq-answer">
              We're India-first! Prices in INR (₹), UPI payments accepted, servers in Mumbai for low latency.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">⚡ What's the API cost?</div>
            <div className="faq-answer">
              AI model costs vary: Claude 3 (~₹0.001/1K tokens), GPT-4o (~₹0.0007/1K tokens). We're 10x cheaper than competitors!
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">🚀 How quickly can I deploy?</div>
            <div className="faq-answer">
              As fast as 60 seconds! Paste your Telegram token, select AI model, click deploy → agent live instantly.
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