import React, { useState, useMemo } from 'react';
import { HelpRequest, REQUEST_CATEGORIES, USTYANY_VILLAGES, UserProfile } from '../types';
import { getDistanceBetweenVillages } from '../mockData';
import { 
  Search, MapPin, Calendar, Award, MessageSquare, AlertTriangle, 
  Filter, Flame, Tractor, Hammer, Wrench, Truck, HeartPulse, Home, 
  FileText, HelpCircle, Star, Compass, Sparkles, Clock
} from 'lucide-react';

interface LentaScreenProps {
  requests: HelpRequest[];
  userVillage: string;
  onRespond: (req: HelpRequest) => void;
  onSubmitReport: (targetId: string, type: 'post' | 'user', reason: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  currentUser: UserProfile;
}

// Visual Palette mapping for each help category
const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; primary: string }> = {
  wood: { bg: 'bg-orange-50/75', border: 'border-orange-200/50', text: 'text-orange-900', primary: '#f97316' },
  tractor: { bg: 'bg-emerald-50/75', border: 'border-emerald-200/50', text: 'text-emerald-900', primary: '#10b981' },
  carpentry: { bg: 'bg-amber-50/75', border: 'border-amber-200/50', text: 'text-amber-900', primary: '#d97706' },
  welding: { bg: 'bg-blue-50/75', border: 'border-blue-200/50', text: 'text-blue-900', primary: '#3b82f6' },
  delivery: { bg: 'bg-sky-50/75', border: 'border-sky-200/50', text: 'text-sky-900', primary: '#0ea5e9' },
  medical: { bg: 'bg-red-50/75', border: 'border-red-200/50', text: 'text-red-900', primary: '#f43f5e' },
  household: { bg: 'bg-purple-50/75', border: 'border-purple-200/50', text: 'text-purple-900', primary: '#8b5cf6' },
  legal: { bg: 'bg-indigo-50/75', border: 'border-indigo-200/50', text: 'text-indigo-900', primary: '#6366f1' },
  default: { bg: 'bg-slate-50/75', border: 'border-slate-200/50', text: 'text-slate-900', primary: '#64748b' }
};

export function CategoryIcon({ catId, size = 18, className = "" }: { catId: string; size?: number; className?: string }) {
  switch (catId) {
    case "wood": return <Flame size={size} className={`text-orange-500 ${className}`} />;
    case "tractor": return <Tractor size={size} className={`text-emerald-500 ${className}`} />;
    case "carpentry": return <Hammer size={size} className={`text-amber-600 ${className}`} />;
    case "welding": return <Wrench size={size} className={`text-blue-500 ${className}`} />;
    case "delivery": return <Truck size={size} className={`text-sky-500 ${className}`} />;
    case "medical": return <HeartPulse size={size} className={`text-red-500 ${className}`} />;
    case "household": return <Home size={size} className={`text-purple-500 ${className}`} />;
    case "legal": return <FileText size={size} className={`text-indigo-500 ${className}`} />;
    default: return <HelpCircle size={size} className={`text-slate-500 ${className}`} />;
  }
}

export default function LentaScreen({
  requests,
  userVillage,
  onRespond,
  onSubmitReport,
  searchQuery,
  onSearchQueryChange,
  currentUser
}: LentaScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'date'>('distance');
  const [maxDistance, setMaxDistance] = useState<number>(100);
  
  // Complaint state
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Спам / Реклама');
  const [customReason, setCustomReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Active requests filter (only non-resolved)
  const activeRequests = useMemo(() => {
    return requests.filter(r => r.active);
  }, [requests]);

  // Process geographical distance, search, and category sorting
  const processedRequests = useMemo(() => {
    return activeRequests
      .map(req => {
        const dist = getDistanceBetweenVillages(userVillage, req.village);
        return { ...req, calculatedDistance: dist };
      })
      .filter(req => {
        if (selectedCategory !== 'all' && req.category !== selectedCategory) return false;
        if (req.calculatedDistance > maxDistance) return false;
        
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchesTitle = req.title.toLowerCase().includes(q);
          const matchesDesc = req.description.toLowerCase().includes(q);
          const matchesVillage = req.village.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesVillage) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          if (a.calculatedDistance !== b.calculatedDistance) {
            return a.calculatedDistance - b.calculatedDistance;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [activeRequests, userVillage, selectedCategory, maxDistance, searchQuery, sortBy]);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportPostId) return;

    const finalReason = reportReason === 'Другое' ? customReason : reportReason;
    onSubmitReport(reportPostId, 'post', finalReason || 'Жалоба без описания');
    
    setReportSuccess(reportPostId);
    setReportPostId(null);
    setCustomReason('');
    
    setTimeout(() => {
      setReportSuccess(null);
    }, 4000);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 font-sans space-y-6" id="neighbor_help_lenta">
      
      {/* Intro Location Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-750 rounded-3xl p-6 relative overflow-hidden shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-5 pointer-events-none">
          <Compass size={240} />
        </div>

        <div className="space-y-1.5 z-10">
          <h3 className="text-sm font-black flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ваш опорный пункт:</span>
            <strong className="text-emerald-300 font-black">с. {userVillage}</strong>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Объявления приоритизируются по расстоянию от вашей деревни. Помогайте соседям и получайте искреннюю благодарность от жителей!
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 z-10 shrink-0">
          {USTYANY_VILLAGES.slice(0, 4).map(v => (
            <span key={v.name} className="px-3 py-1.5 bg-white/10 border border-white/5 text-slate-100 text-[10px] rounded-xl font-bold backdrop-blur-xs">
              📍 {v.name} {v.distance > 0 ? `(${v.distance} км)` : "база"}
            </span>
          ))}
          <span className="px-3 py-1.5 bg-white/5 border border-white/5 text-slate-300 text-[10px] rounded-xl">и др...</span>
        </div>
      </div>

      {/* 2-Column Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              Направления помощи
            </h4>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center justify-between cursor-pointer ${
                  selectedCategory === 'all'
                    ? "bg-brand-medium text-white border-brand-medium shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200/50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award size={14} />
                  <span>Все категории</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${selectedCategory === 'all' ? "bg-white text-brand-dark" : "bg-slate-200 text-slate-700"}`}>
                  {activeRequests.length}
                </span>
              </button>

              {REQUEST_CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat.id;
                const count = activeRequests.filter(r => r.category === cat.id).length;
                const catStyle = CATEGORY_STYLES[cat.id] || CATEGORY_STYLES.default;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200/50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CategoryIcon catId={cat.id} size={14} className={isActive ? "text-white shrink-0" : "shrink-0"} />
                      <span className="truncate">{cat.name.split(' / ')[0]}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Range Slider for geographical distance search */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Ограничить радиус выезда
            </h4>
            <div className="space-y-2">
              <input
                type="range"
                min="10"
                max="150"
                step="10"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                <span>10 км</span>
                <span className="text-brand-dark bg-slate-100 px-2.5 py-0.5 rounded-full border">
                  {maxDistance === 150 ? "Весь район (150+ км)" : `до ${maxDistance} км`}
                </span>
                <span>150 км</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area: Active Help Requests feed */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Quick Search & Sorting controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Поиск объявлений о помощи по тексту (дрова, трактор, доски, уколы)..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-2xl text-xs transition-all shadow-xs"
              />
            </div>

            {/* Sorting control tabs */}
            <div className="flex rounded-2xl border border-slate-200 p-1 bg-slate-50 shrink-0 gap-1 overflow-x-auto">
              <button
                onClick={() => setSortBy('distance')}
                className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === 'distance'
                    ? "bg-white text-slate-800 border border-slate-200/50 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MapPin size={11} /> 
                <span>Ближе к вам</span>
              </button>
              
              <button
                onClick={() => setSortBy('date')}
                className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  sortBy === 'date'
                    ? "bg-white text-slate-800 border border-slate-200/50 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Calendar size={11} /> 
                <span>Сначала новые</span>
              </button>
            </div>
          </div>

          {/* Active Requests feed rendering */}
          {processedRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
              <HelpCircle size={48} className="text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-black text-slate-700">Никого не найдено</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Запросов о взаимопомощи по выбранным фильтрам в радиусе {maxDistance} км не найдено. Попробуйте сбросить критерии или расширить поиск.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedRequests.map(req => {
                const isLocal = req.village === userVillage;
                const distText = req.calculatedDistance === 0 
                  ? "В вашей деревне!" 
                  : `Расстояние: ~ ${req.calculatedDistance} км`;
                
                const catStyle = CATEGORY_STYLES[req.category] || CATEGORY_STYLES.default;

                return (
                  <div 
                    key={req.id} 
                    className={`bg-white border rounded-3xl p-4 shadow-xs transition-all relative flex flex-col justify-between ${
                      isLocal 
                        ? "border-emerald-500/80 bg-emerald-50/5 shadow-inner" 
                        : "border-slate-200 hover:border-brand-medium/55"
                    }`}
                    id={`req_card_${req.id}`}
                  >
                    <div>
                      {/* Request card header */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 bg-brand-light/30 rounded-full flex items-center justify-center font-black text-xs text-brand-dark border border-brand-light/40 shrink-0 overflow-hidden">
                            <span>{req.authorName?.charAt(0) || "?"}</span>
                          </div>
                          
                          <div className="min-w-0">
                            <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5 leading-snug">
                              <span className="truncate">{req.authorName}</span>
                              {req.userId === currentUser.id && (
                                <span className="bg-slate-200 text-slate-700 text-[8px] px-1 rounded font-black">ВЫ</span>
                              )}
                            </h5>
                            
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={10} className="fill-amber-500 text-amber-500" />
                              <p className="text-[10px] text-slate-500 font-extrabold leading-none">
                                {req.authorRating} <span className="text-slate-400 font-medium">благодарностей</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Proximity Distance tag */}
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border shrink-0 ${
                          req.calculatedDistance === 0 
                            ? "bg-emerald-500 text-white border-emerald-500 font-black shadow-xs" 
                            : req.calculatedDistance <= 30
                              ? "bg-brand-light/50 text-brand-dark border-brand-light"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {distText}
                        </span>
                      </div>

                      {/* Location details row */}
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono mb-2.5">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                          с. <strong className="text-slate-700 font-extrabold">{req.village}</strong>
                          {req.locationDetails ? ` (${req.locationDetails})` : ""}
                        </span>
                      </p>

                      {/* Title & Help description with styled box */}
                      <div className="space-y-2 mb-3">
                        <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                          {req.title}
                        </h4>
                        
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                          {req.description}
                        </p>

                        {/* Request photo gallery representations */}
                        {req.photos && req.photos.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {req.photos.map((ph, idx) => (
                              <div key={idx} className="relative w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                <img src={ph} alt="gallery" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Info Panel: Type Category Badge, Offered Price & Date indicator */}
                      <div className="flex flex-wrap justify-between items-center bg-slate-50/50 px-2.5 py-1.5 rounded-xl border border-slate-100 mb-2.5 gap-1.5">
                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black flex items-center gap-1 ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}>
                          <CategoryIcon catId={req.category} size={10} />
                          <span>{REQUEST_CATEGORIES.find(c => c.id === req.category)?.name.split(' / ')[0] || "Помощь"}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200 text-[9px] font-black flex items-center gap-1">
                          💰 {req.offeredPrice || "Бесплатно, по-соседски"}
                        </span>

                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5 ml-auto">
                          <Clock size={10} />
                          <span>{formatDate(req.createdAt)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center gap-2">
                      {reportSuccess === req.id ? (
                        <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-xl">Жалоба направлена!</span>
                      ) : (
                        <button
                          onClick={() => setReportPostId(req.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50 border border-slate-150 shrink-0 cursor-pointer"
                          title="Пожаловаться"
                        >
                          <AlertTriangle size={13} />
                        </button>
                      )}

                      <button
                        onClick={() => onRespond(req)}
                        className="flex-1 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-black py-2.5 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                      >
                        <MessageSquare size={12} className="text-emerald-300" />
                        <span>ОТКЛИКНУТЬСЯ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Complaint Dialog Modal Popup */}
      {reportPostId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2 mb-2">
              <AlertTriangle className="text-rose-500 animate-bounce" size={18} />
              Сообщить о нарушении модератору
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Жалоба будет анонимно направлена деревенскому комитету модерации Устьянского района. Нарушители блокируются.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4" id="report_form">
              <div>
                <label className="block text-slate-700 text-[11px] font-black mb-1.5 uppercase">Причина жалобы</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-brand-medium focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Спам / Реклама">Реклама, коммерция или спам</option>
                  <option value="Нецензурная лексика">Нецензурные выражения или оскорбления</option>
                  <option value="Ложное объявление">Подозрительное или ложное объявление</option>
                  <option value="Не в Устьянском районе">Объявление не относится к нашему району</option>
                  <option value="Другое">Другая причина (описать самостоятельно)</option>
                </select>
              </div>

              {reportReason === 'Другое' && (
                <div>
                  <label className="block text-slate-700 text-[11px] font-black mb-1.5 uppercase">Опишите подробнее</label>
                  <textarea
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Напишите, что именно нарушает правила в объявлении..."
                    rows={3}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:border-brand-medium focus:outline-none font-bold"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportPostId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Отправить жалобу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
