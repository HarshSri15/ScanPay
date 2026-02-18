# 🛒 ScanPay — Offline-First In-Store Self Checkout

A full-stack mobile app for scanning products in-store, managing a cart offline, and paying via Razorpay.

---

## Project Structure

```
scanpay/
├── apps/
│   ├── backend/     ← Node.js + Express + MongoDB API
│   └── mobile/      ← React Native (Expo) app
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd apps/backend

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env
# Edit .env with your MongoDB URI, Razorpay keys, JWT secrets

# Make sure MongoDB is running locally
# brew services start mongodb-community  (macOS)

# Seed sample products
npm run seed

# Start the backend
npm run dev
```

Backend runs at: `http://localhost:3000`

---

### 2. Mobile App Setup

```bash
cd apps/mobile

# Install dependencies
npm install

# Update the API base URL in api/client.ts:
# - iOS Simulator: http://localhost:3000/api
# - Android Emulator: http://10.0.2.2:3000/api
# - Physical device: http://YOUR_LAN_IP:3000/api

# Start the Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 📦 Environment Variables (Backend)

Create `apps/backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/scanpay
JWT_SECRET=change_this_to_a_long_random_string
RECEIPT_SECRET=another_long_random_string_for_receipts
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
PORT=3000
```

Get Razorpay test keys from: https://dashboard.razorpay.com/

---

## 🔑 Key Features

| Feature | Implementation |
|---|---|
| Barcode/QR scanning | `expo-camera` with `CameraView` |
| Offline cart | SQLite via `expo-sqlite` |
| Product catalog sync | Delta sync from backend on startup |
| OTP authentication | Phone + 4-digit OTP → JWT |
| Payment | Razorpay checkout (UPI, cards, wallets) |
| Receipt QR | Signed JWT encoded as QR, scanned at exit |
| Order history | Fetched from MongoDB, shown with receipt QR |

---

## 🧪 Testing the App

### Testing Barcode Scanning
The seeded products have these barcodes:
- `8714234567890` → Striped Cotton T-Shirt (H&M)
- `8714234567891` → Slim Fit Chinos (Zara)
- `8714234567892` → Denim Jacket (Levis)
- `8714234567893` → Basic White Tee (Uniqlo)
- `8714234567894` → Running Shoes (Nike)
- `8714234567895` → Noise Cancelling Headphones (Sony)

Print or display these barcodes from a barcode generator site.

### Article Numbers (for manual entry):
- 87492, 33821, 55402, 11293, 99201, 123456

### OTP Testing
In development, the OTP is logged to the backend console. Check your terminal for `📱 OTP for XXXXXXXXXX: XXXX`.

---

## 🔧 Enabling Real Razorpay Payments

1. Get API keys from https://dashboard.razorpay.com/
2. Add to `apps/backend/.env`
3. In `apps/mobile/app/checkout.tsx`:
   - Install: `npm install react-native-razorpay`
   - Uncomment the `RazorpayCheckout.open(...)` block
   - Remove the "TEMPORARY simulate payment" block

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/send-otp | No | Send OTP to phone |
| POST | /api/auth/verify-otp | No | Verify OTP, get JWT |
| GET | /api/products/catalog | No | Full/delta product catalog |
| GET | /api/products/lookup | No | Lookup by barcode/articleNo/QR |
| POST | /api/payments/create-order | Yes | Validate cart + create Razorpay order |
| POST | /api/payments/verify | Yes | Verify payment signature |
| POST | /api/payments/verify-receipt | No | Validate exit gate QR |
| GET | /api/orders | Yes | Get user's orders |
| GET | /api/orders/:id | Yes | Get single order |
