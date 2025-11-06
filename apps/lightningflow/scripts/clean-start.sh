#!/bin/bash

echo "🧹 Cleaning .next and cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 Starting development server..."
npm run dev 