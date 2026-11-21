import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, Search, ChevronDown, ChevronUp, BookOpen, HandHeart, 
  MessageSquare, Star, Car, ShieldCheck, WifiOff, ArrowLeft, 
  Sparkles, CheckCircle2, AlertCircle, Heart, Phone, Send, X
} from 'lucide-react';
import { UserProfile } from '../types';

interface FaqScreenProps {
  currentUser: UserProfile;
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

interface FaqItem {
  id: string;
  category: 'start' | 'help' | 'chat' | 'rating' | 'rides' | 'rules' | 'offline';
  question: string;
  answer: string;
  highlight?: string;
  steps?: string[];
}

const FAQ_DATA: FaqItem[] = [
  // 1. С чего начать
  {
    id: 'start_1',
    category: 'start',
    question: 'Что такое платформа «Взаимопомощь»?',
    answer: '«Взаимопомощь» — это бесплатное районное приложение для жителей сёл и деревень. Здесь соседи помогают друг другу в бытовых делах: наколоть дрова, привезти продукты или лекарства из райцентра, вспахать огород, подвезти на машине или починить забор.',
    highlight: 'Здесь нет рекламы, тарифов или платных подписок. Всё создано для людей и держится на добрых отношениях.'
  },
  {
    id: 'start_2',
    category: 'start',
    question: 'Как выбрать свою деревню или село?',
    answer: 'При первом входе или в разделе «Профиль» выберите свой населенный пункт из списка. Все объявления в ленте будут автоматически подстраиваться под ваше село и ближайших соседей.',
    steps: [
      'Откройте раздел «Профиль» (кнопка внизу или на главном экране)',
      'Нажмите «Редактировать профиль»',
      'В строке «Населённый пункт» начните вводить название вашей деревни',
      'Нажмите «Сохранить»'
    ]
  },
  {
    id: 'start_3',
    category: 'start',
    question: 'Виден ли мой номер телефона всем подряд?',
    answer: 'Нет! Мы строго бережем конфиденциальность жителей. В общей ленте номер телефона скрыт. Ваш номер увидит только конкретный сосед, с которым вы вступили в диалог по объявлению и договорились о помощи.',
    highlight: 'Полная защита от спама и нежелательных звонков.'
  },
  {
    id: 'start_4',
    category: 'start',
    question: 'Доступно ли приложение в RuStore на телефонах Android?',
    answer: 'Да! Приложение подготовленно для официального каталога приложений RuStore. Вы можете скачать его на любой смартфон Android или добавить на экран через мобильный браузер.',
    highlight: '100% бесплатно, безопасно и адаптировано для слабых сетей и офлайна.'
  },

  // 2. Просьбы и помощь
  {
    id: 'help_1',
    category: 'help',
    question: 'Как попросить о помощи соседей?',
    answer: 'Если вам тяжело сделать что-то одному или требуется мужская сила, инструмент или транспорт, просто опубликуйте просьбу:',
    steps: [
      'Нажмите кнопку «🤝 Помощь рядом» на главном экране',
      'Нажмите зеленую кнопку «Попросить помощи»',
      'Коротко напишите, что случилось (например, «Помочь сложить дрова»)',
      'Выберите категорию и укажите, сколько готовы заплатить или выберите «Бесплатно, по-соседски»',
      'Нажмите «Опубликовать просьбу»'
    ]
  },
  {
    id: 'help_2',
    category: 'help',
    question: 'Обязательно ли платить за помощь?',
    answer: 'Нет, совершенно не обязательно! Большинство просьб в деревнях решаются бесплатно по-соседски. Но если дело сложное, требует бензина или тяжелого труда, вы можете предложить небольшое вознаграждение (100 ₽, 300 ₽, 500 ₽ или свою сумму).',
    highlight: 'Вы сами выбираете: «Бесплатно по-соседски» или платное вознаграждение.'
  },
  {
    id: 'help_3',
    category: 'help',
    question: 'Как предложить свои руки или навыки?',
    answer: 'Если у вас есть свободное время, трактор, бензопила или вы умеете ремонтировать печи и проводку, нажмите кнопку «Предложить помощь» в разделе «Помощь рядом». Ваше предложение увидят все земляки.',
    steps: [
      'Перейдите в «Помощь рядом» → вкладка «Предложения помощи»',
      'Нажмите «+ Добавить своё предложение»',
      'Укажите, чем готовы помочь (например, «Расколю дрова со своим колуном»)',
      'Опубликуйте предложение'
    ]
  },
  {
    id: 'help_4',
    category: 'help',
    question: 'Что делать после того, как мне помогли?',
    answer: 'Обязательно зайдите в переписку с помощником и нажмите кнопку «Помощь получена (Закрыть дело)». При этом помощнику автоматически начислятся баллы «Спасибо», а ваше дело перейдет в красивую ленту «Добрые дела района».',
    highlight: 'Благодарность поднимает настроение и уважение среди односельчан!'
  },

  // 3. Чат и переписка
  {
    id: 'chat_1',
    category: 'chat',
    question: 'Когда появляется чат с соседом?',
    answer: 'Чат создается автоматически в тот момент, когда кто-то откликается на вашу просьбу, либо когда вы сами откликаетесь на объявление соседа. Это защищает жителей от лишних сообщений.',
    steps: [
      'В ленте нажмите «Откликнуться» на интересное объявление',
      'Подтвердите согласие или предложите удобное время',
      'Откроется личная переписка в разделе «Сообщения»'
    ]
  },
  {
    id: 'chat_2',
    category: 'chat',
    question: 'Можно ли позвонить соседу по сотовой связи?',
    answer: 'Да! Внутри открытого чата сверху есть кнопка с номером телефона. Нажав на неё, вы можете сразу совершить обычный звонок по телефону через SIM-карту без расхода интернет-трафика.',
    highlight: 'Удобно для старшего поколения: можно сразу созвониться голосом.'
  },

  // 4. Рейтинг «Спасибо» и звания
  {
    id: 'rating_1',
    category: 'rating',
    question: 'Что такое рейтинг «Спасибо»?',
    answer: '«Спасибо» — это народный показатель надежности жителя. За каждое выполненное доброе дело сосед ставит вам сердечко и добавляет баллы благодарности.',
    highlight: 'Чем больше у жителя «Спасибо», тем выше доверие к нему во всем районе.'
  },
  {
    id: 'rating_2',
    category: 'rating',
    question: 'Какие звания можно получить?',
    answer: 'По мере накопления добрых дел жителю присваиваются почетные звания:',
    steps: [
      '🌱 «Новый сосед» — стартовый уровень каждого новичка',
      '🤝 «Добрый сосед» — от 10 «Спасибо»',
      '⭐ «Надёжный помощник» — от 25 «Спасибо»',
      '🏆 «Мастер на все руки» — от 50 «Спасибо»',
      '👑 «Почётный житель села» — от 100 «Спасибо»'
    ]
  },

  // 5. Попутки и поездки
  {
    id: 'rides_1',
    category: 'rides',
    question: 'Как работает поиск попуток?',
    answer: 'В разделе «Попутки» водители, которые едут в райцентр, больницу или соседнее село, публикуют время выезда и свободные места в машине. Пассажиры могут забронировать место или написать свою просьбу «Ищу машину».',
    highlight: 'Это помогает сэкономить на такси и не ждать редкий автобус.'
  },
  {
    id: 'rides_2',
    category: 'rides',
    question: 'Безопасно ли ездить с попутчиками?',
    answer: 'Мы рекомендуем обращать внимание на звание и рейтинг «Спасибо» у водителя или попутчика. Все участники — это реальные жители района, зарегистрированные с указанием деревни.',
    steps: [
      'Перед поездкой посмотрите профиль водителя',
      'Созвонитесь заранее и уточните место посадки',
      'После поездки обязательно поблагодарите водителя'
    ]
  },

  // 6. Правила общения
  {
    id: 'rules_1',
    category: 'rules',
    question: 'Какие главные правила сообщества «Взаимопомощь»?',
    answer: 'Наша платформа построена на принципах добрососедства, уважения и честности. Чтобы всем было приятно пользоваться сервисом, соблюдайте 5 простых правил:',
    steps: [
      '1. Вежливость и уважение: обращайтесь к соседям доброжелательно, без грубости и перехода на личности.',
      '2. Выполняйте обещания: если договорились прийти в 14:00 помочь — приходите вовремя либо предупредите заранее по телефону.',
      '3. Никакого спама и сторонней рекламы: запрещено размещать коммерческие баннеры, ссылки на микрозаймы, пирамиды или казино.',
      '4. Запрет на политику и споры: платформа предназначена только для бытовой взаимопомощи и добрых дел.',
      '5. Безопасность: не передавайте банковские реквизиты, пароли из СМС и коды от Госуслуг.'
    ]
  },
  {
    id: 'rules_2',
    category: 'rules',
    question: 'Что делать, если объявление подозрительное или нарушает правила?',
    answer: 'На каждом объявлении и в каждом чате есть кнопка «Пожаловаться». Модераторы оперативно проверяют сигналы и при необходимости блокируют недобросовестных пользователей для защиты спокойствия жителей.',
    highlight: 'Нарушители правил немедленно лишаются доступа к платформе.'
  },

  // 7. Офлайн-режим
  {
    id: 'offline_1',
    category: 'offline',
    question: 'Работает ли приложение в лесу или при плохом интернете?',
    answer: 'Да! Мы специально оптимизировали платформу для сельской местности и слабых сетей 2G/3G. Если интернет пропал, вы можете спокойно составить просьбу или заметку — она сохранится на вашем телефоне в «Офлайн-очереди» и сама отправится на сервер, как только телефон поймает сеть.',
    highlight: 'Никакие данные не потеряются даже при полном отсутствии связи.'
  }
];

export default function FaqScreen({ currentUser, onBack, onNavigate }: FaqScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<string[]>(['start_1', 'help_1']);
  
  // Feedback modal state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const categories = [
    { id: 'all', label: 'Все вопросы', icon: HelpCircle },
    { id: 'start', label: '🔰 С чего начать', icon: BookOpen },
    { id: 'help', label: '🤝 Просьбы и помощь', icon: HandHeart },
    { id: 'chat', label: '💬 Чат и звонки', icon: MessageSquare },
    { id: 'rating', label: '⭐ Рейтинг и звания', icon: Star },
    { id: 'rides', label: '🚗 Попутки', icon: Car },
    { id: 'rules', label: '📜 Правила общения', icon: ShieldCheck },
    { id: 'offline', label: '📶 Без интернета', icon: WifiOff },
  ];

  // Filter questions based on search query and selected category
  const filteredFaq = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.highlight && item.highlight.toLowerCase().includes(q)) ||
        (item.steps && item.steps.some(s => s.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    // Simulate sending support ticket
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setIsSupportModalOpen(false);
      setSupportMessage('');
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 animate-fadeIn" id="faq_screen">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-all font-bold mb-4 cursor-pointer"
        id="faq_back_btn"
      >
        <ArrowLeft size={16} />
        <span>Назад на главную</span>
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-teal-700/40 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
          <HelpCircle size={180} />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={12} className="text-yellow-300 animate-pulse" />
            <span>База знаний и справочник жителя</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Помощь и частые вопросы (FAQ)
          </h1>

          <p className="text-xs sm:text-sm text-teal-100 font-medium max-w-2xl leading-relaxed">
            Здесь собраны подробные ответы на вопросы о работе платформы «Взаимопомощь», советы для новичков и золотые правила добрососедского общения.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="mt-6 relative max-w-2xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти ответ (например: дрова, телефон, рейтинг, попутки)..."
            className="w-full pl-11 pr-10 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 font-bold text-xs sm:text-sm rounded-2xl shadow-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm scale-102'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredFaq.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-100 space-y-3">
            <span className="text-4xl">🔍</span>
            <h3 className="text-base font-black text-slate-800">
              По вашему запросу ничего не найдено
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Попробуйте изменить формулировку или выберите нужную категорию выше. Также вы можете задать вопрос модератору напрямую.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all cursor-pointer"
            >
              Сбросить поиск
            </button>
          </div>
        ) : (
          filteredFaq.map((item) => {
            const isExpanded = expandedIds.includes(item.id);

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
                  isExpanded ? 'border-emerald-300 shadow-md' : 'border-slate-100 hover:border-slate-200 shadow-xs'
                }`}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                      isExpanded ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                    }`}>
                      ?
                    </div>
                    <h3 className={`font-black text-xs sm:text-sm tracking-tight transition-colors ${
                      isExpanded ? 'text-emerald-900' : 'text-slate-800 group-hover:text-emerald-700'
                    }`}>
                      {item.question}
                    </h3>
                  </div>

                  <div className={`p-1.5 rounded-full transition-transform ${
                    isExpanded ? 'text-emerald-600 bg-emerald-50 rotate-180' : 'text-slate-400 bg-slate-50'
                  }`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100/80 text-xs sm:text-sm text-slate-700 space-y-3 animate-fadeIn">
                    <p className="leading-relaxed font-medium">
                      {item.answer}
                    </p>

                    {/* Step by step guide if provided */}
                    {item.steps && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                          Пошаговые действия:
                        </span>
                        <div className="space-y-1.5">
                          {item.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Highlight Box */}
                    {item.highlight && (
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 font-bold text-xs flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>{item.highlight}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Community Rules Spotlight Card */}
      <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/80 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-900">
          <ShieldCheck size={24} className="text-amber-600" />
          <h2 className="text-base sm:text-lg font-black tracking-tight">
            Золотые правила добрососедства
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
          Наш проект создан самими жителями для взаимной поддержки. Чтобы общение оставалось теплым и безопасным, мы просим каждого следовать простым принципам:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-amber-950">
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200 flex items-start gap-2">
            <span className="text-emerald-600 font-black">✓</span>
            <span>Будьте вежливы и благодарны за помощь</span>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200 flex items-start gap-2">
            <span className="text-emerald-600 font-black">✓</span>
            <span>Приходите вовремя по договорённостям</span>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200 flex items-start gap-2">
            <span className="text-emerald-600 font-black">✓</span>
            <span>Не распространяйте спам и рекламу</span>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200 flex items-start gap-2">
            <span className="text-emerald-600 font-black">✓</span>
            <span>Берегите пароли и коды из СМС</span>
          </div>
        </div>
      </div>

      {/* Need more help banner */}
      <div className="mt-6 bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-black text-slate-900 text-sm sm:text-base">
            Не нашли ответ на свой вопрос?
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Напишите дежурному координатору сообщества, мы поможем во всем разобраться.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            id="faq_ask_btn"
          >
            <Send size={15} />
            <span>Задать вопрос</span>
          </button>

          <button
            onClick={() => onNavigate('help_nearby')}
            className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <HandHeart size={15} className="text-emerald-600" />
            <span>В ленту помощи</span>
          </button>
        </div>
      </div>

      {/* Ask Question / Support Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 border-2 border-emerald-500 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm">
                  ✉️
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Задать вопрос координаторам
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Ответ поступит в ваши личные сообщения
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {supportSent ? (
              <div className="p-6 text-center space-y-2">
                <span className="text-4xl animate-bounce block">✅</span>
                <h4 className="font-black text-emerald-800 text-base">
                  Ваш вопрос успешно отправлен!
                </h4>
                <p className="text-xs text-slate-600">
                  Дежурный модератор или координатор свяжется с вами в течение пары часов.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Опишите ваш вопрос или проблему:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Например: Не получается указать точный адрес в деревне, помогите настроить..."
                    className="w-full p-3.5 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  Житель: <strong>{currentUser.name}</strong> • Село: <strong>{currentUser.village || 'Не указано'}</strong>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSupportModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>Отправить вопрос</span>
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
