import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, RefreshCw, Key } from 'lucide-react';

/**
 * ============================================================================
 * КЛЮЧ API GOOGLE AI STUDIO (GEMINI API)
 * Вставьте ваш реальный API-ключ Gemini ниже в кавычки вместо 'ВАШ_КЛЮЧ':
 * ============================================================================
 */
const API_KEY: string = 'ВАШ_КЛЮЧ';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isQuickChip?: boolean;
}

interface QuickTopic {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  title: string;
}

const QUICK_TOPICS: QuickTopic[] = [
  {
    id: 'first_aid',
    icon: '🚑',
    label: 'Первая помощь',
    title: 'Доврачебная помощь в сельских условиях',
    prompt: 'Подскажи кратко и четко базовый порядок действий первой помощи при неотложной ситуации в селе (до приезда скорой помощи), телефон вызова экстренных служб (112) и что делать при ожоге, травме или потере сознания.'
  },
  {
    id: 'create_request',
    icon: '✍️',
    label: 'Составить заявку',
    title: 'Помощь в составлении понятной просьбы/предложения',
    prompt: 'Помоги составить понятное объявление для взаимопомощи: как правильно написать просьбу или предложение помощи, чтобы соседи быстро откликнулись? Приведи 2 коротких готовых шаблона (например, подвезти лекарства из аптеки и помощь по хозяйству).'
  },
  {
    id: 'social_help',
    icon: '📜',
    label: 'Социальная справка',
    title: 'Льготы и поддержка сельских жителей',
    prompt: 'Какая базовая социальная помощь, компенсации (например, на твердое топливо/дрова, проезд, лекарства) и выплаты положены сельским жителям, пенсионерам и семьям, и куда за ними обращаться?'
  }
];

// Fallback high-quality responses if API key is not yet provided
const FALLBACK_ANSWERS: Record<string, string> = {
  first_aid: `🚑 **Неотложная помощь в сельских условиях**

📞 **Экстренные телефоны:**
• **112** — Единый номер спасения (работает даже без SIM-карты и денег).
• **103** — Скорая медицинская помощь.

📌 **Главные правила до прибытия помощи:**
• **Оцените безопасность:** убедитесь, что вам и пострадавшему ничего не угрожает.
• **Потеря сознания:** уложите человека на бок (устойчивое боковое положение), чтобы не запал язык, освободите шею от тугой одежды.
• **Ожог:** охлаждайте чистой холодной проточной водой 15 минут. Ни в коем случае не мажьте маслом или жиром!
• **Травма/перелом:** зафиксируйте конечность подручными средствами (доска, палка), не вправляйте самостоятельно.
• **Кровотечение:** наложите давящую повязку чистой тканью или бинтом прямо на рану.`,

  create_request: `✍️ **Как составить заявку, на которую быстро откликнутся**

📌 **Формула идеальной просьбы:**
1. **Что конкретно нужно:** без длинных предысторий.
2. **Где и когда:** село/деревня, ориентир и срок.
3. **Контакты для связи:** телефон или мессенджер.

💡 **Шаблон 1 (Поездка / Лекарства):**
«Здравствуйте, соседи! Нужно привезти из районной аптеки рецептурные капли для мамы в с. Заречье (до пятницы). Список и деньги передам сразу. Телефон: 8 (900) 000-00-00».

💡 **Шаблон 2 (Хозяйство / Дрова):**
«Требуется помощь пенсионеру: помочь перетащить дрова во двор (с. Покровское, ул. Лесная). Займет около 1 часа, угощу домашним чаем и пирогами! Тел: 8 (900) 000-00-00».`,

  social_help: `📜 **Базовая социальная помощь сельским жителям**

📌 **Основные меры поддержки:**
• **Компенсация за дрова и уголь:** положена ветеранам, инвалидам, многодетным семьям и сельским специалистам (учителям, медикам).
• **Субсидия на оплату ЖКХ:** если расходы на жилье превышают установленный региональный процент от дохода семьи.
• **Социальный контракт:** до 350 000 ₽ на развитие личного подсобного хозяйства (ЛПХ) или свое дело.
• **Сельская надбавка к пенсии (+25% к фиксированной части):** для неработающих пенсионеров со стажем в сельском хозяйстве от 30 лет.

🏛️ **Куда обращаться:**
• Местный отдел Социальной защиты населения.
• Сельсовет или районная администрация.
• Портал Госуслуг или ближайшее МФЦ («Мои документы»).`
};

export const AiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Здравствуйте! Я ваш ИИ-помощник по взаимопомощи и сельской жизни. Чем могу помочь? Выберите тему вверху или задайте свой вопрос.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userKeyInput, setUserKeyInput] = useState<string>(() => {
    return localStorage.getItem('vzaimo_gemini_key') || '';
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, isLoading]);

  // Determine active Gemini API Key
  const getActiveKey = (): string => {
    if (userKeyInput.trim()) {
      return userKeyInput.trim();
    }
    if (API_KEY && API_KEY !== 'ВАШ_КЛЮЧ' && API_KEY.trim() !== '') {
      return API_KEY.trim();
    }
    const envKey = (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim() !== '') {
      return envKey.trim();
    }
    return '';
  };

  const handleSaveCustomKey = (key: string) => {
    const trimmed = key.trim();
    setUserKeyInput(trimmed);
    localStorage.setItem('vzaimo_gemini_key', trimmed);
    setIsKeyModalOpen(false);
  };

  // Direct fetch call to Google AI Studio Gemini API endpoint
  const callGeminiApi = async (userPrompt: string): Promise<string> => {
    const activeKey = getActiveKey();

    // If key has not been configured by user yet, provide smart fallback or helpful guide
    if (!activeKey || activeKey === 'ВАШ_КЛЮЧ') {
      // Check if matches one of quick topics
      for (const topic of QUICK_TOPICS) {
        if (
          userPrompt.toLowerCase().includes(topic.label.toLowerCase()) ||
          userPrompt.toLowerCase().includes(topic.id.toLowerCase()) ||
          topic.prompt === userPrompt
        ) {
          return (
            FALLBACK_ANSWERS[topic.id] +
            '\n\n💡 *Подсказка: Для получения ответов на любые вопросы вставьте ваш API-ключ Google AI Studio в начале файла AiAssistantWidget.tsx (переменная API_KEY).*'
          );
        }
      }
      return `💡 **ИИ-помощник готов к работе!**\n\nЧтобы задавать произвольные вопросы в живом режиме через нейросеть Gemini, укажите ваш ключ Google AI Studio в коде приложения (\`const API_KEY = 'ВАШ_КЛЮЧ'\`) или нажмите на значок 🔑 вверху чата.\n\nА пока вы можете использовать готовые темы вверху:\n• 🚑 Первая помощь\n• ✍️ Составить заявку\n• 📜 Социальная справка`;
    }

    // Direct fetch to Gemini 1.5 Flash API as requested in requirements
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(activeKey)}`;

    const systemPrompt = `Ты — заботливый, практичный и лаконичный ИИ-помощник сервиса «Взаимопомощь» для жителей сел, деревень и малых городов.
Твоя задача — давать четкие, прикладные и безопасные ответы.
Правила форматирования ответов:
1. Пиши короткими абзацами (1-3 строки) для комфортного чтения с экрана смартфона на ярком солнце.
2. Используй аккуратные списки с маркерами (•, ✔, 📌, 📞).
3. Пиши простым, понятным языком, без заумных терминов и воды.
4. В вопросах здоровья и экстренной помощи всегда напоминай единый телефон 112 и рекомендуй дождаться квалифицированных медиков.
5. Для заявок и объявлений предлагай готовые короткие тексты с контактами.`;

    // Build valid alternating dialogue history starting with a 'user' turn (required by Gemini API)
    const filteredHistory = messages
      .filter((m) => m.sender !== 'system' && m.id !== 'welcome' && !m.text.startsWith('⚠️'))
      .slice(-6);

    const firstUserIdx = filteredHistory.findIndex((m) => m.sender === 'user');
    const recentHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (firstUserIdx !== -1) {
      for (let i = firstUserIdx; i < filteredHistory.length; i++) {
        const msg = filteredHistory[i];
        const role: 'user' | 'model' = msg.sender === 'user' ? 'user' : 'model';
        const last = recentHistory[recentHistory.length - 1];
        if (!last || last.role !== role) {
          recentHistory.push({ role, parts: [{ text: msg.text }] });
        }
      }
      // Ensure history before the new user prompt ends on 'model' so user turns don't collide
      if (recentHistory.length > 0 && recentHistory[recentHistory.length - 1].role === 'user') {
        recentHistory.pop();
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          ...recentHistory,
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 900
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `Ошибка сервера (${response.status})`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Модель не вернула текст ответа.');
    }

    return candidateText;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await callGeminiApi(text);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Неизвестная ошибка связи';
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `⚠️ **Не удалось связаться с Gemini API**\n\nПричина: ${errorText}\n\nПроверьте подключение к сети и правильность API-ключа вверху (кнопка 🔑) или в файле \`AiAssistantWidget.tsx\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTopicClick = (topic: QuickTopic) => {
    handleSendMessage(topic.prompt);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: String(Date.now()),
        sender: 'assistant',
        text: 'Чат очищен. Чем я могу помочь вам сейчас?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Render markdown-like text with short paragraphs and bullet points for mobile clarity
  const renderFormattedText = (rawText: string) => {
    const paragraphs = rawText.split(/\n\n+/);

    return paragraphs.map((para, pIdx) => {
      const lines = para.split('\n');

      // Check if paragraph is a bullet list
      const isList = lines.some((l) => /^\s*([•\-\*]|✔|📌|📞|\d+\.)\s+/.test(l));

      if (isList) {
        return (
          <ul key={pIdx} className="my-2 space-y-1.5 pl-1">
            {lines.map((line, lIdx) => {
              const cleaned = line.replace(/^\s*([•\-\*]|✔|📌|📞|\d+\.)\s*/, '').trim();
              if (!cleaned) return null;
              return (
                <li key={lIdx} className="flex items-start gap-2 text-sm text-slate-800 leading-snug">
                  <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>{formatInlineMarkdown(cleaned)}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="mb-2 text-sm text-slate-800 leading-relaxed last:mb-0">
          {lines.map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {formatInlineMarkdown(line)}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  // Helper for **bold** and basic inline formatting
  const formatInlineMarkdown = (line: string): React.ReactNode => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-200 text-xs font-mono text-slate-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const hasConfiguredKey = Boolean(getActiveKey() && getActiveKey() !== 'ВАШ_КЛЮЧ');

  return (
    <>
      {/* ==================================================================== */}
      {/* 1. КРУГЛАЯ ПЛАВАЮЩАЯ КНОПКА (Нижний правый угол)                     */}
      {/* ==================================================================== */}
      <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-35 flex flex-col items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white ring-2 ring-indigo-500/20 group cursor-pointer"
          aria-label="Открыть ИИ-помощник"
          title="Открыть ИИ-помощника «Взаимопомощь»"
        >
          {/* Робот / Ассистент */}
          <span className="text-2xl leading-none select-none drop-shadow-xs">🤖</span>

          {/* Индикатор готовности */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>

        {/* Подпись "Помощник" */}
        <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold shadow-md select-none tracking-tight">
          Помощник
        </span>
      </div>

      {/* ==================================================================== */}
      {/* 2. ВЫЕЗЖАЮЩЕЕ ОКНО ЧАТА (DRAWER / MODAL) СНИЗУ ДЛЯ СМАРТФОНОВ        */}
      {/* ==================================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-xs animate-[fadeBackdrop_0.2s_ease-out_forwards]">
          {/* Backdrop click dismiss */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[88vh] sm:h-[620px] max-h-[92vh] overflow-hidden border border-slate-200 z-10 animate-[drawerSlideUp_0.28s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ручка перетаскивания (для мобильного восприятия) */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Хедер окна чата */}
            <div className="px-4 py-3 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-lg shadow-inner">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                      ИИ-Помощник
                    </h3>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Онлайн
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Советы, первая помощь и составление заявок
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Кнопка настройки API ключа */}
                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    hasConfiguredKey
                      ? 'text-emerald-300 hover:bg-white/10'
                      : 'text-amber-300 hover:bg-amber-500/20 bg-amber-500/10'
                  }`}
                  title={hasConfiguredKey ? 'Ключ Gemini подключен' : 'Настроить ключ Gemini API'}
                  aria-label="API ключ"
                >
                  <Key className="w-4 h-4" />
                </button>

                {/* Очистить чат */}
                <button
                  onClick={handleClearHistory}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Очистить историю"
                  aria-label="Очистить чат"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Закрыть */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Закрыть окно"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ВЕРХНИЕ БЫСТРЫЕ КНОПКИ-ПОДСКАЗКИ (3 быстрые темы) */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Быстрые темы:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleQuickTopicClick(topic)}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 active:scale-97 transition-all text-center shadow-2xs group disabled:opacity-50 cursor-pointer"
                  >
                    <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      {topic.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* СПИСОК СООБЩЕНИЙ ЧАТА */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-100/60">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 max-w-[90%] sm:max-w-[85%] ${
                      isAssistant ? 'self-start' : 'self-end ml-auto flex-row-reverse'
                    }`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm shrink-0 shadow-xs mt-0.5">
                        🤖
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-xs ${
                        isAssistant
                          ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80'
                          : 'bg-indigo-600 text-white rounded-tr-xs'
                      }`}
                    >
                      {isAssistant ? (
                        <div className="prose-sm">{renderFormattedText(msg.text)}</div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      )}
                      <div
                        className={`text-[10px] mt-1 flex justify-end ${
                          isAssistant ? 'text-slate-400' : 'text-indigo-200'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ИНДИКАТОР: "Помощник печатает..." */}
              {isLoading && (
                <div className="flex items-start gap-2 max-w-[85%] self-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm shrink-0 shadow-xs">
                    🤖
                  </div>
                  <div className="bg-white text-slate-700 px-3.5 py-2.5 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-xs flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-700">
                      Помощник печатает...
                    </span>
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ПОЛЕ ВВОДА СООБЩЕНИЯ ВНИЗУ */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Задайте вопрос помощнику..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-hidden transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shrink-0 active:scale-95 cursor-pointer"
                  aria-label="Отправить сообщение"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-1 text-center">
                <span className="text-[10px] text-slate-400">
                  Прямой вызов Google AI Studio (Gemini 1.5 Flash) • Адаптировано для слабых сетей
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО НАСТРОЙКИ КЛЮЧА GEMINI API */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Key className="w-5 h-5" />
                <span>Ключ Google AI Studio</span>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Вы можете отредактировать переменную <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">const API_KEY = 'ВАШ_КЛЮЧ'</code> в файле <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">AiAssistantWidget.tsx</code> или вставить ваш ключ прямо здесь:
            </p>

            <input
              type="text"
              defaultValue={userKeyInput}
              placeholder="AIzaSy..."
              id="gemini-key-input"
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:outline-hidden mb-3"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('gemini-key-input') as HTMLInputElement;
                  if (input) {
                    handleSaveCustomKey(input.value);
                  }
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
