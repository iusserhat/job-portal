#!/bin/bash

# Çevre değişkenlerini kontrol et ve varsayılanları ayarla
export PORT="${PORT:-5555}"
export NODE_ENV="${NODE_ENV:-production}"
export TS_NODE_TRANSPILE_ONLY=true
export TS_NODE_SKIP_PROJECT=true
export NODE_OPTIONS="--no-warnings --max-old-space-size=2048"

echo "🚀 Job Portal başlatılıyor..."
echo "📂 Mevcut dizin: $(pwd)"
echo "🔧 Node.js versiyonu: $(node -v)"
echo "📊 PORT: $PORT"
echo "🌍 NODE_ENV: $NODE_ENV"

# TypeScript hata mesajlarını gizle
cd /app/server
ts-node --transpile-only --skip-project src/server.ts 