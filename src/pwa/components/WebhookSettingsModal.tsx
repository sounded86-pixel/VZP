import React, { useState } from 'react';
import { WebhookConfig, HelpItem } from '../types';
import { getWebhookConfig, saveWebhookConfig } from '../pwaService';
import { X, Globe, FileSpreadsheet, Check, Send, AlertCircle, RefreshCw, MessageSquare, Share2, Sparkles } from 'lucide-react';

interface WebhookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HelpItem[];
}

export const WebhookSettingsModal: React.FC<WebhookSettingsModalProps> = ({
  isOpen,
  onClose,
  items
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'messengers' | 'webhook' | 'export'>('messengers');
  const [config, setConfig] = useState<WebhookConfig>(getWebhookConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebhookConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestWebhook = async () => {
    if (!config.url) {
      setTestStatus('error');
      setTestMessage('Укажите URL вебхука.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Отправка тестового запроса...');

    const samplePayload = {
      source: 'vzaimopomosh_pwa_test',
      timestamp: new Date().toISOString(),
      event: 'test_ping',
      data: {
        id: 'test-1',
        type: 'Нужна помощь',
        category: 'transport',
        settlement: 'Шангалы',
        description: 'Тестовая отправка данных на вашу внешнюю площадку или мессенджер',
        author: 'Координатор села',
        phone: '+7 (921) 000-00-00',
        status: 'active'
      }
    };

    try {
      await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload)
      });
      setTestStatus('success');
      setTestMessage('✅ Данные успешно доставлены на внешнюю площадку!');
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage('Запрос отправлен (если в браузере сработала CORS-политика, ваш сервер или бот всё равно мог успешно получить пакет).');
    }
  };

  // Export items to CSV for direct opening in Excel or any spreadsheet software
  const handleExportCsv = () => {
    const headers = ['ID', 'Тип', 'Категория', 'Населенный пункт', 'Регион', 'Описание', 'Автор', 'Телефон', 'Статус', 'Дата'];
    const rows = items.map(item => [
      item.id,
      item.type === 'request' ? 'Нужна помощь' : 'Могу помочь',
      item.category,
      `"${item.settlement.replace(/"/g, '""')}"`,
      `"${(item.region || '').replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.author.replace(/"/g, '""')}"`,
      `"${item.phone}"`,
      item.status === 'completed' ? 'Решено' : 'Активно',
      new Date(item.createdAt).toLocaleString('ru-RU')
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vzaimopomosh_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-3">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-slate-900">
              Интеграции с мессенджерами и сервисами
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-100/80 p-1 gap-1 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('messengers')}
            className={`py-2 px-2 rounded-xl text-center transition-all ${
              activeTab === 'messengers'
                ? 'bg-white text-emerald-900 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💬 Мессенджеры
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`py-2 px-2 rounded-xl text-center transition-all ${
              activeTab === 'webhook'
                ? 'bg-white text-emerald-900 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌐 Вебхуки / API
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-2 px-2 rounded-xl text-center transition-all ${
              activeTab === 'export'
                ? 'bg-white text-emerald-900 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Экспорт (CSV)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* TAB 1: Messengers & Social Platforms */}
          {activeTab === 'messengers' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                  <span>📱</span>
                  <span>Прямая связь без посредников</span>
                </p>
                Каждое объявление в приложении оснащено кнопками моментального набора номера (<b>тел. звонок</b>) и перехода в <b>Telegram</b> или <b>VK</b>. Никаких закрытых чатов или скрытых контактов.
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Telegram */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center text-lg font-black shrink-0">
                    ✈️
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900">Telegram чаты и боты</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      При указании никнейма (@username) сельчане могут писать вам в ЛС в один клик. Также можно пересылать заявки в сельский Telegram-канал через вкладку «Вебхуки».
                    </p>
                  </div>
                </div>

                {/* VK */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-black shrink-0">
                    VK
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900">ВКонтакте беседы и группы</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Интеграция с сельскими группами и публичными беседами через API или пересылку заявок.
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black shrink-0">
                    🟢
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900">WhatsApp и звонки по телефону</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Быстрый звонок по номеру без необходимости сохранять контакт в телефонную книгу.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Universal Webhooks */}
          {activeTab === 'webhook' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs leading-relaxed">
                <p className="font-bold mb-1">🔗 Универсальная отправка данных (Webhook):</p>
                Подключите любой сервис автоматизации (<b>Make.com</b>, <b>n8n</b>, <b>Zapier</b>, собственный сервер или бот). Каждая новая заявка будет отправляться в формате JSON.
              </div>

              <form onSubmit={handleSave} className="space-y-3">
                {/* Enable switch */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Отправлять новые заявки на вебхук
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Срабатывает при создании просьбы или предложения
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* URL input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Адрес Webhook URL
                  </label>
                  <input
                    type="url"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    placeholder="https://your-server.ru/webhook или https://hook.eu1.make.com/..."
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {savedSuccess ? <Check className="w-4 h-4" /> : null}
                    <span>{savedSuccess ? 'Настройки сохранены!' : 'Сохранить настройки'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testStatus === 'testing' || !config.url}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Проверить</span>
                  </button>
                </div>

                {testMessage && (
                  <div
                    className={`p-2 rounded-lg text-xs font-semibold ${
                      testStatus === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {testMessage}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 3: Direct CSV Export */}
          {activeTab === 'export' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-700">
                <p className="font-bold text-slate-900 mb-1">📄 Выгрузка в локальный файл таблицы:</p>
                Вы можете сохранить все активные и завершённые просьбы в универсальный файл <b>CSV</b>. Он открывается на любых устройствах в Excel, МойОфис, LibreOffice или Numbers без привязки к иностранным облачным аккаунтам.
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Скачать таблицу заявок (CSV-файл)</span>
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Всего доступно к выгрузке: {items.length} заявок
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
