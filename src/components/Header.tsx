import React from 'react';
import { UserProfile } from '../types';
import { Wifi, WifiOff, Users, Shield, Smartphone, StickyNote, Search, Cpu, Menu, X, HandHeart, MessageSquare, BookOpen, User as UserIcon, Car, Battery, Info, HelpCircle } from 'lucide-react';
import { useUserRole } from '../hooks/useUserRole';
import { TEST_ROLES } from '../constants/testRoles';
import { useRole } from '../context/RoleContext';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  currentUserId: string;
  users: UserProfile[];
  onUserChange: (userId: string) => void;
  isOffline: boolean;
  onOfflineToggle: () => void;
  pendingQueueCount: number;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  unreadCount: number;
  onToggleSimplifiedMode: (enabled: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isCozyTheme?: boolean;
  onToggleCozyTheme?: (enabled: boolean) => void;
  onOpenRuStorePublish?: () => void;
}

export default function Header({
  currentUserId,
  users,
  onUserChange,
  isOffline,
  onOfflineToggle,
  pendingQueueCount,
  currentScreen,
  onNavigate,
  unreadCount,
  onToggleSimplifiedMode,
  searchQuery,
  onSearchQueryChange,
  isCozyTheme = false,
  onToggleCozyTheme,
  onOpenRuStorePublish
}: HeaderProps) {
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { currentRole, isAdmin, isDeveloper } = useRole();
  
  const currentUser = React.useMemo(() => {
    const found = users.find(u => u.id === currentUserId);
    if (found) return found;
    // Fallback to TEST_ROLES if starting with test_
    if (currentUserId?.startsWith('test_')) {
      return TEST_ROLES.find(t => t.id === currentUserId);
    }
    return users[0];
  }, [users, currentUserId]);

  const [logoClicks, setLogoClicks] = React.useState(0);
  const [devUnlocked, setDevUnlocked] = React.useState(() => {
    return localStorage.getItem('ustyany_dev_unlocked') === 'true';
  });

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);
    if (nextClicks >= 5) {
      setDevUnlocked(true);
      localStorage.setItem('ustyany_dev_unlocked', 'true');
      try {
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch (e) {}
      alert("🔓 РЕЖИМ РАЗРАБОТЧИКА АКТИВИРОВАН!\n\nВ верхнем правом меню разблокирована кнопка доступа к секретному пульту управления 🔧");
      setLogoClicks(0);
      const devRole = TEST_ROLES.find(t => t.id === 'test_developer');
      if (devRole) {
        handleSelectTestRole(devRole);
      }
    } else {
      onNavigate('home');
    }
  };

  const isTestingMode = React.useMemo(() => {
    return localStorage.getItem('ustyany_test_role_active') === 'true';
  }, [currentUserId]);

  const originalUserId = React.useMemo(() => {
    return localStorage.getItem('ustyany_original_user_id');
  }, [currentUserId]);

  const handleSelectTestRole = (role: typeof TEST_ROLES[0]) => {
    // If not currently in testing mode, save original user
    if (!isTestingMode) {
      localStorage.setItem('ustyany_original_user_id', currentUserId);
    }
    localStorage.setItem('ustyany_test_role_active', 'true');
    localStorage.setItem('ustyany_active_test_role_id', role.id);
    
    onUserChange(role.id);
    setShowRoleDropdown(false);
  };

  const handleReturnToRealAccount = () => {
    const original = localStorage.getItem('ustyany_original_user_id');
    if (original) {
      onUserChange(original);
    }
    localStorage.removeItem('ustyany_original_user_id');
    localStorage.setItem('ustyany_test_role_active', 'false');
    localStorage.removeItem('ustyany_active_test_role_id');
    setShowRoleDropdown(false);
  };

  const getRoleBadgeColor = (roleStr: string) => {
    switch (roleStr) {
      case 'resident': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'elderly': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'child': return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      case 'master': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'entrepreneur': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'admin':
      case 'main_admin':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'partner': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'developer': return 'bg-slate-850 text-slate-300 border border-slate-750';
      default: return 'bg-slate-850 text-slate-300 border border-slate-750';
    }
  };

  const getRoleNameRu = (roleStr: string) => {
    switch (roleStr) {
      case 'resident': return 'ЖИТЕЛЬ';
      case 'elderly': return 'ПЕНСИОНЕР';
      case 'child': return 'РЕБЁНОК';
      case 'master': return 'МАСТЕР';
      case 'entrepreneur': return 'АКТИВИСТ';
      case 'admin':
      case 'main_admin':
        return 'АДМИНИСТРАТОР';
      case 'partner': return 'ПАРТНЁР';
      case 'developer': return 'РАЗРАБОТЧИК';
      default: return 'ПОЛЬЗОВАТЕЛЬ';
    }
  };
  const showDevButton = isDeveloper;


  return (
    <header className="bg-brand-dark text-white shadow-md sticky top-0 z-50 font-sans">
      {/* Top Utility Bar (Compact navigation toolbar on mobile, tagline on desktop) */}
      <div className="bg-slate-950 border-b border-white/5 text-slate-400 text-[11px] px-3 py-1 flex items-center justify-between gap-2 font-medium">
        
        {/* Mobile Action Buttons (Organically fitted on mobile screens) */}
        <div className="md:hidden flex-1 flex items-center justify-between gap-1 max-w-sm mr-2">
          {/* Notes */}
          <button
            onClick={() => onNavigate('notes')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[9px] font-bold transition-all ${
              currentScreen === 'notes' ? "bg-amber-600/30 text-amber-300 font-extrabold" : "text-slate-300 hover:text-white"
            }`}
            title="Заметки"
          >
            <StickyNote size={13} className="text-amber-400" />
            <span className="mt-0.5">Заметки</span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => onToggleSimplifiedMode(!currentUser?.isSimplifiedMode)}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[9px] font-bold transition-all ${
              currentUser?.isSimplifiedMode ? "bg-yellow-400 text-black font-extrabold" : "text-slate-300 hover:text-white"
            }`}
            title="Сменить вид"
          >
            <Smartphone size={13} className={currentUser?.isSimplifiedMode ? "text-black" : "text-yellow-400"} />
            <span className="mt-0.5">{currentUser?.isSimplifiedMode ? "Обычный" : "Крупный"}</span>
          </button>


        </div>

        {/* Desktop Title Tagline */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-black">
            Бесплатная платформа взаимопомощи для жителей
          </span>
        </div>

        {/* Network & Offline section */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOfflineToggle}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all shrink-0 ${
              isOffline
                ? "bg-red-600 text-white animate-pulse"
                : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
            title="Переключить режим сети"
          >
            {isOffline ? <WifiOff size={10} className="shrink-0" /> : <Wifi size={10} className="shrink-0" />}
            <span>
              {isOffline ? `ОФЛАЙН (${pendingQueueCount})` : "В СЕТИ"}
            </span>
          </button>
          
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-[9px] text-slate-500 hidden md:inline font-mono">iOS 15+ / Android 6+</span>
        </div>
      </div>

      {/* Main App Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 w-full">
        {/* Brand Logo Section */}
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={handleLogoClick}>
          {isCozyTheme ? (
            <div className="relative">
              <div className="bg-white p-1 rounded-xl shadow-md transition-all hover:scale-105">
                <BrandLogo variant="icon" size={26} />
              </div>
              <span className="absolute -bottom-1 -right-1 text-xs" title="Уютный режим">☕</span>
            </div>
          ) : (
            <div className="bg-white p-1 rounded-xl shadow-md transition-all hover:scale-105">
              <BrandLogo variant="icon" size={28} />
            </div>
          )}
          <div>
            <h1 className={`text-sm sm:text-base font-black tracking-tight leading-none ${isCozyTheme ? "text-[#FEFDFB] text-lg" : "text-white"}`} style={{ fontFamily: '"Nexa Bold", "Inter", sans-serif' }}>
              {isCozyTheme ? "Взаимопомощь Устьяны" : "Взаимопомощь"}
            </h1>
            <p className="text-[8px] text-[#6FD000] uppercase tracking-widest font-black mt-1.5 hidden sm:block">
              {isCozyTheme ? "☕ УЮТНЫЙ РЕЖИМ" : "ПОРТАЛ ВЗАИМОПОМОЩИ"}
            </p>
          </div>
        </div>

        {/* Search Bar (Visible only on medium/desktop screens) */}
        <div className="relative flex-1 max-w-xs lg:max-w-sm min-w-0 hidden md:block">
          <Search size={13} className="absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по теме объявлений..."
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value);
              if (currentScreen !== 'lenta' && e.target.value.trim() !== '') {
                onNavigate('lenta');
              }
            }}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/40 hover:bg-slate-900/60 focus:bg-white border border-white/10 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-full text-xs text-white focus:text-slate-800 font-medium placeholder:text-slate-400 transition-all shadow-inner"
          />
        </div>

        {/* Desktop-only action buttons */}
        <div className="hidden md:flex flex-wrap items-center justify-end gap-2 shrink-0">
          {/* Notes */}
          <button
            onClick={() => onNavigate('notes')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 ${
              currentScreen === 'notes'
                ? "bg-amber-600 text-white font-extrabold"
                : "bg-white/5 hover:bg-white/10 text-slate-200"
            }`}
            title="Заметки"
          >
            <StickyNote size={12} className="shrink-0 text-amber-400" />
            <span>Заметки</span>
          </button>

          {/* Help & FAQ */}
          <button
            onClick={() => onNavigate('faq')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 ${
              currentScreen === 'faq'
                ? "bg-teal-600 text-white font-extrabold"
                : "bg-white/5 hover:bg-white/10 text-slate-200"
            }`}
            title="Помощь и частые вопросы (FAQ)"
          >
            <HelpCircle size={12} className="shrink-0 text-teal-400" />
            <span>FAQ / Помощь</span>
          </button>

          {/* Interactive Village link */}
          <button
            onClick={() => onNavigate('interactive_village')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 top-header-btn ${
              currentScreen === 'interactive_village' || currentScreen === 'village_archive'
                ? "bg-amber-600 text-white font-extrabold shadow-md"
                : "bg-amber-950/60 text-amber-200 border border-amber-800/40 hover:bg-amber-900 hover:text-white"
            }`}
            title="Интерактивная деревня (цифровой архив жителей и домов)"
          >
            <span>🏡 Деревня</span>
          </button>

          {/* Simplified Mode Button */}
          <button
            onClick={() => onToggleSimplifiedMode(!currentUser?.isSimplifiedMode)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 btn-no-wood top-header-btn ${
              currentUser?.isSimplifiedMode
                ? "bg-yellow-400 text-black border border-yellow-300 font-extrabold"
                : "bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white"
            }`}
            title="Переключить простой режим"
          >
            <Smartphone size={12} className="shrink-0 text-yellow-400" />
            <span>{currentUser?.isSimplifiedMode ? "Обычный вид" : "Крупный шрифт"}</span>
          </button>

          {/* RuStore Publish Button */}
          <button
            onClick={onOpenRuStorePublish || (() => onNavigate('rustore_publish'))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-md shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 border border-emerald-400/40"
            title="Сборка APK и инструкция по публикации в RuStore"
          >
            <Smartphone size={13} className="shrink-0 text-emerald-200" />
            <span>🚀 В RuStore</span>
          </button>



          {/* Developer Console desktop button */}
          {showDevButton && (
            <button
              onClick={() => onNavigate('dev_console')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm shrink-0 ${
                currentScreen === 'dev_console'
                  ? "bg-sky-600 text-white font-extrabold"
                  : "bg-sky-950 text-sky-300 border border-sky-850 hover:bg-sky-900 hover:text-white"
              }`}
              title="Открыть консоль управления"
            >
              <Cpu size={12} className="shrink-0 text-sky-400 animate-spin-slow" />
              <span>🔧 Консоль</span>
            </button>
          )}
        </div>

        {/* Mobile Quick Action Buttons & Hamburger (Visible only on mobile/tablet) */}
        <div className="flex items-center gap-1.5 md:hidden">
          {/* Quick Search shortcut that triggers the feed */}
          <button
            onClick={() => {
              onNavigate('lenta');
            }}
            className="p-2 hover:bg-white/10 active:bg-white/20 rounded-xl text-slate-300 transition-all flex items-center justify-center"
            title="Поиск помощи"
          >
            <Search size={18} />
          </button>

          {/* Hamburger Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-white/10 active:bg-white/20 rounded-xl text-slate-300 transition-all flex items-center justify-center"
            title="Меню"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Role Testing Mode Status & Indicator Sub-bar (Desktop only) */}
      <div className="hidden md:flex bg-slate-950 border-t border-white/5 px-4 py-2.5 flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Active User Stats Indicator */}
          <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
            <span className="font-semibold text-white">👤 {currentUser?.name || 'Гость'}</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${getRoleBadgeColor(currentRole)}`}>
              {getRoleNameRu(currentRole)}
            </span>
            {currentUser?.village && (
              <span className="text-slate-400 text-[11px] flex items-center gap-0.5">
                📍 {currentUser.village}
              </span>
            )}
            {currentUser?.thanksCount !== undefined && (
              <span className="text-slate-400 text-[11px] font-medium">
                ⭐ {currentUser.thanksCount} «Спасибо»
              </span>
            )}
          </div>

          {/* Test Mode Label */}
          {isTestingMode && (
            <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              🔧 Режим тестирования
            </span>
          )}
        </div>

        {/* Action Swapper dropdown & Return button */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Dropdown Toggle */}
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>СМЕНИТЬ РОЛЬ ▼</span>
          </button>

          {/* Return button */}
          {isTestingMode && originalUserId && (
            <button
              onClick={handleReturnToRealAccount}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] rounded-xl shadow-md shadow-purple-950/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Выйти из режима тестирования ролей"
            >
              <span>🔙 ВЕРНУТЬСЯ В СВОЙ АККАУНТ</span>
            </button>
          )}

          {/* Dropdown Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-1.5 block border-b border-slate-850">
                ВЫБЕРИТЕ РОЛЬ ДЛЯ ТЕСТИРОВАНИЯ
              </span>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-850/40">
                {TEST_ROLES.filter((role) => currentRole === 'developer' || role.role !== 'developer').map((role) => {
                  const isActive = currentUserId === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectTestRole(role)}
                      className={`w-full text-left p-3 hover:bg-slate-800 transition-all flex flex-col gap-1 cursor-pointer ${
                        isActive ? 'bg-slate-800/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white">{role.name}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border uppercase ${getRoleBadgeColor(role.role)}`}>
                          {role.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>📍 {role.village}</span>
                        <span className="font-mono text-purple-400 font-bold">{role.ratingText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Slide-over Menu (Mobile & Tablet only) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop overlay with blur */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-full bg-slate-900 border-l border-slate-800 text-white h-full flex flex-col p-5 shadow-2xl overflow-y-auto transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-black tracking-wider uppercase text-slate-400">🌿 МЕНЮ ПОРТАЛА</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Info block */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 mb-5 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center font-black text-white text-sm">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : '👤'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm leading-tight">{currentUser?.name || 'Гость'}</h4>
                  {currentUser?.village && <span className="text-slate-400 font-medium">📍 {currentUser.village}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-850/60 text-[10px]">
                <span className={`font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleBadgeColor(currentRole)}`}>
                  {getRoleNameRu(currentRole)}
                </span>
                {currentUser?.thanksCount !== undefined && (
                  <span className="text-yellow-400 font-bold">★ {currentUser.thanksCount} спасибо</span>
                )}
              </div>
            </div>

            {/* Quick sections according to RuStore specification */}
            <div className="space-y-1.5 mb-6">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Разделы приложения</span>

              {/* Help Nearby */}
              <button
                onClick={() => {
                  onNavigate('help_nearby');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'help_nearby' ? "bg-emerald-600/30 text-emerald-300 font-extrabold" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <HandHeart size={14} className="text-emerald-400" />
                <span>🤝 Помощь рядом</span>
              </button>

              {/* Chat */}
              <button
                onClick={() => {
                  onNavigate('chat');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'chat' ? "bg-blue-600/30 text-blue-300 font-extrabold" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <MessageSquare size={14} className="text-blue-400" />
                <span>💬 Сообщения</span>
              </button>

              {/* Digital Literacy */}
              <button
                onClick={() => {
                  onNavigate('digital_literacy');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'digital_literacy' ? "bg-amber-600/30 text-amber-300 font-extrabold" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <BookOpen size={14} className="text-amber-400" />
                <span>📚 Цифровая грамотность</span>
              </button>

              {/* Profile */}
              <button
                onClick={() => {
                  onNavigate('profile');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'profile' ? "bg-purple-600/30 text-purple-300 font-extrabold" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <UserIcon size={14} className="text-purple-400" />
                <span>👤 Профиль и рейтинг</span>
              </button>

              {/* Car Rides / Попутки */}
              <button
                onClick={() => {
                  onNavigate('transport');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'transport' ? "bg-sky-600/30 text-sky-300 font-extrabold" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <Car size={14} className="text-sky-400" />
                <span>🚗 Поиск попуток между сёлами</span>
              </button>

              {/* Battery collection points */}
              <button
                onClick={() => {
                  onNavigate('ecology');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'ecology' ? "bg-teal-600/30 text-teal-300 font-extrabold" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <Battery size={14} className="text-teal-400" />
                <span>🔋 Куда сдать батарейки</span>
              </button>

              {/* Interactive Village link */}
              <button
                onClick={() => {
                  onNavigate('interactive_village');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'interactive_village' || currentScreen === 'village_archive' ? "bg-amber-600/30 text-amber-200 font-extrabold" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <span className="text-sm">🏡</span>
                <span>Интерактивная деревня</span>
              </button>

              {/* Notes link */}
              <button
                onClick={() => {
                  onNavigate('notes');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'notes' ? "bg-amber-600/20 text-amber-300" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <StickyNote size={14} className="text-amber-400" />
                <span>Заметки</span>
              </button>

              {/* Help & FAQ */}
              <button
                onClick={() => {
                  onNavigate('faq');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'faq' ? "bg-teal-600/30 text-teal-200 font-extrabold" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <HelpCircle size={14} className="text-teal-400" />
                <span>❓ Помощь и FAQ</span>
              </button>

              {/* About app */}
              <button
                onClick={() => {
                  onNavigate('page_about');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentScreen === 'page_about' ? "bg-slate-700 text-white" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <Info size={14} className="text-slate-400" />
                <span>ℹ️ О приложении</span>
              </button>

              {/* RuStore publish link */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenRuStorePublish) {
                    onOpenRuStorePublish();
                  } else {
                    onNavigate('rustore_publish');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-500/40"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone size={15} className="text-emerald-300" />
                  <span>Публикация в RuStore</span>
                </div>
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">APK</span>
              </button>

              {/* Simplified mode toggle */}
              <button
                onClick={() => {
                  onToggleSimplifiedMode(!currentUser?.isSimplifiedMode);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentUser?.isSimplifiedMode ? "bg-yellow-400/20 text-yellow-300" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <Smartphone size={14} className="text-yellow-400" />
                <span>{currentUser?.isSimplifiedMode ? "Обычный режим" : "Простой вид"}</span>
              </button>

              {/* Developer Console button */}
              {showDevButton && (
                <button
                  onClick={() => {
                    onNavigate('dev_console');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all ${
                    currentScreen === 'dev_console' ? "bg-sky-600/20 text-sky-200" : "bg-sky-950 text-sky-300 hover:bg-sky-900"
                  }`}
                >
                  <Cpu size={14} className="text-sky-400" />
                  <span>🔧 Пульт разработчика</span>
                </button>
              )}
            </div>

            {/* Test Roles Selector inside Hamburger */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Смена тестовой роли</span>
                {isTestingMode && originalUserId && (
                  <button
                    onClick={() => {
                      handleReturnToRealAccount();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-[9px] bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 px-2 py-0.5 rounded-md font-bold"
                  >
                    СБРОСИТЬ
                  </button>
                )}
              </div>

              <div className="overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-950/40 max-h-60">
                {TEST_ROLES.filter((role) => currentRole === 'developer' || role.role !== 'developer').map((role) => {
                  const isActive = currentUserId === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        handleSelectTestRole(role);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 hover:bg-slate-800 transition-all flex flex-col gap-0.5 ${
                        isActive ? 'bg-slate-800/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white leading-tight">{role.name}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase ${getRoleBadgeColor(role.role)}`}>
                          {role.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>📍 {role.village}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
