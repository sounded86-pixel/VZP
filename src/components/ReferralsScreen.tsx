import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, Check, Share2, Users, Award, TrendingUp, Coins, CheckCircle, 
  MessageCircle, Send, Star, UserCheck, ChevronRight, HelpCircle, ArrowLeft
} from 'lucide-react';
import { UserProfile } from '../types';

interface ReferralsScreenProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onBack: () => void;
}

export default function ReferralsScreen({ currentUser, users, onBack }: ReferralsScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const referralData = currentUser.referrals || {
    code: 'UST-MOCK-CODE',
    total: 0,
    totalEarnedPoints: 0,
    history: []
  };

  const countByRole = (roleStr: string) => {
    if (!referralData.history) return 0;
    return referralData.history.filter(friend => friend.userRole === roleStr).length;
  };
  const residentsCount = countByRole('resident');
  const mastersCount = countByRole('master');
  const entrepreneursCount = countByRole('entrepreneur');

  const shareText = `Присоединяйся к платформе взаимопомощи нашего района! Зарегистрируйся с моим реферальным кодом ${referralData.code} и получи стартовые баллы. Ссылка: ${window.location.origin}`;
  const encodedShareText = encodeURIComponent(shareText);
  const encodedShareUrl = encodeURIComponent(window.location.origin);

  const shareLinks = {
    vk: `https://vk.com/share.php?url=${encodedShareUrl}&title=${encodedShareText}`,
    ok: `https://connect.ok.ru/offer?url=${encodedShareUrl}&title=${encodedShareText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedShareText}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Milestones tracking
  const milestones = [
    { count: 1, label: 'Начинающий зазывала', reward: 'Знак отличия', desc: 'Пригласите 1 друга' },
    { count: 3, label: 'Посол Устьян', reward: '+15 Спасибо', desc: 'Пригласите 3 друзей' },
    { count: 5, label: 'Народный лидер', reward: 'Бронзовый статус', desc: 'Пригласите 5 друзей' },
    { count: 10, label: 'Хранитель Братства', reward: 'Золотой статус', desc: 'Пригласите 10 друзей' }
  ];

  const currentCount = referralData.total || 0;
  const activeMilestoneIdx = milestones.reduce((acc, m, idx) => (currentCount >= m.count ? idx : acc), -1);
  const nextMilestone = milestones.find(m => currentCount < m.count) || null;

  const getRankBadge = (count: number) => {
    if (count >= 10) return { label: 'Хранитель Братства', color: 'from-amber-500 to-yellow-600' };
    if (count >= 5) return { label: 'Народный лидер', color: 'from-orange-500 to-red-600' };
    if (count >= 3) return { label: 'Посол Устьян', color: 'from-teal-500 to-emerald-600' };
    if (count >= 1) return { label: 'Начинающий зазывала', color: 'from-blue-500 to-indigo-600' };
    return { label: 'Новичок приглашений', color: 'from-slate-400 to-slate-500' };
  };

  const userRank = getRankBadge(currentCount);

  // Map roles in Russian for history list
  const getRoleLabelRu = (roleStr: string) => {
    switch (roleStr) {
      case 'resident': return 'Житель 🏡';
      case 'master': return 'Мастер 🔨';
      case 'entrepreneur': return 'Активист 🤝';
      default: return 'Житель 🏡';
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 font-sans select-none" id="referrals_dashboard_screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors text-sm font-bold bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl"
        >
          <ArrowLeft size={16} /> Назад
        </button>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <HelpCircle size={16} /> Правила
        </button>
      </div>

      {/* Rules Explainer Alert */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 space-y-2 shadow-xs overflow-hidden"
          >
            <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-900">
              🎁 Система поощрений «Взаимопомощь»
            </h4>
            <p className="font-medium text-emerald-800/90 leading-relaxed">
              Делитесь своим кодом и получайте рейтинг-баллы за каждого приглашённого жителя:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-semibold text-emerald-950">
              <li>🏡 Сосед по деревне: <span className="text-emerald-700 font-extrabold">+15 баллов</span></li>
              <li>🔨 Мастер на все руки: <span className="text-emerald-700 font-extrabold">+30 баллов</span></li>
              <li>🤝 Активист села: <span className="text-emerald-700 font-extrabold">+40 баллов</span></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden mb-6">
        {/* Background blobs */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute left-10 -top-10 w-32 h-32 bg-teal-500/20 rounded-full blur-xl"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
              Реферальный офис
            </span>
            <div className="flex items-center gap-1 bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Award size={12} /> {userRank.label}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight">Приведи друга — Помоги Устьянам!</h3>
            <p className="text-xs text-emerald-100 font-medium leading-relaxed">
              Приглашайте соседей, мастеров и предпринимателей. Получайте баллы Спасибо и повышайте свой районный статус.
            </p>
          </div>

          {/* Referral Code Field */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-200/80 font-bold uppercase tracking-wider">Ваш уникальный код:</span>
              <p className="text-2xl font-black tracking-wider text-amber-300 font-mono leading-none">{referralData.code}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-white hover:bg-slate-50 text-slate-900 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" /> Скопировано!
                </>
              ) : (
                <>
                  <Copy size={14} /> Скопировать
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Social Sharing Buttons Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <a
          href={shareLinks.vk}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 bg-[#4C75A3]/5 border border-[#4C75A3]/20 hover:bg-[#4C75A3]/10 transition-all rounded-2xl gap-1 text-center group active:scale-95"
        >
          <Share2 size={18} className="text-[#4C75A3] group-hover:scale-115 transition-transform" />
          <span className="text-[10px] font-black text-slate-700">ВКонтакте</span>
        </a>
        <a
          href={shareLinks.ok}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 bg-[#ED812B]/5 border border-[#ED812B]/20 hover:bg-[#ED812B]/10 transition-all rounded-2xl gap-1 text-center group active:scale-95"
        >
          <Share2 size={18} className="text-[#ED812B] group-hover:scale-115 transition-transform" />
          <span className="text-[10px] font-black text-slate-700">Одноклассники</span>
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 bg-[#25D366]/5 border border-[#25D366]/20 hover:bg-[#25D366]/10 transition-all rounded-2xl gap-1 text-center group active:scale-95"
        >
          <MessageCircle size={18} className="text-[#25D366] group-hover:scale-115 transition-transform" />
          <span className="text-[10px] font-black text-slate-700">WhatsApp</span>
        </a>
      </div>

      {/* ТВОИ БОНУСЫ ЗА ПРИВЛЕЧЕНИЕ */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs mb-6 space-y-4">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
          🎁 Твои бонусы за привлечение:
        </h4>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center space-y-1">
            <span className="text-2xl">🏡</span>
            <p className="text-xs font-black text-slate-800">Житель</p>
            <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md inline-block">+10 баллов</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center space-y-1">
            <span className="text-2xl">🔨</span>
            <p className="text-xs font-black text-slate-800">Мастер</p>
            <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md inline-block">+30 баллов</p>
            <div className="text-[8px] text-slate-500 space-y-0.5 font-bold pt-1 border-t border-slate-200 mt-1">
              <p>PRO: +50 б.</p>
              <p>VIP: +100 б.</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center space-y-1">
            <span className="text-2xl">💼</span>
            <p className="text-xs font-black text-slate-800">Предпр.</p>
            <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md inline-block">+40 баллов</p>
            <div className="text-[8px] text-slate-500 space-y-0.5 font-bold pt-1 border-t border-slate-200 mt-1">
              <p>PRO: +60 б.</p>
              <p>VIP: +120 б.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ТВОЯ СТАТИСТИКА */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs mb-6 space-y-4">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          📊 Твоя статистика:
        </h4>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 font-semibold text-xs text-slate-700">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">🏡 Приведено жителей:</span>
            <span className="font-extrabold text-slate-900">{residentsCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">🔨 Приведено мастеров:</span>
            <span className="font-extrabold text-slate-900">{mastersCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">💼 Приведено предпринимателей:</span>
            <span className="font-extrabold text-slate-900">{entrepreneursCount}</span>
          </div>
          <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 text-sm">
            <span className="flex items-center gap-1.5 font-black text-slate-800">💰 Всего баллов начислено:</span>
            <span className="font-black text-emerald-600">+{referralData.totalEarnedPoints}</span>
          </div>
        </div>
      </div>

      {/* Следующая награда */}
      <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-4 mb-6 space-y-2">
        <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
          🏆 Следующая награда:
        </h4>
        <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-500/10 text-xs text-slate-700 font-bold">
          {mastersCount === 0 ? (
            <p>Приведи ещё 1 мастера → <span className="text-emerald-600 font-extrabold">+30 баллов</span></p>
          ) : entrepreneursCount === 0 ? (
            <p>Приведи еще 1 предпринимателя → <span className="text-emerald-600 font-extrabold">+40 баллов</span></p>
          ) : (
            <p>Приведи еще 1 активного соседа → <span className="text-emerald-600 font-extrabold">+10 баллов</span></p>
          )}
        </div>
      </div>

      {/* Gamified Milestones Achievement Board */}
      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3.5 mb-6 shadow-2xs">
        <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          🏆 Прогресс Рангов Приглашений:
        </h4>

        {/* Milestone Steps Timeline */}
        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const isUnlocked = currentCount >= m.count;
            return (
              <div
                key={m.count}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-emerald-100/50 border-emerald-200 text-emerald-950'
                    : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isUnlocked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? '✓' : m.count}
                  </div>
                  <div>
                    <p className={`text-xs font-black ${isUnlocked ? 'text-emerald-900' : 'text-slate-700'}`}>
                      {m.label}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 leading-tight">{m.desc}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isUnlocked ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-400'
                }`}>
                  {m.reward}
                </span>
              </div>
            );
          })}
        </div>

        {nextMilestone && (
          <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
              <span>До ранга «{nextMilestone.label}»</span>
              <span>{currentCount} / {nextMilestone.count} друзей</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (currentCount / nextMilestone.count) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* History / Referred Users List */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            👥 Мои приглашенные друзья ({referralData.history?.length || 0})
          </h4>
        </div>

        {(!referralData.history || referralData.history.length === 0) ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Users size={20} />
            </div>
            <p className="text-xs text-slate-500 font-bold">Вы пока никого не пригласили</p>
            <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
              Поделитесь вашим кодом выше, чтобы ваши друзья появились в этой таблице.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {referralData.history.map((friend) => (
              <div key={friend.userId} className="py-3 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">{friend.userName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded-sm">
                      {getRoleLabelRu(friend.userRole)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">{friend.date}</span>
                  </div>
                  
                  {/* Tariff Upgrades badges */}
                  {friend.upgrades && friend.upgrades.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {friend.upgrades.map((upg, uIdx) => (
                        <span key={uIdx} className="bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200">
                          👑 {upg.tariff.toUpperCase()} (+{upg.pointsEarned} Спасибо)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600">
                    +{friend.pointsEarned}
                  </span>
                  <p className="text-[8px] text-slate-400 font-black uppercase">Спасибо</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
