#!/bin/bash
# Render Build Script - Handles workspace dependencies

set -e

echo "📦 Installing pnpm..."
npm install -g pnpm

echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

echo "📋 Copying workspace packages to backend..."
# Copy types
mkdir -p apps/backend/node_modules/@callvia-certo/types
cp -r packages/types/src apps/backend/node_modules/@callvia-certo/types/

# Copy constants  
mkdir -p apps/backend/node_modules/@callvia-certo/constants
cp -r packages/constants/src apps/backend/node_modules/@callvia-certo/constants/

echo "🔨 Building backend..."
cd apps/backend
pnpm build

echo "✅ Build complete!"
