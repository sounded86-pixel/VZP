import React, { useState, useMemo } from 'react';
import { Entrepreneur, UserProfile, Review, USTYANY_VILLAGES } from '../../types';
import { 
  Search, MapPin, Star, Truck, Award, ShoppingCart, 
  UserCheck, Settings, Eye, ChevronRight, Store, AlertCircle, Sparkles
} from 'lucide-react';

interface DeliveryCatalogProps {
  entrepreneurs: Entrepreneur[];
  currentUser: UserProfile;
  reviews: Review[];
  onStartOrder: (entr: Entrepreneur) => void;
  onOpenCabinet: () => void;
  onOpenRegistration: () => void;
  onOpenAdmin: () => void;
  isEntrepreneurRegistered: boolean;
  isAdmin: boolean;
}

const SELLER_THEMES: Record<string, { 
  primary: string; 
  hover: string; 
  bg: string; 
  text: string; 
  border: string; 
  borderHover: string;
  badge: string;
}> = {
  emerald: { 
    primary: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500', 
    hover: 'hover:border-emerald-300', 
    bg: 'bg-emerald-50/30', 
    text: 'text-emerald-950', 
    border: 'border-emerald-200/60', 
    borderHover: 'hover:border-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  amber: { 
    primary: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400', 
    hover: 'hover:border-amber-300', 
    bg: 'bg-amber-50/30', 
    text: 'text-amber-950', 
    border: 'border-amber-200/60', 
    borderHover: 'hover:border-amber-400',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  blue: { 
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500', 
    hover: 'hover:border-blue-300', 
    bg: 'bg-blue-50/30', 
    text: 'text-blue-950', 
    border: 'border-blue-200/60', 
    borderHover: 'hover:border-blue-400',
    badge: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  purple: { 
    primary: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500', 
    hover: 'hover:border-purple-300', 
    bg: 'bg-purple-50/30', 
    text: 'text-purple-950', 
    border: 'border-purple-200/60', 
    borderHover: 'hover:border-purple-400',
    badge: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  rose: { 
    primary: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500', 
    hover: 'hover:border-rose-300', 
    bg: 'bg-rose-50/30', 
    text: 'text-rose-950', 
    border: 'border-rose-200/60', 
    borderHover: 'hover:border-rose-400',
    badge: 'bg-rose-100 text-rose-800 border-rose-200'
  }
};

export default function DeliveryCatalog({
  entrepreneurs,
  currentUser,
  reviews,
  onStartOrder,
  onOpenCabinet,
  onOpenRegistration,
  onOpenAdmin,
  isEntrepreneurRegistered,
  isAdmin
}: DeliveryCatalogProps) {
  const [search, setSearch] = useState('');
  const [filterVillage, setFilterVillage] = useState(currentUser.isSimplifiedMode ? currentUser.village : '');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'delivery'>('rating');

  // Filter only active and approved entrepreneurs
  const activeSellers = useMemo(() => {
    return entrepreneurs.filter(e => e.isActive && e.moderationStatus === 'approved');
  }, [entrepreneurs]);

  // Compute stats and nearest delivery day info
  const enrichedSellers = useMemo(() => {
    const daysRu = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const daysNames: Record<string, string> = {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье'
    };

    return activeSellers.map(e => {
      let nearestDay = '';
      let nearestDayRu = '';
      const todayIdx = new Date().getDay(); // 0-6
      
      const schedule = e.deliverySchedule;
      const deliveryDays = Object.keys(schedule).filter(day => {
        const villages = schedule[day] || [];
        return villages.includes(currentUser.village) || (filterVillage && villages.includes(filterVillage));
      });

      if (deliveryDays.length > 0) {
        let minDiff = 8;
        deliveryDays.forEach(day => {
          const dayIdx = daysRu.indexOf(day);
          let diff = dayIdx - todayIdx;
          if (diff < 0) diff += 7;
          if (diff < minDiff) {
            minDiff = diff;
            nearestDay = day;
            nearestDayRu = daysNames[day];
          }
        });
      }

      let urgencyText = '';
      if (nearestDay) {
        const dayIdx = daysRu.indexOf(nearestDay);
        if (dayIdx === todayIdx) {
          urgencyText = 'Сегодня';
        } else if (dayIdx === (todayIdx + 1) % 7) {
          urgencyText = 'Завтра';
        } else {
          urgencyText = nearestDayRu;
        }
      }

      const sellerReviews = reviews.filter(r => r.entrepreneurId === e.id);
      const computedRating = sellerReviews.length > 0
        ? Number((sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length).toFixed(1))
        : e.rating.average;

      return {
        ...e,
        computedRating,
        totalReviewsCount: sellerReviews.length || e.rating.totalReviews,
        urgencyText,
        nearestDayRu
      };
    });
  }, [activeSellers, currentUser.village, filterVillage, reviews]);

  // Filter and Sort sellers
  const filteredAndSortedSellers = useMemo(() => {
    let result = enrichedSellers.filter(e => {
      const matchSearch = e.businessName.toLowerCase().includes(search.toLowerCase()) || 
                          (e.description || '').toLowerCase().includes(search.toLowerCase());
      
      let matchVillage = true;
      if (filterVillage) {
        matchVillage = Object.values(e.deliverySchedule).some(vList => (vList as string[])?.includes(filterVillage));
      }
      
      return matchSearch && matchVillage;
    });

    if (sortBy === 'rating') {
      result.sort((a, b) => b.computedRating - a.computedRating);
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.totalReviewsCount - a.totalReviewsCount);
    } else if (sortBy === 'delivery') {
      result.sort((a, b) => {
        if (a.urgencyText && !b.urgencyText) return -1;
        if (!a.urgencyText && b.urgencyText) return 1;
        return 0;
      });
    }

    return result;
  }, [enrichedSellers, search, filterVillage, sortBy]);

  // Extract Top 3 for highlighted medals
  const topThree = useMemo(() => {
    const sorted = [...enrichedSellers].sort((a, b) => b.computedRating - a.computedRating);
    return sorted.slice(0, 3);
  }, [enrichedSellers]);

  const medals = ['🥇', '🥈', '🥉'];
  const medalColors = [
    'bg-amber-100/50 border-amber-300 text-amber-800',
    'bg-slate-100/50 border-slate-300 text-slate-700',
    'bg-amber-50/50 border-amber-250 text-amber-900'
  ];

  const shortDaysNames: Record<string, string> = {
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Вс'
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="delivery_catalog">
      
      {/* Upper context action row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-150 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {isEntrepreneurRegistered ? (
            <button
              onClick={onOpenCabinet}
              className="bg-slate-800 hover:bg-slate-900 text-white font-black px-4 py-2 rounded-2xl text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
              id="btn_my_cabinet"
            >
              <Settings size={14} className="text-brand-light" />
              <span>Моя лавка (Кабинет)</span>
            </button>
          ) : (
            <button
              onClick={onOpenRegistration}
              className="bg-brand-medium hover:bg-brand-medium/90 text-white font-black px-4 py-2 rounded-2xl text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
              id="btn_become_entrepreneur"
            >
              <UserCheck size={14} />
              <span>Зарегистрировать хозяйство</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="bg-red-650 hover:bg-red-700 text-white font-black px-4 py-2 rounded-2xl text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
              id="btn_admin_moderation"
            >
              <Award size={14} className="text-amber-200" />
              <span>Админка (Заявки)</span>
            </button>
          )}
        </div>
        
        <div className="text-[11px] font-black text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100 flex items-center gap-1">
          <MapPin size={11} className="text-brand-medium" />
          <span>Ваш адрес: <strong className="text-slate-800 font-extrabold">с. {currentUser.village}</strong></span>
        </div>
      </div>

      {/* Simplified mode warning */}
      {currentUser.isSimplifiedMode && (
        <div className="bg-yellow-50 border-4 border-yellow-400 rounded-3xl p-6 text-center shadow-sm">
          <div className="flex justify-center mb-1.5 text-yellow-500">
            <Sparkles size={36} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-slate-900">🚚 Продуктовый подвоз</h2>
          <p className="text-xs text-slate-600 font-extrabold mt-1">Доставим свежее парное молоко, творог, домашнее масло и хлеб прямо к вам домой!</p>
          <div className="mt-4 flex justify-center">
            <span className="bg-yellow-400 text-slate-900 text-xs font-black px-5 py-3 rounded-2xl border border-yellow-500">
              🛒 Выберите подходящего продавца в списке ниже!
            </span>
          </div>
        </div>
      )}

      {/* 2-Column Main Responsive Grid Layout (matches SkillsCatalog) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Village selector and details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              Фильтр по селу
            </h4>
            
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
              <select
                value={filterVillage}
                onChange={(e) => setFilterVillage(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-2xl text-xs text-slate-800 font-black appearance-none cursor-pointer"
              >
                <option value="">Все села Устьянов</option>
                {USTYANY_VILLAGES.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed">
              Показываются хозяйства и фермеры, которые развозят свежую продукцию на дом в указанное вами село.
            </div>
          </div>

          {/* Stats Summary Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-2.5">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Показатели сервиса
            </h4>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-slate-500 flex items-center gap-1">
                <Store size={12} className="text-slate-400" />
                <span>Активных лавок:</span>
              </span>
              <span className="text-slate-800 font-black">{enrichedSellers.length}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-slate-500 flex items-center gap-1">
                <Truck size={12} className="text-slate-400" />
                <span>Доставка вовремя:</span>
              </span>
              <span className="text-emerald-600 font-black">98.6% ★</span>
            </div>
          </div>
        </div>

        {/* Right Content Area: Search, Sort and Stores Grid */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Best Sellers Highlight Carousel */}
          {!currentUser.isSimplifiedMode && topThree.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50/50 via-amber-50/30 to-orange-50/20 border border-emerald-100 rounded-3xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <Award className="text-emerald-600 animate-bounce shrink-0" size={16} />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Рекомендуемые хозяйства Устьянского района
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topThree.map((seller, idx) => {
                  const theme = SELLER_THEMES[seller.themeColor || 'emerald'] || SELLER_THEMES.emerald;
                  return (
                    <div 
                      key={seller.id}
                      className={`border rounded-2xl p-3.5 flex flex-col justify-between bg-white shadow-xs transition-all hover:scale-[1.01] ${theme.border}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xl font-bold leading-none">{medals[idx]}</span>
                        <div className="bg-white border border-amber-300 rounded-lg px-1.5 py-0.5 text-[10px] font-black flex items-center gap-0.5 text-amber-700">
                          ★ {seller.computedRating}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-xs line-clamp-1 leading-snug">
                          {seller.businessName}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-medium">База: с. {seller.village || 'Октябрьский'}</p>
                      </div>

                      <button
                        onClick={() => onStartOrder(seller)}
                        className={`w-full text-white font-black py-1.5 rounded-lg text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 mt-3 ${theme.primary}`}
                      >
                        <ShoppingCart size={11} />
                        <span>Выбрать продукты</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search filter and Sort tools */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Поиск лавки по названию, описанию продукции (молоко, творог, сыр)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-2xl text-xs transition-all shadow-xs"
              />
            </div>

            {/* Sorting controls */}
            {!currentUser.isSimplifiedMode && (
              <div className="flex rounded-2xl border border-slate-200 p-1 bg-slate-50 shrink-0 gap-1 overflow-x-auto">
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1 ${
                    sortBy === 'rating' ? 'bg-white text-slate-800 border border-slate-200/50 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ★ По рейтингу
                </button>
                <button
                  onClick={() => setSortBy('reviews')}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1 ${
                    sortBy === 'reviews' ? 'bg-white text-slate-800 border border-slate-200/50 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💬 По отзывам
                </button>
                <button
                  onClick={() => setSortBy('delivery')}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1 ${
                    sortBy === 'delivery' ? 'bg-white text-slate-800 border border-slate-200/50 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🚚 По доставке
                </button>
              </div>
            )}
          </div>

          {/* MAIN ENTREPRENEURS STORES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAndSortedSellers.length > 0 ? (
              filteredAndSortedSellers.map(seller => {
                const theme = SELLER_THEMES[seller.themeColor || 'emerald'] || SELLER_THEMES.emerald;
                const isLocal = seller.urgencyText ? true : false;
                
                return (
                  <div 
                    key={seller.id} 
                    className={`bg-white border rounded-3xl overflow-hidden shadow-xs transition-all hover:shadow-sm flex flex-col justify-between ${
                      currentUser.isSimplifiedMode 
                        ? 'border-4 border-yellow-400 p-5 bg-yellow-50/5' 
                        : `border-slate-200 ${theme.borderHover}`
                    }`}
                  >
                    <div>
                      {/* Store banner cover illustration */}
                      <div className="h-20 w-full relative bg-slate-100">
                        {seller.coverUrl ? (
                          <img 
                            src={seller.coverUrl} 
                            alt="cover" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-300 font-bold">
                            Уютная фермерская усадьба
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                        
                        {/* Rating tag in banner top-right */}
                        <div className="absolute top-2.5 right-2.5 bg-white/95 border border-amber-300 rounded-lg px-2 py-0.5 text-[10px] font-black flex items-center gap-0.5 text-amber-700 shadow-sm">
                          ★ {seller.computedRating}
                        </div>
                      </div>

                      {/* Store detail block */}
                      <div className="p-4 pb-0 space-y-3">
                        <div className="flex gap-3 items-start -mt-8 relative">
                          <div className="w-12 h-12 rounded-2xl border-2 border-white bg-white overflow-hidden shadow-sm shrink-0 z-10">
                            {seller.logoUrl ? (
                              <img src={seller.logoUrl} alt="logo" className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center bg-brand-light/30 text-sm">🏪</span>
                            )}
                          </div>

                          <div className="min-w-0 pt-3">
                            <h5 className={`font-black text-slate-950 truncate leading-snug ${
                              currentUser.isSimplifiedMode ? 'text-lg' : 'text-xs'
                            }`}>
                              {seller.businessName}
                            </h5>
                            
                            <p className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5 mt-0.5">
                              <span>База: с. {seller.village || 'Октябрьский'}</span>
                              {seller.address && <span className="truncate">, {seller.address}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Description snippet */}
                        {seller.description && (
                          <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {seller.description}
                          </p>
                        )}

                        {/* Location delivery distance radius status bar */}
                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 font-mono font-bold">
                            <MapPin size={11} className="text-slate-400" />
                            {seller.urgencyText ? (
                              <span>Привоз в с. <strong className="text-slate-800 font-extrabold">{currentUser.village}</strong>:</span>
                            ) : (
                              <span>Выезд до: <strong className="text-slate-800">{seller.serviceRadius} км</strong></span>
                            )}
                          </span>

                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${
                            isLocal 
                              ? "bg-emerald-500 text-white border-emerald-500" 
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {seller.urgencyText ? seller.urgencyText : `По запросу`}
                          </span>
                        </div>

                        {/* Weekly calendar schedule tags */}
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(seller.deliverySchedule)
                            .filter(day => (seller.deliverySchedule[day] || []).length > 0)
                            .map(day => {
                              const deliversToMyVillage = (seller.deliverySchedule[day] || []).includes(currentUser.village);
                              return (
                                <span 
                                  key={day} 
                                  className={`px-2 py-0.5 text-[9px] font-black rounded border ${
                                    deliversToMyVillage
                                      ? "bg-emerald-500 text-white border-emerald-500"
                                      : "bg-slate-100 text-slate-500 border-slate-200/40"
                                  }`}
                                  title={(seller.deliverySchedule[day] || []).join(', ')}
                                >
                                  {shortDaysNames[day] || day}
                                </span>
                              );
                            })}
                        </div>

                        {/* Assortment previews */}
                        {!currentUser.isSimplifiedMode && seller.priceList.length > 0 && (
                          <div className="bg-slate-50/50 border border-slate-150/60 rounded-xl p-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Свежая продукция:</p>
                            <div className="flex flex-wrap gap-1">
                              {seller.priceList.slice(0, 3).map((p, i) => (
                                <span key={i} className="bg-white border border-slate-150 rounded-lg px-2 py-0.5 text-[10px] text-slate-700 font-bold">
                                  {p.item} — <strong className="text-emerald-700">{p.price} ₽</strong>
                                </span>
                              ))}
                              {seller.priceList.length > 3 && (
                                <span className="text-[9px] text-slate-400 font-bold py-0.5 px-1">+{seller.priceList.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer selection / order button */}
                    <div className="p-4 pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-3 bg-slate-50/20">
                      <div className="text-[10px] font-bold text-slate-400 shrink-0">
                        {seller.totalReviewsCount > 0 ? (
                          <span>Отзывов: <strong className="text-slate-700">{seller.totalReviewsCount}</strong></span>
                        ) : (
                          <span>Новая лавка</span>
                        )}
                      </div>

                      <button
                        onClick={() => onStartOrder(seller)}
                        className={`text-white font-black py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                          currentUser.isSimplifiedMode
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-lg py-4 rounded-3xl border-2 border-emerald-400'
                            : `text-xs ${theme.primary}`
                        }`}
                      >
                        <ShoppingCart size={currentUser.isSimplifiedMode ? 18 : 12} />
                        <span>{currentUser.isSimplifiedMode ? 'ЗАКАЗАТЬ ДОСТАВКУ' : 'Выбрать продукты'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 text-center bg-white p-12 rounded-3xl border border-slate-100 space-y-3">
                <AlertCircle size={48} className="text-slate-300 mx-auto" />
                <h4 className="text-base font-black text-slate-800">Ничего не найдено</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  К сожалению, по выбранному селу или поисковому запросу нет активных доставок продуктов. Попробуйте сбросить фильтры.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
