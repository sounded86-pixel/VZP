import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, QrCode, Coins, Info, X, Gift, CheckCircle2, 
  Clock, ArrowRight, Percent, ShoppingBag, TrendingUp, 
  UserCheck, ShieldCheck, Trophy, Camera, Sparkles, HelpCircle 
} from 'lucide-react';
import { UserProfile, Entrepreneur } from '../types';
import { 
  getUserRankInfo, RANKS, REDEEM_OPTIONS, TOP_PRIZES, 
  ThanksQRCode, canGiveThanksToday, incrementThanksGivenToday 
} from '../utils/thanksHelper';
import { dbUpdateUserProfile, dbCreateThanksQRCode, dbUpdateThanksQRCode } from '../firebaseSync';

interface ThanksSystemHubProps {
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  entrepreneurs: Entrepreneur[];
  onUpdateEntrepreneur?: (entrId: string, updates: Partial<Entrepreneur>) => void;
  isOffline?: boolean;
}

const STORAGE_KEY_QR = 'thanks_active_qrcodes';
const STORAGE_KEY_USER_COUPONS = 'thanks_user_redeemed_coupons';

export function ThanksSystemHub({ 
  currentUser, 
  onUpdateUser, 
  entrepreneurs,
  onUpdateEntrepreneur,
  isOffline = false 
}: ThanksSystemHubProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'spend' | 'scan' | 'top' | 'about'>('progress');
  const [showRankList, setShowRankList] = useState(false);
  const [activeQRCodes, setActiveQRCodes] = useState<ThanksQRCode[]>([]);
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  
  // States for redeem & scan
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [selectedQRToScan, setSelectedQRToScan] = useState<string>('');

  const rankInfo = useMemo(() => {
    return getUserRankInfo(currentUser.thanksCount);
  }, [currentUser.thanksCount]);

  // Load active QR codes and user coupons from storage
  useEffect(() => {
    const qrs = localStorage.getItem(STORAGE_KEY_QR);
    if (qrs) {
      setActiveQRCodes(JSON.parse(qrs));
    } else {
      // Seed some initial mock QR codes for test scan
      const mockQRs: ThanksQRCode[] = [
        {
          id: 'qr_mock_1',
          entrepreneurId: 'entr_1',
          businessName: 'Пчеловод Иван (Октябрьский)',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          limitPercent: 10,
          discountDescription: 'Скидка 10% на свежий липовый мёд',
          pointsCharged: 15
        },
        {
          id: 'qr_mock_2',
          entrepreneurId: 'entr_2',
          businessName: 'Лавка «Устьянские Сувениры»',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          limitPercent: 10,
          discountDescription: 'Скидка 150 ₽ при покупке от 1500 ₽',
          pointsCharged: 25
        }
      ];
      localStorage.setItem(STORAGE_KEY_QR, JSON.stringify(mockQRs));
      setActiveQRCodes(mockQRs);
    }

    const coupons = localStorage.getItem(STORAGE_KEY_USER_COUPONS);
    if (coupons) {
      setUserCoupons(JSON.parse(coupons));
    }
  }, []);

  // Save QR Codes helper
  const saveQRCodes = (newQRs: ThanksQRCode[]) => {
    setActiveQRCodes(newQRs);
    localStorage.setItem(STORAGE_KEY_QR, JSON.stringify(newQRs));
  };

  // Spend Points (Redeem official system vouchers)
  const handleRedeem = (option: typeof REDEEM_OPTIONS[0]) => {
    if (currentUser.thanksCount < option.cost) {
      alert('⚠️ Недостаточно баллов на балансе.');
      return;
    }

    const newThanks = currentUser.thanksCount - option.cost;
    const spentPoints = (currentUser.rating?.spent || 0) + option.cost;
    const totalPoints = currentUser.rating?.total || currentUser.thanksCount;

    // Build the updated rating object for the user
    const updatedRating = {
      thanks: newThanks,
      total: totalPoints,
      rank: getUserRankInfo(newThanks).rank,
      spent: spentPoints
    };

    const updatedUser = {
      ...currentUser,
      thanksCount: newThanks,
      rating: updatedRating
    };

    // Update in React State
    onUpdateUser(updatedUser);

    // Save redeemed coupon locally
    const newCoupon = {
      id: `coupon_${Date.now()}`,
      title: option.title,
      cost: option.cost,
      code: `SPASIBO-${Math.floor(100000 + Math.random() * 900000)}`,
      redeemedAt: new Date().toISOString()
    };
    const updatedCoupons = [newCoupon, ...userCoupons];
    setUserCoupons(updatedCoupons);
    localStorage.setItem(STORAGE_KEY_USER_COUPONS, JSON.stringify(updatedCoupons));

    // Sync to firestore
    if (!isOffline) {
      dbUpdateUserProfile(currentUser.id, {
        thanksCount: newThanks,
        rating: updatedRating
      });
    }

    setRedeemSuccess(newCoupon.code);
    setTimeout(() => setRedeemSuccess(null), 8000);
  };

  // Simulate scanning of QR code
  const handleSimulateScan = () => {
    if (!selectedQRToScan) {
      alert('Пожалуйста, выберите QR-код для симуляции сканирования');
      return;
    }

    const targetQR = activeQRCodes.find(q => q.id === selectedQRToScan);
    if (!targetQR) {
      setScanState('error');
      setScanMessage('QR-код не найден в системе.');
      return;
    }

    // Check expiration (24h limit)
    const isExpired = new Date().getTime() > new Date(targetQR.expiresAt).getTime();
    if (isExpired) {
      setScanState('error');
      setScanMessage('Срок действия этого QR-кода истёк (действует 24 часа).');
      return;
    }

    // Check if already used
    if (targetQR.usedBy) {
      setScanState('error');
      setScanMessage('Этот одноразовый QR-код уже был использован ранее.');
      return;
    }

    if (currentUser.thanksCount < targetQR.pointsCharged) {
      setScanState('error');
      setScanMessage(`Недостаточно баллов. Требуется ${targetQR.pointsCharged}, у вас на балансе ${currentUser.thanksCount}.`);
      return;
    }

    setScanState('scanning');
    
    setTimeout(() => {
      // Deduct from User
      const newThanks = currentUser.thanksCount - targetQR.pointsCharged;
      const spentPoints = (currentUser.rating?.spent || 0) + targetQR.pointsCharged;
      const totalPoints = currentUser.rating?.total || currentUser.thanksCount;

      const updatedRating = {
        thanks: newThanks,
        total: totalPoints,
        rank: getUserRankInfo(newThanks).rank,
        spent: spentPoints
      };

      const updatedUser = {
        ...currentUser,
        thanksCount: newThanks,
        rating: updatedRating
      };

      onUpdateUser(updatedUser);

      // Save User Coupon (from QR code scan)
      const scannedCoupon = {
        id: `scanned_${Date.now()}`,
        title: `Скидка у предпринимателя: ${targetQR.businessName}`,
        cost: targetQR.pointsCharged,
        code: `DISCOUNT-QR-${targetQR.id.substring(3, 8).toUpperCase()}`,
        redeemedAt: new Date().toISOString(),
        isQR: true,
        businessName: targetQR.businessName,
        details: targetQR.discountDescription
      };
      
      const updatedCoupons = [scannedCoupon, ...userCoupons];
      setUserCoupons(updatedCoupons);
      localStorage.setItem(STORAGE_KEY_USER_COUPONS, JSON.stringify(updatedCoupons));

      // Mark QR code as used
      const updatedQRs = activeQRCodes.map(q => {
        if (q.id === targetQR.id) {
          return {
            ...q,
            usedBy: currentUser.id,
            usedAt: new Date().toISOString()
          };
        }
        return q;
      });
      saveQRCodes(updatedQRs);

      // Increment target entrepreneur points if handler is available
      if (onUpdateEntrepreneur && targetQR.entrepreneurId) {
        onUpdateEntrepreneur(targetQR.entrepreneurId, {
          // Addpoints to entrepreneur rating or total if available
        });
      }

      // Sync user profile to Firestore
      if (!isOffline) {
        dbUpdateUserProfile(currentUser.id, {
          thanksCount: newThanks,
          rating: updatedRating
        });
        dbUpdateThanksQRCode(targetQR.id, {
          usedBy: currentUser.id,
          usedAt: new Date().toISOString()
        });
      }

      setScanState('success');
      setScanMessage(`Успешно! Списано ${targetQR.pointsCharged} баллов. Получена скидка: "${targetQR.discountDescription}" у "${targetQR.businessName}"!`);
    }, 1800);
  };

  // Mock Top Users leaderboard based on spec rules (Quarterly top)
  const leaderboardUsers = useMemo(() => {
    // Generate a beautiful top 10 list combining some simulated active residents and the current user
    const baseCompetitors = [
      { name: "Степан Воробьев", village: "Октябрьский", points: 1420, rank: "🌟 Хранитель Устьян" },
      { name: "Николай Сидоров", village: "Шангалы", points: 840, rank: "👑 Легенда Устьян" },
      { name: "Анна Патракеева", village: "Ульяновская", points: 410, rank: "⭐ Лидер района" },
      { name: "Мария Попова", village: "Октябрьский", points: 285, rank: "⭐ Лидер района" },
      { name: "Дед Тимофей", village: "Едемское", points: 195, rank: "🌺 Народный герой" },
      { name: "Василий Шестаков", village: "Строевское", points: 95, rank: "🌳 Добрый сосед" },
      { name: "Ольга Захарова", village: "Шангалы", points: 64, rank: "🌳 Добрый сосед" },
      { name: "Тетя Клава", village: "Октябрьский", points: 42, rank: "🌿 Сосед" },
      { name: "Елена Вершинина", village: "Березник", points: 28, rank: "🌿 Сосед" }
    ];

    // Insert user
    const all = [
      ...baseCompetitors,
      { name: `${currentUser.name} (Вы)`, village: currentUser.village, points: currentUser.thanksCount, rank: rankInfo.rank }
    ];

    // Sort descending
    return all.sort((a, b) => b.points - a.points).slice(0, 10);
  }, [currentUser, rankInfo, currentUser.thanksCount]);

  // Max points user can spend at once
  const maxSpendAtOnce = Math.floor(currentUser.thanksCount * 0.1);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-5 sm:p-6 shadow-md" id="thanks_system_hub">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/60 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white shadow-sm shadow-amber-500/10">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5 font-display">
              Система Спасибо
              <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Рейтинг</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Ваша репутация и полезная активность в Устьянах</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-amber-100/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'progress' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-800 hover:bg-amber-100'}`}
          >
            🌱 Звание
          </button>
          <button 
            onClick={() => setActiveTab('spend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'spend' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-800 hover:bg-amber-100'}`}
          >
            🎁 Обмен баллов
          </button>
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'scan' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-800 hover:bg-amber-100'}`}
          >
            📷 Сканировать QR
          </button>
          <button 
            onClick={() => setActiveTab('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'top' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-800 hover:bg-amber-100'}`}
          >
            🏆 ТОП-10
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'about' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-800 hover:bg-amber-100'}`}
          >
            ❓ О проекте
          </button>
        </div>
      </div>

      {/* TAB CONTENTS */}
      {/* 1. PROGRESS TAB */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* User Rating Score Card */}
            <div className="bg-white border border-amber-200/60 rounded-2xl p-5 md:col-span-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100/40 to-orange-100/40 rounded-full blur-2xl"></div>
              <div>
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">Ваш текущий рейтинг</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-amber-900 tracking-tight">{currentUser.thanksCount}</span>
                  <span className="text-lg font-bold text-amber-700">«Спасибо»</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <span>Звание:</span>
                  <span className="text-amber-950 font-extrabold">{rankInfo.rank}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4">
                <p className="text-[11px] text-slate-500 font-medium">Доступность баллов:</p>
                <p className="text-sm font-extrabold text-emerald-850 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Все {currentUser.thanksCount} баллов доступны к использованию
                </p>
              </div>
            </div>

            {/* Next Rank Progress Card */}
            <div className="bg-white border border-amber-200/60 rounded-2xl p-5 md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Прогресс звания</span>
                    <h4 className="text-sm font-extrabold text-slate-800">До звания: {rankInfo.nextRank ? rankInfo.nextRank.rank : 'Максимальное звание! 🎉'}</h4>
                  </div>
                  {rankInfo.nextRank && (
                    <span className="text-xs bg-slate-50 border border-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-lg">
                      ещё {rankInfo.pointsNeeded} баллов
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-3.5 mt-3 relative overflow-hidden border border-slate-200/50">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${rankInfo.progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold mt-1.5 px-0.5">
                  <span>Текущий уровень: {rankInfo.minPoints}</span>
                  <span>{rankInfo.progressPercent}%</span>
                  <span>Следующий: {rankInfo.nextRank ? rankInfo.nextRank.minPoints : '∞'}</span>
                </div>
              </div>

              <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-extrabold text-emerald-800">Доступные привилегии звания:</h5>
                  <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                    {rankInfo.privilege}. {rankInfo.nextRank ? `Следующее звание откроет привилегию: "${rankInfo.nextRank.privilege}".` : 'Вы открыли все доступные привилегии проекта!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ranks Table Toggle */}
          <div className="bg-white border border-amber-200/60 rounded-2xl p-4">
            <button 
              onClick={() => setShowRankList(!showRankList)}
              className="w-full flex items-center justify-between text-left text-sm font-bold text-amber-900"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Посмотреть всю лестницу званий Устьян
              </span>
              <span className="text-xs bg-amber-50 text-amber-700 font-extrabold px-3 py-1 rounded-lg border border-amber-200/60">
                {showRankList ? 'Свернуть' : 'Развернуть'}
              </span>
            </button>

            {showRankList && (
              <div className="overflow-x-auto mt-4 border-t border-slate-100 pt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider">
                      <th className="pb-2 font-bold">Звание</th>
                      <th className="pb-2 font-bold text-center">Баллы</th>
                      <th className="pb-2 font-bold text-right">Почётная привилегия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {RANKS.map((r) => {
                      const isCurrent = rankInfo.level === r.level;
                      return (
                        <tr 
                          key={r.level} 
                          className={`hover:bg-slate-50/50 transition-all ${isCurrent ? 'bg-amber-50/60 font-extrabold text-amber-900 border-l-2 border-amber-600 pl-2' : 'text-slate-700'}`}
                        >
                          <td className="py-2.5 flex items-center gap-1.5 font-bold">
                            {r.rank} {isCurrent && <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold uppercase scale-90">Вы</span>}
                          </td>
                          <td className="py-2.5 text-center font-mono font-medium">{r.maxPoints === Infinity ? '1000+' : `${r.minPoints}-${r.maxPoints}`}</td>
                          <td className="py-2.5 text-right font-medium text-slate-600">{r.privilege}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SPEND TAB */}
      {activeTab === 'spend' && (
        <div className="space-y-5">
          {/* Spend Warning & Explanation */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-extrabold text-amber-900">Свободное использование баллов</h4>
              <p className="text-amber-800 leading-relaxed font-medium mt-1">
                Все ваши накопленные баллы «Спасибо» доступны к обмену без ограничений и лимитов. Вы можете использовать баланс на любые полезные сельские поощрения.
              </p>
            </div>
          </div>

          {/* Catalog of redeem items */}
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Доступные вознаграждения системы</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REDEEM_OPTIONS.map((opt) => {
                const canAfford = currentUser.thanksCount >= opt.cost;
                const isRedeemable = canAfford;

                return (
                  <div key={opt.id} className={`bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between transition-all ${isRedeemable ? 'hover:shadow-md hover:border-amber-300' : 'opacity-70'}`}>
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-2.5 items-center">
                          <span className="text-2xl">{opt.icon}</span>
                          <h5 className="font-extrabold text-slate-800 text-sm leading-snug">{opt.title}</h5>
                        </div>
                        <span className="shrink-0 text-xs bg-amber-100 text-amber-800 border border-amber-200/50 font-black px-2 py-1 rounded-lg">
                          {opt.cost} баллов
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{opt.description}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">
                        {!canAfford 
                          ? '❌ Недостаточно баллов' 
                          : '✅ Доступно'}
                      </span>
                      <button
                        disabled={!isRedeemable}
                        onClick={() => handleRedeem(opt)}
                        className={`text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer ${
                          isRedeemable 
                            ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Заказать
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success Coupon Dialog */}
          {redeemSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center animate-fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-md font-black text-emerald-900">Баллы успешно списаны!</h4>
              <p className="text-xs text-emerald-700 font-medium mt-1">Вам сгенерирован уникальный цифровой купон. Предъявите его при получении услуги:</p>
              <div className="my-3 py-3 px-4 bg-white border-2 border-dashed border-emerald-300 rounded-xl max-w-xs mx-auto">
                <span className="font-mono text-xl font-black text-slate-800 tracking-wider block">{redeemSuccess}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold">Купон сохранён в разделе ваших купонов ниже.</p>
            </div>
          )}

          {/* User Active Coupons Section */}
          {userCoupons.length > 0 && (
            <div className="bg-white border border-amber-200/60 rounded-2xl p-4 mt-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Gift className="w-4 h-4 text-amber-600" />
                Мои активные купоны ({userCoupons.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {userCoupons.map((c) => (
                  <div key={c.id} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-slate-800 block leading-tight">{c.title}</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">Код: <strong className="font-mono text-slate-700 text-xs font-extrabold">{c.code}</strong> • {new Date(c.redeemedAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-black px-2.5 py-1 rounded-lg">
                      Действителен
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SCAN TAB (QR scan simulation) */}
      {activeTab === 'scan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Visual camera scan box */}
            <div className="bg-slate-900 rounded-3xl p-5 md:col-span-6 flex flex-col items-center justify-center text-center text-white relative min-h-64 overflow-hidden border border-slate-800">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-lg"></div>

              {scanState === 'idle' && (
                <div className="space-y-3 z-10">
                  <div className="p-4 bg-slate-800/80 rounded-full inline-block text-amber-500 border border-slate-700/60 shadow-lg">
                    <Camera className="w-8 h-8 animate-pulse" />
                  </div>
                  <h4 className="text-md font-extrabold">Симулятор сканера QR</h4>
                  <p className="text-xs text-slate-400 max-w-xs font-medium">Выберите активный QR-код предпринимателя ниже для симуляции считывания его вашей камерой телефона.</p>
                </div>
              )}

              {scanState === 'scanning' && (
                <div className="space-y-3 z-10 w-full">
                  <div className="relative w-28 h-28 border border-dashed border-amber-400 mx-auto rounded-xl flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-amber-400 opacity-60" />
                    {/* Laser line effect */}
                    <div className="absolute left-0 right-0 h-1 bg-amber-500 shadow-md shadow-amber-500 animate-[bounce_2s_infinite]"></div>
                  </div>
                  <h4 className="text-md font-bold text-amber-400">Считывание кода...</h4>
                  <p className="text-xs text-slate-400">Идёт шифрованная верификация транзакции</p>
                </div>
              )}

              {scanState === 'success' && (
                <div className="space-y-3 z-10 p-2">
                  <div className="p-4 bg-emerald-500 text-white rounded-full inline-block shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-md font-extrabold text-emerald-400">Транзакция одобрена!</h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xs">{scanMessage}</p>
                  <button 
                    onClick={() => { setScanState('idle'); setScanMessage(''); }}
                    className="text-xs font-bold text-amber-400 hover:underline mt-2 cursor-pointer block mx-auto"
                  >
                    Сбросить сканер
                  </button>
                </div>
              )}

              {scanState === 'error' && (
                <div className="space-y-3 z-10 p-2">
                  <div className="p-4 bg-red-500 text-white rounded-full inline-block shadow-lg">
                    <X className="w-8 h-8" />
                  </div>
                  <h4 className="text-md font-extrabold text-red-400">Списание заблокировано</h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xs">{scanMessage}</p>
                  <button 
                    onClick={() => { setScanState('idle'); setScanMessage(''); }}
                    className="text-xs font-bold text-amber-400 hover:underline mt-2 cursor-pointer block mx-auto"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}
            </div>

            {/* Simulated scan controller */}
            <div className="bg-white border border-amber-200/60 rounded-3xl p-5 md:col-span-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Списание у партнёров
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                  Для теста системы выберите один из активных QR-кодов предпринимателей, созданных на платформе.
                </p>

                {/* Dropdown list of active QR codes in system */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Выберите QR-код:</label>
                  <select 
                    value={selectedQRToScan}
                    onChange={(e) => {
                      setSelectedQRToScan(e.target.value);
                      if (scanState !== 'idle') setScanState('idle');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Выберите активный купон партнёра --</option>
                    {activeQRCodes.map(q => {
                      const isUsed = !!q.usedBy;
                      return (
                        <option key={q.id} value={q.id} disabled={isUsed}>
                          {q.businessName} : {q.discountDescription} ({q.pointsCharged} Спасибо) {isUsed ? '[ИСПОЛЬЗОВАН]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <button
                  disabled={!selectedQRToScan || scanState === 'scanning'}
                  onClick={handleSimulateScan}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-sm py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode size={16} />
                  <span>Симулировать сканирование кода</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. LEADERBOARD TAB */}
      {activeTab === 'top' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Prize pool explanation */}
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-3xl p-5 md:col-span-5 text-white flex flex-col justify-between shadow-sm">
              <div>
                <Trophy className="w-10 h-10 text-yellow-300 mb-2 drop-shadow" />
                <h4 className="text-lg font-black tracking-tight font-display">Ежеквартальные призы</h4>
                <p className="text-xs text-amber-100/90 leading-relaxed font-medium mt-1">
                  Каждый квартал ТОП-10 жителей нашего района с самым большим рейтингом «Спасибо» делят призовой фонд реальных подарков и грантов!
                </p>
              </div>

              <div className="border-t border-white/20 pt-4 mt-4">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-200 block mb-2">Призовой фонд: 17 000 ₽ / квартал</span>
                <div className="space-y-1 text-xs">
                  {TOP_PRIZES.map((p, idx) => (
                    <div key={idx} className="flex justify-between font-bold text-white/95">
                      <span>{p.place}:</span>
                      <span className="text-yellow-300 font-mono">{p.prize}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white border border-amber-200/60 rounded-3xl p-5 md:col-span-7">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">ТОП-10 активных жителей Устьян</h4>
              <div className="space-y-2">
                {leaderboardUsers.map((u, index) => {
                  const isCurrentUser = u.name.includes('(Вы)');
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${isCurrentUser ? 'bg-amber-50 border border-amber-200 font-extrabold text-amber-900' : 'bg-slate-50/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400 font-black w-4 text-center">{index + 1}</span>
                        <div>
                          <span className="font-bold block text-slate-800">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">с. {u.village} • {u.rank}</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-amber-700 bg-amber-100/40 px-2 py-1 rounded-lg">
                        {u.points} ★
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ABOUT TAB */}
      {activeTab === 'about' && (
        <div className="bg-white border border-amber-200/60 rounded-3xl p-5 sm:p-6 space-y-4">
          <h4 className="text-md font-black text-slate-800 flex items-center gap-1.5 font-display border-b border-slate-100 pb-3">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            Что такое баллы «Спасибо» и как это работает?
          </h4>
          
          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            <p className="font-medium text-slate-700">
              «Каждый раз, когда вы помогаете соседу или получаете благодарность, вам начисляются баллы «Спасибо». Это наш способ сказать, что мы ценим вашу доброту и полезную активность.»
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
                <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-amber-800">
                  <TrendingUp className="w-4 h-4" />
                  Как заработать баллы:
                </h5>
                <ul className="space-y-1.5 font-medium list-disc pl-4 text-slate-600">
                  <li>Запуск при регистрации: <strong className="text-slate-800">5 «Спасибо»</strong></li>
                  <li>Закрытие дела (помощь соседу): <strong className="text-slate-800">1 «Спасибо»</strong></li>
                  <li>Получение благодарности от соседа: <strong className="text-slate-800">1 «Спасибо»</strong></li>
                  <li>Прохождение уроков цифровой школы: <strong className="text-slate-800">50 «Спасибо»</strong></li>
                  <li>Приведение друга по реферальной ссылке: <strong className="text-slate-800">10 «Спасибо»</strong></li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
                <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-emerald-800">
                  <Gift className="w-4 h-4" />
                  Как использовать баллы:
                </h5>
                <p className="text-slate-600 mb-2 font-medium">Ваш накопленный рейтинг определяет звание и даёт скидки на местном рынке:</p>
                <ul className="space-y-1 pl-4 list-disc font-medium text-slate-600">
                  <li>Входные билеты на праздники (30 баллов)</li>
                  <li>Скидки на продукты у местных мастеров и ИП</li>
                  <li>Услуги мастеров за баллы</li>
                  <li>Продвижение товаров для предпринимателей</li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 mt-2">
              <h5 className="font-extrabold text-red-950 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-700" />
                Строгий запрет на накрутки:
              </h5>
              <p className="text-red-900 leading-relaxed font-semibold">
                Запрещается начислять баллы за помощь самому себе или регистрировать дублирующие аккаунты. Каждая транзакция проходит автоматический аудит активности. Ограничение на благодарности — не более 3-х в день. Нарушители блокируются.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
