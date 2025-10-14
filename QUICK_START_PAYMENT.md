# 🚀 Quick Start Guide - Payment Gateway

## Prerequisites Check
- ✅ Node.js installed
- ✅ MongoDB running
- ✅ Backend and Frontend servers

---

## ⚡ 3-Minute Setup

### 1️⃣ Backend Environment Setup

Create `Server/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/smart-waste-management
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

### 2️⃣ Frontend Environment Setup

Create `client/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3️⃣ Install & Run

**Terminal 1 - Backend:**
```bash
cd Server
npm install
node server.js
```
✅ Should see: `🚀 Server running at http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm start
```
✅ Should open: `http://localhost:3000`

---

## 🎯 Test Payment Gateway

### Quick Test Steps:

1. **Login** to your app at `http://localhost:3000`
   
2. **Schedule a collection:**
   - Navigate to "Special Waste Collection" or scheduling page
   - Fill in the form with waste details
   - Choose date and time
   - Submit

3. **View Collection Summary:**
   - You'll be redirected to summary page
   - You'll see all collection details
   - **NEW**: Button now says "Proceed to Payment" instead of "Confirm Booking"

4. **Click "Proceed to Payment":**
   - 🎊 Payment modal opens!
   - See 4 payment options
   - Beautiful UI with icons

5. **Test Card Payment:**
   ```
   Card Number: 1234567890123456
   Name: Test User
   Expiry: 12/25
   CVV: 123
   ```
   - Click "Pay Rs. [amount]"
   - Wait for processing (2-3 seconds)
   - See success message!

6. **Verify:**
   - Collection status changes to "confirmed"
   - Payment record created in database
   - Transaction ID generated
   - Redirected to collections page

---

## 🎨 What You'll See

### Collection Summary Page
![image](https://github.com/user-attachments/assets/placeholder)

The button changed from **"Confirm Booking"** → **"Proceed to Payment"** ✅

### Payment Modal
When you click "Proceed to Payment", you'll see:

- **Header**: "🔒 Secure Payment"
- **Amount Card**: Shows total and collection ID
- **4 Payment Options**:
  - 💳 Credit/Debit Card
  - 📱 Mobile Money (JazzCash, Easypaisa, etc.)
  - 💵 Cash on Collection
  - 🏦 Bank Transfer

- **Payment Form**: Changes based on selected method
- **Action Buttons**: Cancel / Pay

### Success Screen
- ✅ Green success message
- Transaction ID displayed
- Auto-redirect after 2 seconds

---

## 📱 Mobile Money Test

1. Click "Mobile Money"
2. Select provider (JazzCash/Easypaisa)
3. Enter phone: `03001234567`
4. Click Pay
5. See success message

---

## 💵 Cash Payment Test

1. Click "Cash on Collection"
2. See payment instructions
3. Click Pay
4. Booking confirmed (payment pending)
5. Collector will collect cash during pickup

---

## 🏦 Bank Transfer Test

1. Click "Bank Transfer"  
2. See bank account details
3. Click Pay
4. Booking confirmed (payment pending)
5. Complete bank transfer manually

---

## 🔍 Check Database

### View Payment Records
```javascript
// In MongoDB Compass or Shell
db.payments.find().pretty()

// You should see:
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  collectionRequestId: ObjectId("..."),
  amount: 500,
  paymentMethod: "card",
  paymentStatus: "completed",
  transactionId: "TXN-1729000000-1234",
  invoiceNumber: "INV-1729000000-567",
  cardDetails: {
    lastFourDigits: "3456",
    cardType: "visa"
  },
  paidAt: ISODate("..."),
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### View Updated Collection
```javascript
db.collectionrequests.find({ status: "confirmed" }).pretty()

// Status should be "confirmed" after payment
```

---

## 🔧 API Testing (Optional)

### Using Postman/Thunder Client:

**1. Get Auth Token:**
```
POST http://localhost:5000/api/auth/login
Body: { "email": "user@email.com", "password": "password" }
Response: { "token": "eyJhbGc..." }
```

**2. Initiate Payment:**
```
POST http://localhost:5000/api/payments/initiate
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: {
  "collectionRequestId": "collection_id_here",
  "amount": 500,
  "paymentMethod": "card"
}
```

**3. Process Payment:**
```
POST http://localhost:5000/api/payments/PAYMENT_ID/process
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: {
  "cardDetails": {
    "cardNumber": "1234567890123456",
    "cardHolderName": "John Doe",
    "expiryDate": "12/25",
    "cvv": "123",
    "cardType": "visa"
  }
}
```

---

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can login successfully
- [ ] Can schedule collection
- [ ] See "Proceed to Payment" button
- [ ] Payment modal opens
- [ ] Can enter card details
- [ ] Payment processes successfully
- [ ] See success message
- [ ] Collection status becomes "confirmed"
- [ ] Payment record in database

---

## 🐛 Troubleshooting

### Payment Modal Doesn't Open
```bash
# Check browser console (F12)
# Look for errors related to PaymentModal

# Solution: Clear cache and reload
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Backend API Not Found
```bash
# Check .env file in client folder
REACT_APP_API_URL=http://localhost:5000/api

# Restart frontend server after adding .env
npm start
```

### Payment Processing Fails
```bash
# Check backend server logs
# Ensure MongoDB is running
# Verify JWT token is valid
```

### Card Validation Errors
- Card Number: Must be exactly 16 digits
- Expiry: Format MM/YY (e.g., 12/25)
- CVV: 3-4 digits
- Name: Required

---

## 🎯 Expected Behavior

### Before This Implementation
```
Schedule → Summary → Click "Confirm Booking" → Confirmed (No Payment)
```

### After This Implementation  
```
Schedule → Summary → Click "Proceed to Payment" → Payment Modal Opens
→ Enter Payment Details → Process Payment → Success → Confirmed
```

---

## 📞 Still Need Help?

1. **Check Console Logs**: Press F12 in browser
2. **Check Server Logs**: Look at terminal running backend
3. **Verify Network Calls**: F12 → Network tab
4. **Check Database**: Use MongoDB Compass

---

## 🎉 Congratulations!

You now have a fully functional payment gateway integrated into your waste management system!

**Test it now:**
1. Open `http://localhost:3000`
2. Schedule a collection
3. Click "Proceed to Payment"
4. Complete payment
5. 🎊 Done!

---

**Need more features?** Check `PAYMENT_GATEWAY_IMPLEMENTATION.md` for:
- Detailed API documentation
- Security features
- Production deployment guide
- Future enhancement ideas

