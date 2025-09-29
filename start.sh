#!/bin/bash

echo "🚀 Starting Fractional Property Investment Platform"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Please stop the existing service."
        return 1
    fi
    return 0
}

# Check required ports
echo "Checking ports..."
check_port 3000 || exit 1
check_port 5173 || exit 1

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install

# Run migrations and seed data
echo -e "${BLUE}🗄️  Setting up database...${NC}"
npx mikro-orm migration:create --initial 2>/dev/null || true
npx mikro-orm migration:up || true

# Seed the database using MikroORM's native seeder
echo -e "${BLUE}🌱 Seeding demo data...${NC}"
npx mikro-orm seeder:run || true

# Start backend in background
echo -e "${GREEN}🔧 Starting backend server...${NC}"
npm run start:dev &
BACKEND_PID=$!

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install

# Start frontend
echo -e "${GREEN}🎨 Starting frontend server...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for servers to start
sleep 5

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Platform is running!${NC}"
echo ""
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:3000/api"
echo "📚 API Docs: http://localhost:3000/api/docs"
echo ""
echo -e "${YELLOW}Demo Accounts:${NC}"
echo "  User: demo@fractional.property / Password: demo123"
echo "  Admin: admin@fractional.property / Password: demo123"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on Ctrl+C
trap cleanup INT

# Wait for processes
wait