import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Script from 'next/script'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Pricing() {
  const [plans, setPlans] = useState(null)
  const [userPlan, setUserPlan] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userId] = useState('u_' + Math.random().toString(36).substr(2, 8))
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    fetchPlans()
    fetchUserPlan()
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
        if (data.freePlan) {
          setPaymentSuccess(true)
          fetchUserPlan()
        } else {
          setShowCheckout(true)
          initRazorpayCheckout(data.order)
        }
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
        amount: order.amount * 100, // Razorpay expects in paise
        currency: order.currency,
        name: 'SecureClaw',
        description: `${order.plan} Plan`,
        order_id: order.id,
        image: '/logo.png',
        handler: function (response) {
          // Payment successful
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
        theme: {
          color: '#2251cc'
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          paylater: false
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

  const planCards = Object.entries(plans).map(([key, plan]) => ({
    key,
    ...plan
  }))

  return (
    <>
      <Head>
        <title>Pricing — SecureClaw</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </Head>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: 'linear-gradient(135deg, #f8f7ff, #eef3ff, #fde8f0)',
        minHeight: '100vh',
        padding: '40px 24px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Link href="/">
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#12132a',
              marginBottom: '10px',
              cursor: 'pointer'
            }}>
              Secure<span style={{ color: '#2251cc' }}>Claw</span>
            </h1>
          </Link>
          <p style={{ fontSize: '16px', color: '#8589b0' }}>
            Choose the perfect plan for your AI agent needs
          </p>
        </div>

        {/* User Plan Status */}
        {userPlan && (
          <div style={{
            maxWidth: '600px',
            margin: '0 auto 40px',
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #dde8ff',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#8589b0', marginBottom: '5px' }}>
              Current Plan
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#2251cc',
              marginBottom: '10px'
            }}>
              {userPlan.plan.name}
            </div>
            <div style={{ fontSize: '13px', color: '#4a4d72', marginBottom: '10px' }}>
              {userPlan.remainingAgents} agents remaining out of {userPlan.plan.maxAgents}
            </div>
            {userPlan.planExpiry && new Date(userPlan.planExpiry) > new Date() && (
              <div style={{ fontSize: '12px', color: '#8589b0' }}>
                Expires: {new Date(userPlan.planExpiry).toLocaleDateString('en-IN')}
              </div>
            )}
          </div>
        )}

        {/* Payment Success */}
        {paymentSuccess && (
          <div style={{
            maxWidth: '500px',
            margin: '0 auto 40px',
            background: '#f0fdf4',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#16a34a',
              marginBottom: '10px'
            }}>
              Payment Successful!
            </div>
            <p style={{ fontSize: '14px', color: '#15803d' }}>
              Your plan has been activated. You can now deploy your AI agents!
            </p>
            <Link href="/deploy">
              <button style={{
                marginTop: '15px',
                padding: '12px 24px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Deploy Agent Now
              </button>
            </Link>
          </div>
        )}

        {/* Pricing Cards */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {planCards.map((plan) => (
            <div
              key={plan.key}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                border: plan.key === 'pro' ? '2px solid #2251cc' : '1px solid #eef3ff',
                boxShadow: plan.key === 'pro' ? '0 20px 60px rgba(34,81,204,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {plan.key === 'pro' && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#2251cc',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  MOST POPULAR
                </div>
              )}

              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#12132a',
                marginBottom: '8px'
              }}>
                {plan.name}
              </h3>

              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#2251cc',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px'
              }}>
                <span>₹{plan.price}</span>
                {plan.duration > 0 && (
                  <span style={{ fontSize: '14px', color: '#8589b0', fontWeight: '400' }}>
                    /{plan.duration === 1 ? 'month' : 'year'}
                  </span>
                )}
              </div>

              {plan.key === 'annual' && (
                <div style={{
                  fontSize: '13px',
                  color: '#16a34a',
                  fontWeight: '600',
                  marginBottom: '20px'
                }}>
                  💰 Save 58% compared to monthly
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                {plan.features.map((feature, idx) => (
                  <div key={idx} style={{
                    fontSize: '14px',
                    color: '#4a4d72',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ color: '#2251cc' }}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              {plan.price === 0 ? (
                <button
                  onClick={() => handlePurchase(plan.key)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#2251cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading && selectedPlan === plan.key ? 'Activating...' : 'Get Started Free'}
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(plan.key)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: plan.key === 'pro' ? '#2251cc' : 'white',
                    color: plan.key === 'pro' ? 'white' : '#2251cc',
                    border: '1.5px solid #2251cc',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading && selectedPlan === plan.key ? 'Processing...' : `Buy Now - ₹${plan.price}`}
                </button>
              )}

              <div style={{
                marginTop: '16px',
                fontSize: '11px',
                color: '#8589b0',
                textAlign: 'center'
              }}>
                💳 Pay via UPI, Card, Netbanking, Wallet
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div style={{
          maxWidth: '800px',
          margin: '60px auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#12132a',
            marginBottom: '30px'
          }}>
            Frequently Asked Questions
          </h2>

          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#12132a',
                marginBottom: '8px'
              }}>
                🤔 Can I use any payment method?
              </div>
              <div style={{ fontSize: '14px', color: '#8589b0' }}>
                Yes! We accept UPI, credit/debit cards, netbanking, and wallets (Paytm, PhonePe, GPay).
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#12132a',
                marginBottom: '8px'
              }}>
                💰 Is there a free subscription?
              </div>
              <div style={{ fontSize: '14px', color: '#8589b0' }}>
                Yes! Our Starter plan is free forever with 1 AI agent. Perfect for personal use.
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#12132a',
                marginBottom: '8px'
              }}>
                🔄 Can I cancel anytime?
              </div>
              <div style={{ fontSize: '14px', color: '#8589b0' }}>
                Absolutely! No contracts, cancel anytime from your dashboard. No questions asked.
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#12132a',
                marginBottom: '8px'
              }}>
                🔄 Can I upgrade or downgrade?
              </div>
              <div style={{ fontSize: '14px', color: '#8589b0' }}>
                Yes! You can upgrade anytime from the pricing page. Downgrades take effect at the next billing cycle.
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '14px', color: '#8589b0', marginBottom: '16px' }}>
            Need help? Contact us at support@secureclaw.app
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '12px',
            color: '#8589b0'
          }}>
            <span>🇮🇳 Made with ❤️ in India</span>
            <span>🔒 100% Secure Payments</span>
            <span>📧 Email Support</span>
          </div>
        </div>
      </div>
    </>
  )
}