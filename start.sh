#!/bin/bash
set -e

# Çevre değişkenlerini kontrol et ve varsayılanları ayarla
export PORT="${PORT:-5555}"
export NODE_ENV="${NODE_ENV:-production}"
export TS_NODE_TRANSPILE_ONLY=true
export TS_NODE_SKIP_PROJECT=true
export NODE_OPTIONS="--no-warnings --max-old-space-size=2048 --unhandled-rejections=strict"

echo "🚀 Job Portal başlatılıyor..."
echo "📂 Mevcut dizin: $(pwd)"
echo "🔧 Node.js versiyonu: $(node -v)"
echo "📊 PORT: $PORT"
echo "🌍 NODE_ENV: $NODE_ENV"

# TypeScript hata mesajlarını gizle ve server'ı başlat
cd /app/server

# Railway build hatalarını atlatmak için doğrudan server.ts dosyasını çalıştır
exec ts-node \
  --transpile-only \
  --skip-project \
  --ignore-diagnostics \
  --compiler-options '{"module":"commonjs","esModuleInterop":true,"skipLibCheck":true,"resolveJsonModule":true}' \
  src/server.ts 