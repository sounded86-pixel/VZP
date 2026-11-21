import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Award, Download, Printer, ShoppingBag, Check, RefreshCw, 
  Sparkles, ArrowLeft, Info, Eye, ShieldCheck, Share2, Hammer
} from 'lucide-react';
import { VillageHouse, InteractiveVillage, VillageResident, PlaqueStyle, MemorialPlaqueConfig } from '../../types';

interface MemorialPlaqueBuilderProps {
  house: VillageHouse;
  village: InteractiveVillage;
  residents: VillageResident[];
  onBack: () => void;
  onSavePlaque?: (config: MemorialPlaqueConfig) => void;
}

export const MemorialPlaqueBuilder: React.FC<MemorialPlaqueBuilderProps> = ({
  house,
  village,
  residents,
  onBack,
  onSavePlaque
}) => {
  // Default values based on house & residents
  const houseResidents = residents.filter(r => house.residents.includes(r.id));
  const oldestResident = [...houseResidents].sort((a, b) => a.birthYear - b.birthYear)[0];
  
  // Extract family name if available
  const defaultFamilyName = oldestResident 
    ? oldestResident.name.split(' ')[2] || oldestResident.name.split(' ')[0] 
    : 'СЕМЬИ';

  const [style, setStyle] = useState<PlaqueStyle>(house.memorialPlaque?.style || 'wood');
  const [title, setTitle] = useState(
    house.memorialPlaque?.title || `ДОМ ${defaultFamilyName.toUpperCase()}`
  );
  const [subtitle, setSubtitle] = useState(
    house.memorialPlaque?.subtitle || `Родовое гнездо с ${house.yearBuilt} года`
  );
  const [addressText, setAddressText] = useState(
    house.memorialPlaque?.addressText || `д. ${village.name}, ${house.address}`
  );
  const [customQuote, setCustomQuote] = useState(
    house.memorialPlaque?.customQuote || '«Помни корни свои, храни тепло родного очага»'
  );
  const [selectedResidents, setSelectedResidents] = useState<string[]>(
    house.memorialPlaque?.foundersNames || houseResidents.slice(0, 3).map(r => 
      `${r.name} (${r.birthYear}–${r.deathYear || 'н.в.'})`
    )
  );
  const [includeQr, setIncludeQr] = useState<boolean>(
    house.memorialPlaque?.includeQr !== false
  );

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderMaterial, setOrderMaterial] = useState<'solid_oak' | 'brass_plated' | 'granite' | 'enameled_steel'>('solid_oak');
  const [orderComments, setOrderComments] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);

  const plaqueRef = useRef<HTMLDivElement>(null);

  // Generate QR Code that encodes URL to this house
  useEffect(() => {
    const currentUrl = window.location.href.split('#')[0];
    const qrPayload = `${currentUrl}?village=${village.id}&house=${house.id}`;
    
    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 1,
      color: {
        dark: style === 'brass' ? '#3d2504' : style === 'granite' ? '#111827' : '#271b10',
        light: '#00000000' // transparent background
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [village.id, house.id, style]);

  const handleToggleResident = (resStr: string) => {
    if (selectedResidents.includes(resStr)) {
      setSelectedResidents(prev => prev.filter(r => r !== resStr));
    } else {
      setSelectedResidents(prev => [...prev, resStr]);
    }
  };

  const handleSave = () => {
    const config: MemorialPlaqueConfig = {
      houseId: house.id,
      villageId: village.id,
      title,
      subtitle,
      foundersNames: selectedResidents,
      addressText,
      style,
      customQuote,
      includeQr,
      orderRequested: orderSubmitted,
      createdAt: new Date().toISOString()
    };
    if (onSavePlaque) {
      onSavePlaque(config);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/html printable export
    const plaqueEl = plaqueRef.current;
    if (!plaqueEl) return;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Именная табличка — ${title}</title>
            <style>
              body { font-family: 'Times New Roman', serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; }
              .card { border: 4px double #451a03; padding: 40px; border-radius: 12px; max-width: 600px; text-align: center; background: #fffbeb; }
              h1 { font-size: 28px; margin: 0 0 10px; color: #451a03; letter-spacing: 2px; }
              h2 { font-size: 16px; margin: 0 0 20px; color: #78350f; font-style: italic; }
              .names { margin: 20px 0; font-size: 15px; color: #1c1917; line-height: 1.8; }
              .quote { font-style: italic; color: #78350f; margin: 20px 0; }
              .address { font-weight: bold; margin-top: 20px; color: #451a03; }
              .qr { margin-top: 15px; }
              @media print { body { background: none; } }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${title}</h1>
              <h2>${subtitle}</h2>
              <div class="names">
                ${selectedResidents.map(n => `<div>• ${n}</div>`).join('')}
              </div>
              <div class="quote">${customQuote}</div>
              <div class="address">📍 ${addressText}</div>
              ${includeQr && qrDataUrl ? `<div class="qr"><img src="${qrDataUrl}" width="120" height="120" /><br><small style="font-family:sans-serif;color:#666">Наведите камеру, чтобы открыть историю дома</small></div>` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName.trim() || !orderPhone.trim()) return;
    setOrderSubmitted(true);
    setShowOrderModal(false);
    handleSave();
  };

  // Styles configuration for realistic visual preview
  const getStyleClasses = () => {
    switch (style) {
      case 'wood':
        return {
          container: 'bg-[#5c3a21] text-[#fef3c7] border-[#854d0e] shadow-2xl',
          innerBorder: 'border-2 border-amber-400/40',
          ornament: 'text-amber-300',
          title: 'text-amber-200 font-serif tracking-widest',
          sub: 'text-amber-300/80',
          quote: 'text-amber-200/90 italic font-serif',
          address: 'text-amber-300 font-semibold',
          qrBorder: 'bg-amber-100/90 p-2 rounded-lg border border-amber-400/50'
        };
      case 'brass':
        return {
          container: 'bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] text-[#fef3c7] border-[#f59e0b] shadow-2xl',
          innerBorder: 'border-2 border-amber-200/60 shadow-inner',
          ornament: 'text-amber-200',
          title: 'text-amber-100 font-serif tracking-widest drop-shadow-md',
          sub: 'text-amber-100/80',
          quote: 'text-amber-100/90 italic font-serif',
          address: 'text-amber-100 font-semibold',
          qrBorder: 'bg-amber-50 p-2 rounded-lg border border-amber-300'
        };
      case 'granite':
        return {
          container: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-slate-100 border-zinc-700 shadow-2xl',
          innerBorder: 'border-2 border-zinc-500/40',
          ornament: 'text-zinc-400',
          title: 'text-zinc-100 font-serif tracking-widest drop-shadow-sm',
          sub: 'text-zinc-400',
          quote: 'text-zinc-300 italic font-serif',
          address: 'text-zinc-200 font-semibold',
          qrBorder: 'bg-white p-2 rounded-lg border border-zinc-400'
        };
      case 'classic':
      default:
        return {
          container: 'bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white border-blue-500 shadow-2xl',
          innerBorder: 'border-2 border-white/50',
          ornament: 'text-blue-300',
          title: 'text-white font-sans font-black tracking-wider uppercase',
          sub: 'text-blue-200',
          quote: 'text-blue-100 italic',
          address: 'text-blue-200 font-semibold',
          qrBorder: 'bg-white p-2 rounded-lg border border-blue-300'
        };
    }
  };

  const styleConfig = getStyleClasses();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Назад к дому"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                📛 Именная табличка для дома
              </h2>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                Физический элемент памяти
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Создайте макет фасадной таблички с QR-кодом для перехода в цифровой архив дома
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} />
            <span>Печать</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download size={14} />
            <span>Скачать макет</span>
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <ShoppingBag size={14} />
            <span>Заказать изготовление</span>
          </button>
        </div>
      </div>

      {orderSubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">Заявка на изготовление таблички принята!</span>
            Мастер по художественной обработке свяжется с вами по указанному телефону для согласования макета и сроков доставки.
          </div>
        </div>
      )}

      {/* Main Grid: Live Preview & Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Visual Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/5 p-4 sm:p-8 rounded-3xl border border-slate-200/80 flex items-center justify-center min-h-[420px]">
            {/* The Physical Plaque Mockup */}
            <div
              ref={plaqueRef}
              className={`w-full max-w-xl rounded-2xl p-6 sm:p-8 border-4 transition-all duration-300 relative overflow-hidden ${styleConfig.container}`}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Corner Screws / Rivets Effect */}
              <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-amber-200/70 border border-amber-900/40 shadow-inner flex items-center justify-center">
                <div className="w-2 h-0.5 bg-amber-900/60 rotate-45"></div>
              </div>
              <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-amber-200/70 border border-amber-900/40 shadow-inner flex items-center justify-center">
                <div className="w-2 h-0.5 bg-amber-900/60 -rotate-45"></div>
              </div>
              <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full bg-amber-200/70 border border-amber-900/40 shadow-inner flex items-center justify-center">
                <div className="w-2 h-0.5 bg-amber-900/60 -rotate-12"></div>
              </div>
              <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-amber-200/70 border border-amber-900/40 shadow-inner flex items-center justify-center">
                <div className="w-2 h-0.5 bg-amber-900/60 rotate-12"></div>
              </div>

              {/* Inner Decorative Border */}
              <div className={`p-5 sm:p-6 rounded-xl ${styleConfig.innerBorder} relative`}>
                {/* Traditional North Ornamental Flourish */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-[1px] w-12 bg-current opacity-40"></div>
                  <span className={`text-xs uppercase tracking-widest font-bold ${styleConfig.ornament}`}>
                    ✦ НАРОДНАЯ ЛЕТОПИСЬ ✦
                  </span>
                  <div className="h-[1px] w-12 bg-current opacity-40"></div>
                </div>

                {/* Main Plaque Title */}
                <h3 className={`text-center text-xl sm:text-2xl font-black mb-1 ${styleConfig.title}`}>
                  {title || 'ДОМ ПЕТРОВЫХ'}
                </h3>

                {/* Subtitle */}
                {subtitle && (
                  <p className={`text-center text-xs sm:text-sm mb-4 font-medium ${styleConfig.sub}`}>
                    {subtitle}
                  </p>
                )}

                {/* Divider */}
                <div className="w-24 h-[1px] bg-current opacity-30 mx-auto my-3"></div>

                {/* Selected Residents List */}
                {selectedResidents.length > 0 && (
                  <div className="my-4 space-y-1 text-center">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-75 mb-1.5">
                      Основатели и хранители дома:
                    </p>
                    {selectedResidents.map((name, i) => (
                      <div key={i} className="text-xs sm:text-sm font-medium tracking-wide">
                        {name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Family Quote */}
                {customQuote && (
                  <p className={`text-center text-xs sm:text-sm my-3 ${styleConfig.quote}`}>
                    {customQuote}
                  </p>
                )}

                {/* Address & QR Code Row */}
                <div className="mt-5 pt-4 border-t border-current/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-wider block opacity-70">
                      Адрес поземельной книги:
                    </span>
                    <span className={`text-xs sm:text-sm ${styleConfig.address}`}>
                      📍 {addressText}
                    </span>
                  </div>

                  {includeQr && qrDataUrl && (
                    <div className="flex items-center gap-2.5">
                      <div className={styleConfig.qrBorder}>
                        <img 
                          src={qrDataUrl} 
                          alt="QR Code" 
                          className="w-16 h-16 sm:w-18 sm:h-18 object-contain"
                        />
                      </div>
                      <div className="text-[9px] max-w-[100px] text-left leading-tight opacity-80">
                        <span className="font-bold block">QR-код архива</span>
                        Наведите камеру смартфона для просмотра истории
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick tip */}
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Как это работает в деревне:</span>
              Табличка крепится на фасад дома или калитку. Любой гость, потомок или односельчанин наводит камеру смартфона на QR-код и сразу видит фотографии жителей дома, их биографии, родословные связи и воспоминания.
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-5 space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
            Настройки оформления таблички
          </h3>

          {/* 1. Style Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Материал и стиль оформления
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStyle('wood')}
                className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                  style === 'wood' 
                    ? 'border-amber-700 bg-amber-50 ring-2 ring-amber-700/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  🪵 Морёный дуб
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Северная резьба</span>
              </button>

              <button
                type="button"
                onClick={() => setStyle('brass')}
                className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                  style === 'brass' 
                    ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-600/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                  ⚜️ Латунь / Бронза
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Благородный металл</span>
              </button>

              <button
                type="button"
                onClick={() => setStyle('granite')}
                className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                  style === 'granite' 
                    ? 'border-zinc-800 bg-zinc-50 ring-2 ring-zinc-800/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                  🪨 Гранит
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Карельский монолит</span>
              </button>

              <button
                type="button"
                onClick={() => setStyle('classic')}
                className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                  style === 'classic' 
                    ? 'border-blue-700 bg-blue-50 ring-2 ring-blue-700/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  🏛️ Классическая эмаль
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Фасадный герб</span>
              </button>
            </div>
          </div>

          {/* 2. Title & Subtitle */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Главный заголовок
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ДОМ ПЕТРОВЫХ"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Подзаголовок / исторический статус
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Родовое гнездо с 1952 года"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-medium"
              />
            </div>
          </div>

          {/* 3. Residents to Display */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Жители и основатели на табличке
              </label>
              <span className="text-[10px] text-slate-400">
                Выбрано: {selectedResidents.length}
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {houseResidents.map((res) => {
                const itemStr = `${res.name} (${res.birthYear}–${res.deathYear || 'н.в.'})`;
                const isSelected = selectedResidents.includes(itemStr);
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => handleToggleResident(itemStr)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left border ${
                      isSelected 
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate pr-2">{res.name} ({res.birthYear}–{res.deathYear || 'н.в.'})</span>
                    {isSelected ? (
                      <Check size={14} className="text-amber-700 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-400 shrink-0">+ вкл</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Family Quote / Motto */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Семейный девиз / напутствие потомкам
            </label>
            <input
              type="text"
              value={customQuote}
              onChange={(e) => setCustomQuote(e.target.value)}
              placeholder="«Помни корни свои, храни тепло родного очага»"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-medium"
            />
          </div>

          {/* 5. Address text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Адрес дома
            </label>
            <input
              type="text"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="д. Лихачёво, ул. Центральная, д. 5"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-medium"
            />
          </div>

          {/* 6. QR Code toggle */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Разместить QR-код</span>
              <span className="text-[10px] text-slate-500">
                Ведёт прямо на цифровую страницу этого дома
              </span>
            </div>
            <input
              type="checkbox"
              checked={includeQr}
              onChange={(e) => setIncludeQr(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Save Configuration Button */}
          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
          >
            <Check size={14} />
            <span>Сохранить макет для этого дома</span>
          </button>
        </div>
      </div>

      {/* Order Manufacturing Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Hammer className="text-amber-700" size={20} />
                <h3 className="font-black text-slate-900 text-base">
                  Заказ на изготовление именной таблички
                </h3>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Табличку изготовят местные мастера-ремесленники Устьянского района с лазерной гравировкой QR-кода и атмосферостойким защитным покрытием.
            </p>

            <form onSubmit={handleOrderSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Материал таблички:
                </label>
                <select
                  value={orderMaterial}
                  onChange={(e: any) => setOrderMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="solid_oak">Массив лиственницы / дуба с резным орнаментом (3 500 ₽)</option>
                  <option value="brass_plated">Латунь с полировкой и гравировкой (4 800 ₽)</option>
                  <option value="granite">Карельский полированный гранит (6 200 ₽)</option>
                  <option value="enameled_steel">Металлоэмалевая табличка стойкая к морозам (2 900 ₽)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ваше имя:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Иван Петров"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Телефон для связи:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (911) 000-00-00"
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Пожелания к заказу (размер, крепеж):
                </label>
                <textarea
                  rows={2}
                  placeholder="Стандартный размер 40х25 см, крепление на деревянный фасад..."
                  value={orderComments}
                  onChange={(e) => setOrderComments(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Подтвердить заказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
