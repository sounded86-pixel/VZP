import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageSquare, Share2, Send, Sparkles, Plus, X, Check, 
  Smile, Compass, Award, Shield, Info, Baby, ArrowUpRight, 
  CheckCircle2, Bot, User, Megaphone, HelpCircle, Scale, AlertTriangle,
  Volume2, VolumeX
} from 'lucide-react';
import { UserProfile, HelpRequest, GoodNews, PersonaChat, GoodNewsComment, PersonaChatMessage } from '../types';
import { db } from '../firebase';
import { 
  collection, doc, getDocs, onSnapshot, setDoc, updateDoc, 
  query, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import { COZY_IMAGES } from '../constants/cozyAssets';

interface DeepSeekScreenProps {
  currentUser: UserProfile;
  requests: HelpRequest[];
  onNavigateToLenta: () => void;
  onNavigateToCreatePost: (initialTitle?: string, initialDesc?: string) => void;
  isCozyTheme?: boolean;
}

// 5 Helpers (Real residents with animal pets) definition
export interface Character {
  id: 'dobrynya' | 'alisa' | 'misha' | 'zoia' | 'sofia';
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  avatarBg: string;
  accentColor: string;
  quickPrompts: string[];
  imageUrl?: string;
}

const CHARACTERS: Character[] = [
  {
    id: 'dobrynya',
    name: 'Баба Нюра (и пёс Добрыня 🐕)',
    emoji: '👵🐕',
    title: 'Хранительница добрых вестей',
    description: 'Добрая устьянская бабушка. Поделится самыми теплыми вестями из сел нашего района вместе со своим верным псом Добрыней.',
    gradient: 'from-amber-400 to-orange-500',
    avatarBg: 'bg-amber-50 border-amber-300',
    accentColor: 'text-amber-700',
    imageUrl: COZY_IMAGES.babaNyura,
    quickPrompts: [
      "Расскажи хорошую новость про Устьяны!",
      "Как помочь соседям и получить баллы «Спасибо»?",
      "Расскажи историю про устьянских мастеров и верного пса."
    ]
  },
  {
    id: 'alisa',
    name: 'Тётя Клава (и лиса Алиса 🦊)',
    emoji: '👩‍💻🦊',
    title: 'Помощница по дому и хозяйству',
    description: 'Добрая соседка с ноутбуком. Поможет составить просьбу, написать обращение или навести порядок со своей смышлёной лисичкой Алисой.',
    gradient: 'from-orange-400 to-red-500',
    avatarBg: 'bg-orange-50 border-orange-300',
    accentColor: 'text-orange-700',
    imageUrl: COZY_IMAGES.tetyaKlava,
    quickPrompts: [
      "Как экологично очистить посуду без химии?",
      "Рецепт вкусного устьянского пирога на скорую руку.",
      "Как через интернет отправить просьбу о помощи?"
    ]
  },
  {
    id: 'misha',
    name: 'Дед Тимофей (и медведь Миша 🐻)',
    emoji: '👴🐻',
    title: 'Народный мастер-плотник',
    description: 'Опытный деревенский плотник. Починит любое крыльцо, сложит печь и подскажет, как правильно заготовить дрова вместе со своим верным медведем Мишей.',
    gradient: 'from-stone-400 to-amber-700',
    avatarBg: 'bg-amber-50 border-amber-800/20',
    accentColor: 'text-stone-800',
    imageUrl: COZY_IMAGES.dedTimofey,
    quickPrompts: [
      "Как подготовить дрова на зиму, чтобы они не мокли?",
      "Как сложить теплую и надежную кирпичную печь?",
      "Простой совет, как подправить покосившийся забор."
    ]
  },
  {
    id: 'zoia',
    name: 'Фельдшер Маша (и зайка Зоя 🐇)',
    emoji: '👩‍⚕️🐇',
    title: 'Помощница по здоровью',
    description: 'Заботливая медсестра и травница. Спешит на выручку, подскажет рецепты полезных отваров и суставную гимнастику с пушистой зайкой Зоей.',
    gradient: 'from-emerald-400 to-teal-600',
    avatarBg: 'bg-emerald-50 border-emerald-300',
    accentColor: 'text-emerald-700',
    imageUrl: COZY_IMAGES.feldsherMasha,
    quickPrompts: [
      "Какая травяная смесь помогает лучше уснуть?",
      "Простая разминка для суставов по утрам.",
      "Как правильно использовать Кнопку SOS в телефоне?"
    ]
  },
  {
    id: 'sofia',
    name: 'Марья Ивановна (и сова София 🦉)',
    emoji: '👩‍🏫🦉',
    title: 'Советница по льготам и субсидиям',
    description: 'Мудрая сельская учительница. Подскажет, как оформить субсидии на дрова, льготы и справиться со сложными вопросами со своей умной совой Софией.',
    gradient: 'from-indigo-400 to-purple-600',
    avatarBg: 'bg-indigo-50 border-indigo-300',
    accentColor: 'text-indigo-700',
    imageUrl: COZY_IMAGES.maryaIvanovna,
    quickPrompts: [
      "Как оформить субсидию на покупку дров пенсионеру?",
      "Какие льготы положены многодетным семьям в селе?",
      "Объясни просто правила дорожной безопасности."
    ]
  }
];

// Initial seed news to show if collection is empty
const INITIAL_SEED_NEWS: Omit<GoodNews, 'id'>[] = [
  {
    author: 'dobrynya',
    authorName: 'Баба Нюра (и пёс Добрыня)',
    authorAvatar: '👵',
    title: 'Настоящее устьянское чудо в Шангалах!',
    content: 'Вчера группа волонтеров и неравнодушных соседей всего за три часа сложила целую поленницу колотых березовых дров для нашей всеми любимой бабы Маши! Она искренне благодарила всех со слезами на глазах. Вот это я понимаю — взаимопомощь на совесть! Наша сила — в добрых и отзывчивых сердцах! ❤️',
    category: 'story',
    likes: 12,
    comments: [
      { userId: 'test_1', userName: 'Алексей С.', text: 'Молодцы ребята! Настоящее доброе дело!', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    isPublished: true,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    author: 'alisa',
    authorName: 'Тётя Клава (и лиса Алиса)',
    authorAvatar: '👩‍💻',
    title: 'Секрет идеальной чистоты раковины без химии!',
    content: 'Хозяюшки, делюсь своей хитрой уловкой! Забудьте о дорогой и едкой химии. Возьмите обычную пищевую соду, выдавите туда сок половинки лимона, натрите раковину и оставьте на 10 минут. Затем просто смойте теплой водой. Любой налет, ржавчина и потемнения исчезнут, а в доме будет пахнуть свежестью устьянского сада! Экономно и безопасно для здоровья! 🍋✨',
    category: 'tip',
    likes: 8,
    comments: [],
    isPublished: true,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    author: 'zoia',
    authorName: 'Фельдшер Маша (и зайка Зоя)',
    authorAvatar: '👩‍⚕️',
    title: 'Витаминный сбор для крепкого сна и бодрости',
    content: 'Дорогие мои, в период летних хлопот в огороде нашему организму нужен правильный отдых. Мой любимый вечерний сбор: заварите в равных долях сушеную ромашку, листья мяты и горсть сушеной земляники. Дайте настояться 15 минут. Напиток успокоит нервы, снимет усталость с мышц и подарит крепкий, здоровый сон. Будьте здоровы и полны сил! 🌿🍵',
    category: 'tip',
    likes: 15,
    comments: [],
    isPublished: true,
    createdAt: new Date(Date.now() - 28800000).toISOString()
  }
];

export default function DeepSeekScreen({
  currentUser,
  requests,
  onNavigateToLenta,
  onNavigateToCreatePost,
  isCozyTheme = false
}: DeepSeekScreenProps) {
  const activeCharacters = React.useMemo(() => {
    return CHARACTERS;
  }, []);

  // Mode selection: 'standard' | 'elderly' | 'child'
  const [activeMode, setActiveMode] = useState<'standard' | 'elderly' | 'child'>(() => {
    if (currentUser.role === 'elderly') return 'elderly';
    if (currentUser.role === 'child') return 'child';
    return 'standard';
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'assistant' | 'optimizer'>('feed');
  const [newsList, setNewsList] = useState<GoodNews[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Character | null>(null);
  
  // Feed States
  const [loadingNews, setLoadingNews] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState<'news' | 'tip' | 'story' | 'announcement'>('story');
  const [moderating, setModerating] = useState(false);
  const [activeCommentNewsId, setActiveCommentNewsId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Chat States
  const [chatHistory, setChatHistory] = useState<PersonaChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Ad Optimizer States
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adCategory, setAdCategory] = useState('wood');
  const [optimizedAd, setOptimizedAd] = useState<{
    optimizedTitle?: string;
    optimizedDescription?: string;
    tips?: string[];
  } | null>(null);
  const [loadingOptimizer, setLoadingOptimizer] = useState(false);

  // ======================= WEB SPEECH API TTS SYSTEM =======================
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ustyany_speech_enabled');
      return saved === 'true'; // Off by default (muted) as requested by user
    }
    return false;
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [lastAutoSpokenNewsId, setLastAutoSpokenNewsId] = useState<string | null>(null);
  const [lastAutoSpokenChatMsgIndex, setLastAutoSpokenChatMsgIndex] = useState<number>(-1);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const toggleSpeechEnabled = () => {
    const nextValue = !isSpeechEnabled;
    setIsSpeechEnabled(nextValue);
    localStorage.setItem('ustyany_speech_enabled', String(nextValue));
    if (!nextValue) {
      stopSpeaking();
    }
  };

  const getCharacterVoiceConfig = (charId: string) => {
    const ruVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ru'));
    
    // Find specific voices by common name patterns to get different genders/timbres if available
    const femaleVoices = ruVoices.filter(v => 
      v.name.toLowerCase().includes('irina') || 
      v.name.toLowerCase().includes('elena') || 
      v.name.toLowerCase().includes('ekaterina') || 
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('milena') ||
      v.name.toLowerCase().includes('tatyana') ||
      v.name.toLowerCase().includes('google русский')
    );
    
    const maleVoices = ruVoices.filter(v => 
      v.name.toLowerCase().includes('pavel') || 
      v.name.toLowerCase().includes('maxim') || 
      v.name.toLowerCase().includes('dmitry') || 
      v.name.toLowerCase().includes('male') ||
      v.name.toLowerCase().includes('alexander')
    );

    let voice: SpeechSynthesisVoice | null = null;
    let pitch = 1.0;
    let rate = 1.0;

    // Use highly natural parameters (pitch/rate close to 1.0) to completely eliminate robotic or sped-up old film sounds!
    switch (charId) {
      case 'dobrynya': // Wise Dog, mature calm natural voice
        voice = maleVoices[0] || ruVoices[0] || null;
        pitch = 0.95;
        rate = 0.90;
        break;
      case 'alisa': // Fox, friendly, slightly quick but very clear and pleasant
        voice = femaleVoices[0] || ruVoices[0] || null;
        pitch = 1.05;
        rate = 1.02;
        break;
      case 'misha': // Bear-builder, solid, clear, deeper but perfectly natural
        voice = maleVoices[1 % maleVoices.length] || maleVoices[0] || ruVoices[0] || null;
        pitch = 0.90;
        rate = 0.92;
        break;
      case 'zoia': // Bunny-health helper, warm, gentle and sweet
        voice = femaleVoices[1 % femaleVoices.length] || femaleVoices[0] || ruVoices[0] || null;
        pitch = 1.05;
        rate = 0.98;
        break;
      case 'sofia': // Scholar Owl, wise, clear and highly articulate
        voice = femaleVoices[2 % femaleVoices.length] || femaleVoices[0] || ruVoices[0] || null;
        pitch = 1.0;
        rate = 0.95;
        break;
      case 'petia': // Penguin, cheerful, lively and perfectly audible
        voice = maleVoices[2 % maleVoices.length] || ruVoices[0] || null;
        pitch = 1.05;
        rate = 1.05;
        break;
      default:
        voice = ruVoices[0] || null;
        pitch = 1.0;
        rate = 1.0;
    }

    return { voice, pitch, rate };
  };

  const speak = (text: string, charId: string, textId: string, force = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported in this browser");
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    // If we clicked play on the already speaking text, clicking it again will toggle (stop) it
    if (currentlySpeakingId === textId) {
      setCurrentlySpeakingId(null);
      return;
    }

    // Only allow auto-speech if speech is enabled, but allow direct button click (force === true)
    if (!isSpeechEnabled && !force) {
      return;
    }

    // Strip HTML/Markdown-like markers and emojis to make pronunciation smooth and clean
    const cleanText = text
      .replace(/[\d\w._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/gi, '') // omit emails
      .replace(/[^\w\sа-яёА-ЯЁ.,!?-]/g, '') // remove emojis/special chars
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const { voice, pitch, rate } = getCharacterVoiceConfig(charId);

    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = 'ru-RU';
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => {
      setCurrentlySpeakingId(textId);
    };

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = (e) => {
      console.warn("TTS utterance completed with code (often 'interrupted' or 'not-allowed'):", e);
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  };

  // Auto-speak news and tips for elderly users (only if speech is enabled)
  useEffect(() => {
    if (isSpeechEnabled && activeMode === 'elderly' && activeTab === 'feed' && newsList.length > 0 && !loadingNews) {
      const latestNews = newsList[0];
      if (latestNews && latestNews.id !== lastAutoSpokenNewsId) {
        // Auto-read the title and content of the news
        const textToSpeak = `Новость от автора ${latestNews.authorName}. Заголовок: ${latestNews.title}. Текст: ${latestNews.content}`;
        speak(textToSpeak, latestNews.author, latestNews.id);
        setLastAutoSpokenNewsId(latestNews.id);
      }
    }
  }, [isSpeechEnabled, activeMode, activeTab, newsList, loadingNews, lastAutoSpokenNewsId]);

  // Auto-speak persona chat responses (especially useful for elderly, only if speech is enabled)
  useEffect(() => {
    if (isSpeechEnabled && selectedPersona && chatHistory.length > 0) {
      const lastMsgIdx = chatHistory.length - 1;
      const lastMsg = chatHistory[lastMsgIdx];
      if (lastMsg && lastMsg.sender === 'persona' && lastMsgIdx !== lastAutoSpokenChatMsgIndex) {
        if (activeMode === 'elderly') {
          speak(lastMsg.text, selectedPersona.id, `chat_${lastMsgIdx}`);
          setLastAutoSpokenChatMsgIndex(lastMsgIdx);
        }
      }
    }
  }, [isSpeechEnabled, chatHistory, selectedPersona, activeMode, lastAutoSpokenChatMsgIndex]);

  // Stop speaking when user changes tabs, personas or active modes to avoid overlapping speech
  useEffect(() => {
    stopSpeaking();
  }, [activeTab, selectedPersona, activeMode]);

  // Load Good News Feed from Firestore
  useEffect(() => {
    setLoadingNews(true);
    const q = query(collection(db, 'good_news'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Seed database if empty
        console.log("Seeding good_news collection with cartoon stories...");
        try {
          for (const item of INITIAL_SEED_NEWS) {
            const docId = `news_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await setDoc(doc(db, 'good_news', docId), {
              ...item,
              id: docId
            });
          }
        } catch (error) {
          console.error("Error seeding good news:", error);
        }
        setLoadingNews(false);
      } else {
        const list: GoodNews[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as GoodNews);
        });
        setNewsList(list);
        setLoadingNews(false);
      }
    }, (error) => {
      console.warn("Firestore good_news read failed. Falling back to local storage...", error);
      // Fallback
      const saved = localStorage.getItem('ustyany_local_good_news');
      if (saved) {
        setNewsList(JSON.parse(saved));
      } else {
        const items = INITIAL_SEED_NEWS.map((item, idx) => ({ ...item, id: `local_news_${idx}` }));
        setNewsList(items as GoodNews[]);
      }
      setLoadingNews(false);
    });

    return () => unsubscribe();
  }, []);

  // Save News list to localstorage whenever it updates for offline safety
  useEffect(() => {
    if (newsList.length > 0) {
      localStorage.setItem('ustyany_local_good_news', JSON.stringify(newsList));
    }
  }, [newsList]);

  // Load/Subscribe Chat messages for selected helper from Firestore
  useEffect(() => {
    if (!selectedPersona) {
      setChatHistory([]);
      return;
    }

    const chatId = `persona_${currentUser.id}_${selectedPersona.id}`;
    
    // Add a default welcome message if chat history is empty
    const getDefaultWelcome = () => {
      let welcomeText = '';
      if (activeMode === 'child') {
        welcomeText = `✨ Приветик, юный путешественник! Я ${selectedPersona.name} ${selectedPersona.emoji}! Рад видеть тебя в нашей доброй лесной сказке! 🌟 Какое весёлое приключение мы сегодня устроим или какую тайну разгадаем? Давай играть! 🚀`;
      } else if (activeMode === 'elderly') {
        welcomeText = `Здравствуйте, уважаемый ${currentUser.name}! 👵👴 Я ${selectedPersona.name} ${selectedPersona.emoji}, ваш верный деревенский помощник. Чем могу уважить вас сегодня? Расскажу новости крупным шрифтом, помогу найти расписание автобусов или подскажу простой совет для здоровья. Спрашивайте спокойно, я не спешу.`;
      } else {
        welcomeText = `Приветствую, ${currentUser.name}! Я ${selectedPersona.name} ${selectedPersona.emoji}, ${selectedPersona.title}. Чем могу помочь вам сегодня в быту, хозяйстве или поиске информации в Устьянах? Задавайте любой вопрос!`;
      }
      return [{ sender: 'persona' as const, text: welcomeText, createdAt: new Date().toISOString() }];
    };

    const unsubscribe = onSnapshot(doc(db, 'persona_chats', chatId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PersonaChat;
        setChatHistory(data.messages || []);
      } else {
        setChatHistory(getDefaultWelcome());
      }
    }, (error) => {
      console.warn("Firestore persona chat read error, using offline local storage...");
      const savedChats = localStorage.getItem(`ustyany_chat_${selectedPersona.id}`);
      if (savedChats) {
        setChatHistory(JSON.parse(savedChats));
      } else {
        setChatHistory(getDefaultWelcome());
      }
    });

    return () => unsubscribe();
  }, [selectedPersona, activeMode]);

  // Save Chat history to local storage for offline
  useEffect(() => {
    if (selectedPersona && chatHistory.length > 0) {
      localStorage.setItem(`ustyany_chat_${selectedPersona.id}`, JSON.stringify(chatHistory));
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, selectedPersona]);

  // Submit Like
  const handleLike = async (newsItem: GoodNews) => {
    const isLiked = newsItem.likedBy?.includes(currentUser.id);
    const updatedLikes = isLiked ? Math.max(0, newsItem.likes - 1) : newsItem.likes + 1;
    const updatedLikedBy = isLiked 
      ? (newsItem.likedBy || []).filter(uid => uid !== currentUser.id)
      : [...(newsItem.likedBy || []), currentUser.id];

    // Optimistic state update
    setNewsList(prev => prev.map(item => item.id === newsItem.id ? { ...item, likes: updatedLikes, likedBy: updatedLikedBy } : item));

    try {
      await setDoc(doc(db, 'good_news', newsItem.id), {
        ...newsItem,
        likes: updatedLikes,
        likedBy: updatedLikedBy
      });
    } catch (err) {
      console.warn("Could not save like to Firestore, using local fallback...", err);
    }
  };

  const handleShare = (newsItem: GoodNews) => {
    const shareText = `🌟 ${newsItem.title}\n\n${newsItem.content}\n\n— Опубликовано в Добрых Вестях Устьянского района!`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedId(newsItem.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error("Could not copy text: ", err);
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent, newsId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newsItem = newsList.find(item => item.id === newsId);
    if (!newsItem) return;

    const newComment = {
      userName: currentUser.name || "Сосед",
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(newsItem.comments || []), newComment];

    // Optimistic update
    setNewsList(prev => prev.map(item => item.id === newsId ? { ...item, comments: updatedComments } : item));
    setCommentText('');

    try {
      await setDoc(doc(db, 'good_news', newsId), {
        comments: updatedComments
      }, { merge: true });
    } catch (err) {
      console.warn("Could not save comment to Firestore, using local fallback...", err);
    }
  };

  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeTitle.trim() || !writeContent.trim()) {
      alert("Заполните заголовок и содержание!");
      return;
    }

    setModerating(true);

    try {
      // Use DeepSeek to moderate first
      const response = await fetch('/api/deepseek/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Заголовок: ${writeTitle}\nТекст: ${writeContent}` }],
          systemInstruction: "You are an automated village moderator. Respond strictly in JSON format with two keys: 'approved' (true or false) and 'reason' (Russian explanation why rejected or 'Одобрено'). If there is profanity or hate speech, set approved to false. If the text is friendly and clean, set approved to true. ResponseMimeType: application/json."
        })
      });

      const data = await response.json();
      let isApproved = true;
      let rejectReason = '';

      if (response.ok && data.text) {
        try {
          // Attempt to parse deepseek JSON
          const jsonText = data.text.substring(data.text.indexOf('{'), data.text.lastIndexOf('}') + 1);
          const parsed = JSON.parse(jsonText);
          isApproved = parsed.approved;
          rejectReason = parsed.reason;
        } catch (parseErr) {
          // Fallback if not JSON
          isApproved = !data.text.toLowerCase().includes("false") && !data.text.toLowerCase().includes("отклонено");
        }
      }

      if (!isApproved) {
        alert(`😔 Извините, автоматический помощник безопасности отклонил вашу публикацию:\n"${rejectReason || "Обнаружена недопустимая лексика или спам"}"\n\nПожалуйста, напишите новость добрым, чистым и вежливым языком!`);
        setModerating(false);
        return;
      }

      // If approved, create document
      const newsId = `news_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newNews: GoodNews = {
        id: newsId,
        author: 'resident',
        authorName: currentUser.name,
        authorAvatar: currentUser.avatarUrl || '🏡',
        title: writeTitle.trim(),
        content: writeContent.trim(),
        category: writeCategory,
        likes: 0,
        likedBy: [],
        comments: [],
        isPublished: true,
        createdAt: new Date().toISOString()
      };

      // Add to Firestore
      await setDoc(doc(db, 'good_news', newsId), newNews);
      
      // Reset form
      setWriteTitle('');
      setWriteContent('');
      setWriteCategory('story');
      setShowWriteModal(false);
      alert("🎉 Ваша добрая весть успешно прошла модерацию и опубликована в ленте!");

    } catch (err: any) {
      console.error("Moderation error:", err);
      // Fallback: publish anyway in offline mode if firestore fails
      const newsId = `news_offline_${Date.now()}`;
      const fallbackNews: GoodNews = {
        id: newsId,
        author: 'resident',
        authorName: currentUser.name,
        authorAvatar: currentUser.avatarUrl || '🏡',
        title: writeTitle.trim(),
        content: writeContent.trim(),
        category: writeCategory,
        likes: 0,
        likedBy: [],
        comments: [],
        isPublished: true,
        createdAt: new Date().toISOString()
      };
      
      setNewsList(prev => [fallbackNews, ...prev]);
      setShowWriteModal(false);
      alert("📢 Опубликовано локально! В режиме офлайн модерация временно отключена.");
    } finally {
      setModerating(false);
    }
  };

  // Submit Helper Chat Message (DeepSeek API)
  const handleSendChatMessage = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim() || !selectedPersona || loadingChat) return;

    const userMsg: PersonaChatMessage = {
      sender: 'user',
      text: textToSend.trim(),
      createdAt: new Date().toISOString()
    };

    // Update history locally
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setChatInput('');
    setLoadingChat(true);

    // Prepare system instructions depending on Mode. All characters are real assistants for the Ustyany app!
    let systemInstruction = "";
    if (selectedPersona.id === 'dobrynya') {
      systemInstruction = activeMode === 'child'
        ? "Ты — Мудрый пёс Добрыня, весёлый сказочный пёс из Устьян. Общайся с РЕБЕНКОМ в игровой форме! Ты обожаешь помогать родителям и играть. Объясни ему, как пользоваться разделом 'Помощь соседей' (чтобы делать добрые дела, например, помочь маме сложить игрушки или полить цветы) и 'Семейным чатом' (чтобы всегда быть на связи с бабушкой и дедушкой). Сделай всё весёлой сказкой!"
        : activeMode === 'elderly'
        ? "Ты — Мудрый пёс Добрыня, заботливый и верный четвероногий друг пожилых жителей Устьянского района. Говори уважительно, очень вежливо, терпеливо и не спеша. Твоя миссия — помочь разобраться во всех функциях приложения: расскажи, как работает 'Помощь соседей' для заказа дров или уборки снега, как читать 'Добрые вести', как нажать 'Кнопка SOS' в экстренном случае, или где посмотреть субсидии на дрова и ЖКХ в разделе 'Власть'. Будь самым чутким и надёжным товарищем."
        : "Ты — Мудрый пёс Добрыня, главный символ и гид по приложению Взаимопомощи Устьянского района. Твой тон — добрый, преданный, умудренный жизненным опытом, но живой (иногда вставляй тёплые собачьи метафоры: 'чую верным носом', 'виляю хвостом от радости'). Твоя задача — быть лучшим другом пользователя и подробно рассказывать о любой функции нашего приложения: 'Помощь соседей', 'Добрые вести', 'Дорога', 'Продукты', 'Мастера', 'Кнопка SOS', 'Власть', 'Чистота', 'Семейный чат', 'Календарь огородника' и 'Заметки'. Объясняй всё просто, с любовью к родному Устьянскому краю.";
    } else if (selectedPersona.id === 'alisa') {
      systemInstruction = activeMode === 'child'
        ? "Ты — Лисичка Алиса, пушистый лесной гид. Общайся с РЕБЕНКОМ в форме игры! Преврати освоение приложения 'Добрые новости' в захватывающий квест. Расскажи про 'Календарь огородника' как про карту посадки волшебных семян, а про 'Заметки' — как про тайный сундучок для записи сказочных мыслей и секретов!"
        : activeMode === 'elderly'
        ? "Ты — Лиса Алиса, заботливая хозяюшка и помощница по дому. Твой тон очень нежный, теплый и уважительный. Объясни пожилым людям, как наше приложение помогает в быту: в разделе 'Продукты' можно попросить привезти продукты или лекарства из райцентра, в 'Мастера' — найти печника или сантехника, а в 'Календаре огородника' — узнать лучшие дни для рассады. Помогай с легким сердцем и заботой."
        : "Ты — Лиса Алиса, сообразительная и домовитая помощница, эксперт по быту, садоводству и кулинарии в Устьянах. Твой характер — весёлый, находчивый, хозяйственный, с лёгким тёплым лисьим очарованием. Ты прекрасно знаешь приложение и готова рассказать, как пользоваться 'Продуктами' (для заказа продуктов/медикаментов), 'Мастерами' (чтобы нанять специалистов или предложить свои услуги), 'Календарем огородника' для планирования посевов и 'Заметками' для рецептов и списков покупок. Будь настоящей близкой подругой пользователя.";
    } else if (selectedPersona.id === 'misha') {
      systemInstruction = activeMode === 'child'
        ? "Ты — Медведь Миша-Мастер, добрый и сильный строитель. Общайся с РЕБЕНКОМ! Описывай приложение как пульт управления волшебной лесной мастерской. Расскажи про раздел 'Мастера' — как там лесные звери строят домики и чинят санки. Хвали за созидание, трудолюбие и поделки!"
        : activeMode === 'elderly'
        ? "Ты — Миша-Мастер, крепкий и уважительный деревенский помощник. Твой тон спокойный, внушающий уверенность и безопасность. Объясни пожилому человеку, как через приложение решить мужские и хозяйственные вопросы: как опубликовать просьбу в разделе 'Помощь соседей' (наколоть дрова, починить забор), как найти тракториста или электрика в 'Мастера', и как работает экстренная 'Кнопка SOS' для оповещения соседей. Ты всегда рядом, чтобы подставить сильное плечо."
        : "Ты — Миша-Мастер, надежный, основательный и добродушный медведь-строитель из Устьян. Ты знаешь толк в ремонте, технике, строительстве и заготовках дров. Используй медвежьи теплые выражения ('сделаем на совесть', 'крепко сбито', 'обнимаю по-медвежьи'). Расскажи пользователям о мужских и технических разделах приложения: как нанять печника, плотника или тракториста в разделе 'Мастера', как подать объявление на ремонт в разделе 'Помощь соседей', как работает раздел 'Чистота' (субботники, утилизация отходов) и 'Кнопка SOS'. Будь самым надежным другом.";
    } else if (selectedPersona.id === 'zoia') {
      systemInstruction = activeMode === 'child'
        ? "Ты — Зайка Зоя, добрый лесной доктор. Общайся с РЕБЕНКОМ! Поиграй с ним в весёлую лесную поликлинику. Расскажи про раздел 'Чистота' — как мы вместе оберегаем чистый лесной воздух и водичку в реках. Подари воображаемые морковные витаминки силы!"
        : activeMode === 'elderly'
        ? "Ты — Зайка Зоя, ласковая и заботливая внучка-травница. Общайся с ПОЖИЛЫМ человеком с безграничной нежностью и почтением. Расскажи, как приложение бережёт их здоровье: в разделе 'Продукты' можно заказать доставку рецептурных лекарств из аптеки, в разделе 'Чистота' — следить за чистотой дворов и водоемов, а в разделе 'Помощь соседей' — всегда попросить соседей о простой помощи. Будь их утешением и заботливым ангелом."
        : "Ты — Зайка Зоя, ласковая, чуткая лесная травница и эксперт по здоровью и чистоте в Устьянах. Твой характер — невероятно заботливый, дружелюбный и нежный. Ты отлично ориентируешься в приложении и готова рассказать о функциях здорового образа жизни и взаимопомощи: как попросить о доставке лекарств в разделе 'Продукты', как следить за экологической обстановкой и утилизацией в разделе 'Чистота', и как использовать 'Помощь соседей' для добрых дел. Будь лучшей подругой, дарящей гармонию.";
    } else if (selectedPersona.id === 'sofia') {
      systemInstruction = activeMode === 'child'
        ? "Ты — Мудрая Сова София, хранительница устьянских сказок и знаний. Общайся с РЕБЕНКОМ! Задавай интересные загадки о природе Устьян. Расскажи про раздел 'Власть' как про архив мудрых лесных законов и правил безопасности. Поощряй его учиться новому!"
        : activeMode === 'elderly'
        ? "Ты — Сова София, терпеливый деревенский советник и юрист. Отвечай ПОЖИЛОМУ человеку спокойным, очень простым языком, полностью избегая канцеляризмов и сложных закорючек. Объясни, как раздел 'Власть' помогает узнать о субсидиях на покупку дров, компенсациях на газификацию, пенсиях и ветеранских выплатах. Расскажи, как записать важную информацию в 'Заметки'. Будь их мудрой опорой."
        : "Ты — Сова София, мудрая учительница, историк края и юридический консультант в Устьянах. Твой тон — взвешенный, умный, исключительно грамотный, но при этом очень теплый и дружелюбный. Твоя задача — разложить по полочкам сложные вопросы: расскажи, как устроен раздел 'Власть' (помощь в оформлении льгот, дрова), как вести личные списки в 'Заметках', как следить за порядком в 'Чистота' и как находить ответы на любые вопросы. Будь самым верным советником и другом.";
    } else if (selectedPersona.id === 'petia') {
      systemInstruction = activeMode === 'child'
        ? "Ты — Пингвин Петя, отважный путешественник на ледяном экспрессе! Общайся с РЕБЕНКОМ весело и задорно! Представь раздел 'Дорога' как космическую ракету для полетов к бабушке. Напомни ему о правилах вежливости и безопасности в дорогах!"
        : activeMode === 'elderly'
        ? "Ты — Пингвин Петя, вежливый и невероятно внимательный дорожный диспетчер. Отвечай ПОЖИЛОМУ человеку спокойно и очень четко. Объясни, как работает раздел 'Дорога': там можно найти точное расписание пригородных автобусов по району, найти надежного соседа на машине, который едет в райцентр, или самому попроситься попутчиком. Сделай их поездки легкими и безопасными."
        : "Ты — Пингвин Петя, неутомимый устьянский путешественник, водитель и веселый эксперт по дорогам и логистике. Твой характер — мега-энергичный, жизнерадостный, общительный! Расскажи пользователям о дорожных возможностях нашего приложения: как пользоваться разделом 'Дорога' для поиска машин, публикации своих поездок и просмотра расписания автобусов (Октябрьский, Шангалы и др.), и как координировать доставку грузов в разделе 'Продукты'. Твоя цель — объединять людей в пути!";
    }

    try {
      const response = await fetch('/api/deepseek/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          systemInstruction,
          temperature: 0.6
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        const reply: PersonaChatMessage = {
          sender: 'persona',
          text: data.text,
          createdAt: new Date().toISOString()
        };

        const finalHistory = [...updatedHistory, reply];
        setChatHistory(finalHistory);

        // Sync with Firestore (gracefully falling back to local storage if Firestore write fails or has permissions issues)
        const chatId = `persona_${currentUser.id}_${selectedPersona.id}`;
        try {
          await setDoc(doc(db, 'persona_chats', chatId), {
            id: chatId,
            userId: currentUser.id,
            persona: selectedPersona.id,
            messages: finalHistory,
            createdAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("Could not save helper chat to Firestore, utilizing offline local storage fallback:", dbErr);
        }
        localStorage.setItem(`ustyany_chat_${selectedPersona.id}`, JSON.stringify(finalHistory));
      } else {
        throw new Error(data.error || "Не удалось сгенерировать ответ.");
      }
    } catch (err: any) {
      console.error("Helper response failure:", err);
      const errorReply: PersonaChatMessage = {
        sender: 'persona',
        text: `🤖 Ой, что-то пошло не так у лесной связи: ${err.message || "проверьте интернет"}. Давай попробуем еще разок!`,
        createdAt: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorReply]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Optimize classified ad via DeepSeek
  const handleOptimizeAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adDesc.trim()) {
      alert("Заполните заголовок и описание объявления!");
      return;
    }

    setLoadingOptimizer(true);
    setOptimizedAd(null);

    try {
      const response = await fetch('/api/deepseek/optimize-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: adTitle,
          description: adDesc,
          category: adCategory,
          targetAudience: 'Жители Устьянского района'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setOptimizedAd(data);
      } else {
        throw new Error(data.error || "Ошибка генератора.");
      }
    } catch (err: any) {
      alert(`Не удалось оптимизировать объявление: ${err.message}`);
    } finally {
      setLoadingOptimizer(false);
    }
  };

  // Font and padding modifiers depending on active mode (Standard, Elderly, Child)
  const fontClass = activeMode === 'elderly' ? 'text-lg md:text-xl font-bold' : 'text-sm font-medium';
  const headingClass = activeMode === 'elderly' ? 'text-2xl md:text-3xl font-black tracking-tight leading-normal' : 'text-base font-extrabold text-slate-800';
  const paddingClass = activeMode === 'elderly' ? 'p-6 md:p-8 space-y-6' : 'p-4 sm:p-5 space-y-4';
  const descClass = activeMode === 'elderly' ? 'text-base md:text-lg text-slate-800 leading-relaxed font-bold' : 'text-xs text-slate-500 font-medium';

  return (
    <div className="max-w-4xl mx-auto my-4 px-4 font-sans" id="good_news_screen">
      
      {/* 1. AGES MODE CONTROL PANEL IN HEADER */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-4 shadow-sm mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-rose-400 to-indigo-600 rounded-2xl text-white shadow-md">
            <Smile size={24} className="animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 leading-tight">Взаимопомощь «Добрые Новости»</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Интерактивные сказочные помощники</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveMode('standard')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              activeMode === 'standard' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏡 Стандартный
          </button>
          <button
            onClick={() => setActiveMode('elderly')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              activeMode === 'elderly' 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👵 Пожилым (Крупно)
          </button>
          <button
            onClick={() => setActiveMode('child')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              activeMode === 'child' 
                ? 'bg-rose-500 text-white shadow-md animate-pulse' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👶 Детям (Сказка)
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC APP BANNER */}
      <div className={`bg-gradient-to-r ${
        activeMode === 'child' 
          ? 'from-rose-500 via-purple-500 to-indigo-600' 
          : activeMode === 'elderly' 
          ? 'from-amber-500 to-orange-600' 
          : 'from-indigo-600 to-indigo-950'
      } rounded-3xl p-5 sm:p-6 text-white shadow-lg mb-4 relative overflow-hidden transition-all duration-500`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles size={160} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-white/20 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              {activeMode === 'child' ? '✨ Волшебная страна сказок' : activeMode === 'elderly' ? '👵 Забота и уважение' : '🌲 Деревенская лента радости'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              {activeMode === 'child' 
                ? 'Добрые Лесные Помощники Устьян!' 
                : activeMode === 'elderly' 
                ? 'Помощь и добрые советы для старших' 
                : 'Уютный мир без сухих нейросетей'}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl font-medium">
              {activeMode === 'child'
                ? 'Познакомься со сказочными зверятами! Они помогут разгадать любые загадки, научат добру и поиграют в весёлые квесты!'
                : activeMode === 'elderly'
                ? 'Наша команда помощников всегда рядом, чтобы подсказать расписание, дать совет по хозяйству и здоровью простым и крупным текстом.'
                : 'Люди любят сказки и добрых героев. Читайте душевные новости жителей и общайтесь напрямую с нашей дружной мультяшной командой!'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 mb-4 bg-white rounded-2xl p-1 shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('feed'); setSelectedPersona(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'feed' && !selectedPersona
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Compass size={16} /> 🌟 Лента добрых вестей
        </button>
        <button
          onClick={() => { setActiveTab('assistant'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'assistant' || selectedPersona
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bot size={16} /> 🤝 Выбрать помощника ({activeCharacters.length})
        </button>
        <button
          onClick={() => { setActiveTab('optimizer'); setSelectedPersona(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'optimizer' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Megaphone size={16} /> 📝 Оптимизатор объявлений
        </button>
      </div>

      {/* ======================= TAB 1: GOOD NEWS FEED ======================= */}
      {activeTab === 'feed' && !selectedPersona && (
        <div className="space-y-4">
          
          {/* Quick Stats & Publish Trigger */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">☀️</span>
              <p className="text-xs sm:text-sm text-slate-700 font-bold">
                В нашей копилке уже <strong className="text-indigo-600">{newsList.length}</strong> добрых историй от устьян!
              </p>
            </div>
            
            <button
              onClick={() => {
                if (currentUser.blocked) {
                  alert("Внимание: Ваш аккаунт заблокирован! Публикация невозможна.");
                  return;
                }
                setShowWriteModal(true);
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Поделиться доброй вестью
            </button>
          </div>

          {/* Good News List */}
          {loadingNews ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-xs text-slate-400 font-bold">Загружаем весточки радости...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <p className="text-sm font-extrabold text-slate-700">Лента пока пуста</p>
              <p className="text-xs text-slate-400 mt-1">Будьте первыми, кто поделится хорошим делом!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {newsList.map((item) => {
                // Find helper color details
                const helperDetails = activeCharacters.find(c => c.id === item.author) || CHARACTERS.find(c => c.id === item.author);
                const isLikedByMe = item.likedBy?.includes(currentUser.id);
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white border hover:border-amber-300 rounded-[24px] p-5 sm:p-6 transition-all flex flex-col md:flex-row gap-5 relative overflow-hidden card-cozy ${
                      isCozyTheme 
                        ? 'border-[#EFEAE2] shadow-[0_4px_20px_rgba(140,93,58,0.02)] hover:shadow-[0_8px_30px_rgba(140,93,58,0.05)]' 
                        : 'border-2 border-slate-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Left Panel: Avatar & Author details */}
                    <div className={`flex md:flex-col items-center gap-3 md:w-36 shrink-0 md:text-center md:border-r md:pr-4 ${
                      isCozyTheme ? 'border-[#EFEAE2]' : 'border-slate-150'
                    }`}>
                      {isCozyTheme && helperDetails?.imageUrl ? (
                        /* Airy watercolor illustration - completely frameless */
                        <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden shrink-0 transform hover:scale-105 transition-all duration-300 bg-transparent pointer-events-none">
                          <img
                            src={helperDetails.imageUrl}
                            alt={item.authorName}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-3xl flex items-center justify-center text-3xl shadow-inner border-2 shrink-0 ${
                          helperDetails?.avatarBg || 'bg-slate-100 border-slate-250'
                        }`}>
                          {item.authorAvatar}
                        </div>
                      )}
                      <div className="text-left md:text-center">
                        <h4 className={`text-xs sm:text-sm font-black leading-tight ${
                          isCozyTheme ? 'text-[#1A3E1C] font-display' : 'text-slate-900'
                        }`}>
                          {item.authorName}
                        </h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 inline-block ${
                          isCozyTheme ? 'bg-[#FAF6EE] text-amber-800 border border-[#EFEAE2]' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.category === 'tip' ? '💡 Совет' : item.category === 'story' ? '📖 Рассказ' : item.category === 'announcement' ? '📢 Важно' : '☀️ Новость'}
                        </span>
                      </div>
                    </div>

                    {/* Right Panel: Content */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className={`font-black text-slate-900 tracking-tight ${activeMode === 'elderly' ? 'text-xl md:text-2xl' : 'text-sm sm:text-base'}`}>
                          {item.title}
                        </h3>
                        
                        {/* News content with responsive font adapting to elderly mode */}
                        <p className={`text-slate-700 mt-2 whitespace-pre-line leading-relaxed font-medium ${
                          activeMode === 'elderly' ? 'text-lg md:text-xl leading-loose font-bold' : 'text-xs sm:text-sm'
                        }`}>
                          {item.content}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          🕒 {new Date(item.createdAt).toLocaleDateString([], { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Actions buttons row */}
                        <div className="flex items-center gap-2">
                          
                          {/* Like Button */}
                          <button
                            onClick={() => handleLike(item)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isLikedByMe 
                                ? 'bg-red-50 text-red-600 border border-red-200 scale-105' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <Heart size={14} className={isLikedByMe ? 'fill-red-600 stroke-red-600' : 'stroke-slate-500'} />
                            <span>{item.likes || 0}</span>
                          </button>

                          {/* Comment trigger */}
                          <button
                            onClick={() => {
                              setActiveCommentNewsId(activeCommentNewsId === item.id ? null : item.id);
                              setCommentText('');
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              activeCommentNewsId === item.id 
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <MessageSquare size={14} className="stroke-slate-500" />
                            <span>{(item.comments || []).length}</span>
                          </button>

                          {/* Speak / Narration Button */}
                          <button
                            onClick={() => {
                              const textToSpeak = `${item.title}. ${item.content}`;
                              speak(textToSpeak, item.author, item.id, true);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              currentlySpeakingId === item.id 
                                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                            title={currentlySpeakingId === item.id ? "Остановить озвучку" : "Озвучить голосом персонажа"}
                          >
                            {currentlySpeakingId === item.id ? (
                              <>
                                <VolumeX size={14} className="text-amber-700" />
                                <span className="text-amber-800 font-extrabold">Стоп</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={14} className="text-slate-500" />
                                <span>Озвучить</span>
                              </>
                            )}
                          </button>

                          {/* Share Button */}
                          <button
                            onClick={() => handleShare(item)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check size={14} className="text-emerald-600" />
                                <span className="text-emerald-600">Скопировано</span>
                              </>
                            ) : (
                              <>
                                <Share2 size={14} className="stroke-slate-500" />
                                <span>Поделиться</span>
                              </>
                            )}
                          </button>

                          {/* Chat directly link - if cartoon helper */}
                          {helperDetails && (
                            <button
                              onClick={() => {
                                setSelectedPersona(helperDetails);
                                setActiveTab('assistant');
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
                            >
                              Спросить его <ArrowUpRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Comments Drawer */}
                      {activeCommentNewsId === item.id && (
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-150 space-y-3 mt-3 animate-fadeIn">
                          <h5 className="text-[11px] uppercase tracking-wider text-slate-500 font-black">Обсуждение весточки:</h5>
                          
                          {/* Existing comments list */}
                          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                            {(item.comments || []).length === 0 ? (
                              <p className="text-xs text-slate-400 italic font-medium">Комментариев пока нет. Напишите доброе слово первым!</p>
                            ) : (
                              (item.comments || []).map((comm, idx) => (
                                <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-150 text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <strong className="text-slate-850 font-extrabold">{comm.userName}</strong>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {new Date(comm.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 leading-normal font-medium">{comm.text}</p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Write comment input */}
                          <form onSubmit={(e) => handleCommentSubmit(e, item.id)} className="flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Напишите теплое слово..."
                              maxLength={300}
                              required
                              className="flex-1 px-3 py-2 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold bg-white"
                            />
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Send size={12} /> Отправить
                            </button>
                          </form>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ======================= TAB 2: ASSISTANT SELECTION & CHAT ======================= */}
      {(activeTab === 'assistant' || selectedPersona) && (
        <div className="space-y-4">
          
          {/* Persona selector grid (Show only if no active persona is currently chatting) */}
          {!selectedPersona ? (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-xs">
                <span className="text-3xl">🐾</span>
                <h3 className="text-base font-black text-slate-900 mt-2">Выберите доброго помощника</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto font-medium">
                  Наша команда помощников всегда на связи. Каждый из персонажей имеет свой уникальный характер, голос и сферу знаний в Устьянах.
                </p>
              </div>

              {/* Voice / Audio Settings Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-3xl text-xs shadow-sm">
                <div className="flex items-center gap-3 text-left">
                  <span className="text-2xl">🔊</span>
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm">Голосовой помощник (Web Speech API)</p>
                    <p className="text-[11px] text-slate-500 font-medium">Озвучивает ответы персонажей приятным, естественным голосом. По умолчанию выключен.</p>
                  </div>
                </div>
                
                <button
                  onClick={toggleSpeechEnabled}
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl font-black transition-all border cursor-pointer ${
                    isSpeechEnabled 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {isSpeechEnabled ? (
                    <>
                      <Volume2 size={14} />
                      <span>Озвучка: ВКЛЮЧЕНА</span>
                    </>
                  ) : (
                    <>
                      <VolumeX size={14} />
                      <span>Озвучка: ВЫКЛЮЧЕНА</span>
                    </>
                  )}
                </button>
              </div>

              <div className={isCozyTheme ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"}>
                {activeCharacters.map((char) => (
                  isCozyTheme ? (
                    <button
                      key={char.id}
                      onClick={() => setSelectedPersona(char)}
                      className="bg-white border border-[#EFEAE2] hover:border-amber-400 rounded-[24px] p-5 shadow-[0_4px_20px_rgba(140,93,58,0.02)] hover:shadow-[0_8px_30px_rgba(140,93,58,0.06)] active:scale-[0.98] transition-all flex flex-row items-center gap-5 h-44 sm:h-40 relative overflow-hidden group cursor-pointer text-left card-cozy"
                    >
                      {/* Character image completely airy, free, transparent background, no borders */}
                      {char.imageUrl ? (
                        <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden shrink-0 transform group-hover:scale-105 transition-all duration-300 pointer-events-none">
                          <img
                            src={char.imageUrl}
                            alt={char.name}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-amber-50 text-[#1A3E1C] flex items-center justify-center text-4xl transform group-hover:scale-105 transition-all duration-300 shrink-0">
                          {char.emoji}
                        </div>
                      )}

                      {/* Content Right Side */}
                      <div className="flex-1 min-w-0 flex flex-col h-full justify-between py-1">
                        <div>
                          <h4 className="font-bold text-[#1A3E1C] text-base sm:text-lg leading-tight font-display flex items-center gap-1.5">
                            {char.name}
                          </h4>
                          <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider block mt-0.5">
                            {char.title}
                          </span>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-medium">
                            {char.description}
                          </p>
                        </div>

                        {/* Modern clean footer mimicking the mockup style */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-[#2C5F2D] font-extrabold flex items-center gap-0.5">
                            Спросить соседа <ArrowUpRight size={11} />
                          </span>
                          <span className="px-4 py-1.5 bg-[#2C5F2D] hover:bg-[#3B7A3E] text-white text-[11px] font-bold rounded-xl transition-all shadow-xs shrink-0">
                            Открыть
                          </span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      key={char.id}
                      onClick={() => setSelectedPersona(char)}
                      className="bg-white border-2 border-slate-100 hover:border-indigo-300 rounded-3xl p-5 shadow-sm text-left hover:shadow-md active:scale-98 transition-all flex flex-col justify-between h-56 relative overflow-hidden group cursor-pointer"
                    >
                      <div className="space-y-3">
                        {/* Avatar sphere with float animation delay */}
                        {char.imageUrl ? (
                          <div className="h-16 w-16 overflow-hidden shrink-0 rounded-2xl shadow-md border-2 border-white transform group-hover:scale-110 transition-all duration-300 bg-[#FCF8F2]">
                            <img
                              src={char.imageUrl}
                              alt={char.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className={`h-14 w-14 rounded-2xl ${char.gradient} text-white flex items-center justify-center text-3xl shadow-md border-2 border-white transform group-hover:scale-110 transition-all duration-300 shrink-0`}>
                            {char.emoji}
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-black text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                            {char.name}
                          </h4>
                          <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">
                            {char.title}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-3 font-semibold mt-1.5 leading-relaxed">
                            {char.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-0.5 mt-2 self-end">
                        Общаться <ArrowUpRight size={12} />
                      </span>
                    </button>
                  )
                ))}
              </div>
            </div>
          ) : (
            // ACTIVE PERSO CHAT ROOM
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
              
              {/* Chat room Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedPersona(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer text-xs font-black border border-slate-200"
                  >
                    ← Назад к выбору
                  </button>
                  
                  {selectedPersona.imageUrl ? (
                    <div className={`h-12 w-12 overflow-hidden shrink-0 ${
                      isCozyTheme 
                        ? 'rounded-full bg-transparent' 
                        : 'rounded-xl shadow-inner border border-slate-200 bg-[#FCF8F2]'
                    }`}>
                      <img
                        src={selectedPersona.imageUrl}
                        alt={selectedPersona.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className={`h-11 w-11 rounded-xl ${selectedPersona.gradient} text-white flex items-center justify-center text-2xl shadow-inner shrink-0`}>
                      {selectedPersona.emoji}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">{selectedPersona.name}</h4>
                      <span className="bg-green-100 text-green-700 text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">В СЕТИ</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">{selectedPersona.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-mono font-bold block">Режим ИИ: Добрые новости V3</span>
                  <span className="text-[9px] text-indigo-600 font-black uppercase tracking-wider block">
                    {activeMode === 'child' ? '👶 Сказочный' : activeMode === 'elderly' ? '👵 Крупный' : '🏡 Стандарт'}
                  </span>
                </div>
              </div>

              {/* Voice / Audio Settings Bar */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-lg">🔊</span>
                  <div>
                    <p className="font-extrabold text-slate-800">Авто-озвучивание ответов {selectedPersona.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Улучшенные естественные голоса без роботизированного звучания.</p>
                  </div>
                </div>
                
                <button
                  onClick={toggleSpeechEnabled}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all border cursor-pointer ${
                    isSpeechEnabled 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-600 border-slate-300'
                  }`}
                >
                  {isSpeechEnabled ? (
                    <>
                      <Volume2 size={13} />
                      <span>Вкл</span>
                    </>
                  ) : (
                    <>
                      <VolumeX size={13} />
                      <span>Выкл</span>
                    </>
                  )}
                </button>
              </div>

              {/* Chat Messages container - adapts style depending on active mode */}
              <div className={`overflow-y-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-4 ${
                activeMode === 'elderly' ? 'h-[400px] text-lg' : 'h-[320px] text-sm'
              }`}>
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Speaker visual avatar icon */}
                    <div className={`h-8 w-8 shrink-0 flex items-center justify-center text-sm overflow-hidden ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl' 
                        : isCozyTheme
                          ? 'rounded-full bg-transparent'
                          : `${selectedPersona.avatarBg} border border-slate-300 rounded-xl shadow-xs`
                    }`}>
                      {msg.sender === 'user' ? (
                        '🏡'
                      ) : selectedPersona.imageUrl ? (
                        <img
                          src={selectedPersona.imageUrl}
                          alt={selectedPersona.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        selectedPersona.emoji
                      )}
                    </div>

                    <div className={`p-3.5 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                    }`}>
                      {/* Dynamic content rendering with age group modifications */}
                      <p className={`whitespace-pre-line font-medium leading-relaxed ${
                        activeMode === 'elderly' ? 'text-base md:text-lg leading-loose font-bold' : 'text-xs sm:text-sm'
                      }`}>
                        {msg.text}
                      </p>
                      
                      <div className="flex items-center justify-between gap-4 mt-1.5 border-t border-slate-100/50 pt-1">
                        {msg.sender === 'persona' ? (
                          <button
                            onClick={() => speak(msg.text, selectedPersona.id, `chat_${idx}`, true)}
                            className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                              currentlySpeakingId === `chat_${idx}`
                                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                            title={currentlySpeakingId === `chat_${idx}` ? "Остановить озвучку" : "Озвучить голосом персонажа"}
                          >
                            {currentlySpeakingId === `chat_${idx}` ? (
                              <>
                                <VolumeX size={10} className="text-amber-700" />
                                <span>Стоп</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={10} className="text-slate-500" />
                                <span>Озвучить</span>
                              </>
                            )}
                          </button>
                        ) : <div />}
                        
                        <span className={`block text-[9px] font-mono ${
                          msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading typing bubble */}
                {loadingChat && (
                  <div className="flex gap-3 mr-auto max-w-[80%]">
                    <div className={`h-8 w-8 shrink-0 flex items-center justify-center text-sm overflow-hidden ${
                      isCozyTheme
                        ? 'rounded-full bg-transparent'
                        : `${selectedPersona.avatarBg} border border-slate-300 rounded-xl shadow-xs`
                    }`}>
                      {selectedPersona.imageUrl ? (
                        <img
                          src={selectedPersona.imageUrl}
                          alt={selectedPersona.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        selectedPersona.emoji
                      )}
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-400 rounded-tl-none italic flex items-center gap-2 text-xs font-bold">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                      {selectedPersona.name} обдумывает ответ...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Character quick prompts helpers */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Рекомендуемые вопросы:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPersona.quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChatMessage(p)}
                      disabled={loadingChat}
                      className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 border border-slate-250 rounded-lg transition-all cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }}
                className="flex gap-2 pt-2 border-t border-slate-100"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Спросить помощника ${selectedPersona.name}...`}
                  maxLength={1000}
                  disabled={loadingChat}
                  className="flex-1 px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm font-semibold bg-white outline-none"
                />
                <button
                  type="submit"
                  disabled={loadingChat || !chatInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Send size={15} /> Отправить
                </button>
              </form>

            </div>
          )}

        </div>
      )}

      {/* ======================= TAB 3: AD OPTIMIZER ======================= */}
      {activeTab === 'optimizer' && !selectedPersona && (
        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
            <Megaphone size={20} className="text-indigo-600 animate-pulse" />
            <h4 className="font-black text-slate-800 text-sm sm:text-base">Генератор и оптимизатор объявлений</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Form */}
            <form onSubmit={handleOptimizeAd} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-black uppercase tracking-wider mb-1">
                  Заголовок объявления
                </label>
                <input
                  type="text"
                  required
                  placeholder="Пример: Продам дрова березовые колотые"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-250 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-black uppercase tracking-wider mb-1">
                  Категория
                </label>
                <select
                  value={adCategory}
                  onChange={(e) => setAdCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-250 rounded-xl text-xs font-black bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="wood">🪵 Дрова / Лесоматериалы</option>
                  <option value="tractor">🚜 Трактор / Сельхозтехника</option>
                  <option value="carpentry">🔨 Строительство и плотники</option>
                  <option value="delivery">📦 Доставка / Продукты</option>
                  <option value="household">🏡 Домашнее хозяйство</option>
                  <option value="other">☀️ Другое</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-black uppercase tracking-wider mb-1">
                  Описание / Факты о товаре
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Пример: Дрова сухие, береза 100%, привезем на своем ЗИЛе, цена 5000 рублей машина, звоните Коле в Шангалы."
                  value={adDesc}
                  onChange={(e) => setAdDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-250 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loadingOptimizer}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {loadingOptimizer ? (
                  <>
                    <Sparkles className="animate-spin" size={16} /> Оптимизирую...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Оптимизировать с ИИ «Добрые новости»
                  </>
                )}
              </button>
            </form>

            {/* Output */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 min-h-[300px] flex flex-col justify-between space-y-4">
              {optimizedAd ? (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Объявление оптимизировано!
                    </span>
                    <button
                      onClick={() => {
                        const txt = `${optimizedAd.optimizedTitle}\n\n${optimizedAd.optimizedDescription}`;
                        navigator.clipboard.writeText(txt);
                        alert("Скопировано в буфер обмена!");
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-800 font-extrabold border border-slate-250 px-2.5 py-1 rounded bg-white"
                    >
                      Копировать
                    </button>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase">Рекомендуемый Заголовок:</span>
                    <h5 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{optimizedAd.optimizedTitle}</h5>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase">Улучшенный Текст:</span>
                    <p className="text-xs text-slate-700 leading-relaxed mt-0.5 whitespace-pre-line bg-white p-3 border border-slate-200 rounded-xl shadow-xs font-semibold">
                      {optimizedAd.optimizedDescription}
                    </p>
                  </div>

                  {optimizedAd.tips && optimizedAd.tips.length > 0 && (
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-[10px]">
                      <span className="font-extrabold text-blue-900 block mb-1">💡 Советы по продаже:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-blue-800 font-bold">
                        {optimizedAd.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigateToCreatePost(optimizedAd.optimizedTitle, optimizedAd.optimizedDescription)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all mt-4"
                  >
                    Перейти к созданию поста взаимопомощи <ArrowUpRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="my-auto text-center py-10 space-y-2">
                  <Megaphone className="mx-auto text-slate-300" size={48} />
                  <h5 className="text-xs sm:text-sm font-black text-slate-700">Оптимизированный результат</h5>
                  <p className="text-[11px] text-slate-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                    ИИ «Добрые новости» добавит подходящие эмодзи, разобьет текст по пунктам и выделит ключевые преимущества объявления.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================= WRITE NEWS DIALOG MODAL ======================= */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 border-2 border-slate-200 space-y-4 shadow-2xl relative">
            
            <button
              onClick={() => setShowWriteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-3xl">📝</span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">Опубликовать добрую весть</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Проверяется ИИ «Добрые новости»</p>
            </div>

            <form onSubmit={handlePublishNews} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-[10px] font-black uppercase tracking-wider mb-1">
                  Название вести / Заголовок
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Коротко о событии"
                  value={writeTitle}
                  onChange={(e) => setWriteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm font-semibold bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-[10px] font-black uppercase tracking-wider mb-1">
                    Категория новости
                  </label>
                  <select
                    value={writeCategory}
                    onChange={(e) => setWriteCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-slate-250 rounded-xl text-xs font-black bg-white"
                  >
                    <option value="story">📖 Добрая история</option>
                    <option value="tip">💡 Полезный совет</option>
                    <option value="news">☀️ Местная новость</option>
                    <option value="announcement">📢 Объявление</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <span className="text-[10px] text-slate-400 font-medium pb-2 leading-tight">
                    Автор: <strong className="text-slate-650">{currentUser.name}</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-[10px] font-black uppercase tracking-wider mb-1">
                  Текст новости
                </label>
                <textarea
                  required
                  rows={5}
                  maxLength={1000}
                  placeholder="Опишите ваше доброе дело, совет или новость... (Пример: 'Хочу поблагодарить тракториста Сергея, который вчера бескорыстно помог вытащить застрявшую машину...')"
                  value={writeContent}
                  onChange={(e) => setWriteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm font-medium leading-relaxed bg-white"
                />
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10px] text-slate-500 leading-normal flex items-start gap-1.5">
                <Shield className="text-indigo-600 shrink-0 mt-0.5" size={14} />
                <span>
                  ИИ-помощник «Добрые новости» проверит ваш пост на чистоту языка, отсутствие мата и спама перед отправкой в общую ленту.
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={moderating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {moderating ? (
                    <>
                      <Sparkles size={14} className="animate-spin" />
                      <span>Идет проверка ИИ...</span>
                    </>
                  ) : (
                    <span>Опубликовать весть</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
