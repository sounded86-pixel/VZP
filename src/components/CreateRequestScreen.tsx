import React, { useState, useEffect } from 'react';
import { REQUEST_CATEGORIES, USTYANY_VILLAGES, HelpRequest } from '../types';
import { Flame, PenTool, ClipboardList, MapPin, Camera, Save, ArrowRight, Zap, CheckCircle2, ShieldCheck, WifiOff, Trash2, Sparkles } from 'lucide-react';
import SearchableVillageSelect from './SearchableVillageSelect';

interface CreateRequestScreenProps {
  currentUserId: string;
  authorName: string;
  authorRating: number;
  userVillage: string;
  isOffline: boolean;
  initialMode?: 'request' | 'offer';
  onSubmit: (request: {
    title: string;
    category: string;
    description: string;
    village: string;
    locationDetails?: string;
    photos: string[];
    offeredPrice?: string;
    offeredPriceType?: 'free' | '100' | '200' | '500' | '1000' | 'custom';
  }) => void;
  onNavigateToLenta: () => void;
}

export default function CreateRequestScreen({
  currentUserId,
  authorName,
  authorRating,
  userVillage,
  isOffline,
  initialMode = 'request',
  onSubmit,
  onNavigateToLenta
}: CreateRequestScreenProps) {
  const [title, setTitle] = useState(initialMode === 'offer' ? 'Предлагаю помощь: ' : '');
  const [category, setCategory] = useState('wood');
  const [description, setDescription] = useState('');
  const [village, setVillage] = useState(userVillage);
  const [locationDetails, setLocationDetails] = useState('');
  
  // Pricing state (Task 3)
  const [priceType, setPriceType] = useState<'free' | '100' | '200' | '500' | '1000' | 'custom'>('free');
  const [customPriceValue, setCustomPriceValue] = useState('');
  
  // AI Optimization states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedMessage, setOptimizedMessage] = useState('');

  const handleAIOptimize = async () => {
    if (!title.trim() && !description.trim()) {
      alert("Пожалуйста, напишите хотя бы пару слов в Заголовке или Описании, чтобы ИИ мог их улучшить!");
      return;
    }

    setIsOptimizing(true);
    setOptimizedMessage('');

    try {
      const response = await fetch('/api/deepseek/optimize-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || "Объявление о помощи",
          description: description || "Требуется помощь в деревне",
          category: category,
          targetAudience: "Жители Устьянского района"
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (data.optimizedTitle) setTitle(data.optimizedTitle);
        if (data.optimizedDescription) setDescription(data.optimizedDescription);
        setOptimizedMessage('Успешно улучшено с помощью модуля «Добрые новости»! ✨');
        setTimeout(() => setOptimizedMessage(''), 4000);
      } else {
        throw new Error(data.error || "Не удалось оптимизировать");
      }
    } catch (e: any) {
      alert(`Ошибка работы ИИ: ${e.message || "Попробуйте позже"}`);
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Photo states
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionReport, setCompressionReport] = useState<{ original: number; compressed: number } | null>(null);

  // Draft key
  const DRAFT_KEY = "ustyany_draft_request";

  // Load Draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || '');
        setCategory(parsed.category || 'wood');
        setDescription(parsed.description || '');
        setVillage(parsed.village || userVillage);
        setLocationDetails(parsed.locationDetails || '');
        if (parsed.photos) setPhotos(parsed.photos);
        if (parsed.priceType) setPriceType(parsed.priceType);
        if (parsed.customPriceValue) setCustomPriceValue(parsed.customPriceValue);
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    const draft = { title, category, description, village, locationDetails, photos, priceType, customPriceValue };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, category, description, village, locationDetails, photos, priceType, customPriceValue]);

  const clearDraft = () => {
    setTitle('');
    setDescription('');
    setLocationDetails('');
    setPhotos([]);
    setPriceType('free');
    setCustomPriceValue('');
    setCompressionReport(null);
    localStorage.removeItem(DRAFT_KEY);
  };

  const getOfferedPriceLabel = () => {
    if (priceType === 'free') return 'Бесплатно, по-соседски';
    if (priceType === '100') return '100 ₽';
    if (priceType === '200') return '200 ₽';
    if (priceType === '500') return '500 ₽';
    if (priceType === '1000') return '1000 ₽';
    if (priceType === 'custom') {
      const val = parseInt(customPriceValue, 10);
      return isNaN(val) || val <= 0 ? 'Договорная цена' : `${val} ₽`;
    }
    return 'Бесплатно, по-соседски';
  };

  // Simulating image upload and heavy 2G/3G compression
  const handlePhotoSimulate = () => {
    if (photos.length >= 3) {
      alert("Максимум 3 фотографии разрешено.");
      return;
    }

    setIsCompressing(true);
    setCompressionReport(null);

    // Simulate standard compression delay
    setTimeout(() => {
      // Pick a nice illustrative photo base64/placeholder based on category
      const mockImages: Record<string, string> = {
        wood: "https://images.unsplash.com/photo-1549241417-640a2bbd72d2?w=400&auto=format&fit=crop&q=60",
        tractor: "https://images.unsplash.com/photo-1594142426442-998801f99c85?w=400&auto=format&fit=crop&q=60",
        carpentry: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=60",
        welding: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=60",
        delivery: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&auto=format&fit=crop&q=60",
        medical: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=60",
        household: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=60",
        legal: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=60",
        other: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=60"
      };

      const selectedImg = mockImages[category] || mockImages.other;
      setPhotos([...photos, selectedImg]);
      setIsCompressing(false);

      // Report simulated data savings (800-1200px limit)
      const mockOriginal = parseFloat((2.5 + Math.random() * 3).toFixed(2)); // in MB
      const mockCompressed = Math.floor(80 + Math.random() * 60); // in KB
      setCompressionReport({
        original: mockOriginal,
        compressed: mockCompressed
      });
    }, 1200);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Пожалуйста, заполните Заголовок и Описание помощи!");
      return;
    }

    onSubmit({
      title,
      category,
      description,
      village,
      locationDetails,
      photos,
      offeredPrice: getOfferedPriceLabel(),
      offeredPriceType: priceType
    });

    // Clear saved draft on success
    clearDraft();
    onNavigateToLenta();
  };

  return (
    <div className="max-w-3xl mx-auto my-6 px-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-light/40 rounded-xl text-brand-dark">
              <ClipboardList size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Просить о помощи ("Помогите!")</h3>
              <p className="text-xs text-slate-500">Заполните поля, чтобы опубликовать объявление в районе</p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={clearDraft}
            className="text-xs text-slate-400 hover:text-rose-600 transition-all font-semibold flex items-center gap-1 border border-slate-100 hover:border-rose-100 px-3 py-1.5 rounded-lg"
            title="Очистить черновик и начать заново"
          >
            <Trash2 size={14} /> Сбросить поля
          </button>
        </div>

        {/* Info Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Anonymity Alert (3.3.2) */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Безопасность и анонимность</h5>
              <p className="text-[11px] text-blue-700 leading-relaxed mt-0.5">
                Ваш номер телефона <strong className="text-blue-900">никогда</strong> не публикуется в общей ленте. Он станет доступен откликнувшемуся только после вашего перехода в личный чат.
              </p>
            </div>
          </div>

          {/* Offline Sync Alert (4.1) */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
            <WifiOff size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Умный офлайн-режим</h5>
              <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                Если у вас сейчас слабый интернет или нет связи в лесу/деревне, не волнуйтесь! Нажмите кнопку опубликовать, объявление сохранится локально и автоматически опубликуется при появлении сети!
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="create_request_form">
          {/* Announcement Type Selector: Попросить помощи vs Предложить помощь */}
          <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (title.startsWith('Предлагаю помощь: ')) {
                  setTitle('');
                }
              }}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !title.startsWith('Предлагаю помощь: ')
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              <span>🤲 Попросить о помощи</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!title.startsWith('Предлагаю помощь: ')) {
                  setTitle('Предлагаю помощь: ' + (title ? title : ''));
                }
              }}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                title.startsWith('Предлагаю помощь: ')
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              <span>🤝 Предложить свою помощь</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1" htmlFor="request-title">
              {title.startsWith('Предлагаю помощь: ') ? 'Чем вы готовы помочь?' : 'Заголовок объявления'} <span className="text-rose-500">*</span>
            </label>
            <input
              id="request-title"
              type="text"
              maxLength={100}
              required
              placeholder={title.startsWith('Предлагаю помощь: ') ? 'Например: Расколю дрова, починю забор, помогу с ремонтом' : 'Что случилось? Коротко (например: Наколоть дрова, привезти лекарство из Октябрьского)'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-sm font-medium transition-all"
            />
            <div className="flex justify-end text-[10px] text-slate-400 mt-1">
              <span>Использовано: {title.length} из 100 символов</span>
            </div>
          </div>

          {/* Grid fields: Category and Village */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1" htmlFor="request-category">
                Категория помощи <span className="text-rose-500">*</span>
              </label>
              <select
                id="request-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-sm font-medium bg-white"
                required
              >
                {REQUEST_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1" htmlFor="request-village">
                Населенный пункт публикации <span className="text-rose-500">*</span>
              </label>
              <SearchableVillageSelect
                id="request-village"
                value={village}
                onChange={setVillage}
                placeholder="Поиск населенного пункта..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1" htmlFor="request-desc">
              Подробное описание проблемы <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="request-desc"
              required
              rows={5}
              maxLength={2000}
              placeholder="Опишите детали: какая конкретно требуется помощь, инструменты, сроки. Например: Ищу умелого плотника со своим инструментом. Нужно отремонтировать три завалившиеся ступеньки крыльца..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-sm leading-relaxed transition-all"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 flex-wrap gap-2">
              <span className="text-brand-medium font-semibold">Черновик сохраняется автоматически!</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAIOptimize}
                  disabled={isOptimizing}
                  className="text-xs text-blue-600 hover:text-blue-850 disabled:text-slate-400 font-bold flex items-center gap-1 border border-blue-100 hover:border-blue-300 disabled:border-slate-100 px-3 py-1.5 rounded-lg bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <Sparkles size={13} className={isOptimizing ? "animate-spin text-blue-500" : "text-blue-600"} />
                  {isOptimizing ? "Оптимизирую..." : "Улучшить текст с ИИ «Добрые новости»"}
                </button>
                <span>Использовано: {description.length} из 2000 символов</span>
              </div>
            </div>
            {optimizedMessage && (
              <p className="text-xs text-emerald-600 font-bold mt-1.5 animate-pulse flex items-center gap-1">
                <CheckCircle2 size={13} /> {optimizedMessage}
              </p>
            )}
          </div>

          {/* Pricing Mechanism (Task 3) */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-150 space-y-3">
            <div>
              <label className="block text-emerald-950 text-sm font-bold mb-1">
                💰 Сколько вы готовы заплатить? <span className="text-emerald-700 text-xs font-semibold">(на выбор)</span>
              </label>
              <p className="text-xs text-emerald-800">
                Укажите сумму вознаграждения за помощь или выберите помощь по-соседски. Мастер сможет согласиться или предложить свою цену.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {[
                { id: 'free', label: '🤝 Бесплатно, по-соседски' },
                { id: '100', label: '100 ₽' },
                { id: '200', label: '200 ₽' },
                { id: '500', label: '500 ₽' },
                { id: '1000', label: '1000 ₽' },
                { id: 'custom', label: '✍️ Своя сумма' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriceType(opt.id as any)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    priceType === opt.id
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white text-slate-800 border-emerald-200 hover:bg-emerald-100/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {priceType === 'custom' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Укажите вашу сумму (в рублях):
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="1"
                    placeholder="Например: 350"
                    value={customPriceValue}
                    onChange={(e) => setCustomPriceValue(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:border-emerald-600 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-sm font-bold text-slate-500">₽</span>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Location Address */}
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1" htmlFor="request-location">
              Улица / Дом / Ориентиры (Локация)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                id="request-location"
                type="text"
                placeholder="Например: ул. Набережная, дом 12, около реки Устья"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-sm font-medium transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Указывайте ориентиры, чтобы помощникам было легче сориентироваться на местности.
            </p>
          </div>

          {/* Photos Upload with simulated Compression (4.2 & 3.3.1) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-slate-700 text-sm font-bold mb-1">
              Фотографии к объявлению (максимум 3 шт.)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Добавьте фотографии дров, сломанного крыльца или рецепта лекарства, чтобы облегчить понимание.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Photo Previews */}
              {photos.map((ph, idx) => (
                <div key={idx} className="relative w-24 h-20 bg-slate-200 rounded-xl overflow-hidden group shadow-sm border border-slate-300">
                  <img src={ph} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 hover:scale-115 transition-all text-xs flex items-center justify-center shadow"
                    title="Удалить фото"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Upload Button mockup */}
              {photos.length < 3 && (
                <button
                  type="button"
                  onClick={handlePhotoSimulate}
                  disabled={isCompressing}
                  className="w-24 h-20 bg-white border-2 border-dashed border-slate-300 hover:border-brand-medium rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-brand-medium transition-all cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <Camera size={24} className={isCompressing ? "animate-spin text-brand-medium" : ""} />
                  <span className="text-[10px] font-bold mt-1.5">{isCompressing ? "Сжатие..." : "Прикрепить"}</span>
                </button>
              )}
            </div>

            {/* Compression Report (demonstrating 4.2 saving) */}
            {isCompressing && (
              <div className="mt-3 bg-brand-bg border border-brand-light/70 text-brand-dark text-xs p-2.5 rounded-xl flex items-center gap-2">
                <span className="animate-ping w-2 h-2 rounded-full bg-brand-medium"></span>
                <span>Выполняется сжатие фото до 1024px для экономии мобильного трафика 2G/3G в деревнях...</span>
              </div>
            )}

            {compressionReport && !isCompressing && (
              <div className="mt-3 bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3 rounded-xl flex items-start gap-2 animate-fadeIn">
                <Zap size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-bold uppercase tracking-wider text-[10px]">Отчет оптимизатора трафика</h6>
                  <p className="mt-0.5">
                    Фото успешно сжато! Размер уменьшен с <strong className="text-blue-900">{compressionReport.original} MB</strong> до <strong className="text-blue-900">{compressionReport.compressed} KB</strong>.
                  </p>
                  <p className="text-[10px] text-blue-600 font-semibold font-mono">Сбережено трафика: ~96% (Идеально для мобильных сетей 2G/3G).</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onNavigateToLenta}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              className={`font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow transition-all active:scale-95 text-sm ${
                isOffline
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-brand-medium hover:bg-brand-medium/90 text-white"
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff size={16} /> Сохранить в Офлайн-очередь
                </>
              ) : (
                <>
                  {title.startsWith('Предлагаю помощь: ') ? 'Опубликовать предложение' : 'Опубликовать просьбу'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
