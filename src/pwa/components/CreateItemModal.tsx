import React, { useState } from 'react';
import { HelpType, HelpCategory, HelpItem, UserProfile, POPULAR_VILLAGES } from '../types';
import { X, MapPin, Phone, User, Check, Search, Plus } from 'lucide-react';
import { dispatchToWebhook } from '../pwaService';
import { LocationPickerModal } from './LocationPickerModal';
import { LocationItem, EXPANDED_LOCATIONS } from '../locationsData';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: HelpItem) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  defaultVillage: string;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  profile,
  onUpdateProfile,
  defaultVillage
}) => {
  if (!isOpen) return null;

  // 1. Type
  const [type, setType] = useState<HelpType>('request');

  // 2. Category
  const [category, setCategory] = useState<HelpCategory>('transport');

  // 3. Settlement
  const [settlement, setSettlement] = useState<string>(
    profile.settlement || (defaultVillage !== 'all' ? defaultVillage : 'Шангалы')
  );
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(profile.region);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(profile.country);

  // Sub-modal for location picker
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState<boolean>(false);
  const [isCustomVillage, setIsCustomVillage] = useState<boolean>(false);
  const [customVillageText, setCustomVillageText] = useState<string>('');

  // 4. Description (1-2 sentences)
  const [description, setDescription] = useState<string>('');

  // 5. Contacts (Name + Phone)
  const [author, setAuthor] = useState<string>(profile.name || '');
  const [phone, setPhone] = useState<string>(profile.phone || '');
  const [telegram, setTelegram] = useState<string>(profile.telegram || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFromPicker = (locationName: string, fullItem?: LocationItem) => {
    if (locationName === 'all') return;
    setSettlement(locationName);
    setIsCustomVillage(false);
    if (fullItem) {
      setSelectedRegion(fullItem.region);
      setSelectedCountry(fullItem.countryName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalVillage = isCustomVillage ? customVillageText.trim() : settlement.trim();

    if (!finalVillage) {
      setError('Пожалуйста, выберите или укажите село / деревню.');
      return;
    }
    if (!description.trim()) {
      setError('Пожалуйста, напишите кратко, в чём суть просьбы или предложения.');
      return;
    }
    if (!phone.trim()) {
      setError('Укажите номер телефона для прямой связи.');
      return;
    }

    setSubmitting(true);

    const finalAuthor = author.trim() || 'Житель села';

    // Save profile if updated
    if (finalAuthor !== profile.name || phone !== profile.phone || finalVillage !== profile.settlement) {
      onUpdateProfile({
        name: finalAuthor,
        phone: phone.trim(),
        settlement: finalVillage,
        region: selectedRegion,
        country: selectedCountry,
        telegram: telegram.trim()
      });
    }

    const newItem: HelpItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      category,
      settlement: finalVillage,
      region: selectedRegion,
      country: selectedCountry,
      description: description.trim(),
      phone: phone.trim(),
      author: finalAuthor,
      telegram: telegram.trim() ? telegram.trim().replace('@', '') : undefined,
      status: 'active',
      createdAt: Date.now()
    };

    // Dispatch to Webhook in background
    dispatchToWebhook(newItem).catch((err) => console.warn('Webhook error:', err));

    onSubmit(newItem);
    setSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-2xs p-0 sm:p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 shrink-0 bg-slate-50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">✍️</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Новое объявление
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body / Form */}
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-slate-900">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-bold">
                ⚠️ {error}
              </div>
            )}

            {/* 1. ВЫБОР ТИПА (1 КЛИК) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                1. Что нужно сделать?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('request')}
                  className={`py-3 px-3 rounded-xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    type === 'request'
                      ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>🆘</span>
                  <span>Нужна помощь</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('offer')}
                  className={`py-3 px-3 rounded-xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    type === 'offer'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>🤝</span>
                  <span>Могу помочь</span>
                </button>
              </div>
            </div>

            {/* 2. ВЫБОР КАТЕГОРИИ (2 КЛИК) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                2. Категория
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Transport */}
                <button
                  type="button"
                  onClick={() => setCategory('transport')}
                  className={`p-2.5 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                    category === 'transport'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">🚗</span>
                  <span className="leading-tight text-center">Транспорт</span>
                </button>

                {/* Medicine */}
                <button
                  type="button"
                  onClick={() => setCategory('medicine')}
                  className={`p-2.5 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                    category === 'medicine'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">💊</span>
                  <span className="leading-tight text-center">Лекарства</span>
                </button>

                {/* Household */}
                <button
                  type="button"
                  onClick={() => setCategory('household')}
                  className={`p-2.5 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                    category === 'household'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">🛠️</span>
                  <span className="leading-tight text-center">Быт / Срочно</span>
                </button>
              </div>
            </div>

            {/* 3. НАСЕЛЕННЫЙ ПУНКТ (3 КЛИК С ПОИСКОМ ПО РФ, БЕЛАРУСИ, КАЗАХСТАНУ, СНГ) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  3. Населенный пункт
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomVillage(!isCustomVillage)}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  {isCustomVillage ? 'Выбрать из базы' : '+ Вписать вручную'}
                </button>
              </div>

              {isCustomVillage ? (
                <input
                  type="text"
                  value={customVillageText}
                  onChange={(e) => setCustomVillageText(e.target.value)}
                  placeholder="Напишите название деревни, села или посёлка"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  autoFocus
                />
              ) : (
                <div className="space-y-2">
                  {/* Big Button to open full location directory */}
                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-500 rounded-xl flex items-center justify-between text-left transition-colors group shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-black text-emerald-950 truncate">
                          {settlement || 'Выберите село или деревню'}
                        </div>
                        {selectedRegion && (
                          <div className="text-[11px] text-emerald-700 font-medium truncate">
                            {selectedRegion} {selectedCountry ? `(${selectedCountry})` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shrink-0 flex items-center gap-1 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Search className="w-3 h-3" />
                      <span>Каталог РФ / СНГ</span>
                    </span>
                  </button>

                  {/* Fast popular picks */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-400">Быстро:</span>
                    {POPULAR_VILLAGES.slice(0, 6).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setSettlement(v);
                          const found = EXPANDED_LOCATIONS.find((loc) => loc.name === v);
                          if (found) {
                            setSelectedRegion(found.region);
                            setSelectedCountry(found.countryName);
                          }
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
                          settlement === v
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. ОПИСАНИЕ (1-2 предложения) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                4. Описание (1-2 предложения)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  type === 'request'
                    ? 'Например: Нужна попутка до райцентра во вторник к 9:00 или привезти лекарства из аптеки.'
                    : 'Например: Еду завтра в райцентр, могу взять попутчика или привезти продукты.'
                }
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
              />
            </div>

            {/* 5. КОНТАКТЫ (Имя + Телефон) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Ваше Имя
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Иван Иванович"
                    className="w-full pl-9 bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Телефон для звонков
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (921) 000-00-00"
                    className="w-full pl-9 bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Telegram / VK (optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Telegram для сообщений (необязательно)
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>
                  {type === 'request' ? 'Опубликовать просьбу' : 'Опубликовать предложение'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sub-Modal: Full Location Directory */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        selectedLocation={settlement}
        onSelect={handleSelectFromPicker}
        allowAll={false}
        title="Выберите ваше село или деревню"
      />
    </>
  );
};
