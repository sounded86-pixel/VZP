export interface RankInfo {
  level: number;
  rank: string;
  minPoints: number;
  maxPoints: number;
  privilege: string;
}

export const RANKS: RankInfo[] = [
  { level: 1, rank: "🌱 Новичок", minPoints: 0, maxPoints: 4, privilege: "Базовый доступ" },
  { level: 2, rank: "🤝 Помощник", minPoints: 5, maxPoints: 19, privilege: "Доступ к чатам" },
  { level: 3, rank: "🌿 Сосед", minPoints: 20, maxPoints: 49, privilege: "Приоритет в ленте" },
  { level: 4, rank: "🌳 Добрый сосед", minPoints: 50, maxPoints: 99, privilege: "Золотая метка" },
  { level: 5, rank: "🌺 Народный герой", minPoints: 100, maxPoints: 249, privilege: "Приглашение на мероприятия" },
  { level: 6, rank: "⭐ Лидер района", minPoints: 250, maxPoints: 499, privilege: "Приоритетная поддержка" },
  { level: 7, rank: "👑 Легенда", minPoints: 500, maxPoints: 999, privilege: "Именная благодарность" },
  { level: 8, rank: "🌟 Хранитель взаимопомощи", minPoints: 1000, maxPoints: Infinity, privilege: "Ежеквартальный приз" }
];

export function getUserRankInfo(points: number) {
  const currentPoints = points || 0;
  const currentRankIndex = RANKS.findIndex(r => currentPoints >= r.minPoints && currentPoints <= r.maxPoints);
  const currentRank = RANKS[currentRankIndex] || RANKS[0];
  
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  
  let progressPercent = 100;
  let pointsNeeded = 0;
  
  if (nextRank) {
    const range = nextRank.minPoints - currentRank.minPoints;
    const currentProgress = currentPoints - currentRank.minPoints;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
    pointsNeeded = nextRank.minPoints - currentPoints;
  }
  
  return {
    ...currentRank,
    nextRank,
    pointsNeeded,
    progressPercent
  };
}

export interface PrizeInfo {
  place: string;
  prize: string;
  budget: string;
}

export const TOP_PRIZES: PrizeInfo[] = [
  { place: "🥇 1 место", prize: "5 000 ₽", budget: "5 000 ₽" },
  { place: "🥈 2 место", prize: "3 000 ₽", budget: "3 000 ₽" },
  { place: "🥉 3 место", prize: "2 000 ₽", budget: "2 000 ₽" },
  { place: "4-10 места", prize: "1 000 ₽", budget: "7 000 ₽ (по 1000 ₽ каждому)" }
];

export interface RedeemOption {
  id: string;
  title: string;
  cost: number;
  description: string;
  icon: string;
}

export const REDEEM_OPTIONS: RedeemOption[] = [
  { id: "event_ticket", title: "Входной билет на местное мероприятие", cost: 30, description: "Билет на концерт, спектакль или выставку в ДК", icon: "🎟️" },
  { id: "business_discount", title: "Купон у местного ремесленника", cost: 50, description: "Купон при получении товаров или услуг у соседей", icon: "🛍️" },
  { id: "free_delivery", title: "Помощь с доставкой продуктов", cost: 25, description: "Доставка продуктов питания прямо к дому", icon: "🚚" },
  { id: "master_cert", title: "Сертификат на помощь мастера", cost: 100, description: "Полноценный купон на вызов мастера, ремонт или колку дров", icon: "🛠️" }
];

export const ENTREPRENEUR_REDEEM_OPTIONS = [
  { id: "promo_goods_5", title: "Рекомендация доброго дела", cost: 5, description: "Приоритетный показ просьбы о помощи на 3 дня", icon: "📈" },
  { id: "promo_goods_25", title: "Выделение объявления помощи", cost: 25, description: "Выделение важной просьбы рамкой на 7 дней", icon: "🚀" },
  { id: "promo_goods_100", title: "Доброе дело недели", cost: 100, description: "Размещение истории доброго дела на главном экране", icon: "🔥" },
  { id: "gold_badge", title: "Знак почётного соседа", cost: 200, description: "Особая почётная отметка в профиле", icon: "⭐" },
  { id: "vip_top3", title: "Доска почёта района", cost: 50, description: "Закрепление в списке активных помощников села", icon: "🏆" }
];

export interface ThanksQRCode {
  id: string;
  entrepreneurId: string;
  businessName: string;
  createdAt: string;
  expiresAt: string;
  limitPercent: number;
  discountDescription: string;
  pointsCharged: number;
  usedBy?: string;
  usedAt?: string;
}

export function canGiveThanksToday(senderId: string): boolean {
  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `thanks_given_limit_${senderId}_${todayStr}`;
  const count = parseInt(localStorage.getItem(storageKey) || "0", 10);
  return count < 3;
}

export function incrementThanksGivenToday(senderId: string) {
  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `thanks_given_limit_${senderId}_${todayStr}`;
  const count = parseInt(localStorage.getItem(storageKey) || "0", 10);
  localStorage.setItem(storageKey, (count + 1).toString());
}

