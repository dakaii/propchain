# Quick Start Guide - PropChain

## 🚀 Hackathon Demo Setup

### Prerequisites
- Node.js v18+ installed
- npm installed

### One-Command Start
```bash
./start.sh
```

This will:
1. Install all dependencies
2. Set up SQLite database
3. Seed demo data
4. Start both backend and frontend

### Manual Start (if script doesn't work)

#### Backend:
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend (new terminal):
```bash
cd frontend
npm install
npm run dev
```

## 📱 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

## 🔑 Demo Accounts

| Account Type | Email | Password |
|-------------|-------|----------|
| Demo User | demo@fractional.property | demo123 |
| Admin | admin@fractional.property | demo123 |

## 🏠 Demo Properties

The platform comes pre-loaded with 4 sample properties:
1. **Luxury Miami Beach Condo** - $50/share
2. **Downtown Austin Office Space** - $50/share
3. **Brooklyn Brownstone** - $50/share
4. **San Francisco Retail Complex** - Fully Funded

## 💡 Key Features to Demo

### 1. User Registration
- No crypto wallet required (mock addresses generated automatically)
- Instant account creation

### 2. Property Investment Flow
- Browse available properties
- View detailed property metrics
- Place buy orders (simulated Yellow Network state channels)
- Instant order matching

### 3. Yellow Network Integration (Simulated)
- Mock state channels for instant trading
- Off-chain order processing
- Gasless transactions
- Periodic settlement simulation

### 4. Portfolio Management
- View holdings
- Track investment performance
- Order history

## 🛠 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues
```bash
cd backend
rm database.sqlite
npm run migration:up
```

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf backend/node_modules frontend/node_modules
cd backend && npm install
cd ../frontend && npm install
```

## 📊 Architecture Highlights

- **Backend**: NestJS + MikroORM + SQLite
- **Frontend**: Vue 3 + Pinia + Tailwind CSS v4
- **Yellow Integration**: Mock SDK for state channels (ERC-7824)
- **No External Dependencies**: No Docker, Redis, or PostgreSQL required

## 🎯 Hackathon Talking Points

1. **Instant Settlement**: Yellow Network state channels enable near-instant property trading
2. **Low Barrier Entry**: $50 minimum investment democratizes real estate
3. **Gasless Trading**: Off-chain order matching reduces costs
4. **Mock Implementation**: Fully functional demo without real blockchain/wallet requirements
5. **Scalable Architecture**: Ready for production Yellow SDK integration