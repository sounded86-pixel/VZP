import { UserProfile, HelpRequest, Chat, Message, Complaint, USTYANY_VILLAGES, Village, getVillageCoords, Entrepreneur, Product, Order, Review, BusRoute, RideOffer, RideRequest, RoadReport, RideReview, Master, PortfolioItem, ServiceOrder, MasterReview } from './types';
import { TEST_ROLES } from './constants/testRoles';

// Seed data
export const INITIAL_USERS: UserProfile[] = [
  {
    id: "user_ivanov",
    name: "Иван Иванов",
    phone: "+7 911 123-45-67",
    avatarUrl: "",
    village: "Березник",
    skills: ["woodcutter", "housekeeper"],
    thanksCount: 14,
    createdCount: 5,
    resolvedCount: 4,
    blocked: false,
    reportsCount: 0
  },
  {
    id: "user_petrov",
    name: "Петр Петров",
    phone: "+7 921 765-43-21",
    avatarUrl: "",
    village: "Шангалы",
    skills: ["tractorist", "driver"],
    thanksCount: 22,
    createdCount: 2,
    resolvedCount: 8,
    blocked: false,
    reportsCount: 0
  },
  {
    id: "user_semenova",
    name: "Анна Семенова",
    phone: "+7 911 555-55-55",
    avatarUrl: "",
    village: "Октябрьский",
    skills: ["medic"],
    thanksCount: 18,
    createdCount: 1,
    resolvedCount: 5,
    blocked: false,
    reportsCount: 0
  },
  {
    id: "user_admin",
    name: "Администратор Модератор",
    phone: "+7 900 000-00-00",
    avatarUrl: "",
    village: "Октябрьский",
    skills: ["lawyer"],
    thanksCount: 100,
    createdCount: 0,
    resolvedCount: 0,
    blocked: false,
    reportsCount: 0,
    role: "main_admin"
  }
];

export const INITIAL_REQUESTS: HelpRequest[] = [
  {
    id: "req_1",
    title: "Нужна помощь с колкой дров на зиму пенсионеру",
    category: "wood",
    description: "Одинокий пенсионер, вчера привезли телегу березовых бревен. Нужно расколоть их колуном и аккуратно сложить в дровяник. Сам не справляюсь из-за больной спины. Колун и дрова на месте, чай и пироги гарантирую!",
    photos: [],
    authorId: "user_ivanov",
    authorName: "Иван Иванов",
    authorPhone: "+7 911 123-45-67",
    authorRating: 14,
    village: "Березник",
    locationDetails: "ул. Набережная, д. 12",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // 36 hours ago
    active: true,
    reportsCount: 0
  },
  {
    id: "req_2",
    title: "Срочно доставить лекарство из Октябрьской аптеки",
    category: "delivery",
    description: "Болеет маленький ребенок, поднялась высокая температура. В нашей амбулатории нет нужной суспензии. Нужно забрать ее в центральной аптеке Октябрьского (рецепт оплачен онлайн) и привезти в д. Ростовское. Сама уехать не могу. Очень прошу помочь!",
    photos: [],
    authorId: "user_semenova",
    authorName: "Анна Семенова",
    authorPhone: "+7 911 555-55-55",
    authorRating: 18,
    village: "Ростовское",
    locationDetails: "д. Ростовское, ул. Центральная, д. 4, кв. 2",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    active: true,
    reportsCount: 0
  },
  {
    id: "req_3",
    title: "Починить завалившееся крыльцо дома",
    category: "carpentry",
    description: "После весеннего паводка и дождей подгнило нижнее бревно опор крыльца, ступеньки сильно перекосились. Пожилой маме трудно заходить в дом. Ищу мастера-плотника с пилой и топором. Материал (доски) есть. Будем очень благодарны!",
    photos: [],
    authorId: "user_ivanov",
    authorName: "Иван Иванов",
    authorPhone: "+7 911 123-45-67",
    authorRating: 14,
    village: "Березник",
    locationDetails: "ул. Набережная, д. 12",
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), // 4 days ago
    active: true,
    reportsCount: 0
  },
  {
    id: "req_4",
    title: "Требуется вспахать огород мотоблоком или трактором",
    category: "tractor",
    description: "Необходимо вспахать огород под посадку картошки, примерно 6-8 соток. Земля сухая, готова к обработке. Желательно со своим мотоблоком или трактором. Расходы на топливо компенсирую, либо помогу в ответ.",
    photos: [],
    authorId: "user_petrov",
    authorName: "Петр Петров",
    authorPhone: "+7 921 765-43-21",
    authorRating: 22,
    village: "Шангалы",
    locationDetails: "Шангалы, ул. Советская, д. 45",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 days ago
    active: true,
    reportsCount: 0
  }
];

export const INITIAL_CHATS: Chat[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_COMPLAINTS: Complaint[] = [];

export const INITIAL_ENTREPRENEURS: Entrepreneur[] = [
  {
    id: "entr_1",
    userId: "user_petrov",
    businessName: "ИП Петров «Устьянские Продукты»",
    contactPhone: "+7 (921) 765-43-21",
    serviceRadius: 50,
    deliverySchedule: {
      monday: ["Березник", "Шангалы", "Ростовское"],
      wednesday: ["Березник", "Шангалы", "Ростовское"],
      friday: ["Березник", "Шангалы", "Ростовское"]
    },
    priceList: [
      { item: "Молоко деревенское 1л", price: 90, unit: "бутылка" },
      { item: "Хлеб пшеничный формовой", price: 45, unit: "буханка" },
      { item: "Творог домашний 500г", price: 180, unit: "пачка" },
      { item: "Яйца домашние С0 10шт", price: 130, unit: "десяток" },
      { item: "Картофель местный 1кг", price: 40, unit: "кг" },
      { item: "Сахар-песок 1кг", price: 80, unit: "кг" },
      { item: "Масло подсолнечное 1л", price: 120, unit: "бутылка" }
    ],
    rating: {
      average: 4.8,
      totalReviews: 3,
      totalOrders: 15,
      completedOrders: 14,
      onTimePercentage: 98
    },
    isVerified: true,
    isActive: true,
    moderationStatus: "approved",
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "entr_2",
    userId: "user_semenova",
    businessName: "Самозанятая Семенова «Домашнее Подворье»",
    contactPhone: "+7 (911) 555-55-55",
    serviceRadius: 30,
    deliverySchedule: {
      tuesday: ["Октябрьский", "Ростовское"],
      thursday: ["Октябрьский", "Ростовское"]
    },
    priceList: [
      { item: "Сметана 15% 300г", price: 110, unit: "банка" },
      { item: "Мясо куриное домашнее 1кг", price: 350, unit: "кг" },
      { item: "Масло сливочное 82.5% 200г", price: 210, unit: "пачка" },
      { item: "Мука пшеничная Устьянская 2кг", price: 115, unit: "пачка" },
      { item: "Свежие огурцы из теплицы 1кг", price: 150, unit: "кг" }
    ],
    rating: {
      average: 4.9,
      totalReviews: 2,
      totalOrders: 8,
      completedOrders: 8,
      onTimePercentage: 100
    },
    isVerified: true,
    isActive: true,
    moderationStatus: "approved",
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "entr_3",
    userId: "user_ivanov",
    businessName: "ИП Иванов «Пекарня и Дрова»",
    contactPhone: "+7 (911) 123-45-67",
    serviceRadius: 20,
    deliverySchedule: {
      saturday: ["Березник", "Шангалы"]
    },
    priceList: [
      { item: "Пирог с брусникой 500г", price: 250, unit: "шт" },
      { item: "Булка дорожная 100г", price: 30, unit: "шт" },
      { item: "Сухари ржаные 300г", price: 60, unit: "пачка" }
    ],
    rating: {
      average: 4.5,
      totalReviews: 1,
      totalOrders: 3,
      completedOrders: 3,
      onTimePercentage: 90
    },
    isVerified: false,
    isActive: true,
    moderationStatus: "pending",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    entrepreneurId: "entr_1",
    name: "Молоко деревенское парное",
    price: 90,
    description: "Натуральное цельное молоко утренней дойки. Жирность 3.6 - 4.2%. Без пастеризации и добавок.",
    category: "dairy",
    unit: "литр",
    stock: 25,
    photoUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_2",
    entrepreneurId: "entr_1",
    name: "Хлеб ржаной на закваске",
    price: 55,
    description: "Ароматный бездрожжевой хлеб, выпеченный в дровяной печи по старинному рецепту.",
    category: "bakery",
    unit: "шт",
    stock: 15,
    photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_3",
    entrepreneurId: "entr_2",
    name: "Масло сливочное домашнее",
    price: 210,
    description: "Настоящее сливочное масло, сбитое вручную из свежих жирных сливок. Жирность 82.5%.",
    category: "dairy",
    unit: "пачка (200г)",
    stock: 10,
    photoUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_4",
    entrepreneurId: "entr_2",
    name: "Свежие огурцы короткоплодные",
    price: 150,
    description: "Сладкие, хрустящие огурчики прямо с куста. Выращены в теплице на натуральном перегное.",
    category: "vegetables",
    unit: "кг",
    stock: 30,
    photoUrl: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&q=80&w=400",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "order_1",
    entrepreneurId: "entr_1",
    entrepreneurBusinessName: "ИП Ермолин (Молоко и Хлеб)",
    userId: "user_ivanov",
    buyerId: "user_ivanov",
    buyerName: "Иван Иванов",
    buyerPhone: "+7 (921) 123-45-67",
    deliveryAddress: "Березник, ул. Набережная, д. 12",
    items: [
      { item: "Молоко деревенское 1л", quantity: 2, unit: "бутылка", price: 90 },
      { item: "Хлеб пшеничный формовой", quantity: 3, unit: "буханка", price: 45 }
    ],
    subtotal: 315,
    deliveryFee: 50,
    total: 365,
    totalAmount: 365,
    status: "delivered",
    requestedDeliveryDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    requestedDeliveryTimeSlot: "12:00 - 15:00",
    preferredDeliveryDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    actualDeliveryDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    reviewId: "rev_1"
  },
  {
    id: "order_2",
    entrepreneurId: "entr_1",
    entrepreneurBusinessName: "ИП Ермолин (Молоко и Хлеб)",
    userId: "user_semenova",
    buyerId: "user_semenova",
    buyerName: "Мария Семенова",
    buyerPhone: "+7 (921) 765-43-21",
    deliveryAddress: "Ростовское, ул. Центральная, д. 4, кв. 2",
    items: [
      { item: "Творог домашний 500г", quantity: 1, unit: "пачка", price: 180 },
      { item: "Яйца домашние С0 10шт", quantity: 2, unit: "десяток", price: 130 }
    ],
    subtotal: 440,
    deliveryFee: 70,
    total: 510,
    totalAmount: 510,
    status: "new",
    requestedDeliveryDate: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    requestedDeliveryTimeSlot: "15:00 - 18:00",
    preferredDeliveryDate: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev_1",
    orderId: "order_1",
    entrepreneurId: "entr_1",
    buyerId: "user_ivanov",
    buyerName: "Иван Иванов",
    rating: 4.8,
    comment: "Очень вкусное парное молоко, хлеб еще теплый привезли! Огромное спасибо!",
    categories: {
      timeliness: 5,
      quality: 5,
      politeness: 5,
      priceFairness: 4
    },
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];


// Helper to estimate real distance between villages in Ustyany District using Haversine formula
export function getDistanceBetweenVillages(v1: string, v2: string): number {
  const village1 = USTYANY_VILLAGES.find(v => v.name === v1);
  const village2 = USTYANY_VILLAGES.find(v => v.name === v2);
  
  if (!village1 || !village2) return 10;
  if (v1 === v2) return 0;
  
  const c1 = getVillageCoords(village1);
  const c2 = getVillageCoords(village2);
  
  const R = 6371; // Earth radius in km
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLon = (c2.lng - c1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// LocalStorage wrappers
const STORAGE_KEYS = {
  USERS: "ustyany_users",
  REQUESTS: "ustyany_requests",
  CHATS: "ustyany_chats",
  MESSAGES: "ustyany_messages",
  COMPLAINTS: "ustyany_complaints",
  ENTREPRENEURS: "ustyany_entrepreneurs",
  PRODUCTS: "ustyany_products",
  ORDERS: "ustyany_orders",
  REVIEWS: "ustyany_reviews",
  ROUTES: "ustyany_routes",
  RIDE_OFFERS: "ustyany_ride_offers",
  RIDE_REQUESTS: "ustyany_ride_requests",
  ROAD_REPORTS: "ustyany_road_reports",
  RIDE_REVIEWS: "ustyany_ride_reviews",
  CURRENT_USER_ID: "ustyany_current_user_id",
  OFFLINE_QUEUE: "ustyany_offline_queue",
  MASTERS: "ustyany_masters",
  PORTFOLIO_ITEMS: "ustyany_portfolio_items",
  SERVICE_ORDERS: "ustyany_service_orders",
  MASTER_REVIEWS: "ustyany_master_reviews"
};

export interface OfflineAction {
  type: 'create_request' | 'send_message' | 'resolve_request' | 'create_order' | 'update_order_status' | 'create_review' | 'create_ride_offer' | 'create_ride_request' | 'create_road_report' | 'create_ride_review';
  payload: any;
  timestamp: string;
}

export const INITIAL_ROUTES: BusRoute[] = [
  {
    id: "route_1",
    departureVillage: "Октябрьский",
    arrivalVillage: "Березник",
    schedule: {
      monday: ["07:30", "12:15", "17:40"],
      tuesday: ["07:30", "12:15", "17:40"],
      wednesday: ["07:30", "12:15", "17:40"],
      thursday: ["07:30", "12:15", "17:40"],
      friday: ["07:30", "12:15", "17:40", "19:20"],
      saturday: ["08:00", "14:30"],
      sunday: ["09:00", "17:40"]
    },
    isActive: true,
    routeNumber: "102",
    price: 150,
    provider: "ООО УстьяныАвто"
  },
  {
    id: "route_2",
    departureVillage: "Октябрьский",
    arrivalVillage: "Шангалы",
    schedule: {
      monday: ["06:40", "08:15", "11:00", "14:15", "16:30", "18:10"],
      tuesday: ["06:40", "08:15", "11:00", "14:15", "16:30", "18:10"],
      wednesday: ["06:40", "08:15", "11:00", "14:15", "16:30", "18:10"],
      thursday: ["06:40", "08:15", "11:00", "14:15", "16:30", "18:10"],
      friday: ["06:40", "08:15", "11:00", "14:15", "16:30", "18:10", "20:00"],
      saturday: ["08:15", "11:00", "14:15", "17:00"],
      sunday: ["10:30", "14:15", "18:10"]
    },
    isActive: true,
    routeNumber: "105",
    price: 80,
    provider: "ООО УстьяныАвто"
  },
  {
    id: "route_3",
    departureVillage: "Октябрьский",
    arrivalVillage: "Бестужево",
    schedule: {
      monday: ["06:00", "15:00"],
      tuesday: ["06:00", "15:00"],
      wednesday: ["06:00", "15:00"],
      thursday: ["06:00", "15:00"],
      friday: ["06:00", "15:00"],
      saturday: ["07:30"],
      sunday: ["16:20"]
    },
    isActive: true,
    routeNumber: "111",
    price: 280,
    provider: "Муниципальный Перевозчик"
  }
];

export const INITIAL_RIDE_OFFERS: RideOffer[] = [
  {
    id: "offer_1",
    userId: "user_petrov",
    userName: "Петр Петров",
    userAvatar: "",
    departureVillage: "Шангалы",
    arrivalVillage: "Октябрьский",
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: "09:00",
    availableSeats: 3,
    price: 100,
    comment: "Еду на легковой машине, багажник пустой. Могу забрать по пути.",
    contactPhone: "+7 921 765-43-21",
    status: "active",
    passengers: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "offer_2",
    userId: "user_ivanov",
    userName: "Иван Иванов",
    userAvatar: "",
    departureVillage: "Березник",
    arrivalVillage: "Ростовское",
    departureDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    departureTime: "14:00",
    availableSeats: 4,
    price: 0,
    comment: "Поеду на ниве, могу забрать посылки или подвезти бесплатно пожилых людей.",
    contactPhone: "+7 911 123-45-67",
    status: "active",
    passengers: [],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_RIDE_REQUESTS: RideRequest[] = [
  {
    id: "request_1",
    userId: "user_ivanov",
    userName: "Иван Иванов",
    userAvatar: "",
    departureVillage: "Березник",
    arrivalVillage: "Октябрьский",
    departureDate: new Date().toISOString().split('T')[0],
    passengers: 1,
    comment: "Очень нужно попасть на прием к врачу в ЦРБ до 11:00.",
    contactPhone: "+7 911 123-45-67",
    status: "active",
    matchedOfferId: "",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ROAD_REPORTS: RoadReport[] = [
  {
    id: "report_1",
    userId: "user_petrov",
    userName: "Петр Петров",
    segmentStart: "Березник",
    segmentEnd: "Едьма",
    condition: "poor",
    comment: "После вчерашнего ливня дорогу сильно размыло, глубокие лужи и глина. На легковой ехать крайне осторожно!",
    photoURL: "",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: "report_2",
    userId: "user_admin",
    userName: "Администратор Модератор",
    segmentStart: "Октябрьский",
    segmentEnd: "Шангалы",
    condition: "good",
    comment: "Трасса сухая, асфальт без повреждений. Движение в штатном режиме.",
    photoURL: "",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_RIDE_REVIEWS: RideReview[] = [
  {
    id: "ride_rev_1",
    rideOfferId: "offer_1",
    reviewerUserId: "user_ivanov",
    reviewerName: "Иван Иванов",
    targetUserId: "user_petrov",
    rating: 4.8,
    categories: {
      punctuality: 5,
      drivingSafety: 4,
      carCleanliness: 5,
      politeness: 5
    },
    comment: "Отличный водитель, приехал ровно в назначенное время, машина чистая, приятный собеседник.",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_MASTERS: Master[] = [
  {
    id: "master_petrov",
    userId: "user_petrov_fictional",
    userName: "Василий Степанович Петров",
    userPhone: "+7 921 475-23-45",
    userVillage: "Березник",
    userAvatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150",
    categories: ["craftsman", "craft_carpenter", "craft_stovemaker"],
    description: "Опытный плотник и печник в третьем поколении. Рублю бани, дома из бруса, ремонтирую покосившиеся деревянные постройки. Складываю и ремонтирую русские печи, голландки, камины любой сложности. Работаю на совесть!",
    experience: "25 лет",
    education: "Среднее профессиональное (Строительный техникум)",
    priceFrom: 1000,
    priceDescription: "за час плотницких работ или индивидуальная смета на печи",
    workingHours: "Пн-Сб 08:00 - 19:00",
    rating: {
      average: 4.9,
      total: 2
    },
    statistics: {
      totalOrders: 42,
      completedOrders: 40,
      onTimePercentage: 98
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "master_kozlov",
    userId: "user_kozlov_fictional",
    userName: "Михаил Юрьевич Козлов",
    userPhone: "+7 911 582-14-78",
    userVillage: "Шангалы",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    categories: ["craftsman", "craft_tractorist", "agriculture", "agri_agronomist"],
    description: "Вспашка огородов, целинных земель собственным трактором МТЗ-82. Косьба травы, уборка сена, расчистка участков от кустарника. Помощь в заготовке дров, валка сложных деревьев на участках.",
    experience: "12 лет",
    education: "Удостоверение тракториста-машиниста кат. B, C, D, E",
    priceFrom: 1500,
    priceDescription: "за сотку вспашки трактором / договорная на дрова",
    workingHours: "Ежедневно 07:00 - 21:00",
    rating: {
      average: 5.0,
      total: 1
    },
    statistics: {
      totalOrders: 56,
      completedOrders: 56,
      onTimePercentage: 100
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "master_morozova",
    userId: "user_morozova_fictional",
    userName: "Елена Николаевна Морозова",
    userPhone: "+7 952 253-11-22",
    userVillage: "Октябрьский",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    categories: ["worker", "work_cleaner", "work_elderly_nurse", "work_tailor"],
    description: "Предлагаю услуги профессиональной уборки квартир, домов и коттеджей (поддерживающая, генеральная, после ремонта). Помощь пожилым людям: покупка продуктов, приготовление еды, уход (опыт работы сиделкой 5 лет). Также шью шторы, подшиваю одежду.",
    experience: "8 лет",
    education: "Среднее медицинское училище",
    priceFrom: 400,
    priceDescription: "за час уборки / ухода за пожилыми",
    workingHours: "Пн-Пт 09:00 - 18:00",
    rating: {
      average: 5.0,
      total: 1
    },
    statistics: {
      totalOrders: 89,
      completedOrders: 89,
      onTimePercentage: 100
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "master_frolov",
    userId: "user_frolov_fictional",
    userName: "Алексей Викторович Фролов",
    userPhone: "+7 902 191-44-55",
    userVillage: "Октябрьский",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    categories: ["logistics", "log_driver_truck", "worker", "work_loader", "log_mechanic"],
    description: "Грузоперевозки на личном автомобиле Газель (фургон до 1.5 тонн) по Устьянскому району и Архангельской области. Помощь в переездах, вывоз строительного мусора. Услуги грузчиков. Мелкий ремонт авто на дороге.",
    experience: "10 лет",
    education: "Водительское удостоверение кат. B, C",
    priceFrom: 700,
    priceDescription: "за час работы Газели по поселку (за город 25 руб/км)",
    workingHours: "Круглосуточно по договоренности",
    rating: {
      average: 4.9,
      total: 0
    },
    statistics: {
      totalOrders: 74,
      completedOrders: 72,
      onTimePercentage: 96
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "master_semenova",
    userId: "user_semenova_fictional",
    userName: "Анна Сергеевна Семенова",
    userPhone: "+7 921 077-88-99",
    userVillage: "Березник",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    categories: ["health", "health_nurse", "health_masseur"],
    description: "Дипломированная медицинская сестра с выездом на дом. Внутримышечные и внутривенные инъекции, капельницы по назначению врача, перевязки. Профессиональный классический, расслабляющий и детский массаж.",
    experience: "15 лет",
    education: "Архангельский медицинский колледж (Сестринское дело), Сертификат массажиста",
    priceFrom: 500,
    priceDescription: "за процедуру инъекции / от 1000 руб за сеанс массажа",
    workingHours: "Ежедневно 08:00 - 20:00",
    rating: {
      average: 5.0,
      total: 0
    },
    statistics: {
      totalOrders: 112,
      completedOrders: 112,
      onTimePercentage: 99
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "master_kuznetsov",
    userId: "user_kuznetsov_fictional",
    userName: "Игорь Владимирович Кузнецов",
    userPhone: "+7 911 654-32-10",
    userVillage: "Строевское",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    categories: ["education", "edu_tutor", "professional", "pro_lawyer"],
    description: "Репетитор по математике, физике и информатике для школьников 5-11 классов. Подготовка к ОГЭ/ЕГЭ. Юридические консультации по земельным вопросам, наследству, оформлению недвижимости в деревне.",
    experience: "14 лет",
    education: "Высшее педагогическое (САФУ), Высшее юридическое",
    priceFrom: 600,
    priceDescription: "за академический час (45 минут) обучения или консультацию",
    workingHours: "Пн-Пт 15:00 - 20:00, Сб 10:00 - 16:00",
    rating: {
      average: 4.7,
      total: 0
    },
    statistics: {
      totalOrders: 29,
      completedOrders: 29,
      onTimePercentage: 100
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "master_sobolev",
    userId: "user_sobolev_fictional",
    userName: "Дмитрий Александрович Соболев",
    userPhone: "+7 960 011-22-33",
    userVillage: "Бестужево",
    userAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    categories: ["art", "art_wood_carver", "art_blacksmith"],
    description: "Ручное изготовление уникальной резной мебели, наличников, деревянной посуды, сувениров с традиционной северной резьбой. Художественная ковка: подсвечники, решетки, петли, садовый декор. Провожу мастер-классы для детей и взрослых.",
    experience: "20 лет",
    education: "Архангельское училище культуры и искусств (Декоративно-прикладное искусство)",
    priceFrom: 1200,
    priceDescription: "за базовое кованое изделие или мелкую деревянную утварь",
    workingHours: "Пн-Сб 10:00 - 18:00",
    rating: {
      average: 5.0,
      total: 1
    },
    statistics: {
      totalOrders: 35,
      completedOrders: 34,
      onTimePercentage: 97
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "master_sidorov",
    userId: "user_sidorov_fictional",
    userName: "Дмитрий Семёнович Сидоров",
    userPhone: "+7 931 405-12-34",
    userVillage: "Октябрьский",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    categories: ["government", "gov_precinct_officer"],
    description: "Участковый уполномоченный полиции ОМВД по Устьянскому району. Прием граждан по вопросам правопорядка, семейных споров, нарушения тишины, сохранности имущества.",
    experience: "10 лет",
    education: "Нижегородская академия МВД РФ (Юриспруденция)",
    priceFrom: 0,
    priceDescription: "бесплатно (в рамках государственной службы)",
    workingHours: "Пн-Пт 09:00 - 18:00",
    rating: {
      average: 5.0,
      total: 0
    },
    statistics: {
      totalOrders: 12,
      completedOrders: 12,
      onTimePercentage: 100
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "master_ivanov",
    userId: "user_ivanov_fictional",
    userName: "Сергей Александрович Иванов",
    userPhone: "+7 911 404-56-78",
    userVillage: "Шангалы",
    userAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    categories: ["digital", "dig_programmer", "dig_repair_computers"],
    description: "Разработка сайтов, настройка компьютеров, установка программного обеспечения. Ремонт телефонов и оргтехники. Прокладка локальных сетей в домах и офисах.",
    experience: "6 лет",
    education: "Высшее IT (САФУ)",
    priceFrom: 500,
    priceDescription: "за услугу настройки / ремонта",
    workingHours: "Ежедневно 10:00 - 20:00",
    rating: {
      average: 5.0,
      total: 0
    },
    statistics: {
      totalOrders: 8,
      completedOrders: 8,
      onTimePercentage: 100
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "port_petrov_1",
    masterId: "master_petrov",
    title: "Русская печь с лежанкой",
    description: "Сложенная с нуля русская классическая печь с обогревательным щитком и удобной лежанкой в новом деревянном доме в Березниках.",
    category: "construction",
    photos: ["https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600"],
    location: "Березник",
    price: 45000,
    date: "2026-05-15",
    createdAt: new Date().toISOString()
  },
  {
    id: "port_petrov_2",
    masterId: "master_petrov",
    title: "Сруб бани 4х4 из оцилиндрованного бревна",
    description: "Полная сборка сруба бани на столбчатом фундаменте. Утепление межвенцовым джутом, врезка балок пола и потолка.",
    category: "construction",
    photos: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600"],
    location: "Березник",
    price: 85000,
    date: "2026-06-20",
    createdAt: new Date().toISOString()
  },
  {
    id: "port_kozlov_1",
    masterId: "master_kozlov",
    title: "Вспашка целинного участка трактором МТЗ-82",
    description: "Разработка заброшенного участка (бывшее пастбище), вспашка плугом в два следа и дискование под картофель.",
    category: "agriculture",
    photos: ["https://images.unsplash.com/photo-1594913785162-e67853119ac0?auto=format&fit=crop&q=80&w=600"],
    location: "Шангалы",
    price: 3000,
    date: "2026-05-10",
    createdAt: new Date().toISOString()
  },
  {
    id: "port_kozlov_2",
    masterId: "master_kozlov",
    title: "Укладка штабеля дров березовых",
    description: "Распиловка, колка и сухая укладка 5 кубометров березовых дров в красивую поленницу (дровяник).",
    category: "agriculture",
    photos: ["https://images.unsplash.com/photo-1542397284385-6010176424d2?auto=format&fit=crop&q=80&w=600"],
    location: "Шангалы",
    price: 2500,
    date: "2026-06-02",
    createdAt: new Date().toISOString()
  },
  {
    id: "port_sobolev_1",
    masterId: "master_sobolev",
    title: "Резной обеденный стол из массива сосны",
    description: "Эксклюзивный обеденный стол с ручной резьбой по периметру столешницы и балясинам ножек. Покрытие натуральным воском.",
    category: "crafts",
    photos: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"],
    location: "Бестужево",
    price: 18000,
    date: "2026-04-22",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MASTER_REVIEWS: MasterReview[] = [
  {
    id: "rev_petrov_1",
    orderId: "order_fict_1",
    masterId: "master_petrov",
    clientId: "user_ivanov",
    clientName: "Иван Иванов",
    rating: 5,
    categories: { quality: 5, timeliness: 5, politeness: 5, priceQuality: 5 },
    comment: "Василий Степанович сложил нам шикарную печку в доме! Греет отлично, тяга прекрасная, не дымит абсолютно. Настоящий мастер своего дела, рекомендую всем!",
    isAnonymous: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "rev_petrov_2",
    orderId: "order_fict_2",
    masterId: "master_petrov",
    clientId: "user_sidorov",
    clientName: "Алексей Сидоров",
    rating: 4.8,
    categories: { quality: 5, timeliness: 4, politeness: 5, priceQuality: 5 },
    comment: "Очень хорошо починил крыльцо у бабушкиного дома. Все крепко, надежно, ступени ровные. Немного задержался с приездом, но сделал все на совесть.",
    isAnonymous: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "rev_kozlov_1",
    orderId: "order_fict_3",
    masterId: "master_kozlov",
    clientId: "user_ivanov",
    clientName: "Иван Иванов",
    rating: 5,
    categories: { quality: 5, timeliness: 5, politeness: 5, priceQuality: 5 },
    comment: "Заказывал вспашку 10 соток огорода трактором. Михаил приехал точно в оговоренное время, вспахал ровно и глубоко. Спасибо большое за оперативность!",
    isAnonymous: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "rev_morozova_1",
    orderId: "order_fict_4",
    masterId: "master_morozova",
    clientId: "user_ivanov",
    clientName: "Иван Иванов",
    rating: 5,
    categories: { quality: 5, timeliness: 5, politeness: 5, priceQuality: 5 },
    comment: "Большое спасибо Елене за добросовестный уход за моей бабушкой в Октябрьском. Очень отзывчивая, аккуратная, всегда измерит давление, вовремя даст лекарства и приготовит вкусный обед. Душевный человек!",
    isAnonymous: false,
    createdAt: new Date().toISOString()
  }
];

export function initializeStorage() {
  let usersList: UserProfile[] = [];
  let updated = false;

  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!usersStr) {
    usersList = [...INITIAL_USERS, ...TEST_ROLES];
    updated = true;
  } else {
    try {
      usersList = JSON.parse(usersStr) as UserProfile[];
    } catch (e) {
      usersList = [...INITIAL_USERS, ...TEST_ROLES];
      updated = true;
    }
  }

  // Ensure all TEST_ROLES are present in storage
  TEST_ROLES.forEach(tr => {
    const found = usersList.some(u => u.id === tr.id);
    if (!found) {
      usersList.push(tr);
      updated = true;
    }
  });

  const adminIdx = usersList.findIndex(u => u.id === 'user_admin');
  if (adminIdx === -1) {
    const adminUser = INITIAL_USERS.find(u => u.id === 'user_admin');
    if (adminUser) {
      usersList.push(adminUser);
      updated = true;
    }
  } else {
    // Force active main_admin role and unblocked status
    if (usersList[adminIdx].role !== 'main_admin' || usersList[adminIdx].blocked) {
      usersList[adminIdx].role = 'main_admin';
      usersList[adminIdx].blocked = false;
      updated = true;
    }
  }

  // Ensure every single user has a valid referral code
  usersList.forEach(u => {
    if (!u.referrals || !u.referrals.code) {
      const digits = Math.floor(1000 + Math.random() * 9000);
      const letters = Array.from({ length: 3 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]).join('');
      u.referrals = {
        code: `UST-${digits}-${letters}`,
        total: u.referrals?.total || 0,
        totalEarnedPoints: u.referrals?.totalEarnedPoints || 0,
        history: u.referrals?.history || []
      };
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENTREPRENEURS)) {
    localStorage.setItem(STORAGE_KEYS.ENTREPRENEURS, JSON.stringify(INITIAL_ENTREPRENEURS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROUTES)) {
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(INITIAL_ROUTES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RIDE_OFFERS)) {
    localStorage.setItem(STORAGE_KEYS.RIDE_OFFERS, JSON.stringify(INITIAL_RIDE_OFFERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RIDE_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.RIDE_REQUESTS, JSON.stringify(INITIAL_RIDE_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROAD_REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.ROAD_REPORTS, JSON.stringify(INITIAL_ROAD_REPORTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RIDE_REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.RIDE_REVIEWS, JSON.stringify(INITIAL_RIDE_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MASTERS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERS) || '[]').length === 0) {
    localStorage.setItem(STORAGE_KEYS.MASTERS, JSON.stringify(INITIAL_MASTERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIO_ITEMS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO_ITEMS) || '[]').length === 0) {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO_ITEMS, JSON.stringify(INITIAL_PORTFOLIO_ITEMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICE_ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.SERVICE_ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MASTER_REVIEWS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTER_REVIEWS) || '[]').length === 0) {
    localStorage.setItem(STORAGE_KEYS.MASTER_REVIEWS, JSON.stringify(INITIAL_MASTER_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, "user_ivanov"); // default to Ivanov
  }
  if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]').length === 0) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
}

export function getFromStorage<T>(key: string): T {
  const data = localStorage.getItem(key);
  return data ? (JSON.parse(data) as T) : ([] as unknown as T);
}

export function saveToStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Specific Getters & Setters
export const getStoredUsers = (): UserProfile[] => getFromStorage<UserProfile[]>(STORAGE_KEYS.USERS);
export const saveStoredUsers = (users: UserProfile[]) => saveToStorage(STORAGE_KEYS.USERS, users);

export const getStoredProducts = (): Product[] => getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS);
export const saveStoredProducts = (products: Product[]) => saveToStorage(STORAGE_KEYS.PRODUCTS, products);

export const getStoredRequests = (): HelpRequest[] => getFromStorage<HelpRequest[]>(STORAGE_KEYS.REQUESTS);
export const saveStoredRequests = (requests: HelpRequest[]) => saveToStorage(STORAGE_KEYS.REQUESTS, requests);

export const getStoredChats = (): Chat[] => getFromStorage<Chat[]>(STORAGE_KEYS.CHATS);
export const saveStoredChats = (chats: Chat[]) => saveToStorage(STORAGE_KEYS.CHATS, chats);

export const getStoredMessages = (): Message[] => getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES);
export const saveStoredMessages = (messages: Message[]) => saveToStorage(STORAGE_KEYS.MESSAGES, messages);

export const getStoredComplaints = (): Complaint[] => getFromStorage<Complaint[]>(STORAGE_KEYS.COMPLAINTS);
export const saveStoredComplaints = (complaints: Complaint[]) => saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);

export const getStoredEntrepreneurs = (): Entrepreneur[] => getFromStorage<Entrepreneur[]>(STORAGE_KEYS.ENTREPRENEURS);
export const saveStoredEntrepreneurs = (entrepreneurs: Entrepreneur[]) => saveToStorage(STORAGE_KEYS.ENTREPRENEURS, entrepreneurs);

export const getStoredOrders = (): Order[] => getFromStorage<Order[]>(STORAGE_KEYS.ORDERS);
export const saveStoredOrders = (orders: Order[]) => saveToStorage(STORAGE_KEYS.ORDERS, orders);

export const getStoredReviews = (): Review[] => getFromStorage<Review[]>(STORAGE_KEYS.REVIEWS);
export const saveStoredReviews = (reviews: Review[]) => saveToStorage(STORAGE_KEYS.REVIEWS, reviews);

export const getStoredRoutes = (): BusRoute[] => getFromStorage<BusRoute[]>(STORAGE_KEYS.ROUTES);
export const saveStoredRoutes = (routes: BusRoute[]) => saveToStorage(STORAGE_KEYS.ROUTES, routes);

export const getStoredRideOffers = (): RideOffer[] => getFromStorage<RideOffer[]>(STORAGE_KEYS.RIDE_OFFERS);
export const saveStoredRideOffers = (offers: RideOffer[]) => saveToStorage(STORAGE_KEYS.RIDE_OFFERS, offers);

export const getStoredRideRequests = (): RideRequest[] => getFromStorage<RideRequest[]>(STORAGE_KEYS.RIDE_REQUESTS);
export const saveStoredRideRequests = (requests: RideRequest[]) => saveToStorage(STORAGE_KEYS.RIDE_REQUESTS, requests);

export const getStoredRoadReports = (): RoadReport[] => getFromStorage<RoadReport[]>(STORAGE_KEYS.ROAD_REPORTS);
export const saveStoredRoadReports = (reports: RoadReport[]) => saveToStorage(STORAGE_KEYS.ROAD_REPORTS, reports);

export const getStoredRideReviews = (): RideReview[] => getFromStorage<RideReview[]>(STORAGE_KEYS.RIDE_REVIEWS);
export const saveStoredRideReviews = (reviews: RideReview[]) => saveToStorage(STORAGE_KEYS.RIDE_REVIEWS, reviews);

export const getStoredMasters = (): Master[] => getFromStorage<Master[]>(STORAGE_KEYS.MASTERS);
export const saveStoredMasters = (masters: Master[]) => saveToStorage(STORAGE_KEYS.MASTERS, masters);

export const getStoredPortfolioItems = (): PortfolioItem[] => getFromStorage<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO_ITEMS);
export const saveStoredPortfolioItems = (items: PortfolioItem[]) => saveToStorage(STORAGE_KEYS.PORTFOLIO_ITEMS, items);

export const getStoredServiceOrders = (): ServiceOrder[] => getFromStorage<ServiceOrder[]>(STORAGE_KEYS.SERVICE_ORDERS);
export const saveStoredServiceOrders = (orders: ServiceOrder[]) => saveToStorage(STORAGE_KEYS.SERVICE_ORDERS, orders);

export const getStoredMasterReviews = (): MasterReview[] => getFromStorage<MasterReview[]>(STORAGE_KEYS.MASTER_REVIEWS);
export const saveStoredMasterReviews = (reviews: MasterReview[]) => saveToStorage(STORAGE_KEYS.MASTER_REVIEWS, reviews);

export const getStoredCurrentUserId = (): string => localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || "user_ivanov";
export const saveStoredCurrentUserId = (userId: string) => localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);

export const getStoredOfflineQueue = (): OfflineAction[] => getFromStorage<OfflineAction[]>(STORAGE_KEYS.OFFLINE_QUEUE);
export const saveStoredOfflineQueue = (queue: OfflineAction[]) => saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, queue);
