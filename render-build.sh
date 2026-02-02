#!/bin/bash
# Render Build Script - Handles workspace dependencies

set -e

echo "📦 Installing pnpm..."
npm install -g pnpm

echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

echo "� Building workspace packages..."
cd packages/types
pnpm build
cd ../constants
pnpm build
cd ../..

echo "📋 Removing symlinks and copying compiled packages..."
# Remove symlinks created by pnpm
rm -rf apps/backend/node_modules/@callvia-certo

# Copy compiled types package
mkdir -p apps/backend/node_modules/@callvia-certo/types
cp -r packages/types/dist apps/backend/node_modules/@callvia-certo/types/
cp packages/types/package.json apps/backend/node_modules/@callvia-certo/types/

# Copy compiled constants package
mkdir -p apps/backend/node_modules/@callvia-certo/constants
cp -r packages/constants/dist apps/backend/node_modules/@callvia-certo/constants/
cp packages/constants/package.json apps/backend/node_modules/@callvia-certo/constants/

echo "🔨 Building backend..."
cd apps/backend
pnpm build

echo "✅ Build complete!"
