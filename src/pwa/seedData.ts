import { HelpItem } from './types';

const NOW = Date.now();
const HOUR = 3600 * 1000;

export const INITIAL_ITEMS: HelpItem[] = [
  // --- НУЖНА ПОМОЩЬ (Requests) ---
  {
    id: 'req-1',
    type: 'request',
    category: 'medicine',
    settlement: 'Шангалы',
    region: 'Архангельская область',
    country: 'Россия',
    description: 'Нужно привезти сердечные капли и мазь из аптеки в пос. Октябрьский для пожилой мамы. Рецепт на руках.',
    phone: '+7 (921) 472-33-14',
    author: 'Анна Васильевна',
    status: 'active',
    createdAt: NOW - HOUR * 2
  },
  {
    id: 'req-2',
    type: 'request',
    category: 'transport',
    settlement: 'Каскелен',
    region: 'Алматинская область',
    country: 'Казахстан',
    description: 'Ищу попутку до Алматы в понедельник к 8:30 утра. Разделим расходы на бензин.',
    phone: '+7 (701) 456-78-90',
    author: 'Нурлан',
    telegram: 'nurlan_kz',
    status: 'active',
    createdAt: NOW - HOUR * 4
  },
  {
    id: 'req-3',
    type: 'request',
    category: 'household',
    settlement: 'Мотоль',
    region: 'Брестская область',
    country: 'Беларусь',
    description: 'Нужна помощь распилить брёвна на дрова и сложить во дворе, бензопила есть.',
    phone: '+375 (29) 612-34-56',
    author: 'Василий Степанович',
    status: 'active',
    createdAt: NOW - HOUR * 7
  },
  {
    id: 'req-4',
    type: 'request',
    category: 'medicine',
    settlement: 'Каневская',
    region: 'Краснодарский край (Кубань)',
    country: 'Россия',
    description: 'Кто едет из Краснодара в станицу? Нужно забрать ингалятор в медтехнике.',
    phone: '+7 (918) 321-45-67',
    author: 'Наталья',
    status: 'active',
    createdAt: NOW - HOUR * 10
  },
  {
    id: 'req-5',
    type: 'request',
    category: 'transport',
    settlement: 'Бостанлык (Чарвак)',
    region: 'Ташкентская область (Узбекистан)',
    country: 'Узбекистан',
    description: 'Ищем машину отвезти бабушку на приём к кардиологу в Чирчик в среду.',
    phone: '+998 (90) 123-45-67',
    author: 'Фарход',
    status: 'active',
    createdAt: NOW - HOUR * 14
  },
  {
    id: 'req-6',
    type: 'request',
    category: 'household',
    settlement: 'Березник',
    region: 'Архангельская область',
    country: 'Россия',
    description: 'Застряла машина в колее после дождя у съезда к реке. Нужен УАЗ или трактор дернуть тросом.',
    phone: '+7 (953) 267-11-20',
    author: 'Виктор',
    status: 'active',
    createdAt: NOW - HOUR * 20
  },

  // --- МОГУ ПОМОЧЬ (Offers) ---
  {
    id: 'off-1',
    type: 'offer',
    category: 'transport',
    settlement: 'Октябрьский',
    region: 'Архангельская область',
    country: 'Россия',
    description: 'Еду в Вельск в среду утром на Ниве (выезд в 7:30). Есть 2 свободных места, могу взять попутчиков.',
    phone: '+7 (921) 819-22-30',
    author: 'Андрей (водитель)',
    telegram: 'andrey_auto29',
    status: 'active',
    createdAt: NOW - HOUR * 3
  },
  {
    id: 'off-2',
    type: 'offer',
    category: 'transport',
    settlement: 'Бурабай (Боровое)',
    region: 'Акмолинская область',
    country: 'Казахстан',
    description: 'Еду через Щучинск в Астану в пятницу в 14:00. Просторный багажник, могу взять попутчиков или посылку.',
    phone: '+7 (777) 890-12-34',
    author: 'Серик',
    status: 'active',
    createdAt: NOW - HOUR * 5
  },
  {
    id: 'off-3',
    type: 'offer',
    category: 'medicine',
    settlement: 'Острошицкий Городок',
    region: 'Минская область',
    country: 'Беларусь',
    description: 'Каждый день бываю в Минске около метро Уручье. Могу привезти лекарства и детское питание.',
    phone: '+375 (44) 765-43-21',
    author: 'Александр',
    status: 'active',
    createdAt: NOW - HOUR * 8
  },
  {
    id: 'off-4',
    type: 'offer',
    category: 'household',
    settlement: 'Дивеево',
    region: 'Нижегородская область',
    country: 'Россия',
    description: 'Есть мотокультиватор и сварочный аппарат. Помогу вспахать огород или подварить ворота.',
    phone: '+7 (904) 555-12-34',
    author: 'Николай Иванович',
    status: 'active',
    createdAt: NOW - HOUR * 12
  },
  {
    id: 'off-5',
    type: 'offer',
    category: 'transport',
    settlement: 'Чолпон-Ата',
    region: 'Иссык-Кульская область (Кыргызстан)',
    country: 'Кыргызстан',
    description: 'Регулярно курсирую по маршруту Чолпон-Ата — Балыкчы — Бишкек. Возьму попутчиков.',
    phone: '+996 (555) 32-11-00',
    author: 'Азамат',
    status: 'active',
    createdAt: NOW - HOUR * 16
  }
];
