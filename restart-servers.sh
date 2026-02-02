#!/bin/bash
echo "🔄 Restarting servers..."

# Kill existing processes
pkill -f "tsx.*apps/backend" || true
pkill -f "vite" || true

sleep 2

echo "🚀 Starting backend..."
cd apps/backend && npm run dev > /tmp/backend.log 2>&1 &

echo "⏳ Waiting 5 seconds for backend..."
sleep 5

echo "🚀 Starting frontend..."
cd ../frontend && npm run dev > /tmp/frontend.log 2>&1 &

sleep 3

echo "✅ Servers restarted!"
echo ""
echo "📍 Backend: http://localhost:3000"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "💡 Open: http://localhost:5173/profile"
