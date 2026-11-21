import React from 'react';
import { X, Download, Smartphone, Share, PlusSquare, Check } from 'lucide-react';
import { promptPwaInstall } from '../pwaService';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  canPromptDirectly: boolean;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  canPromptDirectly
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const installed = await promptPwaInstall();
    if (installed) {
      onClose();
    }
  };

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-slate-900">
              Установка на телефон
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
              🤝
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Взаимопомощь (PWA)</h3>
              <p className="text-xs text-slate-600">
                Работает без интернета, открывается в 1 клик с экрана телефона как обычное приложение.
              </p>
            </div>
          </div>

          {canPromptDirectly ? (
            <div className="space-y-2">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>Установить в 1 клик</span>
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Иконка появится на рабочем столе смартфона
              </p>
            </div>
          ) : isIos ? (
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900">Инструкция для iPhone (Safari):</p>
              <ol className="list-decimal pl-4 space-y-1.5 font-medium">
                <li>Нажмите внизу экрана значок <b>«Поделиться»</b> (квадрат со стрелкой вверх <Share className="w-3.5 h-3.5 inline text-blue-600" />).</li>
                <li>Прокрутите вниз и выберите <b>«На экран Домой»</b> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-600" />).</li>
                <li>Нажмите <b>«Добавить»</b> в правом верхнем углу.</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900">Как установить на Android:</p>
              <ol className="list-decimal pl-4 space-y-1.5 font-medium">
                <li>Нажмите в браузере кнопку меню (три точки в правом верхнем углу).</li>
                <li>Выберите пункт <b>«Установить приложение»</b> или <b>«Добавить на главный экран»</b>.</li>
                <li>Подтвердите добавление.</li>
              </ol>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 font-bold hover:text-slate-800 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
