export interface Village {
  name: string;
  distance: number; // Distance in km from the administrative center (Oktyabrsky)
  settlement?: string;
  lat?: number;
  lng?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  village: string; // must be one of the Ustyany villages (kept for backward compatibility, mapped to location.village)
  location?: {
    country: string;
    region: string;
    district: string;
    village: string;
  };
  regionCode?: string;
  districtCode?: string;
  villageCode?: string;
  skills: string[]; // ids of skills
  thanksCount: number; // rating "Спасибо"
  rating?: {
    thanks: number;        // текущий баланс
    total: number;         // всего за всё время
    rank: string;          // текущее звание
    spent: number;         // сколько потрачено
  };
  achievements?: string[];  // полученные звания
  referrals?: {
    code: string;          // уникальный код (например, UST-1234-ABC)
    referredBy?: string;   // ID пользователя, который пригласил
    total?: number;        // количество приведённых друзей
    totalEarnedPoints?: number; // всего баллов заработано по реферальной системе
    history?: {            // детальная статистика приведённых пользователей
      userId: string;
      userName: string;
      userRole: string;
      pointsEarned: number;
      date: string;
      upgrades?: {
        tariff: 'pro' | 'vip';
        pointsEarned: number;
        date: string;
      }[];
    }[];
  };
  createdCount: number;
  resolvedCount: number;
  blocked: boolean;
  reportsCount: number;
  role?: 'resident' | 'master' | 'entrepreneur' | 'admin' | 'developer' | 'main_admin' | 'village_admin' | 'user' | 'parent' | 'grandparent' | 'child' | 'elderly' | 'partner';
  adminVillage?: string;
  age?: number;
  whoInstalled?: string;
  primaryGoal?: string;
  isSimplifiedMode?: boolean;
  isCozyTheme?: boolean;
  profileType?: string;
  tariff?: 'basic' | 'pro' | 'vip' | null;
  tariffValidUntil?: string | null;
  tariffAutoRenew?: boolean;
  family?: {
    children: string[];
    parents: string[];
    grandparents: string[];
    grandchildren: string[];
  };
  isMaster?: boolean;
  isEntrepreneur?: boolean;
  tariffHistory?: {
    tariff: 'basic' | 'pro' | 'vip';
    activatedAt: string;
    validUntil: string;
    price: number;
  }[];
  roles?: {
    isProfessional: boolean;
    isCraftsman: boolean;
    isWorker: boolean;
    isGovernment: boolean;
    isAgriculture: boolean;
    isArt: boolean;
    isLogistics: boolean;
    isHealth: boolean;
    isEducation: boolean;
    isDigital: boolean;
  };
  categories?: {
    main: string;
    sub: string;
    skills: string[];
  }[];
  skillNames?: string[];
  childProfile?: {
    childName: string;
    childAge: number;
    level: number;
    stars: number;
    dobriks: number;
    achievements: string[];
    completedTopics: string[];
    completedEcoTasks: string[];
    friends: { id: string; name: string; age: number; village: string; lastMessage?: string }[];
    settings: {
      bedtime: string;
      geoRadius: number;
      chatEnabled: boolean;
      timeLimit: number;
    };
    tasks: {
      id: string;
      description: string;
      reward: number;
      isCompleted: boolean;
      isApproved: boolean;
      createdAt: string;
    }[];
    drawings: { id: string; title: string; date: string; dataUrl: string }[];
    calendarEvents: { id: string; title: string; date: string; icon: string }[];
    diaryEntries: { id: string; text: string; date: string; approved: boolean }[];
    messages: { id: string; friendId: string; text: string; isSentByChild: boolean; createdAt: string }[];
    alerts?: { id: string; text: string; time: string; type: 'sos' | 'task' | 'achievement' | 'lesson' | 'info' }[];
  };
  elderlyProfile?: {
    fullName: string;
    level: number; // 1-5
    completedLessons: string[]; // lesson ID strings
    stars: number;
    achievements: string[]; // achievement ID strings
    volunteerContact: string; // volunteer name/ID
    phoneContacts: {
      name: string;
      phone: string;
      role: 'son' | 'daughter' | 'grandson' | 'granddaughter' | 'neighbor' | 'other';
    }[];
    learningProgress: {
      lessonId: string;
      completedAt: string;
      rating: number; // 1-5
    }[];
    diaryEntries?: {
      id: string;
      lessonId: string;
      lessonTitle: string;
      text: string;
      date: string;
      photo?: string;
    }[];
    settings: {
      fontSize: number; // 18, 22, 26, etc.
      highContrast: boolean;
      voiceGuidance: boolean;
      audioVolume: number;
    };
  };
  digitalLiteracy?: {
    completed_lessons: number[];
    total_reward: number;
    started_at: string | null;
    completed_at: string | null;
  };
  preferences?: {
    theme?: string;
    autoTheme?: boolean;
  };
}

export interface HelpRequestCounterOffer {
  id: string;
  masterId: string;
  masterName: string;
  price: number | string;
  comment?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  category: string; // e.g., 'wood', 'tractor', 'carpentry', etc.
  description: string;
  photos: string[]; // base64 or placeholder URLs (up to 3)
  authorId: string;
  authorName: string;
  authorPhone: string; // shown only in chat
  authorRating: number;
  village: string;
  locationDetails?: string; // e.g., street, house number, or map coords
  createdAt: string; // ISO string
  active: boolean; // false if resolved
  reportsCount: number;
  offeredPrice?: string; // e.g., 'Бесплатно, по-соседски', '100 ₽', '200 ₽', '500 ₽', '1000 ₽', '350 ₽'
  offeredPriceType?: 'free' | '100' | '200' | '500' | '1000' | 'custom';
  counterOffers?: HelpRequestCounterOffer[];
}

export interface Chat {
  id: string;
  postId: string;
  postTitle: string;
  postCategory: string;
  authorId: string; // owner of the request
  responderId: string; // person offering help
  lastMessageText: string;
  lastMessageTime: string;
  unreadCountAuthor: number;
  unreadCountResponder: number;
  resolved: boolean; // marked resolved inside this chat
  ratingGivenByAuthor: boolean;
  ratingGivenByResponder: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  photo?: string; // compressed base64 if sent
  createdAt: string;
}

export interface Complaint {
  id: string;
  targetId: string; // id of post or user
  targetType: 'post' | 'user';
  reporterId: string;
  reporterName: string;
  reason: string;
  createdAt: string;
  resolved: boolean;
  // New "Общественный контроль" fields
  authorId?: string;
  authorName?: string;
  targetName?: string;
  category?: 'insult' | 'spam' | 'fake' | 'obligation' | 'vandalism' | 'bullying' | 'other';
  description?: string;
  evidence?: string[];
  status?: 'new' | 'moderation' | 'approved' | 'rejected';
  penalty?: {
    type: 'warning' | 'fine' | 'block' | 'permanent';
    amount?: number;
    duration?: number;
  };
  moderatorId?: string;
  resolution?: string;
  resolvedAt?: string;
}

export const SETTLEMENT_COORDINATES: Record<string, { lat: number, lng: number }> = {
  "Березницкое сельское поселение": { lat: 61.3524, lng: 43.1495 },
  "Бестужевское сельское поселение": { lat: 61.4233, lng: 43.4113 },
  "Дмитриевское сельское поселение": { lat: 61.3120, lng: 42.8250 },
  "Илезское сельское поселение": { lat: 61.0505, lng: 44.3121 },
  "Киземское сельское поселение": { lat: 61.1189, lng: 44.8315 },
  "Лихачевское сельское поселение": { lat: 60.7711, lng: 43.1558 },
  "Лойгинское сельское поселение": { lat: 61.0253, lng: 44.6212 },
  "Малодорское сельское поселение": { lat: 61.1558, lng: 42.5855 },
  "Октябрьское городское поселение": { lat: 61.1567, lng: 43.1642 },
  "Орловское сельское поселение": { lat: 61.0820, lng: 42.4410 },
  "Плосское сельское поселение": { lat: 61.0510, lng: 42.8520 },
  "Ростовско-Минское сельское поселение": { lat: 61.1075, lng: 43.1258 },
  "Синицкое сельское поселение": { lat: 61.2720, lng: 43.8550 },
  "Строевское сельское поселение": { lat: 61.4883, lng: 42.6710 },
  "Череновское сельское поселение": { lat: 61.0520, lng: 43.3440 },
  "Шангальское сельское поселение": { lat: 61.1821, lng: 43.4474 }
};

export function getVillageCoords(v: Village): { lat: number; lng: number } {
  const base = SETTLEMENT_COORDINATES[v.settlement || ""] || SETTLEMENT_COORDINATES["Октябрьское городское поселение"];
  
  // Use a simple deterministic hash from the village name to offset the coordinates slightly
  let hash = 0;
  for (let i = 0; i < v.name.length; i++) {
    hash = v.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use smaller offsets (approx. 1-2 km) to ensure they stay strictly within their actual geographic areas
  const latOffset = ((hash & 0xFF) / 255 - 0.5) * 0.015;
  const lngOffset = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.03;
  
  return {
    lat: base.lat + latOffset,
    lng: base.lng + lngOffset
  };
}

export const USTYANY_VILLAGES: Village[] = [
  // Березницкое сельское поселение
  { name: "Бережная (Березницкое)", distance: 26, settlement: "Березницкое сельское поселение" },
  { name: "Березник", distance: 25, settlement: "Березницкое сельское поселение" },
  { name: "Богдановский", distance: 28, settlement: "Березницкое сельское поселение" },
  { name: "Бор", distance: 24, settlement: "Березницкое сельское поселение" },
  { name: "Вежа", distance: 32, settlement: "Березницкое сельское поселение" },
  { name: "Горылец", distance: 30, settlement: "Березницкое сельское поселение" },
  { name: "Дудино", distance: 27, settlement: "Березницкое сельское поселение" },
  { name: "Едьма", distance: 22, settlement: "Березницкое сельское поселение" },
  { name: "Задорье", distance: 29, settlement: "Березницкое сельское поселение" },
  { name: "Зыково", distance: 31, settlement: "Березницкое сельское поселение" },

  // Бестужевское сельское поселение
  { name: "Акичкин Починок", distance: 54, settlement: "Бестужевское сельское поселение" },
  { name: "Аксеновская", distance: 55, settlement: "Бестужевское сельское поселение" },
  { name: "Андреев Починок", distance: 56, settlement: "Бестужевское сельское поселение" },
  { name: "Бережная (Бестужевское)", distance: 53, settlement: "Бестужевское сельское поселение" },
  { name: "Бестужево", distance: 52, settlement: "Бестужевское сельское поселение" },
  { name: "Веригинская (Бестужевское)", distance: 51, settlement: "Бестужевское сельское поселение" },
  { name: "Глубокий", distance: 48, settlement: "Бестужевское сельское поселение" },
  { name: "Ивашевская", distance: 50, settlement: "Бестужевское сельское поселение" },
  { name: "Набережная", distance: 53, settlement: "Бестужевское сельское поселение" },
  { name: "Никитинская", distance: 54, settlement: "Бестужевское сельское поселение" },
  { name: "Пестово", distance: 57, settlement: "Бестужевское сельское поселение" },
  { name: "Соболевская", distance: 52, settlement: "Бестужевское сельское поселение" },
  { name: "Туриха", distance: 58, settlement: "Бестужевское сельское поселение" },
  { name: "Фомин Починок", distance: 59, settlement: "Бестужевское сельское поселение" },
  { name: "Шалимова", distance: 60, settlement: "Бестужевское сельское поселение" },
  { name: "Язовицы", distance: 61, settlement: "Бестужевское сельское поселение" },

  // Дмитриевское сельское поселение
  { name: "Алферовская", distance: 38, settlement: "Дмитриевское сельское поселение" },
  { name: "Армино", distance: 42, settlement: "Дмитриевское сельское поселение" },
  { name: "Бородинская", distance: 40, settlement: "Дмитриевское сельское поселение" },
  { name: "Великая", distance: 41, settlement: "Дмитриевское сельское поселение" },
  { name: "Кондратовская", distance: 44, settlement: "Дмитриевское сельское поселение" },
  { name: "Кукуево", distance: 45, settlement: "Дмитриевское сельское поселение" },
  { name: "Куриловская", distance: 43, settlement: "Дмитриевское сельское поселение" },
  { name: "Лущево", distance: 46, settlement: "Дмитриевское сельское поселение" },
  { name: "Маньшинская", distance: 47, settlement: "Дмитриевское сельское поселение" },
  { name: "Назаровская", distance: 48, settlement: "Дмитриевское сельское поселение" },
  { name: "Тарасовская", distance: 49, settlement: "Дмитриевское сельское поселение" },
  { name: "Щеколдинская", distance: 50, settlement: "Дмитриевское сельское поселение" },

  // Илезское сельское поселение
  { name: "Илеза", distance: 95, settlement: "Илезское сельское поселение" },
  { name: "Клон", distance: 98, settlement: "Илезское сельское поселение" },
  { name: "Кочкурга", distance: 102, settlement: "Илезское сельское поселение" },
  { name: "Первомайский (Илезское)", distance: 90, settlement: "Илезское сельское поселение" },
  { name: "Сулонда", distance: 105, settlement: "Илезское сельское поселение" },
  { name: "Шангалы (Илезское)", distance: 92, settlement: "Илезское сельское поселение" },
  { name: "Шурай", distance: 110, settlement: "Илезское сельское поселение" },

  // Киземское сельское поселение
  { name: "Вонжуга", distance: 85, settlement: "Киземское сельское поселение" },
  { name: "Кизема", distance: 80, settlement: "Киземское сельское поселение" },
  { name: "Сенгос", distance: 88, settlement: "Киземское сельское поселение" },

  // Лихачевское сельское поселение
  { name: "Бритвино", distance: 42, settlement: "Лихачевское сельское поселение" },
  { name: "Илатово", distance: 45, settlement: "Лихачевское сельское поселение" },
  { name: "Казово", distance: 48, settlement: "Лихачевское сельское поселение" },
  { name: "Лихачево", distance: 40, settlement: "Лихачевское сельское поселение" },
  { name: "Мирный", distance: 38, settlement: "Лихачевское сельское поселение" },
  { name: "Михалёво", distance: 44, settlement: "Лихачевское сельское поселение" },
  { name: "Первомайский (Лихачевское)", distance: 35, settlement: "Лихачевское сельское поселение" },

  // Лойгинское сельское поселение
  { name: "Лойга", distance: 120, settlement: "Лойгинское сельское поселение" },
  { name: "Уфтюга", distance: 125, settlement: "Лойгинское сельское поселение" },

  // Малодорское сельское поселение
  { name: "Большая Вирова", distance: 34, settlement: "Малодорское сельское поселение" },
  { name: "Большой Дор", distance: 31, settlement: "Малодорское сельское поселение" },
  { name: "Верховская", distance: 33, settlement: "Малодорское сельское поселение" },
  { name: "Глазанова", distance: 35, settlement: "Малодорское сельское поселение" },
  { name: "Горочная", distance: 32, settlement: "Малодорское сельское поселение" },
  { name: "Зарузская", distance: 36, settlement: "Малодорское сельское поселение" },
  { name: "Кустовская", distance: 37, settlement: "Малодорское сельское поселение" },
  { name: "Лыловская", distance: 38, settlement: "Малодорское сельское поселение" },
  { name: "Малая Вирова", distance: 33, settlement: "Малодорское сельское поселение" },
  { name: "Малодоры", distance: 32, settlement: "Малодорское сельское поселение" },
  { name: "Малый Дор", distance: 30, settlement: "Малодорское сельское поселение" },
  { name: "Маренинская", distance: 39, settlement: "Малодорское сельское поселение" },
  { name: "Наумовская", distance: 35, settlement: "Малодорское сельское поселение" },
  { name: "Подгорная (Малодорское)", distance: 29, settlement: "Малодорское сельское поселение" },
  { name: "Подосенова", distance: 34, settlement: "Малодорское сельское поселение" },
  { name: "Спасская", distance: 35, settlement: "Малодорское сельское поселение" },
  { name: "Черновская", distance: 36, settlement: "Малодорское сельское поселение" },
  { name: "Чуриловская", distance: 37, settlement: "Малодорское сельское поселение" },
  { name: "Шеломечко", distance: 38, settlement: "Малодорское сельское поселение" },
  { name: "Ширшовская", distance: 39, settlement: "Малодорское сельское поселение" },
  { name: "Якушевская", distance: 40, settlement: "Малодорское сельское поселение" },

  // Октябрьское городское поселение
  { name: "880 - 881 км", distance: 4, settlement: "Октябрьское городское поселение" },
  { name: "884 км", distance: 6, settlement: "Октябрьское городское поселение" },
  { name: "Анциферовская", distance: 8, settlement: "Октябрьское городское поселение" },
  { name: "Белоусово", distance: 10, settlement: "Октябрьское городское поселение" },
  { name: "Беляевская", distance: 9, settlement: "Октябрьское городское поселение" },
  { name: "Бываловская", distance: 7, settlement: "Октябрьское городское поселение" },
  { name: "Вахрушевская", distance: 5, settlement: "Октябрьское городское поселение" },
  { name: "Верхняя Поржема", distance: 12, settlement: "Октябрьское городское поселение" },
  { name: "Костылево", distance: 8, settlement: "Октябрьское городское поселение" },
  { name: "Красный Бор", distance: 11, settlement: "Октябрьское городское поселение" },
  { name: "Леонтьевская", distance: 10, settlement: "Октябрьское городское поселение" },
  { name: "Лосевская", distance: 13, settlement: "Октябрьское городское поселение" },
  { name: "Михайловская", distance: 14, settlement: "Октябрьское городское поселение" },
  { name: "Мягкославская", distance: 15, settlement: "Октябрьское городское поселение" },
  { name: "Неклюдовская", distance: 11, settlement: "Октябрьское городское поселение" },
  { name: "Октябрьский", distance: 0, settlement: "Октябрьское городское поселение" },
  { name: "Павлицево", distance: 12, settlement: "Октябрьское городское поселение" },
  { name: "Петраково (Октябрьское)", distance: 13, settlement: "Октябрьское городское поселение" },
  { name: "Прокопцевская", distance: 14, settlement: "Октябрьское городское поселение" },
  { name: "Рыжковская", distance: 15, settlement: "Октябрьское городское поселение" },
  { name: "Сушзавода", distance: 3, settlement: "Октябрьское городское поселение" },
  { name: "Чадрома", distance: 16, settlement: "Октябрьское городское поселение" },
  { name: "Шастов Починок", distance: 17, settlement: "Октябрьское городское поселение" },

  // Орловское сельское поселение
  { name: "Бережная (Орловское)", distance: 48, settlement: "Орловское сельское поселение" },
  { name: "Дубровская (Орловское)", distance: 45, settlement: "Орловское сельское поселение" },
  { name: "Коптяевская", distance: 46, settlement: "Орловское сельское поселение" },
  { name: "Митинская", distance: 47, settlement: "Орловское сельское поселение" },
  { name: "Нос-Сады", distance: 50, settlement: "Орловское сельское поселение" },

  // Плосское сельское поселение
  { name: "Исаевская", distance: 38, settlement: "Плосское сельское поселение" },
  { name: "Карповская", distance: 39, settlement: "Плосское сельское поселение" },
  { name: "Левогорочная", distance: 41, settlement: "Плосское сельское поселение" },
  { name: "Левоплосская", distance: 40, settlement: "Плосское сельское поселение" },
  { name: "Михалевская", distance: 42, settlement: "Плосское сельское поселение" },
  { name: "Михеевская", distance: 43, settlement: "Плосское сельское поселение" },
  { name: "Окатовская", distance: 44, settlement: "Плосское сельское поселение" },
  { name: "Пирятинская", distance: 45, settlement: "Плосское сельское поселение" },
  { name: "Правогорочная", distance: 41, settlement: "Плосское сельское поселение" },
  { name: "Правоплосская", distance: 40, settlement: "Плосское сельское поселение" },
  { name: "Студенец", distance: 46, settlement: "Плосское сельское поселение" },

  // Ростовско-Минское сельское поселение
  { name: "Автономовская", distance: 20, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Алекино", distance: 22, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Алексеевская", distance: 21, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Алешковская", distance: 23, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Антипинская", distance: 19, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Арефинская", distance: 24, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Березник (Ростовско-Минское)", distance: 25, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Бережная (Ростовско-Минское)", distance: 23, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Богачевская", distance: 26, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Большая Медвежевская", distance: 28, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Васильевская", distance: 17, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Веригинская (Ростовско-Минское)", distance: 27, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Горский", distance: 22, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Дубровская (Ростовско-Минское)", distance: 24, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Дудинская", distance: 23, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Евсютинская", distance: 26, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Ершевская", distance: 25, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Заручевская", distance: 28, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Захаровская", distance: 27, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Заячевская", distance: 29, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Заячерицкий Погост", distance: 18, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Зубаревская", distance: 30, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Исаковская (Ростовско-Минское)", distance: 31, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Климовская", distance: 32, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Крыловская", distance: 33, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Конятинская", distance: 34, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Кузьминская", distance: 35, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Ларютинская", distance: 36, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Левинская", distance: 37, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Лукияновская", distance: 38, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Ляпуновская", distance: 39, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Максимовская", distance: 40, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Малая", distance: 41, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Маломедвежевская", distance: 28, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Матвеевская", distance: 42, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Мозоловская", distance: 43, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Моисеевская", distance: 44, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Мотоусовская", distance: 45, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Нагорская", distance: 12, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Обонеговская", distance: 46, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Орюковская", distance: 47, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Патрушевская", distance: 48, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Пашутинская", distance: 49, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Переслигинская", distance: 50, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Петраково (Ростовско-Минское)", distance: 32, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Погорельская", distance: 51, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Подгорная (Ростовско-Минское)", distance: 29, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Пошиваевская", distance: 52, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Романовская", distance: 53, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Рубчевская", distance: 54, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Сарбала", distance: 55, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Семушинская", distance: 56, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Скочевская", distance: 57, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Сокиринская", distance: 58, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Становская", distance: 59, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Стешевская", distance: 60, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Тереховская", distance: 61, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Толстиковская", distance: 62, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Угольская", distance: 63, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Ульяновская", distance: 64, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Усачевская", distance: 65, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Филинская", distance: 66, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Хариловская", distance: 67, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Царевская", distance: 68, settlement: "Ростовско-Минское сельское поселение" },
  { name: "Шоломовская", distance: 69, settlement: "Ростовско-Минское сельское поселение" },

  // Синицкое сельское поселение
  { name: "Васьковская", distance: 53, settlement: "Синицкое сельское поселение" },
  { name: "Заречье", distance: 51, settlement: "Синицкое сельское поселение" },
  { name: "Кидюга", distance: 52, settlement: "Синицкое сельское поселение" },
  { name: "Медвежье", distance: 55, settlement: "Синицкое сельское поселение" },
  { name: "Синики", distance: 50, settlement: "Синицкое сельское поселение" },
  { name: "Чернополье", distance: 54, settlement: "Синицкое сельское поселение" },

  // Строевское сельское поселение
  { name: "Будрино", distance: 48, settlement: "Строевское сельское поселение" },
  { name: "Большое Пенье", distance: 47, settlement: "Строевское сельское поселение" },
  { name: "Грунцовская", distance: 46, settlement: "Строевское сельское поселение" },
  { name: "Исаковская (Строевское)", distance: 49, settlement: "Строевское сельское поселение" },
  { name: "Кузоверская", distance: 50, settlement: "Строевское сельское поселение" },
  { name: "Малое Пенье", distance: 47, settlement: "Строевское сельское поселение" },
  { name: "Наволок", distance: 45, settlement: "Строевское сельское поселение" },
  { name: "Прилуки", distance: 44, settlement: "Строевское сельское поселение" },
  { name: "Сабуровская", distance: 51, settlement: "Строевское сельское поселение" },
  { name: "Строевское", distance: 45, settlement: "Строевское сельское поселение" },
  { name: "Ульюха", distance: 52, settlement: "Строевское сельское поселение" },
  { name: "Щапинская", distance: 53, settlement: "Строевское сельское поселение" },
  { name: "Щипцово", distance: 54, settlement: "Строевское сельское поселение" },
  { name: "Ямная", distance: 55, settlement: "Строевское сельское поселение" },

  // Череновское сельское поселение
  { name: "Беклемишевская", distance: 65, settlement: "Череновское сельское поселение" },
  { name: "Кадыевская", distance: 64, settlement: "Череновское сельское поселение" },
  { name: "Квазеньга", distance: 66, settlement: "Череновское сельское поселение" },
  { name: "Кезоминская", distance: 67, settlement: "Череновское сельское поселение" },
  { name: "Майдан", distance: 68, settlement: "Череновское сельское поселение" },
  { name: "Пыркино", distance: 69, settlement: "Череновское сельское поселение" },
  { name: "Череновская", distance: 62, settlement: "Череновское сельское поселение" },
  { name: "Шаткурга", distance: 70, settlement: "Череновское сельское поселение" },

  // Шангальское сельское поселение
  { name: "Аверкиевская", distance: 18, settlement: "Шангальское сельское поселение" },
  { name: "Бережная (Шангальское)", distance: 16, settlement: "Шангальское сельское поселение" },
  { name: "Заостровье", distance: 14, settlement: "Шангальское сельское поселение" },
  { name: "Ион-Горка", distance: 17, settlement: "Шангальское сельское поселение" },
  { name: "Камкинская", distance: 19, settlement: "Шангальское сельское поселение" },
  { name: "Кононовская", distance: 20, settlement: "Шангальское сельское поселение" },
  { name: "Красный", distance: 13, settlement: "Шангальское сельское поселение" },
  { name: "Малиновка", distance: 30, settlement: "Шангальское сельское поселение" },
  { name: "Милославская", distance: 21, settlement: "Шангальское сельское поселение" },
  { name: "Нижнеборская", distance: 22, settlement: "Шангальское сельское поселение" },
  { name: "Плесевская", distance: 23, settlement: "Шангальское сельское поселение" },
  { name: "Починовская", distance: 24, settlement: "Шангальское сельское поселение" },
  { name: "Советский", distance: 12, settlement: "Шангальское сельское поселение" },
  { name: "Степанов Прилук", distance: 25, settlement: "Шангальское сельское поселение" },
  { name: "Тарасонаволоцкая", distance: 26, settlement: "Шангальское сельское поселение" },
  { name: "Шангалы", distance: 15, settlement: "Шангальское сельское поселение" },
  { name: "Шеломенская", distance: 27, settlement: "Шангальское сельское поселение" },
  { name: "Юрятинская", distance: 28, settlement: "Шангальское сельское поселение" }
];

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
}

export const REQUEST_CATEGORIES: Category[] = [
  { id: "wood", name: "Колка дров / Вода", icon: "Flame", description: "Заготовка дров, доставка питьевой воды" },
  { id: "tractor", name: "Сельхоз работы / Трактор", icon: "Tractor", description: "Вспашка, уборка снега, покос травы" },
  { id: "carpentry", name: "Плотник / Строительство", icon: "Hammer", description: "Ремонт крыши, забора, крыльца, печи" },
  { id: "welding", name: "Сварка / Металл", icon: "Wrench", description: "Сварка труб, калиток, металлоконструкций" },
  { id: "delivery", name: "Доставка / Машина", icon: "Truck", description: "Поездка в райцентр, доставка продуктов и лекарств" },
  { id: "medical", name: "Медицина / Уход", icon: "HeartPulse", description: "Измерить давление, сделать укол, уход" },
  { id: "household", name: "Помощь по дому", icon: "Home", description: "Уборка, готовка, мелкий бытовой ремонт" },
  { id: "legal", name: "Юрист / Документы", icon: "FileText", description: "Помощь с заполнением заявлений, льготами" },
  { id: "other", name: "Другая помощь", icon: "HelpCircle", description: "Любые другие добрые дела и просьбы" }
];

export const SKILLS_LIST: Skill[] = [
  { id: "welder", name: "Сварщик / Металлообработка", category: "welding" },
  { id: "carpenter", name: "Плотник / Строитель", category: "carpentry" },
  { id: "stovemaker", name: "Печник", category: "carpentry" },
  { id: "tractorist", name: "Тракторист / Есть техника", category: "tractor" },
  { id: "driver", name: "Водитель / Есть машина", category: "delivery" },
  { id: "medic", name: "Медицинский работник / Сиделка", category: "medical" },
  { id: "lawyer", name: "Юрист / Помощь с документами", category: "legal" },
  { id: "electrician", name: "Электрик", category: "carpentry" },
  { id: "woodcutter", name: "Лесоруб / Колка дров", category: "wood" },
  { id: "housekeeper", name: "Помощь по хозяйству", category: "household" }
];

export interface KeepNote {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  isChecklist: boolean;
  checklistItems: { text: string; done: boolean }[];
  updatedAt: string;
  driveFileId?: string;
}

export interface EntrepreneurSchedule {
  monday?: string[];
  tuesday?: string[];
  wednesday?: string[];
  thursday?: string[];
  friday?: string[];
  saturday?: string[];
  sunday?: string[];
  [key: string]: string[] | undefined;
}

export interface PriceListItem {
  id?: string;
  item: string;
  price: number;
  unit: string;
  description?: string;
  inStock?: boolean;
}

export interface EntrepreneurRating {
  average: number; // 0-5
  totalReviews: number;
  totalOrders?: number;
  completedOrders?: number;
  onTimePercentage: number; // 0-100
}

export interface Entrepreneur {
  id: string;
  userId: string;
  businessName: string;
  contactPhone: string;
  serviceRadius: number; // in km (e.g., 10, 20, 30, 50, 100)
  deliverySchedule: EntrepreneurSchedule;
  priceList: PriceListItem[];
  rating: EntrepreneurRating;
  isVerified: boolean;
  isActive: boolean; // can pause business
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string; // ISO string
  
  // Monetization fields
  tariff?: 'free_trial' | 'basic' | 'pro' | 'vip';
  tariffExpiryDate?: string; // ISO string
  trialStartDate?: string; // ISO string
  balance?: number; // total earned or negative commission due
  fines?: number; // total accumulated fines

  // Fraud / Security fields
  status?: 'green' | 'yellow' | 'red';
  warningsCount?: number;
  ipAddress?: string; // Simulated IP address
  logoUrl?: string;
  coverUrl?: string; // custom cover image
  themeColor?: string; // hex color or preset name
  address?: string; // physical store address
  description?: string;
  village?: string;
  requisites?: { inn: string; ogrnip: string };
  limits?: {
    max_spend_percent?: number; // default 10
  };
  promotions?: {
    boost_days?: number;
    vip_until?: string; // ISO or Timestamp string
  };
}

export interface Product {
  id: string;
  entrepreneurId: string;
  name: string;
  price: number;
  description: string;
  category: string;
  unit: string;
  stock: number;
  photoUrl: string;
  photos?: string[]; // Multiple photos support for carousel
  discount?: number; // discount percentage
  isActive: boolean;
  createdAt: string;
}

export interface EntrepreneurTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  name: string;
}

export interface OrderItem {
  item: string;
  name?: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Order {
  id: string;
  entrepreneurId: string;
  entrepreneurBusinessName: string;
  entrepreneurPhone?: string;
  userId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalAmount?: number;
  status: 'new' | 'accepted' | 'delivering' | 'delivered' | 'cancelled';
  requestedDeliveryDate: string;
  requestedDeliveryTimeSlot: string;
  preferredDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdAt: string; // ISO string
  reviewId?: string;

  // Monetization & Fraud fields
  commissionRate?: number; // percentage, e.g. 7
  commissionAmount?: number; // e.g. total * 0.07
  buyerIpAddress?: string; // Captured IP
  isDisputed?: boolean;
  disputeId?: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  entrepreneurId: string;
  entrepreneurBusinessName: string;
  reason: string;
  createdAt: string; // ISO string
  status: 'open' | 'resolved_refund' | 'resolved_no_refund' | 'resolved_fine';
  resolutionComment?: string;
}

export interface FraudAlert {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  ipAddress: string;
  reason: string;
  severity: 'warning' | 'block';
  createdAt: string; // ISO string
}

export interface ReviewCategories {
  timeliness: number; // 1-5
  quality: number; // 1-5
  politeness: number; // 1-5
  priceFairness: number; // 1-5
}

export interface Review {
  id: string;
  orderId: string;
  entrepreneurId: string;
  buyerId: string;
  buyerName: string;
  rating: number; // overall average
  comment: string;
  categories: ReviewCategories;
  entrepreneurReply?: string;
  createdAt: string; // ISO string
}

// Transport Module Interfaces
export interface BusRoute {
  id: string;
  departureVillage: string;
  arrivalVillage: string;
  schedule: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  isActive: boolean;
  routeNumber: string;
  price: number;
  provider: string;
}

export interface RideOffer {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  departureVillage: string;
  arrivalVillage: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  availableSeats: number;
  price: number; // 0 if free
  comment: string;
  contactPhone: string;
  status: 'active' | 'completed' | 'cancelled';
  passengers: string[]; // user IDs of joined passengers
  createdAt: string; // ISO string
}

export interface RideRequest {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  departureVillage: string;
  arrivalVillage: string;
  departureDate: string; // YYYY-MM-DD
  passengers: number; // number of people
  comment: string;
  contactPhone: string;
  status: 'active' | 'matched' | 'completed' | 'cancelled';
  matchedOfferId: string;
  createdAt: string; // ISO string
}

export interface RoadReport {
  id: string;
  userId: string;
  userName?: string;
  segmentStart: string;
  segmentEnd: string;
  condition: 'good' | 'fair' | 'poor' | 'impassable';
  comment: string;
  photoURL?: string;
  createdAt: string; // ISO string
}

export interface RideReviewCategories {
  punctuality: number;
  drivingSafety: number;
  carCleanliness: number;
  politeness: number;
}

export interface RideReview {
  id: string;
  rideOfferId: string;
  reviewerUserId: string;
  reviewerName?: string;
  targetUserId: string; // driver ID
  rating: number; // overall calculated average
  categories: RideReviewCategories;
  comment: string;
  isAnonymous: boolean;
  createdAt: string; // ISO string;
}

export interface Master {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  userVillage?: string;
  userAvatar?: string;
  categories: string[];
  description: string;
  experience: string;
  education: string;
  priceFrom: number;
  priceDescription: string;
  workingHours: string;
  rating: {
    average: number;
    total: number;
  };
  statistics: {
    totalOrders: number;
    completedOrders: number;
    onTimePercentage: number;
  };
  isActive: boolean;
  priceList?: { service: string; price: number; unit: string }[];
  photoUrl?: string;
  schedule?: { [day: string]: string };
  services?: { id: string; name: string; description: string; price: number; unit: string }[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  
  // Custom testing fields
  type?: string;
  category?: string;
  subcategory?: string;
  specialization?: string;
  contact?: string;
  photos?: string[];
  scheduleText?: string;
  additional?: any;
}

export interface PortfolioItem {
  id: string;
  masterId: string;
  title: string;
  description: string;
  category: string;
  photos: string[];
  location: string;
  price?: number;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
}

export interface ServiceOrder {
  id: string;
  masterId: string;
  masterName?: string;
  masterPhone?: string;
  clientId: string;
  clientName?: string;
  clientPhone?: string;
  description: string;
  category: string;
  address: string;
  budget?: number;
  preferredDate: string; // YYYY-MM-DD
  photos: string[];
  status: 'new' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  commission: number; // 7% of budget or 0
  commissionPaid: boolean;
  reviewId?: string;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

export interface MasterReview {
  id: string;
  orderId: string;
  masterId: string;
  clientId: string;
  clientName?: string;
  rating: number; // 1-5 overall average
  categories: {
    quality: number;
    timeliness: number;
    politeness: number;
    priceQuality: number;
  };
  comment: string;
  photos?: string[];
  isAnonymous: boolean;
  createdAt: string; // ISO string
  reply?: string;
  replyCreatedAt?: string;
}

export interface MasterCategory {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

export interface Level3Skill {
  id: string;
  name: string;
}

export interface Level2Subcategory {
  name: string;
  skills: Level3Skill[];
}

export interface Level1Category {
  id: string;
  name: string;
  displayName: string;
  subcategories: Level2Subcategory[];
}

export interface UserSkillsData {
  roles: {
    isProfessional: boolean;
    isCraftsman: boolean;
    isWorker: boolean;
    isGovernment: boolean;
    isAgriculture: boolean;
    isArt: boolean;
    isLogistics: boolean;
    isHealth: boolean;
    isEducation: boolean;
    isDigital: boolean;
  };
  skillNames: string[];
  categories: {
    main: string;
    sub: string;
    skills: string[];
  }[];
}

export function getThreeLevelCategories(): Level1Category[] {
  return MASTER_CATEGORIES.map(cat => {
    // Strip emojis
    const displayName = cat.name.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
    
    // Group subcategories by the part before the colon
    const subGroup: { [key: string]: Level3Skill[] } = {};
    
    cat.subcategories.forEach(sub => {
      let subcatName = "Общее";
      let skillName = sub.name;
      
      if (sub.name.includes(":")) {
        const parts = sub.name.split(":");
        subcatName = parts[0].trim();
        skillName = parts[1].trim();
      }
      
      if (!subGroup[subcatName]) {
        subGroup[subcatName] = [];
      }
      subGroup[subcatName].push({
        id: sub.id,
        name: skillName
      });
    });
    
    const subcategories: Level2Subcategory[] = Object.keys(subGroup).map(subName => ({
      name: subName,
      skills: subGroup[subName]
    }));
    
    return {
      id: cat.id,
      name: cat.name,
      displayName,
      subcategories
    };
  });
}

export function getProfileSkillsData(selectedSkillIds: string[]): UserSkillsData {
  const categoryToRoleKey: Record<string, string> = {
    professional: 'isProfessional',
    craftsman: 'isCraftsman',
    worker: 'isWorker',
    government: 'isGovernment',
    agriculture: 'isAgriculture',
    art: 'isArt',
    logistics: 'isLogistics',
    health: 'isHealth',
    education: 'isEducation',
    digital: 'isDigital',
  };

  const roles = {
    isProfessional: false,
    isCraftsman: false,
    isWorker: false,
    isGovernment: false,
    isAgriculture: false,
    isArt: false,
    isLogistics: false,
    isHealth: false,
    isEducation: false,
    isDigital: false,
  };
  
  const skillNames: string[] = [];
  const categoriesMap: { [key: string]: { main: string; sub: string; skills: string[] } } = {};
  
  const threeLevelCats = getThreeLevelCategories();
  
  (selectedSkillIds || []).forEach(id => {
    for (const cat of threeLevelCats) {
      for (const sub of cat.subcategories) {
        const foundSkill = sub.skills.find(s => s.id === id);
        if (foundSkill) {
          const roleKey = categoryToRoleKey[cat.id];
          if (roleKey) {
            (roles as any)[roleKey] = true;
          }
          
          if (!skillNames.includes(foundSkill.name)) {
            skillNames.push(foundSkill.name);
          }
          
          const mapKey = `${cat.displayName}_${sub.name}`;
          if (!categoriesMap[mapKey]) {
            categoriesMap[mapKey] = {
              main: cat.displayName,
              sub: sub.name,
              skills: []
            };
          }
          if (!categoriesMap[mapKey].skills.includes(foundSkill.name)) {
            categoriesMap[mapKey].skills.push(foundSkill.name);
          }
        }
      }
    }
  });
  
  return {
    roles,
    skillNames,
    categories: Object.values(categoriesMap)
  };
}

export const MASTER_CATEGORIES: MasterCategory[] = [
  {
    id: "professional",
    name: "👔 Профессионалы",
    subcategories: [
      { id: "pro_therapist", name: "Медицина: Врач-терапевт" },
      { id: "pro_pediatrician", name: "Медицина: Врач-педиатр" },
      { id: "pro_dentist", name: "Медицина: Стоматолог" },
      { id: "pro_paramedic", name: "Медицина: Фельдшер" },
      { id: "pro_nurse", name: "Медицина: Медсестра" },
      { id: "pro_midwife", name: "Медицина: Акушерка" },
      { id: "pro_pharmacist", name: "Медицина: Фармацевт" },
      { id: "pro_lawyer", name: "Юриспруденция: Юрист" },
      { id: "pro_advocate", name: "Юриспруденция: Адвокат" },
      { id: "pro_notary", name: "Юриспруденция: Нотариус" },
      { id: "pro_legal_advisor", name: "Юриспруденция: Юрисконсульт" },
      { id: "pro_accountant", name: "Финансы: Бухгалтер" },
      { id: "pro_economist", name: "Финансы: Экономист" },
      { id: "pro_fin_consultant", name: "Финансы: Финансовый консультант" },
      { id: "pro_tax_inspector", name: "Финансы: Налоговый инспектор" },
      { id: "pro_civil_engineer", name: "Инженерия: Инженер-строитель" },
      { id: "pro_designer_engineer", name: "Инженерия: Проектировщик" },
      { id: "pro_geodesist", name: "Инженерия: Геодезист" },
      { id: "pro_electrical_engineer", name: "Инженерия: Инженер-электрик" },
      { id: "pro_heat_engineer", name: "Инженерия: Инженер-теплотехник" },
      { id: "pro_architect", name: "Архитектура: Архитектор" },
      { id: "pro_interior_designer", name: "Архитектура: Дизайнер интерьеров" },
      { id: "pro_landscape_designer", name: "Архитектура: Ландшафтный дизайнер" },
      { id: "pro_programmer", name: "IT и связь: Программист" },
      { id: "pro_web_developer", name: "IT и связь: Веб-разработчик" },
      { id: "pro_sysadmin", name: "IT и связь: Системный администратор" },
      { id: "pro_comms_engineer", name: "IT и связь: Связист" },
      { id: "pro_technician", name: "IT и связь: Техник" },
      { id: "pro_agronomist", name: "Агрономия: Агроном" },
      { id: "pro_zootechnician", name: "Агрономия: Зоотехник" },
      { id: "pro_vet_doctor", name: "Агрономия: Ветеринарный врач" },
      { id: "pro_forester", name: "Агрономия: Лесовод" },
      { id: "pro_primary_teacher", name: "Образование: Учитель начальных классов" },
      { id: "pro_math_teacher", name: "Образование: Учитель математики" },
      { id: "pro_russian_teacher", name: "Образование: Учитель русского" },
      { id: "pro_physics_teacher", name: "Образование: Учитель физики" },
      { id: "pro_psychologist", name: "Образование: Педагог-психолог" },
      { id: "pro_speech_therapist", name: "Образование: Логопед" },
      { id: "pro_defectologist", name: "Образование: Дефектолог" }
    ]
  },
  {
    id: "craftsman",
    name: "🛠️ Мастеровые",
    subcategories: [
      { id: "craft_carpenter", name: "Строительство: Плотник" },
      { id: "craft_joiner", name: "Строительство: Столяр" },
      { id: "craft_roofer", name: "Строительство: Кровельщик" },
      { id: "craft_stovemaker", name: "Строительство: Печник" },
      { id: "craft_plasterer", name: "Строительство: Штукатур" },
      { id: "craft_painter", name: "Строительство: Маляр" },
      { id: "craft_electrician", name: "Строительство: Электрик" },
      { id: "craft_plumber", name: "Строительство: Сантехник" },
      { id: "craft_welder", name: "Строительство: Сварщик" },
      { id: "craft_concrete", name: "Строительство: Бетонщик" },
      { id: "craft_tiler", name: "Строительство: Плиточник" },
      { id: "craft_repair_appliances", name: "Ремонт: Ремонт бытовой техники" },
      { id: "craft_repair_electronics", name: "Ремонт: Ремонт электроники" },
      { id: "craft_repair_phones", name: "Ремонт: Ремонт телефонов" },
      { id: "craft_repair_computers", name: "Ремонт: Ремонт компьютеров" },
      { id: "craft_repair_shoes", name: "Ремонт: Мастер по ремонту обуви" },
      { id: "craft_repair_clocks", name: "Ремонт: Мастер по ремонту часов" },
      { id: "craft_repair_locks", name: "Ремонт: Мастер по ремонту замков" },
      { id: "craft_tractorist", name: "Сельхозтехника: Тракторист" },
      { id: "craft_combine", name: "Сельхозтехника: Комбайнер" },
      { id: "craft_machinist", name: "Сельхозтехника: Механизатор" },
      { id: "craft_agri_driver", name: "Сельхозтехника: Водитель сельхозтехники" },
      { id: "craft_agri_repair", name: "Сельхозтехника: Ремонт сельхозтехники" },
      { id: "craft_lumberjack", name: "Деревообработка: Лесоруб" },
      { id: "craft_feller", name: "Деревообработка: Вальщик леса" },
      { id: "craft_sawyer", name: "Деревообработка: Распиловщик" },
      { id: "craft_lumber_production", name: "Деревообработка: Изготовление пиломатериалов" },
      { id: "craft_repair_windows", name: "Бытовой ремонт: Ремонт окон" },
      { id: "craft_repair_doors", name: "Бытовой ремонт: Ремонт дверей" },
      { id: "craft_repair_porch", name: "Бытовой ремонт: Ремонт крыльца" },
      { id: "craft_repair_fence", name: "Бытовой ремонт: Ремонт забора" },
      { id: "craft_install_fence", name: "Бытовой ремонт: Установка заборов" },
      { id: "craft_repair_roof", name: "Бытовой ремонт: Ремонт кровли" }
    ]
  },
  {
    id: "worker",
    name: "👷 Работники",
    subcategories: [
      { id: "work_cleaner", name: "Дом и уют: Уборщица" },
      { id: "work_helper_home", name: "Дом и уют: Домработница" },
      { id: "work_ironer", name: "Дом и уют: Гладильщица" },
      { id: "work_cleaner_cl", name: "Дом и уют: Клинер" },
      { id: "work_nanny", name: "Забота: Няня" },
      { id: "work_elderly_nurse", name: "Забота: Сиделка" },
      { id: "work_care_helper", name: "Забота: Помощник по уходу" },
      { id: "work_social_worker", name: "Забота: Социальный работник" },
      { id: "work_cook", name: "Кулинария: Повар" },
      { id: "work_confectioner", name: "Кулинария: Кондитер" },
      { id: "work_baker", name: "Кулинария: Выпечка хлеба" },
      { id: "work_kitchen_helper", name: "Кулинария: Помощник на кухне" },
      { id: "work_tailor", name: "Рукоделие: Швея" },
      { id: "work_knitter", name: "Рукоделие: Вязальщица" },
      { id: "work_embroiderer", name: "Рукоделие: Вышивальщица" },
      { id: "work_feltmaker", name: "Рукоделие: Валяльщица" },
      { id: "work_knit_master", name: "Рукоделие: Мастер по вязанию" },
      { id: "work_loader", name: "Подсобные работы: Грузчик" },
      { id: "work_handyman", name: "Подсобные работы: Разнорабочий" },
      { id: "work_helper_general", name: "Подсобные работы: Подсобный рабочий" },
      { id: "work_janitor", name: "Подсобные работы: Дворник" }
    ]
  },
  {
    id: "government",
    name: "🏛️ Государство",
    subcategories: [
      { id: "gov_head", name: "Администрация: Глава поселения" },
      { id: "gov_deputy_head", name: "Администрация: Заместитель главы" },
      { id: "gov_specialist", name: "Администрация: Специалист администрации" },
      { id: "gov_clerk", name: "Администрация: Делопроизводитель" },
      { id: "gov_precinct_officer", name: "Правоохранение: Участковый уполномоченный" },
      { id: "gov_pdn_inspector", name: "Правоохранение: Инспектор ПДН" },
      { id: "gov_police", name: "Правоохранение: Сотрудник полиции" },
      { id: "gov_mvd_lawyer", name: "Правоохранение: Юрисконсульт МВД" },
      { id: "gov_social_specialist", name: "Соцзащита: Специалист по социальной работе" },
      { id: "gov_social_inspector", name: "Соцзащита: Инспектор по соцзащите" },
      { id: "gov_social_psychologist", name: "Соцзащита: Психолог соцзащиты" },
      { id: "gov_mchs_rescuer", name: "МЧС: Спасатель МЧС" },
      { id: "gov_firefighter", name: "МЧС: Пожарный" },
      { id: "gov_fire_inspector", name: "МЧС: Инспектор по пожарному надзору" },
      { id: "gov_duty_officer", name: "МЧС: Оперативный дежурный" },
      { id: "gov_council_specialist", name: "Сельсовет: Специалист сельсовета" },
      { id: "gov_agri_advisor", name: "Сельсовет: Агроном-консультант" },
      { id: "gov_land_surveyor", name: "Сельсовет: Землеустроитель" },
      { id: "gov_school_director", name: "Образование: Директор школы" },
      { id: "gov_school_head", name: "Образование: Завуч" },
      { id: "gov_edu_inspector", name: "Образование: Инспектор управления образования" },
      { id: "gov_methodologist", name: "Образование: Методист" }
    ]
  },
  {
    id: "agriculture",
    name: "🌾 Сельское хозяйство",
    subcategories: [
      { id: "agri_agronomist", name: "Растениеводство: Агроном" },
      { id: "agri_vegetable", name: "Растениеводство: Овощевод" },
      { id: "agri_gardener", name: "Растениеводство: Садовод" },
      { id: "agri_berry_grower", name: "Растениеводство: Ягодовод" },
      { id: "agri_greenhouse", name: "Растениеводство: Тепличный работник" },
      { id: "agri_zootechnician", name: "Животноводство: Зоотехник" },
      { id: "agri_vet_assistant", name: "Животноводство: Ветеринарный фельдшер" },
      { id: "agri_cattleman", name: "Животноводство: Скотник" },
      { id: "agri_milkmaid", name: "Животноводство: Доярка" },
      { id: "agri_shepherd", name: "Животноводство: Овцевод" },
      { id: "agri_beekeeper", name: "Пчеловодство: Пчеловод" },
      { id: "agri_apiarist", name: "Пчеловодство: Пасечник" },
      { id: "agri_fisherman", name: "Рыболовство: Рыбак" },
      { id: "agri_fish_farmer", name: "Рыболовство: Рыбовод" },
      { id: "agri_fish_inspector", name: "Рыболовство: Инспектор рыбнадзора" },
      { id: "agri_ranger", name: "Охотничье хозяйство: Егерь" },
      { id: "agri_gamekeeper", name: "Охотничье хозяйство: Охотовед" },
      { id: "agri_forester_ranger", name: "Охотничье хозяйство: Лесничий" }
    ]
  },
  {
    id: "art",
    name: "🎨 Творчество",
    subcategories: [
      { id: "art_painter", name: "Искусство: Художник" },
      { id: "art_icon_painter", name: "Искусство: Иконописец" },
      { id: "art_graphic", name: "Искусство: График" },
      { id: "art_calligrapher", name: "Искусство: Каллиграф" },
      { id: "art_wood_carver", name: "Дерево: Резчик по дереву" },
      { id: "art_cooper", name: "Дерево: Бондарь" },
      { id: "art_wooden_dishes", name: "Дерево: Изготовление посуды" },
      { id: "art_wooden_toys", name: "Дерево: Изготовление игрушек" },
      { id: "art_blacksmith", name: "Металл: Кузнец" },
      { id: "art_forging", name: "Металл: Ковка изделий" },
      { id: "art_knifemaker", name: "Металл: Изготовление ножей" },
      { id: "art_jeweler", name: "Металл: Ювелир" },
      { id: "art_knitter_textile", name: "Текстиль: Вязальщица" },
      { id: "art_embroiderer_textile", name: "Текстиль: Вышивальщица" },
      { id: "art_patchwork", name: "Текстиль: Мастер по лоскутному шитью" },
      { id: "art_dollmaker", name: "Текстиль: Изготовление кукол" },
      { id: "art_potter", name: "Гончарство: Гончар" },
      { id: "art_ceramist", name: "Гончарство: Керамист" },
      { id: "art_clay_modeling", name: "Гончарство: Лепка из глины" }
    ]
  },
  {
    id: "logistics",
    name: "🚚 Логистика",
    subcategories: [
      { id: "log_driver_car", name: "Перевозки: Водитель легкового авто" },
      { id: "log_driver_truck", name: "Перевозки: Водитель грузового авто" },
      { id: "log_taxi", name: "Перевозки: Таксист" },
      { id: "log_trucker", name: "Перевозки: Дальнобойщик" },
      { id: "log_tractor_driver", name: "Спецтехника: Водитель трактора" },
      { id: "log_excavator_driver", name: "Спецтехника: Водитель экскаватора" },
      { id: "log_bulldozer_driver", name: "Спецтехника: Водитель бульдозера" },
      { id: "log_crane_driver", name: "Спецтехника: Водитель крана" },
      { id: "log_mechanic", name: "Ремонт: Автомеханик" },
      { id: "log_electrician", name: "Ремонт: Автоэлектрик" },
      { id: "log_tire", name: "Ремонт: Шиномонтаж" },
      { id: "log_body_repair", name: "Ремонт: Кузовной ремонт" },
      { id: "log_diagnostician", name: "Ремонт: Диагност" },
      { id: "log_motorcycle_driver", name: "Мото: Водитель мотоцикла" },
      { id: "log_motorcycle_repair", name: "Мото: Ремонт мотоциклов" }
    ]
  },
  {
    id: "health",
    name: "🏥 Здоровье и красота",
    subcategories: [
      { id: "health_hairdresser", name: "Уход: Парикмахер" },
      { id: "health_stylist", name: "Уход: Стилист" },
      { id: "health_makeup", name: "Уход: Визажист" },
      { id: "health_browist", name: "Уход: Бровист" },
      { id: "health_manicurist", name: "Уход: Маникюрщица" },
      { id: "health_masseur", name: "Массаж: Массажист" },
      { id: "health_osteopath", name: "Массаж: Остеопат" },
      { id: "health_rehabilitator", name: "Массаж: Реабилитолог" },
      { id: "health_nurse", name: "Медицина: Медсестра" },
      { id: "health_paramedic", name: "Медицина: Фельдшер" },
      { id: "health_orderly", name: "Медицина: Санитарка" },
      { id: "health_yoga_inst", name: "Здоровье: Инструктор по йоге" },
      { id: "health_lfk_inst", name: "Здоровье: Инструктор по ЛФК" },
      { id: "health_dietitian", name: "Здоровье: Диетолог" },
      { id: "health_nutritionist", name: "Здоровье: Нутрициолог" }
    ]
  },
  {
    id: "education",
    name: "📚 Обучение",
    subcategories: [
      { id: "edu_primary_teacher", name: "Школа: Учитель начальных классов" },
      { id: "edu_russian_teacher", name: "Школа: Учитель русского" },
      { id: "edu_math_teacher", name: "Школа: Учитель математики" },
      { id: "edu_english_teacher", name: "Школа: Учитель английского" },
      { id: "edu_music_teacher", name: "Творчество: Учитель музыки" },
      { id: "edu_choreographer", name: "Творчество: Хореограф" },
      { id: "edu_club_leader", name: "Творчество: Руководитель кружка" },
      { id: "edu_art_studio", name: "Творчество: Изо-студия" },
      { id: "edu_tutor", name: "Доп. образование: Репетитор" },
      { id: "edu_speech_therapist", name: "Доп. образование: Логопед" },
      { id: "edu_defectologist", name: "Доп. образование: Дефектолог" },
      { id: "edu_school_prep", name: "Доп. образование: Подготовка к школе" },
      { id: "edu_football_coach", name: "Спорт: Тренер по футболу" },
      { id: "edu_ski_coach", name: "Спорт: Тренер по лыжам" },
      { id: "edu_swim_coach", name: "Спорт: Инструктор по плаванию" }
    ]
  },
  {
    id: "digital",
    name: "💻 Цифровые профессии",
    subcategories: [
      { id: "dig_programmer", name: "IT: Программист" },
      { id: "dig_web_developer", name: "IT: Веб-разработчик" },
      { id: "dig_tester", name: "IT: Тестировщик" },
      { id: "dig_analyst", name: "IT: Аналитик" },
      { id: "dig_db_admin", name: "IT: Администратор баз данных" },
      { id: "dig_telecom_installer", name: "Связь: Монтажник связи" },
      { id: "dig_internet_config", name: "Связь: Настройщик интернета" },
      { id: "dig_sat_tv", name: "Связь: Установщик спутникового ТВ" },
      { id: "dig_repair_phones", name: "Мобильные устройства: Ремонт телефонов" },
      { id: "dig_repair_tablets", name: "Мобильные устройства: Ремонт планшетов" },
      { id: "dig_config_mobile", name: "Мобильные устройства: Настройка мобильных устройств" },
      { id: "dig_repair_computers", name: "Оргтехника: Ремонт компьютеров" },
      { id: "dig_install_software", name: "Оргтехника: Установка ПО" },
      { id: "dig_config_printers", name: "Оргтехника: Настройка принтеров" },
      { id: "dig_repair_office_tech", name: "Оргтехника: Ремонт оргтехники" }
    ]
  }
];

export type WidgetType =
  | 'header'
  | 'text'
  | 'image'
  | 'button'
  | 'list'
  | 'stats'
  | 'map'
  | 'form'
  | 'link'
  | 'gallery'
  | 'news'
  | 'masters'
  | 'entrepreneurs'
  | 'calendar'
  | 'sos'
  | 'divider';

export interface Widget {
  id: string;
  type: WidgetType;
  order: number;
  content: {
    text?: string;
    fontSize?: 'h1' | 'h2' | 'h3' | 'body' | 'small';
    color?: string;
    alignment?: 'left' | 'center' | 'right';
    url?: string;
    description?: string;
    items?: string[];
    listType?: 'bullets' | 'numbers';
    imageUrl?: string;
    crop?: 'cover' | 'contain' | 'none';
    caption?: string;
    statsType?: 'users' | 'orders' | 'requests' | 'masters' | 'custom';
    statsLabel?: string;
    statsValue?: string;
    mapCoords?: string;
    mapZoom?: number;
    mapMarkers?: { lat: number; lng: number; title: string }[];
    formFields?: { type: 'text' | 'textarea' | 'phone'; label: string; required: boolean }[];
    formSubmitText?: string;
    galleryUrls?: string[];
    galleryAutoScroll?: boolean;
    newsLimit?: number;
    newsFilter?: string;
    mastersFilter?: string;
    entrepreneursFilter?: string;
    calendarPeriod?: string;
    sosText?: string;
    sosColor?: string;
    dividerColor?: string;
    dividerThickness?: number;
    dividerStyle?: 'solid' | 'dashed' | 'dotted';
  };
  style: {
    backgroundColor?: string;
    textColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
    marginTop?: number;
    marginBottom?: number;
    width?: number;
  };
  action?: {
    type: 'navigate' | 'function' | 'url' | 'none';
    target: string;
  };
  mobileHidden?: boolean;
}

export interface PageSettings {
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundType: 'color' | 'gradient' | 'image';
  paddingTop: number;
  paddingBottom: number;
}

export interface Page {
  id: string;
  title: string;
  path: string;
  order: number;
  isActive: boolean;
  isHome?: boolean;
  settings: PageSettings;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  previewImage?: string;
  widgets: Widget[];
  createdAt: string;
}

export interface PageHistory {
  id: string;
  pageId: string;
  version: number;
  widgets: Widget[];
  settings?: PageSettings;
  title?: string;
  createdAt: string;
  createdBy: string;
}

export interface GlobalTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingsColor: string;
  buttonsColor: string;
  primaryFont: string;
  headingsFont: string;
  baseFontSize: number;
  headingsFontSize: number;
}

export interface EcoPoint {
  id: string;
  name: string;
  address: string;
  village: string;
  lat: number;
  lng: number;
  phone: string;
  schedule: string;
  accepts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EcoReport {
  id: string;
  userId: string;
  village: string;
  description: string;
  lat: number;
  lng: number;
  photos: string[];
  isAnonymous: boolean;
  status: 'new' | 'in_progress' | 'resolved' | 'rejected';
  assignedTo: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  phone?: string;
  userName?: string;
  size?: string;
}

export interface EcoEvent {
  id: string;
  title: string;
  description: string;
  village: string;
  address: string;
  date: string;
  time: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  isActive: boolean;
  photos: string[];
  createdAt: string;
  createdBy: string;
  participantUserIds?: string[];
}

export interface EcoStats {
  id: string;
  totalBatteriesCollected: number;
  totalEvents: number;
  totalParticipants: number;
  totalDumpsCleared: number;
  byVillage: Record<string, {
    batteriesCollected: number;
    eventsParticipated: number;
    dumpsCleared: number;
  }>;
  updatedAt: string;
}

// --- GOVERNMENT LIAISON (APPEALS) INTERFACES ---
export type AppealTopic = 'housing' | 'healthcare' | 'transport' | 'education' | 'ecology' | 'social' | 'construction' | 'communication' | 'other';

export interface AppealTimelineItem {
  date: string;
  action: string;
  description: string;
  author: string;
}

export interface Appeal {
  id: string;
  authorId: string;
  authorName: string;
  authorVillage: string;
  topic: AppealTopic;
  title: string;
  description: string;
  address: string;
  photos: string[];
  votes: number;
  thresholdMet: boolean;
  status: 'draft' | 'voting' | 'moderation' | 'accepted' | 'in_progress' | 'resolved' | 'rejected';
  moderatorId: string | null;
  assignedTo: {
    org: string;
    person: string;
  };
  timeline: AppealTimelineItem[];
  resolution?: {
    date: string;
    description: string;
    evidence: string[];
  };
  rating?: number;
  createdAt: string;
  updatedAt: string;
  
  // New features support fields
  priority?: 'critical' | 'important' | 'planned';
  appNumber?: string;
  deadlineDate?: string;
  escalationLevel?: number; // 0: local, 1: district, 2: regional, 3: regional assembly / deputy
  verificationVotes?: { id: string; userId: string; userName: string; isResolved: boolean; comment: string; createdAt: string; }[];
  publicReport?: {
    date: string;
    description: string;
    performer: string;
    budget: number;
    photoBefore?: string;
    photoAfter?: string;
    ratings?: { userId: string; stars: number }[];
  };
  isVoice?: boolean;
  voiceText?: string;
}

export interface AppealVote {
  id: string;
  appealId: string;
  userId: string;
  userName: string;
  userVillage: string;
  vote: 'yes' | 'no';
  comment: string;
  createdAt: string;
}

export interface AppealComment {
  id: string;
  appealId: string;
  userId: string;
  userName: string;
  text: string;
  isModerator: boolean;
  isOfficial: boolean;
  createdAt: string;
}

export interface ProjectStats {
  id: string;
  totalUsers: number;
  activeUsers: number;
  totalHelpRequests: number;
  totalHelpProvided: number;
  totalMasters: number;
  totalEntrepreneurs: number;
  totalChildren: number;
  totalElderly: number;
  totalReviews: number;
  totalEcoEvents: number;
  totalDeliveries: number;
  updatedAt: string;
}

export interface ProjectReview {
  id: string;
  userId: string;
  userName: string;
  userVillage: string;
  rating: number; // 1-5
  text: string;
  isPublic: boolean;
  createdAt: string;
}

export interface Partner {
  id: string;
  districtName: string;
  contactName: string;
  contactPhone: string;
  selectedPackage: 'local' | 'regional' | 'partner';
  royaltyModel: 'fixed' | 'percent';
  royaltyPercentage: number;
  status: 'pending' | 'approved' | 'rejected';
  signedAgreement: boolean;
  createdAt: string;
  comments?: string;
  userId?: string;
}

export interface License {
  id: string;
  partnerId: string;
  districtName: string;
  licenseType: 'local' | 'regional' | 'partner';
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
}

export interface Contract {
  id: string;
  userId: string;
  userName: string;
  type: 'offer' | 'license' | 'entrepreneur';
  status: 'signed' | 'unsigned' | 'terminated';
  signedAt: string;
  content: string;
  explanations?: Record<string, string>; // explanatory translations for all parties
  ipAddress?: string;
}

export interface FranchiseLead {
  id: string;
  orgName: string;
  regionName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  selectedPackage: 'local' | 'regional' | 'partner';
  comment?: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface GoodNewsComment {
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface GoodNews {
  id: string;
  author: 'dobrynya' | 'alisa' | 'misha' | 'zoia' | 'sofia' | 'petia' | 'resident';
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: 'news' | 'tip' | 'story' | 'announcement';
  likes: number;
  likedBy?: string[];
  comments: GoodNewsComment[];
  isPublished: boolean;
  createdAt: string;
}

export interface PersonaChatMessage {
  sender: 'user' | 'persona';
  text: string;
  createdAt: string;
}

export interface PersonaChat {
  id: string;
  userId: string;
  persona: 'dobrynya' | 'alisa' | 'misha' | 'zoia' | 'sofia' | 'petia';
  messages: PersonaChatMessage[];
  createdAt: string;
}

export type PlaceCategory = 
  | 'historical'
  | 'architecture'
  | 'nature'
  | 'culture'
  | 'education'
  | 'craft'
  | 'religious'
  | 'recreation'
  | 'memorial'
  | 'ecotrail';

export interface PlaceLocation {
  village: string;
  address: string;
  lat: number;
  lng: number;
}

export interface PlaceContact {
  phone?: string;
  website?: string;
  schedule?: string;
}

export interface PlaceRating {
  average: number;
  total: number;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  history?: string;
  location: PlaceLocation;
  images: string[];
  opens?: string;
  contacts?: PlaceContact;
  rating: PlaceRating;
  is_verified: boolean;
  suggested_by?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceReview {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Region {
  id: string;
  name: string;
  packages: ('start' | 'business' | 'government')[];
  modules: {
    help: boolean;
    chat: boolean;
    masters: boolean;
    rating: boolean;
    news: boolean;
    products: boolean;
    transport: boolean;
    ecology: boolean;
    government: boolean;
    sos: boolean;
    analytics?: boolean;
  };
}

// ==========================================
// 🏡 ИНТЕРАКТИВНАЯ ДЕРЕВНЯ (INTERACTIVE VILLAGE ARCHIVE)
// ==========================================

export interface InteractiveVillage {
  id: string;
  name: string;
  region: string;
  district: string;
  map?: string; // image or schematic map url
  description: string;
  coverImage?: string;
  foundedYear?: number;
  housesCount?: number;
  residentsCount?: number;
  heritageFeatures?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface VillageHouse {
  id: string;
  villageId: string;
  address: string; // e.g. "ул. Центральная, д. 5"
  houseNumber: string; // "5"
  street: string; // "ул. Центральная"
  coordinates: {
    lat: number;
    lng: number;
    mapX?: number; // 0 - 100 percentage for village map canvas
    mapY?: number; // 0 - 100 percentage for village map canvas
  };
  photo: string;
  photos?: string[];
  model3D?: string; // 3D viewer model or 360 panorama link
  yearBuilt: number;
  architecturalStyle?: string; // "Северная изба-пятистенок", "Сруб с мезонином", etc.
  residents: string[]; // Resident IDs
  history?: string;
  condition?: 'preserved' | 'renovated' | 'historical_ruin' | 'wooden_heritage';
  memorialPlaque?: MemorialPlaqueConfig;
  createdAt: string;
  updatedAt?: string;
}

export interface ResidentRelative {
  residentId: string;
  relation: 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'grandchild' | 'relative';
  note?: string;
}

export interface ResidentGalleryItem {
  id: string;
  url: string;
  caption: string;
  year?: number;
}

export interface VillageResident {
  id: string;
  houseId: string;
  villageId: string;
  name: string;
  gender?: 'male' | 'female';
  birthYear: number;
  deathYear?: number; // undefined if alive
  birthPlace: string;
  photo: string;
  biography: string;
  achievements: string[];
  relatives: ResidentRelative[];
  isAlive: boolean;
  occupation?: string;
  militaryService?: string; // e.g. "Участник Великой Отечественной войны, труженик тыла"
  gallery?: ResidentGalleryItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface VillageFamilyConnection {
  from: string;
  to: string;
  relation: 'parent' | 'child' | 'spouse' | 'sibling';
}

export interface VillageFamilyTree {
  id: string;
  villageId: string;
  rootResidentId: string;
  connections: VillageFamilyConnection[];
  createdAt: string;
}

export type PlaqueStyle = 'wood' | 'brass' | 'granite' | 'classic';

export interface MemorialPlaqueConfig {
  id?: string;
  houseId: string;
  villageId: string;
  title: string; // e.g. "ДОМ ПЕТРОВЫХ"
  subtitle?: string; // e.g. "Родовое гнездо с 1952 года"
  foundersNames: string[]; // e.g. ["Иван Петров (1930–2005)", "Анна Петрова (1935–2010)"]
  addressText: string;
  style: PlaqueStyle;
  customQuote?: string;
  qrPayload?: string;
  includeQr: boolean;
  orderRequested?: boolean;
  orderStatus?: 'pending' | 'in_production' | 'ready';
  createdAt?: string;
}







