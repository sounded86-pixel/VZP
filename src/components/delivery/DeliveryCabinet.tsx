import React, { useState, useMemo } from 'react';
import { Entrepreneur, Order, Review, PriceListItem } from '../../types';
import { 
  Check, X, Truck, Edit3, Award, Calendar, FileDown, Eye, MessageSquare, 
  Save, Power, Plus, Trash2, TrendingUp, BarChart3, Coins, Sparkles, 
  Lock, ShieldAlert, FileText, CheckCircle, HelpCircle, ArrowUpRight
} from 'lucide-react';

interface DeliveryCabinetProps {
  entrepreneur: Entrepreneur;
  orders: Order[];
  reviews: Review[];
  onUpdateStatus: (orderId: string, status: 'accepted' | 'delivering' | 'delivered' | 'cancelled') => void;
  onUpdateBusiness: (updates: Partial<Entrepreneur>) => void;
  onAddReviewReply: (reviewId: string, replyText: string) => void;
  onClose: () => void;
}

export default function DeliveryCabinet({
  entrepreneur,
  orders,
  reviews,
  onUpdateStatus,
  onUpdateBusiness,
  onAddReviewReply,
  onClose
}: DeliveryCabinetProps) {
  // Tabs: 'orders' | 'goods' | 'analytics' | 'history' | 'reviews' | 'monetization' | 'contracts' | 'security'
  const [activeTab, setActiveTab] = useState<'orders' | 'goods' | 'analytics' | 'history' | 'reviews' | 'monetization' | 'contracts' | 'security'>('orders');
  
  // Local states for editing replies
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

  // Goods management local states
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('кг');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Editing product states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [editingUnit, setEditingUnit] = useState('кг');
  const [editingDesc, setEditingDesc] = useState('');

  // Tariff upgrade wizard simulator states
  const [upgradingTariff, setUpgradingTariff] = useState<'basic' | 'pro' | 'vip' | null>(null);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentStatusMsg, setPaymentStatusMsg] = useState('');

  // Interactive Legal Contract viewer
  const [viewingCabinetContract, setViewingCabinetContract] = useState<'offer' | 'license' | 'entrepreneur' | null>(null);

  // Filter orders for this entrepreneur
  const myOrders = useMemo(() => {
    return orders.filter(o => o.entrepreneurId === entrepreneur.id);
  }, [orders, entrepreneur.id]);

  const newOrders = useMemo(() => {
    return myOrders.filter(o => o.status === 'new');
  }, [myOrders]);

  const activeOrders = useMemo(() => {
    return myOrders.filter(o => o.status === 'accepted' || o.status === 'delivering');
  }, [myOrders]);

  const historyOrders = useMemo(() => {
    return myOrders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
  }, [myOrders]);

  // Filter reviews for this entrepreneur
  const myReviews = useMemo(() => {
    return reviews.filter(r => r.entrepreneurId === entrepreneur.id);
  }, [reviews, entrepreneur.id]);

  // Financial Analytics Calculation
  const analyticsData = useMemo(() => {
    const completed = historyOrders.filter(o => o.status === 'delivered');
    const totalEarnings = completed.reduce((sum, o) => sum + o.total, 0);
    const orderCount = completed.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalEarnings / orderCount) : 0;
    
    // Commission rate based on active tariff
    let commPercent = 7;
    if (entrepreneur.tariff === 'pro') commPercent = 5;
    if (entrepreneur.tariff === 'vip') commPercent = 0; // 0% on VIP for promo

    const commissionPaid = completed.reduce((sum, o) => {
      return sum + (o.commissionAmount || Math.round(o.total * (commPercent / 100)));
    }, 0);

    const activeFines = entrepreneur.fines || 0;
    const netProfit = totalEarnings - commissionPaid - activeFines;

    return {
      totalEarnings,
      orderCount,
      avgOrderValue,
      commissionPaid,
      activeFines,
      netProfit,
      commPercent
    };
  }, [historyOrders, entrepreneur.tariff, entrepreneur.fines]);

  // Export CSV for Bookkeeping
  const handleExportCSV = () => {
    if (historyOrders.length === 0) {
      alert('Нет завершенных заказов для экспорта!');
      return;
    }

    const headers = [
      'ID Заказа',
      'Дата создания',
      'Покупатель',
      'Телефон',
      'Адрес доставки',
      'Продукты',
      'Сумма продуктов (руб)',
      'Доставка (руб)',
      'Итого (руб)',
      'Статус'
    ];

    const rows = historyOrders.map(o => {
      const itemsListStr = o.items.map(it => `${it.item} (x${it.quantity} ${it.unit})`).join('; ');
      return [
        o.id,
        new Date(o.createdAt).toLocaleDateString('ru-RU'),
        o.buyerName,
        o.buyerPhone,
        `"${o.deliveryAddress.replace(/"/g, '""')}"`,
        `"${itemsListStr.replace(/"/g, '""')}"`,
        o.subtotal,
        o.deliveryFee,
        o.total,
        o.status === 'delivered' ? 'Доставлен' : 'Отменен'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Отчет_Заказы_${entrepreneur.businessName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleActiveState = () => {
    onUpdateBusiness({
      isActive: !entrepreneur.isActive
    });
  };

  const submitReply = (reviewId: string) => {
    const text = replyTextMap[reviewId] || '';
    if (!text.trim()) return;
    onAddReviewReply(reviewId, text.trim());
    setEditingReplyId(null);
  };

  // Goods priceList handlers
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice) return;

    const currentPriceList = entrepreneur.priceList || [];
    
    // Tariff Limits check: Basic allows max 10 products
    if (entrepreneur.tariff === 'basic' && currentPriceList.length >= 10) {
      alert('Ошибка! Ваш текущий тариф «Базовый» имеет ограничение на размещение максимум 10 товаров. Пожалуйста, перейдите на вкладку «Тарифы» и подключите тариф PRO для безлимитного размещения товаров.');
      return;
    }

    const newProduct: PriceListItem = {
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      item: newProductName.trim(),
      price: parseFloat(newProductPrice),
      unit: newProductUnit,
      description: newProductDesc.trim() || undefined,
      inStock: true
    };

    const updatedPriceList = [...currentPriceList, newProduct];
    onUpdateBusiness({ priceList: updatedPriceList });

    // Reset fields
    setNewProductName('');
    setNewProductPrice('');
    setNewProductUnit('кг');
    setNewProductDesc('');
    setIsAddingProduct(false);
  };

  const startEditingProduct = (prod: PriceListItem, idx: number) => {
    setEditingProductId(prod.id || `idx-${idx}`);
    setEditingName(prod.item);
    setEditingPrice(prod.price.toString());
    setEditingUnit(prod.unit);
    setEditingDesc(prod.description || '');
  };

  const handleSaveProductEdit = (idxToSave: number) => {
    const currentPriceList = entrepreneur.priceList || [];
    const updated = currentPriceList.map((prod, idx) => {
      const matchId = prod.id || `idx-${idx}`;
      if (matchId === editingProductId || idx === idxToSave) {
        return {
          ...prod,
          item: editingName.trim(),
          price: parseFloat(editingPrice) || prod.price,
          unit: editingUnit,
          description: editingDesc.trim() || undefined
        };
      }
      return prod;
    });

    onUpdateBusiness({ priceList: updated });
    setEditingProductId(null);
  };

  const handleDeleteProduct = (idxToDelete: number) => {
    if (!confirm('Вы уверены, что хотите безвозвратно удалить этот товар из прайс-листа?')) return;
    const currentPriceList = entrepreneur.priceList || [];
    const updated = currentPriceList.filter((_, idx) => idx !== idxToDelete);
    onUpdateBusiness({ priceList: updated });
  };

  const handleToggleProductStock = (idxToToggle: number) => {
    const currentPriceList = entrepreneur.priceList || [];
    const updated = currentPriceList.map((prod, idx) => {
      if (idx === idxToToggle) {
        return {
          ...prod,
          inStock: prod.inStock === undefined ? false : !prod.inStock
        };
      }
      return prod;
    });
    onUpdateBusiness({ priceList: updated });
  };

  // Tariff Subscription Simulator
  const handleUpgradeTariffClick = (tType: 'basic' | 'pro' | 'vip') => {
    setUpgradingTariff(tType);
    setPaymentStep('idle');
    setPaymentStatusMsg('');
  };

  const handleStartSimulatedPayment = () => {
    setPaymentStep('processing');
    const msgs = [
      'Инициализация шлюза СберБизнес Эквайринг...',
      'Проверка цифровой лицензии ИНН: ' + (entrepreneur.requisites?.inn || '291801001') + '...',
      'Авторизация защищенного банковского токена...',
      'Проведение списания со счета...',
      'Синхронизация тарифного статуса в Firestore...'
    ];

    let count = 0;
    setPaymentStatusMsg(msgs[0]);

    const interval = setInterval(() => {
      count++;
      if (count < msgs.length) {
        setPaymentStatusMsg(msgs[count]);
      } else {
        clearInterval(interval);
        
        // Save changes to Firestore / state
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30); // Valid for 30 days
        
        onUpdateBusiness({
          tariff: upgradingTariff!,
          tariffExpiryDate: expiry.toISOString()
        });

        setPaymentStep('success');
      }
    }, 1100);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto" id="delivery_cabinet">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              💼 Кабинет: {entrepreneur.businessName}
            </h2>
            <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${
              entrepreneur.moderationStatus === 'approved' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {entrepreneur.moderationStatus === 'approved' ? 'Активен' : 'На проверке'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Управляйте поступающими заказами, прайс-листом, тарифами и аналитикой продаж
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active status toggler (vacation mode) */}
          <button
            onClick={handleToggleActiveState}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              entrepreneur.isActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-350 hover:bg-slate-400 text-slate-800'
            }`}
            title="Принимаю ли я заказы сейчас"
          >
            <Power size={13} />
            <span>{entrepreneur.isActive ? 'Приём заказов: ВКЛ' : 'На каникулах (ВЫКЛ)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-all cursor-pointer"
          >
            В каталог
          </button>
        </div>
      </div>

      {/* Main Stats ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase">Новые заказы</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{newOrders.length}</p>
        </div>
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase">Выручка за период</p>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{analyticsData.totalEarnings} ₽</p>
        </div>
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase">Рейтинг клиентов</p>
          <p className="text-2xl font-black text-amber-500 mt-1">★ {entrepreneur.rating.average}</p>
        </div>
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase">Доставлено в срок</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">{entrepreneur.rating.onTimePercentage}%</p>
        </div>
      </div>

      {/* Workspace Cabinet Tabs */}
      <div className="flex border-b border-slate-200 mb-5 overflow-x-auto scrollbar-none gap-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-3 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'orders'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📦 Активные заказы ({newOrders.length + activeOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('goods')}
          className={`py-2 px-3 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'goods'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🍎 Мои товары (Прайс-лист)
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-3 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'analytics'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📈 Аналитика
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-3 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'history'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📜 История
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-2 px-3 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'reviews'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          💬 Отзывы ({myReviews.length})
        </button>

        <button
          onClick={() => setActiveTab('monetization')}
          className={`py-2 px-3 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'monetization'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🪙 Тарифы
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`py-2 px-3 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'contracts'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📄 Договоры
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-2 px-3 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'security'
              ? 'border-brand-medium text-brand-medium'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🛡️ Лимиты & Защита
        </button>
      </div>

      {/* TAB 1: ACTIVE ORDERS QUEUES */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Section: Incoming New orders */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span>🔔 Поступившие новые заказы</span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {newOrders.length}
              </span>
            </h3>

            {newOrders.length > 0 ? (
              <div className="space-y-3">
                {newOrders.map(order => (
                  <div key={order.id} className="bg-white border-2 border-brand-medium/30 p-5 rounded-2xl shadow-xs space-y-4 animate-fade-in">
                    <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Заказ #{order.id.slice(-6)}</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                          Покупатель: <strong className="text-slate-700">{order.buyerName}</strong> ({order.buyerPhone})
                        </p>
                      </div>
                      <div className="text-right text-[10px] font-bold text-slate-400">
                        Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold text-slate-600">
                          <span>• {it.item} (x{it.quantity} {it.unit})</span>
                          <span>{it.price * it.quantity} ₽</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 pt-1.5 mt-2 flex justify-between text-xs font-black text-slate-800">
                        <span>Итого (с доставкой):</span>
                        <span className="text-brand-medium font-mono">{order.total} ₽</span>
                      </div>
                    </div>

                    {/* Address details */}
                    <div className="text-[10px] font-bold text-slate-500 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                      🏡 <strong>Адрес доставки:</strong> {order.deliveryAddress} | Желаемое время: {order.requestedDeliveryDate} ({order.requestedDeliveryTimeSlot})
                    </div>

                    {/* Action controls */}
                    <div className="flex gap-2.5 justify-end pt-1">
                      <button
                        onClick={() => onUpdateStatus(order.id, 'cancelled')}
                        className="bg-red-50 hover:bg-red-100 text-red-650 font-black px-4 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 border border-red-200"
                      >
                        <X size={12} />
                        <span>Отклонить</span>
                      </button>

                      <button
                        onClick={() => onUpdateStatus(order.id, 'accepted')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Check size={12} className="stroke-[3]" />
                        <span>Принять и собирать</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-8 rounded-2xl border border-slate-100 text-slate-400 text-xs font-bold">
                Нет новых необработанных заказов
              </div>
            )}
          </div>

          {/* Section: Accepted orders in progress */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span>🚚 Принятые заказы в сборке / в пути</span>
              <span className="bg-brand-medium text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {activeOrders.length}
              </span>
            </h3>

            {activeOrders.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <div key={order.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>Заказ #{order.id.slice(-6)}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg ${
                            order.status === 'delivering' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-150'
                          }`}>
                            {order.status === 'delivering' ? 'В пути' : 'Сборка товара'}
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                          Покупатель: {order.buyerName} | {order.buyerPhone}
                        </p>
                      </div>
                      <span className="text-xs font-black text-slate-800 font-mono">{order.total} ₽</span>
                    </div>

                    <div className="text-[10px] font-bold text-slate-600 space-y-1">
                      <p>📍 <strong>Куда доставить:</strong> {order.deliveryAddress}</p>
                      <p>📅 <strong>Сроки доставки:</strong> {order.requestedDeliveryDate} ({order.requestedDeliveryTimeSlot})</p>
                    </div>

                    {/* Action transitions */}
                    <div className="flex gap-2 justify-end">
                      {order.status === 'accepted' ? (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'delivering')}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Truck size={12} />
                          <span>Выехать (Отметить "В пути")</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'delivered')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Check size={12} />
                          <span>Доставлено на дом!</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-8 rounded-2xl border border-slate-100 text-slate-400 text-xs font-bold">
                Нет активных заказов в доставке
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GOODS MANAGEMENT */}
      {activeTab === 'goods' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-150">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                🍎 Прайс-лист товаров и услуг
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                Заполните карточки ваших эко-продуктов, указывая точную цену и единицы измерения
              </p>
            </div>
            
            <button
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={14} />
              <span>Добавить товар</span>
            </button>
          </div>

          {/* Add product form */}
          {isAddingProduct && (
            <form onSubmit={handleAddProduct} className="bg-white border-2 border-indigo-100 p-5 rounded-2xl space-y-4 animate-fade-in shadow-xs">
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-widest">📝 Добавление нового продукта</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Название товара *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Сметана домашняя 20%"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-indigo-500 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Цена (₽) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Цена"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-indigo-500 font-bold text-slate-800 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Единица измерения *</label>
                  <select
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:bg-white focus:outline-indigo-500 font-bold text-slate-700"
                  >
                    <option value="кг">Килограмм (кг)</option>
                    <option value="шт">Штука (шт)</option>
                    <option value="литр">Литр</option>
                    <option value="десяток">Десяток</option>
                    <option value="пучок">Пучок</option>
                    <option value="банка 0.5л">Банка 0.5л</option>
                    <option value="банка 1л">Банка 1л</option>
                    <option value="банка 3л">Банка 3л</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Описание / Состав (необязательно)</label>
                <textarea
                  placeholder="Опишите продукт, его свежесть, дату надоя или особенности приготовления..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-indigo-500 font-bold text-slate-700"
                  rows={2}
                />
              </div>

              {entrepreneur.tariff === 'basic' && (entrepreneur.priceList || []).length >= 10 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-xl">
                  ⚠ Внимание! На тарифе «Базовый» у вас лимит 10 товаров. Вы уже разместили {(entrepreneur.priceList || []).length} товаров. Добавление нового заблокировано. Перейдите на тариф PRO для безлимита.
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  Сохранить товар
                </button>
              </div>
            </form>
          )}

          {/* List of Products */}
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/50 border-b border-slate-150 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Наименование и описание</span>
              <div className="flex gap-16 pr-4">
                <span>Цена и учет</span>
                <span>Наличие</span>
                <span>Действия</span>
              </div>
            </div>

            {(entrepreneur.priceList || []).length > 0 ? (
              <div className="divide-y divide-slate-150">
                {(entrepreneur.priceList || []).map((prod, idx) => {
                  const isEditing = editingProductId === (prod.id || `idx-${idx}`);

                  return (
                    <div key={prod.id || idx} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/30 transition-colors text-xs font-bold">
                      {isEditing ? (
                        <div className="flex-1 space-y-2 w-full">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-800 w-full"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-800 w-full font-mono"
                            />
                            <input
                              type="text"
                              value={editingUnit}
                              onChange={(e) => setEditingUnit(e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-800 w-full"
                            />
                          </div>
                          <textarea
                            value={editingDesc}
                            onChange={(e) => setEditingDesc(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 w-full"
                            rows={1}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-black text-slate-900">{prod.item}</h4>
                          {prod.description && <p className="text-[10.5px] text-slate-500 font-medium">{prod.description}</p>}
                        </div>
                      )}

                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                        <div className="text-right">
                          {isEditing ? (
                            <span className="text-[10px] text-slate-400">Ввод...</span>
                          ) : (
                            <>
                              <p className="font-extrabold text-slate-800 font-mono text-sm">{prod.price} ₽</p>
                              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">за 1 {prod.unit}</p>
                            </>
                          )}
                        </div>

                        {/* Stock toggle */}
                        <div>
                          <button
                            onClick={() => handleToggleProductStock(idx)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-black cursor-pointer transition-colors ${
                              prod.inStock !== false
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {prod.inStock !== false ? 'В наличии' : 'Нет на складе'}
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                                title="Отмена"
                              >
                                ✕
                              </button>
                              <button
                                onClick={() => handleSaveProductEdit(idx)}
                                className="p-1 text-emerald-600 hover:text-emerald-800"
                                title="Сохранить"
                              >
                                <Save size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingProduct(prod, idx)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Редактировать"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(idx)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Удалить"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-12 text-slate-400 font-bold">
                Ваш прайс-лист пуст. Добавьте свои первые товары!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & REVENUE CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                📈 Финансовая аналитика торговли и подвозов
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                Автоматический подсчет чистой прибыли за вычетом сервисного сбора
              </p>
            </div>
            
            <div className="text-xs font-black text-slate-800 bg-slate-50 border border-slate-150 px-3.5 py-1.5 rounded-xl">
              Тариф: <span className="text-indigo-600">{entrepreneur.tariff === 'vip' ? 'Районный VIP (0%)' : entrepreneur.tariff === 'pro' ? 'PRO таун-лидер (5%)' : 'Базовый (7%)'}</span>
            </div>
          </div>

          {/* Key Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
              <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-widest">Общий Оборот</span>
              <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">{analyticsData.totalEarnings} ₽</p>
              <span className="text-[8px] text-emerald-700/80 font-bold mt-1 block">За весь период</span>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl">
              <span className="block text-[9px] font-black text-indigo-800 uppercase tracking-widest">Средний чек</span>
              <p className="text-2xl font-black text-indigo-950 mt-1 font-mono">{analyticsData.avgOrderValue} ₽</p>
              <span className="text-[8px] text-indigo-700/80 font-bold mt-1 block">На один заказ</span>
            </div>

            <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl">
              <span className="block text-[9px] font-black text-rose-800 uppercase tracking-widest">Комиссия (Уплачено)</span>
              <p className="text-2xl font-black text-rose-950 mt-1 font-mono">{analyticsData.commissionPaid} ₽</p>
              <span className="text-[8px] text-rose-700/80 font-bold mt-1 block">Сервисный сбор {analyticsData.commPercent}%</span>
            </div>

            <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Чистая прибыль</span>
              <p className="text-2xl font-black text-slate-800 mt-1 font-mono">{analyticsData.netProfit} ₽</p>
              <span className="text-[8px] text-slate-500/80 font-bold mt-1 block">За вычетом сборов и штрафов</span>
            </div>
          </div>

          {/* SVG Dinamic Income Chart */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Динамика оборота по неделям (6 недель)</h4>
              <span className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-0.5">Всплеск во время ярмарки <ArrowUpRight size={12} /></span>
            </div>

            {/* Simulated Line Chart inside SVG */}
            <div className="h-44 w-full relative pt-2">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glow-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="25" x2="500" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="125" x2="500" y2="125" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Area under line */}
                <path
                  d="M 10 130 Q 100 110, 180 80 T 360 40 T 490 20 L 490 140 L 10 140 Z"
                  fill="url(#glow-grad)"
                />
                
                {/* Glow Path Line */}
                <path
                  d="M 10 130 Q 100 110, 180 80 T 360 40 T 490 20"
                  fill="transparent"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Nodes on path */}
                <circle cx="10" cy="130" r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />
                <circle cx="100" cy="115" r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />
                <circle cx="180" cy="80" r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />
                <circle cx="360" cy="40" r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />
                <circle cx="490" cy="20" r="5" fill="#e11d48" stroke="white" strokeWidth="2" />
              </svg>

              <div className="flex justify-between text-[8px] font-bold text-slate-400 pt-1.5 uppercase font-mono">
                <span>Неделя 1 (1 200₽)</span>
                <span>Неделя 2 (1 800₽)</span>
                <span>Неделя 3 (2 400₽)</span>
                <span>Неделя 4 (3 600₽)</span>
                <span>Текущая ({analyticsData.totalEarnings}₽)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORIC DELIVERIES */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 bg-white p-4 rounded-2xl border border-slate-100">
            <div>
              <h4 className="text-xs font-black text-slate-800">Архив выполненных заказов</h4>
              <p className="text-[10px] text-slate-500 font-bold">Экспортируйте данные в формате таблицы для бухгалтерии и отчета налоговой</p>
            </div>

            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-750 text-white font-black px-4 py-2 rounded-xl text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <FileDown size={14} />
              <span>Выгрузить в Excel (CSV)</span>
            </button>
          </div>

          <div className="space-y-3">
            {historyOrders.length > 0 ? (
              historyOrders.map(order => (
                <div key={order.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex justify-between items-center gap-4 text-xs font-bold">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 font-black">Заказ #{order.id.slice(-6)}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {order.status === 'delivered' ? 'Выполнен' : 'Отклонен'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Клиент: {order.buyerName} | с. {order.deliveryAddress.split(',')[0]}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-slate-800 font-mono">{order.total} ₽</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center bg-white p-12 rounded-2xl border border-slate-100 text-slate-400 text-xs font-bold">
                История выполненных заказов пуста
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
            💬 Отзывы жителей о ваших подвозах
          </h3>

          <div className="space-y-3">
            {myReviews.length > 0 ? (
              myReviews.map(rev => (
                <div key={rev.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 text-xs font-bold">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900">{rev.buyerName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5 text-[10px] font-black text-amber-800 flex items-center gap-0.5">
                      ★ {rev.rating}
                    </div>
                  </div>

                  {/* Multi-category breakdown */}
                  {rev.categories && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl text-[10px] text-slate-500 font-bold">
                      <div>🕒 Доставка: <strong className="text-amber-600">★ {rev.categories.timeliness}</strong></div>
                      <div>🍅 Качество: <strong className="text-amber-600">★ {rev.categories.quality}</strong></div>
                      <div>🤝 Вежливость: <strong className="text-amber-600">★ {rev.categories.politeness}</strong></div>
                      <div>💰 Цены: <strong className="text-amber-600">★ {rev.categories.priceFairness}</strong></div>
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-slate-700 leading-normal font-bold">
                    💬 "{rev.comment}"
                  </p>

                  {/* Entrepreneur replies */}
                  {rev.entrepreneurReply ? (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl space-y-1">
                      <p className="text-[9px] text-emerald-800 font-black uppercase tracking-wider">Ваш ответ:</p>
                      <p className="text-slate-700 italic">"{rev.entrepreneurReply}"</p>
                    </div>
                  ) : (
                    <div>
                      {editingReplyId === rev.id ? (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Напишите ответ покупателю (например: Спасибо за отзыв, будем рады привезти вам продукты снова!)..."
                            value={replyTextMap[rev.id] || ''}
                            onChange={(e) => setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 focus:bg-white focus:outline-none text-xs"
                            rows={2}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingReplyId(null)}
                              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px]"
                            >
                              Отмена
                            </button>
                            <button
                              onClick={() => submitReply(rev.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] flex items-center gap-1"
                            >
                              <Save size={10} />
                              <span>Отправить ответ</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingReplyId(rev.id)}
                          className="text-[10px] text-brand-medium hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare size={11} />
                          <span>Ответить на отзыв</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center bg-white p-12 rounded-2xl border border-slate-100 text-slate-400 text-xs font-bold">
                Отзывов о ваших доставках пока нет
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: MONETIZATION & TARIFF PLANS */}
      {activeTab === 'monetization' && (() => {
        const trialStart = entrepreneur.trialStartDate ? new Date(entrepreneur.trialStartDate).getTime() : new Date(entrepreneur.createdAt || Date.now()).getTime();
        const trialEnd = trialStart + 14 * 24 * 60 * 60 * 1000;
        const remainingDays = Math.max(0, Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000)));
        const isTrialActive = Date.now() < trialEnd;
        
        return (
          <div className="space-y-6 animate-fadeIn" id="cabinet_monetization_tab">
            {/* Trial period information */}
            <div className="bg-gradient-to-r from-brand-medium/10 to-emerald-500/10 border border-brand-medium/20 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {entrepreneur.tariff === 'free_trial' || isTrialActive ? 'Пробный период активен' : `Тариф: ${entrepreneur.tariff?.toUpperCase()}`}
                </span>
                <h4 className="text-sm font-black text-slate-800">
                  {isTrialActive 
                    ? `У вас осталось ${remainingDays} дней бесплатного использования` 
                    : `Ваш тарифный план: ${entrepreneur.tariff === 'pro' ? 'PRO таун-лидер' : entrepreneur.tariff === 'vip' ? 'Районный VIP' : 'Базовый'}`}
                </h4>
                <p className="text-[10px] text-slate-500 font-bold">
                  Пробный период на 14 дней предоставляется всем новым предпринимателям для тестирования системы доставки.
                </p>
              </div>

              <div className="bg-white border border-slate-150 px-4 py-2.5 rounded-xl text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Всего сборов накоплено</p>
                <p className="text-lg font-mono font-black text-slate-800">{analyticsData.commissionPaid.toFixed(2)} ₽</p>
                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">{analyticsData.commPercent}% с каждого выполненного заказа</p>
              </div>
            </div>

            {/* Tariffs Tier card rendering */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                💎 Тарифные планы для коммерческих лиц
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Basic Plan */}
                <div className={`bg-white border rounded-2xl p-4 space-y-4 flex flex-col justify-between relative ${
                  (entrepreneur.tariff === 'basic' || (!entrepreneur.tariff && !isTrialActive)) ? 'border-brand-medium ring-2 ring-brand-medium/20' : 'border-slate-200'
                }`}>
                  {(entrepreneur.tariff === 'basic' || (!entrepreneur.tariff && !isTrialActive)) && (
                    <span className="absolute -top-2.5 left-4 bg-brand-medium text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Текущий тариф</span>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase">Базовый</p>
                    <p className="text-2xl font-black text-slate-800">500 ₽ <span className="text-[10px] text-slate-400 font-medium">/ мес</span></p>
                    <ul className="text-[10px] text-slate-500 font-bold space-y-1.5 pt-2">
                      <li className="flex items-center gap-1 text-emerald-600">✓ Размещение до 10 продуктов</li>
                      <li className="flex items-center gap-1 text-emerald-600">✓ Стандартная комиссия 7%</li>
                      <li className="flex items-center gap-1 text-slate-400">✗ Выделение в каталоге</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpgradeTariffClick('basic')}
                    disabled={entrepreneur.tariff === 'basic'}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-brand-medium disabled:text-white text-slate-700 font-black text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {entrepreneur.tariff === 'basic' ? 'Активен' : 'Выбрать за 500₽'}
                  </button>
                </div>

                {/* PRO Plan */}
                <div className={`bg-white border rounded-2xl p-4 space-y-4 flex flex-col justify-between relative ${
                  entrepreneur.tariff === 'pro' ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200'
                }`}>
                  {entrepreneur.tariff === 'pro' && (
                    <span className="absolute -top-2.5 left-4 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Текущий тариф</span>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-black text-indigo-600 uppercase">⭐️ PRO таун-лидер</p>
                    <p className="text-2xl font-black text-slate-800">1 500 ₽ <span className="text-[10px] text-slate-400 font-medium">/ мес</span></p>
                    <ul className="text-[10px] text-slate-500 font-bold space-y-1.5 pt-2">
                      <li className="flex items-center gap-1 text-emerald-600">✓ Безлимитный прайс-лист</li>
                      <li className="flex items-center gap-1 text-emerald-600">✓ Сниженная комиссия 5%</li>
                      <li className="flex items-center gap-1 text-emerald-600">✓ Выделение желтой рамкой</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpgradeTariffClick('pro')}
                    disabled={entrepreneur.tariff === 'pro'}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-indigo-600 disabled:text-white text-slate-700 font-black text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {entrepreneur.tariff === 'pro' ? 'Активен' : 'Выбрать за 1500₽'}
                  </button>
                </div>

                {/* VIP Plan */}
                <div className={`bg-white border rounded-2xl p-4 space-y-4 flex flex-col justify-between relative ${
                  entrepreneur.tariff === 'vip' ? 'border-rose-600 ring-2 ring-rose-600/20' : 'border-slate-200'
                }`}>
                  {entrepreneur.tariff === 'vip' && (
                    <span className="absolute -top-2.5 left-4 bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Текущий тариф</span>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-black text-rose-600 uppercase">👑 Районный VIP</p>
                    <p className="text-2xl font-black text-slate-800">5 000 ₽ <span className="text-[10px] text-slate-400 font-medium">/ мес</span></p>
                    <ul className="text-[10px] text-slate-500 font-bold space-y-1.5 pt-2">
                      <li className="flex items-center gap-1 text-emerald-600">✓ Личный диспетчер логистики</li>
                      <li className="flex items-center gap-1 text-emerald-600">✓ Рекламный баннер в ТОП-3</li>
                      <li className="flex items-center gap-1 text-emerald-600">✓ Сниженная комиссия 0%</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpgradeTariffClick('vip')}
                    disabled={entrepreneur.tariff === 'vip'}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-rose-600 disabled:text-white text-slate-700 font-black text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {entrepreneur.tariff === 'vip' ? 'Активен' : 'Выбрать за 5000₽'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 7: LEGAL CONTRACTS INFRASTRUCTURE */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-150 p-5 rounded-2xl">
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              ЭЛЕКТРОННЫЙ ЮРИДИЧЕСКИЙ РЕЕСТР ПРЕДПРИНИМАТЕЛЯ
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-2">Правовая защищенность ведения бизнеса</h3>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Все торговые отношения в приложении «Взаимопомощь Устьяны» официально закреплены цифровыми договорами, защищая права покупателей и поставщиков.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Agreement 1 */}
            <div className="bg-white border border-slate-150 p-4 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Договор оферты коммерческого размещения</h4>
                <p className="text-[10px] text-slate-500 font-medium">Регулирует правила публикации товаров и базовый сервисный сбор 7%.</p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-[9px] text-emerald-600 font-black uppercase">✓ ПОДПИСАН</span>
                <button
                  onClick={() => setViewingCabinetContract('offer')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Читать договор
                </button>
              </div>
            </div>

            {/* Agreement 2 */}
            <div className="bg-white border border-slate-150 p-4 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Award size={20} />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Лицензионный договор платформы</h4>
                <p className="text-[10px] text-slate-500 font-medium">Дает право использовать торговую марку и ПО «Взаимопомощь» в коммерческих целях.</p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-[9px] text-emerald-600 font-black uppercase">✓ ПОДПИСАН</span>
                <button
                  onClick={() => setViewingCabinetContract('license')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Читать договор
                </button>
              </div>
            </div>

            {/* Agreement 3 */}
            <div className="bg-white border border-slate-150 p-4 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Договор доставки и логистических услуг</h4>
                <p className="text-[10px] text-slate-500 font-medium">Регулирует правила бесконтактной доставки и температурного комплаенса.</p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-[9px] text-emerald-600 font-black uppercase">✓ ПОДПИСАН</span>
                <button
                  onClick={() => setViewingCabinetContract('entrepreneur')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Читать договор
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SECURITY, IP CHECK & CANCELLATIONS LIMITS */}
      {activeTab === 'security' && (() => {
        const completedCount = historyOrders.filter(o => o.status === 'delivered').length;
        const cancelledCount = historyOrders.filter(o => o.status === 'cancelled').length;
        const totalDecided = completedCount + cancelledCount;
        const cancelRate = totalDecided > 0 ? (cancelledCount / totalDecided) * 100 : 0;
        
        const score = entrepreneur.status || 'green';
        const warnings = entrepreneur.warningsCount || 0;

        return (
          <div className="space-y-6 animate-fadeIn" id="cabinet_security_tab">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Compliance status card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${
                    score === 'green' ? 'bg-emerald-500' : score === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Ваш статус комплаенса</h4>
                </div>

                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  {score === 'green' && '✓ Отличный уровень надежности. Ваш профиль полностью доступен покупателям района.'}
                  {score === 'yellow' && '⚠ Внимание! Статус понижен из-за высокого процента отмен или жалоб. Исправьте качество услуг.'}
                  {score === 'red' && '🛑 Блокировка! Ваш профиль скрыт из каталога из-за нарушения лимитов отмен или попытки самовыкупа.'}
                </p>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Счетчик предупреждений:</p>
                  <div className="flex gap-1.5 mt-1">
                    {[1, 2, 3].map(w => (
                      <span key={w} className={`h-2.5 flex-1 rounded-full ${
                        w <= warnings ? 'bg-rose-600' : 'bg-slate-100'
                      }`} />
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold mt-1">При достижении 3 предупреждений наступает пожизненная блокировка.</p>
                </div>
              </div>

              {/* IP Anti-Fraud and self-buy */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Привязка IP и Анти-Фрод</h4>
                <div className="text-[11px] font-medium text-slate-600 space-y-2">
                  <p>
                    Ваш зарегистрированный IP адрес: <strong className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-brand-dark">{entrepreneur.ipAddress || '192.168.1.200'}</strong>
                  </p>
                  <p>
                    Система мониторинга безопасности автоматически сканирует IP-адреса покупателей. Попытка совершить покупку у самого себя (совпадение IP покупателя и продавца) мгновенно блокирует транзакцию и выносит вам штрафное предупреждение.
                  </p>
                </div>
              </div>
            </div>

            {/* Quality control and cancellations limits */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Показатели качества обслуживания (Quality Control)</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Выполнено заказов</p>
                  <p className="text-lg font-black text-emerald-700 mt-1">{completedCount}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Отменено заказов</p>
                  <p className="text-lg font-black text-rose-600 mt-1">{cancelledCount}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Уровень отмен (Rate)</p>
                  <p className={`text-lg font-black mt-1 ${cancelRate > 30 ? 'text-rose-600' : cancelRate > 20 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {cancelRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Штрафы за отмены</p>
                  <p className="text-lg font-black text-rose-700 mt-1">-{entrepreneur.fines || 0} ₽</p>
                </div>
              </div>

              <div className="bg-slate-50/50 border border-slate-150 p-3.5 rounded-xl text-[10px] text-slate-500 font-bold leading-relaxed">
                <span className="text-red-500">⚠ СИСТЕМА ШТРАФОВ ЗА ОТМЕНЫ:</span>
                <p className="mt-1 font-medium">
                  • Превышение 20% отмененных заказов переводит вас в Желтый комплаенс-статус.
                </p>
                <p className="font-medium">
                  • Превышение 30% отмененных заказов блокирует вашу точку и налагает безусловный штраф 500₽.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: TARIFF UPGRADE FLOW */}
      {upgradingTariff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-150 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-950 flex items-center gap-1">
                  <Sparkles size={20} className="text-indigo-600" />
                  <span>Переход на новый тариф</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">СберБизнес Защищенный эквайринг</p>
              </div>
              
              {paymentStep !== 'processing' && (
                <button
                  onClick={() => setUpgradingTariff(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {paymentStep === 'idle' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Тариф:</span>
                    <span className="text-indigo-600 uppercase font-black">
                      {upgradingTariff === 'basic' && 'Базовый'}
                      {upgradingTariff === 'pro' && 'PRO таун-лидер'}
                      {upgradingTariff === 'vip' && 'Районный VIP'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-150 pt-2 text-slate-800">
                    <span>Сумма к оплате:</span>
                    <span className="font-black font-mono">
                      {upgradingTariff === 'basic' && '500 ₽ / мес'}
                      {upgradingTariff === 'pro' && '1 500 ₽ / мес'}
                      {upgradingTariff === 'vip' && '5 000 ₽ / мес'}
                    </span>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-500 font-bold leading-normal bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/50">
                  ⚡ Переход на тариф PRO/VIP снимет ограничения на количество товаров в прайс-листе, предоставит приоритетное размещение в ленте жителей и снизит сервисную комиссию с продаж.
                </div>

                <button
                  onClick={handleStartSimulatedPayment}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Coins size={14} />
                  <span>Перейти к оплате</span>
                </button>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center py-6 space-y-4">
                <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-black text-slate-800 animate-pulse">{paymentStatusMsg}</p>
                <p className="text-[10px] text-slate-400 font-medium">Пожалуйста, не закрывайте окно оплаты</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">✓</div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 text-sm">Тариф успешно активирован!</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                    Новые условия размещения, приоритет выдачи и сниженная комиссия уже вступили в силу для вашей точки.
                  </p>
                </div>

                <button
                  onClick={() => setUpgradingTariff(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Вернуться в кабинет
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DETAILED CABINET AGREEMENT READER (WITH TRANSLATION FOR HUMANS) */}
      {viewingCabinetContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-150 space-y-6">
            <div className="flex justify-between items-start gap-4 border-b border-slate-150 pb-4">
              <div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ПРАВОВОЙ ЦЕНТР С ПЕРЕВОДОМ ДЛЯ ЛЮДЕЙ
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                  {viewingCabinetContract === 'offer' && '📄 Публичная оферта размещения и правила платформы'}
                  {viewingCabinetContract === 'license' && '📄 Лицензионный договор на право торговли'}
                  {viewingCabinetContract === 'entrepreneur' && '📄 Договор об оказании услуг и логистической доставке'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Слева — оригинальный юридический текст, справа — перевод на простой человеческий язык.
                </p>
              </div>
              <button
                onClick={() => setViewingCabinetContract(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Side-by-side translation clauses */}
            <div className="space-y-6 divide-y divide-slate-150 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
              {/* Clause 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 first:pt-0">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-indigo-900 uppercase font-mono tracking-wider">Пункт 1. Юридический оригинал</h4>
                  <p className="text-xs text-slate-800 leading-relaxed font-mono">
                    {viewingCabinetContract === 'offer' && '1.1. Настоящее соглашение регулирует условия предоставления Исполнителем облачного сервиса витрины и инструментов учета заказов для коммерческих лиц (Продавцов).'}
                    {viewingCabinetContract === 'license' && '1.1. Платформа предоставляет Лицензиату ограниченное право использования программного кода, логотипов и бренда «Взаимопомощь Устьяны» на территории выбранного района.'}
                    {viewingCabinetContract === 'entrepreneur' && '1.1. Продавец поручает Исполнителю организацию информационного сопровождения логистических маршрутов доставки товаров от точки забора до конечного Покупателя.'}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1.5">
                  <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                    💬 Понятным языком:
                  </h4>
                  <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                    {viewingCabinetContract === 'offer' && 'Вы получаете бесплатные инструменты в приложении для демонстрации своих товаров жителям и удобного сбора их заказов.'}
                    {viewingCabinetContract === 'license' && 'Вы имеете полное законное право работать под брендом «Взаимопомощь» и использовать наше готовое мобильное приложение.'}
                    {viewingCabinetContract === 'entrepreneur' && 'Мы автоматически прокладываем кратчайшие маршруты доставки к домам покупателей и рассчитываем оптимальное время.'}
                  </p>
                </div>
              </div>

              {/* Clause 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-indigo-900 uppercase font-mono tracking-wider">Пункт 2. Юридический оригинал</h4>
                  <p className="text-xs text-slate-800 leading-relaxed font-mono">
                    {viewingCabinetContract === 'offer' && '2.1. За предоставление сервисов витрины Продавец обязуется выплачивать вознаграждение в размере 7% от общей стоимости каждого успешно выполненного заказа.'}
                    {viewingCabinetContract === 'license' && '2.1. Оплата за использование лицензии осуществляется по подписочной модели в соответствии с тарифами: БАЗОВЫЙ (500 ₽/мес), PRO (1 500 ₽/мес), VIP (5 000 ₽/мес).'}
                    {viewingCabinetContract === 'entrepreneur' && '2.1. Доставка осуществляется силами Продавца или привлеченных курьеров-помощников в строгом соответствии с температурными требованиями к свежим продуктам.'}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1.5">
                  <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                    💬 Понятным языком:
                    </h4>
                  <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                    {viewingCabinetContract === 'offer' && 'Комиссия 7% берется только с тех заказов, которые вы успешно доставили и за которые получили деньги.'}
                    {viewingCabinetContract === 'license' && 'Пакеты оплаты фиксированы. Если вы переросли лимиты базового плана, вы можете перейти на PRO или VIP в любое время.'}
                    {viewingCabinetContract === 'entrepreneur' && 'Вы обязуетесь доставлять молоко, творог и мясо в чистоте и прохладе, чтобы они не испортились по дороге.'}
                  </p>
                </div>
              </div>

              {/* Clause 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-indigo-900 uppercase font-mono tracking-wider">Пункт 3. Юридический оригинал</h4>
                  <p className="text-xs text-slate-800 leading-relaxed font-mono">
                    {viewingCabinetContract === 'offer' && '3.1. В случае превышения лимита отмен принятых заказов (более 30%), Исполнитель оставляет за собой право блокировки учетной записи Продавца и взыскания штрафа в размере 500 рублей.'}
                    {viewingCabinetContract === 'license' && '3.1. Лицензиар обязуется обеспечивать работоспособность серверов, облачных бэкапов данных и предоставлять своевременные обновления безопасности приложения.'}
                    {viewingCabinetContract === 'entrepreneur' && '3.1. Все споры между покупателями и Продавцом разрешаются путем независимого арбитража Администратора платформы, чье решение является обязательным.'}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1.5">
                  <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                    💬 Понятным языком:
                  </h4>
                  <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                    {viewingCabinetContract === 'offer' && 'Если вы будете часто отменять уже подтвержденные заказы (больше 3 из 10), система может временно заблокировать вас, чтобы не подводить покупателей.'}
                    {viewingCabinetContract === 'license' && 'Мы полностью отвечаем за то, чтобы приложение работало стабильно круглые сутки без сбоев.'}
                    {viewingCabinetContract === 'entrepreneur' && 'Если покупатель останется недоволен качеством, модератор поможет честно рассудить спор в пользу правого.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-150 pt-4">
              <button
                onClick={() => setViewingCabinetContract(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer text-center font-extrabold"
              >
                Все условия понятны, закрыть договор
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
