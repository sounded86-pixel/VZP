import React, { useState } from 'react';
import { UserProfile, POPULAR_VILLAGES } from '../types';
import { X, User, Phone, MapPin, Check, Bell, Search } from 'lucide-react';
import { requestPushPermission } from '../pwaService';
import { LocationPickerModal } from './LocationPickerModal';
import { LocationItem } from '../locationsData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [settlement, setSettlement] = useState(profile.settlement || 'Шангалы');
  const [region, setRegion] = useState<string | undefined>(profile.region);
  const [country, setCountry] = useState<string | undefined>(profile.country);
  const [telegram, setTelegram] = useState(profile.telegram || '');
  const [pushStatus, setPushStatus] = useState<boolean>(profile.pushSubscribed || false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Sub-modal for location picking
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSelectLocation = (locName: string, item?: LocationItem) => {
    if (locName === 'all') return;
    setSettlement(locName);
    if (item) {
      setRegion(item.region);
      setCountry(item.countryName);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim(),
      phone: phone.trim(),
      settlement,
      region,
      country,
      telegram: telegram.trim(),
      pushSubscribed: pushStatus
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  const handleEnablePush = async () => {
    const success = await requestPushPermission(settlement);
    if (success) {
      setPushStatus(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-3">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <h2 className="text-base font-black text-slate-900">
                Мои контакты (Профиль)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-4 space-y-3.5">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Без паролей и анкет: укажите ваши данные один раз, чтобы земляки могли быстро позвонить вам.
            </p>

            {/* Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Ваше Имя
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Иван Иванов"
                  className="w-full pl-9 bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Номер телефона для звонков
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (921) 000-00-00"
                  className="w-full pl-9 bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Village & Region */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Ваше основное село / регион
                </label>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>Каталог РФ и СНГ</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 rounded-xl flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-black text-slate-900 truncate block">
                      {settlement || 'Выберите село'}
                    </span>
                    {(region || country) ? (
                      <span className="text-[11px] text-slate-500 font-medium truncate block">
                        📍 {region || ''}{country ? ` (${country})` : ''}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-semibold block">
                        Нажмите для выбора из каталога РФ и СНГ
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">Выбрать</span>
              </button>
            </div>

            {/* Telegram / VK */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Telegram или VK (необязательно)
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Push notification toggle */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-950">Уведомления на телефон</p>
                  <p className="text-[11px] text-emerald-700">Оповещения о новых просьбах в {settlement}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${
                  pushStatus
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {pushStatus ? 'Включено' : 'Включить'}
              </button>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {savedNotice ? <Check className="w-4 h-4" /> : null}
                <span>{savedNotice ? 'Сохранено!' : 'Сохранить данные'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <LocationPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedLocation={settlement}
        onSelect={handleSelectLocation}
        allowAll={false}
        title="Выберите основное село или район"
      />
    </>
  );
};
