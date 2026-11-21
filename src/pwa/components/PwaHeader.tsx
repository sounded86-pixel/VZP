import React from 'react';
import { UserProfile } from '../types';
import { MapPin, User, Download, WifiOff, Settings, Search, X } from 'lucide-react';

interface PwaHeaderProps {
  profile: UserProfile;
  selectedVillage: string;
  onSelectVillage: (village: string) => void;
  onOpenLocationPicker: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenInstall: () => void;
  canInstall: boolean;
  isOnline: boolean;
}

export const PwaHeader: React.FC<PwaHeaderProps> = ({
  profile,
  selectedVillage,
  onSelectVillage,
  onOpenLocationPicker,
  onOpenProfile,
  onOpenSettings,
  onOpenInstall,
  canInstall,
  isOnline
}) => {
  const isFiltered = selectedVillage !== 'all' && Boolean(selectedVillage);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-xs">
      <div className="max-w-2xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs shrink-0">
            🤝
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none truncate">
              Взаимопомощь
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-none">
              Сельская взаимовыручка
            </p>
          </div>
        </div>

        {/* Action icons & install */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Online/Offline indicator */}
          <div 
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title={isOnline ? 'Связь есть' : 'Режим офлайн — сохранено на телефоне'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">2G/3G Онлайн</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Офлайн</span>
              </>
            )}
          </div>

          {/* Install PWA Button if browser triggered installable */}
          {canInstall && (
            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
              title="Установить приложение на телефон"
            >
              <Download className="w-3.5 h-3.5" />
              <span>На экран</span>
            </button>
          )}

          {/* Settings / Webhook button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Настройки интеграций и экспорт"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Simple Profile button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-800 text-xs font-bold transition-colors"
            title="Мои контакты"
          >
            <User className="w-4 h-4 text-slate-600" />
            <span className="max-w-[70px] truncate hidden xs:inline">
              {profile.name ? profile.name.split(' ')[0] : 'Профиль'}
            </span>
          </button>
        </div>
      </div>

      {/* Village & Region Selector Bar with full directory across RF, Belarus, Kazakhstan, CIS */}
      <div className="bg-slate-100/95 border-t border-slate-200 px-3 py-1.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-700 font-bold shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Село/регион:</span>
          </div>

          {/* Interactive button that triggers the full expanded location picker */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
            <button
              type="button"
              onClick={onOpenLocationPicker}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold truncate max-w-full transition-all ${
                isFiltered
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs hover:bg-emerald-700'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-500 shadow-2xs'
              }`}
              title="Нажмите для выбора села или поиска по РФ, Беларуси, Казахстану и СНГ"
            >
              <span className="truncate">
                {isFiltered ? `📍 ${selectedVillage}` : '📍 Все регионы и сёла (РФ, РБ, КЗ, СНГ)'}
              </span>
              <Search className={`w-3 h-3 shrink-0 ${isFiltered ? 'text-emerald-200' : 'text-slate-400'}`} />
            </button>

            {/* Clear filter button if filtered */}
            {isFiltered && (
              <button
                type="button"
                onClick={() => onSelectVillage('all')}
                className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors shrink-0"
                title="Показать все сёла"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
