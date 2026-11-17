# RideWala 🏍️ — Your Ride. Your Way.

A full-stack **bike taxi booking platform** for India, built with React, Node.js, MongoDB, and Socket.IO. Inspired by platforms like Rapido, RideWala connects customers with nearby riders for fast, affordable two-wheeler rides.

---

## 🌟 Features

### 👤 Customer App (`/frontend`)
- Register / Login with JWT authentication
- Book a ride with pickup & destination address
- Real-time rider location tracking on Google Maps
- Fare estimation before booking
- Multiple payment options: **Cash** or **Razorpay (Online)**
- Live ride status updates (Searching → Assigned → Arriving → Ride Started → Completed)
- Ride history with receipts
- Rate & review riders after trip
- Manage saved addresses
- File complaints for a ride

### 🏍️ Rider App (`/rider-app`)
- Register with vehicle & licence details
- Toggle online/offline availability
- Accept or reject ride requests in real-time
- Navigate to pickup using Google Maps
- Start and complete rides
- View earnings and ride history
- Manage profile and documents

### 🛡️ Admin Dashboard (`/admin-dashboard`)
- Secure admin login
- Approve / reject rider onboarding
- Monitor all active rides in real time
- Manage users, riders, and vehicles
- Configure pricing (base fare, per-km charge, commission %)
- View revenue, commission, and analytics
- Manage and resolve customer complaints
- Broadcast notifications

### ⚡ Platform Capabilities
- Real-time bi-directional communication via **Socket.IO**
- Geolocation & route mapping via **Google Maps JavaScript API**
- Secure payments via **Razorpay**
- Image & document uploads via **Cloudinary**
- Role-based access control (Customer / Rider / Admin)
- Rate limiting and helmet-based security headers

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Customer Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Rider Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Admin Dashboard** | React 18, Vite, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | Socket.IO |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Maps** | Google Maps JavaScript API, Directions API, Geocoding API |
| **Payments** | Razorpay (Orders API + Webhooks) |
| **File Uploads** | Cloudinary, Multer |
| **Email** | Nodemailer (SMTP) |
| **Security** | Helmet, express-rate-limit, CORS |
| **Deployment** | Render (Backend), Vercel (Frontends) |

---

## 📁 Project Structure

```
ridewala/
├── backend/                    # Node.js / Express API server
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Route handler logic
│   │   ├── authController.js
│   │   ├── rideController.js
│   │   ├── riderController.js
│   │   ├── adminController.js
│   │   ├── paymentController.js
│   │   ├── ratingController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── roles.js            # Role-based guards
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── upload.js           # Multer + Cloudinary
│   │   └── rateLimiter.js      # Request throttling
│   ├── models/
│   │   ├── User.js             # Customer model
│   │   ├── Rider.js            # Rider model (with geo index)
│   │   ├── Admin.js
│   │   ├── Ride.js
│   │   ├── Payment.js
│   │   ├── Rating.js
│   │   ├── Notification.js
│   │   ├── Complaint.js
│   │   ├── Vehicle.js
│   │   └── PricingSettings.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── rideRoutes.js
│   │   ├── riderRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   └── fareCalculation.js  # Fare & commission logic
│   ├── sockets/
│   │   └── socketHandler.js    # Socket.IO event handlers
│   ├── utils/
│   │   ├── helpers.js          # JWT generation, pagination
│   │   ├── validators.js       # express-validator chains
│   │   ├── seedAdmin.js        # One-time admin seeder
│   │   └── seedPricing.js      # One-time pricing seeder
│   ├── uploads/                # Local upload buffer (gitignored)
│   │   └── .gitkeep
│   ├── .env                    # Backend environment variables
│   ├── package.json
│   └── server.js               # App entry point
│
├── frontend/                   # Customer React App
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── context/            # React Context (Auth, Socket, Ride)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # Axios API service layer
│   │   └── utils/              # Utility functions
│   ├── .env
│   └── package.json
│
├── rider-app/                  # Rider React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── services/
│   ├── .env
│   └── package.json
│
├── admin-dashboard/            # Admin React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   ├── .env
│   └── package.json
│
├── .gitignore
├── docker-compose.yml          # Local dev with MongoDB
├── start-dev.bat               # Windows one-click dev startup
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version / Notes |
|---|---|
| Node.js | v18 or higher |
| npm | v9 or higher |
| MongoDB | Atlas account **or** local MongoDB 7+ |
| Google Maps | API key with Maps JS, Directions, Geocoding APIs enabled |
| Razorpay | Account (test mode is fine) |
| Cloudinary | Free account for media uploads |

---

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ridewala.git
cd ridewala
```

#### 2. Setup Backend

```bash
cd backend
npm install
copy .env.example .env     # Windows
# cp .env.example .env     # Mac/Linux
# Edit .env and fill in all values (see Environment Variables below)
```

#### 3. Setup Customer Frontend

```bash
cd ../frontend
npm install
copy .env.example .env
# Edit VITE_API_URL, VITE_GOOGLE_MAPS_API_KEY, VITE_RAZORPAY_KEY_ID
```

#### 4. Setup Rider App

```bash
cd ../rider-app
npm install
copy .env.example .env
# Edit VITE_API_URL, VITE_RAZORPAY_KEY_ID
```

#### 5. Setup Admin Dashboard

```bash
cd ../admin-dashboard
npm install
copy .env.example .env
# Edit VITE_API_URL
```

#### 6. Seed the Database

```bash
# From ridewala/ root:
node backend/utils/seedAdmin.js    # Creates admin@ridewala.in / Admin@12345
node backend/utils/seedPricing.js  # Seeds default pricing settings
```

#### 7. Start All Services

**Windows (one click):**
```
Double-click start-dev.bat
```

**Manual:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd rider-app && npm run dev -- --port 5174

# Terminal 4
cd admin-dashboard && npm run dev -- --port 5175
```

| Service | URL |
|---|---|
| Backend API | http://localhost:5000 |
| Customer App | http://localhost:5173 |
| Rider App | http://localhost:5174 |
| Admin Dashboard | http://localhost:5175 |

---

## 🔧 Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ridewala` |
| `JWT_SECRET` | Secret for signing JWTs (keep private!) | `a_long_random_string` |
| `JWT_EXPIRE` | JWT expiry duration | `7d` |
| `RAZORPAY_KEY_ID` | Razorpay public key | `rzp_test_xxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | `xxxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | `xxxx` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `mycloudname` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `xxxx` |
| `FRONTEND_URL` | Customer frontend origin (for CORS) | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (`http://localhost:5000`) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (same as backend) |
| `VITE_SOCKET_URL` | Socket.IO server URL |

### `rider-app/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL |
| `VITE_SOCKET_URL` | Socket.IO server URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key |

### `admin-dashboard/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL |

---

## 📡 API Documentation

> Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register a new customer |
| POST | `/auth/login` | None | Customer login → returns JWT |
| POST | `/auth/rider/register` | None | Register a new rider |
| POST | `/auth/rider/login` | None | Rider login → returns JWT |
| POST | `/auth/admin/login` | None | Admin login → returns JWT |
| GET | `/auth/me` | Customer JWT | Get current customer profile |
| GET | `/auth/rider/me` | Rider JWT | Get current rider profile |

### Rides

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/rides/book` | Customer | Book a new ride (pickup, destination, paymentMethod) |
| GET | `/rides/my` | Customer | Get customer's ride history |
| GET | `/rides/:id` | Customer/Rider | Get single ride details |
| PATCH | `/rides/:id/cancel` | Customer | Cancel a pending ride |
| POST | `/rides/estimate` | Customer | Estimate fare for a route |
| PATCH | `/rides/:id/accept` | Rider | Accept an assigned ride |
| PATCH | `/rides/:id/start` | Rider | Start the ride |
| PATCH | `/rides/:id/complete` | Rider | Complete the ride |
| GET | `/rides/rider/my` | Rider | Rider's ride history |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/create-order` | Customer | Create Razorpay order for a ride |
| POST | `/payments/verify` | Customer | Verify Razorpay payment signature |
| POST | `/payments/webhook` | None (Razorpay) | Razorpay webhook handler |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/riders` | Admin | List all riders (with approval status) |
| PATCH | `/admin/riders/:id/approve` | Admin | Approve a rider |
| PATCH | `/admin/riders/:id/reject` | Admin | Reject a rider |
| GET | `/admin/rides` | Admin | All rides with filters |
| GET | `/admin/users` | Admin | All customers |
| GET | `/admin/stats` | Admin | Platform analytics |
| GET | `/admin/pricing` | Admin | Current pricing settings |
| PUT | `/admin/pricing` | Admin | Update pricing settings |
| GET | `/admin/complaints` | Admin | All complaints |
| PATCH | `/admin/complaints/:id` | Admin | Update complaint status |

### Ratings & Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ratings` | Customer | Rate a completed ride |
| GET | `/notifications` | Any | Get user notifications |
| PATCH | `/notifications/:id/read` | Any | Mark notification as read |

---

## 🗺️ Maps Integration

### Setting up Google Maps

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the following APIs:
   - **Maps JavaScript API** — renders the interactive map
   - **Directions API** — calculates routes between pickup and destination
   - **Geocoding API** — converts addresses to lat/lng and vice versa
   - **Places API** (optional) — autocomplete address search
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Restrict the key to your domain in production

### Usage in the app
- Customer app: displays map with pickup/destination pins and live rider location
- Rider app: navigation overlay from current position to pickup
- Fare estimation uses straight-line distance (Haversine) for speed; routing uses Directions API for display

---

## 💳 Payment Integration (Razorpay)

### Setup

1. Sign up at [Razorpay](https://razorpay.com) and get your **Test Key ID** and **Key Secret**
2. Add them to `backend/.env` and `frontend/.env`
3. For webhooks: go to Razorpay Dashboard → Webhooks → Add `https://your-backend.onrender.com/api/payments/webhook`
4. Set a webhook secret and add it as `RAZORPAY_WEBHOOK_SECRET`

### Payment Flow

```
Customer selects "Pay Online"
  → POST /api/payments/create-order  (backend creates Razorpay order)
  → Razorpay checkout opens in browser
  → Customer pays
  → POST /api/payments/verify  (backend verifies HMAC signature)
  → Ride marked as paid, rider earnings calculated
```

### Test Cards

| Card Number | Expiry | CVV | Result |
|---|---|---|---|
| 4111 1111 1111 1111 | Any future | Any | Success |
| 5267 3181 8797 5449 | Any future | Any | Success |

Use UPI ID `success@razorpay` for test UPI payments.

---

## 🔐 Security

| Mechanism | Implementation |
|---|---|
| **Authentication** | JWT Bearer tokens, 7-day expiry |
| **Password hashing** | bcryptjs with salt rounds = 12 |
| **Role separation** | Separate token payloads and middleware guards per role |
| **Payment verification** | HMAC-SHA256 signature check on every payment callback |
| **CORS** | Whitelist of allowed origins via `cors` middleware |
| **Rate limiting** | Auth: 15 req/15 min · API: 100 req/15 min |
| **HTTP headers** | `helmet` sets X-Frame-Options, CSP, HSTS, etc. |
| **Input validation** | `express-validator` on all write endpoints |

---

## 🧪 Testing Workflows

### 1. Customer Books a Ride
1. Register as a customer at http://localhost:5173/register
2. Enter pickup and destination addresses
3. Click **Estimate Fare**
4. Click **Book Ride** — status becomes *Searching*
5. Watch status update to *Assigned* when a rider accepts

### 2. Rider Accepts a Ride
1. Register as a rider at http://localhost:5174/register (requires admin approval)
2. Admin approves rider at http://localhost:5175
3. Rider logs in, goes **Online**
4. When a ride request appears, click **Accept**
5. Navigate to pickup, click **Start Ride**, then **Complete Ride**

### 3. Admin Approves a Rider
1. Login at http://localhost:5175 with `admin@ridewala.in` / `Admin@12345`
2. Go to **Riders** → find pending riders
3. Click **Approve**

### 4. Online Payment
1. Book a ride, select **Pay Online**
2. After ride completes, Razorpay checkout appears
3. Use test card `4111 1111 1111 1111` to pay

---

## 🚢 Deployment

### Backend on Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Set **Root Directory**: `backend`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `node server.js`
7. Add all environment variables from `backend/.env`
8. Deploy — Render provides a `https://your-app.onrender.com` URL

### Customer Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add environment variables:
   - `VITE_API_URL` = your Render backend URL
   - `VITE_GOOGLE_MAPS_API_KEY` = your Google Maps key
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay key
   - `VITE_SOCKET_URL` = your Render backend URL
7. Deploy

### Rider App on Vercel

Repeat the same steps as Customer Frontend but with **Root Directory**: `rider-app`

### Admin Dashboard on Vercel

Repeat with **Root Directory**: `admin-dashboard` and add `VITE_API_URL`

> **Note**: After deployment, update `FRONTEND_URL` in backend env variables to include all deployed frontend origins, so CORS allows them.

---

## 📋 TODO / Pending Integrations

Before going live, obtain and configure:

| Integration | Env Variable(s) | Required For |
|---|---|---|
| **Google Maps API key** | `VITE_GOOGLE_MAPS_API_KEY` | Live map display, geocoding, routing |
| **Razorpay credentials** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Online payments |
| **Cloudinary credentials** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Profile photos, licence/vehicle image uploads |
| **SMTP credentials** | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Email notifications (booking confirmation, OTP) |
| **MongoDB Atlas URI** | `MONGODB_URI` | Production database |

---

## 🎯 Future Improvements

1. **OTP-based login** — Replace password with SMS OTP via Twilio or MSG91
2. **Surge pricing** — Dynamic fare multiplier during peak hours
3. **Scheduled rides** — Book a ride for a future time
4. **Referral & rewards system** — Promo codes and referral credits
5. **In-app chat** — Customer ↔ Rider chat during active ride
6. **Multi-language support** — Hindi, Tamil, Telugu, Bengali via i18next
7. **SOS / Safety feature** — One-tap emergency alert with live location sharing
8. **Driver earnings wallet** — Weekly payouts, UPI transfer integration
9. **Vehicle pooling** — Shared rides for cost savings
10. **PWA support** — Make customer and rider apps installable as Progressive Web Apps
11. **Push notifications** — FCM-based native push notifications (mobile)
12. **Analytics dashboard** — Enhanced charts, heatmaps, and revenue forecasting
13. **Subscription plans** — Monthly pass for frequent riders

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ for the Indian commuter.*
