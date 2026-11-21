export type HelpType = 'request' | 'offer'; // 'request' = Нужна помощь, 'offer' = Могу помочь
export type HelpCategory = 'transport' | 'medicine' | 'household';

export interface HelpItem {
  id: string;
  type: HelpType;
  category: HelpCategory;
  settlement: string; // Название населенного пункта (село/деревня/райцентр)
  region?: string; // Область / край / республика
  country?: string; // Россия, Беларусь, Казахстан, СНГ
  description: string; // Краткое описание (1-2 предложения)
  phone: string; // Номер телефона для прямой связи
  author: string; // Имя автора
  telegram?: string; // Логин Telegram (необязательно)
  whatsapp?: string; // Номер WhatsApp (необязательно)
  status: 'active' | 'completed';
  createdAt: number; // Timestamp
  syncedToWebhook?: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  settlement: string;
  region?: string;
  country?: string;
  telegram?: string;
  pushSubscribed?: boolean;
}

export interface WebhookConfig {
  url: string; // URL вебхука (Make.com, n8n, Zapier, Google Sheets / Apps Script, Airtable)
  enabled: boolean;
  lastSent?: number;
}

export const POPULAR_VILLAGES = [
  'Шангалы',
  'Октябрьский',
  'Березник',
  'Кизема',
  'Тарногский Городок',
  'Вельск',
  'Каневская',
  'Вёшенская',
  'Дивеево',
  'Мир',
  'Мотоль',
  'Острошицкий Городок',
  'Каскелен',
  'Бурабай',
  'Зеренда',
  'Сарыагаш',
  'Бостанлык',
  'Чолпон-Ата'
];

export const CATEGORY_LABELS: Record<HelpCategory, { label: string; icon: string; emoji: string; short: string }> = {
  transport: {
    label: 'Транспорт / Поездки',
    icon: 'Car',
    emoji: '🚗',
    short: 'Транспорт'
  },
  medicine: {
    label: 'Закупки / Лекарства',
    icon: 'Pill',
    emoji: '💊',
    short: 'Лекарства'
  },
  household: {
    label: 'Быт / Срочная помощь',
    icon: 'Wrench',
    emoji: '🛠️',
    short: 'Быт'
  }
};
