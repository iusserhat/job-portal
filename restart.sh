#!/bin/bash

# Mevcut dizini kaydet
ORIGINAL_DIR=$(pwd)

# Node.js süreçlerini durdur
echo "Çalışan Node.js süreçleri durduruluyor..."
pkill -f "npm run dev" || true

# Sunucuyu başlat
echo "Server başlatılıyor..."
cd "${ORIGINAL_DIR}/server" && npm run dev &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# 5 saniye bekle
echo "5 saniye bekleniyor..."
sleep 5

# Client'ı başlat
echo "Client başlatılıyor..."
cd "${ORIGINAL_DIR}/client" && npm run dev &
CLIENT_PID=$!
echo "Client PID: $CLIENT_PID"

echo "Uygulamalar başlatıldı!"
echo "Çıkış yapmak için CTRL+C tuşlarına basın..."

# CTRL+C basıldığında süreçleri sonlandır
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait 