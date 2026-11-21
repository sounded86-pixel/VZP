import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, BarChart3, Megaphone, Sparkles, Eye, MousePointerClick, 
  TrendingUp, TrendingDown, Users, CreditCard, Play, Pause, Trash2, 
  Plus, Check, MapPin, AlertCircle, Clock, Award, Star, ShoppingBag, 
  ChevronRight, Calendar, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { UserProfile, USTYANY_VILLAGES } from '../types';

interface AnalyticsScreenProps {
  currentUser: UserProfile;
  isOffline: boolean;
  onBack: () => void;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'top_search' | 'banner' | 'village_priority';
  targetVillages: string[];
  dailyBudget: number;
  totalSpent: number;
  impressions: number;
  clicks: number;
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
}

export default function AnalyticsScreen({ currentUser, isOffline, onBack }: AnalyticsScreenProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'campaigns' | 'ai_advisor'>('analytics');
  
  // Simulated Balance State
  const [balance, setBalance] = useState<number>(2450);
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<string>('500');

  // Active campaigns list
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'camp-1',
      title: currentUser.isMaster 
        ? `Продвижение услуг: ${currentUser.name}`
        : 'Доставка свежих продуктов из пекарни',
      description: currentUser.isMaster
        ? 'Профессиональное выполнение заказов, выезд по всему району. Звоните прямо сейчас!'
        : 'Быстрая доставка хлеба и выпечки в Шангалы и Березник. Только свежие ингредиенты!',
      type: 'top_search',
      targetVillages: ['Октябрьский', 'Шангалы', 'Березник'],
      dailyBudget: 150,
      totalSpent: 420,
      impressions: 3420,
      clicks: 284,
      status: 'active',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'camp-2',
      title: 'Срочный выезд мастера в Березник',
      description: 'Любые сантехнические и плотницкие работы в день обращения. Качественно, с гарантией!',
      type: 'village_priority',
      targetVillages: ['Березник', 'Строевское'],
      dailyBudget: 80,
      totalSpent: 160,
      impressions: 1140,
      clicks: 95,
      status: 'paused',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // Campaign Form State
  const [newCampaignTitle, setNewCampaignTitle] = useState<string>('');
  const [newCampaignDesc, setNewCampaignDesc] = useState<string>('');
  const [newCampaignType, setNewCampaignType] = useState<'top_search' | 'banner' | 'village_priority'>('top_search');
  const [selectedVillages, setSelectedVillages] = useState<string[]>(['Октябрьский']);
  const [dailyBudget, setDailyBudget] = useState<number>(100);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // AI Advisor State
  const [aiIndustry, setAiIndustry] = useState<string>(currentUser.isMaster ? 'строительство' : 'торговля');
  const [generatedSlogan, setGeneratedSlogan] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Stats over time (for custom SVG graph)
  const viewsHistory = [
    { day: 'Пн', count: 45 },
    { day: 'Вт', count: 52 },
    { day: 'Ср', count: 68 },
    { day: 'Чт', count: 61 },
    { day: 'Пт', count: 85 },
    { day: 'Сб', count: 94 },
    { day: 'Вс', count: 110 }
  ];

  const clicksHistory = [
    { day: 'Пн', count: 8 },
    { day: 'Вт', count: 12 },
    { day: 'Ср', count: 15 },
    { day: 'Чт', count: 11 },
    { day: 'Пт', count: 19 },
    { day: 'Сб', count: 22 },
    { day: 'Вс', count: 28 }
  ];

  // Helper calculation
  const totalViews = viewsHistory.reduce((sum, item) => sum + item.count, 0) * 4;
  const totalClicks = clicksHistory.reduce((sum, item) => sum + item.count, 0) * 4;
  const averageCtr = ((totalClicks / totalViews) * 100).toFixed(1);

  // Handle village click in form
  const toggleVillageSelection = (villageName: string) => {
    if (selectedVillages.includes(villageName)) {
      if (selectedVillages.length > 1) {
        setSelectedVillages(prev => prev.filter(v => v !== villageName));
      }
    } else {
      setSelectedVillages(prev => [...prev, villageName]);
    }
  };

  // Pre-fill campaign templates
  useEffect(() => {
    if (showCreateForm) {
      setNewCampaignTitle(
        currentUser.isMaster 
          ? `Услуги профессионала: ${currentUser.name}`
          : 'Свежие предложения от предпринимателя'
      );
      setNewCampaignDesc(
        currentUser.isMaster
          ? 'Качественные услуги мастера в Устьянском районе. Быстрый выезд, честные цены и доброжелательный сервис!'
          : 'Высокое качество, доступность и доставка на дом. Скидки постоянным клиентам и пенсионерам!'
      );
    }
  }, [showCreateForm, currentUser]);

  // Handle balance top-up
  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (!isNaN(amount) && amount > 0) {
      setBalance(prev => prev + amount);
      setShowTopUpModal(false);
      setTopUpAmount('500');
    }
  };

  // Handle create campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim()) {
      setFormError('Укажите заголовок рекламного объявления.');
      return;
    }
    if (newCampaignTitle.length < 5) {
      setFormError('Заголовок должен быть не менее 5 символов.');
      return;
    }
    if (!newCampaignDesc.trim() || newCampaignDesc.length < 15) {
      setFormError('Описание должно содержать не менее 15 символов.');
      return;
    }
    if (dailyBudget < 50) {
      setFormError('Минимальный дневной бюджет — 50 ₽.');
      return;
    }
    if (balance < dailyBudget) {
      setFormError('Недостаточно средств на балансе для запуска кампании.');
      return;
    }

    // Deduct daily budget as simulation start
    setBalance(prev => prev - dailyBudget);

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      title: newCampaignTitle,
      description: newCampaignDesc,
      type: newCampaignType,
      targetVillages: selectedVillages,
      dailyBudget: dailyBudget,
      totalSpent: dailyBudget, // initial spend
      impressions: 0,
      clicks: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setCampaigns(prev => [newCamp, ...prev]);
    setShowCreateForm(false);
    setFormError('');
    setActiveTab('campaigns');
  };

  // Delete Campaign
  const handleDeleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  // Toggle Campaign Status
  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus: 'active' | 'paused' = c.status === 'active' ? 'paused' : 'active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  // Local AI Slogan Writer generator
  const handleGenerateAISlogan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const templates = [
        `«Ремонт и услуги от мастера ${currentUser.name} в с. ${currentUser.village}. Качество, проверенное временем!»`,
        `«Нужен надежный специалист? ${currentUser.name} поможет решить любые задачи в с. ${currentUser.village}! Опыт более 10 лет.»`,
        `«Спецпредложение для жителей Устьян! Профессиональный мастер ${currentUser.name} — выезд на дом в удобное время.»`,
        `«Честный ремонт и обслуживание в Устьянском районе от ${currentUser.name}. Только положительные отзывы соседей!»`,
        `«Выбирайте профессионала своего дела! ${currentUser.name} гарантирует оперативность и идеальный результат в с. ${currentUser.village}.»`
      ];
      
      const randomIdx = Math.floor(Math.random() * templates.length);
      setGeneratedSlogan(templates[randomIdx]);
      setIsGenerating(false);
    }, 1200);
  };

  // Calculate coordinates for graph to draw line
  const maxVal = 120;
  const graphWidth = 500;
  const graphHeight = 150;
  const points = viewsHistory.map((item, index) => {
    const x = (index / (viewsHistory.length - 1)) * (graphWidth - 40) + 20;
    const y = graphHeight - ((item.count / maxVal) * (graphHeight - 30) + 15);
    return { x, y, day: item.day, val: item.count };
  });

  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans select-none" id="analytics_and_ads_screen">
      
      {/* 📌 Header Nav Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" id="analytics_header">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Назад"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Аналитика & Реклама</h2>
              <span className="bg-brand-medium text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                PRO / VIP
              </span>
            </div>
            <p className="text-xs text-slate-500">Управление рекламным бюджетом, продвижением услуг и статистикой охвата</p>
          </div>
        </div>

        {/* Balance Card Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 px-4 flex items-center justify-between gap-6 shadow-xs shrink-0 self-start sm:self-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light/30 text-brand-medium flex items-center justify-center border border-brand-light/60">
              <CreditCard size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Баланс рекламы</span>
              <strong className="text-lg font-black text-slate-800 font-mono">{balance.toLocaleString('ru-RU')} ₽</strong>
            </div>
          </div>
          <button
            onClick={() => setShowTopUpModal(true)}
            className="bg-brand-medium hover:bg-brand-medium/90 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus size={14} />
            Пополнить
          </button>
        </div>
      </div>

      {/* 📌 Tab Bar Switcher */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 shrink-0 overflow-x-auto no-scrollbar" id="analytics_tabs">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 size={16} />
          Статистика и отчеты
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 px-4 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Megaphone size={16} />
          Рекламные кампании
          <span className="bg-brand-light/50 text-brand-dark px-2 py-0.5 rounded-full text-[9px]">
            {campaigns.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ai_advisor')}
          className={`pb-3 px-4 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ai_advisor'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles size={16} />
          AI-Маркетолог Устьян
        </button>
      </div>

      {/* 📌 Main Content Tabs */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: ANALYTICS METRICS */}
        {activeTab === 'analytics' && (
          <motion.div
            key="tab_analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
            id="tab_analytics_content"
          >
            {/* KPI Cards Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Profile Views */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Просмотры профиля</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Eye size={18} />
                  </div>
                </div>
                <div>
                  <strong className="text-3xl font-black text-slate-800 font-mono">{(totalViews * 1.5).toFixed(0)}</strong>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black mt-1">
                    <TrendingUp size={12} />
                    <span>+18.4% за неделю</span>
                  </div>
                </div>
              </div>

              {/* Conversions / Clicks */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Переходы в контакты</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <MousePointerClick size={18} />
                  </div>
                </div>
                <div>
                  <strong className="text-3xl font-black text-slate-800 font-mono">{(totalClicks * 1.3).toFixed(0)}</strong>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black mt-1">
                    <TrendingUp size={12} />
                    <span>+24.1% за неделю</span>
                  </div>
                </div>
              </div>

              {/* Average CTR */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Средний CTR рекламы</span>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Award size={18} />
                  </div>
                </div>
                <div>
                  <strong className="text-3xl font-black text-slate-800 font-mono">{averageCtr}%</strong>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">Отличный показатель для Устьян</p>
                </div>
              </div>

              {/* Active Subscribers */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Позиция в рейтинге</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Star size={18} className="fill-emerald-100" />
                  </div>
                </div>
                <div>
                  <strong className="text-3xl font-black text-slate-800">Топ-5</strong>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">Среди мастеров с. {currentUser.village}</p>
                </div>
              </div>
            </div>

            {/* Graphs and Demographics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Graphic View Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Динамика просмотров и кликов</h3>
                    <p className="text-xs text-slate-400">Ежедневный график активности пользователей за текущую неделю</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-blue-500"></span>
                      <span className="text-slate-600">Просмотры</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500"></span>
                      <span className="text-slate-600">Клики</span>
                    </div>
                  </div>
                </div>

                {/* SVG Chart Container */}
                <div className="relative pt-2 h-[180px] w-full" id="svg_graphic_container">
                  <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible">
                    {/* Horizontal grid lines */}
                    <line x1="20" y1="15" x2={graphWidth - 20} y2="15" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="55" x2={graphWidth - 20} y2="55" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="95" x2={graphWidth - 20} y2="95" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="135" x2={graphWidth - 20} y2="135" stroke="#cbd5e1" strokeWidth="1" />

                    {/* Y Axis Labels */}
                    <text x="5" y="20" fill="#94a3b8" fontSize="9" fontWeight="bold" fontFamily="monospace">120</text>
                    <text x="5" y="60" fill="#94a3b8" fontSize="9" fontWeight="bold" fontFamily="monospace">80</text>
                    <text x="5" y="100" fill="#94a3b8" fontSize="9" fontWeight="bold" fontFamily="monospace">40</text>
                    <text x="5" y="140" fill="#94a3b8" fontSize="9" fontWeight="bold" fontFamily="monospace">0</text>

                    {/* Area beneath path for aesthetic look */}
                    <path 
                      d={`${pathD} L ${points[points.length-1].x} 135 L ${points[0].x} 135 Z`} 
                      fill="url(#blue-gradient)" 
                      opacity="0.1" 
                    />

                    {/* Path views */}
                    <path 
                      d={pathD} 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />

                    {/* Click line path simulation */}
                    <path 
                      d={`M ${points[0].x} ${graphHeight - ((clicksHistory[0].count / 30) * (graphHeight - 30) + 15)} ` + 
                         points.slice(1).map((p, i) => `L ${p.x} ${graphHeight - ((clicksHistory[i+1].count / 30) * (graphHeight - 30) + 15)}`).join(' ')} 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="2.5" 
                      strokeDasharray="4 2"
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />

                    {/* Hover Interactive dots */}
                    {points.map((p, index) => (
                      <g key={index} className="group cursor-pointer">
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="5.5" 
                          fill="#3b82f6" 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                          className="transition-all duration-150 transform hover:scale-150"
                        />
                        {/* Tooltip on hover */}
                        <text 
                          x={p.x} 
                          y={p.y - 12} 
                          fill="#1e293b" 
                          fontSize="9" 
                          fontWeight="black" 
                          textAnchor="middle"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-150 bg-slate-900 text-white font-mono"
                        >
                          {p.val}
                        </text>
                        {/* Day label */}
                        <text 
                          x={p.x} 
                          y="150" 
                          fill="#64748b" 
                          fontSize="9" 
                          fontWeight="bold" 
                          textAnchor="middle"
                        >
                          {p.day}
                        </text>
                      </g>
                    ))}

                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Geographic Reach & Audience breakdown */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">Популярность по селам</h3>
                <p className="text-xs text-slate-400 mb-5">Процентное распределение просмотров по населенным пунктам</p>

                <div className="space-y-4" id="village_reach_distribution">
                  {/* Item 1 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-brand-medium" /> п. Октябрьский</span>
                      <span className="font-mono">48%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-brand-medium h-full rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-teal-500" /> с. Шангалы</span>
                      <span className="font-mono">26%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full" style={{ width: '26%' }}></div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-amber-500" /> д. Березник</span>
                      <span className="font-mono">14%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500" /> с. Строевское</span>
                      <span className="font-mono">12%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex gap-2 items-start leading-snug">
                  <AlertCircle size={14} className="text-brand-medium shrink-0 mt-0.5" />
                  <span>
                    <strong>Устьянский тренд:</strong> Наибольший спрос на ваши услуги исходит из п. Октябрьский. Рекомендуется увеличить долю рекламы на это поселение.
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Hourly Traffic Block */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Активность устьянцев по часам</h3>
                  <p className="text-xs text-slate-400">В какие часы жители района чаще всего ищут специалистов</p>
                </div>
                <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono">
                  Пик: 18:00 - 21:00
                </span>
              </div>

              {/* Time Block Bars */}
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 text-center" id="hourly_traffic_bars">
                {[
                  { range: '00-02', rate: 10 }, { range: '02-04', rate: 5 }, { range: '04-06', rate: 8 },
                  { range: '06-08', rate: 25 }, { range: '08-10', rate: 60 }, { range: '10-12', rate: 75 },
                  { range: '12-14', rate: 85 }, { range: '14-16', rate: 70 }, { range: '16-18', rate: 80 },
                  { range: '18-20', rate: 100 }, { range: '20-22', rate: 95 }, { range: '22-00', rate: 40 }
                ].map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end h-28 group">
                    <span className="text-[9px] text-slate-400 font-extrabold opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                      {t.rate}%
                    </span>
                    <div className="w-full bg-slate-100 rounded-lg h-16 relative overflow-hidden">
                      <div 
                        className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500 ${
                          t.rate > 80 ? 'bg-brand-medium' : t.rate > 50 ? 'bg-brand-medium/70' : 'bg-slate-300'
                        }`}
                        style={{ height: `${t.rate}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold mt-2 font-mono whitespace-nowrap">
                      {t.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ADVERTISING CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <motion.div
            key="tab_campaigns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
            id="tab_campaigns_content"
          >
            {/* Header with launch campaign button */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Запущенные рекламные кампании</h3>
                <p className="text-xs text-slate-500">Управляйте вашими активными продвижениями в устьянском каталоге и ленте</p>
              </div>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-brand-medium hover:bg-brand-medium/90 text-white font-extrabold text-xs px-5 py-3 rounded-2xl cursor-pointer shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus size={16} />
                  СОЗДАТЬ РЕКЛАМУ
                </button>
              )}
            </div>

            {/* Form Creator */}
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border-2 border-brand-medium/30 rounded-3xl p-6 shadow-md overflow-hidden"
                id="create_campaign_form_block"
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-2">
                    <Megaphone className="text-brand-medium" size={20} />
                    <h4 className="text-base font-black text-slate-800">Конструктор рекламной кампании</h4>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormError('');
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Form Settings */}
                  <form onSubmit={handleCreateCampaign} className="space-y-4">
                    
                    {/* Campaign Title */}
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1.5">
                        Заголовок рекламного объявления
                      </label>
                      <input
                        type="text"
                        placeholder="Например: Сварка любой сложности в с. Шангалы"
                        value={newCampaignTitle}
                        onChange={(e) => setNewCampaignTitle(e.target.value)}
                        maxLength={50}
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-xs bg-white font-medium"
                      />
                      <span className="text-[9px] text-slate-400 text-right block mt-1">
                        {newCampaignTitle.length}/50 символов
                      </span>
                    </div>

                    {/* Campaign Description */}
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1.5">
                        Текст объявления / Предложение
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Опишите ваши преимущества, контакты, скидки соседям..."
                        value={newCampaignDesc}
                        onChange={(e) => setNewCampaignDesc(e.target.value)}
                        maxLength={150}
                        required
                        className="w-full p-3.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-xs bg-white font-medium leading-relaxed"
                      />
                      <span className="text-[9px] text-slate-400 text-right block mt-1">
                        {newCampaignDesc.length}/150 символов
                      </span>
                    </div>

                    {/* Campaign Type Placement Selection */}
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-2">
                        Где показывать рекламу (Канал продвижения)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        
                        {/* Top Search */}
                        <button
                          type="button"
                          onClick={() => setNewCampaignType('top_search')}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                            newCampaignType === 'top_search'
                              ? 'border-brand-medium bg-brand-light/20 text-brand-dark'
                              : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase">Топ Поиска</span>
                          <div>
                            <span className="text-xs font-black block">5 ₽ <span className="text-[9px] text-slate-500 font-bold">/ клик</span></span>
                            <span className="text-[9px] opacity-75">Выше всех в каталоге мастеров</span>
                          </div>
                        </button>

                        {/* Dashboard Banner */}
                        <button
                          type="button"
                          onClick={() => setNewCampaignType('banner')}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                            newCampaignType === 'banner'
                              ? 'border-brand-medium bg-brand-light/20 text-brand-dark'
                              : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase">Главный баннер</span>
                          <div>
                            <span className="text-xs font-black block">10 ₽ <span className="text-[9px] text-slate-500 font-bold">/ клик</span></span>
                            <span className="text-[9px] opacity-75">Яркий блок в ленте событий</span>
                          </div>
                        </button>

                        {/* Village Priority */}
                        <button
                          type="button"
                          onClick={() => setNewCampaignType('village_priority')}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                            newCampaignType === 'village_priority'
                              ? 'border-brand-medium bg-brand-light/20 text-brand-dark'
                              : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase">Приоритет в селе</span>
                          <div>
                            <span className="text-xs font-black block">3 ₽ <span className="text-[9px] text-slate-500 font-bold">/ клик</span></span>
                            <span className="text-[9px] opacity-75">Показ жителям выбранных деревень</span>
                          </div>
                        </button>

                      </div>
                    </div>

                    {/* Target Villages Selection */}
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-2">
                        Гео-Таргетинг (Деревни Устьянского района)
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                        {USTYANY_VILLAGES.map((v) => {
                          const isSelected = selectedVillages.includes(v.name);
                          return (
                            <button
                              key={v.name}
                              type="button"
                              onClick={() => toggleVillageSelection(v.name)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-brand-medium text-white border-brand-medium shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {v.name}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1.5">
                        Выбрано поселений: <strong>{selectedVillages.length}</strong>
                      </span>
                    </div>

                    {/* Daily Budget */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                          Лимит дневного бюджета (₽ / день)
                        </label>
                        <span className="text-xs font-extrabold text-brand-medium font-mono">{dailyBudget} ₽</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={1000}
                        step={25}
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-medium"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1 font-mono">
                        <span>50 ₽</span>
                        <span>500 ₽</span>
                        <span>1000 ₽</span>
                      </div>
                    </div>

                    {/* Error Alerts */}
                    {formError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-brand-medium hover:bg-brand-medium/90 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-md active:scale-95 transition-all text-center uppercase"
                      >
                        Запустить продвижение
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setFormError('');
                        }}
                        className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-all uppercase"
                      >
                        Отмена
                      </button>
                    </div>

                  </form>

                  {/* Right Column: Interactive Real-time Banner Preview */}
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-3">
                        📱 Интерактивное превью (События района)
                      </span>
                      
                      {/* Simulated Smartphone Screen preview */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden max-w-sm mx-auto">
                        
                        {/* Header bar simulated */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5 text-[9px] text-slate-400 font-bold font-mono">
                          <span>ЛОКАЛЬНЫЙ ТАРГЕТ</span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> 13:40
                          </span>
                        </div>

                        {/* Top Search placement rendering */}
                        {newCampaignType === 'top_search' && (
                          <div className="border-2 border-brand-medium bg-brand-light/5 p-3 rounded-xl relative shadow-2xs">
                            <span className="absolute top-2 right-2 bg-amber-500 text-white text-[7px] font-black uppercase px-1 py-0.5 rounded shadow-2xs">
                              РЕКОМЕНДУЕМЫЙ
                            </span>
                            <div className="flex items-center gap-2.5 mb-2">
                              <div className="w-8 h-8 rounded-full bg-brand-medium text-white flex items-center justify-center font-black text-xs">
                                {currentUser.name?.charAt(0) || "Ж"}
                              </div>
                              <div>
                                <h5 className="text-[11px] font-black text-slate-800 leading-none">
                                  {newCampaignTitle || 'Имя не указано'}
                                </h5>
                                <span className="text-[8px] text-slate-400 block mt-0.5 font-semibold">
                                  ★ 5.0 (45 Спасибо) • с. {currentUser.village}
                                </span>
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-600 leading-snug line-clamp-2">
                              {newCampaignDesc || 'Заполните описание, чтобы увидеть превью объявления...'}
                            </p>
                            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-[8px]">
                              <span className="bg-brand-light text-brand-dark px-1.5 py-0.5 rounded font-black font-mono">
                                ПРИОРИТЕТ
                              </span>
                              <span className="text-brand-medium font-bold flex items-center gap-0.5">
                                Написать в чат <ChevronRight size={8} />
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Main Feed Banner Placement */}
                        {newCampaignType === 'banner' && (
                          <div className="bg-gradient-to-r from-brand-dark to-brand-medium text-white p-3.5 rounded-xl shadow-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="bg-white/20 text-[7px] font-black uppercase px-1 py-0.5 rounded tracking-wider">
                                Рекламный баннер Устьян
                              </span>
                              <Star size={10} className="fill-amber-300 stroke-none animate-pulse" />
                            </div>
                            <h5 className="text-[11px] font-extrabold text-white leading-tight mb-1">
                              {newCampaignTitle || 'Уникальное предложение'}
                            </h5>
                            <p className="text-[9px] text-brand-light/90 leading-snug mb-2 line-clamp-2">
                              {newCampaignDesc || 'Заполните описание рекламного блока...'}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-mono text-brand-light font-bold">
                                📍 {selectedVillages.join(', ') || 'Все поселения'}
                              </span>
                              <span className="bg-white text-brand-dark px-2.5 py-0.5 rounded text-[8px] font-black shadow-2xs hover:scale-105 active:scale-95 transition-all">
                                ОТКРЫТЬ
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Village Priority Specific Item */}
                        {newCampaignType === 'village_priority' && (
                          <div className="border border-brand-light/80 bg-brand-light/10 p-3 rounded-xl">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[8px] text-brand-medium font-black uppercase flex items-center gap-0.5">
                                <MapPin size={8} /> Только для с. {selectedVillages[0] || currentUser.village}
                              </span>
                              <span className="text-[8px] text-slate-400 font-extrabold">АКЦИЯ РЯДОМ</span>
                            </div>
                            <h5 className="text-[11px] font-black text-slate-800 leading-tight">
                              {newCampaignTitle || 'Локальный заголовок'}
                            </h5>
                            <p className="text-[9px] text-slate-500 leading-snug mt-1 line-clamp-2">
                              {newCampaignDesc || 'Заполните описание, чтобы настроить локальное предложение.'}
                            </p>
                            <button type="button" className="w-full mt-2 bg-brand-medium text-white text-[9px] py-1.5 rounded-lg font-black transition-all">
                              СВЯЗАТЬСЯ РЯДОМ
                            </button>
                          </div>
                        )}

                        {/* App footer preview indicator */}
                        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[8px] text-slate-300">
                          Устьянское Сообщество Взаимопомощи
                        </div>

                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-slate-600 space-y-1 leading-snug">
                      <div className="font-extrabold text-amber-800 flex items-center gap-1">
                        <Sparkles size={14} /> Прогноз эффективности:
                      </div>
                      <p>
                        Исходя из выбранных параметров и гео-таргетинга по деревням ({selectedVillages.length} шт.), прогнозируется от <strong>180 до 350 просмотров</strong> и до <strong>45 целевых обращений</strong> в неделю.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Campaign Cards List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="active_campaigns_list_grid">
              {campaigns.map((camp) => {
                const isTop = camp.type === 'top_search';
                const isBanner = camp.type === 'banner';
                const ctr = ((camp.clicks / camp.impressions) * 100 || 0).toFixed(1);

                return (
                  <div
                    key={camp.id}
                    className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                      camp.status === 'active' 
                        ? 'border-slate-200 hover:border-brand-medium/40' 
                        : 'border-slate-200/50 bg-slate-50/50 opacity-80'
                    }`}
                    id={`campaign_card_${camp.id}`}
                  >
                    <div>
                      {/* Badge / Header info */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                          isTop 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : isBanner
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}>
                          {isTop ? '🔝 Топ Поиска' : isBanner ? '🖼️ Главный Баннер' : '📍 Приоритет в Селе'}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${camp.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono">
                            {camp.status === 'active' ? 'Активна' : 'Приостановлена'}
                          </span>
                        </div>
                      </div>

                      {/* Title & description */}
                      <h4 className="text-sm font-black text-slate-800 leading-snug mb-1.5">{camp.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{camp.description}</p>

                      {/* Targeting towns */}
                      <div className="flex flex-wrap gap-1 items-center text-[10px] text-slate-400 font-bold mb-4">
                        <MapPin size={12} className="text-slate-400" />
                        <span>Регион показа:</span>
                        {camp.targetVillages.map((v, idx) => (
                          <span key={v} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-extrabold">
                            {v}{idx < camp.targetVillages.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>

                      {/* Quick Campaign Stats */}
                      <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 mb-4 text-center">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Показы</span>
                          <strong className="text-sm text-slate-700 font-black font-mono">{camp.impressions}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Переходы</span>
                          <strong className="text-sm text-slate-700 font-black font-mono">{camp.clicks}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">CTR %</span>
                          <strong className="text-sm text-brand-medium font-black font-mono">{ctr}%</strong>
                        </div>
                      </div>
                    </div>

                    {/* Spent details & Action Row */}
                    <div className="flex justify-between items-center pt-2 mt-auto">
                      <div className="text-xs">
                        <span className="text-[10px] text-slate-400 block font-bold">Расход бюджета:</span>
                        <strong className="text-slate-800 font-black font-mono">{camp.totalSpent} ₽</strong>
                        <span className="text-slate-400 text-[10px] font-semibold"> (Лимит: {camp.dailyBudget} ₽/сут)</span>
                      </div>

                      {/* Controls and buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleCampaignStatus(camp.id)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer shadow-2xs active:scale-95 transition-all"
                          title={camp.status === 'active' ? 'Поставить на паузу' : 'Запустить рекламу'}
                        >
                          {camp.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer shadow-2xs active:scale-95 transition-all"
                          title="Удалить кампанию"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: AI-MARKETING ADVISOR */}
        {activeTab === 'ai_advisor' && (
          <motion.div
            key="tab_ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
            id="tab_ai_content"
          >
            {/* AI Assistant Promo Hero Banner */}
            <div 
              className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border"
              style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-medium) 100%)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6">
                <Sparkles size={250} className="fill-white stroke-white" />
              </div>

              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="bg-white/25 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-white/20 tracking-wider inline-block">
                  Устьянский ИИ-Маркетолог
                </span>
                <h3 className="text-2xl sm:text-3xl font-black leading-none">
                  Получайте больше заказов в Устьянах с помощью умного анализа
                </h3>
                <p className="text-xs sm:text-sm text-brand-light/95 leading-relaxed font-medium">
                  Искусственный интеллект анализирует текущий сезонный спрос в Октябрьском, Шангалах, Березнике и других деревнях района, помогая вам оптимизировать рекламные объявления и писать привлекательные тексты для ваших клиентов.
                </p>
              </div>
            </div>

            {/* AI Seasonal Demands Advice and Generation Column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Copywriter section block */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-5">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    <Sparkles className="text-brand-medium" size={18} />
                    Генератор убойных локальных слоганов
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Сгенерируйте привлекательный, персонализированный рекламный текст с упоминанием вашей деревни и имени!
                  </p>
                </div>

                {/* Selection and generation */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1.5">
                      Направление бизнеса / мастерства
                    </label>
                    <select
                      value={aiIndustry}
                      onChange={(e) => setAiIndustry(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-xs bg-white font-bold"
                    >
                      <option value="строительство">Строительство и плотницкое дело</option>
                      <option value="сантехника">Сантехника и электрика</option>
                      <option value="тракторы">Тракторные работы и вспашка земли</option>
                      <option value="доставка">Доставка продуктов и товаров</option>
                      <option value="ремонт">Бытовой ремонт и наладка техники</option>
                      <option value="обучение">Уроки, репетиторство, творческие кружки</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateAISlogan}
                    disabled={isGenerating}
                    className="bg-brand-medium hover:bg-brand-medium/90 disabled:bg-slate-200 text-white font-extrabold text-xs px-6 rounded-xl cursor-pointer transition-all uppercase self-end h-[38px] w-full sm:w-auto text-center"
                  >
                    {isGenerating ? 'Создание слогана...' : 'Сгенерировать'}
                  </button>
                </div>

                {/* Generated result rendering container */}
                {generatedSlogan ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-brand-light/10 border border-brand-medium/30 rounded-2xl relative"
                  >
                    <span className="absolute top-2 right-2 bg-brand-medium text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      Результат ИИ
                    </span>
                    <p className="text-sm text-slate-700 italic font-medium leading-relaxed pr-16">
                      {generatedSlogan}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">
                        Скопируйте текст в конструктор кампании!
                      </span>
                      <button
                        onClick={() => {
                          setNewCampaignDesc(generatedSlogan.replace(/«|»/g, ''));
                          setNewCampaignTitle(
                            currentUser.isMaster 
                              ? `Спецпредложение: ${currentUser.name}`
                              : 'Профессиональные услуги'
                          );
                          setActiveTab('campaigns');
                          setShowCreateForm(true);
                        }}
                        className="text-xs text-brand-medium hover:text-brand-dark font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Применить <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold">
                    Нажмите «Сгенерировать», чтобы составить слоган с помощью ИИ
                  </div>
                )}
              </div>

              {/* Demand of seasons tips sidebar */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  Сезонный спрос в Устьянах
                </h4>

                <div className="space-y-3.5">
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-blue-700 uppercase">Снежная зима (Январь - Март)</span>
                    <p className="text-[11px] text-slate-600 font-semibold leading-snug">
                      Высокий спрос на расчистку дорог тракторами и вывоз снега. Пик спроса в Березниках и Октябрьском.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-emerald-700 uppercase">Дачный сезон (Май - Июнь)</span>
                    <p className="text-[11px] text-slate-600 font-semibold leading-snug">
                      Вспашка земли мотоблоками, завоз чернозема, строительство и ремонт теплиц, заборов.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-amber-700 uppercase">Золотая осень (Сентябрь - Ноябрь)</span>
                    <p className="text-[11px] text-slate-600 font-semibold leading-snug">
                      Заготовка дров (колотые, долготье), подготовка бань и домов к отопительному сезону.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-brand-light/10 border border-brand-light rounded-2xl text-[11px] text-brand-dark flex gap-2 items-start leading-snug">
                  <AlertCircle size={14} className="text-brand-medium shrink-0 mt-0.5" />
                  <span>
                    <strong>ИИ-Совет:</strong> Запустите кампанию типа «Приоритет в селе» на вспашку земли или заготовку дров за 2 недели до начала сезона, чтобы забить график заказами заранее.
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 📌 MODAL: SIMULATED TOP UP BUDGET BALANCE */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="topup_balance_modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <CreditCard size={18} className="text-brand-medium" />
                  Пополнение баланса рекламы
                </h4>
                <p className="text-xs text-slate-400">Пополните баланс для непрерывного продвижения в районе</p>
              </div>
              <button 
                onClick={() => setShowTopUpModal(false)}
                className="p-1 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1.5">
                  Сумма пополнения (₽)
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-sm bg-white font-extrabold font-mono"
                />
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-3 gap-2">
                {['300', '500', '1000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTopUpAmount(preset)}
                    className="py-1.5 border border-slate-200 hover:border-brand-medium rounded-lg text-xs font-bold text-slate-600 hover:text-brand-dark transition-all cursor-pointer font-mono"
                  >
                    +{preset} ₽
                  </button>
                ))}
              </div>

              {/* Top Up Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-brand-medium hover:bg-brand-medium/90 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                Оплатить в демо-режиме
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
