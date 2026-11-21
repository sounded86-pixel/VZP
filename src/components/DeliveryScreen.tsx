import React, { useState, useMemo } from 'react';
import { Entrepreneur, Order, Review, UserProfile, Dispute, FraudAlert } from '../types';
import { 
  getStoredEntrepreneurs, saveStoredEntrepreneurs,
  getStoredOrders, saveStoredOrders,
  getStoredReviews, saveStoredReviews,
  getStoredCurrentUserId, saveStoredCurrentUserId
} from '../mockData';

// Subcomponents
import DeliveryCatalog from './delivery/DeliveryCatalog';
import DeliveryForm from './delivery/DeliveryForm';
import DeliveryCheckout from './delivery/DeliveryCheckout';
import DeliveryCabinet from './delivery/DeliveryCabinet';
import DeliveryAdmin from './delivery/DeliveryAdmin';

// Icons
import { ClipboardList, ShoppingCart, UserCheck, Star, Clock, Check, AlertOctagon, Heart, Send, ShieldAlert, Globe, Truck, Award, Briefcase } from 'lucide-react';

interface DeliveryScreenProps {
  currentUser: UserProfile;
  isOffline: boolean;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  // Firestore hooks
  dbCreateOrderHook: (order: Order) => void;
  dbUpdateOrderHook: (orderId: string, updates: Partial<Order>) => void;
  dbCreateReviewHook: (review: Review) => void;
  dbCreateEntrepreneurHook: (entr: Entrepreneur) => void;
  dbUpdateEntrepreneurHook: (entrId: string, updates: Partial<Entrepreneur>) => void;
  onBack?: () => void;

  // Monetization & Fraud protection props
  currentUserIp?: string;
  setCurrentUserIp?: (ip: string) => void;
  disputes?: Dispute[];
  fraudAlerts?: FraudAlert[];
  dbCreateDisputeHook?: (dispute: Dispute) => void;
  dbCreateFraudAlertHook?: (alert: FraudAlert) => void;
}

// Safe dialog helper to prevent crashes in sandboxed iframe environments
const safeAlert = (msg: string) => {
  try {
    alert(msg);
  } catch (e) {
    console.warn("Alert blocked in sandbox environment:", msg);
  }
};

export default function DeliveryScreen({
  currentUser,
  isOffline,
  onUpdateUser,
  dbCreateOrderHook,
  dbUpdateOrderHook,
  dbCreateReviewHook,
  dbCreateEntrepreneurHook,
  dbUpdateEntrepreneurHook,
  onBack,
  currentUserIp = '192.168.1.101',
  setCurrentUserIp,
  disputes = [],
  fraudAlerts = [],
  dbCreateDisputeHook,
  dbCreateFraudAlertHook
}: DeliveryScreenProps) {
  // Navigation states: 'catalog' | 'register' | 'checkout' | 'cabinet' | 'admin' | 'my_orders'
  const [view, setView] = useState<'catalog' | 'register' | 'checkout' | 'cabinet' | 'admin' | 'my_orders'>('catalog');
  
  // Base Data loaded dynamically from localStorage or props
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>(() => getStoredEntrepreneurs());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [reviews, setReviews] = useState<Review[]>(() => getStoredReviews());

  // Selected entities for actions
  const [selectedSeller, setSelectedSeller] = useState<Entrepreneur | null>(null);
  
  // Rating states
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [disputeOpeningOrderId, setDisputeOpeningOrderId] = useState<string | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState('');
  const [rateTimeliness, setRateTimeliness] = useState(5);
  const [rateQuality, setRateQuality] = useState(5);
  const [ratePoliteness, setRatePoliteness] = useState(5);
  const [ratePriceFairness, setRatePriceFairness] = useState(5);
  const [rateComment, setRateComment] = useState('');
  const [rateAnonymous, setRateAnonymous] = useState(false);

  // Sync helpers
  const syncEntrepreneurs = (list: Entrepreneur[]) => {
    setEntrepreneurs(list);
    saveStoredEntrepreneurs(list);
  };

  const syncOrders = (list: Order[]) => {
    setOrders(list);
    saveStoredOrders(list);
  };

  const syncReviews = (list: Review[]) => {
    setReviews(list);
    saveStoredReviews(list);
  };

  // Find if current user is an entrepreneur
  const currentEntrepreneur = useMemo(() => {
    return entrepreneurs.find(e => e.userId === currentUser.id);
  }, [entrepreneurs, currentUser.id]);

  // Orders placed by current resident
  const myResidentOrders = useMemo(() => {
    return orders.filter(o => o.buyerId === currentUser.id);
  }, [orders, currentUser.id]);

  // Administrative check
  const isAdmin = useMemo(() => {
    return currentUser.role === 'main_admin' || currentUser.id === 'user_admin';
  }, [currentUser]);

  // Action: Submit Order
  const handlePlaceOrder = async (newOrder: Order) => {
    // 1. IP Check (matching entrepreneur IP -> block and warn)
    const seller = entrepreneurs.find(e => e.id === newOrder.entrepreneurId);
    if (seller) {
      const buyerIp = currentUserIp || '192.168.1.100';
      const sellerIp = seller.ipAddress || '192.168.1.200';
      
      // Stamp the buyer IP on the order
      newOrder.buyerIpAddress = buyerIp;

      if (buyerIp === sellerIp) {
        const warnings = (seller.warningsCount || 0) + 1;
        let newStatus: 'green' | 'yellow' | 'red' = 'yellow';
        
        // Log Fraud Alert
        const alertId = `frd_${Date.now()}`;
        const fAlert: FraudAlert = {
          id: alertId,
          userId: currentUser.id,
          userName: currentUser.name,
          userPhone: currentUser.phone,
          ipAddress: buyerIp,
          reason: `Попытка самовыкупа: совпадение IP адреса покупателя и продавца (${seller.businessName})`,
          severity: warnings >= 3 ? 'block' : 'warning',
          createdAt: new Date().toISOString()
        };
        
        if (dbCreateFraudAlertHook) {
          await dbCreateFraudAlertHook(fAlert);
        }

        if (warnings >= 3) {
          newStatus = 'red';
          await dbUpdateEntrepreneurHook(seller.id, {
            warningsCount: warnings,
            status: newStatus,
            isActive: false
          });
          onUpdateUser({ blocked: true });
          alert('ВНИМАНИЕ! Обнаружена систематическая попытка самовыкупа. Ваша учетная запись заблокирована системой безопасности.');
        } else {
          await dbUpdateEntrepreneurHook(seller.id, {
            warningsCount: warnings,
            status: newStatus
          });
          alert(`ЗАКАЗ ЗАБЛОКИРОВАН: Обнаружена попытка самовыкупа с совпадающего IP-адреса (${buyerIp}). Вынесено предупреждение (${warnings}/3).`);
        }
        return;
      }
    }

    // 2. Limit: 3 orders per day per user
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrdersCount = orders.filter(o => o.buyerId === currentUser.id && o.createdAt.startsWith(todayStr)).length;
    if (todayOrdersCount >= 3) {
      alert('Ошибка защиты от накрутки: Вы не можете сделать более 3 заказов в день.');
      return;
    }

    // 3. 7% Commission calculation (with 14 days trial checking)
    let isTrial = false;
    if (seller) {
      const isNew = !seller.trialStartDate;
      const trialStart = seller.trialStartDate ? new Date(seller.trialStartDate).getTime() : new Date(seller.createdAt || Date.now()).getTime();
      const trialEnd = trialStart + 14 * 24 * 60 * 60 * 1000;
      
      // If entrepreneur profile doesn't have trial fields initialized, let's lazy-initialize them
      if (isNew) {
        await dbUpdateEntrepreneurHook(seller.id, {
          tariff: 'free_trial',
          trialStartDate: new Date(trialStart).toISOString(),
          tariffExpiryDate: new Date(trialEnd).toISOString(),
          balance: seller.balance || 0,
          fines: seller.fines || 0,
          status: seller.status || 'green',
          warningsCount: seller.warningsCount || 0,
          ipAddress: seller.ipAddress || `192.168.1.${Math.floor(Math.random() * 200) + 10}`
        });
      }

      if (Date.now() < trialEnd) {
        isTrial = true;
      }
    }

    const rate = isTrial ? 0 : 7;
    const amount = isTrial ? 0 : parseFloat((newOrder.total * 0.07).toFixed(2));
    newOrder.commissionRate = rate;
    newOrder.commissionAmount = amount;

    const updatedOrders = [newOrder, ...orders];
    syncOrders(updatedOrders);
    dbCreateOrderHook(newOrder);
    setView('my_orders');
    alert(isTrial 
      ? 'Заказ успешно создан! Поставщик находится в пробном периоде (0% комиссия).' 
      : 'Заказ успешно создан! Поставщик свяжется с вами.'
    );
  };

  const handleCreateDispute = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const disputeId = `disp_${Date.now()}`;
    const newDispute: Dispute = {
      id: disputeId,
      orderId: order.id,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone || '',
      entrepreneurId: order.entrepreneurId,
      entrepreneurBusinessName: order.entrepreneurBusinessName,
      reason,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    if (dbCreateDisputeHook) {
      dbCreateDisputeHook(newDispute);
    }
    setDisputeOpeningOrderId(null);
    setDisputeReasonText('');
    alert('Спор по заказу успешно открыт! Администратор рассмотрит его в ближайшее время.');
  };

  // Action: Update Order Status (Entrepreneur actions)
  const handleUpdateOrderStatus = async (orderId: string, status: 'accepted' | 'delivering' | 'delivered' | 'cancelled') => {
    const list = orders.map(o => {
      if (o.id === orderId) {
        const updates: Partial<Order> = { status };
        if (status === 'delivered') {
          updates.actualDeliveryDate = new Date().toISOString().split('T')[0];
        }
        return { ...o, ...updates };
      }
      return o;
    });
    syncOrders(list);
    dbUpdateOrderHook(orderId, { status });

    // Handle monetization and security updates
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const seller = entrepreneurs.find(e => e.id === targetOrder.entrepreneurId);
    if (seller) {
      let currentBalance = seller.balance || 0;
      let currentFines = seller.fines || 0;
      let currentStatus: 'green' | 'yellow' | 'red' = seller.status || 'green';
      let warnings = seller.warningsCount || 0;

      // 1. Commission deduction
      if (status === 'delivered') {
        const commission = targetOrder.commissionAmount || 0;
        // Balance is updated: earnings added, commission deducted
        currentBalance = currentBalance + (targetOrder.total - commission);
      }

      // 2. Cancellation rate calculation
      // Get all historic orders of this seller (including the newly changed state in local list)
      const sellerOrders = list.filter(o => o.entrepreneurId === seller.id);
      const completed = sellerOrders.filter(o => o.status === 'delivered').length;
      const cancelled = sellerOrders.filter(o => o.status === 'cancelled').length;
      const totalDecided = completed + cancelled;

      let cancelRate = 0;
      if (totalDecided > 0) {
        cancelRate = (cancelled / totalDecided) * 100;
      }

      // Check limits
      if (totalDecided >= 3) { // only apply if they have at least 3 decided orders to prevent early false alerts
        if (cancelRate > 30) {
          currentStatus = 'red';
          currentFines += 500; // 500₽ fine
          currentBalance -= 500;
          
          // Log alert
          const alertId = `frd_${Date.now()}`;
          const fAlert: FraudAlert = {
            id: alertId,
            userId: seller.userId,
            userName: seller.businessName,
            ipAddress: seller.ipAddress || '127.0.0.1',
            reason: `Критический уровень отмен заказов: ${cancelRate.toFixed(1)}% (Лимит >30%). Блокировка и штраф 500₽.`,
            severity: 'block',
            createdAt: new Date().toISOString()
          };
          if (dbCreateFraudAlertHook) {
            await dbCreateFraudAlertHook(fAlert);
          }
          alert(`ВНИМАНИЕ: Уровень отмен составил ${cancelRate.toFixed(1)}% (>30%). Ваш профиль заблокирован, начислен штраф 500₽.`);
        } else if (cancelRate > 20) {
          currentStatus = 'yellow';
          alert(`Предупреждение комплаенс-контроля: Уровень отмен составляет ${cancelRate.toFixed(1)}% (>20%). Статус профиля понижен до ЖЕЛТОГО.`);
        } else {
          currentStatus = 'green';
        }
      }

      // Update in database
      await dbUpdateEntrepreneurHook(seller.id, {
        balance: currentBalance,
        fines: currentFines,
        status: currentStatus,
        warningsCount: warnings
      });
    }
  };

  // Action: Register/Edit Entrepreneur profile
  const handleSaveEntrepreneur = (savedEntr: Entrepreneur) => {
    let exists = false;
    const updated = entrepreneurs.map(e => {
      if (e.id === savedEntr.id) {
        exists = true;
        return savedEntr;
      }
      return e;
    });

    const final = exists ? updated : [...updated, savedEntr];
    syncEntrepreneurs(final);
    dbCreateEntrepreneurHook(savedEntr);
    setView('catalog');
    
    if (!exists) {
      alert('Ваша заявка отправлена на модерацию. Обычно проверка занимает до 1 часа.');
    } else {
      alert('Профиль бизнеса успешно обновлен!');
    }
  };

  // Action: Update Business settings (Cabinet)
  const handleUpdateBusinessSettings = (updates: Partial<Entrepreneur>) => {
    if (!currentEntrepreneur) return;
    const updated = entrepreneurs.map(e => {
      if (e.id === currentEntrepreneur.id) {
        return { ...e, ...updates };
      }
      return e;
    });
    syncEntrepreneurs(updated);
    dbUpdateEntrepreneurHook(currentEntrepreneur.id, updates);
  };

  // Action: Add Entrepreneur reply to a review
  const handleAddReviewReply = (reviewId: string, replyText: string) => {
    const updatedReviews = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, entrepreneurReply: replyText };
      }
      return r;
    });
    syncReviews(updatedReviews);
    dbCreateReviewHook(updatedReviews.find(r => r.id === reviewId)!);
  };

  // Action: Submit Review rating
  const handleSubmitReview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ratingOrder) return;

    if (!currentUser.isSimplifiedMode && rateComment.trim().length < 10) {
      safeAlert('Пожалуйста, напишите развернутый отзыв (минимум 10 символов)');
      return;
    }

    // Calculate average rating
    const average = Number(((rateTimeliness + rateQuality + ratePoliteness + ratePriceFairness) / 4).toFixed(1));

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      orderId: ratingOrder.id,
      buyerId: currentUser.id,
      buyerName: rateAnonymous ? 'Анонимный покупатель' : currentUser.name,
      entrepreneurId: ratingOrder.entrepreneurId,
      rating: average,
      comment: currentUser.isSimplifiedMode ? 'Спасибо за быструю доставку свежих продуктов!' : rateComment.trim(),
      categories: {
        timeliness: rateTimeliness,
        quality: rateQuality,
        politeness: ratePoliteness,
        priceFairness: ratePriceFairness
      },
      createdAt: new Date().toISOString()
    };

    // Save review
    const updatedReviews = [newReview, ...reviews];
    syncReviews(updatedReviews);
    dbCreateReviewHook(newReview);

    // Update order with reviewId
    const updatedOrders = orders.map(o => {
      if (o.id === ratingOrder.id) {
        return { ...o, reviewId: newReview.id };
      }
      return o;
    });
    syncOrders(updatedOrders);
    dbUpdateOrderHook(ratingOrder.id, { reviewId: newReview.id });

    // Recalculate entrepreneur average rating and on-time percentage
    const entrepreneurOrders = updatedOrders.filter(o => o.entrepreneurId === ratingOrder.entrepreneurId);
    const completedDelivered = entrepreneurOrders.filter(o => o.status === 'delivered');
    const entrepreneurReviews = updatedReviews.filter(r => r.entrepreneurId === ratingOrder.entrepreneurId);

    const newAvgRating = entrepreneurReviews.length > 0
      ? Number((entrepreneurReviews.reduce((sum, r) => sum + r.rating, 0) / entrepreneurReviews.length).toFixed(1))
      : 5.0;

    // Simulate on-time percentage (could be random or check scheduled dates, let's keep high)
    const onTimePct = completedDelivered.length > 0 ? 98 : 100;

    const finalEntrepreneurs = entrepreneurs.map(e => {
      if (e.id === ratingOrder.entrepreneurId) {
        return {
          ...e,
          rating: {
            average: newAvgRating,
            totalReviews: entrepreneurReviews.length,
            onTimePercentage: onTimePct
          }
        };
      }
      return e;
    });
    syncEntrepreneurs(finalEntrepreneurs);
    dbUpdateEntrepreneurHook(ratingOrder.entrepreneurId, {
      rating: {
        average: newAvgRating,
        totalReviews: entrepreneurReviews.length,
        onTimePercentage: onTimePct
      }
    });

    // Reset state
    setRatingOrder(null);
    setRateComment('');
    setRateTimeliness(5);
    setRateQuality(5);
    setRatePoliteness(5);
    setRatePriceFairness(5);
    
    safeAlert('Спасибо за ваш отзыв! Вы помогаете делать сервис лучше.');
  };

  // Admin moderation actions
  const handleApproveApplication = (entrId: string) => {
    const list = entrepreneurs.map(e => {
      if (e.id === entrId) {
        return { ...e, moderationStatus: 'approved' as const };
      }
      return e;
    });
    syncEntrepreneurs(list);
    dbUpdateEntrepreneurHook(entrId, { moderationStatus: 'approved' });
  };

  const handleRejectApplication = (entrId: string) => {
    const list = entrepreneurs.map(e => {
      if (e.id === entrId) {
        return { ...e, moderationStatus: 'rejected' as const };
      }
      return e;
    });
    syncEntrepreneurs(list);
    dbUpdateEntrepreneurHook(entrId, { moderationStatus: 'rejected' });
  };

  const handleToggleBlockEntrepreneur = (entrId: string) => {
    const list = entrepreneurs.map(e => {
      if (e.id === entrId) {
        return { ...e, isActive: !e.isActive };
      }
      return e;
    });
    syncEntrepreneurs(list);
    const item = list.find(e => e.id === entrId);
    if (item) {
      dbUpdateEntrepreneurHook(entrId, { isActive: item.isActive });
    }
  };

  const renderRatingStarsSelector = (categoryLabel: string, currentVal: number, setVal: (v: number) => void) => {
    return (
      <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs font-bold text-slate-700">
        <span>{categoryLabel}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setVal(star)}
              className="text-lg transition-all cursor-pointer focus:outline-none"
            >
              <Star 
                size={18} 
                className={star <= currentVal ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} 
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 space-y-6 animate-fadeIn" id="delivery_screen_module">
      
      {/* Security Monitoring & IP Simulator Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 to-brand-medium/10 border border-brand-medium/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-medium text-white p-2.5 rounded-xl">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">Система комплаенса и комнатного IP-тестирования</h4>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
              Проверка IP-адресов включена. Измените IP покупателя, чтобы сымитировать покупку у самого себя.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
            <Globe size={13} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500">Симулируемый IP:</span>
            <input
              type="text"
              value={currentUserIp}
              onChange={(e) => setCurrentUserIp?.(e.target.value)}
              className="text-xs font-mono font-bold text-brand-dark bg-transparent border-none focus:outline-none w-28"
            />
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentUserIp?.('192.168.1.101')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] rounded-lg transition-all"
            >
              Обычный житель
            </button>
            <button
              onClick={() => setCurrentUserIp?.('192.168.1.200')}
              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[9px] rounded-lg transition-all border border-red-200/50"
              title="Совпадает с IP по умолчанию первого зарегистрированного продавца"
            >
              IP Продавца (Фермера)
            </button>
          </div>
        </div>
      </div>

      {/* Module Title Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-slate-850">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-5 pointer-events-none">
          <Truck size={240} />
        </div>
        
        <div className="space-y-2 z-10">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 py-1.5 px-3 rounded-xl mb-1 border border-white/10 cursor-pointer font-black uppercase tracking-wider"
            >
              <span>← Назад в меню</span>
            </button>
          )}
          <h1 className="text-xl font-black flex items-center gap-2">
            <span>🚚 Продуктовый подвоз</span>
            <span className="bg-white/15 text-[9px] font-black px-2 py-0.5 rounded-full font-mono uppercase tracking-widest text-emerald-300">Модуль 7</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-xl">
            Полноценный маркетплейс свежей продукции фермеров и предпринимателей с доставкой на дом в отдаленные села Устьянского района.
          </p>
        </div>

        {/* Navigation buttons inside Header banner */}
        <div className="flex gap-2 shrink-0 z-10 w-full md:w-auto">
          <button
            onClick={() => setView('catalog')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
              view === 'catalog' ? 'bg-white text-slate-900 font-black' : 'bg-white/10 text-white hover:bg-white/15 border border-white/5'
            }`}
          >
            <ClipboardList size={14} />
            <span>Каталог лавок</span>
          </button>

          <button
            onClick={() => setView('my_orders')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 relative shadow-xs ${
              view === 'my_orders' ? 'bg-white text-slate-900 font-black' : 'bg-white/10 text-white hover:bg-white/15 border border-white/5'
            }`}
          >
            {myResidentOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center animate-bounce">
                {myResidentOrders.length}
              </span>
            )}
            <ShoppingCart size={14} />
            <span>Мои заказы</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW SWITCH */}

      {/* VIEW: CATALOG */}
      {view === 'catalog' && (
        <DeliveryCatalog
          entrepreneurs={entrepreneurs}
          currentUser={currentUser}
          reviews={reviews}
          onStartOrder={(entr) => {
            setSelectedSeller(entr);
            setView('checkout');
          }}
          onOpenCabinet={() => setView('cabinet')}
          onOpenRegistration={() => setView('register')}
          onOpenAdmin={() => setView('admin')}
          isEntrepreneurRegistered={!!currentEntrepreneur}
          isAdmin={isAdmin}
        />
      )}

      {/* VIEW: CREATE/EDIT REGISTRATION */}
      {view === 'register' && (
        <DeliveryForm
          currentUserId={currentUser.id}
          contactPhone={currentUser.phone}
          onSave={handleSaveEntrepreneur}
          onCancel={() => setView('catalog')}
          existingEntrepreneur={currentEntrepreneur}
        />
      )}

      {/* VIEW: STEP-BY-STEP CHECKOUT */}
      {view === 'checkout' && selectedSeller && (
        <DeliveryCheckout
          entrepreneur={selectedSeller}
          currentUser={currentUser}
          onSubmitOrder={handlePlaceOrder}
          onCancel={() => setView('catalog')}
        />
      )}

      {/* VIEW: CABINET CONTROL WORKSPACE */}
      {view === 'cabinet' && currentEntrepreneur && (
        <DeliveryCabinet
          entrepreneur={currentEntrepreneur}
          orders={orders}
          reviews={reviews}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdateBusiness={handleUpdateBusinessSettings}
          onAddReviewReply={handleAddReviewReply}
          onClose={() => setView('catalog')}
        />
      )}

      {/* VIEW: ADMIN DESK */}
      {view === 'admin' && isAdmin && (
        <DeliveryAdmin
          entrepreneurs={entrepreneurs}
          orders={orders}
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
          onToggleBlock={handleToggleBlockEntrepreneur}
          onClose={() => setView('catalog')}
        />
      )}

      {/* VIEW: RESIDENT ORDER LISTS */}
      {view === 'my_orders' && (
        <div className="space-y-4 max-w-2xl mx-auto" id="resident_orders_view">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            📜 Моя история заказов продуктов
          </h3>

          {myResidentOrders.length > 0 ? (
            <div className="space-y-4">
              {myResidentOrders.map(order => {
                const statusLabels: Record<string, string> = {
                  new: 'Новый (Ожидает)',
                  accepted: 'Принят поставщиком',
                  delivering: 'В пути к вам',
                  delivered: 'Доставлен на дом',
                  cancelled: 'Отклонён/Отменён'
                };

                const statusColors: Record<string, string> = {
                  new: 'bg-blue-50 text-blue-800 border-blue-200',
                  accepted: 'bg-yellow-50 text-yellow-800 border-yellow-250',
                  delivering: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse',
                  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-250',
                  cancelled: 'bg-red-50 text-red-800 border-red-200'
                };

                return (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Заказ у: {order.entrepreneurBusinessName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Дата доставки: {order.requestedDeliveryDate} ({order.requestedDeliveryTimeSlot})</p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>

                    {/* Receipt listing */}
                    <div className="text-xs font-bold text-slate-600 space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>• {it.item} (x{it.quantity} {it.unit})</span>
                          <span>{it.price * it.quantity} ₽</span>
                        </div>
                      ))}
                      <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between font-black text-slate-800">
                        <span>Итого (включая доставку):</span>
                        <span className="text-brand-medium">{order.total} ₽</span>
                      </div>
                    </div>

                    {/* Metadata coordinates */}
                    <div className="text-[10px] text-slate-500 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      📍 <strong>Адрес доставки:</strong> {order.deliveryAddress}
                    </div>

                    {/* Leave feedback trigger */}
                    {order.status === 'delivered' && !order.reviewId && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setRatingOrder(order)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-black px-4.5 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm uppercase tracking-wider animate-bounce"
                        >
                          <Star size={12} className="fill-white" />
                          <span>{currentUser.isSimplifiedMode ? 'Сказать спасибо поставщику' : 'Оценить заказ'}</span>
                        </button>
                      </div>
                    )}

                    {order.reviewId && (
                      <p className="text-[10px] text-emerald-800 font-black text-right">
                        ✓ Вы уже оставили отзыв об этой доставке. Спасибо!
                      </p>
                    )}

                    {/* Disputes System UI */}
                    {(() => {
                      const existingDispute = disputes.find(d => d.orderId === order.id);
                      if (existingDispute) {
                        return (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] font-medium text-amber-800 space-y-1 mt-2">
                            <div className="flex justify-between items-center font-bold">
                              <span>⚖️ Открыт официальный спор</span>
                              <span className="uppercase text-[9px] bg-amber-200 px-1.5 py-0.5 rounded-full">
                                {existingDispute.status === 'open' ? 'На рассмотрении' : `Решено: ${existingDispute.status}`}
                              </span>
                            </div>
                            <p className="text-[10px] text-amber-700 italic">Жалоба: "{existingDispute.reason}"</p>
                            {existingDispute.resolutionComment && (
                              <p className="text-[10px] text-slate-700 font-bold mt-1 bg-white p-1.5 rounded border border-amber-150">
                                Ответ арбитража: {existingDispute.resolutionComment}
                              </p>
                            )}
                          </div>
                        );
                      }

                      if (order.status === 'delivered' || order.status === 'cancelled') {
                        if (disputeOpeningOrderId === order.id) {
                          return (
                            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl mt-2 space-y-2">
                              <h5 className="text-[11px] font-black text-rose-800">Заполнение бланка претензии</h5>
                              <textarea
                                value={disputeReasonText}
                                onChange={(e) => setDisputeReasonText(e.target.value)}
                                placeholder="Опишите проблему подробно (товар поврежден, не привезен, неверная цена)..."
                                className="w-full px-3 py-2 border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none rounded-xl text-xs bg-white font-medium"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setDisputeOpeningOrderId(null)}
                                  className="px-2.5 py-1 text-slate-500 font-bold text-[10px] rounded hover:bg-slate-100"
                                >
                                  Отмена
                                </button>
                                <button
                                  onClick={() => {
                                    if (!disputeReasonText.trim()) { alert('Опишите суть претензии'); return; }
                                    handleCreateDispute(order.id, disputeReasonText);
                                  }}
                                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-sm"
                                >
                                  Отправить Арбитру
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setDisputeOpeningOrderId(order.id);
                                setDisputeReasonText('');
                              }}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 border border-rose-100 hover:border-rose-300 px-3 py-1.5 rounded-lg transition-all"
                            >
                              ⚖️ Открыть спор
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-white p-12 rounded-3xl border border-slate-100 space-y-3">
              <span className="text-4xl">🧾</span>
              <h4 className="text-base font-black text-slate-800">История заказов пуста</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Здесь будут отображаться ваши заказы продуктов. Сделайте свой первый заказ, выбрав поставщика в каталоге!
              </p>
              <button
                onClick={() => setView('catalog')}
                className="bg-brand-medium text-white px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer mt-2"
              >
                В каталог предпринимателей
              </button>
            </div>
          )}
        </div>
      )}

      {/* RATING MODAL (POPUP) */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border-4 border-amber-400 space-y-6 shadow-2xl">
            <div className="text-center">
              <span className="text-4xl">⭐</span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                {currentUser.isSimplifiedMode ? 'Сказать спасибо' : 'Оставить отзыв о подвозе'}
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                Поделитесь вашим мнением о заказе у {ratingOrder.entrepreneurBusinessName}
              </p>
            </div>

            {/* SIMPLIFIED RATING SCREEN FOR ELDERLY */}
            {currentUser.isSimplifiedMode ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-3 py-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-sm font-black text-slate-800">Общая оценка подвоза:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRateTimeliness(star);
                          setRateQuality(star);
                          setRatePoliteness(star);
                          setRatePriceFairness(star);
                        }}
                        className="text-4xl transition-all cursor-pointer animate-pulse"
                      >
                        <Star 
                          size={36} 
                          className={star <= rateTimeliness ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {rateTimeliness === 5 ? 'Отлично! Всё супер' : rateTimeliness === 4 ? 'Хорошо' : 'Нормально'}
                  </span>
                </div>

                <button
                  onClick={() => handleSubmitReview()}
                  className="w-full bg-emerald-650 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 shadow-md border-2 border-emerald-400 cursor-pointer uppercase tracking-wider animate-bounce"
                >
                  <Heart size={20} className="fill-white" />
                  <span>СКАЗАТЬ СПАСИБО</span>
                </button>
              </div>
            ) : (
              // STANDARD 4-CATEGORY FEEDBACK FORM
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1.5">
                  {renderRatingStarsSelector('🕒 Своевременность доставки', rateTimeliness, setRateTimeliness)}
                  {renderRatingStarsSelector('🍅 Качество и свежесть продуктов', rateQuality, setRateQuality)}
                  {renderRatingStarsSelector('🤝 Вежливость курьера', ratePoliteness, setRatePoliteness)}
                  {renderRatingStarsSelector('💰 Соответствие цены прайс-листу', ratePriceFairness, setRatePriceFairness)}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500">Комментарий (минимум 10 символов)</label>
                  <textarea
                    required
                    placeholder="Напишите, всё ли вам понравилось, были ли продукты свежими и т.д...."
                    value={rateComment}
                    onChange={(e) => setRateComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-none text-xs"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rate_anon"
                    checked={rateAnonymous}
                    onChange={(e) => setRateAnonymous(e.target.checked)}
                    className="h-4 w-4 text-brand-medium border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="rate_anon" className="text-[10px] text-slate-500 font-bold cursor-pointer">
                    Опубликовать отзыв анонимно
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setRatingOrder(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    Отмена
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-medium hover:bg-brand-medium/90 text-white font-extrabold rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Отправить отзыв</span>
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
