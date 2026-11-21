import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, LogIn, LogOut, CheckCircle, AlertTriangle, ArrowLeft, 
  ArrowRight, RefreshCw, Plus, Download, Upload, ExternalLink, Table, 
  Database, Eye, Trash2, HelpCircle, Check, Loader2, Info, ArrowUpRight
} from 'lucide-react';
import { UserProfile, HelpRequest } from '../types';
import { googleSignIn, logout, initAuth } from '../lib/googleAuth';

interface SheetsScreenProps {
  currentUser: UserProfile;
  requests: HelpRequest[];
  onImportRequests: (imported: HelpRequest[]) => void;
  onBack: () => void;
  isOffline: boolean;
}

interface ExportConfig {
  dataType: 'requests' | 'ecology' | 'transport';
  targetType: 'new' | 'existing';
  spreadsheetId: string;
  sheetName: string;
}

export default function SheetsScreen({ 
  currentUser, 
  requests, 
  onImportRequests, 
  onBack, 
  isOffline 
}: SheetsScreenProps) {
  // Authentication states
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Interface states
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    dataType: 'requests',
    targetType: 'new',
    spreadsheetId: '',
    sheetName: 'Экспорт'
  });

  const [importSpreadsheetId, setImportSpreadsheetId] = useState('');
  const [importRange, setImportRange] = useState('Лист1!A1:G100');

  // API Interaction states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdSpreadsheetId, setCreatedSpreadsheetId] = useState<string | null>(null);
  const [createdSpreadsheetUrl, setCreatedSpreadsheetUrl] = useState<string | null>(null);

  // Preview & Validation states
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setError(null);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Trigger Google Sign-In
  const handleSignIn = async () => {
    if (isOffline) {
      setError("Невозможно авторизоваться: вы находитесь в автономном (оффлайн) режиме.");
      return;
    }
    setAuthLoading(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setSuccessMessage("Авторизация в Google выполнена успешно!");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ошибка авторизации Google");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm("Выйти из аккаунта Google?")) {
      await logout();
      setGoogleUser(null);
      setAccessToken(null);
      setSuccessMessage("Вы успешно вышли из аккаунта Google.");
      setCreatedSpreadsheetId(null);
      setCreatedSpreadsheetUrl(null);
    }
  };

  // Generate data matrix for export preview
  const getExportDataMatrix = () => {
    if (exportConfig.dataType === 'requests') {
      const headers = ['ID', 'Автор', 'Категория', 'Село', 'Описание', 'Статус', 'Дата Создания'];
      const rows = requests.map(r => [
        r.id,
        r.authorName || 'Без имени',
        translateCategory(r.category),
        r.village || 'Устьяны',
        r.description || '',
        r.active ? 'Активная' : 'Решена',
        new Date(r.createdAt).toLocaleString('ru-RU')
      ]);
      return { headers, rows };
    } else if (exportConfig.dataType === 'ecology') {
      // Mock some local eco reports for demonstration if no DB exists, or use default structure
      const headers = ['Тип отчета', 'Село/Локация', 'Описание', 'Статус', 'Дата сообщения'];
      const rows = [
        ['Пункт приема батареек', 'Октябрьский, ул. Ленина 24', 'Работает Пн-Пт с 9 до 18', 'Активен', '01.07.2026'],
        ['Незаконная свалка', 'Шангалы, лесной массив за рекой', 'Куча строительного мусора', 'Проверяется', '04.07.2026'],
        ['Субботник', 'Березник, берег реки Устья', 'Сбор у моста в 10:00', 'Запланирован', '08.07.2026']
      ];
      return { headers, rows };
    } else {
      const headers = ['Направление', 'Время', 'Тип рейса', 'Перевозчик/Водитель', 'Контакты'];
      const rows = [
        ['Октябрьский — Шангалы', '08:00, 12:30, 17:15', 'Автобус №102', 'МУП Устьянское', '8 (818) 555-12-34'],
        ['Березник — Октябрьский', '09:15', 'Попутка', 'Иван К.', '+7 (911) 222-33-44'],
        ['Вельск — Октябрьский', 'Пятница 18:00', 'Попутка', 'Мария С.', '+7 (921) 444-55-66']
      ];
      return { headers, rows };
    }
  };

  const translateCategory = (cat: string) => {
    const cats: Record<string, string> = {
      wood: 'Дрова',
      tractor: 'Трактор',
      carpentry: 'Строительство/Ремонт',
      delivery: 'Доставка',
      medical: 'Медицинская помощь',
      household: 'Бытовая помощь',
      other: 'Другое'
    };
    return cats[cat] || cat;
  };

  const reverseCategory = (translated: string) => {
    const cats: Record<string, string> = {
      'Дрова': 'wood',
      'Трактор': 'tractor',
      'Строительство/Ремонт': 'carpentry',
      'Строительство': 'carpentry',
      'Ремонт': 'carpentry',
      'Доставка': 'delivery',
      'Медицинская помощь': 'medical',
      'Бытовая помощь': 'household',
      'Другое': 'other'
    };
    return cats[translated] || 'other';
  };

  // Perform Google Sheets export
  const handleExport = async () => {
    if (!accessToken) {
      setError("Пожалуйста, авторизуйтесь через Google для выполнения экспорта.");
      return;
    }
    if (isOffline) {
      setError("Невозможно экспортировать в автономном режиме.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { headers, rows } = getExportDataMatrix();
      let targetId = exportConfig.spreadsheetId;

      // 1. Create a new Spreadsheet if requested
      if (exportConfig.targetType === 'new') {
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              title: `Устьяны - Экспорт ${exportConfig.dataType === 'requests' ? 'Заявок' : exportConfig.dataType === 'ecology' ? 'Эко-безопасности' : 'Транспорта'} (${new Date().toLocaleDateString('ru-RU')})`
            }
          })
        });

        if (!createRes.ok) {
          throw new Error(`Ошибка создания таблицы: ${createRes.statusText}`);
        }

        const createData = await createRes.json();
        targetId = createData.spreadsheetId;
        setCreatedSpreadsheetId(targetId);
        setCreatedSpreadsheetUrl(createData.spreadsheetUrl);
      }

      if (!targetId) {
        throw new Error("Не указан ID таблицы для экспорта.");
      }

      // 2. Prepare spreadsheet body payload
      // Overwrite the first sheet range with Headers and Data rows
      const range = `${exportConfig.sheetName}!A1:Z${rows.length + 2}`;
      
      // Let's check first if Sheet name exists or use default range
      const checkRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      let actualRange = 'A1';
      if (checkRes.ok) {
        const metadata = await checkRes.json();
        const firstSheetName = metadata.sheets?.[0]?.properties?.title || 'Лист1';
        actualRange = `'${firstSheetName}'!A1`;
      } else {
        throw new Error(`Не удалось найти таблицу с ID ${targetId}. Убедитесь, что у приложения есть доступ к файлу.`);
      }

      const valuesToUpload = [headers, ...rows];

      // 3. Perform values update
      const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetId}/values/${actualRange}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: valuesToUpload
        })
      });

      if (!updateRes.ok) {
        const errDetails = await updateRes.json().catch(() => null);
        throw new Error(`Ошибка записи в таблицу: ${errDetails?.error?.message || updateRes.statusText}`);
      }

      setSuccessMessage(`Данные успешно экспортированы в Google Таблицу!`);
      if (exportConfig.targetType === 'existing') {
        setCreatedSpreadsheetId(targetId);
        setCreatedSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${targetId}/edit`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ошибка в процессе экспорта в Google Таблицы.");
    } finally {
      setLoading(false);
    }
  };

  // Perform reading spreadsheet for IMPORT
  const handleReadSpreadsheetForImport = async () => {
    if (!accessToken) {
      setError("Пожалуйста, авторизуйтесь через Google.");
      return;
    }
    if (!importSpreadsheetId.trim()) {
      setError("Пожалуйста, введите корректный ID Google Таблицы.");
      return;
    }
    if (isOffline) {
      setError("Невозможно прочитать данные в автономном режиме.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setImportedData([]);
    setImportErrors([]);

    try {
      const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${importSpreadsheetId.trim()}/values/${importRange}`;
      const res = await fetch(fetchUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `Ошибка чтения: ${res.statusText}`);
      }

      const data = await res.json();
      const values: string[][] = data.values || [];

      if (values.length < 2) {
        throw new Error("Таблица пуста или содержит только строку заголовков.");
      }

      const headers = values[0];
      const rows = values.slice(1);

      // Validate columns
      // Expected: Автор, Категория, Село, Описание, Срочность (опционально)
      // Let's map headers to find indexes
      const headerMap = headers.reduce((acc, h, idx) => {
        const cleanHeader = h.trim().toLowerCase();
        acc[cleanHeader] = idx;
        return acc;
      }, {} as Record<string, number>);

      const authorIdx = headerMap['автор'] !== undefined ? headerMap['автор'] : 0;
      const categoryIdx = headerMap['категория'] !== undefined ? headerMap['категория'] : 1;
      const villageIdx = headerMap['село'] !== undefined ? headerMap['село'] : 2;
      const descriptionIdx = headerMap['описание'] !== undefined ? headerMap['описание'] : 3;

      const validRequests: HelpRequest[] = [];
      const errorsList: string[] = [];

      rows.forEach((row, idx) => {
        const rowNum = idx + 2; // Row number in sheet (1-based + headers offset)
        const author = row[authorIdx]?.trim();
        const categoryRaw = row[categoryIdx]?.trim() || 'Другое';
        const village = row[villageIdx]?.trim();
        const description = row[descriptionIdx]?.trim();

        if (!author) {
          errorsList.push(`Строка ${rowNum}: отсутствует имя автора.`);
          return;
        }
        if (!village) {
          errorsList.push(`Строка ${rowNum}: отсутствует название села.`);
          return;
        }
        if (!description) {
          errorsList.push(`Строка ${rowNum}: отсутствует описание просьбы.`);
          return;
        }

        const categoryKey = reverseCategory(categoryRaw);

        validRequests.push({
          id: `imported_${Date.now()}_${idx}`,
          title: `Просьба: ${categoryRaw}`,
          category: categoryKey,
          description: description,
          photos: [],
          authorId: `imported_user_${idx}`,
          authorName: author,
          authorPhone: '+7 (911) 000-00-00',
          authorRating: 5,
          village: village,
          createdAt: new Date().toISOString(),
          active: true,
          reportsCount: 0
        });
      });

      setImportedData(validRequests);
      setImportErrors(errorsList);
      
      if (validRequests.length > 0) {
        setSuccessMessage(`Успешно прочитано ${validRequests.length} строк(и). Ошибок валидации: ${errorsList.length}`);
      } else {
        setError(`Не удалось распознать ни одной строки. Ошибок валидации: ${errorsList.length}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ошибка чтения таблицы. Проверьте ID таблицы и доступ.");
    } finally {
      setLoading(false);
    }
  };

  // Confirm and execute the actual import into the main application state (Durable storage update)
  const handleConfirmImport = () => {
    if (importedData.length === 0) return;

    // MANDATORY STEP 3: request explicit user confirmation before modifying user-owned data
    const confirmed = window.confirm(
      `Вы действительно хотите импортировать ${importedData.length} заявок в приложение? Данные будут добавлены в общую ленту помощи.`
    );
    
    if (!confirmed) return;

    onImportRequests(importedData);
    setSuccessMessage(`Успешно добавлено ${importedData.length} заявок в ленту помощи!`);
    setImportedData([]);
  };

  const { headers: previewHeadersMatrix, rows: previewRowsMatrix } = getExportDataMatrix();

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-16 flex flex-col font-sans" id="sheets_integration_screen">
      {/* HEADER BAR */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 transition cursor-pointer active:scale-95"
            id="sheets_back_button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-green-600" /> Google Таблицы
            </h1>
            <p className="text-xs text-slate-500 font-medium">Интеграция и обмен данными с облаком</p>
          </div>
        </div>

        {/* Offline status or Login status */}
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 flex items-center gap-1.5">
              ● ОФФЛАЙН
            </span>
          ) : googleUser ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">{googleUser.displayName || "Google Юзер"}</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">{googleUser.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-full transition cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Выйти</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={authLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-full font-black text-xs uppercase tracking-wider hover:bg-green-700 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Войти через Google
            </button>
          )}
        </div>
      </div>

      {/* DETAILED INFO BOX */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-6">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 opacity-10 rotate-12">
            <FileSpreadsheet size={180} />
          </div>
          <div className="relative z-10 space-y-2">
            <span className="bg-white/25 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
              Свободный экспорт и импорт
            </span>
            <h2 className="text-2xl font-black tracking-tight leading-none">Объединяйте Устьяны с Google Таблицами!</h2>
            <p className="text-sm text-green-50 font-medium max-w-2xl leading-relaxed">
              Вы можете выгрузить все скопившиеся просьбы о помощи, экологические субботники или расписание транспорта в удобную Excel-совместимую таблицу Google для анализа, печати или совместной работы с администрацией района.
            </p>
          </div>
        </div>
      </div>

      {/* NOTIFICATION FEEDBACK */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-4">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border-2 border-red-200 text-red-900 rounded-2xl flex items-start gap-3 shadow-xs"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm leading-tight">Произошла ошибка</p>
              <p className="text-xs text-red-700 font-bold mt-1 leading-snug">{error}</p>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-950 rounded-2xl flex items-start gap-3 shadow-xs"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm leading-tight">Операция успешна!</p>
              <p className="text-xs text-emerald-800 font-bold mt-1 leading-snug">{successMessage}</p>
              {createdSpreadsheetUrl && (
                <a 
                  href={createdSpreadsheetUrl} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-950 underline font-black mt-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs transition"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Открыть Google Таблицу
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-6 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* LEFT CONFIGURATION PANEL */}
        <div className="w-full md:w-80 shrink-0 space-y-4">
          
          {/* TAB SELECTOR */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex gap-1">
            <button
              onClick={() => { setActiveTab('export'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition ${
                activeTab === 'export' 
                  ? 'bg-green-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              📤 Экспорт
            </button>
            <button
              onClick={() => { setActiveTab('import'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition ${
                activeTab === 'import' 
                  ? 'bg-green-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              📥 Импорт
            </button>
          </div>

          {/* MAIN FORM PANEL */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">
              {activeTab === 'export' ? '1. Параметры Выгрузки' : '1. Настройки Импорта'}
            </h3>

            {activeTab === 'export' ? (
              <div className="space-y-4">
                {/* 1. DATA CATEGORY */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Что экспортировать:</label>
                  <select
                    value={exportConfig.dataType}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, dataType: e.target.value as any }))}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 text-sm focus:border-green-500 focus:outline-none transition"
                  >
                    <option value="requests">Просьбы о помощи ({requests.length})</option>
                    <option value="ecology">Эко-безопасность (Субботники / Свалки)</option>
                    <option value="transport">Транспортные маршруты Устьян</option>
                  </select>
                </div>

                {/* 2. TARGET TYPE */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Куда выгрузить:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportConfig(prev => ({ ...prev, targetType: 'new' }))}
                      className={`py-2 rounded-xl border-2 font-bold text-xs text-center transition ${
                        exportConfig.targetType === 'new'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Новая Таблица
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportConfig(prev => ({ ...prev, targetType: 'existing' }))}
                      className={`py-2 rounded-xl border-2 font-bold text-xs text-center transition ${
                        exportConfig.targetType === 'existing'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Существующая
                    </button>
                  </div>
                </div>

                {/* 3. CONDITIONAL SPREADSHEET ID FOR EXISTING */}
                {exportConfig.targetType === 'existing' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID Google Таблицы:</label>
                    <input
                      type="text"
                      placeholder="Например: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                      value={exportConfig.spreadsheetId}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, spreadsheetId: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:border-green-500 focus:outline-none transition"
                    />
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">
                      ID можно скопировать из адресной строки нужной таблицы в браузере.
                    </p>
                  </div>
                )}

                {/* 4. SHEET TAB NAME */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Название листа:</label>
                  <input
                    type="text"
                    placeholder="Лист1"
                    value={exportConfig.sheetName}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, sheetName: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-850 text-sm focus:border-green-500 focus:outline-none transition"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  onClick={handleExport}
                  disabled={loading || !accessToken}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl py-3 font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md cursor-pointer transition active:scale-98 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Запись в облако...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Экспортировать в Sheets
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* IMPORT SHEET ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID Google Таблицы:</label>
                  <input
                    type="text"
                    placeholder="Введите ID вашей Google Таблицы"
                    value={importSpreadsheetId}
                    onChange={(e) => setImportSpreadsheetId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-850 text-xs focus:border-green-500 focus:outline-none transition"
                  />
                </div>

                {/* IMPORT RANGE */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Диапазон ячеек:</label>
                  <input
                    type="text"
                    placeholder="Лист1!A1:G100"
                    value={importRange}
                    onChange={(e) => setImportRange(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-850 text-sm focus:border-green-500 focus:outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 font-medium leading-snug">
                    Строка 1 обязательно должна содержать заголовки колонок: <strong className="text-slate-600">Автор, Категория, Село, Описание</strong>.
                  </p>
                </div>

                {/* LOAD ACTION */}
                <button
                  onClick={handleReadSpreadsheetForImport}
                  disabled={loading || !accessToken || !importSpreadsheetId}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl py-3 font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md cursor-pointer transition active:scale-98 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Чтение данных...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Загрузить и проверить
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SPREADSHEET ACCESS MANIFESTO CARD */}
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 space-y-2.5 shadow-3xs">
            <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0" /> Как узнать ID таблицы?
            </h4>
            <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
              Откройте вашу Google Таблицу. В адресе вида <code className="bg-blue-100/50 px-1 py-0.5 rounded text-blue-950 break-all font-mono text-[10px]">docs.google.com/spreadsheets/d/<b>[ID]</b>/edit</code> скопируйте длинный набор букв и цифр между слэшами.
            </p>
          </div>

        </div>

        {/* RIGHT DISPLAY PANEL (INTERACTIVE PREVIEW) */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Table className="w-5 h-5 text-slate-600" /> 
                  {activeTab === 'export' ? 'Предварительный просмотр экспорта' : 'Результаты валидации импорта'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {activeTab === 'export' 
                    ? 'Табличный вид данных, которые будут выгружены в облако' 
                    : 'Список проверенных строк, готовых к интеграции в систему'}
                </p>
              </div>
              {activeTab === 'export' && (
                <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Всего строк: {previewRowsMatrix.length}
                </span>
              )}
            </div>

            {/* ERROR STATS IN IMPORT */}
            {activeTab === 'import' && importErrors.length > 0 && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-4 space-y-1.5 text-amber-950">
                <p className="text-xs font-black flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Ошибки в строках таблицы ({importErrors.length}):
                </p>
                <div className="max-h-24 overflow-y-auto text-[10px] font-bold text-amber-800 leading-snug space-y-1 pr-2">
                  {importErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER */}
            <div className="flex-1 overflow-x-auto border border-slate-200 rounded-2xl max-h-[350px]">
              {activeTab === 'export' ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      {previewHeadersMatrix.map((header, idx) => (
                        <th key={idx} className="p-3 font-extrabold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRowsMatrix.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/50 transition">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="p-3 font-bold text-slate-800 max-w-xs truncate" title={cell}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : importedData.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-3 font-extrabold text-slate-600 uppercase tracking-wider">Автор</th>
                      <th className="p-3 font-extrabold text-slate-600 uppercase tracking-wider">Категория</th>
                      <th className="p-3 font-extrabold text-slate-600 uppercase tracking-wider">Село</th>
                      <th className="p-3 font-extrabold text-slate-600 uppercase tracking-wider">Описание просьбы</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedData.map((req, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="p-3 font-extrabold text-slate-900">{req.authorName}</td>
                        <td className="p-3 font-bold text-slate-600">
                          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase">
                            {translateCategory(req.category)}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{req.village}</td>
                        <td className="p-3 font-medium text-slate-500 max-w-sm truncate" title={req.description}>
                          {req.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <Table className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-850">Нет данных для предпросмотра</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-1">
                      {activeTab === 'import' 
                        ? 'Укажите ID Google Таблицы слева и нажмите кнопку «Загрузить и проверить», чтобы прочитать строки.'
                        : 'Выберите тип данных для автоматического формирования таблицы.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* IMPORT ACTION TRIGGER ZONE */}
            {activeTab === 'import' && importedData.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="text-xs font-bold text-slate-500">
                  Готово к импорту: <span className="text-green-700 font-extrabold text-sm">{importedData.length}</span> строк.
                </div>
                <button
                  onClick={handleConfirmImport}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Сохранить в приложение
                </button>
              </div>
            )}

            {/* SECURITY ASSURANCES BAR */}
            <div className="mt-auto pt-6 flex items-center gap-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold leading-relaxed">
              <span className="text-emerald-500 text-xs">🛡️</span>
              <div>
                Безопасность Google API: Данные передаются напрямую в облачные сервера Google. Приложение не хранит пароли и токены вне оперативной памяти вашего браузера.
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
