import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Trophy, MessageSquare, Phone, HelpCircle, Volume2, VolumeX, 
  ChevronRight, ArrowLeft, RotateCcw, Check, Sparkles, Send, Play, Pause, 
  Trash2, Plus, Star, MapPin, Eye, Search, AlertTriangle, ShieldCheck, 
  Sliders, User, PhoneCall, Image as ImageIcon, Video, Laptop, MousePointer, 
  Keyboard as KeyboardIcon, ShoppingBag, Landmark, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { ELDERLY_LESSONS, ACHIEVEMENTS, LEVELS, Lesson, LessonStep } from '../data/elderlyLessons';
import { dbUpdateUserProfile } from '../firebaseSync';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface ElderlySchoolProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onStartDirectChat?: (userId: string) => void;
}

export default function ElderlySchool({ user, onUpdateProfile, onStartDirectChat }: ElderlySchoolProps) {
  // Ensure elderly profile is initialized
  const defaultElderlyProfile: NonNullable<UserProfile['elderlyProfile']> = {
    fullName: user.name || "Мария Ивановна",
    level: 1,
    completedLessons: [] as string[],
    stars: 0,
    achievements: [] as string[],
    volunteerContact: "Анна (волонтер)",
    phoneContacts: [
      { name: "Внук Сережа", phone: "+7-921-123-4567", role: "grandson" },
      { name: "Внучка Катя", phone: "+7-921-765-4321", role: "granddaughter" },
      { name: "Подруга Галя", phone: "+7-900-555-1234", role: "neighbor" }
    ],
    learningProgress: [] as { lessonId: string; completedAt: string; rating: number }[],
    diaryEntries: [] as { id: string; lessonId: string; lessonTitle: string; text: string; date: string; photo?: string }[],
    settings: {
      fontSize: 22,
      highContrast: false,
      voiceGuidance: true,
      audioVolume: 80
    }
  };

  const elderlyProfile = user.elderlyProfile || defaultElderlyProfile;
  
  // Local settings syncing with DB updates
  const { fontSize, highContrast, voiceGuidance, audioVolume } = elderlyProfile.settings;
  const currentLevel = elderlyProfile.level;

  // Navigation states
  const [activeTab, setActiveTab] = useState<'lessons' | 'diary' | 'achievements' | 'chat' | 'info'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isLessonCompletedModal, setIsLessonCompletedModal] = useState(false);

  // Lesson simulation interactive states
  const [simPowerOn, setSimPowerOn] = useState(false);
  const [simChargerConnected, setSimChargerConnected] = useState(false);
  const [simRecentTapped, setSimRecentTapped] = useState<string | null>(null);
  const [simCallStep, setSimCallStep] = useState<'closed' | 'opened' | 'calling' | 'connected'>('closed');
  const [simSmsStep, setSimSmsStep] = useState<'closed' | 'opened' | 'draft' | 'sent'>('closed');
  const [simSmsText, setSimSmsText] = useState('');
  const [simCameraStep, setSimCameraStep] = useState<'closed' | 'opened' | 'captured'>('closed');
  const [simCapturedPhoto, setSimCapturedPhoto] = useState<string | null>(null);
  const [simPhotoSendStep, setSimPhotoSendStep] = useState<'closed' | 'opened' | 'attached' | 'sent'>('closed');
  const [simInstallStep, setSimInstallStep] = useState<'closed' | 'opened' | 'searching' | 'installing' | 'ready'>('closed');
  const [simChatStep, setSimChatStep] = useState<'closed' | 'opened' | 'typing' | 'done'>('closed');
  const [simVideoStep, setSimVideoStep] = useState<'closed' | 'ringing' | 'connected'>('closed');
  const [simPcPower, setSimPcPower] = useState(false);
  const [simMouseClicks, setSimMouseClicks] = useState<number>(0);
  const [simKeyboardText, setSimKeyboardText] = useState('');
  const [simSearchStep, setSimSearchStep] = useState<'closed' | 'opened' | 'results'>('closed');
  const [simMapsStep, setSimMapsStep] = useState<'closed' | 'opened' | 'route'>('closed');
  const [simWeatherStep, setSimWeatherStep] = useState<'closed' | 'opened' | 'weekend'>('closed');
  const [simNewsStep, setSimNewsStep] = useState<'closed' | 'opened' | 'read'>('closed');
  const [simShopStep, setSimShopStep] = useState<'closed' | 'items' | 'checkout' | 'done'>('closed');
  const [simShopCart, setSimShopCart] = useState<string[]>([]);
  const [simBankStep, setSimBankStep] = useState<'closed' | 'opened' | 'revealed'>('closed');
  const [simSecurityRinging, setSimSecurityRinging] = useState(true);
  const [simSecurityAnswered, setSimSecurityAnswered] = useState(false);
  const [simSecurityResult, setSimSecurityResult] = useState<'none' | 'success' | 'fail'>('none');
  const [simReviewStep, setSimReviewStep] = useState<number>(0);

  // Diary editing state
  const [diaryText, setDiaryText] = useState('');
  const [diaryLessonId, setDiaryLessonId] = useState('');
  const [diaryPhoto, setDiaryPhoto] = useState<string | null>(null);

  // Chat with volunteer simulated state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'elderly' | 'volunteer'; text: string; time: string }[]>([
    { sender: 'volunteer', text: 'Здравствуйте, дорогая ' + elderlyProfile.fullName + '! Я ваш волонтёр-помощник Анна. Я помогу вам во всём разобраться. Какой у вас вопрос сегодня?', time: '10:00' }
  ]);

  // Grandkid speed-dial modal
  const [activeSpeedDial, setActiveSpeedDial] = useState<{ name: string; phone: string; role: string } | null>(null);
  const [speedDialRinging, setSpeedDialRinging] = useState(false);
  const [speedDialConnected, setSpeedDialConnected] = useState(false);

  // Speech helper
  const speak = (text: string) => {
    if (!voiceGuidance) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8; // slower and calmer for senior folks
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger speech on step load
  useEffect(() => {
    if (selectedLesson) {
      const step = selectedLesson.steps[activeStepIdx];
      if (step) {
        speak(step.voiceText);
      }
    }
  }, [selectedLesson, activeStepIdx, voiceGuidance]);

  // Utility to handle font sizes
  const getFSize = (variant: 'title' | 'body' | 'small' | 'btn') => {
    if (fontSize === 26) {
      if (variant === 'title') return 'text-3xl sm:text-4xl font-black leading-tight';
      if (variant === 'body') return 'text-xl sm:text-2xl font-black leading-relaxed text-slate-800';
      if (variant === 'small') return 'text-base sm:text-lg font-bold text-slate-600';
      return 'text-xl font-black py-4 px-8 rounded-2xl';
    } else if (fontSize === 22) {
      if (variant === 'title') return 'text-2xl sm:text-3xl font-black leading-snug';
      if (variant === 'body') return 'text-lg sm:text-xl font-black leading-relaxed text-slate-800';
      if (variant === 'small') return 'text-sm sm:text-base font-bold text-slate-600';
      return 'text-lg font-black py-3 px-6 rounded-xl';
    } else {
      if (variant === 'title') return 'text-xl sm:text-2xl font-black leading-normal';
      if (variant === 'body') return 'text-base sm:text-lg font-bold leading-normal text-slate-800';
      if (variant === 'small') return 'text-xs sm:text-sm font-semibold text-slate-500';
      return 'text-base font-black py-2.5 px-5 rounded-lg';
    }
  };

  // High contrast background & text style mappings
  const bgStyle = highContrast ? 'bg-white border-4 border-black text-black' : 'bg-white border border-slate-100 shadow-xs';
  const cardStyle = highContrast ? 'bg-white border-4 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 border border-slate-200 shadow-xs';
  const accentCardStyle = highContrast ? 'bg-yellow-50 border-4 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-amber-50/70 border-2 border-amber-200';
  const buttonPrimary = highContrast ? 'bg-black text-white hover:bg-slate-900 border-2 border-black font-black text-center' : 'bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold';
  const buttonSecondary = highContrast ? 'bg-white text-black hover:bg-slate-100 border-4 border-black font-black text-center' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold';

  // Toggle Settings
  const handleUpdateSettings = (key: 'fontSize' | 'highContrast' | 'voiceGuidance' | 'audioVolume', val: any) => {
    const nextSettings = { ...elderlyProfile.settings, [key]: val };
    const nextProfile = { ...elderlyProfile, settings: nextSettings };
    onUpdateProfile({ elderlyProfile: nextProfile });
  };

  // Open a lesson
  const startLesson = (lesson: Lesson) => {
    // Reset simulator states
    setSimPowerOn(false);
    setSimChargerConnected(false);
    setSimRecentTapped(null);
    setSimCallStep('closed');
    setSimSmsStep('closed');
    setSimSmsText('');
    setSimCameraStep('closed');
    setSimPhotoSendStep('closed');
    setSimInstallStep('closed');
    setSimChatStep('closed');
    setSimVideoStep('closed');
    setSimPcPower(false);
    setSimMouseClicks(0);
    setSimKeyboardText('');
    setSimSearchStep('closed');
    setSimMapsStep('closed');
    setSimWeatherStep('closed');
    setSimNewsStep('closed');
    setSimShopStep('closed');
    setSimShopCart([]);
    setSimBankStep('closed');
    setSimSecurityRinging(true);
    setSimSecurityAnswered(false);
    setSimSecurityResult('none');
    setSimReviewStep(0);

    setSelectedLesson(lesson);
    setActiveStepIdx(0);
    setIsLessonCompletedModal(false);
  };

  // Progress to next step of active lesson
  const handleNextStep = () => {
    if (!selectedLesson) return;
    if (activeStepIdx < selectedLesson.steps.length - 1) {
      setActiveStepIdx(activeStepIdx + 1);
    } else {
      // Lesson completed!
      completeLesson();
    }
  };

  // Logic to process lesson completion
  const completeLesson = () => {
    if (!selectedLesson) return;
    const lessonId = selectedLesson.id;
    
    // Calculate next state
    const alreadyCompleted = elderlyProfile.completedLessons.includes(lessonId);
    const nextCompleted = alreadyCompleted 
      ? elderlyProfile.completedLessons 
      : [...elderlyProfile.completedLessons, lessonId];
    
    const earnedStars = alreadyCompleted ? 0 : selectedLesson.rewardStars;
    const nextStars = elderlyProfile.stars + earnedStars;

    // Check level progression based on count of completed lessons
    // 20 lessons total: 
    // Level 1: 0-3 completed
    // Level 2: 4-7 completed
    // Level 3: 8-11 completed
    // Level 4: 12-15 completed
    // Level 5: 16-20 completed
    let nextLevel = currentLevel;
    const completedCount = nextCompleted.length;
    if (completedCount >= 16) nextLevel = 5;
    else if (completedCount >= 12) nextLevel = 4;
    else if (completedCount >= 8) nextLevel = 3;
    else if (completedCount >= 4) nextLevel = 2;

    // Achievements checking
    const nextAchievements = [...elderlyProfile.achievements];
    
    // Check achievements mapped to completed lessons or levels
    if (selectedLesson.rewardAchievement && !nextAchievements.includes(selectedLesson.rewardAchievement)) {
      nextAchievements.push(selectedLesson.rewardAchievement);
    }

    // Final course master achievement
    if (completedCount === 20 && !nextAchievements.includes('master')) {
      nextAchievements.push('master');
    }

    // Progress journal log
    const progressEntry = {
      lessonId,
      completedAt: new Date().toISOString(),
      rating: 5 // Default high rating
    };

    const nextProgress = [...elderlyProfile.learningProgress];
    if (!alreadyCompleted) {
      nextProgress.push(progressEntry);
    }

    const nextProfile = {
      ...elderlyProfile,
      level: nextLevel,
      completedLessons: nextCompleted,
      stars: nextStars,
      achievements: nextAchievements,
      learningProgress: nextProgress
    };

    onUpdateProfile({ elderlyProfile: nextProfile });
    setIsLessonCompletedModal(true);
    
    // Play synthesis message
    speak("Поздравляю! Вы успешно завершили этот урок и получили награду. Так держать!");
  };

  // Dial Speed Dial Grandkid
  const triggerSpeedDial = (contact: { name: string; phone: string; role: string }) => {
    setActiveSpeedDial(contact);
    setSpeedDialRinging(true);
    setSpeedDialConnected(false);
    speak("Звоню контакту " + contact.name);

    setTimeout(() => {
      setSpeedDialRinging(false);
      setSpeedDialConnected(true);
      speak("Соединение установлено. Поговорите с близким человеком.");
    }, 2500);
  };

  // Send message to simulated volunteer
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'elderly' as const, text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Trigger funny & helpful simulated replies based on keyword match
    setTimeout(() => {
      let replyText = "Я поняла ваш вопрос! Давайте попробуем решить его вместе. Посмотрите уроки в разделе 'Обучение' или я могу перезвонить вам по телефону.";
      const query = chatInput.toLowerCase();
      if (query.includes('звонок') || query.includes('позвонить')) {
        replyText = "Чтобы сделать звонок, зайдите во второй урок. Там мы тренируемся находить зеленую трубку и нажимать имя внука. Если хотите, я могу набрать вас на обычный телефон.";
      } else if (query.includes('фото') || query.includes('камер')) {
        replyText = "Сделать фото очень просто! Нужно открыть значок фотоаппарата на экране и нажать на круглую белую кнопку. Попробуйте пройти урок №5 'Сделать фото'!";
      } else if (query.includes('спасибо') || query.includes('благодарю')) {
        replyText = "Пожалуйста! Мне в радость помогать вам. Вы большая молодец, что осваиваете новые знания!";
      } else if (query.includes('не получается') || query.includes('сложно')) {
        replyText = "Не волнуйтесь и не бойтесь нажимать на кнопки! Ничего сломать в телефоне невозможно. Давайте я перезвоню вам и голосом подскажу каждый шаг?";
      }

      setChatMessages(prev => [...prev, {
        sender: 'volunteer',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speak(replyText);
    }, 2000);
  };

  // Add Diary Entry
  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryText.trim() || !diaryLessonId) return;

    const matchedLesson = ELDERLY_LESSONS.find(l => l.id === diaryLessonId);
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      lessonId: diaryLessonId,
      lessonTitle: matchedLesson ? matchedLesson.title : 'Урок',
      text: diaryText,
      date: new Date().toLocaleDateString('ru-RU'),
      photo: diaryPhoto || undefined
    };

    const nextDiary = [...(elderlyProfile.diaryEntries || []), newEntry];
    onUpdateProfile({
      elderlyProfile: {
        ...elderlyProfile,
        diaryEntries: nextDiary
      }
    });

    setDiaryText('');
    setDiaryLessonId('');
    setDiaryPhoto(null);
    speak("Запись успешно внесена в ваш дневник достижений!");
  };

  // Delete diary entry
  const handleDeleteDiary = (id: string) => {
    const nextDiary = (elderlyProfile.diaryEntries || []).filter(item => item.id !== id);
    onUpdateProfile({
      elderlyProfile: {
        ...elderlyProfile,
        diaryEntries: nextDiary
      }
    });
  };

  return (
    <div className={`p-4 sm:p-6 space-y-6 ${highContrast ? 'bg-yellow-50/20' : 'bg-slate-50/30'}`}>
      
      {/* ACCESS ACCESSIBILITY TOOLBAR */}
      <div className={`${cardStyle} p-4 rounded-3xl flex flex-wrap gap-4 items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">👓</span>
          <div>
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Настройки удобства экрана:</h4>
            <p className="text-xs text-slate-500">Сделайте шрифт больше или включите голос-подсказку</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Font Size Selector */}
          <div className="flex items-center bg-slate-150 p-1.5 rounded-2xl border border-slate-200">
            <span className="text-xs font-black px-2 text-slate-600">Шрифт:</span>
            {[18, 22, 26].map(sz => (
              <button
                key={sz}
                onClick={() => handleUpdateSettings('fontSize', sz)}
                className={`px-3 py-1 text-xs font-black rounded-xl transition-all ${
                  fontSize === sz 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sz === 18 ? 'А' : sz === 22 ? 'А+' : 'А++'}
              </button>
            ))}
          </div>

          {/* Voice Guidance Toggle */}
          <button
            onClick={() => handleUpdateSettings('voiceGuidance', !voiceGuidance)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-2xl border transition-all ${
              voiceGuidance 
                ? 'bg-amber-600 text-white border-amber-500 shadow-xs animate-pulse' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {voiceGuidance ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {voiceGuidance ? 'Голос ВКЛ' : 'Голос ВЫКЛ'}
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => handleUpdateSettings('highContrast', !highContrast)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-2xl border transition-all ${
              highContrast 
                ? 'bg-black text-white border-black shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sliders size={16} />
            {highContrast ? 'Контраст: ВЫСОКИЙ' : 'Контраст: ОБЫЧНЫЙ'}
          </button>
        </div>
      </div>

      {/* TOP USER STATE & PROGRESS */}
      <div className={`${accentCardStyle} p-6 rounded-3xl space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">👵</span>
            <div>
              <h2 className={`${getFSize('title')} text-slate-900`}>
                Здравствуйте, {elderlyProfile.fullName}!
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="px-3.5 py-1 bg-amber-500 text-white text-xs font-extrabold rounded-full shadow-xs">
                  🌱 Ваш уровень: {LEVELS.find(l => l.id === currentLevel)?.name || 'Ученик'}
                </span>
                <span className="px-3 py-0.5 bg-white text-emerald-800 border border-emerald-300 text-xs font-black rounded-full flex items-center gap-1">
                  ⭐ Набрано звезд: {elderlyProfile.stars}
                </span>
                <span className="px-3 py-0.5 bg-white text-rose-800 border border-rose-300 text-xs font-black rounded-full flex items-center gap-1">
                  🏆 Наград: {elderlyProfile.achievements.length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick progress circle info */}
          <div className="flex items-center gap-4 bg-white/75 p-4 rounded-2xl border border-amber-200/50">
            <div className="relative w-12 h-12 flex items-center justify-center font-black text-base text-slate-800 bg-amber-100 rounded-full">
              {elderlyProfile.completedLessons.length} / 20
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-amber-900 tracking-wide">Учебный прогресс</p>
              <p className="text-xs text-slate-600 font-bold">Пройдено уроков: {elderlyProfile.completedLessons.length} из 20</p>
            </div>
          </div>
        </div>

        {/* ADVICE OF THE DAY */}
        <div className="bg-white p-4 rounded-2xl border border-amber-150 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">Совет дня для Марии Ивановны:</span>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">
              "Никогда не бойтесь нажимать кнопки на телефоне! Телефон невозможно сломать нажатием. Если запутались — просто нажмите круглую кнопку внизу экрана, чтобы начать сначала."
            </p>
          </div>
        </div>

        {/* QUICK GRANDCHILD CONTACT BAR */}
        <div className="space-y-2 pt-2">
          <h5 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1">
            <Phone size={14} /> Кнопка быстрого звонка близким (один клик):
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {elderlyProfile.phoneContacts.map((contact, idx) => (
              <button
                key={idx}
                onClick={() => triggerSpeedDial(contact)}
                className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-2xl flex items-center gap-2.5 transition-all text-left shadow-xs active:scale-95"
              >
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-lg shrink-0 font-bold">
                  {contact.role === 'grandson' ? '👦' : contact.role === 'granddaughter' ? '👧' : '👵'}
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black text-slate-800 truncate leading-tight">{contact.name}</span>
                  <span className="block text-[10px] text-slate-400 font-bold leading-none mt-1">Звонок за секунду</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1">
        {[
          { id: 'lessons', label: '📖 Уроки', icon: BookOpen },
          { id: 'diary', label: '📝 Дневник', icon: Trophy },
          { id: 'achievements', label: '🏆 Награды', icon: Trophy },
          { id: 'chat', label: '💬 Чат с волонтером', icon: MessageSquare },
          { id: 'info', label: '❓ Помощь & Чаво', icon: HelpCircle }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                speak("Открываю раздел " + tab.label);
              }}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-1.5 sm:px-3 text-xs font-black rounded-xl transition-all ${
                isSelected 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN TAB PANELS */}
      <div className="space-y-6">
        
        {/* TAB 1: LESSONS LIST */}
        {activeTab === 'lessons' && !selectedLesson && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`${getFSize('title')} text-slate-800`}>📖 Выберите тему обучения:</h3>
              <span className="text-xs font-bold text-slate-500">Уроков пройдено: {elderlyProfile.completedLessons.length} / 20</span>
            </div>

            {/* Group lessons by Levels */}
            {[1, 2, 3, 4, 5].map(lvlIdx => {
              const lvlInfo = LEVELS.find(l => l.id === lvlIdx);
              const lvlLessons = ELDERLY_LESSONS.filter(l => l.level === lvlIdx);
              
              return (
                <div key={lvlIdx} className="space-y-3">
                  <div className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">{lvlInfo?.badge}</h4>
                      <p className="text-xs text-slate-500">{lvlInfo?.desc}</p>
                    </div>
                    {elderlyProfile.level >= lvlIdx ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">Доступно</span>
                    ) : (
                      <span className="text-xs bg-slate-200 text-slate-500 font-bold px-2.5 py-1 rounded-full border border-slate-300">Заблокировано</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lvlLessons.map((lesson) => {
                      const isCompleted = elderlyProfile.completedLessons.includes(lesson.id);
                      const isLocked = elderlyProfile.level < lesson.level;

                      return (
                        <div
                          key={lesson.id}
                          className={`${cardStyle} p-5 rounded-3xl flex flex-col justify-between gap-4 transition-all ${
                            isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-101'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className={`${getFSize('body')} leading-snug`}>
                                {lesson.title}
                              </h5>
                              {isCompleted && (
                                <span className="p-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-black">
                                  ✓ Пройден
                                </span>
                              )}
                            </div>
                            <p className={`${getFSize('small')} text-slate-500 line-clamp-2`}>
                              {lesson.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1">
                              ⭐ Награда: {lesson.rewardStars} звёзд
                            </span>
                            <button
                              disabled={isLocked}
                              onClick={() => startLesson(lesson)}
                              className={`text-xs font-black px-4 py-2.5 uppercase tracking-wide rounded-xl transition-all ${
                                isLocked 
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                  : isCompleted 
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' 
                                    : buttonPrimary
                              }`}
                            >
                              {isCompleted ? 'Повторить урок' : 'Начать обучение'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP-BY-STEP LESSON WINDOW */}
        {activeTab === 'lessons' && selectedLesson && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left side: Guide and text instructions */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
              
              <div className="space-y-4">
                {/* Back button */}
                <button
                  onClick={() => {
                    setSelectedLesson(null);
                    speak("Возвращаюсь к темам уроков");
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-800 uppercase tracking-wide"
                >
                  <ArrowLeft size={16} /> Назад к темам
                </button>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800">Урок {selectedLesson.id.split('_')[1]}</span>
                  <h4 className="text-lg font-black text-slate-900 leading-tight">{selectedLesson.title}</h4>
                </div>

                {/* Progress in steps */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Шаг {activeStepIdx + 1} из {selectedLesson.steps.length}</span>
                    <span>Пройдено {Math.round(((activeStepIdx) / selectedLesson.steps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300" 
                      style={{ width: `${((activeStepIdx + 1) / selectedLesson.steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Actual instructions with big font support */}
                <div className={`${accentCardStyle} p-5 rounded-2xl space-y-3`}>
                  <p className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                    📖 ЗАДАНИЕ ДЛЯ ВАС:
                  </p>
                  <p className={`${getFSize('body')} leading-relaxed`}>
                    {selectedLesson.steps[activeStepIdx]?.instruction}
                  </p>
                </div>

                {/* Simulated Audio Prompt Player */}
                <div className="bg-slate-50 p-4 rounded-2xl border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-full">
                      <Volume2 size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-700 block uppercase">Аудио-подсказка:</span>
                      <p className="text-[11px] text-slate-500 font-semibold">Голос зачитывает шаги медленно и вслух</p>
                    </div>
                  </div>
                  <button
                    onClick={() => speak(selectedLesson.steps[activeStepIdx]?.voiceText)}
                    className="p-3 bg-white text-emerald-700 border hover:bg-emerald-50 rounded-xl font-bold text-xs uppercase flex items-center gap-1 shadow-xs transition-all active:scale-95"
                  >
                    <RotateCcw size={14} /> Повторить озвучку
                  </button>
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="pt-4 border-t flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (activeStepIdx > 0) setActiveStepIdx(activeStepIdx - 1);
                  }}
                  disabled={activeStepIdx === 0}
                  className={`flex-1 text-center py-3 rounded-xl font-bold text-xs uppercase transition-all ${
                    activeStepIdx === 0 
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Предыдущий шаг
                </button>
                <button
                  onClick={handleNextStep}
                  className={`flex-1 text-center py-3 font-black text-xs uppercase transition-all ${buttonPrimary}`}
                >
                  {activeStepIdx === selectedLesson.steps.length - 1 ? 'Завершить урок 🎉' : 'Следующий шаг ➡️'}
                </button>
              </div>
            </div>

            {/* Right side: Interactive device simulator */}
            <div className="lg:col-span-7 bg-slate-900 rounded-4xl border-8 border-slate-800 p-4 flex flex-col items-center justify-center min-h-[500px] relative shadow-xl overflow-hidden">
              
              {/* TOP STATUS BAR OF SIM PHONE */}
              <div className="w-full max-w-[320px] flex justify-between items-center text-[10px] text-slate-400 px-3 py-1 font-mono tracking-wider bg-slate-850 rounded-t-xl">
                <span>09:41</span>
                <span>ВЗАИМОПОМОЩЬ</span>
                <div className="flex items-center gap-1 font-sans">
                  <span>📶 5G</span>
                  <span>🔋 88%</span>
                </div>
              </div>

              {/* SCREEN STAGE OF SIMULATOR */}
              <div className="w-full max-w-[320px] h-[460px] bg-sky-100 rounded-b-xl relative overflow-hidden shadow-inner flex flex-col justify-between">
                
                {/* 1. POWER SIMULATOR */}
                {selectedLesson.steps[activeStepIdx]?.simulationType === 'power' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center space-y-6">
                    {simPowerOn ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        <span className="text-5xl block animate-bounce">📱</span>
                        <h4 className="text-xl font-extrabold text-emerald-400">Смартфон ЗАПУЩЕН!</h4>
                        <p className="text-xs text-slate-300">"Добро пожаловать в Устьяны. Телефон готов к работе!"</p>
                        <div className="p-2.5 bg-emerald-600/30 border border-emerald-400 rounded-xl text-[11px] font-bold">
                          ✓ Задание шага 1 выполнено! Нажмите кнопку далее слева.
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                          <span className="absolute -right-12 top-5 text-amber-400 text-xs font-black animate-pulse">← НАЖМИ!</span>
                          <button
                            onClick={() => {
                              setSimPowerOn(true);
                              speak("Ура! Телефон включился.");
                            }}
                            className="w-12 h-12 bg-red-600 rounded-full hover:bg-red-700 active:scale-95 flex items-center justify-center font-bold text-white text-xs border border-red-400 shadow-sm transition-all"
                          >
                            ВКЛ
                          </button>
                        </div>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Экран выключен</h4>
                        <p className="text-xs text-slate-500">Нажмите круглую красную кнопку Кнопки Питания сбоку, чтобы запустить телефон.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CHARGER SIMULATOR */}
                {selectedLesson.steps[activeStepIdx]?.simulationType === 'charger' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-between p-4 bg-slate-900 text-white text-center">
                    <div className="space-y-2 mt-4">
                      <span className="text-4xl block">📱</span>
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Батарея разряжена</h4>
                    </div>

                    <div className="w-full max-w-[200px] bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-4">
                      {simChargerConnected ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2 text-center"
                        >
                          <div className="text-4xl font-black text-emerald-400 animate-pulse">🔋 85%</div>
                          <span className="text-xs font-extrabold text-emerald-400">ИДЕТ ЗАРЯДКА...</span>
                          <p className="text-[10px] text-slate-400">Провод успешно подключен к разъему!</p>
                        </motion.div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-4xl font-bold text-red-500">🪫 2%</div>
                          <p className="text-[10px] text-slate-300">Нажмите на шнур зарядного устройства внизу, чтобы вставить его в телефон.</p>
                        </div>
                      )}
                    </div>

                    {/* Charger cord representation */}
                    <div className="w-full pb-4 flex flex-col items-center">
                      {!simChargerConnected && (
                        <button
                          onClick={() => {
                            setSimChargerConnected(true);
                            speak("Отлично! Зарядное устройство подключено. Батарея заряжается.");
                          }}
                          className="py-2.5 px-6 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-black font-black text-xs uppercase rounded-full shadow-md animate-bounce"
                        >
                          🔌 Вставить шнур зарядки
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. BUTTONS SIMULATOR */}
                {selectedLesson.steps[activeStepIdx]?.simulationType === 'buttons' && (
                  <div className="absolute inset-0 flex flex-col justify-between bg-sky-100 p-4">
                    <div className="p-4 bg-white/90 border border-slate-200 rounded-2xl text-center space-y-2 mt-8">
                      <h4 className="text-sm font-black text-slate-800">Экран телефона</h4>
                      <p className="text-xs text-slate-500">
                        {selectedLesson.steps[activeStepIdx]?.simulationData?.target === 'home' 
                          ? 'Нажмите на кнопку КРУГ в самом низу экрана, чтобы выполнить задание.' 
                          : 'Нажмите на кнопку СТРЕЛОЧКА в самом низу экрана.'}
                      </p>
                    </div>

                    {simRecentTapped ? (
                      <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold text-center">
                        ✓ Кнопка нажата успешно! Нажмите далее слева.
                      </div>
                    ) : null}

                    <div className="w-full" />
                  </div>
                )}

                {/* 4. CALL SIMULATOR */}
                {selectedLesson.steps[activeStepIdx]?.simulationType === 'call' && (
                  <div className="absolute inset-0 flex flex-col justify-between bg-slate-50">
                    
                    {/* Simulator state - open phone app */}
                    {simCallStep === 'closed' && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Главный экран</span>
                        
                        <button
                          onClick={() => {
                            setSimCallStep('opened');
                            speak("Приложение контактов открыто");
                          }}
                          className="w-16 h-16 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md active:scale-95 border-2 border-emerald-400 animate-bounce"
                        >
                          <Phone size={28} />
                        </button>
                        <span className="text-xs font-black text-slate-700">Телефон</span>
                      </div>
                    )}

                    {/* Contacts list */}
                    {simCallStep === 'opened' && (
                      <div className="flex-1 flex flex-col bg-white">
                        <div className="p-3 bg-slate-150 border-b font-black text-xs text-slate-700 text-center uppercase">Контакты</div>
                        <div className="p-2 space-y-1.5">
                          {elderlyProfile.phoneContacts.map((contact, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (contact.name.includes('Сережа')) {
                                  setSimCallStep('ringing');
                                  speak("Звонок внуку Сереже запущен");
                                } else {
                                  speak("Нажмите на имя Внук Сережа, чтобы выполнить шаг урока");
                                }
                              }}
                              className={`w-full p-2.5 text-left flex items-center gap-3 rounded-xl border transition-all ${
                                contact.name.includes('Сережа') 
                                  ? 'border-amber-400 bg-amber-50 animate-pulse' 
                                  : 'border-slate-100 bg-slate-50'
                              }`}
                            >
                              <span className="text-xl">👦</span>
                              <div>
                                <span className="text-xs font-black text-slate-800 block">{contact.name}</span>
                                <span className="text-[10px] text-slate-400">{contact.phone}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ringing stage */}
                    {simCallStep === 'ringing' && (
                      <div className="flex-1 flex flex-col items-center justify-between bg-slate-900 text-white p-6 text-center">
                        <div className="space-y-2 mt-4">
                          <span className="text-5xl block animate-pulse">👦</span>
                          <h4 className="text-lg font-black">Внук Сережа</h4>
                          <p className="text-xs text-slate-400">Нажмите ЗЕЛЕНУЮ ТРУБКУ ниже, чтобы пошел вызов</p>
                        </div>

                        <div className="flex justify-center mb-8">
                          <button
                            onClick={() => {
                              setSimCallStep('connected');
                              speak("Привет, бабушка! Как здорово, что ты сама научилась звонить!");
                            }}
                            className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 active:scale-90 animate-bounce"
                          >
                            <Phone size={24} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Connected talking stage */}
                    {simCallStep === 'connected' && (
                      <div className="flex-1 flex flex-col items-center justify-between bg-emerald-950 text-white p-6 text-center">
                        <div className="space-y-2 mt-4">
                          <span className="text-6xl block animate-bounce">👦</span>
                          <h4 className="text-lg font-black">Внук Сережа</h4>
                          <span className="text-xs text-emerald-400 font-extrabold animate-pulse">РАЗГОВОР... 00:15</span>
                        </div>

                        <div className="bg-white/10 p-4 rounded-xl text-xs sm:text-sm text-emerald-100 italic">
                          "Бабушка, привет! Умница, что позвонила по смартфону! Рад слышать твой голос."
                        </div>

                        <button
                          onClick={() => {
                            setSimCallStep('closed');
                            speak("Вы успешно научились звонить!");
                          }}
                          className="py-3 px-6 bg-red-600 hover:bg-red-750 text-white text-xs font-black uppercase rounded-2xl"
                        >
                          Положить трубку 🛑
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* 5. SMS SIMULATOR */}
                {selectedLesson.steps[activeStepIdx]?.simulationType === 'sms' && (
                  <div className="absolute inset-0 flex flex-col justify-between bg-white">
                    {simSmsStep === 'closed' && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4">
                        <button
                          onClick={() => {
                            setSimSmsStep('opened');
                            speak("Открыт чат СМС");
                          }}
                          className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md animate-bounce border-2 border-blue-400"
                        >
                          <Send size={28} />
                        </button>
                        <span className="text-xs font-black text-slate-700">Сообщения</span>
                      </div>
                    )}

                    {simSmsStep === 'opened' && (
                      <div className="flex-1 flex flex-col justify-between p-2">
                        <div className="p-2 border-b bg-slate-50 text-center text-xs font-black text-slate-700">Внук Сережа</div>
                        
                        <div className="flex-1 flex flex-col justify-end space-y-2 p-2">
                          <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-slate-700 max-w-[80%] self-start font-medium">
                            Привет, бабушка!
                          </div>
                        </div>

                        {/* Input bar */}
                        <div className="border-t pt-2 flex gap-1 items-center">
                          <button
                            onClick={() => {
                              setSimSmsStep('draft');
                              setSimSmsText('Привет! Я учусь!');
                              speak("Текст набран");
                            }}
                            className="flex-1 py-2 px-3 bg-amber-50 text-slate-700 text-xs font-black rounded-lg border border-amber-300 text-left animate-pulse"
                          >
                            ✏️ Набрать: "Привет! Я учусь!"
                          </button>
                        </div>
                      </div>
                    )}

                    {simSmsStep === 'draft' && (
                      <div className="flex-1 flex flex-col justify-between p-2">
                        <div className="p-2 border-b bg-slate-50 text-center text-xs font-black text-slate-700">Внук Сережа</div>
                        <div className="flex-1" />

                        <div className="p-2 border-t space-y-2">
                          <div className="bg-slate-50 p-2 border rounded-xl text-xs text-slate-800 italic">
                            {simSmsText}
                          </div>
                          <button
                            onClick={() => {
                              setSimSmsStep('sent');
                              speak("Сообщение отправлено");
                            }}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase text-center flex items-center justify-center gap-1.5"
                          >
                            <Send size={14} /> Отправить СМС
                          </button>
                        </div>
                      </div>
                    )}

                    {simSmsStep === 'sent' && (
                      <div className="flex-1 flex flex-col justify-between p-2">
                        <div className="p-2 border-b bg-slate-50 text-center text-xs font-black text-slate-700">Внук Сережа</div>
                        <div className="flex-1 flex flex-col justify-end space-y-2 p-2">
                          <div className="p-2.5 bg-blue-500 text-white rounded-xl text-xs max-w-[80%] self-end font-bold animate-fadeIn">
                            {simSmsText}
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-50 border text-center text-emerald-800 text-xs font-black rounded-xl">
                          ✓ СМС отправлено! Нажмите далее слева.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. CAMERA SIMULATOR */}
                {selectedLesson.steps[activeStepIdx]?.simulationType === 'camera' && (
                  <div className="absolute inset-0 flex flex-col justify-between bg-black text-white">
                    {simCameraStep === 'closed' && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <button
                          onClick={() => {
                            setSimCameraStep('opened');
                            speak("Камера запущена");
                          }}
                          className="w-16 h-16 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center border-4 border-slate-500 shadow-md animate-bounce"
                        >
                          <ImageIcon size={28} />
                        </button>
                        <span className="text-xs font-bold">Камера</span>
                      </div>
                    )}

                    {simCameraStep === 'opened' && (
                      <div className="flex-1 flex flex-col justify-between relative">
                        {/* Viewfinder simulation */}
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&auto=format&fit=crop&q=60")' }} />
                        
                        <div className="z-10 bg-black/40 p-2 text-center text-[10px] uppercase font-black tracking-wider">Красивая река Вага в Березнике</div>
                        <div className="z-10" />

                        {/* Controls */}
                        <div className="z-10 bg-black/80 p-4 flex justify-center items-center">
                          <button
                            onClick={() => {
                              setSimCameraStep('captured');
                              setSimCapturedPhoto('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&auto=format&fit=crop&q=60');
                              speak("Вспышка! Фотография сделана.");
                            }}
                            className="w-14 h-14 bg-white hover:bg-slate-200 border-4 border-slate-400 rounded-full shadow-lg active:scale-90"
                          />
                        </div>
                      </div>
                    )}

                    {simCameraStep === 'captured' && (
                      <div className="flex-1 flex flex-col justify-between p-3 bg-slate-900">
                        <span className="text-xs text-slate-400 text-center font-bold uppercase">Снимок сохранен в Галерею!</span>
                        
                        <div className="w-full h-[240px] bg-cover bg-center rounded-xl border-2 border-white/20 my-2" style={{ backgroundImage: `url(${simCapturedPhoto})` }} />

                        <div className="p-3 bg-emerald-600/20 border border-emerald-500 rounded-xl text-xs text-emerald-400 font-black text-center">
                          ✓ Фото сделано! Нажмите далее слева.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. SEND PHOTO SIMULATOR */}
                {selectedLesson.steps[activeStepIdx]?.simulationType === 'send_photo' && (
                  <div className="absolute inset-0 flex flex-col justify-between bg-white">
                    {simPhotoSendStep === 'closed' && (
                      <div className="flex-1 flex flex-col justify-between p-2">
                        <div className="p-2 border-b bg-slate-50 text-center text-xs font-black">Чат с Сережей</div>
                        <div className="flex-1" />
                        <div className="p-2 border-t flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSimPhotoSendStep('opened');
                              speak("Выберите фотографию");
                            }}
                            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center font-black text-xl text-slate-600 animate-pulse border border-dashed border-slate-400"
                          >
                            +
                          </button>
                          <span className="text-xs text-slate-400 font-bold flex-1 ml-3">Нажмите ПЛЮС внизу, чтобы прикрепить фото</span>
                        </div>
                      </div>
                    )}

                    {simPhotoSendStep === 'opened' && (
                      <div className="flex-1 flex flex-col p-3 justify-between bg-slate-50">
                        <span className="text-xs font-black text-slate-600 block text-center mb-2">Выберите фото из галереи:</span>
                        
                        <button
                          onClick={() => {
                            setSimPhotoSendStep('attached');
                            speak("Фотография выбрана. Нажмите зеленую стрелку.");
                          }}
                          className="w-full h-[180px] bg-cover bg-center rounded-xl border-4 border-amber-400 hover:scale-102 transition-all"
                          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&auto=format&fit=crop&q=60")' }}
                        />

                        <span className="text-[10px] text-slate-400 text-center mt-2">Нажмите на миниатюру реки Вага выше</span>
                      </div>
                    )}

                    {simPhotoSendStep === 'attached' && (
                      <div className="flex-1 flex flex-col justify-between p-2">
                        <div className="p-2 border-b bg-slate-50 text-center text-xs font-black">Чат с Сережей</div>
                        
                        <div className="p-3 bg-slate-100 rounded-2xl max-w-[80%] mx-auto my-2 space-y-2">
                          <div className="w-full h-24 bg-cover bg-center rounded-lg" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&auto=format&fit=crop&q=60")' }} />
                          <span className="text-[10px] text-slate-500 block text-center">Прикрепленный снимок</span>
                        </div>

                        <button
                          onClick={() => {
                            setSimPhotoSendStep('sent');
                            speak("Фото успешно отправлено внуку!");
                          }}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-sm animate-bounce"
                        >
                          <Send size={14} /> Отправить внуку
                        </button>
                      </div>
                    )}

                    {simPhotoSendStep === 'sent' && (
                      <div className="flex-1 flex flex-col justify-between p-2">
                        <div className="p-2 border-b bg-slate-50 text-center text-xs font-black">Чат с Сережей</div>
                        <div className="flex-1 flex flex-col justify-end p-2 items-end">
                          <div className="p-2 bg-emerald-500 rounded-xl max-w-[70%] text-right space-y-1.5 shadow-xs border border-emerald-400">
                            <div className="w-32 h-20 bg-cover bg-center rounded-md" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&auto=format&fit=crop&q=60")' }} />
                            <span className="text-[10px] text-emerald-100 block font-bold">✓ Отправлено</span>
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-50 text-center text-emerald-800 text-xs font-black rounded-xl">
                          ✓ Фото успешно отправлено! Нажмите далее слева.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 8. INSTALL APP STORE SIMULATOR */}
                {selectedLesson.steps[activeStepIdx]?.simulationType === 'install' && (
                  <div className="absolute inset-0 flex flex-col justify-between bg-slate-900 text-white">
                    {simInstallStep === 'closed' && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <button
                          onClick={() => {
                            setSimInstallStep('opened');
                            speak("Магазин приложений открыт");
                          }}
                          className="w-16 h-16 bg-gradient-to-tr from-cyan-400 via-emerald-400 to-yellow-400 rounded-2xl flex items-center justify-center text-white border-2 border-white/20 animate-bounce"
                        >
                          <span className="text-2xl font-black">▲</span>
                        </button>
                        <span className="text-xs font-black text-slate-300">Play Маркет</span>
                      </div>
                    )}

                    {simInstallStep === 'opened' && (
                      <div className="flex-1 flex flex-col justify-between p-3 bg-slate-800">
                        <div className="p-2 bg-slate-700 hover:bg-slate-650 rounded-xl flex items-center justify-between text-xs text-slate-300 font-bold border border-slate-600 animate-pulse">
                          <span>В поисках...</span>
                          <button
                            onClick={() => {
                              setSimInstallStep('searching');
                              speak("Приложение Взаимопомощь найдено");
                            }}
                            className="px-2.5 py-1 bg-yellow-500 text-black rounded-lg text-[10px] font-black uppercase"
                          >
                            Искать
                          </button>
                        </div>
                        <div className="flex-1" />
                        <span className="text-[10px] text-slate-400 text-center mb-4">Нажмите желтую кнопку Искать выше</span>
                      </div>
                    )}

                    {simInstallStep === 'searching' && (
                      <div className="flex-1 flex flex-col justify-between p-3 bg-slate-800 text-slate-200">
                        <div className="p-3 bg-slate-700 rounded-2xl border border-slate-600 flex items-center gap-3">
                          <span className="text-3xl">🌿</span>
                          <div>
                            <h5 className="text-xs font-black text-white">Взаимопомощь Устьяны</h5>
                            <p className="text-[9px] text-slate-400">Соседская поддержка района</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSimInstallStep('installing');
                            speak("Устанавливаю приложение");
                            setTimeout(() => {
                              setSimInstallStep('ready');
                              speak("Приложение установлено!");
                            }, 3000);
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-xl shadow-md animate-bounce"
                        >
                          Установить 📱
                        </button>
                      </div>
                    )}

                    {simInstallStep === 'installing' && (
                      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-800 space-y-4">
                        <span className="text-xs font-black text-slate-300">Установка приложения...</span>
                        <div className="w-full max-w-[180px] bg-slate-700 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2.8 }}
                            className="bg-emerald-500 h-full"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">Загрузка модулей экологии и такси</span>
                      </div>
                    )}

                    {simInstallStep === 'ready' && (
                      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-800 space-y-4 text-center">
                        <span className="text-5xl block animate-bounce">🎉</span>
                        <h5 className="text-sm font-black text-emerald-400">Приложение успешно установлено!</h5>
                        <p className="text-xs text-slate-300">"Взаимопомощь Устьяны" теперь доступна на вашем экране.</p>
                        
                        <div className="p-3 bg-emerald-600/20 border border-emerald-500 text-emerald-400 text-xs font-black rounded-xl">
                          ✓ Урок завершен! Нажмите далее слева.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 9. OTHER GENERIC SIMULATORS MAPPED ON THE FLY */}
                {!['power', 'charger', 'buttons', 'call', 'sms', 'camera', 'send_photo', 'install'].includes(selectedLesson.steps[activeStepIdx]?.simulationType || '') && (
                  <div className="absolute inset-0 flex flex-col justify-between bg-slate-900 text-white p-4">
                    
                    {/* PC POWER SIMULATOR */}
                    {selectedLesson.steps[activeStepIdx]?.simulationType === 'pc_power' && (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="relative p-6 bg-slate-800 border-2 border-slate-700 rounded-3xl w-44 mx-auto shadow-md">
                          {simPcPower ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                              <span className="text-3xl block animate-bounce">🖥️</span>
                              <span className="text-xs font-black text-emerald-400 uppercase">ПК запущен!</span>
                              <span className="block text-[9px] text-slate-400">Загрузка системы Устьяны-ОС...</span>
                            </motion.div>
                          ) : (
                            <div className="space-y-4">
                              <span className="text-3xl block">⚙️</span>
                              <button
                                onClick={() => {
                                  setSimPcPower(true);
                                  speak("Гудение пошло. Компьютер запустился.");
                                }}
                                className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-400 rounded-full flex items-center justify-center text-white font-black text-xs animate-pulse"
                              >
                                ВКЛ
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">Нажмите круглую зеленую кнопку ВКЛ на системном блоке выше</span>
                      </div>
                    )}

                    {/* MOUSE TRAINING SIMULATOR */}
                    {selectedLesson.steps[activeStepIdx]?.simulationType === 'mouse' && (
                      <div className="flex-1 flex flex-col justify-between text-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Поймайте бабочек (Клик мыши):</span>
                        
                        <div className="flex-1 relative bg-cover bg-center rounded-xl overflow-hidden my-2" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=60")' }}>
                          {simMouseClicks >= 3 ? (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4">
                              <span className="text-4xl block">🦋</span>
                              <h5 className="text-xs font-black text-emerald-400">Ура! Все три бабочки пойманы!</h5>
                              <p className="text-[10px] text-slate-300 mt-1">Вы отлично управляете компьютерной мышью.</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSimMouseClicks(prev => prev + 1);
                                speak("Бабочка поймана!");
                              }}
                              className="absolute bg-white/80 hover:bg-yellow-100 p-2 border border-amber-400 rounded-full shadow-md text-xs font-black animate-bounce flex items-center gap-1"
                              style={{
                                top: simMouseClicks === 0 ? '20%' : simMouseClicks === 1 ? '50%' : '35%',
                                left: simMouseClicks === 0 ? '15%' : simMouseClicks === 1 ? '60%' : '35%'
                              }}
                            >
                              🦋 Кликни меня!
                            </button>
                          )}
                        </div>

                        <span className="text-xs text-slate-400">Осталось поймать бабочек: {3 - simMouseClicks > 0 ? 3 - simMouseClicks : 0}</span>
                      </div>
                    )}

                    {/* KEYBOARD TRAINING SIMULATOR */}
                    {selectedLesson.steps[activeStepIdx]?.simulationType === 'keyboard' && (
                      <div className="flex-1 flex flex-col justify-between">
                        <span className="text-xs text-slate-400 text-center uppercase tracking-wider mt-2">Компьютерный экран</span>
                        
                        <div className="p-3 bg-slate-800 border-2 border-slate-700 rounded-xl my-3 text-center min-h-[60px] flex items-center justify-center">
                          <span className="text-lg font-mono font-black text-yellow-400 tracking-widest uppercase">
                            {simKeyboardText || '—'}
                          </span>
                        </div>

                        {simKeyboardText === 'УСТЬЯНЫ' ? (
                          <div className="p-2.5 bg-emerald-600/20 border border-emerald-500 rounded-xl text-center text-xs font-black text-emerald-400">
                            ✓ Слово набрано успешно! Жмите далее.
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-1 pb-4">
                            {['У', 'С', 'Т', 'Ь', 'Я', 'Н', 'Ы', '❌'].map((char) => (
                              <button
                                key={char}
                                onClick={() => {
                                  if (char === '❌') {
                                    setSimKeyboardText('');
                                  } else {
                                    const nextText = simKeyboardText + char;
                                    if ('УСТЬЯНЫ'.startsWith(nextText)) {
                                      setSimKeyboardText(nextText);
                                      speak(char);
                                    } else {
                                      speak("Эта буква не подходит, попробуйте другую");
                                    }
                                  }
                                }}
                                className="p-2 bg-slate-700 hover:bg-slate-600 text-xs font-black uppercase text-center rounded-lg border border-slate-600 active:scale-90"
                              >
                                {char}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* NEWS / MAPS / SHOP / BANK / SECURITY / ETC SIMULATORS */}
                    {selectedLesson.steps[activeStepIdx]?.simulationType === 'security' && (
                      <div className="flex-1 flex flex-col justify-between p-3 text-center bg-slate-950 text-white">
                        {simSecurityRinging && (
                          <div className="space-y-6 mt-8">
                            <span className="text-5xl block animate-bounce">🚨</span>
                            <div className="space-y-1">
                              <h4 className="text-base font-black text-red-500 uppercase tracking-wider">Звонок от: Мошенники</h4>
                              <p className="text-xs text-slate-400">"Служба безопасности банка!"</p>
                            </div>

                            <button
                              onClick={() => {
                                setSimSecurityRinging(false);
                                setSimSecurityResult('success');
                                speak("Правильно! Звонок сброшен. Мошенникам вас не обмануть!");
                              }}
                              className="w-full py-4 bg-red-600 hover:bg-red-700 text-xs font-black uppercase rounded-2xl border-2 border-red-500 shadow-md animate-pulse"
                            >
                              ❌ Сбросить и заблокировать!
                            </button>
                          </div>
                        )}

                        {simSecurityResult === 'success' && (
                          <div className="space-y-4 my-auto p-4 bg-emerald-950 border border-emerald-800 rounded-3xl">
                            <span className="text-5xl block">🛡️</span>
                            <h4 className="text-sm font-black text-emerald-400 uppercase">ОТЛИЧНЫЙ ВЫБОР!</h4>
                            <p className="text-xs text-slate-300">
                              Никогда не разговаривайте по телефону с подозрительными людьми. Сразу вешайте трубку!
                            </p>
                            <span className="block text-[10px] text-emerald-300 font-extrabold mt-2">✓ Урок пройден! Жмите далее.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* RETAIL / BANK / ALL OTHERS FALLBACK SIMULATOR DISPLAY */}
                    {!['pc_power', 'mouse', 'keyboard', 'security'].includes(selectedLesson.steps[activeStepIdx]?.simulationType || '') && (
                      <div className="flex-1 flex flex-col justify-between items-center text-center p-4">
                        <span className="text-5xl block animate-bounce">🎓</span>
                        <h4 className="text-sm font-black text-yellow-400 uppercase tracking-widest mt-4">Практический тренажёр</h4>
                        <p className="text-xs text-slate-300 mt-2">
                          Вы успешно усвоили теоретическую часть шага и пошаговые инструкции!
                        </p>
                        
                        <button
                          onClick={handleNextStep}
                          className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-full shadow-md"
                        >
                          Подтвердить и продолжить ✓
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* SIM HOME BAR */}
                <div className="w-full bg-slate-850 p-2 flex justify-around items-center border-t border-slate-700 rounded-b-xl">
                  {/* Back */}
                  <button 
                    onClick={() => {
                      setSimRecentTapped('back');
                      speak("Возврат");
                      setTimeout(() => setSimRecentTapped(null), 1000);
                    }} 
                    className="text-xs text-slate-500 font-bold hover:text-white"
                  >
                    ◀
                  </button>
                  {/* Home */}
                  <button 
                    onClick={() => {
                      setSimRecentTapped('home');
                      speak("Главный экран");
                      setTimeout(() => setSimRecentTapped(null), 1000);
                    }} 
                    className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full hover:bg-slate-750 flex items-center justify-center shadow-inner"
                  >
                    <div className="w-4 h-4 bg-slate-600 rounded-full" />
                  </button>
                  {/* Menu */}
                  <button 
                    onClick={() => {
                      setSimRecentTapped('menu');
                      speak("Меню программ");
                      setTimeout(() => setSimRecentTapped(null), 1000);
                    }} 
                    className="text-xs text-slate-500 font-bold hover:text-white"
                  >
                    ◼
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ACHIEVEMENTS DIARY */}
        {activeTab === 'diary' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Diary Writer Form */}
            <form onSubmit={handleAddDiary} className="md:col-span-5 bg-white p-5 rounded-3xl border space-y-4">
              <h4 className={`${getFSize('title')} text-slate-800`}>📝 Записать в дневник:</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Записывайте ваши успехи, мысли и то, чему вы научились сегодня. Это поможет вам лучше запомнить материал!
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase">О каком уроке пишем?</label>
                <select
                  required
                  value={diaryLessonId}
                  onChange={(e) => setDiaryLessonId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800"
                >
                  <option value="">-- Выберите пройденный урок --</option>
                  {ELDERLY_LESSONS.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title} {elderlyProfile.completedLessons.includes(l.id) ? '✓' : '⚠️'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase">Что я узнала сегодня:</label>
                <textarea
                  required
                  rows={4}
                  value={diaryText}
                  onChange={(e) => setDiaryText(e.target.value)}
                  placeholder="Например: Сегодня я научилась сама звонить Сереже. Кнопка была зеленая с трубкой. Это так легко, я очень рада!"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase">Прикрепить фото к записи (необязательно):</label>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDiaryPhoto('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&auto=format&fit=crop&q=60');
                      speak("Фото устьянской природы прикреплено к записи");
                    }}
                    className={`flex-1 py-2 border border-slate-200 hover:bg-amber-50 rounded-xl text-xs font-black text-slate-600 flex items-center justify-center gap-1.5 ${diaryPhoto ? 'bg-amber-50 border-amber-300 text-amber-900' : ''}`}
                  >
                    <ImageIcon size={14} /> Красивая природа Ваги 🌾
                  </button>
                  {diaryPhoto && (
                    <button
                      type="button"
                      onClick={() => setDiaryPhoto(null)}
                      className="px-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-bold"
                    >
                      Стереть
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-center uppercase tracking-wider text-xs font-black ${buttonPrimary}`}
              >
                Сохранить запись в дневник
              </button>
            </form>

            {/* Diary logs list */}
            <div className="md:col-span-7 space-y-4">
              <h4 className={`${getFSize('title')} text-slate-800`}>📋 Ваши заметки в дневнике:</h4>
              
              {(!elderlyProfile.diaryEntries || elderlyProfile.diaryEntries.length === 0) ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-3xl text-center space-y-2">
                  <span className="text-4xl">✏️</span>
                  <p className="text-xs text-slate-500 font-bold">У вас пока нет ни одной записи.</p>
                  <p className="text-[11px] text-slate-400">Пройдите урок, наберите текст в форме слева и сохраните вашу первую заметку.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {elderlyProfile.diaryEntries.map((item) => (
                    <div key={item.id} className={`${cardStyle} p-4 rounded-3xl space-y-3 relative`}>
                      <button
                        onClick={() => handleDeleteDiary(item.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-all"
                        title="Удалить заметку"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-amber-900 bg-amber-100 py-1 px-3 rounded-full uppercase">
                          {item.lessonTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{item.date}</span>
                      </div>

                      <p className={`${getFSize('body')} leading-relaxed font-semibold italic text-slate-700`}>
                        "{item.text}"
                      </p>

                      {item.photo && (
                        <div className="w-full max-w-[280px] h-32 bg-cover bg-center rounded-xl border border-slate-200" style={{ backgroundImage: `url(${item.photo})` }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS & CERTIFICATES */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-5xl">🏆</span>
              <h3 className={`${getFSize('title')} text-slate-900`}>Ваши цифровые достижения и награды:</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                За каждый пройденный этап и тему обучения вы получаете значки и практические награды!
              </p>
            </div>

            {/* Achievements badges grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map((badge) => {
                const isEarned = elderlyProfile.achievements.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-3xl flex items-start gap-4 border transition-all ${
                      isEarned 
                        ? 'bg-amber-50/50 border-amber-300 shadow-sm' 
                        : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <span className="text-4xl p-3 bg-white rounded-2xl border shadow-xs shrink-0">
                      {badge.icon}
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-slate-800 uppercase block">{badge.title}</span>
                      <span className="block text-[10px] text-slate-500 font-bold">Условие: {badge.condition}</span>
                      <p className="text-[11px] text-slate-400 font-semibold">{badge.desc}</p>
                      {isEarned ? (
                        <span className="inline-block text-[10px] text-emerald-700 bg-emerald-100 py-0.5 px-2 rounded-full font-black uppercase mt-1">✓ Получено</span>
                      ) : (
                        <span className="inline-block text-[10px] text-slate-500 bg-slate-200 py-0.5 px-2 rounded-full font-bold uppercase mt-1">Ожидает уроков</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CERTIFICATE PRESENTATION */}
            {elderlyProfile.completedLessons.length >= 10 && (
              <div className="bg-gradient-to-tr from-amber-100 via-yellow-50 to-amber-100 border-4 border-amber-400 p-6 sm:p-8 rounded-4xl text-center space-y-6 shadow-md max-w-2xl mx-auto animate-fadeIn relative">
                
                {/* Vintage certificate frame styling */}
                <div className="absolute inset-2 border border-dashed border-amber-300 rounded-3xl pointer-events-none" />
                
                <span className="text-6xl block">📜</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-800">Диплом об окончании курса</span>
                
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black font-sans tracking-wide text-amber-950 uppercase">СЕРТИФИКАТ</h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold italic">Настоящим подтверждается, что уважаемая</p>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 underline decoration-amber-500 decoration-2">
                    {elderlyProfile.fullName}
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-md mx-auto">
                    Успешно прошла практический курс "Школа цифровой грамотности Устьяны", освоила смартфон, компьютер, поиск в интернете и основы сетевой безопасности.
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-amber-200 pt-4 max-w-sm mx-auto font-mono">
                  <span>Устьяны, 2026</span>
                  <span className="italic font-bold">Районная Администрация ✍️</span>
                </div>

                <button
                  onClick={() => speak("Ваш диплом успешно загружен на устройство!")}
                  className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 mx-auto shadow-sm"
                >
                  <Download size={14} /> Скачать Сертификат (PDF)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CHAT WITH VOLUNTEER ASSISTANT */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Volunteer Bio Card */}
            <div className="md:col-span-4 bg-white p-5 rounded-3xl border flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🤝</span>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Ваш помощник: Анна</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">В сети / Онлайн</span>
                  </div>
                </div>

                <div className={`${accentCardStyle} p-4 rounded-xl space-y-2`}>
                  <p className="text-[11px] font-black uppercase text-amber-900 tracking-wider">О волонтёре:</p>
                  <p className="text-xs text-slate-600 leading-normal font-semibold">
                    Анна — местный волонтёр из посёлка Октябрьский. Она бесплатно помогает пожилым людям осваивать технологии, отвечает на вопросы и может зайти в гости для настройки телефона.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">Если чат неудобен, позвоните голосом:</span>
                  <span className="text-xs font-black text-slate-700 block mt-1">+7-999-123-4567</span>
                </div>
              </div>

              <button
                onClick={() => {
                  speak("Набираю номер волонтера Анны...");
                  triggerSpeedDial({ name: "Волонтер Анна 🤝", phone: "+7-999-123-4567", role: "volunteer" });
                }}
                className={`w-full py-3.5 text-center flex items-center justify-center gap-2 text-xs font-black uppercase ${buttonPrimary}`}
              >
                <Phone size={16} /> Позвонить Анне по телефону
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="md:col-span-8 bg-white p-4 rounded-3xl border flex flex-col justify-between min-h-[420px] max-h-[500px]">
              
              <div className="flex-1 overflow-y-auto space-y-3 p-2 border-b">
                {chatMessages.map((msg, i) => {
                  const isVol = msg.sender === 'volunteer';
                  return (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[75%] space-y-1 ${
                        isVol ? 'self-start' : 'self-end items-end ml-auto'
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold leading-relaxed shadow-xs ${
                          isVol 
                            ? 'bg-slate-100 text-slate-800 rounded-tl-none border' 
                            : 'bg-emerald-600 text-white rounded-tr-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Send Input Box */}
              <div className="pt-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Напишите вопрос Анне..."
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-xs sm:text-sm font-semibold"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: HELP & LOCAL VIDEO LESSONS */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            
            {/* 1. LOCAL VIDEO LESSONS */}
            <div className="space-y-4">
              <h3 className={`${getFSize('title')} text-slate-800`}>🎥 Видеоуроки от местных ребят:</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Короткие видеоуроки от внуков и школьников Устьянского района. Они объясняют технологии простым языком на нашем родном диалекте!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: '📱 Как запустить телефон первый раз',
                    desc: 'Объясняет Ваня из Шангал. Самое начало для новичков.',
                    speaker: 'Ваня (14 лет, Шангалы)',
                    emoji: '🌾',
                    views: '124 просмотра'
                  },
                  {
                    title: '✉️ Как отправлять SMS и смайлики',
                    desc: 'Показывает Настя из Березника. Учимся писать сообщения без ошибок.',
                    speaker: 'Настя (12 лет, Березник)',
                    emoji: '☀️',
                    views: '98 просмотров'
                  },
                  {
                    title: '🔒 Устьянские советы по безопасности',
                    desc: 'Инспектор Сергей рассказывает, как уберечь сбережения.',
                    speaker: 'Сергей (волонтёр, Октябрьский)',
                    emoji: '🌲',
                    views: '245 просмотров'
                  }
                ].map((vid, idx) => (
                  <div key={idx} className={`${cardStyle} p-4 rounded-3xl flex flex-col justify-between gap-4`}>
                    <div className="space-y-2">
                      <div className="w-full h-32 bg-slate-850 rounded-xl flex items-center justify-center relative shadow-inner overflow-hidden group cursor-pointer border-2 border-slate-700">
                        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400&auto=format&fit=crop&q=60")' }} />
                        <span className="absolute top-2 left-2 text-lg bg-black/40 py-1 px-2.5 rounded-lg text-white font-bold">{vid.emoji}</span>
                        <div className="w-12 h-12 bg-white/90 hover:bg-white text-emerald-800 rounded-full flex items-center justify-center shadow-md border group-hover:scale-105 transition-all z-10">
                          <Play size={20} className="ml-1 text-emerald-700 fill-emerald-700" />
                        </div>
                      </div>
                      
                      <span className="block text-xs font-black text-slate-800 leading-snug">{vid.title}</span>
                      <p className="text-[11px] text-slate-500 font-semibold">{vid.desc}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-2.5 font-bold">
                      <span>👤 {vid.speaker}</span>
                      <span>👁️ {vid.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. FAQS COLLAPSIBLE */}
            <div className="space-y-3">
              <h3 className={`${getFSize('title')} text-slate-800`}>📋 Ответы на частые вопросы (Чаво):</h3>
              <div className="space-y-2">
                {[
                  { q: 'Что делать, если экран телефона погас и не включается?', a: 'Не волнуйтесь! Скорее всего, телефон разрядился. Подключите его к зарядному устройству и подождите 10 минут, затем зажмите круглую кнопку включения сбоку на 3 секунды.' },
                  { q: 'Как отправить фотографию внуку по интернету?', a: 'Зайдите в чат с внуком, нажмите на значок плюса (+) или скрепки внизу слева, выберите фото из галереи и нажмите зеленую круглую кнопку со стрелочкой.' },
                  { q: 'Что делать, если звонят подозрительные люди и просят код?', a: 'Срочно вешайте трубку! Никому и никогда не говорите коды из сообщений, пароли или данные вашей карты. Сотрудники банков никогда не спрашивают такие коды!' }
                ].map((faq, i) => (
                  <details key={i} className="bg-white rounded-2xl border p-4 group cursor-pointer transition-all hover:bg-slate-50">
                    <summary className="text-xs sm:text-sm font-black text-slate-800 uppercase flex justify-between items-center list-none outline-none">
                      <span>{faq.q}</span>
                      <span className="text-slate-400 group-open:rotate-180 transition-all">▼</span>
                    </summary>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2.5 font-semibold leading-relaxed border-t pt-2 border-slate-100">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL: LESSON COMPLETED CELEBRATION */}
      {isLessonCompletedModal && selectedLesson && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-4 border-amber-400 p-6 sm:p-8 rounded-4xl max-w-md w-full text-center space-y-6 shadow-2xl relative"
          >
            <span className="text-6xl block animate-bounce">🎉🏆🌟</span>
            
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700">Ура! Вы сделали это!</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                Урок пройден успешно!
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Тема: "{selectedLesson.title}"
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/60 flex items-center justify-around">
              <div>
                <span className="text-3xl block">⭐</span>
                <span className="block text-xs font-black text-amber-950 mt-1">+{selectedLesson.rewardStars} Звёзд</span>
              </div>
              {selectedLesson.rewardAchievement && (
                <div>
                  <span className="text-3xl block">🏆</span>
                  <span className="block text-[10px] font-black text-amber-950 mt-1 uppercase">Значок получен</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Вы сделали еще один шаг к освоению технологий. Родные будут очень гордиться вашими умениями!
            </p>

            <button
              onClick={() => {
                setIsLessonCompletedModal(false);
                setSelectedLesson(null);
              }}
              className={`w-full py-3 text-center uppercase tracking-wider text-xs font-black ${buttonPrimary}`}
            >
              Вернуться к урокам
            </button>
          </motion.div>
        </div>
      )}

      {/* MODAL: SPEED DIAL RINGING/CONNECTED */}
      {activeSpeedDial && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 text-white p-6 sm:p-8 rounded-4xl max-w-sm w-full text-center space-y-6 shadow-2xl border border-white/10"
          >
            <div className="space-y-2">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-slate-700 animate-pulse">
                {activeSpeedDial.role === 'grandson' ? '👦' : activeSpeedDial.role === 'granddaughter' ? '👧' : '👵'}
              </div>
              <h3 className="text-xl font-black">{activeSpeedDial.name}</h3>
              <span className="block text-xs text-slate-400">{activeSpeedDial.phone}</span>
            </div>

            {speedDialRinging && (
              <div className="space-y-2 animate-pulse">
                <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">ИДЕТ ВЫЗОВ...</span>
                <p className="text-[11px] text-slate-500">Подождите, пока вам ответят</p>
              </div>
            )}

            {speedDialConnected && (
              <div className="space-y-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest animate-bounce">СВЯЗЬ УСТАНОВЛЕНА!</span>
                <p className="text-xs text-slate-300">Соединение прошло успешно.</p>
                <div className="bg-white/5 p-3 rounded-xl text-xs italic text-slate-400">
                  "Алло! Бабушка, привет! Умница, я слышу тебя!"
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveSpeedDial(null)}
              className="w-full py-3 bg-red-600 hover:bg-red-750 text-white text-xs font-black uppercase rounded-2xl"
            >
              Сбросить звонок 🛑
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// ====================================================================
// VOLUNTEER PANEL COMPONENT FOR DEPUTIES / HELPERS
// ====================================================================

interface VolunteerPanelProps {
  user: UserProfile;
}

export function VolunteerPanel({ user }: VolunteerPanelProps) {
  const [elderlyUsers, setElderlyUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats derivation
  const totalCount = elderlyUsers.length;
  const completedCount = elderlyUsers.filter(u => (u.elderlyProfile?.completedLessons?.length || 0) >= 15).length;
  const inProgressCount = totalCount - completedCount;

  // Subscribe to elderly pensioner users on Firestore
  useEffect(() => {
    let unsubListener: (() => void) | null = null;

    const loadMocks = () => {
      const mockElderly: UserProfile[] = [
        {
          id: 'elderly_maria',
          name: 'Мария Ивановна',
          phone: '+7-921-123-4567',
          village: 'Березник',
          skills: [],
          thanksCount: 15,
          createdCount: 3,
          resolvedCount: 0,
          blocked: false,
          reportsCount: 0,
          profileType: 'pensioner',
          elderlyProfile: {
            fullName: 'Мария Ивановна',
            level: 1,
            completedLessons: ['lesson_1', 'lesson_2'],
            stars: 10,
            achievements: ['first_step'],
            volunteerContact: 'Анна (волонтер)',
            phoneContacts: [] as { name: string; phone: string; role: 'son' | 'daughter' | 'grandson' | 'granddaughter' | 'neighbor' | 'other' }[],
            learningProgress: [],
            settings: { fontSize: 22, highContrast: false, voiceGuidance: true, audioVolume: 80 }
          }
        },
        {
          id: 'elderly_petr',
          name: 'Петр Васильевич',
          phone: '+7-921-999-8877',
          village: 'Шангалы',
          skills: [],
          thanksCount: 42,
          createdCount: 8,
          resolvedCount: 2,
          blocked: false,
          reportsCount: 0,
          profileType: 'pensioner',
          elderlyProfile: {
            fullName: 'Петр Васильевич',
            level: 3,
            completedLessons: ['lesson_1', 'lesson_2', 'lesson_3', 'lesson_4', 'lesson_5', 'lesson_6', 'lesson_7', 'lesson_8', 'lesson_9', 'lesson_10'],
            stars: 95,
            achievements: ['first_step', 'caller', 'photographer', 'sender', 'video_star'],
            volunteerContact: 'Анна (волонтер)',
            phoneContacts: [] as { name: string; phone: string; role: 'son' | 'daughter' | 'grandson' | 'granddaughter' | 'neighbor' | 'other' }[],
            learningProgress: [],
            settings: { fontSize: 22, highContrast: false, voiceGuidance: true, audioVolume: 80 }
          }
        }
      ];
      setElderlyUsers(mockElderly);
      setLoading(false);
    };

    const unsubAuth = auth.onAuthStateChanged((currentUserState) => {
      if (unsubListener) {
        unsubListener();
        unsubListener = null;
      }
      if (currentUserState) {
        const q = query(collection(db, 'users'), where('profileType', '==', 'pensioner'));
        unsubListener = onSnapshot(q, (snap) => {
          const list: UserProfile[] = [];
          snap.forEach(doc => {
            list.push(doc.data() as UserProfile);
          });
          setElderlyUsers(list);
          setLoading(false);
        }, (err) => {
          console.error('Error loading elderly users:', err);
          loadMocks();
        });
      } else {
        loadMocks();
      }
    });

    return () => {
      unsubAuth();
      if (unsubListener) unsubListener();
    };
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-6">
      
      {/* Panel header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <span className="text-4xl">🤝</span>
        <div>
          <h3 className="text-xl font-black text-slate-800">ВОЛОНТЁРСКАЯ ПАНЕЛЬ (Помощники)</h3>
          <p className="text-xs text-slate-500">Управление подопечными пожилыми жителями, проходящими цифровую грамотность</p>
        </div>
      </div>

      {/* STATS BENTO ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-indigo-900 block tracking-wider">Всего подопечных:</span>
          <span className="text-3xl font-black text-indigo-950 block mt-1">{totalCount || 12}</span>
          <p className="text-[10px] text-slate-500 mt-1">Зарегистрировано в районе</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-emerald-900 block tracking-wider">Завершили обучение:</span>
          <span className="text-3xl font-black text-emerald-950 block mt-1">{completedCount || 5}</span>
          <p className="text-[10px] text-slate-500 mt-1">Освоили более 15 уроков</p>
        </div>
        <div className="bg-amber-50 border border-amber-150 p-4 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-amber-900 block tracking-wider">В процессе:</span>
          <span className="text-3xl font-black text-amber-950 block mt-1">{inProgressCount || 7}</span>
          <p className="text-[10px] text-slate-500 mt-1">Активно учатся сегодня</p>
        </div>
      </div>

      {/* STUDENTS LIST */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">Ваши подопечные пожилые жители:</h4>
        
        {loading ? (
          <div className="py-8 text-center text-slate-400 font-semibold">Идет загрузка подопечных...</div>
        ) : (
          <div className="space-y-2.5">
            {elderlyUsers.map((item) => {
              const completedCount = item.elderlyProfile?.completedLessons?.length || 0;
              const lvl = item.elderlyProfile?.level || 1;
              const lvlBadge = LEVELS.find(l => l.id === lvl)?.name || 'Ученик';

              return (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">👵</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-sm">{item.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{item.village}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 font-semibold">
                        <span>Уровень: <span className="text-amber-700 font-extrabold">{lvlBadge}</span></span>
                        <span>•</span>
                        <span>Пройдено уроков: <span className="text-slate-800 font-extrabold">{completedCount} из 20</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 block font-bold">Последний урок:</span>
                      <span className="text-xs font-black text-slate-700 block">
                        {completedCount > 0 
                          ? ELDERLY_LESSONS.find(l => l.id === item.elderlyProfile?.completedLessons[completedCount - 1])?.title || 'Урок'
                          : 'Обучение не начато'
                        }
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        // Quick call mock
                        alert('Волонтёр связывается с подопечной ' + item.name + ' по телефону ' + item.phone);
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 border text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Phone size={14} /> Позвонить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
