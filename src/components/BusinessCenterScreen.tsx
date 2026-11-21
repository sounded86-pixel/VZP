import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, Package, Wrench, ClipboardList, TrendingUp, Sparkles, 
  CreditCard, Users, ArrowLeft, Plus, Edit3, Trash2, CheckCircle2, 
  AlertCircle, Star, Phone, MapPin, Search, ChevronRight, ShieldCheck, 
  BarChart3, DollarSign, Award, Clock, ArrowUpRight, Check, X, 
  SlidersHorizontal, Filter, Image, HelpCircle, Truck, Building2, Send,
  Layers, Lock, Eye, RefreshCw, ShoppingBag
} from 'lucide-react';
import { 
  UserProfile, Entrepreneur, Product, Order, PriceListItem, 
  Master, PortfolioItem, ServiceOrder, MasterReview 
} from '../types';
import { useUserRole } from '../hooks/useUserRole';
import { compressImage } from './SkillsCatalogScreen';

export interface SupplierItem {
  id: string;
  name: string;
  category: 'meat_milk' | 'bakery' | 'wood_building' | 'agriculture' | 'packaging' | 'equipment' | 'other';
  contactPerson: string;
  phone: string;
  email?: string;
  village: string;
  description: string;
  rating: number;
  reviewsCount: number;
  deliveryTerms: string;
  minOrderAmount: number;
  catalog: { item: string; wholesalePrice: number; unit: string; minQty: number }[];
  isVerified: boolean;
}

const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: 'supp_1',
    name: 'ООО «Устьянская Молочная Ферма»',
    category: 'meat_milk',
    contactPerson: 'Василий Кузнецов',
    phone: '+7 (921) 450-12-34',
    email: 'milk.ustyany@mail.ru',
    village: 'Березник',
    description: 'Оптовые поставки свежего парного молока, творога, сливочного масла и сыров высшего сорта.',
    rating: 4.9,
    reviewsCount: 28,
    deliveryTerms: 'Доставка по всему району от 3 000 ₽ или самовывоз с фермы.',
    minOrderAmount: 3000,
    catalog: [
      { item: 'Молоко фермерское 3.8% (фляга)', wholesalePrice: 55, unit: 'л', minQty: 20 },
      { item: 'Творог деревенский 9%', wholesalePrice: 240, unit: 'кг', minQty: 5 },
      { item: 'Масло сливочное ГОСТ', wholesalePrice: 650, unit: 'кг', minQty: 3 }
    ],
    isVerified: true
  },
  {
    id: 'supp_2',
    name: 'Мукомольный комбинат «Северная Житница»',
    category: 'bakery',
    contactPerson: 'Ольга Николаевна',
    phone: '+7 (911) 234-88-99',
    email: 'flour.sever@yandex.ru',
    village: 'Октябрьский',
    description: 'Пшеничная и ржаная мука высшего сорта, дрожжи, солод, упаковка для пекарен и кондитерских.',
    rating: 4.8,
    reviewsCount: 19,
    deliveryTerms: 'Ежедневные рейсы по поселкам района. Бесплатная доставка от 10 мешков.',
    minOrderAmount: 2500,
    catalog: [
      { item: 'Мука пшеничная в/с (мешок 50кг)', wholesalePrice: 1650, unit: 'мешок', minQty: 2 },
      { item: 'Мука ржаная обдирная (мешок 45кг)', wholesalePrice: 1350, unit: 'мешок', minQty: 2 },
      { item: 'Дрожжи прессованные хлебопекарные', wholesalePrice: 120, unit: 'кг', minQty: 5 }
    ],
    isVerified: true
  },
  {
    id: 'supp_3',
    name: 'Лесопильный завод «УстьяЛес»',
    category: 'wood_building',
    contactPerson: 'Сергей Белов',
    phone: '+7 (921) 777-90-11',
    email: 'les.ustyany@bk.ru',
    village: 'Шангалы',
    description: 'Сухой пиломатериал, обрезная доска, брус, вагонка, дрова колотые для мастеров и строителей.',
    rating: 5.0,
    reviewsCount: 42,
    deliveryTerms: 'Доставка манипулятором и лесовозом по деревням.',
    minOrderAmount: 8000,
    catalog: [
      { item: 'Доска обрезная сосна 50х150х6000', wholesalePrice: 14500, unit: 'куб.м', minQty: 1 },
      { item: 'Брус строганный 100х100х6000', wholesalePrice: 16200, unit: 'куб.м', minQty: 1 },
      { item: 'Дрова березовые колотые (кузов 5 куб)', wholesalePrice: 9500, unit: 'машина', minQty: 1 }
    ],
    isVerified: true
  },
  {
    id: 'supp_4',
    name: 'АгроСнаб «Устьянские Семена»',
    category: 'agriculture',
    contactPerson: 'Татьяна Викторовна',
    phone: '+7 (900) 333-21-12',
    village: 'Малодоры',
    description: 'Оптовые партии семян картофеля, комбикорма для скота и птицы, органические удобрения.',
    rating: 4.7,
    reviewsCount: 15,
    deliveryTerms: 'Самовывоз или доставка попутным транспортом.',
    minOrderAmount: 2000,
    catalog: [
      { item: 'Комбикорм для КРС (мешок 40кг)', wholesalePrice: 850, unit: 'мешок', minQty: 3 },
      { item: 'Семенной картофель «Удача» элита', wholesalePrice: 45, unit: 'кг', minQty: 50 }
    ],
    isVerified: true
  }
];

interface BusinessCenterScreenProps {
  currentUser: UserProfile;
  isOffline: boolean;
  onNavigate: (screen: string) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  
  // Data props
  entrepreneurs: Entrepreneur[];
  orders: Order[];
  masters: Master[];
  portfolioItems: PortfolioItem[];
  serviceOrders: ServiceOrder[];
  masterReviews: MasterReview[];
  
  // Handlers
  onUpdateStatus?: (orderId: string, status: 'accepted' | 'delivering' | 'delivered' | 'cancelled') => void;
  onUpdateBusiness?: (updates: Partial<Entrepreneur>) => void;
  onUpdateMaster?: (updates: Partial<Master>) => void;
  onAddPortfolioItem?: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => void;
  onDeletePortfolioItem?: (id: string) => void;
}

export type BusinessTab = 
  | 'overview' 
  | 'goods' 
  | 'services' 
  | 'orders' 
  | 'suppliers' 
  | 'analytics' 
  | 'promotion' 
  | 'tariffs';

export default function BusinessCenterScreen({
  currentUser,
  isOffline,
  onNavigate,
  onUpdateUser,
  entrepreneurs,
  orders,
  masters,
  portfolioItems,
  serviceOrders,
  masterReviews,
  onUpdateStatus,
  onUpdateBusiness,
  onUpdateMaster,
  onAddPortfolioItem,
  onDeletePortfolioItem
}: BusinessCenterScreenProps) {
  const { role, tariff, isMaster, isEntrepreneur, isAdmin, isDeveloper, isPartner, isPro, isVip } = useUserRole(currentUser);
  
  // Main Tab State
  const [activeTab, setActiveTab] = useState<BusinessTab>('overview');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'entrepreneurs' | 'masters' | 'partners'>('all');
  
  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTariffForUpgrade, setSelectedTariffForUpgrade] = useState<'basic' | 'pro' | 'vip'>('pro');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showSupplierOrderModal, setShowSupplierOrderModal] = useState<SupplierItem | null>(null);
  const [supplierOrderText, setSupplierOrderText] = useState('');
  const [supplierOrderSuccess, setSupplierOrderSuccess] = useState(false);

  // Local Suppliers state
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => {
    try {
      const stored = localStorage.getItem('ustyany_suppliers');
      return stored ? JSON.parse(stored) : INITIAL_SUPPLIERS;
    } catch (e) {
      return INITIAL_SUPPLIERS;
    }
  });

  const saveSuppliers = (list: SupplierItem[]) => {
    setSuppliers(list);
    try {
      localStorage.setItem('ustyany_suppliers', JSON.stringify(list));
    } catch (e) {
      console.warn("Could not persist suppliers", e);
    }
  };

  // Find or create active entrepreneur profile for current user
  const currentEntrepreneur = useMemo<Entrepreneur>(() => {
    const existing = entrepreneurs.find(e => e.userId === currentUser.id);
    if (existing) return existing;
    return {
      id: `entr_${currentUser.id}`,
      userId: currentUser.id,
      businessName: currentUser.name ? `Магазин «${currentUser.name}»` : 'Моё предприятие',
      contactPhone: currentUser.phone || '+7 (900) 000-00-00',
      serviceRadius: 30,
      deliverySchedule: {
        monday: ['10:00 - 18:00'],
        wednesday: ['10:00 - 18:00'],
        friday: ['10:00 - 18:00']
      },
      priceList: [
        { id: 'p_1', item: 'Хлеб деревенский подовый', price: 65, unit: 'буханка', description: 'Свежая выпечка из печи', inStock: true },
        { id: 'p_2', item: 'Творог домашний 9%', price: 320, unit: 'кг', description: 'Натуральный из цельного молока', inStock: true },
        { id: 'p_3', item: 'Картофель отборный Устьянский', price: 45, unit: 'кг', description: 'Свежий урожай, сорт Удача', inStock: true }
      ],
      rating: {
        average: 4.9,
        totalReviews: 18,
        onTimePercentage: 98
      },
      isVerified: true,
      isActive: true,
      moderationStatus: 'approved',
      createdAt: new Date().toISOString(),
      tariff: (currentUser.tariff as any) || 'basic',
      themeColor: '#059669',
      village: currentUser.village || 'Октябрьский'
    };
  }, [entrepreneurs, currentUser]);

  // Find or create active master profile
  const currentMaster = useMemo<Master | undefined>(() => {
    return masters.find(m => m.userId === currentUser.id) || (isMaster ? {
      id: `master_${currentUser.id}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      userVillage: currentUser.village,
      categories: ['craftsman', 'worker'],
      description: 'Опытный мастер на все руки: ремонтные, плотницкие и сантехнические работы по всему району.',
      experience: 'Более 10 лет',
      education: 'Профильное техническое',
      priceFrom: 500,
      priceDescription: 'Договорная, от 500 ₽ за выезд',
      workingHours: 'Пн-Сб: 08:00 - 20:00',
      rating: { average: 4.9, total: 24 },
      statistics: { totalOrders: 32, completedOrders: 31, onTimePercentage: 97 },
      isActive: true,
      priceList: [
        { service: 'Установка сантехники, замена смесителя', price: 1200, unit: 'точка' },
        { service: 'Плотницкие работы, ремонт крыльца', price: 800, unit: 'час' },
        { service: 'Вспашка огорода мотоблоком', price: 600, unit: 'сотка' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : undefined);
  }, [masters, currentUser, isMaster]);

  // Filter orders for this entrepreneur
  const myGoodsOrders = useMemo(() => {
    return orders.filter(o => o.entrepreneurId === currentEntrepreneur.id || o.entrepreneurBusinessName === currentEntrepreneur.businessName);
  }, [orders, currentEntrepreneur]);

  // Filter orders for this master
  const myServiceOrders = useMemo(() => {
    return serviceOrders.filter(so => so.masterId === (currentMaster?.id || currentUser.id));
  }, [serviceOrders, currentMaster, currentUser.id]);

  // Filter portfolio items for this master
  const myPortfolio = useMemo(() => {
    return portfolioItems.filter(p => p.masterId === (currentMaster?.id || currentUser.id));
  }, [portfolioItems, currentMaster, currentUser.id]);

  // Handle Product Management
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('кг');
  const [newProductDesc, setNewProductDesc] = useState('');

  const handleAddProduct = () => {
    if (!newProductName.trim() || !newProductPrice) return;
    const priceNum = parseFloat(newProductPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const newItem: PriceListItem = {
      id: `p_${Date.now()}`,
      item: newProductName.trim(),
      price: priceNum,
      unit: newProductUnit,
      description: newProductDesc.trim(),
      inStock: true
    };

    const updatedPriceList = [...currentEntrepreneur.priceList, newItem];
    if (onUpdateBusiness) {
      onUpdateBusiness({ priceList: updatedPriceList });
    }
    setNewProductName('');
    setNewProductPrice('');
    setNewProductDesc('');
    setShowAddProductModal(false);
  };

  const handleDeleteProduct = (productId?: string) => {
    if (!productId) return;
    const updatedPriceList = currentEntrepreneur.priceList.filter(p => p.id !== productId);
    if (onUpdateBusiness) {
      onUpdateBusiness({ priceList: updatedPriceList });
    }
  };

  // Handle Master Service Management
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceUnit, setNewServiceUnit] = useState('услуга');

  const handleAddService = () => {
    if (!newServiceName.trim() || !newServicePrice) return;
    const priceNum = parseFloat(newServicePrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const currentServices = currentMaster?.priceList || [];
    const updated = [...currentServices, { service: newServiceName.trim(), price: priceNum, unit: newServiceUnit }];
    if (onUpdateMaster) {
      onUpdateMaster({ priceList: updated });
    }
    setNewServiceName('');
    setNewServicePrice('');
  };

  // Handle Master Portfolio Management
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('craftsman');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioLocation, setPortfolioLocation] = useState(currentUser.village || 'Октябрьский');
  const [portfolioPrice, setPortfolioPrice] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);

  const handleAddPortfolio = () => {
    if (!portfolioTitle.trim() || !portfolioDesc.trim()) return;
    if (onAddPortfolioItem) {
      onAddPortfolioItem({
        masterId: currentMaster?.id || currentUser.id,
        title: portfolioTitle.trim(),
        description: portfolioDesc.trim(),
        category: portfolioCategory,
        photos: portfolioPhotos.length > 0 ? portfolioPhotos : ['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600'],
        location: portfolioLocation,
        price: portfolioPrice ? parseFloat(portfolioPrice) : undefined,
        date: new Date().toISOString().split('T')[0]
      });
    }
    setPortfolioTitle('');
    setPortfolioDesc('');
    setPortfolioPhotos([]);
    setShowAddPortfolioModal(false);
  };

  // Handle Tariff Upgrade
  const handleUpgradeTariff = (newTariff: 'basic' | 'pro' | 'vip') => {
    onUpdateUser({
      tariff: newTariff,
      tariffValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    if (onUpdateBusiness) {
      onUpdateBusiness({ tariff: newTariff });
    }
    setShowUpgradeModal(false);
  };

  // Promotion Campaigns Mock State
  const [adsBudget, setAdsBudget] = useState(1500);
  const [activeCampaigns, setActiveCampaigns] = useState([
    { id: 'c1', name: 'Закрепление в ТОП каталога', type: 'top', costPerDay: 80, status: 'active', impressions: 1420, clicks: 185 },
    { id: 'c2', name: 'Гео-приоритет (Шангалы, Березник)', type: 'geo', costPerDay: 50, status: 'active', impressions: 980, clicks: 112 }
  ]);

  // Is current user allowed full business features?
  const isBusinessUser = isEntrepreneur || (isMaster && isPro) || isAdmin || isDeveloper || isPartner;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-b border-white/10 px-4 py-5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center border border-white/10"
              title="На главную"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Store size={22} className="stroke-[2.5]" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  🏪 БИЗНЕС-ЦЕНТР
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                  Устьяны Бизнес
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Единый центр управления товарами, услугами, заказами, поставщиками и аналитикой
              </p>
            </div>
          </div>

          {/* Quick Tariff & Status Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2.5">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Тарифный план</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black uppercase ${
                    currentUser.tariff === 'vip' ? 'text-amber-400' :
                    currentUser.tariff === 'pro' ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {currentUser.tariff === 'vip' ? '💎 VIP-ТАРИФ' :
                     currentUser.tariff === 'pro' ? '⚡ PRO-ТАРИФ' : '📦 БАЗОВЫЙ'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({currentUser.tariff === 'vip' ? 'Комиссия 0%' : currentUser.tariff === 'pro' ? 'Комиссия 5%' : 'Комиссия 7%'})
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTariffForUpgrade(currentUser.tariff === 'pro' ? 'vip' : 'pro');
                  setShowUpgradeModal(true);
                }}
                className="ml-2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold shadow-sm transition-all"
              >
                {currentUser.tariff === 'vip' ? 'Продлить' : 'Улучшить'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        {/* Audience Filtering Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setAudienceFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                audienceFilter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ Все модули
            </button>
            <button
              onClick={() => setAudienceFilter('entrepreneurs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                audienceFilter === 'entrepreneurs' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 Предпринимателям
            </button>
            <button
              onClick={() => setAudienceFilter('masters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                audienceFilter === 'masters' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛠️ Мастерам
            </button>
            <button
              onClick={() => setAudienceFilter('partners')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                audienceFilter === 'partners' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🤝 Партнёрам
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <span>Ваш статус:</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded-md font-bold text-white uppercase text-[11px]">
              {role === 'entrepreneur' ? 'Предприниматель' :
               role === 'master' ? 'Мастер' :
               role === 'partner' ? 'Партнёр' :
               role === 'admin' ? 'Администратор' : 'Житель'}
            </span>
          </div>
        </div>

        {/* Feature Sub-tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 border-white shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <BarChart3 size={15} />
            <span>Сводка</span>
          </button>

          {(audienceFilter === 'all' || audienceFilter === 'entrepreneurs') && (
            <button
              onClick={() => setActiveTab('goods')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                activeTab === 'goods'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Package size={15} />
              <span>Товары & Витрина</span>
            </button>
          )}

          {(audienceFilter === 'all' || audienceFilter === 'masters') && (
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Wrench size={15} />
              <span>Услуги & Портфолио</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border relative ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <ClipboardList size={15} />
            <span>Заказы</span>
            {(myGoodsOrders.filter(o => o.status === 'new').length + myServiceOrders.filter(s => s.status === 'new').length) > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute -top-1 -right-1" />
            )}
          </button>

          {(audienceFilter === 'all' || audienceFilter === 'entrepreneurs') && (
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                activeTab === 'suppliers'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Truck size={15} />
              <span>Поставщики</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              activeTab === 'analytics'
                ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <TrendingUp size={15} />
            <span>Аналитика продаж</span>
          </button>

          <button
            onClick={() => setActiveTab('promotion')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              activeTab === 'promotion'
                ? 'bg-pink-600 text-white border-pink-500 shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Sparkles size={15} />
            <span>Продвижение</span>
          </button>

          <button
            onClick={() => setActiveTab('tariffs')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              activeTab === 'tariffs'
                ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-black shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <CreditCard size={15} />
            <span>Тарифы & Подписка</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        {/* Resident Preview / Role Upgrade Invitation banner if non-business */}
        {!isBusinessUser && (
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/80 border border-emerald-500/30 rounded-2xl p-5 mb-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-yellow-400" />
                  <h2 className="text-base sm:text-lg font-black text-white">
                    💼 Откройте свой бизнес или активируйте статус Мастера в Устьянах!
                  </h2>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Вы просматриваете Бизнес-центр в демонстрационном режиме жителя. Активируйте тариф Предпринимателя или PRO-Мастера, чтобы продавать товары, оказывать платные услуги, привлекать поставщиков и анализировать выручку.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => {
                    onUpdateUser({ role: 'entrepreneur', isEntrepreneur: true, tariff: 'pro' });
                    setShowUpgradeModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5"
                >
                  <Store size={14} />
                  <span>Стать предпринимателем</span>
                </button>
                <button
                  onClick={() => {
                    onUpdateUser({ role: 'master', isMaster: true, tariff: 'pro' });
                    setShowUpgradeModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-950/50 transition-all flex items-center gap-1.5"
                >
                  <Wrench size={14} />
                  <span>Стать Мастером PRO</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Выручка за месяц</span>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {myGoodsOrders.reduce((sum, o) => sum + (o.status === 'delivered' ? o.total : 0), 0) + 
                     myServiceOrders.reduce((sum, s) => sum + (s.status === 'completed' ? (s.budget || 0) : 0), 0) || 48500} ₽
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">↑ +18% к прошлому месяцу</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Активные заказы</span>
                  <ClipboardList size={16} className="text-amber-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {myGoodsOrders.filter(o => o.status === 'new' || o.status === 'accepted' || o.status === 'delivering').length +
                     myServiceOrders.filter(s => s.status === 'new' || s.status === 'in_progress').length}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">В обработке и доставке</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Рейтинг доверия</span>
                  <Star size={16} className="text-yellow-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {currentEntrepreneur.rating.average.toFixed(1)} ★
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {currentEntrepreneur.rating.totalReviews} отзывов жителей
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Позиций в каталоге</span>
                  <Package size={16} className="text-blue-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {currentEntrepreneur.priceList.length + (currentMaster?.priceList?.length || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Товаров и услуг онлайн</span>
                </div>
              </div>
            </div>

            {/* Quick Action Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Products & Showcase */}
              <div 
                onClick={() => setActiveTab('goods')}
                className="bg-gradient-to-br from-slate-950 to-slate-900 hover:to-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                  📦 Товары & Витрина
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Управление позициями прайс-листа, ценами, остатками, акциями и оформлением витрины магазина.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>В наличии: {currentEntrepreneur.priceList.filter(p => p.inStock).length} товаров</span>
                  <span className="text-emerald-400 font-bold">Настроить →</span>
                </div>
              </div>

              {/* Box 2: Master Services & Portfolio */}
              <div 
                onClick={() => setActiveTab('services')}
                className="bg-gradient-to-br from-slate-950 to-slate-900 hover:to-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Wrench size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">
                  🛠️ Услуги & Портфолио
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Кабинет мастера: прайс-лист услуг, фотогалерея выполненных работ, график работы и приём вызовов.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Работ в портфолио: {myPortfolio.length}</span>
                  <span className="text-blue-400 font-bold">Редактировать →</span>
                </div>
              </div>

              {/* Box 3: Orders Processing */}
              <div 
                onClick={() => setActiveTab('orders')}
                className="bg-gradient-to-br from-slate-950 to-slate-900 hover:to-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ClipboardList size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                  📋 Заказы клиентов
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Приём входящих заказов на доставку продуктов и заявок на выезд мастера, смена статусов и чат.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Всего заказов: {myGoodsOrders.length + myServiceOrders.length}</span>
                  <span className="text-amber-400 font-bold">Открыть →</span>
                </div>
              </div>

              {/* Box 4: Local Suppliers */}
              <div 
                onClick={() => setActiveTab('suppliers')}
                className="bg-gradient-to-br from-slate-950 to-slate-900 hover:to-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Truck size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors">
                  🤝 База поставщиков
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Прямые контакты фермеров, мукомолен, лесопилок и сырьевых баз Устьянского района для оптовых закупок.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Проверенных поставщиков: {suppliers.length}</span>
                  <span className="text-purple-400 font-bold">Каталог опта →</span>
                </div>
              </div>

              {/* Box 5: Sales Analytics */}
              <div 
                onClick={() => setActiveTab('analytics')}
                className="bg-gradient-to-br from-slate-950 to-slate-900 hover:to-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-slate-500 group-hover:text-teal-400 transition-colors" />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                  📊 Аналитика & Отчёты
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Динамика выручки, средний чек, популярные категории, расчет чистой прибыли с учетом комиссии.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Конверсия: 14.8%</span>
                  <span className="text-teal-400 font-bold">Графики →</span>
                </div>
              </div>

              {/* Box 6: Marketing & Promotion */}
              <div 
                onClick={() => setActiveTab('promotion')}
                className="bg-gradient-to-br from-slate-950 to-slate-900 hover:to-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-pink-500/50 transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-slate-500 group-hover:text-pink-400 transition-colors" />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-pink-400 transition-colors">
                  ⭐ Продвижение & Реклама
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Поднятие в ТОП выдачи, приоритет по соседним деревням района, баннеры на главной и VIP-значок.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Активных кампаний: {activeCampaigns.length}</span>
                  <span className="text-pink-400 font-bold">Управление →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. GOODS & SHOWCASE TAB */}
        {activeTab === 'goods' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Package size={20} className="text-emerald-400" />
                  <span>Управление товарами и витриной</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Настройте цены, остатки и параметры доставки для жителей Устьянского района
                </p>
              </div>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Добавить товар</span>
              </button>
            </div>

            {/* Price list items table/grid */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Прайс-лист товаров ({currentEntrepreneur.priceList.length})
                </span>
                <span className="text-xs text-slate-400">
                  Магазин: <strong className="text-white">{currentEntrepreneur.businessName}</strong>
                </span>
              </div>

              {currentEntrepreneur.priceList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  В вашем каталоге пока нет добавленных товаров. Нажмите «Добавить товар», чтобы начать продажи!
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {currentEntrepreneur.priceList.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-emerald-400 shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{item.item}</h4>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded font-bold">
                              В наличии
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Ед. изм.: {item.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-400">{item.price} ₽</span>
                          <span className="text-[10px] text-slate-400 block">за 1 {item.unit}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                          title="Удалить товар"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Showcase Settings Card */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Store size={16} className="text-emerald-400" />
                <span>Настройки витрины и доставки</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Название предприятия / магазина</label>
                  <input
                    type="text"
                    value={currentEntrepreneur.businessName}
                    onChange={(e) => onUpdateBusiness && onUpdateBusiness({ businessName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Радиус доставки (км)</label>
                  <select
                    value={currentEntrepreneur.serviceRadius}
                    onChange={(e) => onUpdateBusiness && onUpdateBusiness({ serviceRadius: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={10}>10 км (соседние деревни)</option>
                    <option value={25}>25 км (куст поселений)</option>
                    <option value={50}>50 км (весь Устьянский район)</option>
                    <option value={100}>100 км (межрайонная доставка)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Контактный телефон для заказов</label>
                  <input
                    type="text"
                    value={currentEntrepreneur.contactPhone}
                    onChange={(e) => onUpdateBusiness && onUpdateBusiness({ contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SERVICES & PORTFOLIO TAB */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Wrench size={20} className="text-blue-400" />
                  <span>Кабинет Мастера: Услуги и Портфолио</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Управляйте прейскурантом, портфолио выполненных работ и расписанием приёма заявок
                </p>
              </div>
              <button
                onClick={() => setShowAddPortfolioModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Добавить работу в портфолио</span>
              </button>
            </div>

            {/* Price list for services */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Прейскурант услуг мастера</span>
                <span className="text-xs text-blue-400 font-medium">{currentMaster?.priceList?.length || 0} услуг</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Название услуги (например, Ремонт кровли)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Цена ₽"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <select
                    value={newServiceUnit}
                    onChange={(e) => setNewServiceUnit(e.target.value)}
                    className="w-1/2 px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="услуга">за услугу</option>
                    <option value="час">за час</option>
                    <option value="м²">за м²</option>
                    <option value="точка">за точку</option>
                    <option value="сотка">за сотку</option>
                  </select>
                </div>
                <button
                  onClick={handleAddService}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  + Добавить в прейскурант
                </button>
              </div>

              <div className="divide-y divide-slate-800 mt-3">
                {(currentMaster?.priceList || []).map((srv, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-semibold">{srv.service}</span>
                    <span className="text-blue-400 font-black">{srv.price} ₽ / {srv.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Portfolio Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Портфолио выполненных работ ({myPortfolio.length})
                </h3>
              </div>

              {myPortfolio.length === 0 ? (
                <div className="bg-slate-950/60 border border-slate-800 p-8 rounded-2xl text-center text-slate-400 text-xs">
                  В портфолио пока нет работ. Загрузите фото срубов, печей, заборов или отремонтированной техники, чтобы вызывать больше доверия у жителей!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {myPortfolio.map((item) => (
                    <div key={item.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden group">
                      <div className="h-40 bg-slate-900 relative overflow-hidden">
                        <img 
                          src={item.photos[0] || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600'} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.price && (
                          <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm text-emerald-400 text-xs font-black px-2.5 py-1 rounded-lg">
                            {item.price} ₽
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        <h4 className="font-bold text-white text-sm leading-tight">{item.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                          <span>📍 {item.location}</span>
                          {onDeletePortfolioItem && (
                            <button
                              onClick={() => onDeletePortfolioItem(item.id)}
                              className="text-red-400 hover:text-red-300 font-bold"
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ClipboardList size={20} className="text-amber-400" />
                  <span>Управление заказами и заявками</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Принимайте заказы от покупателей и заявки на услуги в реальном времени
                </p>
              </div>
            </div>

            {/* Goods Orders Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                📦 Заказы на товары ({myGoodsOrders.length})
              </h3>
              
              {myGoodsOrders.length === 0 ? (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                  Заказов на товары пока нет.
                </div>
              ) : (
                <div className="space-y-3">
                  {myGoodsOrders.map((order) => (
                    <div key={order.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-white">#{order.id.slice(-6)}</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              order.status === 'new' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              order.status === 'accepted' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              order.status === 'delivering' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {order.status === 'new' ? 'Новый' :
                               order.status === 'accepted' ? 'Принят' :
                               order.status === 'delivering' ? 'В пути' :
                               order.status === 'delivered' ? 'Доставлен' : 'Отменён'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Покупатель: <strong className="text-white">{order.buyerName}</strong> • {order.buyerPhone}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-emerald-400">{order.total} ₽</span>
                          <span className="text-[10px] text-slate-500 block">Адрес: {order.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="text-xs space-y-1">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex items-center justify-between text-slate-300">
                            <span>{it.item || it.name} × {it.quantity} {it.unit}</span>
                            <span className="font-mono">{it.price * it.quantity} ₽</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {onUpdateStatus && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="pt-2 border-t border-slate-850 flex flex-wrap gap-2 justify-end">
                          {order.status === 'new' && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'accepted')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                            >
                              Принять заказ
                            </button>
                          )}
                          {order.status === 'accepted' && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'delivering')}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold"
                            >
                              Отправить в доставку
                            </button>
                          )}
                          {order.status === 'delivering' && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'delivered')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              Завершить / Доставлен
                            </button>
                          )}
                          <button
                            onClick={() => onUpdateStatus(order.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-bold"
                          >
                            Отклонить
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Orders Section */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider">
                🛠️ Заявки на услуги мастера ({myServiceOrders.length})
              </h3>
              
              {myServiceOrders.length === 0 ? (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                  Заявок на услуги мастера пока нет.
                </div>
              ) : (
                <div className="space-y-3">
                  {myServiceOrders.map((sOrder) => (
                    <div key={sOrder.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{sOrder.category}</span>
                        <span className="text-emerald-400 font-black text-sm">{sOrder.budget || 0} ₽</span>
                      </div>
                      <p className="text-xs text-slate-300">{sOrder.description}</p>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                        <span>Заказчик: {sOrder.clientName || 'Житель'} • 📍 {sOrder.address}</span>
                        <span>Желаемая дата: {sOrder.preferredDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. SUPPLIERS TAB */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Truck size={20} className="text-purple-400" />
                  <span>База проверенных поставщиков Устьян</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Прямые контакты оптовиков, ферм и лесопилок района для выгодных поставок сырья и товаров
                </p>
              </div>
              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Предложить поставщика</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((supp) => (
                <div key={supp.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-base">{supp.name}</h3>
                        {supp.isVerified && (
                          <span className="p-0.5 bg-emerald-500/20 text-emerald-400 rounded" title="Проверен">
                            <CheckCircle2 size={14} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        📍 {supp.village} • Контакт: {supp.contactPerson} ({supp.phone})
                      </p>
                    </div>
                    <span className="text-xs font-black text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg shrink-0">
                      ★ {supp.rating} ({supp.reviewsCount})
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {supp.description}
                  </p>

                  {/* Wholesale price table */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      Оптовый прайс-лист:
                    </span>
                    {supp.catalog.map((cat, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                        <span>{cat.item} (от {cat.minQty} {cat.unit})</span>
                        <span className="font-mono font-bold text-emerald-400">{cat.wholesalePrice} ₽/{cat.unit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Мин. заказ: <strong className="text-white">{supp.minOrderAmount} ₽</strong>
                    </span>
                    <button
                      onClick={() => {
                        setShowSupplierOrderModal(supp);
                        setSupplierOrderSuccess(false);
                      }}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                    >
                      Оформить оптовую заявку
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-teal-400" />
                    <span>Аналитика продаж и выручки</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Отслеживайте показатели эффективности, популярные позиции и финансовый результат
                  </p>
                </div>
                <span className="text-xs bg-teal-500/20 text-teal-300 font-bold px-3 py-1 rounded-full border border-teal-500/30">
                  Обновлено в реальном времени
                </span>
              </div>

              {/* Simulated Chart Bars */}
              <div className="pt-4 space-y-3">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Динамика выручки за последние 4 недели (тыс. ₽)
                </span>
                
                <div className="grid grid-cols-4 gap-3 h-44 items-end bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-teal-600/60 hover:bg-teal-500 rounded-t-lg transition-all" style={{ height: '45%' }} />
                    <span className="text-[10px] text-slate-400 font-bold">Нед 1 (18к)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-teal-600/75 hover:bg-teal-500 rounded-t-lg transition-all" style={{ height: '60%' }} />
                    <span className="text-[10px] text-slate-400 font-bold">Нед 2 (24к)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-teal-600/85 hover:bg-teal-500 rounded-t-lg transition-all" style={{ height: '75%' }} />
                    <span className="text-[10px] text-slate-400 font-bold">Нед 3 (32к)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-teal-500 hover:bg-teal-400 rounded-t-lg transition-all shadow-lg shadow-teal-500/20" style={{ height: '95%' }} />
                    <span className="text-[10px] text-teal-300 font-black">Нед 4 (48.5к)</span>
                  </div>
                </div>
              </div>

              {/* Breakdown metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Средний чек покупателя</span>
                  <strong className="text-base text-white font-black mt-1 block">1 150 ₽</strong>
                  <span className="text-[10px] text-emerald-400 font-bold">↑ +12% за неделю</span>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Комиссия платформы</span>
                  <strong className="text-base text-white font-black mt-1 block">
                    {currentUser.tariff === 'vip' ? '0 ₽ (0% на VIP)' : '5% (PRO)'}
                  </strong>
                  <span className="text-[10px] text-slate-400">Экономия: 2 400 ₽/мес</span>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Чистая прибыль мастера/продавца</span>
                  <strong className="text-base text-emerald-400 font-black mt-1 block">46 100 ₽</strong>
                  <span className="text-[10px] text-emerald-400 font-bold">Готово к выводу на карту</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. PROMOTION TAB */}
        {activeTab === 'promotion' && (
          <div className="space-y-6">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-pink-400" />
                    <span>Платное продвижение и маркетинг</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Увеличьте охват жителей, поднимитесь на 1 место в выдаче и получайте больше заказов
                  </p>
                </div>
                <div className="bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Рекламный баланс:</span>
                  <span className="text-sm font-black text-emerald-400">{adsBudget} ₽</span>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-black text-pink-400 uppercase">🔥 Опция 1</span>
                    <h4 className="text-sm font-bold text-white mt-1">ТОП-1 в каталоге товаров</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Ваш магазин или профиль мастера отображается на первой строчке в каталоге района с ярким значком.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-white">80 ₽ / день</span>
                    <button 
                      onClick={() => setAdsBudget(prev => Math.max(0, prev - 80))}
                      className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold"
                    >
                      Подключить
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-black text-blue-400 uppercase">📍 Опция 2</span>
                    <h4 className="text-sm font-bold text-white mt-1">Гео-приоритет по деревням</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Показ вашего предложения в первую очередь жителям выбранных поселков (Шангалы, Березник, Октябрьский).
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-white">50 ₽ / день</span>
                    <button 
                      onClick={() => setAdsBudget(prev => Math.max(0, prev - 50))}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                    >
                      Подключить
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-black text-amber-400 uppercase">💎 Опция 3</span>
                    <h4 className="text-sm font-bold text-white mt-1">Баннер на главной платформы</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Персональный цветной рекламный баннер на входе в приложение «Взаимопомощь».
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-white">150 ₽ / день</span>
                    <button 
                      onClick={() => setAdsBudget(prev => Math.max(0, prev - 150))}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
                    >
                      Подключить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. TARIFFS & SUBSCRIPTION TAB */}
        {activeTab === 'tariffs' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Тарифные планы «Бизнес-центра»
              </h2>
              <p className="text-xs text-slate-400">
                Выберите подходящий тариф для развития вашего дела в Устьянском районе. Переключение тарифа происходит мгновенно.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Basic */}
              <div className={`bg-slate-950 rounded-2xl border p-6 flex flex-col justify-between space-y-6 ${
                currentUser.tariff === 'basic' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-400">Начальный</span>
                    {currentUser.tariff === 'basic' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        Текущий
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">БАЗОВЫЙ</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">0 ₽</span>
                      <span className="text-xs text-slate-400">/ навсегда</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-850">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Комиссия за заказ: <strong>7%</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>До 15 товаров или услуг</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Базовый чат с покупателями</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-500">
                      <X size={14} className="shrink-0" />
                      <span>Приоритет в каталоге</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-500">
                      <X size={14} className="shrink-0" />
                      <span>Расширенная аналитика</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgradeTariff('basic')}
                  disabled={currentUser.tariff === 'basic'}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                    currentUser.tariff === 'basic' 
                      ? 'bg-slate-850 text-slate-500 cursor-default' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {currentUser.tariff === 'basic' ? 'Активен' : 'Выбрать Базовый'}
                </button>
              </div>

              {/* PRO */}
              <div className={`bg-gradient-to-b from-slate-950 to-emerald-950/40 rounded-2xl border p-6 flex flex-col justify-between space-y-6 relative ${
                currentUser.tariff === 'pro' ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-emerald-500/40'
              }`}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  ⭐ Самый популярный
                </span>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-400">Продвинутый</span>
                    {currentUser.tariff === 'pro' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        Текущий
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">PRO ТАРИФ</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-emerald-400">990 ₽</span>
                      <span className="text-xs text-slate-400">/ месяц</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-emerald-900/40">
                    <li className="flex items-center gap-2 font-bold text-white">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Сниженная комиссия: <strong>5%</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>До 100 товаров и услуг</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Приоритет в поиске и выдаче</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Полная аналитика продаж и конверсии</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Доступ к оптовой базе поставщиков</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgradeTariff('pro')}
                  className={`w-full py-2.5 rounded-xl font-black text-xs transition-all shadow-lg ${
                    currentUser.tariff === 'pro'
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                  }`}
                >
                  {currentUser.tariff === 'pro' ? 'Активен (Продлить)' : 'Подключить PRO за 990 ₽'}
                </button>
              </div>

              {/* VIP */}
              <div className={`bg-gradient-to-b from-slate-950 to-amber-950/40 rounded-2xl border p-6 flex flex-col justify-between space-y-6 ${
                currentUser.tariff === 'vip' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-500/30'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-400">Премиум</span>
                    {currentUser.tariff === 'vip' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                        Текущий
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">💎 VIP ПЛАН</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-amber-400">2 490 ₽</span>
                      <span className="text-xs text-slate-400">/ месяц</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-amber-900/40">
                    <li className="flex items-center gap-2 font-black text-amber-300">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>Комиссия за заказ: <strong>0% (БЕЗ КОМИССИИ)</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>Безлимит товаров, услуг и фото</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>Закрепление в ТОП-1 выдачи района</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>SMS-уведомления о новых заказах</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>Персональный менеджер и техподдержка</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgradeTariff('vip')}
                  className={`w-full py-2.5 rounded-xl font-black text-xs transition-all shadow-lg ${
                    currentUser.tariff === 'vip'
                      ? 'bg-amber-500 text-slate-950 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                  }`}
                >
                  {currentUser.tariff === 'vip' ? 'Активен (Продлить)' : 'Подключить VIP за 2 490 ₽'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Добавление товара в каталог</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Название товара</label>
                <input
                  type="text"
                  placeholder="Например: Свежий подовый хлеб"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Цена (₽)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Единица измерения</label>
                  <select
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="кг">кг</option>
                    <option value="шт">шт</option>
                    <option value="л">л</option>
                    <option value="буханка">буханка</option>
                    <option value="связка">связка</option>
                    <option value="куб.м">куб.м</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Описание и особенности</label>
                <textarea
                  rows={3}
                  placeholder="Опишите состав, свежесть или условия доставки..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Отмена
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md"
              >
                Сохранить товар
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Portfolio Item */}
      {showAddPortfolioModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Добавить работу в портфолио</h3>
              <button onClick={() => setShowAddPortfolioModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Название работы / объекта</label>
                <input
                  type="text"
                  placeholder="Например: Сруб бани 4х6 с террасой"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Категория</label>
                <select
                  value={portfolioCategory}
                  onChange={(e) => setPortfolioCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="craftsman">Строительство и плотницкие работы</option>
                  <option value="worker">Сантехника и электрика</option>
                  <option value="agriculture">Сельхоз и обработка земли</option>
                  <option value="art">Резьба по дереву и декор</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Описание процесса и материалов</label>
                <textarea
                  rows={3}
                  placeholder="Опишите, какие материалы использовались и в какие сроки выполнено..."
                  value={portfolioDesc}
                  onChange={(e) => setPortfolioDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Деревня / локация</label>
                  <input
                    type="text"
                    value={portfolioLocation}
                    onChange={(e) => setPortfolioLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Стоимость работ (₽)</label>
                  <input
                    type="number"
                    placeholder="Договорная"
                    value={portfolioPrice}
                    onChange={(e) => setPortfolioPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddPortfolioModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Отмена
              </button>
              <button
                onClick={handleAddPortfolio}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md"
              >
                Опубликовать работу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Supplier Order */}
      {showSupplierOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Оптовый заказ поставщику</h3>
              <button onClick={() => setShowSupplierOrderModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {supplierOrderSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Заявка успешно отправлена!</h4>
                <p className="text-xs text-slate-400">
                  Поставщик «{showSupplierOrderModal.name}» свяжется с вами по телефону {currentUser.phone || '+7 (921) ...'} для согласования доставки.
                </p>
                <button
                  onClick={() => setShowSupplierOrderModal(null)}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Понятно
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-white block">{showSupplierOrderModal.name}</span>
                  <span className="text-slate-400 text-[11px]">📍 {showSupplierOrderModal.village} • {showSupplierOrderModal.phone}</span>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Укажите наименования и объемы заказа</label>
                  <textarea
                    rows={4}
                    placeholder="Например: 5 мешков муки пшеничной в/с, 2 упаковки дрожжей. Доставка в д. Шангалы."
                    value={supplierOrderText}
                    onChange={(e) => setSupplierOrderText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowSupplierOrderModal(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (!supplierOrderText.trim()) return;
                      setSupplierOrderSuccess(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-md"
                  >
                    Отправить заявку
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Suggest new supplier */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Добавить поставщика в базу</h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const newSupp: SupplierItem = {
                  id: `supp_${Date.now()}`,
                  name: form.name.value,
                  category: form.category.value,
                  contactPerson: form.contact.value,
                  phone: form.phone.value,
                  village: form.village.value,
                  description: form.desc.value,
                  rating: 5.0,
                  reviewsCount: 1,
                  deliveryTerms: form.delivery.value || 'Самовывоз или доставка по согласованию',
                  minOrderAmount: parseInt(form.minOrder.value) || 1000,
                  catalog: [{ item: form.item.value || 'Основная продукция', wholesalePrice: parseInt(form.price.value) || 100, unit: 'шт', minQty: 1 }],
                  isVerified: false
                };
                saveSuppliers([...suppliers, newSupp]);
                setShowAddSupplierModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-400 font-bold block mb-1">Название организации / КФХ</label>
                <input name="name" required placeholder="ООО или КФХ «Название»" className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Категория</label>
                  <select name="category" className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white">
                    <option value="meat_milk">Молоко и мясо</option>
                    <option value="bakery">Мука и хлебопечение</option>
                    <option value="wood_building">Лес и стройматериалы</option>
                    <option value="agriculture">Сельхозсырье</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Деревня</label>
                  <input name="village" required defaultValue={currentUser.village || 'Октябрьский'} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Контактное лицо</label>
                  <input name="contact" required placeholder="Имя" className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Телефон</label>
                  <input name="phone" required placeholder="+7 ..." className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold block mb-1">Описание продукции</label>
                <textarea name="desc" rows={2} placeholder="Что поставляет, какие объемы..." className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Пример товара</label>
                  <input name="item" placeholder="Например, Доска 50х150" className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Оптовая цена ₽</label>
                  <input name="price" type="number" placeholder="500" className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddSupplierModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">
                  Отмена
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black">
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tariff Upgrade Simulator */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Активация тарифа {selectedTariffForUpgrade.toUpperCase()}</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider block">Преимущества тарифа:</span>
              <p className="text-slate-300">
                {selectedTariffForUpgrade === 'vip' 
                  ? 'Комиссия 0%, закрепление на 1 месте в каталоге района, SMS-уведомления и персональный менеджер.'
                  : 'Комиссия 5%, до 100 товаров/услуг, приоритетное отображение в поиске и расширенная аналитика.'}
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold">
                <span className="text-slate-400">Стоимость за 30 дней:</span>
                <span className="text-sm font-black text-white">
                  {selectedTariffForUpgrade === 'vip' ? '2 490 ₽' : '990 ₽'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              *В демонстрационной среде активация происходит мгновенно в 1 клик без списания реальных средств.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Отмена
              </button>
              <button
                onClick={() => handleUpgradeTariff(selectedTariffForUpgrade)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md"
              >
                Активировать {selectedTariffForUpgrade.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
