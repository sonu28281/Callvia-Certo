#!/bin/bash

# Callvia Certo - Quick Start Script
# Run this when you're on your laptop: bash start.sh

set -e

echo "🚀 Callvia Certo - Starting Setup..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "✅ Dependencies installed!"
echo ""

# Start backend
echo "🔥 Starting backend server..."
echo "   Server will run on http://localhost:3000"
echo ""
echo "📝 Press Ctrl+C to stop the server"
echo ""

cd apps/backend
pnpm dev
