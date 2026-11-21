#!/usr/bin/env bash
# Скрипт автоматической сборки Android APK для RuStore
set -e

echo "=== 1. Установка зависимостей ==="
npm install

echo "=== 2. Сборка веб-приложения ==="
npm run build

echo "=== 3. Проверка Capacitor ==="
if [ ! -d "android" ]; then
  echo "Инициализация Android платформы..."
  npx cap add android
fi

echo "=== 4. Синхронизация ассетов с Android проектом ==="
npx cap sync android

echo "=== 5. Сборка APK через Gradle ==="
cd android
./gradlew assembleRelease

echo ""
echo "✅ ГОТОВО! Релизный APK собран:"
echo "Путь: android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo "Теперь подпишите его ключом (apksigner) и загружайте в RuStore Консоль."
