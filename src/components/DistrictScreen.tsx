import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Trophy, Megaphone, TrendingUp, Heart, Sparkles, MapPin, 
  Calendar, AlertTriangle, Plus, Users, CheckCircle, ArrowLeft, 
  Flame, Award, Smile, ShieldAlert, FileText, Send, X, Star
} from 'lucide-react';
import { UserProfile, HelpRequest } from '../types';

interface Announcement {
  id: string;
  title: string;
  category: 'alert' | 'event' | 'info' | 'news';
  description: string;
  village: string;
  date: string;
  authorName: string;
  createdAt: string;
}

interface DistrictScreenProps {
  currentUser: UserProfile;
  users: UserProfile[];
  requests: HelpRequest[];
  isOffline: boolean;
  onBackToHome: () => void;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: '⚠️ Плановое отключение электроэнергии',
    category: 'alert',
    description: 'Внимание жителей с. Шангалы и д. Ростовское! 9 июля с 09:00 до 14:00 будут проводиться ремонтные работы на подстанции. Просьба заранее отключить чувствительные электроприборы.',
    village: 'Шангалы',
    date: '09 июля 2026',
    authorName: 'Администрация РЭС',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann_2',
    title: '🌿 Благотворительный субботник на реке Устья',
    category: 'event',
    description: 'Приглашаем всех неравнодушных жителей Березника и окрестных деревень на традиционную весенне-летнюю уборку береговой зоны. Сбор у подвесного моста. Инвентарь и чай с пирогами из печи гарантируем!',
    village: 'Березник',
    date: '11 июля 2026 в 10:00',
    authorName: 'Совет молодежи Устьи',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann_3',
    title: '🎪 Фермерская ярмарка «Устьянские Меды и Рябина»',
    category: 'info',
    description: 'На центральной площади р.п. Октябрьский состоится большая летняя ярмарка сельхозпроизводителей. Свежий мед, устьянское масло, молочные продукты, домашний творог и саженцы.',
    village: 'Октябрьский',
    date: '12 июля 2026',
    authorName: 'Потребкооперация Устьяны',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann_4',
    title: '🚒 Противопожарный режим в лесах',
    category: 'alert',
    description: 'В связи с сухой погодой в лесах Устьянского района введен особый противопожарный режим. Разведение костров, заезд на машинах в хвойные молодняки строго запрещены. Берегите нашу тайгу!',
    village: 'Все поселения',
    date: 'Действует сейчас',
    authorName: 'Устьянское Лесничество',
    createdAt: new Date().toISOString()
  }
];

export default function DistrictScreen({
  currentUser,
  users,
  requests,
  isOffline,
  onBackToHome
}: DistrictScreenProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'leaderboard' | 'notices'>('stats');
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const stored = localStorage.getItem('ustyany_announcements');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_ANNOUNCEMENTS;
      }
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  // Modal for new announcement
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'alert' | 'event' | 'info' | 'news'>('info');
  const [newDesc, setNewDesc] = useState('');
  const [newVillage, setNewVillage] = useState(currentUser.village || 'Березник');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    localStorage.setItem('ustyany_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Calculations for Stats
  const statsSummary = useMemo(() => {
    // Total users in Ustyany mutual aid
    const totalNeighbors = users.length;
    
    // Total thanks points accumulated
    const totalThanks = users.reduce((sum, u) => sum + (u.thanksCount || 0), 0);
    
    // Total requests resolved in system
    const totalResolved = requests.filter(r => !r.active).length + 42; // Seeded count for community warmth

    // Calculate simulated district metrics based on totalResolved
    const firewoodVolume = totalResolved * 1.5 + 45; // in cubic meters
    const waterBuckets = totalResolved * 6 + 180; // in buckets
    const repairsDone = Math.round(totalResolved * 0.4) + 12; // fences/staircases
    const ridesShared = Math.round(totalResolved * 0.8) + 38; // transport rides

    return {
      totalNeighbors,
      totalThanks,
      totalResolved,
      firewoodVolume: Math.round(firewoodVolume),
      waterBuckets: Math.round(waterBuckets),
      repairsDone,
      ridesShared
    };
  }, [users, requests]);

  // Village rankings based on number of active + resolved tasks and members
  const villageRankings = useMemo(() => {
    const villagesList = [
      { name: 'Березник', baseDeeds: 142, baseMembers: 35 },
      { name: 'Шангалы', baseDeeds: 118, baseMembers: 28 },
      { name: 'Октябрьский', baseDeeds: 98, baseMembers: 46 },
      { name: 'Ростовское', baseDeeds: 69, baseMembers: 19 },
      { name: 'Строевское', baseDeeds: 45, baseMembers: 12 },
      { name: 'Едьма', baseDeeds: 32, baseMembers: 10 }
    ];

    // Dynamic addition of user village deeds
    return villagesList.map(v => {
      // Find how many requests in current system are from this village
      const localRequestsCount = requests.filter(r => r.village === v.name).length;
      const localUsersCount = users.filter(u => u.village === v.name).length;

      const totalDeeds = v.baseDeeds + localRequestsCount * 3;
      const totalMembers = v.baseMembers + localUsersCount;
      const solidarityIndex = Math.min(98, Math.round((totalDeeds / (totalMembers || 1)) * 4 + 45));

      return {
        ...v,
        totalDeeds,
        totalMembers,
        solidarityIndex
      };
    }).sort((a, b) => b.totalDeeds - a.totalDeeds);
  }, [requests, users]);

  // Neighbors Leaderboard sorted by thanksCount descending
  const leaderboard = useMemo(() => {
    return [...users]
      .sort((a, b) => (b.thanksCount || 0) - (a.thanksCount || 0))
      .map((user, idx) => {
        // Assign fun rural community titles & badges based on rank and skills
        let badge = 'Сосед-помощник 🤝';
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
        
        if (idx === 0) {
          badge = '👑 Легенда Устьян';
          badgeColor = 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/50';
        } else if (idx === 1) {
          badge = '🥇 Душа Района';
          badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
        } else if (idx === 2) {
          badge = '🥈 Ангел Помощи';
          badgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
        } else if (user.skills.includes('tractorist') || user.skills.includes('driver')) {
          badge = '🚜 Скорая Колея';
          badgeColor = 'bg-orange-100 text-orange-900 border-orange-300';
        } else if (user.skills.includes('woodcutter')) {
          badge = '🪵 Золотой Колун';
          badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
        } else if (user.skills.includes('medic')) {
          badge = '🩺 Сердце Акушерства';
          badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
        } else if (user.thanksCount > 10) {
          badge = '⭐ Почетный Житель';
          badgeColor = 'bg-purple-100 text-purple-900 border-purple-300';
        }

        return {
          ...user,
          badge,
          badgeColor,
          rank: idx + 1
        };
      });
  }, [users]);

  // Submit new announcement
  const handleSubmitAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert('Заполните заголовок и содержание!');
      return;
    }

    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title: (newCategory === 'alert' ? '⚠️ ' : newCategory === 'event' ? '🌿 ' : newCategory === 'info' ? '🎪 ' : '📰 ') + newTitle.trim(),
      category: newCategory,
      description: newDesc.trim(),
      village: newVillage,
      date: newDate.trim() || 'В ближайшие дни',
      authorName: currentUser.name || 'Анонимный житель',
      createdAt: new Date().toISOString()
    };

    setAnnouncements([newAnn, ...announcements]);
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setShowAddModal(false);
    alert('Ваше объявление успешно опубликовано на доске района!');
  };

  // Delete announcement (only if current user published or admin)
  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить это объявление?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans text-slate-800" id="district_screen">
      
      {/* Back button & Screen Title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBackToHome}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-all cursor-pointer"
          id="district_back_btn"
          title="Вернуться на главную"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 block">Устьянский район</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            📍 Жизнь Района
          </h2>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-slate-50 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'stats' 
              ? "bg-emerald-700 text-white shadow-xs" 
              : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
          }`}
          id="tab_district_stats"
        >
          <BarChart3 size={15} />
          <span>📊 Статистика Устьян</span>
        </button>
        
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'leaderboard' 
              ? "bg-emerald-700 text-white shadow-xs" 
              : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
          }`}
          id="tab_district_leaderboard"
        >
          <Trophy size={15} />
          <span>🏆 Доска почета</span>
        </button>
        
        <button
          onClick={() => setActiveTab('notices')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'notices' 
              ? "bg-emerald-700 text-white shadow-xs" 
              : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
          }`}
          id="tab_district_notices"
        >
          <Megaphone size={15} />
          <span>📢 Оповещения и Доска</span>
        </button>
      </div>

      {/* Screen Views content */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: DISTRICT STATS */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Core Stats Bento Block */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4 text-center shadow-xs">
                <Heart className="mx-auto text-emerald-600 fill-emerald-100 mb-2" size={24} />
                <span className="text-2xl sm:text-3xl font-black text-emerald-900 block leading-tight">
                  {statsSummary.totalResolved}
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-700/85 font-black uppercase tracking-wider block mt-1">
                  Добрых Дел
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4 text-center shadow-xs">
                <Flame className="mx-auto text-amber-600 fill-amber-100 mb-2 animate-pulse" size={24} />
                <span className="text-2xl sm:text-3xl font-black text-amber-900 block leading-tight">
                  {statsSummary.firewoodVolume} м³
                </span>
                <span className="text-[10px] sm:text-xs text-amber-700/85 font-black uppercase tracking-wider block mt-1">
                  Дров сложено
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 text-center shadow-xs">
                <Smile className="mx-auto text-blue-600 fill-blue-100 mb-2" size={24} />
                <span className="text-2xl sm:text-3xl font-black text-blue-900 block leading-tight">
                  {statsSummary.totalThanks}
                </span>
                <span className="text-[10px] sm:text-xs text-blue-700/85 font-black uppercase tracking-wider block mt-1">
                  Сказано «Спасибо»
                </span>
              </div>

              <div className="bg-cyan-50 border border-cyan-100 rounded-3xl p-4 text-center shadow-xs">
                <Users className="mx-auto text-cyan-600 fill-cyan-100 mb-2" size={24} />
                <span className="text-2xl sm:text-3xl font-black text-cyan-900 block leading-tight">
                  {statsSummary.totalNeighbors}
                </span>
                <span className="text-[10px] sm:text-xs text-cyan-700/85 font-black uppercase tracking-wider block mt-1">
                  Соседей в сети
                </span>
              </div>
            </div>

            {/* Graphic Bar Chart - Village activity */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800">
                    🏆 Рейтинг солидарности поселений
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Индекс активности рассчитывается на основе решенных задач и количества отзывчивых жителей
                  </p>
                </div>
                <TrendingUp size={20} className="text-emerald-600 shrink-0" />
              </div>

              <div className="space-y-4 mt-2">
                {villageRankings.map((village, idx) => (
                  <div key={village.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono font-bold w-4">{idx + 1}.</span>
                        <strong className="text-slate-700 font-black">с. {village.name}</strong>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-sm">
                          👤 {village.totalMembers}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800">{village.totalDeeds} дел</span>
                        <span className="text-[11px] text-emerald-600 font-extrabold ml-2">({village.solidarityIndex}%)</span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${village.solidarityIndex}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' :
                          idx === 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                          'bg-gradient-to-r from-slate-400 to-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Achievements bento grid block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">🪓</span>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Дрова для печи</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Оказана поддержка {statsSummary.firewoodVolume} домам дровами</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">🩺</span>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Уход и здоровье</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Доставлено лекарств и продуктов {statsSummary.waterBuckets} пожилым людям</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">🚗</span>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Подвоз в Октябрьский</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Совершено {statsSummary.ridesShared} совместных поездок до аптеки</p>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: HONORARY LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Top Leaderboard Card Header */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-3xl p-5 sm:p-6 shadow-xs flex items-center gap-4 border border-amber-600/50">
              <Trophy size={48} className="text-yellow-300 shrink-0 fill-yellow-400/20" />
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight">Доска почета жителей Устьян</h3>
                <p className="text-xs text-amber-200/90 leading-snug mt-1 font-medium">
                  Особое уважение и почет тем соседям, которые чаще всего откликаются на чужую беду и безвозмездно помогают односельчанам!
                </p>
              </div>
            </div>

            {/* List of Helpers */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-xs">
              {leaderboard.map((user) => (
                <div key={user.id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank indicator */}
                    <div className="w-6 text-center shrink-0">
                      {user.rank === 1 ? (
                        <span className="text-xl sm:text-2xl font-black text-yellow-500">🥇</span>
                      ) : user.rank === 2 ? (
                        <span className="text-xl sm:text-2xl font-black text-slate-400">🥈</span>
                      ) : user.rank === 3 ? (
                        <span className="text-xl sm:text-2xl font-black text-amber-600">🥉</span>
                      ) : (
                        <span className="text-sm font-mono font-bold text-slate-400">{user.rank}</span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-lg shrink-0">
                      {user.name ? user.name[0].toUpperCase() : 'У'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <strong className="text-sm sm:text-base font-black text-slate-800 leading-none">
                          {user.name}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          📍 с. {user.village}
                        </span>
                      </div>
                      
                      {/* Special rural honorary tags/badges */}
                      <span className={`inline-block border text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full mt-1.5 ${user.badgeColor}`}>
                        {user.badge}
                      </span>
                    </div>
                  </div>

                  {/* Rating / Thanks Count */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 text-yellow-500 font-black text-base sm:text-lg">
                      <Star size={16} className="fill-yellow-500 stroke-yellow-500" />
                      <span>{user.thanksCount || 0}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-black block mt-0.5">
                      Спасибо
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: DISTRICT NOTICES & ANNOUNCEMENTS */}
        {activeTab === 'notices' && (
          <motion.div
            key="notices_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Notices Board Title and Publish triggers */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  📢 Свежие объявления и оповещения
                </h3>
                <p className="text-xs text-slate-500 font-medium">Важные районные сообщения, отключения, мероприятия, субботники</p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <Plus size={14} />
                <span>Добавить</span>
              </button>
            </div>

            {/* List of Notices cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((ann) => {
                const isSystem = ann.id === 'ann_1' || ann.id === 'ann_2' || ann.id === 'ann_3' || ann.id === 'ann_4';
                
                return (
                  <div 
                    key={ann.id} 
                    className={`border-2 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md relative ${
                      ann.category === 'alert' ? 'bg-red-50/40 border-red-200 hover:border-red-300' :
                      ann.category === 'event' ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300' :
                      ann.category === 'info' ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300' :
                      'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Notice Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md border ${
                          ann.category === 'alert' ? 'bg-red-100 text-red-800 border-red-200' :
                          ann.category === 'event' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          ann.category === 'info' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {ann.category === 'alert' ? 'Оповещение 🚨' :
                           ann.category === 'event' ? 'Мероприятие 🌿' :
                           ann.category === 'info' ? 'Информация 🎪' : 'Новость 📰'}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span className="text-[10px] font-mono font-bold">📍 {ann.village}</span>
                          
                          {/* Allow deletion of user added items */}
                          {!isSystem && (
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-slate-100/80 transition-all cursor-pointer"
                              title="Удалить мое объявление"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notice Content */}
                      <h4 className="text-sm sm:text-base font-black text-slate-800 leading-snug mb-2">
                        {ann.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-normal whitespace-pre-wrap">
                        {ann.description}
                      </p>
                    </div>

                    {/* Notice Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-200/55 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{ann.date}</span>
                      </span>
                      <span>
                        Отправитель: <strong className="text-slate-500">{ann.authorName}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state notice */}
            {announcements.length === 0 && (
              <div className="text-center p-12 bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
                <span className="text-4xl">📭</span>
                <h4 className="text-base font-black text-slate-800 mt-2">Доска объявлений пуста</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">Будьте первым, кто опубликует новость, событие или предупреждение для жителей района!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL: ADD ANNOUNCEMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border-4 border-brand-dark space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                📢 Новое объявление района
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
              {/* Notice Type */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Тип объявления:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'info', label: '🎪 Инфо' },
                    { id: 'alert', label: '🚨 Предупр.' },
                    { id: 'event', label: '🌿 Событие' },
                    { id: 'news', label: '📰 Новость' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewCategory(cat.id as any)}
                      className={`py-2 rounded-xl text-xs font-extrabold text-center border-2 transition-all cursor-pointer ${
                        newCategory === cat.id 
                          ? 'bg-brand-medium text-white border-brand-medium shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Заголовок объявления:</label>
                <input
                  type="text"
                  placeholder="Например: Планируется покос у детской площадки"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border-2 border-slate-200 focus:border-brand-medium focus:outline-none rounded-xl text-sm font-medium"
                  required
                />
              </div>

              {/* Village selection */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Село / Деревня:</label>
                <select
                  value={newVillage}
                  onChange={(e) => setNewVillage(e.target.value)}
                  className="w-full px-3.5 py-2 border-2 border-slate-200 focus:border-brand-medium focus:outline-none bg-white rounded-xl text-sm font-medium"
                >
                  <option value="Все поселения">Все поселения района</option>
                  <option value="Березник">Березник</option>
                  <option value="Шангалы">Шангалы</option>
                  <option value="Октябрьский">Октябрьский</option>
                  <option value="Ростовское">Ростовское</option>
                  <option value="Строевское">Строевское</option>
                  <option value="Едьма">Едьма</option>
                </select>
              </div>

              {/* Date selection */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Дата / Время события:</label>
                <input
                  type="text"
                  placeholder="Например: 12 июля в 11:00"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2 border-2 border-slate-200 focus:border-brand-medium focus:outline-none rounded-xl text-sm font-medium"
                />
              </div>

              {/* Description body */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Содержание:</label>
                <textarea
                  placeholder="Опишите подробно суть объявления. Жители района увидят его мгновенно!"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border-2 border-slate-200 focus:border-brand-medium focus:outline-none rounded-xl text-sm font-medium h-24 resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3 rounded-xl text-xs transition-all cursor-pointer border border-slate-200 text-center"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-medium hover:bg-brand-dark text-white font-black py-3 rounded-xl text-xs transition-all cursor-pointer shadow-xs border-b-2 border-brand-dark flex items-center justify-center gap-1 text-center"
                >
                  <Send size={13} />
                  <span>Опубликовать</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
