import React, { useState } from 'react';
import { 
  Smartphone, Terminal, Key, FileText, CheckCircle2, Copy, Check, 
  X, Download, ExternalLink, ArrowRight, ShieldCheck, Sparkles, 
  Layers, Package, AlertCircle, RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';

interface RuStorePublishModalProps {
  currentUser?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function RuStorePublishModal({ isOpen, onClose }: RuStorePublishModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'terminal' | 'keystore' | 'listing' | 'checklist'>('export');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const CAPACITOR_CONFIG = `{
  "appId": "ru.vzaimopomosh.app",
  "appName": "Взаимопомощь",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}`;

  const TERMINAL_COMMANDS = `# 1. Клонируйте репозиторий из GitHub на ваш компьютер
git clone https://github.com/ВАШ_ЛОГИН/vzaimopomosh.git
cd vzaimopomosh

# 2. Установите зависимости проекта
npm install

# 3. Установите инструмент сборки Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 4. Соберите веб-приложение
npm run build

# 5. Добавьте платформу Android и синхронизируйте файлы
npx cap add android
npx cap sync android

# 6. Откройте проект в Android Studio для финальной сборки APK/AAB
npx cap open android`;

  const KEYSTORE_COMMAND = `keytool -genkey -v -keystore release-key.jks -alias vzaimopomosh -keyalg RSA -keysize 2048 -validity 10000`;

  const STORE_SHORT_DESC = `Бесплатная помощь соседям, совместные поездки и добрые дела в сёлах и деревнях.`;

  const STORE_FULL_DESC = `«Взаимопомощь» — это простое, бесплатное и душевное приложение для жителей сёл, посёлков и деревень.

Главная цель проекта — возродить традиции добрососедства и взаимной выручки:

🤝 «ПОМОЩЬ РЯДОМ» — публикуйте просьбы о помощи (наколоть дрова, привезти продукты или лекарства из райцентра, вспахать огород, починить забор) или предлагайте свою бескорыстную помощь соседям.

💬 ПРЯМАЯ СВЯЗЬ — общайтесь с откликнувшимися соседями в безопасном чате без спама и посредников.

🚗 ПОПУТНЫЕ ПОЕЗДКИ — находите попутчиков между деревнями и райцентром.

📱 ПРОСТОЙ РЕЖИМ И ОБУЧЕНИЕ — крупный шрифт, понятные кнопки без лишней сложности и уроки цифровой грамотности для старшего поколения.

🌿 ЭКОЛОГИЯ — адреса сельских пунктов приёма использованных батареек.

🌟 РЕЙТИНГ «СПАСИБО» — система искренней благодарности за добрые дела.

100% БЕСПЛАТНО: в приложении нет рекламы, скрытых подписок, тарифов или платных функций. Всё сделано людьми для людей.`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 font-sans overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-inner">
              <Smartphone className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Публикация в RuStore
                </h3>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Android APK
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Пошаговый переход от Google AI Studio к загрузке в официальный магазин RuStore
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab navigation bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto no-scrollbar shrink-0 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>1. Выгрузка из AI Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`py-3.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'terminal'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal size={14} />
            <span>2. Команды сборки</span>
          </button>

          <button
            onClick={() => setActiveTab('keystore')}
            className={`py-3.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'keystore'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key size={14} />
            <span>3. Ключ подписи</span>
          </button>

          <button
            onClick={() => setActiveTab('listing')}
            className={`py-3.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'listing'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={14} />
            <span>4. Тексты для RuStore</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>5. Чеклист модерации</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-700 text-xs sm:text-sm">
          
          {/* TAB 1: EXPORT FROM AI STUDIO */}
          {activeTab === 'export' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex gap-3.5 items-start">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-emerald-900 text-sm mb-1">
                    Как перенести код из AI Studio на компьютер
                  </h4>
                  <p className="text-emerald-800 text-xs leading-relaxed font-medium">
                    Сборка мобильного файла `.apk` для Android требует Android SDK и Java на компьютере. 
                    Самый быстрый путь — экспортировать код в ваш личный GitHub через встроенную кнопку AI Studio или скопировать файлы.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold">
                    Способ А: Кнопка в AI Studio
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-sm">
                    Экспорт в GitHub в 1 клик
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    В правом верхнем углу интерфейса Google AI Studio нажмите кнопку <strong>«Export to GitHub»</strong>. 
                    Укажите имя нового репозитория — AI Studio автоматически перенесёт все файлы в ваш профиль GitHub.
                  </p>
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
                    ✓ Самый надёжный способ для обновлений приложения
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold">
                    Способ Б: Скачать файлы конфигурации
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-sm">
                    Готовые файлы сборки
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Мы уже создали файлы <code>capacitor.config.json</code> и скрипт <code>build-android.sh</code> прямо в проекте.
                    Вы можете сохранить их прямо отсюда:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => downloadFile('capacitor.config.json', CAPACITOR_CONFIG)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download size={13} /> capacitor.config.json
                    </button>
                    <button
                      onClick={() => downloadFile('build-commands.txt', TERMINAL_COMMANDS)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download size={13} /> build-commands.txt
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Что нужно установить на компьютере перед запуском:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-800">
                  <li className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                    <span className="text-emerald-600 font-black">1.</span> Node.js 18+ или 20 LTS
                  </li>
                  <li className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                    <span className="text-emerald-600 font-black">2.</span> Java JDK 17 или 21
                  </li>
                  <li className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                    <span className="text-emerald-600 font-black">3.</span> Android Studio (бесплатно)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: TERMINAL COMMANDS */}
          {activeTab === 'terminal' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    Команды для терминала (Windows PowerShell / macOS / Linux)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Выполните эти команды последовательно в папке скачанного проекта
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(TERMINAL_COMMANDS, 'terminal')}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  {copiedId === 'terminal' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedId === 'terminal' ? 'Скопировано!' : 'Скопировать все'}</span>
                </button>
              </div>

              <pre className="p-4 sm:p-5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                {TERMINAL_COMMANDS}
              </pre>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-xs text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  После команды <code>npx cap open android</code> откроется <strong>Android Studio</strong>.
                  В ней выберите меню <strong>Build → Generate Signed Bundle / APK</strong>, чтобы получить готовый релизный файл.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: KEYSTORE */}
          {activeTab === 'keystore' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  Генерация ключа подписи (Keystore)
                </h4>
                <p className="text-xs text-slate-500">
                  RuStore требует, чтобы любой загружаемый APK был подписан вашим цифровым ключом разработчика.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-slate-600">Команда для создания ключа:</span>
                  <button
                    onClick={() => copyToClipboard(KEYSTORE_COMMAND, 'keystore')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedId === 'keystore' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedId === 'keystore' ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-amber-300 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
                  {KEYSTORE_COMMAND}
                </pre>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>Что будет запрошено:</strong> пароль хранилища, ваше имя, город и организация. 
                  Обязательно сохраните введённый пароль и файл <code>release-key.jks</code> — они понадобятся для всех будущих обновлений приложения.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: STORE LISTING TEXTS */}
          {activeTab === 'listing' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    Готовые тексты для карточки в RuStore
                  </h4>
                  <p className="text-xs text-slate-500">
                    Полностью соответствуют правилам модерации и политике публикации RuStore
                  </p>
                </div>
                <a
                  href="https://console.rustore.ru"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shrink-0"
                >
                  <span>Консоль RuStore</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Package ID */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-slate-500">Идентификатор пакета (Package Name):</span>
                  <button
                    onClick={() => copyToClipboard('ru.vzaimopomosh.app', 'pkg')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1"
                  >
                    {copiedId === 'pkg' ? '✓ Скопировано' : 'Скопировать'}
                  </button>
                </div>
                <div className="font-mono font-bold text-sm text-slate-900">ru.vzaimopomosh.app</div>
              </div>

              {/* Short Description */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-slate-500">
                    Краткое описание (до 80 символов):
                  </span>
                  <button
                    onClick={() => copyToClipboard(STORE_SHORT_DESC, 'short_desc')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1"
                  >
                    {copiedId === 'short_desc' ? '✓ Скопировано' : 'Скопировать'}
                  </button>
                </div>
                <div className="text-xs font-medium text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                  {STORE_SHORT_DESC}
                </div>
              </div>

              {/* Full Description */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-slate-500">
                    Полное описание (до 4000 символов):
                  </span>
                  <button
                    onClick={() => copyToClipboard(STORE_FULL_DESC, 'full_desc')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1"
                  >
                    {copiedId === 'full_desc' ? '✓ Скопировано' : 'Скопировать'}
                  </button>
                </div>
                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                  {STORE_FULL_DESC}
                </div>
              </div>

              {/* Category & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Категория в каталоге:</span>
                  <span className="font-extrabold text-slate-800 text-xs">Социальные сети / Инструменты</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Возрастной ценз:</span>
                  <span className="font-extrabold text-slate-800 text-xs">0+ (Для всех возрастов)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-black text-slate-900 text-sm">
                Чеклист готовности к быстрой модерации в RuStore
              </h4>

              <div className="space-y-2.5">
                {[
                  { title: 'Отсутствие платных подписок и скрытых платежей', desc: 'Приложение 100% бесплатно — модерация пропускает без требования подключения платёжного шлюза.', ok: true },
                  { title: 'Иконка 512×512 px в формате PNG', desc: 'Квадратная иконка без прозрачности для витрины каталога.', ok: true },
                  { title: 'Минимум 2 скриншота интерфейса (1080×1920 px)', desc: 'Главный экран со списком дел и экран чата или уроков.', ok: true },
                  { title: 'Релизный APK подписан ключом Keystore', desc: 'Подпись V1 и V2 сгенерирована через Android Studio.', ok: true },
                  { title: 'Регистрация в console.rustore.ru', desc: 'Авторизация через VK ID или Госуслуги подтверждена.', ok: true }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs">{item.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href="https://console.rustore.ru"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-md"
                >
                  <span>Перейти в консоль разработчика RuStore</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium hidden sm:inline">
            Файл инструкции <strong>RUSTORE_PUBLISH_GUIDE.md</strong> уже сохранён в проекте
          </span>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
            >
              Закрыть
            </button>
            <a
              href="https://console.rustore.ru"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>RuStore Консоль</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
