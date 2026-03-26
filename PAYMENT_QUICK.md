# 💰 UPI Payment Quick Guide (5 Minutes)

**Setup Razorpay payments for SecureClaw - No credit card needed!**

---

## 🚀 What You Get

- ✅ **UPI Payments**: Google Pay, PhonePe, Paytm, BHIM
- ✅ **Card Payments**: All credit/debit cards
- ✅ **Netbanking**: All Indian banks
- ✅ **Wallets**: Paytm, Amazon Pay, Freecharge
- ✅ **EMI**: Card EMI options
- ✅ **All in INR**: Rupees (₹)

---

## 📋 Pricing Plans (India)

| Plan | Price | Agents | Duration |
|------|-------|--------|----------|
| Starter | FREE | 1 | Forever |
| Starter Pro | **₹99** | 3 | 1 month |
| Pro | **₹249** | 10 | 1 month |
| Business | **₹699** | Unlimited | 1 month |
| Annual Pro | **₹2499** | 10 | 1 year |
| *(Save 58%)* | | | |

---

## ⚡ Setup in 5 Minutes

### 1. Create Razorpay Account (2 minutes)
```
1. Go to: https://razorpay.com/
2. Sign up with email & phone
3. Verify email & phone via OTP
4. Done! Test mode enabled automatically
```

### 2. Get API Keys (1 minute)
```
1. Login: https://dashboard.razorpay.com/
2. Go to: Settings → API Keys
3. Copy:
   - Key ID: rzp_test_xxxxxxxxx
   - Key Secret: Click "View" → Copy
```

### 3. Configure SecureClaw (2 minutes)
```bash
# SSH into VPS
ssh root@your-vps-ip
cd /opt/secureclaw

# Edit backend/.env
nano backend/.env

# Add these lines:
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_key_here

# Save: Ctrl+O, Enter, Ctrl+X

# Restart backend
docker-compose -f docker-compose.prod.yml restart api
```

### 4. Test Payment (Instant)
```
1. Visit: https://yourdomain.com/pricing
2. Select: Starter Pro (₹99)
3. Click: "Buy Now"
4. Pay via any method (UPI, Card, etc.)
5. Use test card: 4242 4242 4242 4242

✅ Payment successful!
```

---

## ✅ Done!

**Users can now:**
- Pay via UPI (Google Pay, PhonePe, Paytm) from mobile
- Pay via cards (credit/debit)
- Pay via netbanking
- Pay via wallets
- Pay via EMI (on cards)

**All in Indian Rupees (₹)!** 🇮🇳

---

## 🔗 Full Documentation

**Complete Guide:** `PAYMENT_SETUP.md`

**Includes:**
- Step-by-step setup
- Production deployment
- Webhook configuration
- Tax compliance (GST/TDS)
- Troubleshooting guide
- Revenue tracking

---

## 📞 Support

- **Razorpay Support**: 1800-123-7421 (9AM-6PM)
- **Email**: support@razorpay.com
- **Chat**: Dashboard → Support → Live Chat

---

## 💰 Payouts

- **Settlement**: T+1 (next business day)
- **Transfer**: Auto to your bank account
- **Minimum**: ₹500 per settlement

---

**Setup complete! Payment integration working!** 🎉