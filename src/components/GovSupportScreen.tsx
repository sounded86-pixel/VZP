import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Shield, Users, CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, ChevronLeft, Plus, Search, Share2, FileText, 
  Phone, ArrowLeft, Trash2, Send, Star, Camera, Upload, 
  UserCheck, ThumbsUp, Check, FileDown, Calendar, MapPin, 
  X, AlertOctagon, HelpCircle, User, Bell, Mic, Sparkles, Flame
} from 'lucide-react';
import { 
  UserProfile, Village, Appeal, AppealTopic, AppealTimelineItem, 
  AppealVote, AppealComment, USTYANY_VILLAGES 
} from '../types';
import { 
  dbSubscribeAppeals, dbSubscribeAppealVotes, dbSubscribeAppealComments, 
  dbCreateAppeal, dbUpdateAppeal, dbDeleteAppeal, dbCastAppealVote, dbAddAppealComment 
} from '../firebaseSync';

// Topic metadata
interface TopicMeta {
  id: AppealTopic;
  name: string;
  emoji: string;
  description: string;
}

const TOPIC_METADATA: TopicMeta[] = [
  { id: 'housing', name: 'ЖКХ (отопление, вода)', emoji: '🏠', description: 'Отопление, водоснабжение, содержание жилья' },
  { id: 'healthcare', name: 'Здравоохранение', emoji: '🏥', description: 'ФАПы, амбулатории, запись, скорая помощь' },
  { id: 'transport', name: 'Транспорт', emoji: '🚌', description: 'Расписание автобусов, остановки, маршруты' },
  { id: 'education', name: 'Образование', emoji: '🏫', description: 'Ремонт школ, детских садов, кружки' },
  { id: 'ecology', name: 'Экология', emoji: '🌍', description: 'Мусорные свалки, чистота лесов, субботники' },
  { id: 'social', name: 'Социальная защита', emoji: '👨‍👩‍👧‍👦', description: 'Пенсии, льготы, помощь малоимущим' },
  { id: 'construction', name: 'Строительство и дороги', emoji: '🏗️', description: 'Ремонт дорог, тротуары, уличное освещение' },
  { id: 'communication', name: 'Связь и интернет', emoji: '📡', description: 'Сотовая связь, мобильный интернет в деревнях' },
  { id: 'other', name: 'Другое', emoji: '🙋‍♂️', description: 'Любые другие вопросы общего характера' }
];

// Stop-word check list for content filter
const BAD_WORDS = ['дурак', 'сволочь', 'вор', 'взятка', 'мразь', 'урод', 'тупой', 'дебил'];

// 2. DEADLINE RULES DEFINITIONS
const DEADLINE_RULES: Record<string, { days: number }> = {
  'housing': { days: 5 },      // ЖКХ — 5 дней
  'construction': { days: 7 }, // Дороги — 7 дней
  'healthcare': { days: 3 },   // Здравоохранение — 3 дня
  'ecology': { days: 10 },     // Экология — 10 дней
  'education': { days: 14 },   // Образование — 14 дней
  'transport': { days: 7 },    // Транспорт — 7 дней
  'communication': { days: 7 },// Связь — 7 дней
  'social': { days: 10 },      // Соцзащита — 10 дней
  'other': { days: 10 }
};

// 1 & 7. SMART ROUTER & PRIORITY LABELS ALGORITHM
const determinePriorityAndRoute = (title: string, desc: string, topic: AppealTopic, village: string) => {
  const text = (title + ' ' + desc).toLowerCase();
  
  // Determine Priority
  let priority: 'critical' | 'important' | 'planned' = 'planned';
  const criticalKeywords = ['дети', 'ребенок', 'больные', 'больница', 'пенсионер', 'старик', 'инвалид', 'зима', 'холод', 'отопление', 'замерзаем', 'нет воды', 'вода', 'авария', 'пожар', 'скорая', 'угроза'];
  const importantKeywords = ['дорога', 'автобус', 'транспорт', 'рейс', 'яма', 'связь', 'интернет', 'телефон', 'проезд', 'мост'];
  const plannedKeywords = ['освещение', 'фонарь', 'скамейка', 'лавочка', 'парк', 'детская площадка', 'свалка', 'мусор', 'субботник', 'урна', 'озеленение'];

  if (criticalKeywords.some(kw => text.includes(kw))) {
    priority = 'critical';
  } else if (importantKeywords.some(kw => text.includes(kw))) {
    priority = 'important';
  } else if (plannedKeywords.some(kw => text.includes(kw))) {
    priority = 'planned';
  } else {
    if (topic === 'housing' || topic === 'healthcare') priority = 'critical';
    else if (topic === 'transport' || topic === 'construction' || topic === 'communication') priority = 'important';
    else priority = 'planned';
  }

  // Determine Smart Route Target
  let org = 'Администрация Устьянского района';
  let person = 'Дежурный инспектор';
  let appNumber = Math.floor(10000 + Math.random() * 90000).toString();

  if (topic === 'housing') {
    org = `ЖКХ поселения ${village}`;
    person = 'И.П. Петров (Управляющий ЖКХ)';
  } else if (topic === 'healthcare') {
    org = `Устьянская ЦРБ (ФАП ${village})`;
    person = 'С.В. Смирнова (Главврач)';
  } else if (topic === 'transport') {
    org = 'Дорожно-транспортная служба района';
    person = 'А.А. Сидоров (Руководитель отдела)';
  } else if (topic === 'construction') {
    org = 'Муниципальная дорожная служба';
    person = 'Д.В. Козлов (Главный инженер)';
  } else if (topic === 'ecology') {
    org = 'Экологический надзор Устьянского района';
    person = 'Е.А. Кузнецова (Старший инспектор)';
  } else if (topic === 'education') {
    org = 'Отдел образования Устьянского района';
    person = 'М.Н. Васильева (Заведующая)';
  } else if (topic === 'communication') {
    org = 'Отдел цифрового развития и связи';
    person = 'В.Г. Федоров (Специалист связи)';
  } else {
    org = `Администрация поселения ${village}`;
    person = 'К.Л. Ivanov (Глава поселения)';
  }

  return { priority, org, person, appNumber };
};

// 10. QUICK COMPLAINT TEMPLATES
const READY_TEMPLATES = [
  {
    icon: '🏠',
    title: 'Нет воды',
    topic: 'housing' as AppealTopic,
    patternTitle: 'Нет воды в доме',
    patternDesc: 'В доме №12 на улице Советской нет воды уже 3 дня. Прорвало центральный водопровод на улице, вода течет в канаву. Из-за отсутствия воды у нас в доме маленькие дети и пожилые люди страдают без базовых удобств. Просим принять срочные меры по ремонту и организовать подвоз питьевой воды.',
    address: 'ул. Советская, д. 12'
  },
  {
    icon: '🚌',
    title: 'Отменили автобус',
    topic: 'transport' as AppealTopic,
    patternTitle: 'Отменили рейс автобуса',
    patternDesc: 'Рейс Октябрьский - Березник в 14:30 отменили без предварительного предупреждения. Люди вынуждены стоять на остановке часами. Пожилые люди не могут добраться из ЦРБ домой. Просим наладить стабильное транспортное сообщение и штрафовать перевозчиков за нарушения.',
    address: 'Центральная автостанция'
  },
  {
    icon: '🏥',
    title: 'Закрыли ФАП',
    topic: 'healthcare' as AppealTopic,
    patternTitle: 'Закрытие ФАПа в селе',
    patternDesc: 'В нашем селе временно закрылся Фельдшерско-акушерский пункт (ФАП) из-за отсутствия фельдшера. Пожилым людям негде получить первую помощь, измерить давление или поставить уколы. Ближайшая амбулатория находится за 30 км. Просим организовать выездную бригаду врачей.',
    address: 'ул. Больничная, д. 5'
  },
  {
    icon: '🛣️',
    title: 'Разбитая дорога',
    topic: 'construction' as AppealTopic,
    patternTitle: 'Разбитая дорога между селами',
    patternDesc: 'Дорога Октябрьский - Едьма находится в ужасном, аварийном состоянии. Огромные ямы, колеи, машины застревают, рейсовые автобусы отказываются ехать, подвеска разбивается. Скорая помощь едет в два раза дольше. Требуется срочный ямочный ремонт и грейдирование.',
    address: 'Автодорога Октябрьский - Едьма'
  },
  {
    icon: '🌍',
    title: 'Свалка мусора',
    topic: 'ecology' as AppealTopic,
    patternTitle: 'Несанкционированная свалка возле леса',
    patternDesc: 'Возле опушки леса образовалась крупная несанкционированная свалка бытовых и строительных отходов. Стоит неприятный запах, собаки растаскивают мусор, загрязняется экология. Просим убрать свалку и установить новые мусорные контейнеры.',
    address: 'ул. Лесная, район д. 45'
  }
];

interface GovSupportScreenProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onBack: () => void;
}

export default function GovSupportScreen({ currentUser, allUsers, onBack }: GovSupportScreenProps) {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'view_appeal' | 'rules' | 'admin' | 'deputy' | 'stats'>('dashboard');
  const [selectedAppealId, setSelectedAppealId] = useState<string | null>(null);
  
  // Create Appeal Wizard state
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [newTopic, setNewTopic] = useState<AppealTopic>('housing');
  const [newVillage, setNewVillage] = useState<string>(currentUser.village || 'Березник');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [simulatedVotes, setSimulatedVotes] = useState<AppealVote[]>([]);
  const [creationErrors, setCreationErrors] = useState<string | null>(null);

  // Filter states
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Call simulator modal state
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [callState, setCallState] = useState<'dialing' | 'connected' | 'completed'>('dialing');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [callLog, setCallLog] = useState<string>('');

  // Active Appeal details state
  const [appealVotes, setAppealVotes] = useState<AppealVote[]>([]);
  const [appealComments, setAppealComments] = useState<AppealComment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [voteCommentText, setVoteCommentText] = useState<string>('');
  const [showVoteDialog, setShowVoteDialog] = useState<boolean>(false);

  // Admin action states
  const [adminReasonText, setAdminReasonText] = useState<string>('');
  const [assignedOrg, setAssignedOrg] = useState<string>('Администрация Березницкого поселения');
  const [assignedPerson, setAssignedPerson] = useState<string>('И.П. Петров (глава)');

  // Public report resolving states
  const [resolvePerformer, setResolvePerformer] = useState<string>('И.П. Петров, ЖКХ Березника');
  const [resolveBudget, setResolveBudget] = useState<number>(12500);
  const [resolvePhotoAfter, setResolvePhotoAfter] = useState<string>('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=60');

  // Voice recording simulation states
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>([]);

  // Push Notifications state
  const [notifications, setNotifications] = useState<{ id: string; text: string; createdAt: string; read: boolean }[]>([
    { id: 'not_init_1', text: 'Добро пожаловать! Интеллектуальные модули «Господдержки 2.0» (Умный маршрутизатор, Контроль сроков, Голосовое обращение) активны.', createdAt: new Date().toISOString(), read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Public control verification state
  const [verificationComment, setVerificationComment] = useState<string>('');
  const [verificationChoice, setVerificationChoice] = useState<'full' | 'partial' | 'none'>('full');
  const [verificationRating, setVerificationRating] = useState<number>(5);

  // Helper helper to push to notifications
  const addSystemNotification = (text: string) => {
    setNotifications(prev => [
      { id: `not_${Date.now()}`, text, createdAt: new Date().toISOString(), read: false },
      ...prev
    ]);
  };

  // Local subscriptions
  useEffect(() => {
    return dbSubscribeAppeals((list) => {
      setAppeals(list);
    });
  }, []);

  const selectedAppeal = useMemo(() => {
    return appeals.find(a => a.id === selectedAppealId) || null;
  }, [appeals, selectedAppealId]);

  useEffect(() => {
    if (selectedAppealId) {
      const unsubVotes = dbSubscribeAppealVotes(selectedAppealId, (votes) => {
        setAppealVotes(votes);
      });
      const unsubComments = dbSubscribeAppealComments(selectedAppealId, (comments) => {
        setAppealComments(comments);
      });
      return () => {
        unsubVotes();
        unsubComments();
      };
    }
  }, [selectedAppealId]);

  // Handle call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCallModal && callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [showCallModal, callState]);

  // Handle voice recording simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVoiceRecording) {
      setVoiceDuration(0);
      setVoiceWaveform(Array.from({ length: 15 }, () => Math.random() * 60 + 10));
      timer = setInterval(() => {
        setVoiceDuration(prev => {
          if (prev >= 29) {
            setIsVoiceRecording(false);
            return 30;
          }
          return prev + 1;
        });
        // Generate new visual wave data
        setVoiceWaveform(Array.from({ length: 15 }, () => Math.random() * 60 + 10));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVoiceRecording]);

  // Periodic Auto Escalation & Timer Overdue checking
  useEffect(() => {
    if (appeals.length === 0) return;
    
    // Check every appeal
    const runAllEscalations = async () => {
      for (const appeal of appeals) {
        if (appeal.status === 'resolved' || appeal.status === 'rejected' || !appeal.deadlineDate) continue;
        const deadline = new Date(appeal.deadlineDate);
        const now = new Date();
        const timeLeft = deadline.getTime() - now.getTime();
        
        if (timeLeft < 0) {
          const overdueDays = Math.max(1, Math.floor(Math.abs(timeLeft) / (1000 * 60 * 60 * 24)));
          let targetEscalation = 0;
          
          if (overdueDays > 7) {
            targetEscalation = 2; // Regional
          } else if (overdueDays > 3) {
            targetEscalation = 1; // District Head
          } else {
            targetEscalation = 0; // Local warning
          }

          if (appeal.escalationLevel === undefined || appeal.escalationLevel < targetEscalation) {
            const timelineUpdate = [...appeal.timeline];
            let actionName = '';
            let descText = '';
            
            if (targetEscalation === 1 && (appeal.escalationLevel === undefined || appeal.escalationLevel < 1)) {
              actionName = '⚠️ Авто-эскалация: Уведомлен Глава района';
              descText = `Срок решения превышен на ${overdueDays} дня(ней). Система автоматически направила уведомление Главе района для личного контроля и ускорения исполнителей.`;
            } else if (targetEscalation === 2 && (appeal.escalationLevel === undefined || appeal.escalationLevel < 2)) {
              actionName = '🚨 Критическая эскалация в область';
              descText = `Срок решения превышен более чем на 7 дней (${overdueDays} дн.). Обращение автоматически передано на уровень Правительства Архангельской области.`;
            }

            if (actionName) {
              timelineUpdate.push({
                date: new Date().toISOString(),
                action: actionName,
                description: descText,
                author: 'Система контроля сроков ⏱️'
              });
              
              await dbUpdateAppeal(appeal.id, {
                escalationLevel: targetEscalation,
                timeline: timelineUpdate,
                updatedAt: new Date().toISOString()
              });
              
              addSystemNotification(`По обращению #${appeal.id.substring(7,11)} произведена эскалация: ${actionName}`);
            }
          }
        }
      }
    };

    // Run once shortly after appeals load
    const t = setTimeout(() => {
      runAllEscalations();
    }, 1500);
    return () => clearTimeout(t);
  }, [appeals.length]);

  // Helper formats
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Automated/Sentiment content checker
  const handleContentCheck = (text: string): { isClean: boolean; error: string | null } => {
    const textLower = text.toLowerCase();
    for (const bad of BAD_WORDS) {
      if (textLower.includes(bad)) {
        return { 
          isClean: false, 
          error: `⚠️ Ваше описание содержит недопустимые слова (${bad}). Пожалуйста, будьте вежливы и пишите по существу!` 
        };
      }
    }
    if (text.length < 15) {
      return { 
        isClean: false, 
        error: '⚠️ Описание слишком короткое. Изложите суть проблемы подробнее (не менее 15 символов).' 
      };
    }
    // Check if it's too emotional without facts
    const emotionWords = ['ужас', 'кошмар', 'задолбали', 'сволочи', 'караул'];
    const countEmotions = emotionWords.filter(word => textLower.includes(word)).length;
    if (countEmotions >= 3) {
      return {
        isClean: true,
        error: '💡 Рекомендация: обращение звучит эмоционально. Администрация реагирует быстрее на конкретные факты, цифры и даты.'
      };
    }
    return { isClean: true, error: null };
  };

  // Simplified mode toggle checks
  const isSimplified = !!currentUser.isSimplifiedMode;

  // Simulate neighborhood support
  const handleSimulateSupport = () => {
    if (!currentUser) return;
    const mockVoters = [
      { name: 'Анна Петрова', village: newVillage },
      { name: 'Пётр Сидоров', village: newVillage },
      { name: 'Мария Иванова', village: newVillage },
      { name: 'Степан Кузнецов', village: newVillage }
    ];
    
    const newSimVotes: AppealVote[] = mockVoters.map((v, i) => ({
      id: `sim_vote_${Date.now()}_${i}`,
      appealId: 'temp_wizard',
      userId: `mock_user_${i}`,
      userName: v.name,
      userVillage: v.village,
      vote: 'yes',
      comment: 'Поддерживаю, проблема острая!',
      createdAt: new Date().toISOString()
    }));
    setSimulatedVotes(prev => [...prev, ...newSimVotes]);
  };

  // Submit new Appeal
  const handleCreateAppeal = async () => {
    const check = handleContentCheck(newDesc);
    if (!check.isClean && check.error) {
      setCreationErrors(check.error);
      return;
    }
    if (!newTitle.trim()) {
      setCreationErrors('⚠️ Пожалуйста, укажите краткое название проблемы.');
      return;
    }
    if (simulatedVotes.length < 3) {
      setCreationErrors('⚠️ Необходимо собрать минимум 3 голоса поддержки соседей прежде чем отправить в администрацию.');
      return;
    }

    const appealId = `appeal_${Date.now()}`;
    
    // 1 & 7. RUN SMART ROUTER & PRIORITY DETECTION
    const routeInfo = determinePriorityAndRoute(newTitle, newDesc, newTopic, newVillage);
    
    // 2. COMPUTE DEADLINE DATE
    const deadlineDays = DEADLINE_RULES[newTopic]?.days || 10;
    const deadlineDate = new Date(Date.now() + deadlineDays * 24 * 3600 * 1000).toISOString();

    const newAppeal: Appeal = {
      id: appealId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorVillage: newVillage,
      topic: newTopic,
      title: newTitle,
      description: newDesc,
      address: newAddress || 'Не указан точный адрес',
      photos: newPhotos,
      votes: simulatedVotes.length,
      thresholdMet: true,
      status: 'moderation', // Sent directly to moderation once threshold is met
      moderatorId: null,
      assignedTo: { org: routeInfo.org, person: routeInfo.person },
      priority: routeInfo.priority,
      deadlineDate: deadlineDate,
      appNumber: routeInfo.appNumber,
      escalationLevel: 0,
      timeline: [
        {
          date: new Date().toISOString(),
          action: 'Обращение создано',
          description: `Собрано ${simulatedVotes.length} голосов жителей села ${newVillage}. Передано на модерацию.`,
          author: currentUser.name
        },
        {
          date: new Date().toISOString(),
          action: '🤖 Авто-маршрутизация',
          description: `ИИ определил ведомство: "${routeInfo.org}" (ответственный: ${routeInfo.person}). Назначен приоритет: ${
            routeInfo.priority === 'critical' ? '🔴 КРИТИЧЕСКИЙ' : 
            routeInfo.priority === 'important' ? '🟡 ВАЖНЫЙ' : '🟢 ПЛАНОВЫЙ'
          }. Срок решения до: ${new Date(deadlineDate).toLocaleDateString()}`,
          author: 'Умный Маршрутизатор'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save appeal and simulated votes
    await dbCreateAppeal(newAppeal);
    for (const v of simulatedVotes) {
      await dbCastAppealVote({ ...v, appealId });
    }

    // Trigger local push notification
    addSystemNotification(`Ваше обращение #${routeInfo.appNumber} («${newTitle}») успешно создано и автоматически направлено в «${routeInfo.org}». Срок решения: ${deadlineDays} дней.`);

    // Reset wizard
    setNewTitle('');
    setNewDesc('');
    setNewAddress('');
    setNewPhotos([]);
    setSimulatedVotes([]);
    setWizardStep(1);
    setCreationErrors(null);
    setSelectedAppealId(appealId);
    setActiveTab('view_appeal');
  };

  // Real resident casting vote
  const handleRealCastVote = async () => {
    if (!selectedAppeal) return;
    
    // Check if user already voted
    const alreadyVoted = appealVotes.some(v => v.userId === currentUser.id);
    if (alreadyVoted) {
      alert('Вы уже поддержали данное обращение!');
      return;
    }

    const voteId = `vote_${Date.now()}`;
    const newVote: AppealVote = {
      id: voteId,
      appealId: selectedAppeal.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userVillage: currentUser.village || 'Устьяны',
      vote: 'yes',
      comment: voteCommentText || 'Полностью поддерживаю обращение!',
      createdAt: new Date().toISOString()
    };

    await dbCastAppealVote(newVote);
    
    // Update appeal votes tally
    const updatedVotesCount = selectedAppeal.votes + 1;
    const isNowThresholdMet = updatedVotesCount >= 3;
    let nextStatus = selectedAppeal.status;
    
    // Transition from voting/draft to moderation once 3 votes achieved
    if (selectedAppeal.status === 'voting' && isNowThresholdMet) {
      nextStatus = 'moderation';
    }

    const timelineUpdate = [...selectedAppeal.timeline];
    if (isNowThresholdMet && !selectedAppeal.thresholdMet) {
      timelineUpdate.push({
        date: new Date().toISOString(),
        action: 'Порог голосов достигнут',
        description: 'Собрано более 3 голосов соседей. Обращение передано на модерацию администрации.',
        author: 'Система'
      });
    }

    await dbUpdateAppeal(selectedAppeal.id, {
      votes: updatedVotesCount,
      thresholdMet: isNowThresholdMet,
      status: nextStatus,
      timeline: timelineUpdate,
      updatedAt: new Date().toISOString()
    });

    setVoteCommentText('');
    setShowVoteDialog(false);
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!selectedAppeal || !newCommentText.trim()) return;

    const commentId = `comment_${Date.now()}`;
    const isModerator = currentUser.role === 'main_admin' || currentUser.role === 'admin';
    const isOfficial = currentUser.role === 'village_admin' || currentUser.role === 'main_admin';

    const newComment: AppealComment = {
      id: commentId,
      appealId: selectedAppeal.id,
      userId: currentUser.id,
      userName: currentUser.name,
      text: newCommentText.trim(),
      isModerator,
      isOfficial,
      createdAt: new Date().toISOString()
    };

    await dbAddAppealComment(newComment);
    setNewCommentText('');
  };

  // Moderator Action (Approve / Reject / In Progress / Resolve)
  const handleModeratorAction = async (action: 'approve' | 'reject' | 'in_progress' | 'resolve' | 'assign') => {
    if (!selectedAppeal) return;

    let updatedStatus: Appeal['status'] = selectedAppeal.status;
    let actionLabel = '';
    let actionDesc = '';

    if (action === 'approve') {
      updatedStatus = 'accepted';
      actionLabel = 'Принято администрацией';
      actionDesc = `Обращение успешно прошло модерацию и принято на рассмотрение. ${adminReasonText ? `Причина: ${adminReasonText}` : ''}`;
    } else if (action === 'reject') {
      updatedStatus = 'rejected';
      actionLabel = 'Отклонено модератором';
      actionDesc = `Обращение отклонено. Комментарий: ${adminReasonText || 'Не соответствует правилам подачи обращений.'}`;
    } else if (action === 'in_progress') {
      updatedStatus = 'in_progress';
      actionLabel = 'Запущено в работу';
      actionDesc = `Проблема передана исполнителю: ${assignedOrg}. Ответственный: ${assignedPerson}. ${adminReasonText ? `Комментарий: ${adminReasonText}` : ''}`;
    } else if (action === 'resolve') {
      updatedStatus = 'resolved';
      actionLabel = 'Решено';
      actionDesc = `Проблема успешно решена! Исполнитель подтвердил выполнение работ. ${adminReasonText ? `Комментарий: ${adminReasonText}` : ''}`;
    }

    const timelineItem: AppealTimelineItem = {
      date: new Date().toISOString(),
      action: actionLabel,
      description: actionDesc,
      author: currentUser.name
    };

    const updates: Partial<Appeal> = {
      status: updatedStatus,
      timeline: [...selectedAppeal.timeline, timelineItem],
      updatedAt: new Date().toISOString()
    };

    if (action === 'in_progress') {
      updates.assignedTo = { org: assignedOrg, person: assignedPerson };
    }

    if (action === 'resolve') {
      updates.resolution = {
        date: new Date().toISOString(),
        description: adminReasonText || 'Работы по устранению проблемы завершены.',
        evidence: [resolvePhotoAfter]
      };
      
      // 3. CREATE AUTOMATED PUBLIC REPORT WITH BEFORE/AFTER PICTURES
      updates.publicReport = {
        date: new Date().toISOString(),
        description: adminReasonText || 'Проблема успешно ликвидирована в установленные сроки.',
        performer: resolvePerformer || 'ЖКХ Устьянского Района',
        budget: Number(resolveBudget) || 15000,
        photoBefore: selectedAppeal.photos?.[0] || 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=600&auto=format&fit=crop&q=60',
        photoAfter: resolvePhotoAfter || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=60',
        ratings: []
      };

      // Push notify
      addSystemNotification(`По обращению #${selectedAppeal.appNumber || selectedAppeal.id.substring(7,11)} опубликован публичный отчет о решении!`);
    }

    await dbUpdateAppeal(selectedAppeal.id, updates);
    setAdminReasonText('');
  };

  // Deputy Alert Check & Remind action
  const isAppealDelayed = (appeal: Appeal) => {
    if (appeal.status !== 'in_progress' && appeal.status !== 'accepted') return false;
    const createdAt = new Date(appeal.createdAt).getTime();
    const tenDaysAgo = Date.now() - 10 * 24 * 3600 * 1000;
    return createdAt < tenDaysAgo;
  };

  const handleDeputyRemind = async (appeal: Appeal) => {
    const remindTimelineItem: AppealTimelineItem = {
      date: new Date().toISOString(),
      action: 'Депутатский запрос',
      description: `Депутат ${currentUser.name} направил официальное напоминание исполнителю об ускорении решения проблемы.`,
      author: currentUser.name
    };
    await dbUpdateAppeal(appeal.id, {
      timeline: [...appeal.timeline, remindTimelineItem],
      updatedAt: new Date().toISOString()
    });
    alert(`Официальный депутатский запрос по обращению #${appeal.id.substring(7, 11)} успешно отправлен исполнителю!`);
  };

  const handlePublishVerification = async () => {
    if (!selectedAppeal) return;

    const stars = '★'.repeat(verificationRating) + '☆'.repeat(5 - verificationRating);
    const choiceLabel = 
      verificationChoice === 'full' ? '✅ Решено полностью' :
      verificationChoice === 'partial' ? '⚠️ Решено частично' : '❌ Не решена / Отписка';

    const text = `👥 НАРОДНЫЙ КОНТРОЛЬ\nОценка: ${stars} (${verificationRating} из 5)\nВердикт: ${choiceLabel}\nКомментарий: ${verificationComment.trim() || 'Без комментариев'}`;

    // 1. Add comment to discussion
    const commentId = `comment_${Date.now()}`;
    const publicControlComment: AppealComment = {
      id: commentId,
      appealId: selectedAppeal.id,
      userId: currentUser.id,
      userName: `👥 Контроль: ${currentUser.name}`,
      text: text,
      isModerator: false,
      isOfficial: true, // stands out
      createdAt: new Date().toISOString()
    };
    await dbAddAppealComment(publicControlComment);

    // 2. Add verification timeline event
    const verificationTimelineItem: AppealTimelineItem = {
      date: new Date().toISOString(),
      action: `👥 Оценка жителя: ${choiceLabel}`,
      description: `Качество выполнения оценено на ${verificationRating}/5. Отзыв: ${verificationComment.trim() || 'Без комментариев'}.`,
      author: currentUser.name
    };

    await dbUpdateAppeal(selectedAppeal.id, {
      timeline: [...selectedAppeal.timeline, verificationTimelineItem],
      updatedAt: new Date().toISOString()
    });

    // 3. Notify administrator
    addSystemNotification(`Получена народная оценка по обращению #${selectedAppeal.id.substring(7, 11)}: ${verificationRating}★`);

    // Reset fields
    setVerificationComment('');
    setVerificationRating(5);
    alert('Ваша народная оценка успешно опубликована и внесена в официальное дело!');
  };

  // Simulated photos base64 generator
  const handlePhotoUpload = () => {
    const mockPhotos = [
      'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1518730518541-d0843268c287?w=600&auto=format&fit=crop&q=60'
    ];
    const rand = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    if (newPhotos.length < 3) {
      setNewPhotos([...newPhotos, rand]);
    }
  };

  // Filtered list computed
  const filteredAppeals = useMemo(() => {
    return appeals.filter(a => {
      const matchesTopic = topicFilter === 'all' || a.topic === topicFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.authorVillage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTopic && matchesStatus && matchesSearch;
    });
  }, [appeals, topicFilter, statusFilter, searchQuery]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = appeals.length;
    const resolved = appeals.filter(a => a.status === 'resolved').length;
    const inProgress = appeals.filter(a => a.status === 'in_progress' || a.status === 'accepted').length;
    const rejected = appeals.filter(a => a.status === 'rejected').length;
    
    // Group by topic
    const byTopic: Record<AppealTopic, number> = {
      housing: 0, healthcare: 0, transport: 0, education: 0, 
      ecology: 0, social: 0, construction: 0, communication: 0, other: 0
    };
    appeals.forEach(a => {
      if (byTopic[a.topic] !== undefined) byTopic[a.topic]++;
    });

    // Group by village
    const byVillage: Record<string, { total: number; resolved: number }> = {};
    appeals.forEach(a => {
      if (!byVillage[a.authorVillage]) {
        byVillage[a.authorVillage] = { total: 0, resolved: 0 };
      }
      byVillage[a.authorVillage].total++;
      if (a.status === 'resolved') byVillage[a.authorVillage].resolved++;
    });

    return { total, resolved, inProgress, rejected, byTopic, byVillage };
  }, [appeals]);

  // Interactive telephone call directory for Ustyany district
  const phoneDirectory = [
    { title: 'Приёмная Администрации района (Октябрьский)', phone: '+7 818 555-12-34', hours: 'Пн-Пт 9:00 - 17:00' },
    { title: 'ЖКХ Отдел Устьянского Района', phone: '+7 818 555-43-21', hours: 'Пн-Пт 8:00 - 16:00' },
    { title: 'Администрация Березницкого поселения', phone: '+7 818 555-67-89', hours: 'Вт-Чт 9:00 - 13:00' },
    { title: 'Единая Диспетчерская Служба (ЕДДС)', phone: '+7 818 555-11-22', hours: 'Круглосуточно' },
  ];

  const triggerCallSimulation = (phone: string, title: string) => {
    setShowCallModal(true);
    setCallState('dialing');
    setCallLog(`Набор номера ${phone} (${title})...`);
    
    setTimeout(() => {
      setCallState('connected');
      setCallLog(`Соединение установлено. На линии: Оператор администрации Устьян.`);
    }, 2500);
  };

  const handleSelectTemplate = (tpl: typeof READY_TEMPLATES[number]) => {
    setNewTopic(tpl.topic);
    setNewTitle(tpl.patternTitle);
    setNewDesc(tpl.patternDesc);
    setNewAddress(tpl.address);
    
    // Add a beautiful thematic picture automatically
    let photoUrl = 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=600&auto=format&fit=crop&q=60'; // generic
    if (tpl.topic === 'housing') {
      photoUrl = 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=60'; // pipe water leaks
    } else if (tpl.topic === 'transport') {
      photoUrl = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60'; // bus
    } else if (tpl.topic === 'healthcare') {
      photoUrl = 'https://images.unsplash.com/photo-1584515906207-fd4037d8051a?w=600&auto=format&fit=crop&q=60'; // clinic FAp
    } else if (tpl.topic === 'construction') {
      photoUrl = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=60'; // road repair hole
    } else if (tpl.topic === 'ecology') {
      photoUrl = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60'; // trash garbage dump
    }
    setNewPhotos([photoUrl]);
    addSystemNotification(`Применен быстрый шаблон: «${tpl.title}». Форма успешно предзаполнена.`);
  };

  const handleStopVoiceRecording = () => {
    setIsVoiceRecording(false);
    
    // Select transcription based on current topic
    let speechText = 'В нашем доме №12 по улице Советской отключили отопление и горячую воду, батареи совсем ледяные, замерзаем. Помогите!';
    if (newTopic === 'healthcare') {
      speechText = 'В сельском ФАПе уже неделю нет дежурного врача, пожилым людям некому выписать рецепты на жизненно важные лекарства. Разберитесь пожалуйста!';
    } else if (newTopic === 'transport') {
      speechText = 'Рейсовый автобус до Октябрьского сегодня опять отменили в обед, стоим на ветру с сумками, расписание постоянно нарушают. Примите меры!';
    } else if (newTopic === 'ecology') {
      speechText = 'В лесополосе за нашей улицей кто-то свалил огромную гору пластиковых бутылок и старых покрышек, стоит угроза экологии. Нужно срочно убрать свалку!';
    } else if (newTopic === 'construction') {
      speechText = 'На въезде в деревню образовалась огромная аварийная яма прямо посередине асфальта, машины вынуждены выезжать на встречную полосу. Требуется срочный ремонт!';
    } else if (newTopic === 'communication') {
      speechText = 'Мобильный интернет и сотовая связь пропадают постоянно, дети не могут учиться дистанционно, даже скорую вызвать проблематично. Поставьте вышку!';
    } else if (newTopic === 'social') {
      speechText = 'Одиноким ветеранам и пенсионерам у нас в селе некому помочь привезти дрова на зиму. Просим выделить социального работника для поддержки!';
    }

    setNewTitle('Голосовое обращение (Распознано ИИ)');
    setNewDesc(speechText);
    addSystemNotification('🗣️ Голосовой ввод успешно распознан и вставлен в описание проблемы.');
  };

  // Real-time routing preview in wizard:
  const routerPreview = useMemo(() => {
    if (!newDesc.trim()) return null;
    return determinePriorityAndRoute(newTitle, newDesc, newTopic, newVillage);
  }, [newTitle, newDesc, newTopic, newVillage]);

  // Simplified views check (Elderly Mode)
  const [elderlyTab, setElderlyTab] = useState<'menu' | 'write' | 'list' | 'contacts'>('menu');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" id="gov_liaison_root">
      
      {/* HEADER SECTION */}
      <header className="bg-blue-700 text-white shadow-md py-4 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
              title="Назад на главную"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-200">Модуль Госуслуг Устьяны</span>
              <h1 className="text-lg sm:text-xl font-bold flex items-center gap-1.5 leading-tight">
                <Building2 size={20} className="text-amber-400" />
                Господдержка и связь с властью
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 9. PUSH NOTIFICATION BELL CENTER */}
            <div className="relative mr-2">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    // Mark all current read when opening to clear counts
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }
                }}
                className="relative p-2.5 hover:bg-blue-600 rounded-xl transition-colors cursor-pointer text-white flex items-center justify-center"
                title="Оповещения"
              >
                <Bell size={20} className={notifications.some(n => !n.read) ? 'animate-wiggle text-yellow-300' : 'text-blue-100'} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-blue-700 animate-pulse" />
                )}
              </button>

              {/* Dropdown element */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-4 text-slate-800 z-50 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                        <span>🔔</span> Пуш-Уведомления
                      </h4>
                      <button
                        onClick={() => {
                          setNotifications([]);
                          addSystemNotification('Оповещения успешно очищены.');
                        }}
                        className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer"
                      >
                        Очистить всё
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-6">Входящих уведомлений нет.</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${
                              n.read ? 'bg-slate-50/50 border-slate-100 text-slate-500 font-medium' : 'bg-amber-50/60 border-amber-200 text-slate-800 font-bold'
                            }`}
                          >
                            <p className="whitespace-pre-line">{n.text}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 text-right">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {currentUser.role === 'main_admin' || currentUser.role === 'admin' ? (
              <span className="bg-red-500 text-white font-extrabold text-xs uppercase px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                🛡️ Модератор
              </span>
            ) : currentUser.role === 'village_admin' ? (
              <span className="bg-blue-500 text-white font-extrabold text-xs uppercase px-2.5 py-1 rounded-full shadow-sm">
                👔 Депутат / Глава
              </span>
            ) : (
              <span className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                👤 Житель ({currentUser.village})
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

        {/* -------------------- ELDERLY SIMPLIFIED INTERFACE -------------------- */}
        {isSimplified ? (
          <div className="space-y-6" id="simplified_liaison_mode">
            
            {/* Header info */}
            <div className="bg-amber-50 rounded-3xl border-4 border-amber-300 p-5 shadow-sm text-center">
              <span className="text-4xl">🏛️</span>
              <h2 className="text-2xl font-black text-slate-950 mt-2">СВЯЗЬ С АДМИНИСТРАЦИЕЙ</h2>
              <p className="text-slate-800 text-sm sm:text-base font-bold mt-1.5 leading-snug">
                Подать жалобу по ЖКХ, дорогам или теплу. Требуется поддержка 3-х ваших соседей!
              </p>
            </div>

            {/* Elderly Tab navigation */}
            {elderlyTab !== 'menu' && (
              <button 
                onClick={() => setElderlyTab('menu')}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-2xl py-4 px-6 text-xl font-black flex items-center justify-center gap-3 cursor-pointer"
              >
                <ArrowLeft size={28} /> ВЕРНУТЬСЯ В МЕНЮ
              </button>
            )}

            {elderlyTab === 'menu' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. WRITE */}
                <button
                  onClick={() => setElderlyTab('write')}
                  className="bg-blue-700 hover:bg-blue-800 text-white rounded-3xl p-6 shadow-md border-4 border-blue-400 flex flex-col items-center justify-center text-center gap-3 cursor-pointer py-10"
                >
                  <span className="text-5xl">📝</span>
                  <h3 className="text-2xl font-black">НАПИСАТЬ</h3>
                  <p className="text-xs text-blue-100 font-bold max-w-xs">
                    Создать обращение, набрать 3 голоса соседей и отправить властям
                  </p>
                </button>

                {/* 2. MY APPEALS */}
                <button
                  onClick={() => {
                    setElderlyTab('list');
                    setTopicFilter('all');
                    setStatusFilter('all');
                    setSearchQuery(currentUser.name); // Shows user's own
                  }}
                  className="bg-emerald-700 hover:bg-emerald-850 text-white rounded-3xl p-6 shadow-md border-4 border-emerald-400 flex flex-col items-center justify-center text-center gap-3 cursor-pointer py-10"
                >
                  <span className="text-5xl">📋</span>
                  <h3 className="text-2xl font-black">МОИ ОБРАЩЕНИЯ</h3>
                  <p className="text-xs text-emerald-100 font-bold max-w-xs">
                    Посмотреть ход решения ваших поданных обращений
                  </p>
                </button>

                {/* 3. DISTRICT APPEALS */}
                <button
                  onClick={() => {
                    setElderlyTab('list');
                    setTopicFilter('all');
                    setStatusFilter('all');
                    setSearchQuery(''); // Shows all
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-3xl p-6 shadow-md border-4 border-amber-300 flex flex-col items-center justify-center text-center gap-3 cursor-pointer py-10"
                >
                  <span className="text-5xl">📊</span>
                  <h3 className="text-2xl font-black">ВСЕ ОБРАЩЕНИЯ</h3>
                  <p className="text-xs text-amber-50 font-bold max-w-xs">
                    Посмотреть все открытые проблемы Устьянского района
                  </p>
                </button>

                {/* 4. DIRECT CALL */}
                <button
                  onClick={() => setElderlyTab('contacts')}
                  className="bg-rose-700 hover:bg-rose-800 text-white rounded-3xl p-6 shadow-md border-4 border-rose-400 flex flex-col items-center justify-center text-center gap-3 cursor-pointer py-10"
                >
                  <span className="text-5xl">📞</span>
                  <h3 className="text-2xl font-black">ПОЗВОНИТЬ</h3>
                  <p className="text-xs text-rose-100 font-bold max-w-xs">
                    Позвонить дежурному диспетчеру или в сельсовет по телефону
                  </p>
                </button>

              </div>
            )}

            {/* Elderly creation flow */}
            {elderlyTab === 'write' && (
              <div className="bg-white rounded-3xl p-6 border-3 border-blue-400 shadow-md space-y-5">
                <h3 className="text-2xl font-black text-slate-900 border-b pb-3 flex items-center gap-2">
                  <span>📝</span> Новое обращение к администрации
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-black text-slate-800 mb-1">1. Выберите тему:</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      {TOPIC_METADATA.slice(0, 5).map(t => (
                        <button
                          key={t.id}
                          onClick={() => setNewTopic(t.id)}
                          className={`p-4 rounded-2xl text-left border-3 flex items-center gap-2.5 font-bold text-sm ${newTopic === t.id ? 'border-blue-500 bg-blue-50 text-blue-950' : 'border-slate-200 bg-slate-50'}`}
                        >
                          <span className="text-2xl">{t.emoji}</span>
                          <span>{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-black text-slate-800 mb-1">2. Ваше село и адрес:</label>
                    <input 
                      type="text" 
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Например: ул. Советская, д. 15, кв. 2"
                      className="w-full text-lg p-4 rounded-2xl border-3 border-slate-200 focus:border-blue-500 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-black text-slate-800 mb-1">3. Название проблемы (кратко):</label>
                    <input 
                      type="text" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Например: Нет воды три дня"
                      className="w-full text-lg p-4 rounded-2xl border-3 border-slate-200 focus:border-blue-500 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-black text-slate-800 mb-1">4. Подробно опишите проблему:</label>
                    <textarea 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={4}
                      placeholder="Опишите факты: что случилось, когда, куда обращались..."
                      className="w-full text-lg p-4 rounded-2xl border-3 border-slate-200 focus:border-blue-500 focus:outline-hidden font-bold"
                    />
                  </div>

                  {/* Neighbor Votes simulation for testing */}
                  <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-blue-950">Голоса поддержки соседей:</span>
                      <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-full text-sm">
                        {simulatedVotes.length} из 3
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (simulatedVotes.length / 3) * 100)}%` }}
                      />
                    </div>

                    {simulatedVotes.length < 3 ? (
                      <button
                        onClick={handleSimulateSupport}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-base font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                      >
                        👥 ИМИТИРОВАТЬ ГОЛОСА СОСЕДЕЙ (демо-клики)
                      </button>
                    ) : (
                      <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl p-2 text-center text-sm font-bold">
                        ✅ Набрано достаточно голосов соседей! Можно подавать в администрацию.
                      </div>
                    )}
                  </div>

                  {creationErrors && (
                    <div className="bg-red-50 text-red-900 p-4 rounded-2xl border-2 border-red-300 font-bold text-sm">
                      {creationErrors}
                    </div>
                  )}

                  <button
                    onClick={handleCreateAppeal}
                    disabled={simulatedVotes.length < 3}
                    className={`w-full text-xl font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md ${simulatedVotes.length >= 3 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    🚀 ОТПРАВИТЬ ОБРАЩЕНИЕ В АДМИНИСТРАЦИЮ
                  </button>
                </div>
              </div>
            )}

            {/* Elderly List of Appeals */}
            {elderlyTab === 'list' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900">
                  {searchQuery ? '📋 Мои обращения' : '📊 Все обращения района'}
                </h3>
                {filteredAppeals.length === 0 ? (
                  <p className="bg-white p-6 rounded-2xl border text-center font-bold text-slate-500 text-lg">
                    Обращений пока не найдено.
                  </p>
                ) : (
                  filteredAppeals.map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => {
                        setSelectedAppealId(a.id);
                        setSelectedAppealId(a.id);
                        setActiveTab('view_appeal');
                        setElderlyTab('menu'); // resets so user is on full screen details
                      }}
                      className="bg-white rounded-2xl border-3 border-slate-200 p-5 shadow-xs hover:border-blue-400 cursor-pointer space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-3xl shrink-0">
                          {TOPIC_METADATA.find(t => t.id === a.topic)?.emoji || '🏛️'}
                        </span>
                        <div className="flex-1">
                          <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-extrabold text-slate-600 uppercase">
                            #{a.id.substring(7, 11)} • {a.authorVillage}
                          </span>
                          <h4 className="text-lg font-black text-slate-950 leading-tight mt-1">{a.title}</h4>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-black uppercase shrink-0 ${
                          a.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                          a.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {a.status === 'resolved' ? 'Решено' :
                           a.status === 'in_progress' ? 'В работе' :
                           a.status === 'rejected' ? 'Отклонено' : 'Модерация'}
                        </span>
                      </div>
                      
                      <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-relaxed">{a.description}</p>
                      
                      <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-t pt-2.5">
                        <span>Автор: {a.authorName}</span>
                        <span className="text-blue-700">🔍 Нажмите для подробностей →</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Elderly Contacts Directories */}
            {elderlyTab === 'contacts' && (
              <div className="bg-white rounded-3xl border-3 border-rose-400 p-6 shadow-md space-y-4">
                <h3 className="text-2xl font-black text-slate-950 border-b pb-3">📞 Прямые телефоны органов власти:</h3>
                <div className="space-y-4">
                  {phoneDirectory.map((item, index) => (
                    <div key={index} className="border-2 border-slate-100 rounded-2xl p-4 flex flex-col gap-2">
                      <h4 className="text-lg font-black text-slate-900 leading-tight">{item.title}</h4>
                      <p className="text-sm font-bold text-slate-500">Режим работы: {item.hours}</p>
                      <button
                        onClick={() => triggerCallSimulation(item.phone, item.title)}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 px-4 font-black text-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                      >
                        📞 {item.phone}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          
          // -------------------- FULL ADVANCED/DESKTOP LIAISON INTERFACE --------------------
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT COLUMN: NAVIGATION & CONTROLS */}
            <div className="lg:col-span-3 space-y-4">
              
              <div className="bg-white rounded-2xl p-4 shadow-xs border space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Разделы модуля</p>
                
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left font-bold text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <Building2 size={18} />
                  <span>Главный экран</span>
                </button>

                <button
                  onClick={() => setActiveTab('rules')}
                  className={`w-full text-left font-bold text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'rules' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <AlertTriangle size={18} />
                  <span>Правила подачи</span>
                </button>

                <button
                  onClick={() => {
                    setWizardStep(1);
                    setCreationErrors(null);
                    setSimulatedVotes([]);
                    setActiveTab('create');
                  }}
                  className={`w-full text-left font-bold text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'create' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <Plus size={18} />
                  <span>Создать обращение</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full text-left font-bold text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'stats' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <Star size={18} />
                  <span>Статистика решений</span>
                </button>

                {currentUser.role === 'main_admin' || currentUser.role === 'admin' ? (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`w-full text-left font-bold text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'admin' ? 'bg-red-50 text-red-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <Shield size={18} />
                    <span>Админ Панель</span>
                  </button>
                ) : null}

                {currentUser.role === 'village_admin' ? (
                  <button
                    onClick={() => setActiveTab('deputy')}
                    className={`w-full text-left font-bold text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'deputy' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <Users size={18} />
                    <span>Депутатский контроль</span>
                  </button>
                ) : null}
              </div>

              {/* TELEPHONE DIRECTORY CARD */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Phone size={18} className="text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Горячая связь Устьяны</h3>
                </div>
                <div className="space-y-3">
                  {phoneDirectory.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-xs space-y-1">
                      <p className="font-bold text-slate-700 leading-tight">{item.title}</p>
                      <button 
                        onClick={() => triggerCallSimulation(item.phone, item.title)}
                        className="text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        {item.phone}
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowCallModal(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold py-2 px-3 rounded-xl transition-colors text-center cursor-pointer block"
                  >
                    Все телефоны поселений
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: DYNAMIC SCREENS */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* SCREEN 1: MAIN LIAISON DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Banner Rule Info */}
                  <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 flex flex-col sm:flex-row items-start gap-4 shadow-xs relative overflow-hidden">
                    <div className="bg-blue-100 text-blue-700 p-3 rounded-xl shrink-0">
                      <Shield size={24} className="stroke-[2.5]" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-bold text-blue-950 text-base">⚠️ ПРАВИЛО СОСЕДСКОЙ ПОДДЕРЖКИ</h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Прежде чем направить обращение властям — получите поддержку минимум 3-х соседей! Это позволяет отсеять эмоциональные всплески и сосредоточиться на реальных проблемах района.
                      </p>
                      <button 
                        onClick={() => setActiveTab('rules')}
                        className="text-blue-700 hover:text-blue-900 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        Подробнее о правилах подачи обращений &rarr;
                      </button>
                    </div>
                  </div>

                  {/* QUICK BUTTONS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-2xl">📝</span>
                        <h4 className="font-bold text-slate-900 text-sm">Создать обращение</h4>
                        <p className="text-xs text-slate-500">Запустите пошаговый мастер</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold py-2 px-4 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Запустить мастер
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-2xl">📋</span>
                        <h4 className="font-bold text-slate-900 text-sm">Мои обращения</h4>
                        <p className="text-xs text-slate-500">Фильтровать ваши личные заявки</p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery(currentUser.name);
                        }}
                        className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold py-2 px-4 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Показать мои ({appeals.filter(a => a.authorId === currentUser.id).length})
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-2xl">📈</span>
                        <h4 className="font-bold text-slate-900 text-sm">Статистика района</h4>
                        <p className="text-xs text-slate-500">Реальное время выполнения по селам</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('stats')}
                        className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold py-2 px-4 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Смотреть графики
                      </button>
                    </div>
                  </div>

                  {/* PUBLIC FEED HEADER & FILTERS */}
                  <div className="bg-white rounded-2xl border p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                          <span>📊</span> Общественные обращения Устьян
                        </h3>
                        <p className="text-xs text-slate-400">Все обращения района с цепочками решений</p>
                      </div>

                      {/* SEARCH BAR */}
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Поиск по теме, селу..."
                          className="pl-9 pr-4 py-1.5 w-full sm:w-60 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* FILTER CHIPS */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t text-xs">
                      <span className="font-bold text-slate-400 py-1">Тема:</span>
                      <button 
                        onClick={() => setTopicFilter('all')}
                        className={`px-2.5 py-1 rounded-full font-bold ${topicFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        Все темы
                      </button>
                      {TOPIC_METADATA.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setTopicFilter(t.id)}
                          className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${topicFilter === t.id ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                          <span>{t.emoji}</span>
                          <span>{t.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="font-bold text-slate-400 py-1">Статус:</span>
                      <button 
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-full font-bold ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        Все статусы
                      </button>
                      <button 
                        onClick={() => setStatusFilter('voting')}
                        className={`px-2.5 py-1 rounded-full font-bold ${statusFilter === 'voting' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        🟡 Сбор голосов
                      </button>
                      <button 
                        onClick={() => setStatusFilter('moderation')}
                        className={`px-2.5 py-1 rounded-full font-bold ${statusFilter === 'moderation' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        🟠 Модерация
                      </button>
                      <button 
                        onClick={() => setStatusFilter('in_progress')}
                        className={`px-2.5 py-1 rounded-full font-bold ${statusFilter === 'in_progress' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        🔵 В работе
                      </button>
                      <button 
                        onClick={() => setStatusFilter('resolved')}
                        className={`px-2.5 py-1 rounded-full font-bold ${statusFilter === 'resolved' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        🟢 Решено
                      </button>
                    </div>

                  </div>

                  {/* APPEALS FEED LIST */}
                  <div className="space-y-4">
                    {filteredAppeals.length === 0 ? (
                      <div className="bg-white border rounded-2xl p-8 text-center text-slate-400 space-y-2">
                        <AlertTriangle size={32} className="mx-auto text-slate-300 animate-bounce" />
                        <p className="font-bold text-slate-500">Обращений с выбранными фильтрами не найдено</p>
                        <p className="text-xs">Попробуйте изменить поисковый запрос или сбросить фильтры.</p>
                      </div>
                    ) : (
                      filteredAppeals.map(a => {
                        const meta = TOPIC_METADATA.find(t => t.id === a.topic);
                        return (
                          <div 
                            key={a.id}
                            onClick={() => {
                              setSelectedAppealId(a.id);
                              setActiveTab('view_appeal');
                            }}
                            className="bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-shadow cursor-pointer space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{meta?.emoji || '🏛️'}</span>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">{a.title}</h4>
                                  <p className="text-xs text-slate-400 font-medium">
                                    Обращение #{a.id.substring(7, 11)} • {a.authorVillage} • {new Date(a.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 self-start sm:self-center">
                                <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                  a.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                                  a.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                                  a.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  a.status === 'moderation' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {a.status === 'resolved' ? '🟢 Решено' :
                                   a.status === 'in_progress' ? '🔵 В работе' :
                                   a.status === 'rejected' ? '❌ Отклонено' : 
                                   a.status === 'moderation' ? '🟠 На модерации' : '🟡 Сбор голосов'}
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                              {a.description}
                            </p>

                            {/* PROGRESS FOOTER */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs pt-1">
                              <div className="flex items-center gap-2 text-slate-500 font-medium">
                                <span>Автор: <strong className="text-slate-800">{a.authorName}</strong></span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp size={12} className="text-blue-600" />
                                  Поддержали: <strong className="text-blue-800">{a.votes}</strong> соседей
                                </span>
                              </div>

                              <div className="text-blue-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer">
                                Отследить ход решения &rarr;
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

              {/* SCREEN 2: RULES */}
              {activeTab === 'rules' && (
                <div className="bg-white rounded-2xl border p-6 space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-950">
                      <AlertOctagon className="text-blue-600" />
                      Правила и условия подачи обращений в администрацию
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Ознакомьтесь перед созданием нового официального обращения</p>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed">
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                      <h3 className="font-bold text-blue-950">1️⃣ Главный принцип: Поддержка соседей</h3>
                      <p className="text-slate-700 text-xs sm:text-sm">
                        Прежде чем обращение будет отправлено главе поселения или в администрацию района, оно обязательно должно набрать не менее <strong>3 голосов поддержки</strong> от жителей вашего населенного пункта. Таким образом мы гарантируем, что проблема общественно значима, а не является чьим-то личным капризом.
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                      <h3 className="font-bold text-red-950 flex items-center gap-1.5">
                        <X size={16} /> Категорически ЗАПРЕЩЕНО в текстах:
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-red-900 font-medium">
                        <li>Нецензурная лексика, брань, скрытые оскорбления.</li>
                        <li>Личные выпады и клевета против конкретных сотрудников или чиновников.</li>
                        <li>Заведомо ложная информация, не подкрепленная фактами.</li>
                        <li>Эмоциональные жалобы и нытье без указания точного адреса, дат и событий.</li>
                      </ul>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                      <h3 className="font-bold text-emerald-950">🏠 Разрешенные темы для обращений:</h3>
                      <p className="text-slate-700 text-xs sm:text-sm">
                        ЖКХ (прорыв труб, отсутствие тепла/воды), состояние местных дорог и тротуаров, медицинское обслуживание (ФАПы, амбулатории), работа автобусов, вывоз мусора и свалки в лесах Устьян, сотовая связь и доступность интернета.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <h3 className="font-bold text-slate-900">⏱️ Что происходит после одобрения?</h3>
                      <p className="text-slate-600 text-xs sm:text-sm">
                        Обращение одобряется модератором, после чего назначается ответственный орган и конкретное должностное лицо. Весь ход выполнения отображается в публичной цепочке истории, гарантируя 100% прозрачность перед депутатами и жителями района.
                      </p>
                    </div>

                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl cursor-pointer"
                    >
                      Перейти к созданию обращения
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 3: CREATE APPEAL (WIZARD) */}
              {activeTab === 'create' && (
                <div className="bg-white rounded-2xl border p-6 space-y-6">
                  
                  {/* Progress Header */}
                  <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">📝 Пошаговый мастер создания обращения</h2>
                      <p className="text-xs text-slate-400">Шаг {wizardStep} из 3</p>
                    </div>
                    
                    {/* Visual Progress Steps */}
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${wizardStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                      <div className="w-8 h-0.5 bg-slate-200" />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${wizardStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                      <div className="w-8 h-0.5 bg-slate-200" />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${wizardStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
                    </div>
                  </div>

                  {creationErrors && (
                    <div className="bg-red-50 text-red-900 border border-red-200 p-4 rounded-xl text-xs font-bold">
                      {creationErrors}
                    </div>
                  )}

                  {/* STEP 1: TOPIC CHOICE */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900 text-sm">Выберите тему вашего обращения:</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TOPIC_METADATA.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setNewTopic(t.id);
                              setCreationErrors(null);
                            }}
                            className={`p-4 rounded-xl text-left border-2 flex items-start gap-3 transition-all cursor-pointer ${newTopic === t.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'}`}
                          >
                            <span className="text-2xl mt-1">{t.emoji}</span>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{t.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ADDRESS & DETAILS */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900 text-sm">Опишите суть проблемы и адрес:</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Населенный пункт (село):</label>
                          <select
                            value={newVillage}
                            onChange={(e) => setNewVillage(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                          >
                            {Array.from(new Set(USTYANY_VILLAGES.map(v => v.name))).map((vName, idx) => (
                              <option key={idx} value={vName}>{vName}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Точный адрес (улица, дом):</label>
                          <input
                            type="text"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="ул. Советская, д. 12"
                            className="w-full text-xs p-3 rounded-xl border border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Краткое название проблемы:</label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Например: Прорыв водопроводной трубы на улице Советской"
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 font-bold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Подробное описание проблемы (только факты):</label>
                        <textarea
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          rows={5}
                          placeholder="Например: В доме №12 по ул. Советская нет воды уже 3 дня. Труба лопнула возле колодца..."
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed"
                        />
                      </div>

                      {/* PHOTO UPLOADER */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Фото проблемы (до 3 шт.):</label>
                        <div className="flex flex-wrap gap-3">
                          {newPhotos.map((url, i) => (
                            <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border">
                              <img src={url} alt="Загружено" className="w-full h-full object-cover" />
                              <button
                                onClick={() => setNewPhotos(newPhotos.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          
                          {newPhotos.length < 3 && (
                            <button
                              onClick={handlePhotoUpload}
                              className="w-24 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Camera size={18} />
                              <span className="text-[10px] font-bold mt-1">Добавить</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* STEP 3: VOTE COLLECTION */}
                  {wizardStep === 3 && (
                    <div className="space-y-5 text-center">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left space-y-2">
                        <h4 className="font-bold text-amber-950 flex items-center gap-1.5 text-sm sm:text-base">
                          <AlertOctagon size={18} className="text-amber-600" />
                          Сбор голосов соседей
                        </h4>
                        <p className="text-slate-700 text-xs sm:text-sm">
                          Чтобы подать это обращение, необходимо собрать поддержку как минимум 3-х ваших односельчан. Поделитесь этой ссылкой с соседями в беседах или чате!
                        </p>
                      </div>

                      {/* SHARE BUTTONS */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button 
                          onClick={() => alert('Ссылка на обращение успешно скопирована! Поделитесь ей в чате села.')}
                          className="bg-white hover:bg-slate-50 border p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-slate-700"
                        >
                          <Share2 size={16} className="text-blue-500" /> Поделиться в чате Устьян
                        </button>
                        <button 
                          onClick={() => alert('Имитация публикации в социальные сети ВК / ОК завершена!')}
                          className="bg-white hover:bg-slate-50 border p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-slate-700"
                        >
                          <Share2 size={16} className="text-indigo-500" /> Поделиться в соцсетях
                        </button>
                        <button 
                          onClick={() => alert('Ссылка отправлена по SMS!')}
                          className="bg-white hover:bg-slate-50 border p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-slate-700"
                        >
                          <FileText size={16} className="text-emerald-500" /> Отправить по SMS
                        </button>
                      </div>

                      {/* VOTES PROGRESS TALLY */}
                      <div className="bg-slate-50 rounded-2xl border p-6 space-y-4 max-w-md mx-auto">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-700">Всего голосов поддержки:</span>
                          <span className="bg-blue-600 text-white font-extrabold px-3 py-1 rounded-full text-xs">
                            {simulatedVotes.length} из 3
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (simulatedVotes.length / 3) * 100)}%` }}
                          />
                        </div>

                        {simulatedVotes.length < 3 ? (
                          <div className="space-y-2">
                            <button
                              onClick={handleSimulateSupport}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              👥 ИМИТИРОВАТЬ ПОДДЕРЖКУ (демо-клики от соседей)
                            </button>
                            <p className="text-[10px] text-slate-400">Нажмите кнопку, чтобы симулировать голоса поддержки односельчан в тестовом режиме</p>
                          </div>
                        ) : (
                          <div className="bg-emerald-100 text-emerald-900 font-bold p-3 rounded-xl text-xs border border-emerald-300">
                            ✅ Порог в 3 голоса преодолен! Ваше обращение полностью готово к отправке.
                          </div>
                        )}

                        {/* List of supporting neighbors */}
                        {simulatedVotes.length > 0 && (
                          <div className="text-left space-y-1.5 pt-3 border-t">
                            <p className="text-xs font-bold text-slate-500">Поддержавшие соседи:</p>
                            <div className="space-y-1">
                              {simulatedVotes.map((v, i) => (
                                <div key={i} className="text-xs text-slate-700 flex items-center gap-1">
                                  <CheckCircle2 size={12} className="text-emerald-500" />
                                  <span>{v.userName} ({v.userVillage})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Wizard Footer controls */}
                  <div className="border-t pt-4 flex justify-between">
                    <button
                      onClick={() => {
                        if (wizardStep > 1) setWizardStep(wizardStep - 1);
                        else setActiveTab('dashboard');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                    >
                      Назад
                    </button>
                    
                    {wizardStep < 3 ? (
                      <button
                        onClick={() => {
                          if (wizardStep === 2) {
                            if (!newTitle.trim() || !newDesc.trim()) {
                              setCreationErrors('⚠️ Заполните название и описание проблемы.');
                              return;
                            }
                            const check = handleContentCheck(newDesc);
                            if (!check.isClean && check.error) {
                              setCreationErrors(check.error);
                              return;
                            }
                          }
                          setCreationErrors(null);
                          setWizardStep(wizardStep + 1);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                      >
                        Продолжить
                      </button>
                    ) : (
                      <button
                        onClick={handleCreateAppeal}
                        disabled={simulatedVotes.length < 3}
                        className={`text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer ${simulatedVotes.length >= 3 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        Подать в администрацию
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* SCREEN 4: VIEW APPEAL DETAILS (PUBLIC VIEW) */}
              {activeTab === 'view_appeal' && selectedAppeal && (
                <div className="space-y-6">
                  
                  {/* Title and Back */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className="bg-white border hover:bg-slate-50 p-2 rounded-xl text-slate-600 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <h2 className="text-lg font-bold text-slate-900">
                      Карточка обращения #{selectedAppeal.id.substring(7, 11)}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Main appeal body (left) */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      <div className="bg-white rounded-2xl border p-5 space-y-5">
                        
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-xs bg-slate-100 text-slate-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {TOPIC_METADATA.find(t => t.id === selectedAppeal.topic)?.name || 'Обращение'}
                            </span>
                            <h3 className="font-extrabold text-slate-950 text-base sm:text-lg mt-2 leading-snug">
                              {selectedAppeal.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-1.5">
                              <MapPin size={12} className="text-red-500" />
                              <span>{selectedAppeal.authorVillage}, {selectedAppeal.address}</span>
                            </div>
                          </div>

                          <span className={`text-xs px-2.5 py-1 rounded-full font-black uppercase shrink-0 ${
                            selectedAppeal.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            selectedAppeal.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                            selectedAppeal.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            selectedAppeal.status === 'moderation' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedAppeal.status === 'resolved' ? 'Решено' :
                             selectedAppeal.status === 'in_progress' ? 'В работе' :
                             selectedAppeal.status === 'rejected' ? 'Отклонено' :
                             selectedAppeal.status === 'moderation' ? 'Модерация' : 'Сбор голосов'}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Описание проблемы:</h4>
                          <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                            {selectedAppeal.description}
                          </p>
                        </div>

                        {/* Photos */}
                        {selectedAppeal.photos && selectedAppeal.photos.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Прикрепленные фото:</h4>
                            <div className="flex flex-wrap gap-3">
                              {selectedAppeal.photos.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noreferrer" className="w-32 h-24 rounded-xl overflow-hidden border hover:opacity-90 transition-opacity">
                                  <img src={url} alt="Проблема" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vote Action Box */}
                        <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500">Голоса поддержки соседей:</p>
                            <p className="text-sm font-black text-blue-800 flex items-center gap-1.5">
                              <ThumbsUp size={16} /> {selectedAppeal.votes} жителей поддержали обращение
                            </p>
                          </div>

                          {/* Upvote support action */}
                          {!appealVotes.some(v => v.userId === currentUser.id) && selectedAppeal.authorId !== currentUser.id ? (
                            <button
                              onClick={() => setShowVoteDialog(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              🗳️ Поддержать обращение
                            </button>
                          ) : (
                            <div className="bg-slate-100 text-slate-500 font-extrabold text-xs py-2 px-4 rounded-xl flex items-center gap-1 border">
                              <UserCheck size={14} className="text-emerald-500" /> Вы уже поддержали это обращение
                            </div>
                          )}
                        </div>

                      </div>

                      {/* PUBLIC CITIZEN CONTROL / VERIFICATION WIDGET */}
                      {selectedAppeal.status === 'resolved' && (
                        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl relative overflow-hidden">
                          {/* Visual Background Accent */}
                          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-blue-600/15 to-transparent rounded-bl-full pointer-events-none" />
                          
                          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                            <span className="text-xl">👥</span>
                            <div>
                              <h4 className="font-extrabold text-slate-100 text-xs sm:text-sm">
                                Общественный народный контроль
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Оцените качество выполнения работ администрацией
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4 text-xs">
                            
                            {/* Choice Radio Grid */}
                            <div className="space-y-2">
                              <label className="text-slate-300 font-bold block">Соответствует ли результат действительности?</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVerificationChoice('full');
                                    setVerificationRating(5);
                                  }}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                    verificationChoice === 'full' 
                                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-900/10' 
                                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  <span className="font-bold text-[11px]">🟢 Да, полностью</span>
                                  <span className="text-[9px] mt-1 text-slate-400 font-medium">Качественно и до конца</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setVerificationChoice('partial');
                                    setVerificationRating(3);
                                  }}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                    verificationChoice === 'partial' 
                                      ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md shadow-amber-900/10' 
                                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  <span className="font-bold text-[11px]">🟡 Частично / с замечаниями</span>
                                  <span className="text-[9px] mt-1 text-slate-400 font-medium">Сделано не до конца / небрежно</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setVerificationChoice('none');
                                    setVerificationRating(1);
                                  }}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                    verificationChoice === 'none' 
                                      ? 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-md shadow-rose-900/10' 
                                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  <span className="font-bold text-[11px]">🔴 Нет / Чистая отписка</span>
                                  <span className="text-[9px] mt-1 text-slate-400 font-medium">Проблема не решена совсем</span>
                                </button>
                              </div>
                            </div>

                            {/* Interactive Stars Row */}
                            <div className="space-y-1.5 bg-slate-900/20 p-3 rounded-xl border border-slate-800/50">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-300">Оценка качества решения проблемы:</span>
                                <span className="text-[10px] font-black font-mono text-blue-400 uppercase tracking-widest">{verificationRating} из 5 звезд</span>
                              </div>
                              <div className="flex items-center gap-2 py-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => {
                                      setVerificationRating(star);
                                      if (star >= 5) setVerificationChoice('full');
                                      else if (star >= 3) setVerificationChoice('partial');
                                      else setVerificationChoice('none');
                                    }}
                                    className="text-2xl hover:scale-110 transition-transform duration-100 cursor-pointer text-amber-400"
                                  >
                                    {star <= verificationRating ? '★' : '☆'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Textarea feedback comments */}
                            <div className="space-y-1.5">
                              <label className="text-slate-300 font-bold block">Ваш комментарий / замечание / слова благодарности:</label>
                              <textarea
                                value={verificationComment}
                                onChange={(e) => setVerificationComment(e.target.value)}
                                rows={2}
                                placeholder="Опишите ваши впечатления от решения проблемы..."
                                className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                              />
                            </div>

                            {/* Submit Rating button */}
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={handlePublishVerification}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
                              >
                                <span>🚀 Опубликовать народную оценку</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* DISCUSSIONS & COMMENTS COLLECTION */}
                      <div className="bg-white rounded-2xl border p-5 space-y-4">
                        <h4 className="font-bold text-slate-950 text-sm sm:text-base border-b pb-2 flex items-center gap-1.5">
                          <span>💬</span> Обсуждение и официальные ответы ({appealComments.length})
                        </h4>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {appealComments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-4">Обсуждение пока пусто. Напишите свой комментарий или вопрос.</p>
                          ) : (
                            appealComments.map(c => (
                              <div 
                                key={c.id} 
                                className={`p-3 rounded-xl border space-y-1 text-xs ${
                                  c.isOfficial ? 'bg-amber-50 border-amber-200' : 
                                  c.isModerator ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                    {c.isOfficial ? '🏛️ ' : c.isModerator ? '🛡️ ' : '👤 '}
                                    {c.userName}
                                    {c.isOfficial && (
                                      <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">Официально</span>
                                    )}
                                  </span>
                                  <span className="text-slate-400">{new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{c.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Comment form */}
                        <div className="flex gap-2 border-t pt-3">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            placeholder="Напишите комментарий, вопрос или совет..."
                            className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                          />
                          <button
                            onClick={handleAddComment}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2.5 cursor-pointer"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Timeline of decisions (right side) */}
                    <div className="lg:col-span-4 space-y-4">
                      
                      {/* Timeline box */}
                      <div className="bg-white rounded-2xl border p-5 space-y-4">
                        <h4 className="font-bold text-slate-950 text-sm border-b pb-2 flex items-center gap-1.5">
                          <Clock size={16} className="text-blue-600" />
                          Цепочка решений властей
                        </h4>

                        <div className="space-y-4 relative pl-4 border-l-2 border-slate-100 text-xs">
                          {selectedAppeal.timeline.map((item, index) => (
                            <div key={index} className="space-y-1 relative">
                              {/* Dot status icon */}
                              <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                              
                              <p className="text-[10px] text-slate-400 font-extrabold">
                                {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <h5 className="font-black text-slate-900 leading-tight">{item.action}</h5>
                              <p className="text-slate-600 font-medium leading-relaxed">{item.description}</p>
                              <p className="text-[10px] text-slate-400 font-bold italic">Ответственный: {item.author}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Official Assignee card */}
                      {selectedAppeal.assignedTo && selectedAppeal.assignedTo.org && (
                        <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-5 space-y-2">
                          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Building2 size={14} className="text-amber-600" /> Исполнитель по обращению:
                          </h4>
                          <p className="text-xs font-extrabold text-slate-800">{selectedAppeal.assignedTo.org}</p>
                          <p className="text-[10px] text-slate-500 font-bold">ФИО ответственного: {selectedAppeal.assignedTo.person}</p>
                        </div>
                      )}

                      {/* MODERATOR CONTROLS (IF LOGGED IN USER IS MODERATOR/ADMIN) */}
                      {(currentUser.role === 'main_admin' || currentUser.role === 'admin') && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-3">
                          <h4 className="font-black text-red-950 text-xs uppercase flex items-center gap-1">
                            🛡️ Панель Модератора
                          </h4>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-red-900 block">Заметка / Причина / Решение:</label>
                            <textarea
                              value={adminReasonText}
                              onChange={(e) => setAdminReasonText(e.target.value)}
                              rows={3}
                              placeholder="Например: Ремонт запланирован на 20.07.2026. Или: Причина отклонения..."
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>

                          {selectedAppeal.status === 'moderation' && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleModeratorAction('approve')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-lg text-[11px] cursor-pointer"
                              >
                                Одобрить &rarr;
                              </button>
                              <button
                                onClick={() => handleModeratorAction('reject')}
                                className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-2 rounded-lg text-[11px] cursor-pointer"
                              >
                                Отклонить
                              </button>
                            </div>
                          )}

                          {selectedAppeal.status === 'accepted' && (
                            <div className="space-y-2 border-t pt-2 mt-2">
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={assignedOrg}
                                  onChange={(e) => setAssignedOrg(e.target.value)}
                                  placeholder="Организация"
                                  className="text-[10px] p-2 border rounded-lg bg-white"
                                />
                                <input
                                  type="text"
                                  value={assignedPerson}
                                  onChange={(e) => setAssignedPerson(e.target.value)}
                                  placeholder="ФИО лица"
                                  className="text-[10px] p-2 border rounded-lg bg-white"
                                />
                              </div>
                              <button
                                onClick={() => handleModeratorAction('in_progress')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-lg text-[11px] cursor-pointer"
                              >
                                Назначить в работу &rarr;
                              </button>
                            </div>
                          )}

                          {selectedAppeal.status === 'in_progress' && (
                            <button
                              onClick={() => handleModeratorAction('resolve')}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-lg text-[11px] cursor-pointer"
                            >
                              ✅ Отметить выполненным
                            </button>
                          )}
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )}

              {/* SCREEN 5: ADMIN LIST PANEL */}
              {activeTab === 'admin' && (
                <div className="bg-white rounded-2xl border p-6 space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                      🛡️ Панель Администратора-Модератора
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Одобрение, отклонение и назначение исполнителей по обращениям</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 text-xs font-bold border-b pb-2">
                      <span className="text-blue-700">Входящие обращения на модерации ({appeals.filter(a => a.status === 'moderation').length})</span>
                    </div>

                    <div className="space-y-4">
                      {appeals.filter(a => a.status === 'moderation').length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">Нет новых входящих обращений на модерации.</p>
                      ) : (
                        appeals.filter(a => a.status === 'moderation').map(a => (
                          <div key={a.id} className="border p-4 rounded-xl bg-slate-50 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">{a.title}</h4>
                                <p className="text-[10px] text-slate-400">Село: {a.authorVillage} • Автор: {a.authorName}</p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedAppealId(a.id);
                                  setActiveTab('view_appeal');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold py-1.5 px-3 rounded-lg cursor-pointer"
                              >
                                Рассмотреть карточку &rarr;
                              </button>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{a.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 6: DEPUTY MONITOR BOARD */}
              {activeTab === 'deputy' && (
                <div className="bg-white rounded-2xl border p-6 space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                      👔 Депутатский контроль по поселениям
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Контроль за сроками выполнения и ускорение решения проблем избирателей</p>
                  </div>

                  {/* ALERTS SECTION */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <AlertTriangle className="text-amber-500 animate-pulse" />
                      Напоминания &amp; Просроченные решения (&gt;10 дней в работе):
                    </h3>

                    <div className="space-y-3">
                      {appeals.filter(a => a.status === 'in_progress').length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-4">Нет обращений, требующих незамедлительного напоминания.</p>
                      ) : (
                        appeals.filter(a => a.status === 'in_progress').map(a => {
                          const isDelayed = isAppealDelayed(a);
                          return (
                            <div key={a.id} className={`border p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDelayed ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{a.title}</h4>
                                <p className="text-[10px] text-slate-400">
                                  Село: {a.authorVillage} • В работе с {new Date(a.createdAt).toLocaleDateString()}
                                </p>
                                {isDelayed && (
                                  <span className="bg-red-100 text-red-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mt-1">
                                    ⚠️ Задерживается более 10 дней
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDeputyRemind(a)}
                                  className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold py-1.5 px-3 rounded-lg cursor-pointer shadow-xs active:scale-98"
                                >
                                  📝 Направить запрос
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAppealId(a.id);
                                    setActiveTab('view_appeal');
                                  }}
                                  className="bg-white hover:bg-slate-100 border text-slate-700 text-[10px] font-extrabold py-1.5 px-3 rounded-lg cursor-pointer"
                                >
                                  Смотреть
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 7: STATS & CHARTS */}
              {activeTab === 'stats' && (
                <div className="bg-white rounded-2xl border p-6 space-y-6">
                  
                  {/* Stats Title */}
                  <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                        <span>📈</span> Статистика решений Устьянского района
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Реальные аналитические данные обращений граждан</p>
                    </div>
                    
                    <button 
                      onClick={() => alert('Полный аналитический PDF-отчет сформирован и сохранен в вашу папку загрузок!')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
                    >
                      <FileDown size={14} /> Скачать отчёт
                    </button>
                  </div>

                  {/* STATS COUNT GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border text-center space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Всего обращений</p>
                      <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border-emerald-100 border text-center space-y-1 animate-pulse">
                      <p className="text-xs font-bold text-emerald-600 uppercase">Успешно решено</p>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.resolved}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border-amber-100 border text-center space-y-1">
                      <p className="text-xs font-bold text-amber-600 uppercase">В работе / Сбор</p>
                      <p className="text-2xl sm:text-3xl font-black text-amber-700">{stats.inProgress}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border-red-100 border text-center space-y-1">
                      <p className="text-xs font-bold text-red-500 uppercase">Отклонено</p>
                      <p className="text-2xl sm:text-3xl font-black text-red-700">{stats.rejected}</p>
                    </div>
                  </div>

                  {/* PREMIUM CUSTOM VISUAL CHART (ELEGANT HTML SVG BAR CHART) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                    
                    {/* Topic distribution (7 columns) */}
                    <div className="md:col-span-7 bg-slate-50 rounded-xl p-5 border space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Распределение обращений по темам:</h4>
                      <div className="space-y-3">
                        {(Object.entries(stats.byTopic) as [string, number][]).map(([topicId, count]) => {
                          const meta = TOPIC_METADATA.find(t => t.id === topicId);
                          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                          return (
                            <div key={topicId} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1.5">
                                  <span>{meta?.emoji}</span>
                                  <span>{meta?.name.split(' ')[0]}</span>
                                </span>
                                <span>{count} обращений ({Math.round(percentage)}%)</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Settlement progress / ranking table (5 columns) */}
                    <div className="md:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 shadow-sm">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-blue-600 animate-pulse" />
                          <span>🏆 Рейтинг активности и решения проблем</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Ранжирование сел по проценту выполнения обращений</p>
                      </div>

                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                              <th className="py-2.5 px-2 text-center w-12">Место</th>
                              <th className="py-2.5 px-2">Населенный пункт</th>
                              <th className="py-2.5 px-2 text-center w-16">Подано</th>
                              <th className="py-2.5 px-2 text-center w-16">Решено</th>
                              <th className="py-2.5 px-2 text-right w-28">Эффективность</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {Object.entries(stats.byVillage).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-xs text-slate-400 italic">
                                  Нет данных по поселениям.
                                </td>
                              </tr>
                            ) : (
                              (() => {
                                const sortedByVillage = (Object.entries(stats.byVillage) as [string, { total: number; resolved: number }][])
                                  .map(([vName, data]) => {
                                    const resRate = data.total > 0 ? (data.resolved / data.total) * 100 : 0;
                                    return { name: vName, total: data.total, resolved: data.resolved, resRate };
                                  })
                                  .sort((a, b) => b.resRate - a.resRate || b.total - a.total);

                                return sortedByVillage.map((village, idx) => {
                                  const rank = idx + 1;
                                  return (
                                    <tr key={village.name} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="py-2.5 px-2 text-center">
                                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                                          rank === 1 ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' :
                                          rank === 2 ? 'bg-slate-200 text-slate-800' :
                                          rank === 3 ? 'bg-amber-50 text-amber-700' :
                                          'bg-slate-100 text-slate-500'
                                        }`}>
                                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-2">
                                        <p className="font-bold text-slate-800 text-xs">{village.name}</p>
                                      </td>
                                      <td className="py-2.5 px-2 text-center font-mono text-[10px] text-slate-600 font-bold">
                                        {village.total}
                                      </td>
                                      <td className="py-2.5 px-2 text-center font-mono text-[10px] text-emerald-600 font-extrabold">
                                        {village.resolved}
                                      </td>
                                      <td className="py-2.5 px-2 text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                          <span className={`text-[10px] font-black font-mono ${
                                            village.resRate >= 75 ? 'text-emerald-600' :
                                            village.resRate >= 40 ? 'text-amber-600' :
                                            'text-rose-500'
                                          }`}>
                                            {Math.round(village.resRate)}%
                                          </span>
                                          <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full rounded-full transition-all duration-500 ${
                                                village.resRate >= 75 ? 'bg-emerald-500' :
                                                village.resRate >= 40 ? 'bg-amber-500' :
                                                'bg-rose-500'
                                              }`}
                                              style={{ width: `${village.resRate}%` }}
                                            />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* -------------------- CALL SIMULATOR MODAL DIALOG -------------------- */}
      <AnimatePresence>
        {showCallModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-slate-700"
            >
              
              {/* Telephone ringing graphic */}
              <div className="space-y-2">
                <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center mx-auto text-white text-3xl animate-bounce shadow-lg">
                  📞
                </div>
                {callState === 'dialing' ? (
                  <p className="text-xs text-rose-400 font-extrabold animate-pulse uppercase tracking-widest mt-3">НАБОР НОМЕРА...</p>
                ) : callState === 'connected' ? (
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest mt-3">РАЗГОВОР</p>
                    <p className="text-3xl font-black font-mono">{formatTime(callDuration)}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mt-3">ЗВОНОК ЗАВЕРШЕН</p>
                )}
              </div>

              {/* Call log / Conversation simulation */}
              <div className="bg-slate-800 rounded-2xl p-4 text-xs font-bold text-slate-200 text-left min-h-24 space-y-2">
                <p className="text-slate-400 italic text-[10px]">Системный лог звонка:</p>
                <p className="leading-relaxed">{callLog}</p>
                
                {callState === 'connected' && (
                  <div className="border-t border-slate-700 pt-2 mt-2 space-y-1 text-emerald-300">
                    <p className="font-extrabold">Дежурный администрации:</p>
                    <p className="italic font-medium">«Здравствуйте! Приёмная администрации Устьян на связи. Расскажите вашу проблему, мы запишем и направим исполнителей.»</p>
                  </div>
                )}
              </div>

              {/* Dial directory in call */}
              {callState === 'dialing' && (
                <div className="text-xs space-y-2">
                  <p className="text-slate-400">Или выберите другой телефон из справочника Устьян:</p>
                  <div className="space-y-1">
                    {phoneDirectory.slice(1, 4).map((ph, i) => (
                      <button
                        key={i}
                        onClick={() => triggerCallSimulation(ph.phone, ph.title)}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 p-2.5 rounded-xl font-bold text-left flex justify-between items-center cursor-pointer"
                      >
                        <span className="truncate">{ph.title}</span>
                        <span className="text-[10px] text-blue-400 shrink-0">{ph.phone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {callState === 'connected' ? (
                  <button
                    onClick={() => {
                      setCallState('completed');
                      setCallLog('Звонок успешно завершен. Спасибо за обращение!');
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 px-4 font-bold text-sm cursor-pointer active:scale-98"
                  >
                    Повесить трубку
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCallModal(false)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 px-4 font-bold text-sm cursor-pointer active:scale-98"
                  >
                    Закрыть справочник
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------- VOTING INPUT modal dialog -------------------- */}
      <AnimatePresence>
        {showVoteDialog && selectedAppeal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-850 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-900 text-base">Поддержать обращение</h3>
                <button onClick={() => setShowVoteDialog(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <p className="text-slate-600">
                  Вы голосуете за отправку обращения <strong>#{selectedAppeal.id.substring(7, 11)}</strong> в администрацию. Вы можете оставить короткий комментарий поддержки:
                </p>

                <textarea
                  value={voteCommentText}
                  onChange={(e) => setVoteCommentText(e.target.value)}
                  rows={3}
                  placeholder="Например: Полностью поддерживаю, дорога у нас разбита уже два года..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowVoteDialog(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={handleRealCastVote}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Поддержать
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
