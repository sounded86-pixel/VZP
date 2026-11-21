import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  Review, 
  RideReview, 
  MasterReview 
} from '../types';
import { 
  Star, 
  Heart, 
  User, 
  Award, 
  Search, 
  ChevronLeft, 
  Plus, 
  Check, 
  Smile, 
  Users, 
  Truck, 
  Flame, 
  MessageSquare, 
  ThumbsUp, 
  Sparkles,
  MapPin,
  HelpCircle,
  Clock
} from 'lucide-react';

interface ReviewsScreenProps {
  currentUser: UserProfile;
  users: UserProfile[];
  reviews: Review[];
  rideReviews: RideReview[];
  masterReviews: MasterReview[];
  isOffline: boolean;
  onBack: () => void;
  dbCreateReviewHook: (review: Review) => Promise<void>;
  dbCreateMasterReviewHook: (review: MasterReview) => Promise<void>;
  dbCreateRideReviewHook: (review: RideReview) => Promise<void>;
  dbUpdateUserProfileHook: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
}

const BADGES = [
  { id: 'golden_hands', label: 'Золотые руки 🔨', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'life_saver', label: 'Выручил в беде 🆘', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'fast_response', label: 'Быстрый отклик ⚡', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'kind_soul', label: 'Душевный сосед 🤍', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  { id: 'honest_deal', label: 'Честная сделка 🤝', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'always_on_time', label: 'Вежливый водитель 🚗', color: 'bg-blue-50 text-blue-800 border-blue-200' },
];

export default function ReviewsScreen({
  currentUser,
  users,
  reviews,
  rideReviews,
  masterReviews,
  isOffline,
  onBack,
  dbCreateReviewHook,
  dbCreateMasterReviewHook,
  dbCreateRideReviewHook,
  dbUpdateUserProfileHook
}: ReviewsScreenProps) {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'neighbor' | 'master' | 'ride' | 'delivery'>('all');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [targetNeighborId, setTargetNeighborId] = useState('');
  const [reviewType, setReviewType] = useState<'neighbor' | 'master' | 'ride' | 'delivery'>('neighbor');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Parse & unify all review types for a single feed
  const unifiedReviews = useMemo(() => {
    const list: any[] = [];

    // 1. General neighbor thanks / delivery reviews (from 'reviews' collection)
    reviews.forEach(r => {
      const isNeighborThanks = r.orderId === 'neighbor';
      const targetUser = users.find(u => u.id === r.entrepreneurId);
      list.push({
        id: r.id,
        type: isNeighborThanks ? 'neighbor' : 'delivery',
        reviewerId: r.buyerId,
        reviewerName: r.buyerName || 'Житель',
        targetId: r.entrepreneurId,
        targetName: targetUser?.name || 'Местный житель',
        targetVillage: targetUser?.village || '',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        badge: isNeighborThanks ? r.categories?.priceFairness ? BADGES[r.categories.priceFairness % BADGES.length].label : 'Душевный сосед 🤍' : 'Свежие продукты 🍏'
      });
    });

    // 2. Master reviews
    masterReviews.forEach(r => {
      const targetUser = users.find(u => u.id === r.masterId);
      list.push({
        id: r.id,
        type: 'master',
        reviewerId: r.clientId,
        reviewerName: r.clientName || 'Заказчик',
        targetId: r.masterId,
        targetName: targetUser?.name || 'Мастер Устьян',
        targetVillage: targetUser?.village || '',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        badge: 'Золотые руки 🔨'
      });
    });

    // 3. Ride reviews
    rideReviews.forEach(r => {
      const targetUser = users.find(u => u.id === r.targetUserId);
      list.push({
        id: r.id,
        type: 'ride',
        reviewerId: r.reviewerUserId,
        reviewerName: r.reviewerName || 'Пассажир',
        targetId: r.targetUserId,
        targetName: targetUser?.name || 'Водитель',
        targetVillage: targetUser?.village || '',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        badge: 'Вежливый водитель 🚗'
      });
    });

    // Sort by newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, masterReviews, rideReviews, users]);

  // Leaders / Hall of Fame calculation
  const helperLeaders = useMemo(() => {
    return [...users]
      .filter(u => u.thanksCount > 0 && u.id !== 'admin')
      .sort((a, b) => b.thanksCount - a.thanksCount)
      .slice(0, 5);
  }, [users]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return unifiedReviews.filter(rev => {
      // Tab filter
      if (activeTab !== 'all' && rev.type !== activeTab) return false;

      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesComment = rev.comment?.toLowerCase().includes(q);
        const matchesReviewer = rev.reviewerName?.toLowerCase().includes(q);
        const matchesTarget = rev.targetName?.toLowerCase().includes(q);
        if (!matchesComment && !matchesReviewer && !matchesTarget) return false;
      }
      return true;
    });
  }, [unifiedReviews, activeTab, searchQuery]);

  // Handle Say Thank You submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNeighborId) return;
    setIsSubmitting(true);

    const targetUser = users.find(u => u.id === targetNeighborId);
    const newId = `review_${Date.now()}`;
    const isoString = new Date().toISOString();

    try {
      if (reviewType === 'neighbor' || reviewType === 'delivery') {
        const reviewObj: Review = {
          id: newId,
          orderId: reviewType === 'neighbor' ? 'neighbor' : `order_${Date.now()}`,
          entrepreneurId: targetNeighborId,
          buyerId: currentUser.id,
          buyerName: currentUser.name,
          rating: rating,
          comment: comment,
          categories: {
            timeliness: rating,
            quality: rating,
            politeness: rating,
            priceFairness: BADGES.findIndex(b => b.label === selectedBadge) || 3
          },
          createdAt: isoString
        };
        await dbCreateReviewHook(reviewObj);
      } else if (reviewType === 'master') {
        const masterReviewObj: MasterReview = {
          id: newId,
          orderId: `master_order_${Date.now()}`,
          masterId: targetNeighborId,
          clientId: currentUser.id,
          clientName: currentUser.name,
          rating: rating,
          comment: comment,
          categories: {
            quality: rating,
            timeliness: rating,
            politeness: rating,
            priceQuality: rating
          },
          isAnonymous: false,
          createdAt: isoString
        };
        await dbCreateMasterReviewHook(masterReviewObj);
      } else if (reviewType === 'ride') {
        const rideReviewObj: RideReview = {
          id: newId,
          rideOfferId: `ride_${Date.now()}`,
          reviewerUserId: currentUser.id,
          reviewerName: currentUser.name,
          targetUserId: targetNeighborId,
          rating: rating,
          comment: comment,
          categories: {
            punctuality: rating,
            drivingSafety: rating,
            carCleanliness: rating,
            politeness: rating
          },
          isAnonymous: false,
          createdAt: isoString
        };
        await dbCreateRideReviewHook(rideReviewObj);
      }

      // Gamification: Reward helpful neighbor by incrementing their thanksCount
      if (targetUser) {
        const currentCount = targetUser.thanksCount || 0;
        await dbUpdateUserProfileHook(targetNeighborId, {
          thanksCount: currentCount + 1
        });
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setShowWriteModal(false);
        setSubmitSuccess(false);
        // Reset form
        setComment('');
        setTargetNeighborId('');
        setSelectedBadge('');
      }, 2000);

    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReviewTypeLabel = (type: string) => {
    switch (type) {
      case 'neighbor': return 'Взаимопомощь 🤝';
      case 'master': return 'Мастер 🔧';
      case 'ride': return 'Поездка 🚗';
      case 'delivery': return 'Продавец/Доставка 📦';
      default: return 'Отзыв ⭐';
    }
  };

  const getReviewTypeColor = (type: string) => {
    switch (type) {
      case 'neighbor': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'master': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'ride': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'delivery': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans select-none" id="reviews_screen">
      
      {/* 📌 Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-medium font-extrabold text-sm transition-all cursor-pointer"
        >
          <ChevronLeft size={18} />
          Назад на главную
        </button>

        <button
          onClick={() => setShowWriteModal(true)}
          className="bg-brand-medium hover:bg-brand-medium/90 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border border-brand-medium/25 flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
        >
          <Plus size={16} />
          СКАЗАТЬ СПАСИБО
        </button>
      </div>

      {/* 🏆 Leaderboard / Bento style section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bento: Title & Stats Card */}
        <div 
          className="lg:col-span-1 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl relative overflow-hidden border"
          style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-medium) 100%)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <Heart size={150} className="fill-white stroke-white" />
          </div>

          <div className="relative z-10 space-y-2">
            <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Благодарность соседям
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
              ОТЗЫВЫ И СПАСИБО
            </h2>
            <p className="text-sm text-brand-light/95 font-semibold leading-snug">
              Здесь устьяки благодарят друг друга за реальные дела, хорошую работу и поддержку. Оставляйте добрые отзывы и получайте "Спасибо"!
            </p>
          </div>

          <div className="relative z-10 pt-4 flex gap-4 border-t border-white/10 mt-6 sm:mt-8">
            <div>
              <span className="text-[10px] font-black uppercase text-brand-light/85 block">Отзывов всего</span>
              <strong className="text-xl font-extrabold font-mono text-white">{unifiedReviews.length}</strong>
            </div>
            <div className="w-px bg-white/10"></div>
            <div>
              <span className="text-[10px] font-black uppercase text-brand-light/85 block">Участников</span>
              <strong className="text-xl font-extrabold font-mono text-white">{users.length}</strong>
            </div>
          </div>
        </div>

        {/* Bento: Hall of Fame Leaderboard */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Award className="text-brand-medium" size={18} />
                Доска почёта Устьянского района
              </h3>
              <span className="text-xs text-slate-400 font-bold">Лидеры по взаимовыручке</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {helperLeaders.length === 0 ? (
                <div className="col-span-5 text-center text-slate-400 py-4 text-xs">
                  Пока никто не получил спасибо. Будьте первыми!
                </div>
              ) : (
                helperLeaders.map((u, index) => {
                  const placeColors = [
                    'from-yellow-100 to-amber-100 border-yellow-200 text-amber-800',
                    'from-slate-100 to-slate-200 border-slate-300 text-slate-800',
                    'from-amber-50 to-orange-100 border-orange-200 text-orange-800',
                    'from-brand-light/20 to-brand-light/40 border-brand-medium/20 text-brand-dark',
                    'from-purple-50 to-purple-100 border-purple-200 text-purple-800'
                  ];

                  return (
                    <div 
                      key={u.id}
                      className={`rounded-2xl p-3 border flex flex-col items-center text-center justify-between shadow-xs bg-gradient-to-b ${placeColors[index] || 'from-slate-50 to-slate-100 border-slate-200'}`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-sm shadow-sm border border-black/5">
                          {u.name?.charAt(0) || "Ж"}
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-medium text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                          {index + 1}
                        </span>
                      </div>

                      <div className="mt-2">
                        <h4 className="text-xs font-black line-clamp-1 leading-tight text-slate-800">{u.name}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">{u.village}</p>
                      </div>

                      <div className="mt-2 bg-white/75 border border-black/5 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-2xs">
                        <Star size={9} className="fill-brand-medium text-brand-medium" />
                        <span>★ {u.thanksCount}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles size={14} className="text-brand-medium animate-pulse" />
            <span>Каждое спасибо повышает рейтинг на доске почёта. Настоящие герои живут рядом с нами!</span>
          </div>
        </div>
      </div>

      {/* 🔍 Search and Filters panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Поиск по тексту отзыва, автору или получателю..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-sm transition-all"
            />
          </div>

          {/* Quick tab filters */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                activeTab === 'all'
                  ? "bg-brand-medium text-white border-brand-medium shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Все отзывы
            </button>
            <button
              onClick={() => setActiveTab('neighbor')}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                activeTab === 'neighbor'
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Взаимопомощь 🤝
            </button>
            <button
              onClick={() => setActiveTab('master')}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                activeTab === 'master'
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Мастера 🔧
            </button>
            <button
              onClick={() => setActiveTab('ride')}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                activeTab === 'ride'
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Поездки 🚗
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                activeTab === 'delivery'
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Доставка 📦
            </button>
          </div>
        </div>
      </div>

      {/* 📋 Main Adaptive Grid feed */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <HelpCircle size={48} className="text-slate-300 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-slate-700">Отзывы не найдены</h4>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            В выбранной категории отзывов пока нет или они не соответствуют условиям поиска. Оставьте первый отзыв!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="reviews_feed_grid">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((rev) => {
              const isLocal = rev.targetVillage === currentUser.village;

              return (
                <motion.div
                  key={rev.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isLocal 
                      ? "border-brand-medium/50 bg-brand-light/10 hover:bg-brand-light/20" 
                      : "border-slate-200 hover:border-brand-medium/40"
                  }`}
                  id={`review_card_${rev.id}`}
                >
                  <div>
                    {/* Category & Badge Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getReviewTypeColor(rev.type)}`}>
                          {getReviewTypeLabel(rev.type)}
                        </span>
                        {rev.badge && (
                          <span className="px-2.5 py-1 bg-brand-light/30 border border-brand-light text-brand-dark text-[10px] font-black rounded-lg">
                            {rev.badge}
                          </span>
                        )}
                      </div>
                      {isLocal && (
                        <span className="bg-brand-medium text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs shrink-0">
                          Рядом с вами!
                        </span>
                      )}
                    </div>

                    {/* Recipient / target user */}
                    <div className="flex items-center gap-3 bg-brand-bg/50 border border-brand-light/30 p-3 rounded-2xl mb-4">
                      <div className="w-9 h-9 rounded-full bg-brand-light/40 text-brand-dark flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0 border border-brand-light/60">
                        {rev.targetName?.charAt(0) || "У"}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-brand-medium font-black block">Кому спасибо:</span>
                        <strong className="text-sm text-slate-800 font-extrabold">{rev.targetName}</strong>
                        <span className="text-[10px] text-slate-500 font-bold ml-1.5">(с. {rev.targetVillage})</span>
                      </div>
                    </div>

                    {/* Stars block */}
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <Star 
                          key={starValue} 
                          size={15} 
                          className={starValue <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} 
                        />
                      ))}
                      <span className="text-xs text-slate-400 font-bold ml-2 font-mono">
                        {rev.rating.toFixed(1)} / 5.0
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-slate-600 leading-relaxed italic mb-4">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Footer of card */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <span>От: <strong className="text-slate-700 font-bold">{rev.reviewerName}</strong></span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-[10px] text-slate-400">
                      <Clock size={11} />
                      <span>{formatDate(rev.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ✍️ Modal Dialog: Write Review / Say Thank You */}
      {showWriteModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="write_review_modal">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {submitSuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-brand-light/30 text-brand-medium rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce border border-brand-light/60">
                  ✨
                </div>
                <h3 className="text-xl font-black text-slate-800">СПАСИБО ОТПРАВЛЕНО!</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Ваш отзыв успешно опубликован в ленте. Соседу начислен балл благодарности на доску почёта!
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Heart className="text-brand-medium fill-brand-medium" size={20} />
                      Сказать спасибо соседу
                    </h4>
                    <p className="text-xs text-slate-500">
                      Отметьте человека, который оказал вам помощь, хорошо выполнил работу или подвез до деревни.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowWriteModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4" id="review_submit_form">
                  {/* Select neighbor */}
                  <div>
                    <label className="block text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5">
                      1. Выберите соседа / помощника
                    </label>
                    <select
                      value={targetNeighborId}
                      onChange={(e) => setTargetNeighborId(e.target.value)}
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none bg-white font-bold"
                    >
                      <option value="">-- Выберите жителя из списка --</option>
                      {users
                        .filter(u => u.id !== currentUser.id && u.id !== 'admin')
                        .map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} (с. {u.village} • {u.role === 'master' ? 'Мастер' : u.role === 'entrepreneur' ? 'Предприниматель' : 'Житель'})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Choose module type */}
                  <div>
                    <label className="block text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5">
                      2. За какую услугу благодарим?
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setReviewType('neighbor')}
                        className={`p-2.5 rounded-xl border-2 text-left font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                          reviewType === 'neighbor' 
                            ? 'bg-teal-50 border-teal-500 text-teal-800' 
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🤝 Взаимопомощь
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewType('master')}
                        className={`p-2.5 rounded-xl border-2 text-left font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                          reviewType === 'master' 
                            ? 'bg-amber-50 border-amber-500 text-amber-800' 
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🔧 Мастер на час
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewType('ride')}
                        className={`p-2.5 rounded-xl border-2 text-left font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                          reviewType === 'ride' 
                            ? 'bg-blue-50 border-blue-500 text-blue-800' 
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🚗 Поездка / Водитель
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewType('delivery')}
                        className={`p-2.5 rounded-xl border-2 text-left font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                          reviewType === 'delivery' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        📦 Товар / Продавец
                      </button>
                    </div>
                  </div>

                  {/* Star Rating selection */}
                  <div>
                    <label className="block text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5">
                      3. Поставьте общую оценку
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          className="p-1.5 text-yellow-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        >
                          <Star size={30} className={val <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                        </button>
                      ))}
                      <span className="text-sm font-black text-slate-700 ml-2">
                        {rating} из 5 звёзд
                      </span>
                    </div>
                  </div>

                  {/* Gratitude Badges */}
                  <div>
                    <label className="block text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5">
                      4. Выберите медаль / значок (необязательно)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {BADGES.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBadge(b.label === selectedBadge ? '' : b.label)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                            b.label === selectedBadge
                              ? 'bg-brand-medium text-white border-brand-medium shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text comments */}
                  <div>
                    <label className="block text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5">
                      5. Напишите тёплые слова благодарности
                    </label>
                    <textarea
                      required
                      minLength={10}
                      maxLength={500}
                      rows={3}
                      placeholder="Опишите, чем именно вам помог сосед. Например: 'Николай быстро приехал на тракторе и расчистил въезд к дому от снега. Огромное человеческое спасибо!'"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-2xl text-sm focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none bg-white leading-relaxed"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold block text-right mt-1">
                      Минимум 10 символов
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || isOffline}
                      className="w-full bg-brand-medium hover:bg-brand-medium/90 disabled:bg-slate-200 text-white font-extrabold text-sm py-3 rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Отправка спасибо...</span>
                      ) : isOffline ? (
                        <span>Вы не в сети (недоступно)</span>
                      ) : (
                        <>
                          <Check size={16} />
                          ОТПРАВИТЬ "СПАСИБО" COCEДУ
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
