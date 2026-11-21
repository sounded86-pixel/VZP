import React, { useState, useMemo } from 'react';
import { 
  Heart, Sparkles, PlusCircle, MessageCircle, CheckCircle, 
  MapPin, Clock, Search, Filter, ShieldCheck, Flame, 
  HeartPulse, Truck, MessageSquare, HandHeart, UserCheck, 
  Smile, Award, ArrowRight, CheckCircle2
} from 'lucide-react';
import { HelpRequest, UserProfile, REQUEST_CATEGORIES } from '../types';
import { CategoryIcon } from './LentaScreen';
import { getDistanceBetweenVillages } from '../mockData';

interface GoodDeedsScreenProps {
  requests: HelpRequest[];
  currentUser: UserProfile;
  onRespond: (req: HelpRequest) => void;
  onCreateRequest: () => void;
  onNavigateToLenta?: () => void;
}

export function GoodDeedsScreen({
  requests,
  currentUser,
  onRespond,
  onCreateRequest,
  onNavigateToLenta
}: GoodDeedsScreenProps) {
  const [activeTab, setActiveTab] = useState<'needed' | 'completed'>('needed');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [offerHelpCategory, setOfferHelpCategory] = useState<string>('wood');
  const [offerNote, setOfferNote] = useState<string>('');
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);

  // Filter active requests ("Нужна помощь")
  const activeRequests = useMemo(() => {
    return requests.filter(r => r.active);
  }, [requests]);

  // Filter completed requests ("Спасибо")
  const completedRequests = useMemo(() => {
    return requests.filter(r => !r.active);
  }, [requests]);

  // Filtered active list
  const filteredActiveRequests = useMemo(() => {
    return activeRequests.filter(req => {
      if (selectedFilter === 'wood' && req.category !== 'wood') return false;
      if (selectedFilter === 'medical' && req.category !== 'medical') return false;
      if (selectedFilter === 'talk' && req.category !== 'household' && !req.title.toLowerCase().includes('поговорить')) return false;
      if (selectedFilter === 'delivery' && req.category !== 'delivery') return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesDesc = req.description.toLowerCase().includes(q);
        const matchesVillage = req.village.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesVillage) return false;
      }
      return true;
    });
  }, [activeRequests, selectedFilter, searchQuery]);

  // Filtered completed list
  const filteredCompletedRequests = useMemo(() => {
    return completedRequests.filter(req => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesDesc = req.description.toLowerCase().includes(q);
        const matchesVillage = req.village.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesVillage) return false;
      }
      return true;
    });
  }, [completedRequests, searchQuery]);

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfferSuccessMsg('Спасибо за ваше отзывчивое сердце! Ваша готовность помочь сохранена. Соседи увидят ваш отклик!');
    setTimeout(() => {
      setOfferSuccessMsg(null);
      setShowOfferModal(false);
      setOfferNote('');
    }, 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-6 font-sans">
      
      {/* SECTION MANIFESTO HEADER CARD */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-700/60 relative overflow-hidden" id="good_deeds_header_card">
        {/* Subtle decorative background icons */}
        <div className="absolute right-[-20px] bottom-[-20px] text-white/5 pointer-events-none">
          <HandHeart size={240} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/50 text-emerald-200 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-xs">
            <Heart size={14} className="fill-emerald-300 text-emerald-300" />
            <span>Раздел «Добрые дела»</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
            Добрые дела
          </h1>

          <div className="space-y-3 text-emerald-100 text-sm md:text-base leading-relaxed font-medium">
            <p className="text-emerald-50 font-semibold text-base md:text-lg">
              Здесь не важно, кто ты и где работаешь. Важно, что ты готов помочь.
            </p>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 space-y-2 text-xs sm:text-sm">
              <p className="font-bold text-white">Каждый день в нашем районе нужна помощь:</p>
              <ul className="space-y-1.5 pl-1 text-emerald-100">
                <li className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">—</span>
                  <span>Кому-то нужно поколоть дрова 🪵</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">—</span>
                  <span>Кому-то привезти лекарства 💊</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">—</span>
                  <span>Кому-то просто поговорить 💬</span>
                </li>
              </ul>
            </div>

            <p className="font-bold text-white text-base">
              Мы не делим людей. Мы их объединяем.
            </p>
            <p className="text-amber-300 font-black text-base md:text-lg flex items-center gap-2">
              <span>Доброе дело начинается с тебя.</span>
              <span className="text-xl">💚</span>
            </p>
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowOfferModal(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer border border-amber-300"
              id="btn_offer_help"
            >
              <HandHeart size={18} />
              <span>🤝 Предложить помощь</span>
            </button>

            <button
              type="button"
              onClick={onCreateRequest}
              className="bg-white/20 hover:bg-white/30 text-white font-black px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all border border-white/30 backdrop-blur-xs active:scale-95 cursor-pointer"
              id="btn_request_help"
            >
              <PlusCircle size={18} />
              <span>✍️ Попросить помощи</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION TABS & QUICK FILTER BAR */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-100 pb-3">
          
          {/* Main Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('needed')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'needed'
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              id="tab_deeds_needed"
            >
              <HandHeart size={16} />
              <span>Нужна помощь</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'needed' ? "bg-white text-emerald-900" : "bg-slate-200 text-slate-700"}`}>
                {activeRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'completed'
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              id="tab_deeds_thanks"
            >
              <Sparkles size={16} />
              <span>Спасибо (Выполненные)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'completed' ? "bg-white text-emerald-900" : "bg-slate-200 text-slate-700"}`}>
                {completedRequests.length}
              </span>
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Поиск просьб и дел..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">Тематика:</span>
          {[
            { id: 'all', label: 'Все задачи' },
            { id: 'wood', label: '🪵 Поколоть дрова' },
            { id: 'medical', label: '💊 Лекарства' },
            { id: 'talk', label: '💬 Поговорить' },
            { id: 'delivery', label: '🛒 Продукты' }
          ].map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                selectedFilter === chip.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT TAB 1: ЛЕНТА ТЕКУЩИХ ЗАДАЧ («НУЖНА ПОМОЩЬ») */}
      {activeTab === 'needed' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>📋 Текущие просьбы о помощи в районе</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Показано: {filteredActiveRequests.length}
            </span>
          </div>

          {filteredActiveRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 space-y-3">
              <span className="text-4xl">💚</span>
              <h4 className="text-base font-black text-slate-800">Все соседи в безопасности!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                В этой категории пока нет активных просьб. Вы можете предложить свою помощь или создать обращение первым.
              </p>
              <button
                type="button"
                onClick={onCreateRequest}
                className="inline-flex items-center gap-2 bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-800 transition-all"
              >
                <PlusCircle size={14} />
                <span>Попросить помощи</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActiveRequests.map(req => {
                const dist = getDistanceBetweenVillages(currentUser.village, req.village);
                return (
                  <div
                    key={req.id}
                    className="bg-white border border-slate-200/90 hover:border-emerald-500/60 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Header Badge */}
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 font-black text-[10px] flex items-center gap-1">
                          <CategoryIcon catId={req.category} size={12} />
                          <span>{req.category === 'wood' ? 'Дрова' : req.category === 'medical' ? 'Лекарства' : req.category === 'delivery' ? 'Продукты' : 'Быт и помощь'}</span>
                        </span>

                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center gap-1">
                          <MapPin size={10} className="text-emerald-700" />
                          <span>с. {req.village} {dist > 0 ? `(${dist} км)` : ''}</span>
                        </span>
                      </div>

                      {/* Request Title */}
                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {req.title}
                      </h4>

                      {/* Request Description */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {req.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      {/* Price / Neighbors reward badge */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 flex items-center gap-1">
                          <span>👤</span> {req.authorName}
                        </span>
                        <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]">
                          💰 {req.offeredPrice || 'Бесплатно, по-соседски'}
                        </span>
                      </div>

                      {/* Action Respond Button */}
                      <button
                        type="button"
                        onClick={() => onRespond(req)}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        <HandHeart size={16} />
                        <span>Откликнуться и помочь</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENT TAB 2: ЛЕНТА ВЫПОЛНЕННЫХ ДОБРЫХ ДЕЛ («СПАСИБО») */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>🌟 Лента благодарностей и выполненных добрых дел</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Выполнено: {filteredCompletedRequests.length}
            </span>
          </div>

          {filteredCompletedRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 space-y-2">
              <span className="text-4xl">🌟</span>
              <h4 className="text-base font-black text-slate-800">Первые добрые дела уже скоро!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Здесь публикуются выполненные задачи и искренние благодарности соседей.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompletedRequests.map(req => (
                <div
                  key={req.id}
                  className="bg-gradient-to-br from-white to-emerald-50/20 border border-emerald-200/70 rounded-3xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 font-black rounded-xl text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-700" />
                      <span>Дело выполнено</span>
                    </span>

                    <span className="text-[10px] font-bold text-slate-400">
                      с. {req.village}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900">
                    {req.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-2xl p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-950">Благодарность от автора:</span>
                      <span className="text-amber-600 font-black text-[11px]">★ +1 «Спасибо»</span>
                    </div>
                    <p className="text-slate-700 italic">
                      «Большое спасибо за оперативную помощь по-соседски! Наш район держится на таких людях!»
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: PREFER TO OFFER HELP ("ПРЕДЛОЖИТЬ ПОМОЩЬ") */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border-4 border-emerald-600 shadow-2xl relative">
            
            <div className="text-center space-y-1">
              <span className="text-4xl">🤝</span>
              <h3 className="text-xl font-black text-slate-900">Предложить помощь соседям</h3>
              <p className="text-xs text-slate-500">
                Укажите, в чём вы готовы помочь жителям нашего района
              </p>
            </div>

            {offerSuccessMsg ? (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl p-4 text-xs font-bold text-center space-y-2 animate-fadeIn">
                <p>{offerSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleOfferSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                    Чем вы готовы помочь?
                  </label>
                  <select
                    value={offerHelpCategory}
                    onChange={(e) => setOfferHelpCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="wood">🪵 Наколоть дрова / Сложить поленницу</option>
                    <option value="medical">💊 Привезти лекарства из аптеки</option>
                    <option value="talk">💬 Зайти в гости, поговорить, подбодрить</option>
                    <option value="delivery">🛒 Купить продукты в магазине</option>
                    <option value="snow">❄️ Расчистить снег у дома</option>
                    <option value="tech">📱 Настроить телефон или интернет</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                    Ваш комментарий или свободное время:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Например: Могу помочь вечером по будням в Октябрьском или Березники, есть свой инструмент."
                    value={offerNote}
                    onChange={(e) => setOfferNote(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                  💚 Помогая соседям, вы делаете наш район уютнее и добрее. Каждое доброе дело важно!
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Отмена
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 rounded-xl text-xs shadow-sm"
                  >
                    Сохранить отклик
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
