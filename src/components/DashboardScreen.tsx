import React from 'react';
import { motion } from 'motion/react';
import { 
  HandHeart, MessageSquare, BookOpen, User, 
  MapPin, Star, ChevronRight, Sparkles
} from 'lucide-react';
import { UserProfile, Page, Entrepreneur, Region } from '../types';

interface DashboardScreenProps {
  currentUser: UserProfile;
  onNavigate: (screen: string) => void;
  onToggleSimplifiedMode?: (enabled: boolean) => void;
  onLogout?: () => void;
  unreadCount?: number;
  pages?: Page[];
  isCozyTheme?: boolean;
  onUpdateUser?: (user: UserProfile) => void;
  entrepreneurs?: Entrepreneur[];
  onUpdateEntrepreneur?: (entrId: string, updates: Partial<Entrepreneur>) => void;
  isOffline?: boolean;
  activeRegion?: Region;
  regions?: Region[];
  onUpdateRegion?: (updated: Region) => void;
}

export default function DashboardScreen({
  currentUser,
  onNavigate,
  unreadCount = 0
}: DashboardScreenProps) {
  const isSimplified = !!currentUser.isSimplifiedMode;
  const userName = currentUser.name ? currentUser.name.split(' ')[0] : 'Друг';
  const userVillage = currentUser.village || currentUser.location?.village || 'Октябрьский';
  const thanksCount = currentUser.thanksCount ?? (currentUser.rating?.thanks ?? 0);

  // Exact 4 tiles according to RuStore technical specification
  const tiles = [
    {
      id: 'help_nearby',
      title: '🤝 ПОМОЩЬ РЯДОМ',
      subtitle: 'Попросить или предложить помощь',
      icon: <HandHeart className="w-8 h-8 text-emerald-600" />,
      bgHover: 'hover:border-emerald-500 hover:shadow-emerald-100',
      badge: null,
      action: () => onNavigate('help_nearby')
    },
    {
      id: 'chat',
      title: '💬 СООБЩЕНИЯ',
      subtitle: 'Ваши переписки с соседями',
      icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
      bgHover: 'hover:border-blue-500 hover:shadow-blue-100',
      badge: unreadCount > 0 ? `${unreadCount} новых` : null,
      action: () => onNavigate('chat')
    },
    {
      id: 'digital_literacy',
      title: '📚 ЦИФРОВАЯ ГРАМОТНОСТЬ',
      subtitle: 'Научись пользоваться смартфоном',
      icon: <BookOpen className="w-8 h-8 text-amber-600" />,
      bgHover: 'hover:border-amber-500 hover:shadow-amber-100',
      badge: 'Уроки для пожилых',
      action: () => onNavigate('digital_literacy')
    },
    {
      id: 'profile',
      title: '👤 ПРОФИЛЬ',
      subtitle: 'Рейтинг, звания, настройки',
      icon: <User className="w-8 h-8 text-purple-600" />,
      bgHover: 'hover:border-purple-500 hover:shadow-purple-100',
      badge: null,
      action: () => onNavigate('profile')
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 animate-fadeIn" id="dashboard_screen">
      {/* Top Greeting Header according to TZ section 4 */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-100 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🤝</span>
          <span className="text-xs font-black tracking-widest text-emerald-700 uppercase">
            Взаимопомощь
          </span>
        </div>

        <h2 className={`font-black text-slate-900 tracking-tight ${isSimplified ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
          Привет, {userName}!
        </h2>

        {/* Location & Thanks rating info */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-3 text-xs sm:text-sm font-bold text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800">
            <MapPin size={15} className="text-emerald-600 shrink-0" />
            <span>{userVillage}</span>
          </span>

          <span className="text-slate-300">|</span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60">
            <Star size={15} className="text-amber-500 fill-amber-400 shrink-0" />
            <span>{thanksCount} «Спасибо»</span>
          </span>
        </div>
      </div>

      {/* 4 Main Action Cards */}
      <div className="space-y-3.5 sm:space-y-4">
        {tiles.map((tile, idx) => (
          <motion.button
            key={tile.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={tile.action}
            className={`w-full text-left bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200/90 shadow-sm transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer group ${tile.bgHover}`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Icon Container */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-md transition-all">
                {tile.icon}
              </div>

              {/* Text Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors ${
                    isSimplified ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                  }`}>
                    {tile.title}
                  </h3>
                  {tile.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {tile.badge}
                    </span>
                  )}
                </div>
                <p className={`text-slate-500 font-medium mt-1 truncate ${
                  isSimplified ? 'text-sm' : 'text-xs sm:text-sm'
                }`}>
                  {tile.subtitle}
                </p>
              </div>
            </div>

            {/* Right arrow */}
            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all shrink-0">
              <ChevronRight size={18} strokeWidth={2.5} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Help & FAQ and Community Guarantee footer */}
      <div className="text-center mt-7 space-y-2.5">
        <button
          onClick={() => onNavigate('faq')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-black transition-all cursor-pointer shadow-xs"
          id="dashboard_faq_btn"
        >
          <span>❓ Помощь, правила и частые вопросы (FAQ)</span>
        </button>

        <div className="text-xs font-semibold text-slate-400">
          100% бесплатно для всех жителей • Взаимопомощь по-соседски
        </div>
      </div>
    </div>
  );
}
