#!/bin/bash
# Render Build Script - Handles workspace dependencies

set -e

echo "📦 Installing pnpm..."
npm install -g pnpm

echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

echo "📋 Removing symlinks and copying actual packages..."
# Remove symlinks created by pnpm
rm -rf apps/backend/node_modules/@callvia-certo

# Copy types with actual content
mkdir -p apps/backend/node_modules/@callvia-certo/types
cp -r packages/types/* apps/backend/node_modules/@callvia-certo/types/

# Copy constants with actual content
mkdir -p apps/backend/node_modules/@callvia-certo/constants
cp -r packages/constants/* apps/backend/node_modules/@callvia-certo/constants/

echo "🔨 Building backend..."
cd apps/backend
pnpm build

echo "✅ Build complete!"
