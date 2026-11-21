import React from 'react';
import { UserProfile, HelpRequest, Chat, Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, Heart, MessageSquare, ShieldAlert, ArrowRight, User, 
  MapPin, XCircle, ArrowLeft, Check, Smartphone, Users, Wifi, WifiOff, 
  AlertTriangle, Shield, Sparkles, Volume2, Leaf, FileSpreadsheet,
  Map as MapIcon
} from 'lucide-react';
import { CategoryIcon } from './LentaScreen';

interface WizardCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  borderColor: string;
  categoryValue: string;
}

const WIZARD_CATEGORIES: WizardCategory[] = [
  { id: "wood", name: "Наколоть дрова / Вода", emoji: "🪵", color: "bg-amber-100 text-amber-955 hover:bg-amber-200/90", borderColor: "border-amber-300", categoryValue: "wood" },
  { id: "tractor", name: "Трактор / Покос травы", emoji: "🚜", color: "bg-sky-100 text-sky-955 hover:bg-sky-200/90", borderColor: "border-sky-300", categoryValue: "tractor" },
  { id: "carpentry", name: "Починить забор, крыльцо, крышу", emoji: "🔨", color: "bg-orange-100 text-orange-955 hover:bg-orange-200/90", borderColor: "border-orange-300", categoryValue: "carpentry" },
  { id: "delivery", name: "Привезти продукты / Лекарства", emoji: "🚚", color: "bg-purple-100 text-purple-955 hover:bg-purple-200/90", borderColor: "border-purple-300", categoryValue: "delivery" },
  { id: "medical", name: "Помощь медика / Сиделка", emoji: "🩺", color: "bg-rose-100 text-rose-955 hover:bg-rose-200/90", borderColor: "border-rose-300", categoryValue: "medical" },
  { id: "household", name: "Убраться дома / Стряпня", emoji: "🧹", color: "bg-teal-100 text-teal-955 hover:bg-teal-200/90", borderColor: "border-teal-300", categoryValue: "household" },
  { id: "other", name: "Другая помощь", emoji: "❓", color: "bg-slate-100 text-slate-955 hover:bg-slate-200/90", borderColor: "border-slate-300", categoryValue: "other" }
];

const WIZARD_SUB_OPTIONS: Record<string, string[]> = {
  wood: [
    "Нужно расколоть дрова во дворе",
    "Нужно сложить дрова в дровяник",
    "Принести воду из колодца в дом",
    "Привезти питьевую воду в бутылях"
  ],
  tractor: [
    "Вспахать огород под картошку",
    "Скосить высокую траву на участке",
    "Убрать снег во дворе и у калитки",
    "Вывезти мусор или ветки на прицепе"
  ],
  carpentry: [
    "Починить покосившийся забор",
    "Отремонтировать крыльцо или ступени",
    "Подправить печь или кирпичную трубу",
    "Починить входную дверь или замок"
  ],
  delivery: [
    "Купить и привезти продукты из магазина",
    "Забрать и доставить лекарства из аптеки",
    "Помочь доехать до больницы или райцентра",
    "Привезти тяжелый баллон с газом"
  ],
  medical: [
    "Измерить давление или сделать укол",
    "Нужна сиделка на несколько часов",
    "Помочь дойти до медпункта",
    "Привезти или помочь настроить тонометр"
  ],
  household: [
    "Помочь с генеральной уборкой в доме",
    "Намыть окна в комнатах",
    "Помочь приготовить горячую еду на печи",
    "Помочь постирать и развесить белье"
  ],
  other: [
    "Мужская сила (перетащить тяжелые вещи)",
    "Настроить телевизор или кнопочный телефон",
    "Помочь заполнить бумажные заявления",
    "Просто поговорить и помочь по мелочи"
  ]
};

const WIZARD_URGENCIES = [
  { id: "urgent", name: "🔥 Очень срочно", desc: "нужно сегодня же", value: "Очень срочно (нужно сегодня)" },
  { id: "days", name: "📅 В ближайшие дни", desc: "в течение 2-3 дней", value: "В ближайшие дни (не горит)" },
  { id: "free", name: "🌲 Не к спеху", desc: "когда будет время", value: "Когда будет свободное время у неравнодушных соседей" }
];

interface SimplifiedDashboardProps {
  user: UserProfile;
  requests: HelpRequest[];
  chats: Chat[];
  messages: Message[];
  users: UserProfile[];
  currentUserId: string;
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  onSendMessage: (chatId: string, text: string) => void;
  onResolveRequest: (postId: string, chatId: string) => void;
  onGiveThanks: (userId: string, count: number, chatId: string, isAuthor: boolean) => void;
  onRespond: (req: HelpRequest) => void;
  onCreateRequest: () => void;
  onSubmitRequest?: (reqData: any) => void;
  onToggleMode: (enabled: boolean) => void;
  onUserChange: (userId: string) => void;
  isOffline: boolean;
  onOfflineToggle?: () => void;
  pendingQueueCount: number;
  onOpenDelivery?: () => void;
  onOpenTransport?: () => void;
  onOpenEcology?: () => void;
  onOpenSheets?: () => void;
  onOpenGovSupport?: () => void;
  onOpenReferrals?: () => void;
  onOpenPlaces?: () => void;
}

export default function SimplifiedDashboard({
  user,
  requests,
  chats,
  messages,
  users,
  currentUserId,
  activeChatId,
  onSelectChat,
  onSendMessage,
  onResolveRequest,
  onGiveThanks,
  onRespond,
  onCreateRequest,
  onSubmitRequest,
  onToggleMode,
  onUserChange,
  isOffline,
  onOfflineToggle,
  pendingQueueCount,
  onOpenDelivery,
  onOpenTransport,
  onOpenEcology,
  onOpenSheets,
  onOpenGovSupport,
  onOpenReferrals,
  onOpenPlaces
}: SimplifiedDashboardProps) {

  // State variables
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState(1);
  const [selectedCategory, setSelectedCategory] = React.useState<WizardCategory | null>(null);
  const [selectedSubOption, setSelectedSubOption] = React.useState('');
  const [selectedUrgency, setSelectedUrgency] = React.useState<any | null>(null);
  const [customDetails, setCustomDetails] = React.useState('');

  // SOS Emergency Call Simulator State
  const [isSosCallActive, setIsSosCallActive] = React.useState(false);
  const [sosCallStep, setSosCallStep] = React.useState('dialing'); // dialing, active, helperSent
  const [sosSelectedReason, setSosSelectedReason] = React.useState('');

  // Speech Recognition States
  const [isSpeechModalOpen, setIsSpeechModalOpen] = React.useState(false);
  const [speechTarget, setSpeechTarget] = React.useState<'customDetails' | 'chat'>('customDetails');
  const [isListening, setIsListening] = React.useState(false);
  const [speechTranscript, setSpeechTranscript] = React.useState('');
  const [speechError, setSpeechError] = React.useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = React.useState<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Ваш браузер не поддерживает голосовой ввод. Пожалуйста, используйте готовые фразы ниже.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'ru-RU';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setSpeechTranscript(currentTranscript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError("Доступ к микрофону заблокирован. Разрешите микрофон в браузере или используйте шаблоны ниже.");
        } else {
          setSpeechError("Ошибка записи. Используйте готовые фразы ниже.");
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
      setRecognitionInstance(rec);
    } catch (e) {
      console.error(e);
      setSpeechError("Не удалось запустить микрофон. Используйте готовые фразы ниже.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsListening(false);
  };

  const handleOpenSpeechModal = (target: 'customDetails' | 'chat') => {
    setSpeechTarget(target);
    setSpeechTranscript('');
    setSpeechError(null);
    setIsSpeechModalOpen(true);
  };

  const handleCloseSpeechModal = () => {
    stopListening();
    setIsSpeechModalOpen(false);
  };

  const handleApplySpeechText = () => {
    stopListening();
    if (speechTarget === 'customDetails') {
      setCustomDetails(speechTranscript);
    } else {
      const input = document.getElementById('elderly_chat_input') as HTMLTextAreaElement;
      if (input) {
        input.value = speechTranscript;
      }
    }
    setIsSpeechModalOpen(false);
  };

  // Filtering data for simple mode
  const villageRequests = requests.filter(r => r.active && r.village === user.village);
  const userMyRequests = requests.filter(r => r.authorId === user.id);
  const activeMyRequests = userMyRequests.filter(r => r.active);

  // My Chats for the simplified screen
  const myChats = chats.filter(c => c.authorId === user.id || c.responderId === user.id);
  const unreadCount = myChats.reduce((acc, c) => {
    if (c.authorId === currentUserId) return acc + c.unreadCountAuthor;
    if (c.responderId === currentUserId) return acc + c.unreadCountResponder;
    return acc;
  }, 0);

  // Auto scroll chat messages
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (activeChatId && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, messages]);

  // Handle emergency call triggers
  const handleStartSosCall = () => {
    setIsSosCallActive(true);
    setSosCallStep('dialing');
    setSosSelectedReason('');

    // Simulate connection after 2 seconds
    setTimeout(() => {
      setSosCallStep('active');
    }, 2000);
  };

  const handleSelectSosReason = (reason: string) => {
    setSosSelectedReason(reason);
    setSosCallStep('helperSent');
  };

  const handleCloseSosCall = () => {
    setIsSosCallActive(false);
    setSosCallStep('dialing');
    setSosSelectedReason('');
  };

  // Help Request creation wizard
  const handleStartWizard = () => {
    if (user.blocked) {
      alert("Внимание: Ваш аккаунт заблокирован администратором за нарушения правил. Создание объявлений ограничено!");
      return;
    }
    setIsWizardOpen(true);
    setWizardStep(1);
    setSelectedCategory(null);
    setSelectedSubOption('');
    setSelectedUrgency(null);
    setCustomDetails('');
  };

  const handleBackStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    } else {
      setIsWizardOpen(false);
    }
  };

  const handleCancelWizard = () => {
    setIsWizardOpen(false);
    setWizardStep(1);
  };

  const handleSelectCategory = (cat: WizardCategory) => {
    setSelectedCategory(cat);
    setWizardStep(2);
  };

  const handleSelectSubOption = (opt: string) => {
    setSelectedSubOption(opt);
    setWizardStep(3);
  };

  const handleSelectUrgency = (urg: any) => {
    setSelectedUrgency(urg);
    setWizardStep(4);
  };

  const handlePublish = () => {
    if (onSubmitRequest) {
      const titleText = selectedSubOption;
      const urgencyText = selectedUrgency?.value || '';
      const descriptionText = customDetails.trim() 
        ? `${selectedSubOption}. Дополнительно: ${customDetails}. Срочность: ${urgencyText}.`
        : `${selectedSubOption}. Срочность: ${urgencyText}.`;

      onSubmitRequest({
        title: titleText,
        category: selectedCategory?.categoryValue || 'other',
        description: descriptionText,
        village: user.village,
        locationDetails: '',
        photos: []
      });

      // Reset wizard
      setIsWizardOpen(false);
      setWizardStep(1);
      setSelectedCategory(null);
      setSelectedSubOption('');
      setSelectedUrgency(null);
      setCustomDetails('');
    }
  };

  // Helper values for active chat room
  const activeChat = myChats.find(c => c.id === activeChatId);
  const activeChatMessages = messages.filter(m => m.chatId === activeChatId);
  
  // Calculate who the companion is
  const companion = React.useMemo(() => {
    if (!activeChat) return null;
    const companionId = activeChat.authorId === currentUserId ? activeChat.responderId : activeChat.authorId;
    return users.find(u => u.id === companionId) || {
      id: companionId,
      name: "Сосед-помощник",
      phone: "+7 ...",
      village: user.village,
      thanksCount: 5,
    };
  }, [activeChat, users, currentUserId]);

  const handleSendCustomMessage = (text: string) => {
    if (!activeChatId || !text.trim()) return;
    onSendMessage(activeChatId, text);
  };

  // Quick replies list for elderly
  const QUICK_REPLIES = [
    "👍 Спасибо огромное!",
    "⏳ Да, я дома и очень жду вас.",
    "🏡 Проходите прямо во двор, не заперто.",
    "📞 Наберите мне на телефон, пожалуйста.",
    "❌ Спасибо большое, проблема уже решилась!"
  ];

  // Wizard Screen rendering
  if (isWizardOpen) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 font-sans select-none min-h-screen bg-slate-50 flex flex-col justify-between" id="elderly_wizard_container">
        <div>
          {/* Header of the Wizard */}
          <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={handleBackStep}
              className="flex items-center gap-2 text-slate-800 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 rounded-xl px-4 py-2.5 font-black text-lg transition-all active:scale-95"
            >
              <ArrowLeft size={22} className="stroke-[3]" /> Назад
            </button>
            
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold uppercase block">Помощник</span>
              <span className="text-xl font-black text-emerald-600">Шаг {wizardStep} из 4</span>
            </div>
          </div>

          {/* Progress Bar (circles with steps to see how many remain, and clickable to go back) */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between relative px-2">
              {/* Connecting line background */}
              <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
              {/* Active connecting line fill */}
              <div 
                className="absolute top-1/2 left-6 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-300"
                style={{ width: `${((wizardStep - 1) / 3) * 90}%` }}
              ></div>
              
              {[1, 2, 3, 4].map((stepNum) => {
                const isActive = wizardStep === stepNum;
                const isCompleted = wizardStep > stepNum;
                
                return (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => {
                      if (isCompleted || stepNum < wizardStep) {
                        setWizardStep(stepNum);
                      }
                    }}
                    className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center font-black text-base transition-all ${
                      isCompleted 
                        ? "bg-emerald-500 text-white border-2 border-emerald-300 hover:bg-emerald-600 cursor-pointer shadow-xs" 
                        : isActive
                        ? "bg-emerald-50 text-emerald-700 border-3 border-emerald-500 shadow-md ring-4 ring-emerald-100"
                        : "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                    }`}
                    disabled={!isCompleted && wizardStep !== stepNum}
                  >
                    {isCompleted ? "✓" : stepNum}
                  </button>
                );
              })}
            </div>
            
            {/* Step name labels */}
            <div className="flex justify-between mt-2.5 px-1 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">
              <span className={`w-1/4 ${wizardStep === 1 ? "text-emerald-700" : ""}`}>1. Что</span>
              <span className={`w-1/4 ${wizardStep === 2 ? "text-emerald-700" : ""}`}>2. Детали</span>
              <span className={`w-1/4 ${wizardStep === 3 ? "text-emerald-700" : ""}`}>3. Когда</span>
              <span className={`w-1/4 ${wizardStep === 4 ? "text-emerald-700" : ""}`}>4. Проверка</span>
            </div>
          </div>

          {/* Wizard Step Content */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-300 text-center shadow-xs">
                <span className="text-4xl block mb-2">👵👴</span>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 leading-tight">
                  Шаг 1: Какая помощь вам требуется?
                </h3>
                <p className="text-slate-600 text-base font-bold mt-2">
                  Просто нажмите на нужную картинку пальцем. Писать буквы не надо!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {WIZARD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className={`w-full p-6 text-left rounded-3xl border-3 flex items-center gap-5 transition-all active:scale-98 ${cat.color} ${cat.borderColor} shadow-md`}
                  >
                    <span className="text-4xl shrink-0 bg-white/60 p-2 rounded-2xl">{cat.emoji}</span>
                    <span className="text-xl sm:text-2xl font-black leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-300 text-center shadow-xs">
                <span className="text-4xl block mb-2">{selectedCategory?.emoji}</span>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-955 leading-tight">
                  Шаг 2: Выберите готовую просьбу:
                </h3>
                <p className="text-slate-600 text-base font-bold mt-2">
                  Мы написали самые частые просьбы. Нажмите пальцем на то, что подходит:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {selectedCategory && WIZARD_SUB_OPTIONS[selectedCategory.id]?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSubOption(opt)}
                    className="w-full p-6 text-left rounded-3xl border-3 border-slate-300 bg-white text-slate-900 font-black text-lg sm:text-xl leading-snug hover:bg-slate-50 transition-all active:scale-98 shadow-sm flex items-center justify-between gap-4"
                  >
                    <span>{opt}</span>
                    <ArrowRight size={24} className="text-emerald-600 shrink-0 stroke-[3]" />
                  </button>
                ))}
                
                {/* Custom option button */}
                <button
                  onClick={() => handleSelectSubOption("Другой вопрос (напишу сам)")}
                  className="w-full p-5 text-left rounded-3xl border-3 border-dashed border-slate-400 bg-slate-100 text-slate-700 font-bold text-lg hover:bg-slate-200 transition-all active:scale-98 flex items-center justify-between gap-3"
                >
                  <span>✏️ Другое (написать своими словами...)</span>
                  <ArrowRight size={20} className="text-slate-500 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-300 text-center shadow-xs">
                <span className="text-4xl block mb-2">⏰</span>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-955 leading-tight">
                  Шаг 3: Когда это нужно сделать?
                </h3>
                <p className="text-slate-600 text-base font-bold mt-2">
                  Выберите, насколько срочное ваше дело:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {WIZARD_URGENCIES.map((urg) => (
                  <button
                    key={urg.id}
                    onClick={() => handleSelectUrgency(urg)}
                    className={`w-full p-6 text-left rounded-3xl border-3 bg-white hover:bg-slate-50 transition-all active:scale-98 shadow-md flex flex-col gap-1.5 ${
                      urg.id === 'urgent' ? 'border-rose-400 text-rose-955 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  >
                    <span className="text-2xl font-black leading-tight">{urg.name}</span>
                    <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">{urg.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-300 text-center shadow-xs">
                <span className="text-4xl block mb-2">📢</span>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-955 leading-tight">
                  Шаг 4: Проверьте и отправьте!
                </h3>
                <p className="text-slate-600 text-base font-bold mt-2">
                  Всё готово. Посмотрите, правильно ли мы всё записали:
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-white rounded-3xl border-3 border-emerald-400 p-6 shadow-lg space-y-5">
                <div>
                  <span className="text-xs text-slate-400 font-black uppercase tracking-wider block">Что нужно сделать:</span>
                  <span className="text-2xl font-black text-slate-900 leading-snug">{selectedSubOption}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-slate-100 pt-4">
                  <div>
                    <span className="text-xs text-slate-400 font-black uppercase tracking-wider block">Ваш адрес:</span>
                    <span className="text-lg font-black text-slate-800 flex items-center gap-1 mt-0.5">📍 с. {user.village}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-black uppercase tracking-wider block">Когда помочь:</span>
                    <span className="text-lg font-black text-emerald-700 mt-0.5">{selectedUrgency?.name}</span>
                  </div>
                </div>

                {/* Optional input if they want to add something */}
                <div className="border-t-2 border-slate-100 pt-4 space-y-2.5">
                  <label className="block text-sm font-black text-slate-500 uppercase tracking-wider">
                    Если нужно, допишите детали (например, номер дома):
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => handleOpenSpeechModal('customDetails')}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 px-6 rounded-2xl shadow-md text-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 border-2 border-orange-400 cursor-pointer animate-pulse"
                  >
                    <span className="text-xl">🎤</span>
                    <span>Сказать голосом (без клавиатуры!)</span>
                  </button>

                  <textarea
                    value={customDetails}
                    onChange={(e) => setCustomDetails(e.target.value)}
                    placeholder="Например: дом у реки с зелёным забором, дом 15..."
                    className="w-full p-4 border-2 border-slate-300 rounded-2xl text-lg font-semibold focus:border-emerald-500 focus:outline-none placeholder:text-slate-400"
                    rows={2}
                  />
                </div>
              </div>

              {/* GIANT HALF-SCREEN PUBLISH BUTTON */}
              <div className="pt-2 flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handlePublish}
                  className="w-full min-h-[220px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl p-6 shadow-2xl border-4 border-emerald-300 flex flex-col items-center justify-center gap-3 text-center transition-all active:scale-95 animate-pulse cursor-pointer"
                  id="giant_publish_button"
                >
                  <span className="text-6xl">📢</span>
                  <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none uppercase">
                    ОТПРАВИТЬ СОСЕДЯМ
                  </span>
                  <span className="text-base text-emerald-100 font-bold uppercase tracking-wider mt-1">
                    Нажмите сюда пальцем, чтобы просьба ушла отзывчивым соседям
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer cancel button */}
        <div className="mt-8 pt-4">
          <button
            type="button"
            onClick={handleCancelWizard}
            className="w-full py-5 text-slate-600 hover:text-slate-900 font-black text-xl bg-slate-200/80 hover:bg-slate-200 border-2 border-slate-300 rounded-2xl active:scale-95 transition-all text-center"
          >
            ❌ Сбросить и закрыть
          </button>
        </div>
      </div>
    );
  }

  // SOS Emergency Call Simulator Screen
  if (isSosCallActive) {
    return (
      <div className="fixed inset-0 bg-red-950 text-white z-50 flex flex-col justify-between p-6 select-none font-sans" id="sos_simulator_overlay">
        {/* Call status / Header */}
        <div className="text-center pt-8 space-y-4">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white mx-auto border-4 border-red-400 animate-pulse">
            <Phone size={44} className="animate-bounce" />
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tight text-red-100">112</h1>
            <p className="text-lg font-bold text-red-300 uppercase tracking-widest animate-pulse">
              {sosCallStep === 'dialing' ? 'Вызов экстренной службы...' : 'Соединение установлено'}
            </p>
          </div>
        </div>

        {/* Dynamic caller interaction */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-black/40 border-2 border-red-500/40 rounded-3xl p-6 text-center space-y-6">
            {sosCallStep === 'dialing' && (
              <div className="space-y-3">
                <p className="text-xl font-bold text-slate-300">Соединяем вас с дежурным Архангельской области...</p>
                <div className="flex justify-center gap-1.5 py-4">
                  <span className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping"></span>
                  <span className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}

            {sosCallStep === 'active' && (
              <div className="space-y-5">
                <div className="bg-red-900/30 p-4 rounded-2xl border border-red-500/30">
                  <p className="text-red-400 text-xs font-black uppercase tracking-wider">Голос дежурного:</p>
                  <p className="text-2xl font-black text-white mt-1 leading-snug">
                    "Дежурный службы Спасения Устьянского района слушает. Ваше местоположение определено: с. {user.village}. Какая у вас беда?"
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleSelectSosReason('Плохо с сердцем / Нужна скорая')}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black p-5 rounded-2xl text-xl border-2 border-rose-400 active:scale-95 transition-all text-left flex items-center gap-3"
                  >
                    <span className="text-3xl">🩺</span>
                    <span>💔 Плохо со здоровьем (Скорая)</span>
                  </button>
                  <button
                    onClick={() => handleSelectSosReason('Пожар или задымление')}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black p-5 rounded-2xl text-xl border-2 border-amber-400 active:scale-95 transition-all text-left flex items-center gap-3"
                  >
                    <span className="text-3xl">🔥</span>
                    <span>🔥 Пожар или задымление</span>
                  </button>
                  <button
                    onClick={() => handleSelectSosReason('Заблудился / Другая угроза')}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black p-5 rounded-2xl text-xl border-2 border-sky-400 active:scale-95 transition-all text-left flex items-center gap-3"
                  >
                    <span className="text-3xl">🪵</span>
                    <span>❓ Нужна полиция / МЧС / Другое</span>
                  </button>
                </div>
              </div>
            )}

            {sosCallStep === 'helperSent' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-emerald-900/40 p-5 rounded-2xl border-2 border-emerald-500 text-center">
                  <span className="text-5xl block mb-2">🚨🚒🚑</span>
                  <h3 className="text-2xl font-black text-emerald-300">ВЫЗОВ ЗАФИКСИРОВАН</h3>
                  <p className="text-slate-100 text-lg font-bold mt-2 leading-relaxed">
                    Дежурный подтвердил выезд служб по адресу: <br/>
                    <strong className="text-white text-xl">с. {user.village}</strong>
                  </p>
                  <div className="bg-black/30 p-3 rounded-xl mt-4 text-sm font-semibold text-emerald-200">
                    Причина вызова: {sosSelectedReason}
                  </div>
                </div>
                <p className="text-sm text-slate-300 font-bold">
                  *Внимание: Это тренировочный симулятор спасения в приложении «Взаимопомощь». В реальном устройстве приложение также продублирует ваши координаты диспетчерам.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hang up button */}
        <div className="pb-8 pt-4">
          <button
            onClick={handleCloseSosCall}
            className="w-full max-w-md mx-auto bg-white hover:bg-slate-100 text-red-700 font-black text-2xl py-6 rounded-3xl border-4 border-red-300 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg cursor-pointer"
          >
            <XCircle size={28} />
            <span>{sosCallStep === 'helperSent' ? 'ВЫЙТИ ИЗ СИМУЛЯТОРА' : 'СБРОСИТЬ ВЫЗОВ (ОТБОЙ)'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ULTRA SIMPLIFIED CHAT SCREEN
  if (activeChatId && activeChat) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 font-sans select-none bg-slate-50 min-h-screen flex flex-col justify-between" id="elderly_chat_container">
        {/* Chat Header */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm space-y-3">
          <button
            onClick={() => onSelectChat(null)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base px-4 py-2.5 rounded-xl border border-slate-300 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} className="stroke-[3]" /> Вернуться к главным кнопкам
          </button>

          <div className="border-t pt-3 flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-2xl shrink-0">
              🤝
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-slate-400 font-black uppercase">Диалог о помощи:</span>
              <h2 className="text-lg font-black text-slate-900 leading-snug truncate">{activeChat.postTitle}</h2>
              <p className="text-sm font-bold text-slate-700 mt-1">
                Помощник: <strong className="text-emerald-700 text-base">{companion?.name}</strong>
              </p>
              {companion?.phone && (
                <a
                  href={`tel:${companion.phone}`}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black text-sm px-3.5 py-1.5 rounded-xl shadow-xs mt-2 hover:bg-emerald-700 transition-all active:scale-95"
                >
                  <Phone size={14} className="fill-white" />
                  <span>Позвонить: {companion.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto bg-white my-4 p-4 rounded-3xl border-2 border-slate-200 min-h-[250px] max-h-[400px] space-y-4 shadow-inner">
          {activeChatMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              Диалог пуст. Напишите сообщение ниже.
            </div>
          ) : (
            activeChatMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs font-black text-slate-400 mb-0.5">
                    {isMe ? 'Вы написали:' : `${msg.senderName} пишет:`}
                  </span>
                  <div className={`p-4 rounded-2xl max-w-[90%] text-lg font-extrabold shadow-sm ${
                    isMe 
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-slate-100 text-slate-950 border-2 border-slate-200 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Replies for fast tapping */}
        <div className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200 space-y-2 mb-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider text-center">
            Быстрые готовые ответы (нажмите пальцем):
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {QUICK_REPLIES.map((replyText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendCustomMessage(replyText)}
                className="bg-white hover:bg-slate-50 text-slate-800 font-black text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-xs active:scale-95 transition-all shrink-0 max-w-full truncate"
              >
                {replyText}
              </button>
            ))}
          </div>
        </div>

        {/* Resolve and Close button inside active chat */}
        {!activeChat.resolved && activeChat.authorId === currentUserId && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-4 mb-4 text-center space-y-2.5 shadow-sm">
            <p className="text-base font-black text-slate-900 leading-tight">
              🎉 Помощь уже оказана? Дело завершено?
            </p>
            <button
              onClick={() => {
                if (confirm("Вы хотите закрыть просьбу как выполненную? Мы начислим баллы 'Спасибо' вашему помощнику!")) {
                  onResolveRequest(activeChat.postId, activeChat.id);
                  onGiveThanks(activeChat.responderId, 5, activeChat.id, true);
                  onSelectChat(null);
                }
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-md text-lg flex items-center justify-center gap-2 transition-all active:scale-95 border-2 border-emerald-300"
            >
              <Check size={22} className="stroke-[3]" />
              <span>ДА, ПОМОЩЬ ПОЛУЧЕНА (ЗАКРЫТЬ)</span>
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <div className="space-y-3 bg-white p-3 rounded-2xl border-2 border-slate-200">
          <button
            type="button"
            onClick={() => handleOpenSpeechModal('chat')}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 px-6 rounded-2xl shadow-md text-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 border-2 border-orange-400 cursor-pointer animate-pulse"
          >
            <span className="text-xl">🎤</span>
            <span>Сказать голосом (вместо ввода)</span>
          </button>

          <textarea
            id="elderly_chat_input"
            placeholder="Введите сообщение или нажмите на кнопку быстрого ответа выше..."
            className="w-full p-3 border-2 border-slate-200 rounded-xl text-lg font-bold focus:border-emerald-500 focus:outline-none placeholder:text-slate-400"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const target = e.target as HTMLTextAreaElement;
                if (target.value.trim()) {
                  handleSendCustomMessage(target.value);
                  target.value = '';
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('elderly_chat_input') as HTMLTextAreaElement;
              if (input && input.value.trim()) {
                handleSendCustomMessage(input.value);
                input.value = '';
              }
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl text-lg shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare size={18} />
            <span>ОТПРАВИТЬ СООБЩЕНИЕ СОСЕДУ</span>
          </button>
        </div>
      </div>
    );
  }

  // MAIN SIMPLIFIED DASHBOARD
  return (
    <div className="max-w-xl mx-auto px-4 py-6 font-sans select-none is-simplified bg-slate-50 min-h-screen pb-28" id="simplified_dashboard">
      
      {/* Top Banner / Help Information & Toggle (Shown on all screen sizes to allow switching back on mobile) */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-xl mb-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Smartphone size={20} className="text-yellow-400 shrink-0" />
            <span className="text-sm sm:text-lg font-black text-yellow-400 uppercase tracking-wider">ПРОСТОЙ РЕЖИМ</span>
          </div>
          <button
            onClick={() => onToggleMode(false)}
            className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Отключить простой режим"
          >
            <XCircle size={14} className="text-red-400" />
            <span>Обычный вид</span>
          </button>
        </div>
        
        <div className="border-t border-slate-800 pt-3 flex items-center gap-3">
          <span className="text-3xl sm:text-4xl bg-slate-800 p-2 rounded-2xl shrink-0">👵</span>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">Приветствуем вас,</span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">{user.name}</h2>
            <span className="text-[10px] sm:text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-900">
              📍 с. {user.village}
            </span>
          </div>
        </div>
      </div>

      {/* CALL FOR HELP BUTTONS */}
      <div className="space-y-4 sm:space-y-5">

        {/* GIANT CREATE HELP REQUEST BUTTON */}
        <button
          onClick={handleStartWizard}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl p-5 sm:p-7 shadow-lg border-4 border-emerald-300 text-left transition-all relative overflow-hidden flex items-center justify-between gap-4 cursor-pointer active:scale-98"
          id="simplified_need_help_button"
        >
          <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
            <span className="bg-white/20 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block max-w-full whitespace-normal text-left">
              Вам тяжело? Нужна помощь соседа?
            </span>
            <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-none text-white">
              🤝 НУЖНА ПОМОЩЬ!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-50 font-bold max-w-sm leading-snug">
              Привезти продукты, наколоть дрова, починить забор, убраться дома, починить замок.
            </p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
            <ShieldAlert size={28} className="stroke-2" />
          </div>
        </button>

        {/* GIANT TRANSPORT ACCESSIBILITY BUTTON - RIDES ONLY */}
        {onOpenTransport && (
          <button
            onClick={onOpenTransport}
            className="w-full bg-sky-700 hover:bg-sky-850 text-white rounded-3xl p-5 sm:p-7 shadow-lg border-4 border-sky-400 text-left transition-all relative overflow-hidden flex items-center justify-between gap-4 cursor-pointer active:scale-98"
            id="simplified_transport_button"
          >
            <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
              <span className="bg-white/20 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block max-w-full whitespace-normal text-left">
                Попутные поездки между деревнями
              </span>
              <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-none text-white">
                🚗 ПОПУТКИ
              </h3>
              <p className="text-xs sm:text-sm text-sky-100 font-bold max-w-sm leading-snug">
                Найти попутную машину до райцентра, соседней деревни или предложить подвезти соседа.
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <Users size={28} className="stroke-2 text-sky-200" />
            </div>
          </button>
        )}

        {/* GIANT BATTERY COLLECTION POINTS BUTTON */}
        {onOpenEcology && (
          <button
            onClick={onOpenEcology}
            className="w-full bg-teal-700 hover:bg-teal-850 text-white rounded-3xl p-5 sm:p-7 shadow-lg border-4 border-teal-400 text-left transition-all relative overflow-hidden flex items-center justify-between gap-4 cursor-pointer active:scale-98"
            id="simplified_ecology_button"
          >
            <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
              <span className="bg-white/20 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block max-w-full whitespace-normal text-left">
                Пункты приёма использованных батареек
              </span>
              <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-none text-white">
                🔋 БАТАРЕЙКИ
              </h3>
              <p className="text-xs sm:text-sm text-teal-100 font-bold max-w-sm leading-snug">
                Адреса и часы работы контейнеров для раздельного сбора батареек в районе.
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <Leaf size={28} className="stroke-2 text-teal-200 fill-teal-200" />
            </div>
          </button>
        )}

        {/* GIANT REFERRALS / INVITE FRIEND ACCESSIBILITY BUTTON */}
        {onOpenReferrals && (
          <button
            onClick={onOpenReferrals}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-3xl p-5 sm:p-7 shadow-lg border-4 border-amber-300 text-left transition-all relative overflow-hidden flex items-center justify-between gap-4 cursor-pointer active:scale-98"
            id="simplified_referrals_button"
          >
            <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
              <span className="bg-white/20 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block max-w-full whitespace-normal text-left font-sans">
                Приглашайте соседей и получайте баллы
              </span>
              <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-none text-white">
                🤝 ПРИВЕДИ ДРУГА
              </h3>
              <p className="text-xs sm:text-sm text-amber-50 font-bold max-w-sm leading-snug">
                Поделитесь вашим кодом и получайте до +120 Спасибо за каждого друга, который присоединится к платформе!
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <Users size={28} className="stroke-2 text-yellow-100" />
            </div>
          </button>
        )}

        {/* GIANT MAP / PLACES ACCESSIBILITY BUTTON */}
        {onOpenPlaces && (
          <button
            onClick={onOpenPlaces}
            className="w-full bg-[#1A3A2A] hover:bg-emerald-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border-4 border-emerald-300 text-left transition-all relative overflow-hidden flex items-center justify-between gap-4 cursor-pointer active:scale-98"
            id="simplified_places_button"
          >
            <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
              <span className="bg-white/20 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block max-w-full whitespace-normal text-left font-sans">
                Интерактивный культурно-исторический навигатор
              </span>
              <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-none text-white">
                🗺️ КАРТА УСТЬЯН
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-bold max-w-sm leading-snug">
                Храмы, резные усадьбы, музеи и эко-тропы района. Находите удивительные места рядом с вами и предлагайте новые!
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <MapIcon size={28} className="stroke-2 text-emerald-100" />
            </div>
          </button>
        )}

        {/* ACTIVE MY REQUESTS STATS */}
        {activeMyRequests.length > 0 && (
          <div className="bg-yellow-50 rounded-3xl border-3 border-yellow-300 p-5 shadow-xs space-y-3">
            <h4 className="text-lg font-black text-slate-850 flex items-center gap-1.5">
              <span className="text-xl">⏳</span> Ваши открытые просьбы на сегодня ({activeMyRequests.length}):
            </h4>
            <div className="space-y-3">
              {activeMyRequests.map(req => {
                const correspondingChat = myChats.find(c => c.postId === req.id);
                const hasCompanion = !!correspondingChat;
                const responderUser = hasCompanion ? users.find(u => u.id === correspondingChat.responderId) : null;

                return (
                  <div key={req.id} className="bg-white p-4 rounded-2xl border-2 border-yellow-100 space-y-3 shadow-xs">
                    <div>
                      <h5 className="text-lg font-black text-slate-900 leading-tight">{req.title}</h5>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-black">📍 Размещено в с. {req.village}</p>
                    </div>

                    {hasCompanion ? (
                      <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl space-y-2">
                        <p className="text-sm font-black text-slate-900">
                          💚 Сосед <strong className="text-emerald-700">{responderUser?.name || "Иван"}</strong> готов вам помочь!
                        </p>
                        <button
                          onClick={() => onSelectChat(correspondingChat.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <MessageSquare size={16} />
                          <span>ОТКРЫТЬ ДИАЛОГ С НИМ</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
                        <p className="text-xs font-black text-amber-800">
                          Просьба видна всем соседям в деревне. Ожидаем откликов!
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (confirm("Вы хотите отменить эту просьбу? Обозначить как решённую?")) {
                          // Resolve request
                          if (correspondingChat) {
                            onResolveRequest(req.id, correspondingChat.id);
                          } else {
                            onResolveRequest(req.id, "");
                          }
                        }
                      }}
                      className="w-full text-center text-xs font-black text-red-600 hover:text-red-800 underline block"
                    >
                      ❌ Больше не требуется (Убрать просьбу)
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MY CHATS LISTING (MESSAGES) */}
        {myChats.length > 0 && (
          <div className="bg-white rounded-3xl border-3 border-emerald-300 p-5 shadow-md space-y-4">
            <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-emerald-600 shrink-0" size={24} />
              <span>💬 Мои переписки с помощниками:</span>
            </h4>
            
            <div className="space-y-3">
              {myChats.map(chat => {
                const companionId = chat.authorId === currentUserId ? chat.responderId : chat.authorId;
                const partner = users.find(u => u.id === companionId);
                const hasUnread = chat.authorId === currentUserId ? chat.unreadCountAuthor > 0 : chat.unreadCountResponder > 0;

                return (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all active:scale-98 ${
                      hasUnread 
                        ? 'border-red-400 bg-red-50/20 animate-pulse' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900">
                          🙋 {partner?.name || "Помощник"}
                        </span>
                        {hasUnread && (
                          <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase animate-bounce shrink-0">
                            НОВОЕ!
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-black text-emerald-700">Просьба: "{chat.postTitle}"</p>
                      <p className="text-sm font-bold text-slate-500 truncate mt-1">Последнее: {chat.lastMessageText}</p>
                    </div>
                    <ArrowRight size={20} className="text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* NEIGHBOR REQUESTS LIST */}
        <div className="bg-white rounded-3xl border-3 border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h4 className="text-lg font-black text-slate-800 flex items-center gap-2 leading-tight">
              <MapPin className="text-emerald-600 shrink-0" size={22} />
              <span>Просьбы соседей в с. {user.village}:</span>
            </h4>
            <span className="bg-emerald-50 text-emerald-700 text-sm font-black px-2.5 py-1 rounded-full shrink-0">
              {villageRequests.length}
            </span>
          </div>

          {/* Beautiful Stats Bar for Elderly */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 flex justify-between items-center text-center shadow-xs">
            <div className="flex-1">
              <span className="text-2xl">🤝</span>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase mt-1">Сегодня помогли</p>
              <p className="text-xl font-black text-emerald-800 leading-none mt-1">5 раз</p>
            </div>
            <div className="w-0.5 h-10 bg-slate-200"></div>
            <div className="flex-1">
              <span className="text-2xl">🪵</span>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase mt-1">Частая нужда</p>
              <p className="text-xl font-black text-orange-700 leading-none mt-1">Колка дров</p>
            </div>
            <div className="w-0.5 h-10 bg-slate-200"></div>
            <div className="flex-1">
              <span className="text-2xl">🌲</span>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase mt-1">Решено всего</p>
              <p className="text-xl font-black text-teal-800 leading-none mt-1">142 дела</p>
            </div>
          </div>

          {villageRequests.length === 0 ? (
            <div className="text-center py-6 px-4 bg-slate-100/50 rounded-2xl space-y-3">
              <p className="text-slate-500 font-bold text-base">В вашей деревне сейчас тихо 🌲</p>
              <p className="text-xs text-slate-400 mt-1">Все вопросы улажены! Соседи не оставляли открытых просьб.</p>
              <div className="border-t border-slate-200/60 my-2 pt-2">
                <p className="text-xs text-emerald-700 font-extrabold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 inline-block leading-relaxed">
                  Если вам нужна помощь — нажмите большую зелёную кнопку "НУЖНА ПОМОЩЬ!"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {villageRequests.map(req => (
                <div key={req.id} className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 space-y-3 hover:border-emerald-300 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg shadow-xs border">
                      <CategoryIcon catId={req.category} size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase">с. {req.village}</span>
                  </div>
                  
                  <div>
                    <h5 className="text-lg font-black text-slate-900 leading-snug">{req.title}</h5>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed font-bold">{req.description}</p>
                    <p className="text-xs text-slate-400 mt-2">Автор: {req.authorName} (Рейтинг ★{req.authorRating})</p>
                  </div>
                  
                  {req.authorId !== currentUserId ? (
                    <button
                      onClick={() => onRespond(req)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl shadow-md text-base flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-emerald-400 cursor-pointer"
                    >
                      <Heart size={16} className="fill-white" /> Помочь соседу!
                    </button>
                  ) : (
                    <div className="text-slate-500 text-xs font-bold bg-slate-100 p-2.5 rounded-xl text-center border">
                      Это ваша просьба о помощи
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Speech Input Modal */}
        {isSpeechModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 border-4 border-orange-400 space-y-6 animate-scaleIn shadow-2xl">
              <div className="text-center">
                <span className="text-5xl">🎙️</span>
                <h3 className="text-2xl font-black text-slate-800 mt-2">Голосовой ввод</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Скажите голосом вашу просьбу или выберите готовый быстрый шаблон ниже
                </p>
              </div>

              {/* Listening State Card */}
              <div className={`p-5 rounded-2xl border-2 text-center transition-all ${
                isListening 
                  ? "border-orange-500 bg-orange-50 animate-pulse" 
                  : speechTranscript 
                    ? "border-emerald-300 bg-emerald-50" 
                    : "border-slate-200 bg-slate-50"
              }`}>
                {isListening ? (
                  <div className="space-y-3">
                    <div className="flex justify-center gap-1.5 py-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <p className="text-lg font-black text-orange-800 leading-tight">СЛУШАЕМ ВАС... ГОВОРИТЕ!</p>
                    <p className="text-sm text-orange-600 font-bold italic">
                      "{speechTranscript || "Говорите четко и громко"}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {speechTranscript ? (
                      <>
                        <p className="text-xs text-emerald-800 font-extrabold uppercase tracking-wide">Распознанный текст:</p>
                        <p className="text-lg font-black text-slate-800 italic">
                          "{speechTranscript}"
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 font-bold leading-normal">
                        Нажмите кнопку «НАЧАТЬ ГОВОРИТЬ», разрешите доступ к микрофону и диктуйте!
                      </p>
                    )}
                  </div>
                )}

                {speechError && (
                  <p className="text-xs text-red-600 font-bold mt-2">⚠️ {speechError}</p>
                )}
              </div>

              {/* Quick Option Templates for Elderly */}
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider block">Или нажмите на готовый ответ:</p>
                <div className="grid grid-cols-2 gap-2">
                  {speechTarget === 'customDetails' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSpeechTranscript("Дом 12, у почты")}
                        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs text-left transition-all border border-slate-200 cursor-pointer"
                      >
                        🏡 Дом у почты
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeechTranscript("Дом 15, синий забор")}
                        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs text-left transition-all border border-slate-200 cursor-pointer"
                      >
                        🎨 Синий забор
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeechTranscript("Жду у калитки во двор")}
                        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs text-left transition-all border border-slate-200 cursor-pointer"
                      >
                        🚪 Жду у калитки
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeechTranscript("Зайдите прямо в дом")}
                        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs text-left transition-all border border-slate-200 cursor-pointer"
                      >
                        🔑 Зайдите в дом
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSpeechTranscript("Здравствуйте, когда вас ожидать?")}
                        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs text-left transition-all border border-slate-200 cursor-pointer"
                      >
                        👋 Когда ждать?
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeechTranscript("Спасибо огромное за помощь!")}
                        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs text-left transition-all border border-slate-200 cursor-pointer"
                      >
                        ❤️ Спасибо большое!
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeechTranscript("Позвоните мне на телефон, пожалуйста")}
                        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs text-left transition-all border border-slate-200 cursor-pointer"
                      >
                        📞 Позвоните мне!
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeechTranscript("Всё в порядке, помощь уже пришла")}
                        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs text-left transition-all border border-slate-200 cursor-pointer"
                      >
                        ✅ Помощь уже есть
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-col gap-2 pt-2">
                {isListening ? (
                  <button
                    type="button"
                    onClick={stopListening}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-lg shadow-md transition-all active:scale-95 uppercase tracking-wide cursor-pointer"
                  >
                    🛑 ОСТАНОВИТЬ ЗАПИСЬ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startListening}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl text-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide border-2 border-orange-400"
                  >
                    <span>🎤 НАЧАТЬ ГОВОРИТЬ</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseSpeechModal}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold py-3.5 rounded-xl text-sm transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleApplySpeechText}
                    disabled={!speechTranscript}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 active:scale-95 uppercase shadow-sm"
                  >
                    ✅ Вставить текст
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
