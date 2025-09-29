# 🏠 PropChain - Property Investment Platform

[![Built for Yellow Network Hackathon](https://img.shields.io/badge/Yellow%20Network-Hackathon%202025-yellow)](https://yellow.org)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.4-green)](https://vuejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)

A blockchain-powered platform for fractional real estate investment using Yellow Protocol's Nitrolite SDK for instant settlement via ERC-7824 state channels. Built for the Yellow Network Hackathon 2025.

## 📋 Prerequisites

- Node.js v20 (LTS) - see `.tool-versions`
- npm

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/dakaii/propchain.git
cd propchain

# Run the platform (installs deps, sets up DB, starts servers)
./start.sh
```

Then open:
- Frontend: http://localhost:5173
- API Docs: http://localhost:3000/api/docs

**Demo Login:** demo@fractional.property / demo123

## Overview

This platform enables users to:
- Buy fractional ownership in real estate properties starting from $50
- Receive automated rental income distributions
- Trade property tokens instantly via Yellow Protocol state channels
- Execute majority-led buyouts with smart contract automation
- Vote on property decisions based on ownership stake

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: SQLite with MikroORM
- **Blockchain**: Yellow Protocol for clearing/settlement
- **Smart Contracts**: ERC-20 tokens for property shares
- **Authentication**: JWT with Passport.js

### Frontend
- **Framework**: Vue 3 with TypeScript
- **State Management**: Pinia
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Blockchain Integration**: Web3 wallet connection

## Key Features

### 1. Fractional Investment
- Tokenized property ownership as ERC-20 tokens
- Minimum investment of $50
- Real-time portfolio tracking
- Automated cap table management

### 2. Instant Trading via Yellow Protocol
- Off-chain order book with state channels
- Near-instant settlement (seconds vs months)
- Reduced gas fees through batched on-chain settlements
- Collateralized channels for counterparty risk management

### 3. Income Distribution
- Automated rental income distribution via smart contracts
- Proportional to ownership percentage
- Monthly/quarterly distribution cycles
- Tax reporting integration

### 4. Governance & Buyouts
- Token-based voting rights
- Majority-triggered property sales
- Tender offers with premium pricing
- Squeeze-out provisions for minority holders

### 5. Compliance
- KYC/AML integration
- Transfer restrictions per jurisdiction
- Accredited investor verification
- SEC-compliant token structure

## Project Structure

```
fractional-property/
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── modules/   # Feature modules
│   │   ├── entities/  # MikroORM entities
│   │   ├── shared/    # Shared utilities
│   │   └── yellow/    # Yellow Protocol integration
│   └── migrations/
├── frontend/          # Vue 3 application
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/    # Pinia stores
│   │   └── services/  # API & blockchain services
├── contracts/         # Smart contracts
└── docs/             # Documentation
```

## Getting Started

### Prerequisites
- Node.js v18+
- pnpm or npm
- SQLite3

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend && npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```
4. Set up environment variables (see `.env.example`)
5. Run migrations:
   ```bash
   cd backend && npm run migration:up
   ```

### Development

Start backend:
```bash
cd backend && npm run start:dev
```

Start frontend:
```bash
cd frontend && npm run dev
```

## Environment Variables

See `.env.example` in both backend and frontend directories for required configuration.

## API Documentation

Once the backend is running, Swagger documentation is available at:
`http://localhost:3000/api/docs`

## License

UNLICENSED - Private repository

## Team

Hackathon project - September 2025