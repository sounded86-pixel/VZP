import React, { useState } from 'react';
import { 
  Github, FileCode, Terminal, Cloud, Copy, Check, X, Info, 
  ExternalLink, Code, Sparkles, CheckCircle, Download, Lock, 
  Settings, Globe, HelpCircle, ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface ExportToGitHubScreenProps {
  currentUser: UserProfile;
  onClose: () => void;
}

export default function ExportToGitHubScreen({ currentUser, onClose }: ExportToGitHubScreenProps) {
  const [activeTab, setActiveTab] = useState<'instructions' | 'manifest' | 'deploy'>('instructions');
  const [copiedText, setCopiedText] = useState<'manifest' | 'git_commands' | 'env_vars' | null>(null);
  
  // Customization states for manifest & commands
  const [githubUsername, setGithubUsername] = useState<string>('my-github-profile');
  const [repoName, setRepoName] = useState<string>('ustyany-mutual-help');
  const [appVersion, setAppVersion] = useState<string>('2.5.0');
  const [isPrivateRepo, setIsPrivateRepo] = useState<boolean>(true);

  // Trigger copy feedback
  const handleCopy = (text: string, type: 'manifest' | 'git_commands' | 'env_vars') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Generate dynamic manifest.json content
  const generatedManifest = `{
  "name": "Взаимопомощь Устьяны",
  "version": "${appVersion}",
  "description": "Цифровая платформа взаимопомощи для жителей сел и деревень Устьянского района.",
  "platform": "web",
  "framework": "react-vite",
  "runtime": "nodejs-18",
  "source": {
    "platform": "Google AI Studio",
    "appletId": "062eab10-bcca-4269-a32c-8f57082bf304",
    "exportTime": "${new Date().toISOString()}"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/${githubUsername}/${repoName}.git",
    "private": ${isPrivateRepo}
  },
  "permissions": {
    "camera": "Используется для фотоотчетов выполненных заявок помощи",
    "geolocation": "Используется для точного позиционирования заявок и транспорта на интерактивной карте"
  },
  "capabilities": [
    "MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"
  ],
  "features": [
    "DistrictHub (Районный инфо-пульт)",
    "LentaHelp (Лента взаимопомощи)",
    "SkillsCatalog (Каталог специалистов)",
    "FarmerDelivery (Фермерская доставка)",
    "TransportAccessibility (Расписание автобусов и попутчики)",
    "EcologyScreen (Эко-мониторинг)",
    "GovSupport (Муниципальный инкубатор)",
    "FamilyScreen (Семейный кабинет)",
    "KeepNotes (Блокнот заметок)",
    "CalendarEvents (Календарь событий)",
    "AnalyticsAndAds (Кабинет рекламы и статистики)",
    "DeveloperConsole (Симулятор уязвимостей защиты)"
  ],
  "environmentVariables": {
    "GEMINI_API_KEY": "Обязательный секретный ключ для работы AI-консультантов",
    "FIREBASE_PROJECT_ID": "ID проекта Firestore для облачной синхронизации данных"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}`;

  // Generate Git CLI command block
  const gitCommands = `# 1. Инициализируйте локальный Git-репозиторий в папке проекта
git init

# 2. Добавьте все файлы проекта в индекс отслеживания
git add .

# 3. Создайте первый коммит состояния проекта
git commit -m "feat: export project state from Google AI Studio"

# 4. Переименуйте ветку по умолчанию в 'main'
git branch -M main

# 5. Привяжите созданный репозиторий на GitHub как удаленный сервер
git remote add origin https://github.com/${githubUsername}/${repoName}.git

# 6. Отправьте проект в ветку main на GitHub
git push -u origin main`;

  // Generate environment variables guide
  const envVarsText = `# Скопируйте это в файл .env в корневой директории вашего проекта
# Внимание: никогда не отправляйте реальные API-ключи в публичный репозиторий!

VITE_APP_TITLE=Взаимопомощь Устьяны
VITE_APP_VERSION=${appVersion}

# Gemini API Key (для ИИ-Маркетолога и консультантов)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Firestore Configuration (если используется облачная БД)
FIREBASE_PROJECT_ID=ai-studio-062eab10-bcca-4269-a32c-8f57082bf304
FIREBASE_AUTH_DOMAIN=ai-studio-062eab10-bcca-4269-a32c-8f57082bf304.firebaseapp.com
`;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-100 flex items-center justify-center p-4 font-sans overflow-y-auto select-none">
      
      {/* Modal Card container */}
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header section with GitHub branding styling */}
        <div className="bg-slate-950 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
              <Github size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Экспорт проекта на GitHub</h3>
                <span className="bg-brand-medium text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  VITE-REACT
                </span>
              </div>
              <p className="text-xs text-slate-400">Пошаговое руководство по экспорту и развертыванию цифровой платформы</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-90"
            title="Закрыть окно"
          >
            <X size={18} />
          </button>
        </div>

        {/* Configuration settings banner bar inside modal */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
          
          {/* GitHub Username input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Имя на GitHub</label>
            <input 
              type="text" 
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value.trim().replace(/\s+/g, ''))}
              placeholder="username"
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Repository Name input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Имя репозитория</label>
            <input 
              type="text" 
              value={repoName}
              onChange={(e) => setRepoName(e.target.value.trim().replace(/\s+/g, '-').toLowerCase())}
              placeholder="ustyany-mutual-help"
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* App Version input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Версия релиза</label>
            <input 
              type="text" 
              value={appVersion}
              onChange={(e) => setAppVersion(e.target.value.trim())}
              placeholder="2.5.0"
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Repository Privacy checkbox toggle */}
          <div className="flex items-center gap-2.5 sm:pt-4">
            <input 
              type="checkbox" 
              id="privacy_checkbox"
              checked={isPrivateRepo}
              onChange={(e) => setIsPrivateRepo(e.target.checked)}
              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 accent-slate-900 cursor-pointer"
            />
            <label htmlFor="privacy_checkbox" className="text-xs text-slate-700 font-bold cursor-pointer flex items-center gap-1.5">
              <Lock size={12} className="text-slate-500" />
              Приватный репозиторий
            </label>
          </div>

        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-4 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'instructions'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Terminal size={14} />
            Шаги в консоли Git
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`py-3 px-4 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'manifest'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileCode size={14} />
            Файл manifest.json
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-3 px-4 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'deploy'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Cloud size={14} />
            Настройки окружения и облака
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-6">

          {/* TAB 1: GIT INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-6">
              
              {/* Top info alert */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex gap-3">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 leading-relaxed font-medium">
                  <strong>Как скачать код из AI Studio:</strong> Перейдите в верхнее правое меню настроек среды AI Studio (иконка шестеренки), нажмите кнопку <strong>"Export ZIP"</strong> или <strong>"Download Archive"</strong>. Распакуйте архив на своем ПК и откройте терминал в папке проекта.
                </div>
              </div>

              {/* Step list timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Пошаговый процесс публикации</h4>
                
                {/* Step 1 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Создайте репозиторий на GitHub</h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Перейдите по ссылке <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 font-bold inline-flex items-center gap-0.5 hover:underline">github.com/new <ExternalLink size={10} /></a> и создайте репозиторий с именем <strong className="font-mono text-slate-800">{repoName}</strong>. 
                      Не ставьте галочки для README, .gitignore или LICENSE — они уже настроены в нашем коде!
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black text-slate-800">Выполните консольные команды</h5>
                    <p className="text-[11px] text-slate-500 mt-1 mb-3">
                      Откройте Bash, PowerShell или терминал в вашей IDE (например, VS Code) внутри папки с распакованным проектом и вставьте команды:
                    </p>
                    
                    {/* Code block view */}
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(gitCommands, 'git_commands')}
                        className="absolute right-3 top-3 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-slate-700"
                      >
                        {copiedText === 'git_commands' ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span>Скопировано!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Копировать</span>
                          </>
                        )}
                      </button>
                      <pre className="bg-slate-950 text-slate-200 p-4 pt-10 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-850 leading-relaxed shadow-inner">
                        {gitCommands}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Проверьте файлы на GitHub</h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Обновите страницу репозитория. Вся структура платформы "Взаимопомощь Устьяны", включая компоненты, типы и конфигурации Vite, теперь сохранена в вашем личном аккаунте GitHub и готова к компиляции.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: MANIFEST FILE GENERATOR */}
          {activeTab === 'manifest' && (
            <div className="space-y-6">
              
              {/* Manifest descriptive alert */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed font-medium">
                  <strong>Зачем нужен manifest.json?</strong> Данный манифест содержит полные метаданные приложения, разрешения фреймворка (camera, geolocation), список используемых ИИ-возможностей и описание экосистемы наших сервисов. Он используется для интеграции с панелью управления AI Studio. Сохраните этот файл как <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded">manifest.json</strong> в корне проекта.
                </div>
              </div>

              {/* Manifest Code block view */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Code size={14} className="text-slate-500" />
                    Код manifest.json (сгенерирован автоматически)
                  </h4>
                  
                  <button
                    onClick={() => handleCopy(generatedManifest, 'manifest')}
                    className="bg-slate-900 hover:bg-slate-850 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    {copiedText === 'manifest' ? (
                      <>
                        <Check size={13} className="text-emerald-400 animate-bounce" />
                        <span>Файл скопирован!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Копировать манифест</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="bg-slate-950 text-emerald-400 p-5 rounded-2xl text-[11px] font-mono overflow-y-auto max-h-[350px] border border-slate-800 leading-relaxed shadow-xl no-scrollbar">
                    {generatedManifest}
                  </pre>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: DEPLOY & ENVIRONMENT */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              
              {/* Security Warning alert block */}
              <div className="p-4 bg-red-50 border border-red-150 rounded-2xl flex gap-3">
                <Lock size={18} className="text-red-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs text-red-800 leading-relaxed font-medium">
                  <strong>⚠️ Важное предупреждение безопасности:</strong> Переменная <strong className="font-mono bg-red-100 px-1 py-0.5 rounded">GEMINI_API_KEY</strong> не должна попадать в коммиты репозитория на GitHub. При публикации на хостинг всегда используйте переменные окружения панели управления (Environment Variables), а локально настраивайте их через файл <strong className="font-mono bg-red-100 px-1 py-0.5 rounded">.env</strong>, добавленный в исключения <strong className="font-mono bg-red-100 px-1 py-0.5 rounded">.gitignore</strong>.
                </div>
              </div>

              {/* Env Vars copy helper */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">Локальные настройки среды (.env)</h5>
                  <button
                    onClick={() => handleCopy(envVarsText, 'env_vars')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    {copiedText === 'env_vars' ? (
                      <>
                        <Check size={11} className="text-emerald-600" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Копировать .env</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[11px] font-mono border border-slate-250">
                  {envVarsText}
                </pre>
              </div>

              {/* Cloud hosting instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Deployment Option 1: Vercel / Netlify */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-black text-[10px]">
                      ▲
                    </div>
                    <h5 className="text-xs font-black text-slate-800">Vercel или Netlify (SPA)</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Идеальный способ для развертывания клиентской сборки Vite. Подключите ваш GitHub репозиторий, и Vercel автоматически развернет сайт при каждом коммите.
                  </p>
                  <ul className="space-y-2 text-[10px] font-semibold text-slate-600">
                    <li className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle size={12} />
                      Команда сборки: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">npm run build</code>
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle size={12} />
                      Папка дистрибуции: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">dist</code>
                    </li>
                  </ul>
                </div>

                {/* Deployment Option 2: Docker & Cloud Run */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                      <Globe size={14} />
                    </div>
                    <h5 className="text-xs font-black text-slate-800">Docker & Google Cloud Run</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Если вы используете полнофункциональный бэкенд на Node.js / Express для проксирования API, упакуйте проект в Docker-контейнер и разверните в Google Cloud Run.
                  </p>
                  <ul className="space-y-2 text-[10px] font-semibold text-slate-600">
                    <li className="flex items-center gap-1.5 text-blue-600">
                      <ArrowRight size={12} />
                      Использует порты, назначенные контейнером
                    </li>
                    <li className="flex items-center gap-1.5 text-blue-600">
                      <ArrowRight size={12} />
                      Поддерживает автоматическое масштабирование
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
            <Github size={14} className="text-slate-400" />
            <span>Готово к экспорту в ветку <code className="font-mono bg-slate-200 text-slate-800 px-1 py-0.5 rounded">main</code></span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Закрыть инструкции
          </button>
        </div>

      </div>

    </div>
  );
}
