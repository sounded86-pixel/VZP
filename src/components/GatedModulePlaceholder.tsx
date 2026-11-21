import React from 'react';
import { motion } from 'motion/react';
import { 
  Lock, ArrowLeft, Mail, Phone, Building2, Sparkles, 
  CheckCircle, Shield, AlertTriangle, HelpCircle, Activity 
} from 'lucide-react';
import { UserProfile, Region } from '../types';

interface GatedModulePlaceholderProps {
  currentScreen: string;
  currentUser: UserProfile;
  activeRegion: Region;
  onNavigate: (screen: string) => void;
  onUpdateRegion: (updated: Region) => void;
}

export default function GatedModulePlaceholder({
  currentScreen,
  currentUser,
  activeRegion,
  onNavigate,
  onUpdateRegion
}: GatedModulePlaceholderProps) {
  const isPrivileged = currentUser.role === 'developer' || currentUser.role === 'admin' || currentUser.role === 'partner';

  // Get human name and details for the gated screen
  const getScreenDetails = () => {
    switch (currentScreen) {
      case 'delivery':
        return {
          title: "🚚 Продуктовый подвоз",
          desc: "Заказ и доставка свежих деревенских продуктов напрямую от фермеров и сельских производителей.",
          packageNeeded: "БИЗНЕС",
          color: "amber"
        };
      case 'transport':
        return {
          title: "🚌 Транспортная доступность",
          desc: "Расписания автобусов, поиск попутчиков, заявки на автоподвоз и мониторинг состояния дорог.",
          packageNeeded: "ГОСУДАРСТВО",
          color: "emerald"
        };
      case 'ecology':
        return {
          title: "🌳 Экологический патруль «Чистота»",
          desc: "Организация субботников, вывоз ТКО, сообщения о несанкционированных свалках и контроль чистоты района.",
          packageNeeded: "БИЗНЕС",
          color: "emerald"
        };
      case 'gov_support':
        return {
          title: "🏛️ Модуль «Власть и Субсидии»",
          desc: "Подача официальных обращений, просмотр муниципальных субсидий, поддержка сельских старост и связь с депутатами.",
          packageNeeded: "ГОСУДАРСТВО",
          color: "blue"
        };
      case 'sos':
        return {
          title: "🚨 Кнопка SOS 112",
          desc: "Экстренная сирена, передача точных GPS координат спасателям и автоматическое оповещение ближайших соседей.",
          packageNeeded: "ГОСУДАРСТВО",
          color: "red"
        };
      case 'analytics':
        return {
          title: "📊 Аналитика и Продвижение",
          desc: "Комплексные отчеты по активности жителей, коммерческой выручке, тепловые карты заявок и рекламный кабинет.",
          packageNeeded: "БИЗНЕС",
          color: "indigo"
        };
      default:
        return {
          title: "🔒 Коммерческий модуль",
          desc: "Данный раздел входит в расширенный пакет платформы «Взаимопомощь».",
          packageNeeded: "БИЗНЕС",
          color: "slate"
        };
    }
  };

  const details = getScreenDetails();

  // Helper to change the region package and update default module states
  const handleSetPackage = (tier: 'start' | 'business' | 'government') => {
    const defaultModules = {
      help: true,
      chat: true,
      masters: true,
      rating: true,
      news: true,
      products: tier === 'business' || tier === 'government',
      ecology: tier === 'business' || tier === 'government',
      analytics: tier === 'business' || tier === 'government',
      transport: tier === 'government',
      government: tier === 'government',
      sos: tier === 'government'
    };

    const updated: Region = {
      ...activeRegion,
      packages: tier === 'start' 
        ? ['start'] 
        : tier === 'business' 
          ? ['start', 'business'] 
          : ['start', 'business', 'government'],
      modules: defaultModules
    };

    onUpdateRegion(updated);
  };

  // Helper to toggle a single module flag
  const handleToggleModule = (moduleKey: keyof NonNullable<Region['modules']>) => {
    if (!activeRegion.modules) return;
    const updatedModules = {
      ...activeRegion.modules,
      [moduleKey]: !activeRegion.modules[moduleKey]
    };

    const updated: Region = {
      ...activeRegion,
      modules: updatedModules
    };

    onUpdateRegion(updated);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="gated_placeholder_screen">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold mb-6 transition-all"
        id="gated_back_btn"
      >
        <ArrowLeft size={16} />
        <span>Вернуться на главную</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Main Warning Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-2 border-slate-150 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden shadow-xs">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-100 text-amber-600 mb-4 animate-bounce">
              <Lock size={28} />
            </div>

            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Раздел временно неактивен
            </h1>
            
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-700">
              <Building2 size={13} className="text-slate-500" />
              <span>Регион: {activeRegion.name}</span>
            </div>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>{details.title}</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                {details.desc}
              </p>
            </div>

            <div className="mt-6 bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl text-left text-xs text-amber-900">
              <div className="flex gap-2.5">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1.5">
                  <p className="font-extrabold">Требуется пакет услуг «{details.packageNeeded}»</p>
                  <p className="leading-relaxed text-amber-800 font-medium">
                    Для активации этого раздела вашей районной администрации необходимо приобрести коммерческий пакет обслуживания. Обратитесь к муниципальным старостам или кураторам платформы.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Контакты службы развития</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="mailto:info@vzaimopomosh.ru" 
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Mail size={14} />
                  <span>info@vzaimopomosh.ru</span>
                </a>
                <span className="hidden sm:inline text-slate-300">|</span>
                <a 
                  href="tel:+78005553535" 
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Phone size={14} />
                  <span>+7 (800) 555-35-35</span>
                </a>
              </div>
            </div>
          </div>

          {/* Presentation of Packages */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="space-y-2">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} />
                <span>ЭКОСИСТЕМА ВЗАИМОПОМОЩИ</span>
              </div>
              <h2 className="text-lg font-black tracking-tight">Франчайзинговые тарифы расширения</h2>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200/90 leading-relaxed font-medium">
                ⏳ <strong>Планы на будущее:</strong> Данные тарифы указаны на перспективу дальнейшего расширения экосистемы, когда приложение заинтересует социальных предпринимателей и будет по достоинству оценено администрацией районов и областей.
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Package Base */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-indigo-300">🌱 ТАРИФ «BASE» (Основное ядро)</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    Для регионов, которым нужна только основная часть приложения (взаимопомощь, SOS 112, локальная база).
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-extrabold bg-indigo-500/20 text-indigo-200 py-1 px-2.5 rounded-lg border border-indigo-500/30">49 000 ₽</span>
                </div>
              </div>

              {/* Package Pro */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-emerald-300">🚀 ТАРИФ «PRO» (Расширенный пакет)</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    Для тех, кто хочет получить расширенный пакет модулей (эко-патруль, цифровая грамотность, аналитика).
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-extrabold bg-emerald-500/20 text-emerald-200 py-1 px-2.5 rounded-lg border border-emerald-500/30">149 000 ₽</span>
                </div>
              </div>

              {/* Package VIP */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-300">👑 ТАРИФ «VIP» (Полный регион)</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    Для тех, кто хочет настроить всё под свой регион, включая расширения для маркетплейсового модуля.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-extrabold bg-amber-500/20 text-amber-200 py-1 px-2.5 rounded-lg border border-amber-500/30">349 000 ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Admin/Developer Control Panel (If privileged) */}
        <div className="lg:col-span-5 space-y-6">
          {isPrivileged ? (
            <div className="bg-slate-900 text-white rounded-3xl p-6 border-2 border-indigo-500/30 shadow-lg space-y-6" id="privileged_control_panel">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Activity className="text-indigo-400 animate-pulse" size={20} />
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white">🛠️ Панель управления</h3>
                  <p className="text-[10px] text-indigo-300 font-bold">Доступно только: {currentUser.role.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Поскольку вы вошли как представитель администрации (<span className="text-indigo-300 font-black uppercase">{currentUser.role}</span>), вы можете переключать коммерческие пакеты вашего региона в реальном времени:
                </p>

                {/* Quick Package Toggles */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">Выбрать пакет региона:</span>
                  
                  <button
                    onClick={() => handleSetPackage('start')}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                      !activeRegion.packages.includes('business')
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-extrabold shadow-inner'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span>🌱 BASE (49 000 ₽)</span>
                    {!activeRegion.packages.includes('business') && <CheckCircle size={14} className="text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => handleSetPackage('business')}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                      activeRegion.packages.includes('business') && !activeRegion.packages.includes('government')
                        ? 'bg-amber-600/30 border-amber-500 text-white font-extrabold shadow-inner'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span>🚀 PRO (149 000 ₽)</span>
                    {activeRegion.packages.includes('business') && !activeRegion.packages.includes('government') && <CheckCircle size={14} className="text-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleSetPackage('government')}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                      activeRegion.packages.includes('government')
                        ? 'bg-emerald-600/30 border-emerald-500 text-white font-extrabold shadow-inner'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span>👑 VIP (349 000 ₽)</span>
                    {activeRegion.packages.includes('government') && <CheckCircle size={14} className="text-emerald-400" />}
                  </button>
                </div>

                {/* Individual Module Toggles */}
                {activeRegion.modules && (
                  <div className="space-y-2.5 pt-4 border-t border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">Тонкая настройка модулей (ON/OFF):</span>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <label className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 text-xs font-bold cursor-pointer hover:bg-white/10">
                        <span>🚚 Доставка продуктов</span>
                        <input 
                          type="checkbox" 
                          checked={activeRegion.modules.products} 
                          onChange={() => handleToggleModule('products')}
                          className="rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 text-xs font-bold cursor-pointer hover:bg-white/10">
                        <span>🚌 Расписание автобусов</span>
                        <input 
                          type="checkbox" 
                          checked={activeRegion.modules.transport} 
                          onChange={() => handleToggleModule('transport')}
                          className="rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 text-xs font-bold cursor-pointer hover:bg-white/10">
                        <span>🌳 Экология и Чистота</span>
                        <input 
                          type="checkbox" 
                          checked={activeRegion.modules.ecology} 
                          onChange={() => handleToggleModule('ecology')}
                          className="rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 text-xs font-bold cursor-pointer hover:bg-white/10">
                        <span>🏛️ Муниципальная Власть</span>
                        <input 
                          type="checkbox" 
                          checked={activeRegion.modules.government} 
                          onChange={() => handleToggleModule('government')}
                          className="rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 text-xs font-bold cursor-pointer hover:bg-white/10">
                        <span>🚨 Кнопка SOS 112</span>
                        <input 
                          type="checkbox" 
                          checked={activeRegion.modules.sos} 
                          onChange={() => handleToggleModule('sos')}
                          className="rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 text-xs font-bold cursor-pointer hover:bg-white/10">
                        <span>📊 Модуль аналитики</span>
                        <input 
                          type="checkbox" 
                          checked={activeRegion.modules.analytics} 
                          onChange={() => handleToggleModule('analytics')}
                          className="rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500">
                <HelpCircle size={22} />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800">Хотите протестировать раздел?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Смените вашу роль на <strong>Администратор (admin)</strong> или <strong>Разработчик (developer)</strong> в меню тестирования ролей в правом верхнем углу, чтобы получить панель управления и мгновенно активировать этот раздел!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
