@echo off
REM Скрипт автоматической сборки Android APK для RuStore (Windows)
chcp 65001 > nul

echo === 1. Установка зависимостей ===
call npm install

echo === 2. Сборка веб-приложения ===
call npm run build

echo === 3. Проверка Capacitor ===
if not exist "android" (
  echo Инициализация Android платформы...
  call npx cap add android
)

echo === 4. Синхронизация ассетов с Android проектом ===
call npx cap sync android

echo === 5. Сборка APK через Gradle ===
cd android
call gradlew.bat assembleRelease
cd ..

echo.
echo ==============================================================
echo [УСПЕХ] Релизный APK собран:
echo android\app\build\outputs\apk\release\app-release-unsigned.apk
echo ==============================================================
pause
