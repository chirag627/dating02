# Dating02 - Companion Marketplace + Dating Platform

A production-ready full-stack platform combining a companion marketplace with dating-app style features.

## Tech Stack

- **Backend**: NestJS + MongoDB + Redis
- **Frontend**: Next.js 15 + Tailwind CSS
- **Real-time**: Socket.io (WebSockets)
- **Queue**: BullMQ + Redis
- **Storage**: Cloudinary
- **Payments**: Razorpay
- **Auth**: JWT (Access + Refresh tokens)
- **Email**: Nodemailer

## Architecture

```
dating02/
├── backend/          # NestJS API server
│   └── src/
│       ├── modules/
│       │   ├── auth/         # JWT auth, register, login, forgot/reset password
│       │   ├── users/        # User schema and CRUD
│       │   ├── profile/      # Profile management, AI compatibility
│       │   ├── companion/    # Companion listings
│       │   ├── booking/      # Booking workflow
│       │   ├── payment/      # Razorpay integration + escrow
│       │   ├── chat/         # WebSocket real-time chat
│       │   ├── review/       # Booking reviews
│       │   ├── notification/ # BullMQ async notifications
│       │   ├── admin/        # Admin dashboard
│       │   ├── media/        # Cloudinary file uploads
│       │   └── search/       # Geospatial MongoDB search
│       └── common/
│           ├── guards/       # JWT + Role guards
│           ├── interceptors/ # Logging + Transform + Exception filter
│           └── utils/        # Decorators
├── frontend/         # Next.js app
│   └── src/app/
│       ├── /             # Landing page
│       ├── /auth/login   # Login
│       ├── /auth/register # Register
│       ├── /onboarding   # Multi-step profile setup
│       ├── /dashboard    # User dashboard
│       ├── /search       # Discovery with filters
│       ├── /companion    # Companion marketplace
│       ├── /booking      # Booking management
│       ├── /chat         # Real-time messaging
│       └── /admin        # Admin panel
└── docker-compose.yml  # Production Docker setup
```

## Quick Start

### With Docker (Recommended)

```bash
# Copy environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Start all services
docker-compose up -d

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000/api
# Swagger Docs: http://localhost:4000/api/docs
```

### Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Swagger UI is available at: `http://localhost:4000/api/docs`

## Backend Modules

| Module | Features |
|--------|---------|
| **Auth** | Register, Login, JWT (access+refresh), Forgot/Reset password, Email verification |
| **Users** | Full user schema with lifestyle, preferences, gamification |
| **Profile** | Bio, photos (Cloudinary), location, AI compatibility scoring |
| **Companion** | Listing creation, pricing, skills, availability |
| **Booking** | Request → Accept/Reject → Complete workflow with concurrency checks |
| **Payment** | Razorpay orders, verification, escrow, refunds, webhooks |
| **Chat** | WebSocket real-time messaging, read receipts, conversation history |
| **Review** | Post-booking reviews with rating aggregation |
| **Notification** | BullMQ async queues for email/push notifications |
| **Admin** | User management, ban/unban, companion approval, dashboard stats |
| **Media** | Cloudinary image upload with validation and signed URLs |
| **Search** | MongoDB geospatial queries, age/gender/interest filters |

## Environment Variables

See `backend/.env.example` for all required environment variables.

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | Next.js app |
| backend | 4000 | NestJS API |
| mongo | 27017 | MongoDB |
| redis | 6379 | Redis (BullMQ + caching) |
