# 💳 Razorpay Payment Integration Guide

**For Indian users - UPI Payments, No Credit Card Required**

---

## 🎯 Overview

SecureClaw uses **Razorpay** for payment processing in India. Supports:
- ✅ UPI (Google Pay, PhonePe, Paytm, BHIM)
- ✅ Credit/Debit Cards
- ✅ Netbanking
- ✅ Wallets
- ✅ EMI

**All payments in INR (Indian Rupees - ₹)**

---

## 📋 Prerequisites

1. **Razorpay Account** - Create FREE account
2. **Bank Account** - For receiving payments
3. **PAN Card** - Required for verification
4. **GSTIN** (Optional) - If you want GST bills

---

## 🛠️ Step 1: Create Razorpay Account

### 1. Sign Up
1. Go to: https://razorpay.com/
2. Click "Sign Up"
3. Use your email and phone number

### 2. Complete Profile
1. Login to: https://dashboard.razorpay.com/
2. Click "Complete Profile" in top right
3. Fill in:
   - Full name
   - PAN Card details
   - Business type (Individual/Company)
   - Business address
   - Bank account details (NEFT/RTGS info)

### 3. Verify Email & Phone
- Verify via OTP sent to your email
- Verify via OTP sent to your phone

### 4. Submit Documents
- Upload PAN card image
- Bank account proof (cancel cheque, bank statement)
- Address proof (Aadhaar, passport, etc.)

**Note:** Verification takes 24-48 hours. You can still use TEST mode while waiting!

---

## 🔑 Step 2: Get API Keys

### Test Mode (Free - No money needed)
1. Login to Razorpay dashboard
2. Go to: Settings → API Keys
3. Copy:
   - **Key ID**: `rzp_test_xxxxxxxxx`
   - **Key Secret**: Click "View" and copy

### Production Mode (After verification)
1. Same page, switch to "Production" tab
2. Click "Generate Key"
3. Copy:
   - **Key ID**: `rzp_live_xxxxxxxxx`
   - **Key Secret**: Click "View" and copy

---

## ⚙️ Step 3: Configure SecureClaw

### Update `.env` file

```bash
# SSH into VPS
ssh root@your-vps-ip
cd /opt/secureclaw

# Edit backend/.env
nano backend/.env
```

Add/Update these lines:

```env
# Existing config...
MONGODB_URI=mongodb://mongo:27017/secureclaw
PORT=3001
JWT_SECRET=your-jwt-secret-here

# Add Razorpay config
RAZORPAY_KEY_ID=rzp_test_your_key_here          # Test mode
# RAZORPAY_KEY_ID=rzp_live_your_key_here       # Production mode
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

### Restart Backend

```bash
# Restart API to apply changes
cd /opt/secureclaw
docker-compose -f docker-compose.prod.yml restart api

# Check logs
docker-compose -f docker-compose.prod.yml logs -f api
```

Expected log:
```
🚀 SecureClaw API running
💳 Razorpay Payments: Configured
💰 Currency: INR (Indian Rupees)
```

---

## 💰 Step 4: Pricing Plans

**All plans in INR (₹):**

| Plan | Price | Duration | Agents | Features |
|------|-------|----------|--------|----------|
| **Starter** | FREE | Forever | 1 | Basic AI, 512MB RAM |
| **Starter Pro** | ₹99 | 1 month | 3 | Advanced AI, 1GB RAM |
| **Pro** | ₹249 | 1 month | 10 | All AI, 2GB RAM |
| **Business** | ₹699 | 1 month | Unlimited | API access |
| **Annual Pro** | ₹2499 | 12 months | 10 | Save 58% |

**Configure plans in:** `backend/server.js` (lines 110-150)

---

## 🧪 Step 5: Test Payments

### Test Payment Flow

1. Go to: `https://yourdomain.com/pricing`
2. Select any paid plan (e.g., Starter Pro ₹99)
3. Click "Buy Now"
4. Razorpay checkout opens
5. Choose payment method (UPI/Card/Netbanking)
6. Use test card for testing:

**Test Card Number:** `4242 4242 4242 4242`
**Expiry:** Any future date
**CVV:** Any 3 digits
**Name:** Any name

### Payment Status

After payment, check logs:

```bash
# View payment verification logs
docker logs $(docker ps -q -f name=api) | tail -50
```

Expected messages:
```
Order created: order_xxxxxxxxx
Payment verified successfully
User plan updated to: starter_pro
```

---

## 🌐 Step 6: Production (Go Live)

### Before Going Live

1. ✅ Razorpay account verified (24-48h after submission)
2. ✅ Production API keys obtained
3. ✅ Bank account linked
4. ✅ Test payments successful
5. ✅ Webhook configured (recommended)

### Switch to Production

```bash
# Update .env with production keys
nano /opt/secureclaw/backend/.env

# Change from:
# RAZORPAY_KEY_ID=rzp_test_xxx
# To:
RAZORPAY_KEY_ID=rzp_live_xxx

# Save and restart
docker-compose -f docker-compose.prod.yml restart api
```

### Webhook Setup (Auto-payment reconciliation)

1. Go to: https://dashboard.razorpay.com/
2. Settings → Webhooks
3. Add webhook: `https://yourdomain.com/api/payment/webhook`
4. Webhook secret: Copy this secret
5. Add to `.env`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

Webhook endpoint handles:
- Payment success/failure notifications
- Refund notifications
- Dispute notifications

---

## 📊 Step 7: Monitor Payments

### View Transaction History

1. Login to Razorpay dashboard
2. Go to: Transactions → Payments
3. View all received payments
4. Filter by:
   - Date range
   - Payment status
   - Payment method (UPI, Card, etc.)

### Payouts

- **Daily payouts**: Money transferred to your bank account
- **Settlement time:** T+1 (next business day)
- **Minimum payout:** ₹500 (can be configured)
- **Bank transfers**: Automatic

### View Payouts

1. Go to: Transactions → Settlements
2. See all payouts and status
3. Download statements (Excel/PDF)

---

## 🔒 Security Best Practices

### 1. Protect API Keys

```bash
# Never commit secrets to Git
echo "RAZORPAY_KEY_ID" >> .gitignore
echo "RAZORPAY_KEY_SECRET" >> .gitignore

# Use environment variables only
# Never hardcode keys in code
```

### 2. Server-Side Verification

ALWAYS verify on server (never trust frontend):
```javascript
// ✅ Correct: Verify on backend
app.post('/api/payment/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
  // Verify signature here
})

// ❌ Wrong: Only verify in frontend (NOT SECURE!)
```

### 3. Use HTTPS

All payment operations must use HTTPS:
```nginx
# nginx configuration already includes HTTPS
# Let's Encrypt SSL is mandatory for payments
```

### 4. Payment Limits

Set daily transaction limits:
```javascript
// In Razorpay dashboard Settings
// Set maximum transaction amount
# Currently: No limit for testing
```

---

## 💵 Taxes & Compliance

### GST

- **18% GST** on service fees (Razorpay takes 2% + GST)
- If you have GSTIN, Razorpay shows GST compliant invoices
- If no GSTIN, user pays GST on top

### TDS

- **1% TDS** on payouts (for Indian businesses)
- Razorpay deducts and deposits with IT department
- Download TDS certificates from dashboard

### PAN & KYC

- **PAN number** mandatory for payouts >₹50,000
- Customer PAN collected for large transactions
- Aadhaar OTP for UPI payments

---

## 🆘 Troubleshooting

### Problem: Payment shows "Invalid signature"

**Fix:**
```bash
# Check if .env has correct secret
grep RAZORPAY_KEY_SECRET backend/.env

# Restart API
docker-compose -f docker-compose.prod.yml restart api
```

---

### Problem: Webhook not receiving updates

**Fix:**
1. Check webhook URL is public (not localhost)
2. Check webhook secret matches
3. Test webhook in Razorpay dashboard

---

### Problem: Test mode but money deducted?

**Fix:**
- This is impossible in test mode
- Verify you're using `rzp_test_` keys

---

### Problem: User says money deducted but not activated

**Fix:**
1. Check Razorpay status: Dashboard → Transactions → Payments
2. If status is "Captured" but system didn't activate:
   - Check backend logs
   - Manually verify payment:
   ```bash
   # Check database
   docker exec $(docker ps -q -f name=mongo) mongosh
   use secureclaw
   db.payments.find()
   ```

---

## 📞 Razorpay Support

- **Phone:** 1800-123-7421 (9AM-6PM, Monday-Saturday)
- **Email:** support@razorpay.com
- **Chat:** Dashboard → Support → Live Chat
- **Twitter:** @Razorpay

---

## 🎯 Next Steps

1. ✅ Create Razorpay account
2. ✅ Get API keys
3. ✅ Configure `.env` file
4. ✅ Test with test card
5. ✅ Verify webhooks work
6. ✅ Go live (after verification)

---

## 📊 Revenue Tracking

### View Daily Revenue

```javascript
// MongoDB query
db.payments.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" }
      },
      total: { $sum: "$amount" },
      count: { $sum: 1 }
    }
  }
])
```

### Export to Excel

1. Go to: Transactions → Payments
2. Set date range
3. Click "Export" → Download

---

## ✅ Checklist

**Before Launch:**
- [ ] Razorpay account created
- [ ] Email & phone verified
- [ ] KYC documents uploaded
- [ ] Test API keys obtained
- [ ] `.env` configured
- [ ] Backend restarted
- [ ] Test payment successful
- [ ] Webhook endpoint working
- [ ] HTTPS enabled (SSL)
- [ ] Production keys ready

---

**Payment Setup Complete!** 💳

**Users can now:**
- Pay via UPI (Google Pay, PhonePe, Paytm)
- Pay via credit/debit cards
- Pay via netbanking
- Pay via wallets (Paytm, Amazon Pay)

**All in Indian Rupees (₹)!** 🇮🇳