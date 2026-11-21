import React, { useState, useRef } from 'react';
import { Entrepreneur, PriceListItem, USTYANY_VILLAGES } from '../../types';
import { 
  Trash2, Plus, ArrowLeft, Save, MapPin, Calendar, ListPlus, 
  Upload, FileText, Palette, Sparkles, Building2, BookOpen, AlertCircle
} from 'lucide-react';

interface DeliveryFormProps {
  currentUserId: string;
  contactPhone: string;
  onSave: (entr: Entrepreneur) => void;
  onCancel: () => void;
  existingEntrepreneur?: Entrepreneur;
}

const WEEKDAYS = [
  { key: 'monday', label: 'Понедельник' },
  { key: 'tuesday', label: 'Вторник' },
  { key: 'wednesday', label: 'Среда' },
  { key: 'thursday', label: 'Четверг' },
  { key: 'friday', label: 'Пятница' },
  { key: 'saturday', label: 'Суббота' },
  { key: 'sunday', label: 'Воскресенье' }
];

// Visual Theme Color Presets
const THEME_PRESETS = [
  { id: 'emerald', name: 'Зеленый фермерский', primary: '#10b981', bg: '#ecfdf5', text: '#065f46' },
  { id: 'amber', name: 'Солнечный улей', primary: '#f59e0b', bg: '#fef3c7', text: '#78350f' },
  { id: 'blue', name: 'Синяя прохлада', primary: '#3b82f6', bg: '#eff6ff', text: '#1e3a8a' },
  { id: 'purple', name: 'Душистая лаванда', primary: '#8b5cf6', bg: '#f5f3ff', text: '#4c1d95' },
  { id: 'rose', name: 'Свежая малина', primary: '#f43f5e', bg: '#fff1f2', text: '#881337' }
];

// Cover Presets
const COVER_PRESETS = [
  { name: '🌾 Пшеничное поле', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60' },
  { name: '🥛 Сельский хутор', url: 'https://images.unsplash.com/photo-1500595044483-cd3c906cef5a?w=800&auto=format&fit=crop&q=60' },
  { name: '🍓 Летний сад', url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c3aa?w=800&auto=format&fit=crop&q=60' },
  { name: '🚜 Уютная усадьба', url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=60' }
];

// Logo Presets
const LOGO_PRESETS = [
  { name: '🐮 Коровка', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=150&auto=format&fit=crop&q=60' },
  { name: '🧀 Сырная лавка', url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=150&auto=format&fit=crop&q=60' },
  { name: '🍯 Медок', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150&auto=format&fit=crop&q=60' },
  { name: '🍞 Хлебушек', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=60' }
];

export default function DeliveryForm({
  currentUserId,
  contactPhone,
  onSave,
  onCancel,
  existingEntrepreneur
}: DeliveryFormProps) {
  const [businessName, setBusinessName] = useState(existingEntrepreneur?.businessName || '');
  const [phone, setPhone] = useState(existingEntrepreneur?.contactPhone || contactPhone || '');
  const [serviceRadius, setServiceRadius] = useState<number>(existingEntrepreneur?.serviceRadius || 30);
  const [village, setVillage] = useState(existingEntrepreneur?.village || USTYANY_VILLAGES[0].name);
  const [address, setAddress] = useState(existingEntrepreneur?.address || '');
  const [description, setDescription] = useState(existingEntrepreneur?.description || '');
  
  // Custom Branding states
  const [themeColor, setThemeColor] = useState(existingEntrepreneur?.themeColor || 'emerald');
  const [coverUrl, setCoverUrl] = useState(existingEntrepreneur?.coverUrl || COVER_PRESETS[0].url);
  const [logoUrl, setLogoUrl] = useState(existingEntrepreneur?.logoUrl || LOGO_PRESETS[0].url);

  // File Upload / Parsing simulation states
  const [isDragging, setIsDragging] = useState(false);
  const [parseProgress, setParseProgress] = useState<number | null>(null);
  const [parseStatus, setParseStatus] = useState<string>('');
  const [importCount, setImportCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Weekly Delivery schedule mapping (day of week -> array of villages)
  const [schedule, setSchedule] = useState<Record<string, string[]>>(() => {
    if (existingEntrepreneur?.deliverySchedule) {
      return { ...existingEntrepreneur.deliverySchedule };
    }
    return {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };
  });

  // Price list state
  const [priceList, setPriceList] = useState<PriceListItem[]>(() => {
    if (existingEntrepreneur?.priceList && existingEntrepreneur.priceList.length > 0) {
      return [...existingEntrepreneur.priceList];
    }
    return [
      { item: 'Молоко коровье парное 3.6%', price: 90, unit: 'литр' },
      { item: 'Творог деревенский жирный', price: 280, unit: 'кг' },
      { item: 'Сметана густая домашняя', price: 160, unit: 'банка' }
    ];
  });

  // Track currently active day for editing village map in UI
  const [activeDay, setActiveDay] = useState<string>('monday');

  // Input formatting helper for phone
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) {
      setPhone('');
      return;
    }
    let formatted = '+7 ';
    if (digits.length > 1) {
      const isSevenOrEight = digits[0] === '7' || digits[0] === '8';
      const sliceStart = isSevenOrEight ? 1 : 0;
      const mainDigits = digits.slice(sliceStart);
      
      if (mainDigits.length > 0) {
        formatted += `(${mainDigits.slice(0, 3)}`;
      }
      if (mainDigits.slice(3).length > 0) {
        formatted += `) ${mainDigits.slice(3, 6)}`;
      }
      if (mainDigits.slice(6).length > 0) {
        formatted += `-${mainDigits.slice(6, 8)}`;
      }
      if (mainDigits.slice(8).length > 0) {
        formatted += `-${mainDigits.slice(8, 10)}`;
      }
    }
    setPhone(formatted);
  };

  // Add item to price list
  const handleAddPriceItem = () => {
    setPriceList([...priceList, { item: '', price: 100, unit: 'шт' }]);
  };

  // Remove item from price list
  const handleRemovePriceItem = (index: number) => {
    const list = [...priceList];
    list.splice(index, 1);
    setPriceList(list);
  };

  // Edit item inside price list
  const handleEditPriceItem = (index: number, field: keyof PriceListItem, value: any) => {
    const list = [...priceList];
    if (field === 'price') {
      list[index][field] = Number(value) || 0;
    } else {
      list[index][field] = value;
    }
    setPriceList(list);
  };

  // Toggle village delivery on a specific weekday
  const handleToggleVillage = (day: string, villageName: string) => {
    const currentVillages = schedule[day] || [];
    let updated: string[];
    if (currentVillages.includes(villageName)) {
      updated = currentVillages.filter(v => v !== villageName);
    } else {
      updated = [...currentVillages, villageName];
    }
    setSchedule({
      ...schedule,
      [day]: updated
    });
  };

  const handleSelectAllVillagesForDay = (day: string) => {
    const allNames = USTYANY_VILLAGES.map(v => v.name);
    const currentVillages = schedule[day] || [];
    const isAllSelected = currentVillages.length === allNames.length;
    
    setSchedule({
      ...schedule,
      [day]: isAllSelected ? [] : allNames
    });
  };

  // Excel / CSV File Parsing Simulator
  const simulateFileParsing = (fileName: string) => {
    setParseProgress(0);
    setParseStatus('Загрузка файла...');
    
    setTimeout(() => {
      setParseProgress(25);
      setParseStatus(`Чтение колонок в ${fileName}...`);
      
      setTimeout(() => {
        setParseProgress(60);
        setParseStatus('Секвенирование структуры прайс-листа...');
        
        setTimeout(() => {
          setParseProgress(90);
          setParseStatus('Сопоставление единиц измерения и стоимости...');
          
          setTimeout(() => {
            // Extracted products
            const parsedItems: PriceListItem[] = [
              { item: 'Масло крестьянское сладкосливочное 82.5%', price: 340, unit: 'упак' },
              { item: 'Сыр адыгейский домашний', price: 420, unit: 'кг' },
              { item: 'Яйца цесариные диетические', price: 210, unit: 'дес' },
              { item: 'Мед разнотравье золотистый', price: 650, unit: 'банка' },
              { item: 'Картофель отборный Устьянский', price: 45, unit: 'кг' }
            ];
            
            setPriceList((prev) => {
              // filter out empty items first
              const filteredPrev = prev.filter(p => p.item.trim() !== '');
              return [...filteredPrev, ...parsedItems];
            });
            
            setImportCount(parsedItems.length);
            setParseProgress(100);
            setParseStatus('Импорт завершен успешно!');
            
            setTimeout(() => {
              setParseProgress(null);
              setParseStatus('');
            }, 3000);
            
          }, 600);
        }, 600);
      }, 700);
    }, 500);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      simulateFileParsing(file.name);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateFileParsing(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      alert('Пожалуйста, введите название ИП или форму самозанятости');
      return;
    }

    if (!phone.trim()) {
      alert('Пожалуйста, введите контактный телефон');
      return;
    }

    // Clean price list
    const cleanPriceList = priceList.filter(p => p.item.trim() !== '');
    if (cleanPriceList.length === 0) {
      alert('Пожалуйста, добавьте хотя бы один товар в прайс-лист');
      return;
    }

    const savedEntrepreneur: Entrepreneur = {
      id: existingEntrepreneur?.id || `entr_${currentUserId}`,
      userId: currentUserId,
      businessName: businessName.trim(),
      contactPhone: phone.trim(),
      serviceRadius,
      deliverySchedule: schedule,
      priceList: cleanPriceList,
      isActive: existingEntrepreneur ? existingEntrepreneur.isActive : true,
      moderationStatus: existingEntrepreneur ? existingEntrepreneur.moderationStatus : 'pending',
      rating: existingEntrepreneur?.rating || {
        average: 5.0,
        totalReviews: 0,
        onTimePercentage: 100
      },
      isVerified: existingEntrepreneur ? existingEntrepreneur.isVerified : false,
      createdAt: existingEntrepreneur ? existingEntrepreneur.createdAt : new Date().toISOString(),
      
      // Premium fields
      logoUrl,
      coverUrl,
      themeColor,
      address: address.trim(),
      description: description.trim(),
      village
    };

    onSave(savedEntrepreneur);
  };

  const selectedThemePreset = THEME_PRESETS.find(t => t.id === themeColor) || THEME_PRESETS[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs max-w-4xl mx-auto" id="delivery_form">
      
      {/* Header banner */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          type="button"
          className="p-2.5 bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 leading-tight">
            {existingEntrepreneur ? 'Редактировать профиль лавки' : 'Регистрация новой лавки / хозяйства'}
          </h2>
          <p className="text-xs text-slate-500 font-bold">
            Организуйте качественную поставку натуральной продукции в деревни Устьянского района с собственным брендингом
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Real-time Shop Style Preview Box */}
        <div 
          className="rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative"
          style={{ backgroundColor: selectedThemePreset.bg }}
        >
          {/* Cover photo preview */}
          <div className="h-28 w-full relative bg-slate-100">
            <img 
              src={coverUrl || COVER_PRESETS[0].url} 
              alt="cover" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-black uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                Предпросмотр баннера
              </span>
            </div>
          </div>

          {/* Business Info Layer */}
          <div className="p-4 flex gap-4 items-start relative">
            <div className="w-16 h-16 rounded-2xl border-2 border-white bg-white overflow-hidden shadow-sm shrink-0 -mt-10 z-10 relative">
              <img 
                src={logoUrl || LOGO_PRESETS[0].url} 
                alt="logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5 leading-tight">
                {businessName || 'Название вашей фермы / бренда'}
                <span className="bg-white/80 text-[9px] px-1.5 py-0.5 rounded-full border text-slate-500">
                  {selectedThemePreset.name}
                </span>
              </h3>
              <p className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                <MapPin size={10} style={{ color: selectedThemePreset.primary }} />
                <span>База: с. {village} {address ? `, ${address}` : ''}</span>
              </p>
              {description && (
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-xl italic line-clamp-2">
                  « {description} »
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 1. Main Details & Core Settings */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150/60 space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 size={14} className="text-slate-500" />
            <span>📝 Сведения о хозяйстве</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-500">Название лавки / ИП / КФХ</label>
              <input
                type="text"
                required
                placeholder="Например: КФХ Устьянские Росы / Лавка Дяди Степы"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-xs font-bold shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-500">Контактный телефон для заказов</label>
              <input
                type="text"
                required
                placeholder="+7 (900) 000-00-00"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-xs font-bold font-mono shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-500">Опорный пункт (Родное село хозяйства)</label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-xs font-bold shadow-xs cursor-pointer"
              >
                {USTYANY_VILLAGES.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-500">Физический адрес лавки / складской фермы</label>
              <input
                type="text"
                placeholder="Например: ул. Центральная, д. 14Б"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-xs font-bold shadow-xs"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-black text-slate-500">Красивое описание хозяйства / фермы</label>
              <textarea
                placeholder="Расскажите покупателям о качестве вашей продукции: свое поголовье коров, без химии, только свежие корма, ручная выпечка..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-xs font-bold shadow-xs resize-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Visual Theme & Branding Customization */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150/60 space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Palette size={14} className="text-slate-500" />
            <span>🎨 Индивидуальное оформление вашей лавки</span>
          </h3>

          <div className="space-y-4">
            {/* Color themes presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 block">Цветовая схема магазина</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {THEME_PRESETS.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeColor(theme.id)}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-black flex items-center gap-1.5 justify-center transition-all ${
                      themeColor === theme.id 
                        ? 'border-slate-800 text-slate-900 shadow-sm font-black' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <span>{theme.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo URL & Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 block">Логотип хозяйства</label>
                <input
                  type="text"
                  placeholder="Ссылка на изображение логотипа..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-[10px] font-mono font-bold shadow-xs"
                />
                <div className="flex gap-2 items-center">
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">Или выберите пресет:</span>
                  <div className="flex gap-1.5 overflow-x-auto py-0.5 pr-1">
                    {LOGO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLogoUrl(preset.url)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-lg border bg-white transition-all hover:bg-slate-100 ${
                          logoUrl === preset.url ? 'border-brand-medium text-brand-dark bg-brand-light/20' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover URL & Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 block">Фоновый баннер магазина</label>
                <input
                  type="text"
                  placeholder="Ссылка на обложку..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-[10px] font-mono font-bold shadow-xs"
                />
                <div className="flex gap-2 items-center">
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">Или выберите пресет:</span>
                  <div className="flex gap-1.5 overflow-x-auto py-0.5 pr-1">
                    {COVER_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoverUrl(preset.url)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-lg border bg-white transition-all hover:bg-slate-100 ${
                          coverUrl === preset.url ? 'border-brand-medium text-brand-dark bg-brand-light/20' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Radius & Location Delivery Area */}
        <div className="border border-slate-200 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar size={14} className="text-brand-medium" />
              <span>🗺️ Маршруты и календарь привоза по дням</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">Радиус выезда от базы:</span>
              <select
                value={serviceRadius}
                onChange={(e) => setServiceRadius(Number(e.target.value))}
                className="bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-[10px] px-2 py-1 rounded-lg cursor-pointer"
              >
                <option value={10}>10 км (Окрестности)</option>
                <option value={20}>20 км</option>
                <option value={30}>30 км (Оптимальный)</option>
                <option value={50}>50 км</option>
                <option value={100}>100 км (Район)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weekdays selection column */}
            <div className="flex flex-col gap-1 pr-1 border-r border-slate-100">
              {WEEKDAYS.map(day => {
                const villagesCount = schedule[day.key]?.length || 0;
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setActiveDay(day.key)}
                    className={`px-3 py-2.5 rounded-xl text-left text-xs font-black transition-all cursor-pointer flex justify-between items-center ${
                      activeDay === day.key
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{day.label}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${
                      activeDay === day.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {villagesCount} сёл
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Target villages grid */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="text-[11px] font-black text-slate-800">
                  Выезд в: <span className="text-brand-medium">{WEEKDAYS.find(w => w.key === activeDay)?.label}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectAllVillagesForDay(activeDay)}
                  className="text-[10px] font-extrabold text-brand-medium hover:underline cursor-pointer"
                >
                  Выбрать все села района
                </button>
              </div>

              {/* Scrollable list */}
              <div className="grid grid-cols-2 gap-1.5 h-44 overflow-y-auto pr-1 border border-slate-100 p-2 rounded-xl">
                {USTYANY_VILLAGES.map(v => {
                  const isChecked = schedule[activeDay]?.includes(v.name);
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleToggleVillage(activeDay, v.name)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-black shadow-inner' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin size={11} className={isChecked ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="text-[10px] truncate">{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Price List & Import Block */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
          
          {/* Section title & CSV Import Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <ListPlus size={14} className="text-brand-medium" />
                <span>📋 Прайс-лист предлагаемых товаров</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Добавьте товары вручную или загрузите файл ведомости</p>
            </div>
            
            <button
              type="button"
              onClick={handleAddPriceItem}
              className="bg-slate-800 hover:bg-slate-750 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ml-auto sm:ml-0"
            >
              <Plus size={13} />
              <span>Добавить строку</span>
            </button>
          </div>

          {/* DRAG AND DROP EXCEL/CSV IMPORT BOX */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-brand-medium bg-brand-light/10 text-brand-dark' 
                : 'border-slate-250 bg-slate-50 hover:bg-slate-100/70 text-slate-500'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelectChange} 
              accept=".csv,.xls,.xlsx" 
              className="hidden" 
            />
            
            {parseProgress !== null ? (
              <div className="space-y-2 py-2">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="animate-pulse text-brand-medium" size={24} />
                  <span className="text-xs font-black text-slate-800">{parseStatus}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div className="bg-brand-medium h-full transition-all duration-300" style={{ width: `${parseProgress}%` }} />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{parseProgress}%</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Upload size={18} className="text-slate-400" />
                  <span className="text-xs font-black text-slate-700">Импорт прайс-листа из файла Excel / CSV</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">
                  Перетащите сюда файл каталога .xlsx, .xls или .csv или кликните для выбора
                </p>
                {importCount > 0 && (
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-black mt-1">
                    <Sparkles size={10} />
                    <span>Успешно импортировано {importCount} продуктов!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dynamic manual rows list */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {priceList.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs hover:border-slate-350 transition-all"
              >
                {/* Product Name */}
                <input
                  type="text"
                  required
                  placeholder="Название продукта (например: Сметана домашняя 20%, Творог фермерский...)"
                  value={item.item}
                  onChange={(e) => handleEditPriceItem(index, 'item', e.target.value)}
                  className="w-full sm:flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-medium focus:outline-none rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />

                <div className="flex gap-2 w-full sm:w-auto items-center">
                  {/* Price */}
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Цена"
                      value={item.price}
                      onChange={(e) => handleEditPriceItem(index, 'price', e.target.value)}
                      className="w-20 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-medium focus:outline-none rounded-xl px-2.5 py-1.5 text-xs text-center font-black text-brand-medium"
                    />
                    <span className="text-xs font-bold text-slate-400">₽</span>
                  </div>

                  {/* Unit */}
                  <select
                    value={item.unit}
                    onChange={(e) => handleEditPriceItem(index, 'unit', e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold cursor-pointer shrink-0"
                  >
                    <option value="кг">кг</option>
                    <option value="литр">литр</option>
                    <option value="шт">шт</option>
                    <option value="дес">дес</option>
                    <option value="упак">упак</option>
                    <option value="банка">банка</option>
                  </select>

                  {/* Remove row button */}
                  <button
                    type="button"
                    disabled={priceList.length <= 1}
                    onClick={() => handleRemovePriceItem(index)}
                    className={`p-1.5 rounded-xl transition-all ml-auto ${
                      priceList.length <= 1 
                        ? 'text-slate-200' 
                        : 'text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer border border-transparent hover:border-red-100'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit or Cancel block */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs transition-all cursor-pointer"
          >
            Отмена
          </button>
          
          <button
            type="submit"
            className="px-6 py-2.5 text-white font-black rounded-2xl text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
            style={{ backgroundColor: selectedThemePreset.primary }}
            id="btn_submit_entrepreneur_registration"
          >
            <Save size={14} />
            <span>{existingEntrepreneur ? 'Сохранить профиль лавки' : 'Оформить и подать заявку'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
