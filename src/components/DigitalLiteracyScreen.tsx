import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CheckCircle, Lock, Award, BookOpen, HelpCircle, 
  Trophy, ChevronRight, ChevronLeft, Star, Lightbulb, Sparkles,
  Smartphone, Monitor, ShieldAlert, BrainCircuit, Play, Check, X
} from 'lucide-react';
import { UserProfile } from '../types';
import { dbUpdateUserProfile } from '../firebaseSync';
import { COZY_IMAGES } from '../constants/cozyAssets';

interface LessonStep {
  title: string;
  desc: string;
  tip?: string;
  icon: string; // emoji or simple icon identifier
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIdx: number;
  explanation: string;
}

interface Lesson {
  id: number;
  title: string;
  subtitle: string;
  characterName: string;
  characterImage: string;
  icon: React.ReactNode;
  reward: number; // 5, 10, 20, 30
  steps: LessonStep[];
  quiz: QuizQuestion[];
}

interface DigitalLiteracyScreenProps {
  currentUser: UserProfile;
  onBack: () => void;
  isCozyTheme: boolean;
  onUpdateUser: (updated: UserProfile) => void;
}

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Смартфон — твой друг",
    subtitle: "Освой основы звонков, сообщений и камеры за 5 минут",
    characterName: "Тетя Клава",
    characterImage: COZY_IMAGES.tetyaKlava,
    reward: 5,
    icon: <Smartphone className="w-8 h-8 text-amber-600" />,
    steps: [
      {
        title: "Включение и кнопка блокировки",
        desc: "На боковой панели любого современного смартфона есть продолговатая металлическая кнопка. Одно быстрое нажатие блокирует или «будит» экран. Долгое зажатие (3-5 секунд) полностью включает или выключает телефон.",
        tip: "Если экран погас — не волнуйтесь, телефон просто «спит» для экономии батареи. Нажмите кнопку блокировки один раз!",
        icon: "📱"
      },
      {
        title: "Звонки и сообщения",
        desc: "Чтобы позвонить, найдите иконку с зеленой телефонной трубкой. Там можно набрать номер или выбрать человека из Списка контактов. Чтобы ответить на звонок, проведите пальцем по зеленой кнопке на экране вправо.",
        tip: "Для отправки СМС или сообщений в мессенджере (например, Viber) нажмите на иконку «Сообщения», выберите контакт и начните вводить текст на появившейся клавиатуре.",
        icon: "📞"
      },
      {
        title: "Камера и фотографии",
        desc: "Камера обозначается иконкой в виде фотоаппарата. Открыв её, вы увидите то, на что направлен телефон. Нажмите большую круглую белую кнопку внизу экрана, чтобы сделать снимок. Все фото сохраняются в приложении «Галерея» или «Альбом».",
        tip: "Держите телефон крепко двумя руками и не двигайтесь секунду после нажатия, чтобы снимок не получился размытым!",
        icon: "📸"
      }
    ],
    quiz: [
      {
        question: "Какая кнопка обычно включает и «будит» экран смартфона?",
        options: [
          "Кнопка прибавления громкости",
          "Кнопка блокировки/питания на боковой панели",
          "Кнопка возврата «Домой»"
        ],
        correctAnswerIdx: 1,
        explanation: "Кнопка блокировки на боковой грани используется как для кратковременного включения экрана, так и для полного включения/выключения смартфона при долгом нажатии."
      },
      {
        question: "Где на телефоне хранятся все сделанные вами фотографии?",
        options: [
          "В приложении «Календарь»",
          "В «Галерее» или «Альбоме»",
          "В настройках звонков"
        ],
        correctAnswerIdx: 1,
        explanation: "Все сделанные снимки автоматически попадают в Галерею (на некоторых устройствах называется «Альбом» или «Фото»)."
      },
      {
        question: "Как ответить на входящий звонок на экране смартфона?",
        options: [
          "Зажать кнопку питания на 10 секунд",
          "Провести пальцем по зеленой кнопке (или сдвинуть трубку вверх)",
          "Сильно потрясти телефон"
        ],
        correctAnswerIdx: 1,
        explanation: "Чтобы принять вызов, нужно провести пальцем по зеленой трубке на экране. Это защищает от случайных нажатий в кармане."
      }
    ]
  },
  {
    id: 2,
    title: "Компьютер — не страшно",
    subtitle: "Научись запускать компьютер, владеть мышкой и заходить в интернет",
    characterName: "Дед Тимофей",
    characterImage: COZY_IMAGES.dedTimofey,
    reward: 10,
    icon: <Monitor className="w-8 h-8 text-emerald-600" />,
    steps: [
      {
        title: "Запуск компьютера",
        desc: "На системном блоке компьютера (под столом или рядом) или на клавиатуре ноутбука есть самая большая круглая кнопка со специальным значком — незамкнутый круг с вертикальной палочкой сверху ⏻. Нажмите её один раз, чтобы компьютер ожил.",
        tip: "Запуск может занять 1-2 минуты. Подождите, пока на экране появится привычный рабочий стол с ярлыками программ.",
        icon: "🖥️"
      },
      {
        title: "Мышка и клавиатура",
        desc: "Мышка — это ваша виртуальная рука. Двигая её по столу, вы перемещаете стрелочку (курсор) на экране. Левая кнопка мыши служит для выбора файлов и нажатия кнопок (одиночный или двойной клик). Правая кнопка открывает меню дополнительных действий. Колесико посредине листает страницы вверх-вниз.",
        tip: "Клавиатура нужна для ввода букв. Просто нажмите на поле для ввода текста, и нажимайте клавиши. Большая длинная клавиша в самом низу — это Пробел (разделяет слова).",
        icon: "🖱️"
      },
      {
        title: "Браузер и поиск информации",
        desc: "Чтобы попасть в интернет, найдите на экране иконку «Браузера» (обычно это разноцветный круг Chrome, синяя буква e/Edge, или лиса Яндекс). Нажмите дважды левой кнопкой мыши. Вверху откроется длинная строка — введите туда ваш запрос, например: «Погода в моем населенном пункте» и нажмите клавишу Enter.",
        tip: "Вы увидите список сайтов. Нажмите один раз левой кнопкой мыши по синей ссылке, чтобы открыть нужный сайт.",
        icon: "🌐"
      }
    ],
    quiz: [
      {
        question: "Как обозначается кнопка включения компьютера или ноутбука?",
        options: [
          "Значком лупы поиска",
          "Кругом с вертикальной палочкой вверху ⏻",
          "Красным крестиком"
        ],
        correctAnswerIdx: 1,
        explanation: "Символ ⏻ является международным стандартом для обозначения кнопки питания электронных приборов."
      },
      {
        question: "Для чего используется левая кнопка мыши (ЛКМ)?",
        options: [
          "Для удаления файлов в корзину",
          "Для выбора элементов, открытия программ и нажатия на экранные кнопки",
          "Для моментального выключения монитора"
        ],
        correctAnswerIdx: 1,
        explanation: "Левая кнопка — основная рабочая кнопка. Ей мы выбираем, кликаем по ссылкам и запускаем программы."
      },
      {
        question: "Что такое «Браузер»?",
        options: [
          "Программа для просмотра интернет-сайтов и поиска информации",
          "Важная железная деталь внутри системного блока",
          "Клавиша на клавиатуре для стирания букв"
        ],
        correctAnswerIdx: 0,
        explanation: "Браузер (например, Яндекс.Браузер, Google Chrome, Opera) — это специальная программа-окно в интернет."
      }
    ]
  },
  {
    id: 3,
    title: "Интернет — безопасность",
    subtitle: "Защити себя от телефонных мошенников и научись распознавать обман",
    characterName: "Фельдшер Маша",
    characterImage: COZY_IMAGES.feldsherMasha,
    reward: 15,
    icon: <ShieldAlert className="w-8 h-8 text-rose-600" />,
    steps: [
      {
        title: "Осторожно, мошенники!",
        desc: "Если вам звонят неизвестные люди, представляются «службой безопасности банка», «полицией» или «пенсионным фондом» и говорят, что ваши деньги в опасности, либо просят назвать секретные коды из СМС — ЭТО МОШЕННИКИ! Настоящие сотрудники банков никогда не просят пароли и коды.",
        tip: "Самое лучшее действие при любом подозрительном звонке — просто положить трубку! Нажмите красную кнопку сброса.",
        icon: "🚨"
      },
      {
        title: "Надежные пароли",
        desc: "При регистрации на сайтах (например, Госуслуги) никогда не используйте простые пароли вроде «123456», «qwerty» или вашу дату рождения. Такой пароль легко угадать. Хороший пароль состоит из больших и маленьких букв, цифр и значков (например, Ustya_2026!).",
        tip: "Запишите свои пароли в бумажный блокнот дома и храните его в надежном месте. Никогда не отправляйте фото паролей незнакомцам в интернете.",
        icon: "🔑"
      },
      {
        title: "Значок замочка на сайтах",
        desc: "Когда вы заходите на любой официальный сайт, обратите внимание на левую часть адресной строки вверху браузера. Там должен стоять маленький значок закрытого серого замочка 🔒. Это значит, что сайт защищен и ваше соединение безопасно.",
        tip: "Если замочка нет или браузер предупреждает: «Сайт небезопасен» — никогда не вводите там данные своей банковской карты или личные пароли!",
        icon: "🔒"
      }
    ],
    quiz: [
      {
        question: "Вам звонят «из банка» и говорят, что по карте идет подозрительная операция, просят код из СМС. Что делать?",
        options: [
          "Сразу продиктовать код, чтобы спасти сбережения",
          "Положить трубку, перевернуть карту, найти номер поддержки банка и позвонить туда самому",
          "Назвать случайный набор цифр"
        ],
        correctAnswerIdx: 1,
        explanation: "Банки никогда не спрашивают СМС-коды. Положите трубку и перезвоните по официальному номеру, указанному на обратной стороне вашей банковской карты."
      },
      {
        question: "Какой пароль из перечисленных является наиболее безопасным?",
        options: [
          "Имя вашей кошки (например, pushinka)",
          "Сложная комбинация с буквами разного регистра, цифрами и знаками (например, Les_Ustya#26)",
          "Простая комбинация «12345678»"
        ],
        correctAnswerIdx: 1,
        explanation: "Сложный пароль с чередованием регистров букв, цифр и знаков препинания практически невозможно взломать перебором."
      },
      {
        question: "Что означает значок закрытого замочка 🔒 в строке адреса сайта в браузере?",
        options: [
          "Сайт заблокирован Роскомнадзором",
          "Соединение с сайтом зашифровано и безопасно, ваши данные защищены",
          "Этот сайт платный"
        ],
        correctAnswerIdx: 1,
        explanation: "Значок замочка подтверждает, что сайт использует защищенное (SSL) соединение, и передаваемые данные не перехватят третьи лица."
      }
    ]
  },
  {
    id: 4,
    title: "Нейросети — это просто",
    subtitle: "Узнай, как искусственный разум помогает в быту, уходе за домом и садом",
    characterName: "Мария Ивановна",
    characterImage: COZY_IMAGES.maryaIvanovna,
    reward: 20,
    icon: <BrainCircuit className="w-8 h-8 text-indigo-600" />,
    steps: [
      {
        title: "Что такое нейросеть?",
        desc: "Нейросеть — это умный компьютерный помощник. Представь себе невероятно начитанного собеседника, который прочитал миллионы книг, статей и рецептов. Он не просто ищет ссылки в интернете, а понимает ваши вопросы и пишет ответы своими словами, как живой человек.",
        tip: "Нейросеть (как наш ИИ-помощник) умеет рассуждать, переводить тексты, исправлять ошибки и придумывать идеи!",
        icon: "🧠"
      },
      {
        title: "Как нейросеть помогает жителю деревни?",
        desc: "Нейросеть может стать незаменимым советчиком! Например, вы можете попросить её: «Составь пошаговый план посадки помидоров в открытый грунт в Архангельской области», «Придумай теплое поздравление с юбилеем для внука-студента» или «Подскажи старинные рецепты традиционного шанежного теста».",
        tip: "Помощник выдаст готовый, структурированный ответ прямо на экране за несколько секунд!",
        icon: "🌾"
      },
      {
        title: "Правила вежливого диалога («Промт»)",
        desc: "Ваш запрос к нейросети называется красивым словом «промт». Общайтесь с нейросетью вежливо и подробно. Чем больше деталей вы опишете, тем точнее будет ответ. Не бойтесь задавать уточняющие вопросы, если ответ показался слишком сложным.",
        tip: "Например, пишите: «Объясни мне, как настроить автоплатеж, простыми словами, как для бабушки». Нейросеть сразу подстроится под вас!",
        icon: "💬"
      }
    ],
    quiz: [
      {
        question: "Что такое нейросеть простыми словами?",
        options: [
          "Новый мощный робот-пылесос для уборки",
          "Умный компьютерный собеседник и виртуальный помощник, обученный на больших знаниях",
          "Специальный толстый кабель для подключения интернета к дому"
        ],
        correctAnswerIdx: 1,
        explanation: "Нейросеть — это модель искусственного интеллекта, которая может вести диалог, отвечать на вопросы, писать тексты и генерировать идеи."
      },
      {
        question: "Как нейросеть («ИИ-помощник») может помочь вам на даче или дома?",
        options: [
          "Физически вскопать грядки и принести тяжелые дрова в избу",
          "Дать советы по уходу за рассадой, составить меню из имеющихся продуктов или придумать душевное поздравление",
          "Самостоятельно починить сломанный телевизор"
        ],
        correctAnswerIdx: 1,
        explanation: "Нейросеть — это текстовый и интеллектуальный помощник. Она не умеет выполнять физическую работу, но дает бесценные советы, инструкции и творческие идеи."
      },
      {
        question: "Что означает слово «Промт» в общении с нейросетью?",
        options: [
          "Ваш вопрос, просьба или текстовое задание для искусственного интеллекта",
          "Системный сбой в работе телефона",
          "Кнопка перезагрузки интернет-роутера"
        ],
        correctAnswerIdx: 0,
        explanation: "Промт (от англ. Prompt) — это текстовый запрос, который пользователь вводит для общения с нейросетью."
      }
    ]
  }
];

export default function DigitalLiteracyScreen({
  currentUser,
  onBack,
  isCozyTheme,
  onUpdateUser
}: DigitalLiteracyScreenProps) {
  // Navigation states
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  
  // Confetti / Completion animation state
  const [showLessonCompletedAnimation, setShowLessonCompletedAnimation] = useState<boolean>(false);
  const [showAllCompletedAnimation, setShowAllCompletedAnimation] = useState<boolean>(false);

  // Load user progress from current user profile
  const progress = currentUser.digitalLiteracy || {
    completed_lessons: [],
    total_reward: 0,
    started_at: null,
    completed_at: null
  };

  const completedCount = progress.completed_lessons.length;
  const isAllCompleted = completedCount === LESSONS.length;

  // Initialize start date if user opens the school
  useEffect(() => {
    if (!progress.started_at) {
      const updatedLiteracy = {
        ...progress,
        started_at: new Date().toISOString()
      };
      
      const updatedUser = {
        ...currentUser,
        digitalLiteracy: updatedLiteracy
      };

      onUpdateUser(updatedUser);
      dbUpdateUserProfile(currentUser.id, { digitalLiteracy: updatedLiteracy });
    }
  }, []);

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentStepIdx(0);
    setIsQuizMode(false);
    setCurrentQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setShowAnswerFeedback(false);
  };

  const handleNextStep = () => {
    if (selectedLesson && currentStepIdx < selectedLesson.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      setIsQuizMode(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (idx: number) => {
    if (showAnswerFeedback) return;
    setSelectedAnswerIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedLesson && selectedAnswerIdx !== null) {
      const question = selectedLesson.quiz[currentQuestionIdx];
      const correct = selectedAnswerIdx === question.correctAnswerIdx;
      setIsAnswerCorrect(correct);
      setShowAnswerFeedback(true);
    }
  };

  const handleNextQuestion = () => {
    if (!selectedLesson) return;

    setSelectedAnswerIdx(null);
    setShowAnswerFeedback(false);

    if (currentQuestionIdx < selectedLesson.quiz.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Quiz completed! Award point to user if not completed before
      const isFirstTime = !progress.completed_lessons.includes(selectedLesson.id);
      
      let newCompleted = [...progress.completed_lessons];
      let rewardAdded = 0;
      let titleBonus = 0;

      if (isFirstTime) {
        newCompleted.push(selectedLesson.id);
        rewardAdded = selectedLesson.reward;
        
        // If all completed, total is 50 points (5 + 10 + 15 + 20 = 50)
        if (newCompleted.length === LESSONS.length) {
          titleBonus = 0; // No bonus, exact 50 sum
        }
      }

      const totalRewardAdded = rewardAdded + titleBonus;
      const newTotalReward = progress.total_reward + totalRewardAdded;
      const newThanksCount = currentUser.thanksCount + totalRewardAdded;

      const updatedLiteracy = {
        ...progress,
        completed_lessons: newCompleted,
        total_reward: newTotalReward,
        completed_at: newCompleted.length === LESSONS.length ? new Date().toISOString() : progress.completed_at
      };

      const updatedUser = {
        ...currentUser,
        thanksCount: newThanksCount,
        digitalLiteracy: updatedLiteracy
      };

      onUpdateUser(updatedUser);
      dbUpdateUserProfile(currentUser.id, {
        thanksCount: newThanksCount,
        digitalLiteracy: updatedLiteracy
      });

      setShowLessonCompletedAnimation(true);
      if (newCompleted.length === LESSONS.length && isFirstTime) {
        setShowAllCompletedAnimation(true);
      }
    }
  };

  const handleCloseCompletionModal = () => {
    setShowLessonCompletedAnimation(false);
    setShowAllCompletedAnimation(false);
    setSelectedLesson(null);
    setIsQuizMode(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 select-none font-sans" id="digital_literacy_school">
      
      {/* Back to Home Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-bold text-sm bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>Назад в меню</span>
        </button>

        {/* Global Progress Header Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Школа грамотности</span>
            <span className="text-xs font-black text-emerald-800 font-sans">
              Пройдено: {completedCount} из {LESSONS.length} уроков
            </span>
          </div>
          <div className="w-16 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="bg-emerald-600 h-full transition-all duration-500" 
              style={{ width: `${(completedCount / LESSONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedLesson ? (
          // LESSON CATALOGUE VIEW
          <motion.div
            key="catalogue"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* School Hero Banner Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-[28px] p-6 sm:p-8 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl" />
              <div className="relative z-10 max-w-lg space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-xs font-black uppercase tracking-wider">
                  <Sparkles size={12} className="fill-slate-900" /> Интерактивная школа
                </span>
                <h1 className="text-3xl font-black font-display tracking-tight text-white leading-tight">
                  Цифровая грамотность
                </h1>
                <p className="text-emerald-100 text-sm leading-relaxed font-medium">
                  Простые интерактивные уроки с картинками и добрыми персонажами. Учитесь пользоваться телефоном, компьютером, интернетом и нейросетями! Получайте баллы «Спасибо» за каждый урок!
                </p>

                {/* Point system callout in Banner */}
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3 flex items-center gap-3 mt-4">
                  <div className="text-2xl">🎁</div>
                  <div className="text-xs">
                    <span className="font-bold text-amber-300 block">Награда за все уроки: 100 «Спасибо»</span>
                    Каждый балл равен 1 рублю при достижении 10 000 скачиваний приложения!
                  </div>
                </div>
              </div>

              {/* Character overlay floating decorative */}
              <div className="absolute bottom-0 right-4 hidden md:block w-40 h-48 pointer-events-none opacity-90">
                <img 
                  src={COZY_IMAGES.maryaIvanovna} 
                  alt="Marya Ivanovna" 
                  className="w-full h-full object-contain object-bottom"
                />
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-emerald-800 px-1 flex items-center gap-2">
                <span>📚</span> Список уроков
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {LESSONS.map((lesson) => {
                  const isCompleted = progress.completed_lessons.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`bg-white border rounded-[24px] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full min-h-[250px] relative overflow-hidden border-slate-200 group`}
                    >
                      {/* Top bar details inside the card */}
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                            {lesson.icon}
                          </div>
                          
                          {/* Lesson status label */}
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                              <CheckCircle size={12} className="fill-emerald-100" />
                              Пройден • {lesson.reward} Спасибо
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                              ⭐ +{lesson.reward} Спасибо
                            </span>
                          )}
                        </div>

                        {/* Title & subtitle */}
                        <div className="mt-4">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                            Урок {lesson.id} • Ведет {lesson.characterName}
                          </span>
                          <h4 className="font-black text-emerald-800 text-lg leading-tight font-display mt-0.5">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-medium">
                            {lesson.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row: Play/Open button */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src={lesson.characterImage} 
                            alt={lesson.characterName} 
                            className="w-6 h-6 rounded-full border border-slate-200 object-cover"
                          />
                          <span className="text-[11px] text-slate-500 font-bold">{lesson.characterName}</span>
                        </div>

                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                          <Play size={10} className="fill-current text-white" />
                          <span>{isCompleted ? "Повторить" : "Начать"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gratitude rewards certificate callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="text-4xl">🏅</div>
              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base uppercase tracking-wider font-display">
                  Почётное звание «Грамотный житель»
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Пройдите все 4 урока, чтобы получить супер-бонус <strong>+35 Спасибо</strong> (итого 100 Спасибо!) и получить золотую медаль в профиле! Ваши баллы будут сохранены в единой базе данных Firestore.
                </p>
              </div>
              <div className="text-center shrink-0">
                <span className="text-3xl font-black text-emerald-800 block">{completedCount}/{LESSONS.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Уроков пройдено</span>
              </div>
            </div>
          </motion.div>
        ) : (
          // ACTIVE LESSON VIEWER (STEPPERS OR QUIZ)
          <motion.div
            key="lesson_player"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm relative overflow-hidden"
          >
            {/* Top header within lesson player */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl text-xl shrink-0">
                  {selectedLesson.icon}
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                    Урок {selectedLesson.id} из {LESSONS.length} • Ведет {selectedLesson.characterName}
                  </span>
                  <h2 className="text-xl font-black text-emerald-800 font-display">
                    {selectedLesson.title}
                  </h2>
                </div>
              </div>

              {/* Progress dots inside active lesson */}
              <div className="flex items-center gap-2">
                {!isQuizMode ? (
                  selectedLesson.steps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        idx === currentStepIdx 
                          ? 'w-6 bg-emerald-600' 
                          : idx < currentStepIdx 
                            ? 'w-2.5 bg-emerald-500' 
                            : 'w-2.5 bg-slate-100 border border-slate-200'
                      }`}
                    />
                  ))
                ) : (
                  <span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                    <HelpCircle size={12} /> Тест: Вопрос {currentQuestionIdx + 1} из {selectedLesson.quiz.length}
                  </span>
                )}
              </div>
            </div>

            {/* Main Active Container (Stepper or Quiz) */}
            <div className="min-h-80 flex flex-col justify-between">
              
              {!isQuizMode ? (
                // STEP BY STEP VIEWER
                <motion.div
                  key={`step_${currentStepIdx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex-1"
                >
                  <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    
                    {/* Big picture / illustration block */}
                    <div className="w-full md:w-56 h-44 bg-slate-50 border border-slate-200 rounded-[24px] flex flex-col items-center justify-center relative shrink-0">
                      <span className="text-7xl pointer-events-none drop-shadow-sm select-none">
                        {selectedLesson.steps[currentStepIdx].icon}
                      </span>
                      <div className="absolute bottom-2 bg-white/80 border border-slate-200 text-[10px] font-bold text-slate-800 px-3 py-0.5 rounded-full shadow-2xs font-sans">
                        Шаг {currentStepIdx + 1}
                      </div>
                    </div>

                    {/* Step details content */}
                    <div className="space-y-3 flex-1">
                      <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider block font-sans">
                        Раздел {currentStepIdx + 1}: {selectedLesson.steps[currentStepIdx].title}
                      </span>
                      <h3 className="text-xl font-black text-emerald-800 font-display leading-tight">
                        {selectedLesson.steps[currentStepIdx].title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {selectedLesson.steps[currentStepIdx].desc}
                      </p>
                    </div>

                  </div>

                  {/* Character tip card */}
                  {selectedLesson.steps[currentStepIdx].tip && (
                    <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-2xl p-4 flex gap-4 items-start">
                      <img 
                        src={selectedLesson.characterImage} 
                        alt={selectedLesson.characterName} 
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                          Совет от: {selectedLesson.characterName}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {selectedLesson.steps[currentStepIdx].tip}
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              ) : (
                // QUIZ MODE CONTAINER
                <motion.div
                  key={`quiz_${currentQuestionIdx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 flex-1"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-black text-rose-600 uppercase tracking-wider block">Выпускной тест по уроку</span>
                    <h3 className="text-lg font-black text-emerald-800 font-display">
                      {selectedLesson.quiz[currentQuestionIdx].question}
                    </h3>
                  </div>

                  {/* Radio answers list */}
                  <div className="space-y-3">
                    {selectedLesson.quiz[currentQuestionIdx].options.map((option, idx) => {
                      const isSelected = selectedAnswerIdx === idx;
                      let optionStyle = "border-slate-200 bg-white hover:bg-slate-50";

                      if (isSelected) {
                        optionStyle = "border-emerald-600 bg-emerald-50 font-bold ring-2 ring-emerald-600/20";
                      }

                      if (showAnswerFeedback) {
                        const isCorrect = idx === selectedLesson.quiz[currentQuestionIdx].correctAnswerIdx;
                        if (isCorrect) {
                          optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20";
                        } else if (isSelected) {
                          optionStyle = "border-rose-400 bg-rose-50 text-rose-900 line-through ring-2 ring-rose-400/20";
                        }
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full border border-slate-300 text-xs font-black flex items-center justify-center shrink-0 font-sans">
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-700 font-medium">{option}</span>
                          </div>

                          {showAnswerFeedback && (
                            <span className="shrink-0 text-lg">
                              {idx === selectedLesson.quiz[currentQuestionIdx].correctAnswerIdx ? (
                                <Check className="text-emerald-600" size={18} />
                              ) : isSelected ? (
                                <X className="text-rose-600" size={18} />
                              ) : null}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Answer Explanation Box */}
                  {showAnswerFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border text-xs leading-relaxed font-medium ${
                        isAnswerCorrect 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                          : 'bg-rose-50 border-rose-100 text-rose-800'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                        {isAnswerCorrect ? "🎉 Правильно!" : "❌ Ошибка!"}
                      </div>
                      <p>{selectedLesson.quiz[currentQuestionIdx].explanation}</p>
                    </motion.div>
                  )}

                </motion.div>
              )}

              {/* Action Buttons Row at the bottom of lesson player */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6 gap-4">
                
                {/* Back button */}
                <button
                  onClick={() => {
                    if (isQuizMode) {
                      setIsQuizMode(false);
                      setCurrentStepIdx(selectedLesson.steps.length - 1);
                    } else if (currentStepIdx > 0) {
                      handlePrevStep();
                    } else {
                      setSelectedLesson(null);
                    }
                  }}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer btn-no-wood"
                >
                  <span>{currentStepIdx === 0 && !isQuizMode ? "Выйти" : "Назад"}</span>
                </button>

                {/* Right text prompt helper */}
                {!isQuizMode && (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">
                    Раздел {currentStepIdx + 1} из {selectedLesson.steps.length}
                  </span>
                )}

                {/* Action primary button */}
                {!isQuizMode ? (
                  <button
                    onClick={handleNextStep}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentStepIdx === selectedLesson.steps.length - 1 ? "Перейти к тесту" : "Далее"}</span>
                    <ChevronRight size={12} />
                  </button>
                ) : !showAnswerFeedback ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswerIdx === null}
                    className={`font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedAnswerIdx === null
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <span>Проверить ответ</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {currentQuestionIdx === selectedLesson.quiz.length - 1 ? "Завершить урок!" : "Следующий вопрос"}
                    </span>
                    <ChevronRight size={12} />
                  </button>
                )}

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL / OVERLAY FOR LESSON COMPLETION AND REWARDS */}
      <AnimatePresence>
        {showLessonCompletedAnimation && selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] border border-slate-200 p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Gold/brown top band decor */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
              
              {/* Confetti/stars falling emojis */}
              <div className="absolute inset-0 pointer-events-none select-none text-2xl opacity-15">
                <div className="absolute top-10 left-10 animate-bounce">✨</div>
                <div className="absolute top-20 right-12 animate-pulse">🌟</div>
                <div className="absolute bottom-16 left-16 animate-bounce">📱</div>
                <div className="absolute bottom-24 right-20 animate-pulse">💻</div>
              </div>

              {/* Big Award Badge */}
              <div className="w-24 h-24 bg-amber-50 rounded-full border-2 border-amber-300 flex items-center justify-center text-5xl mx-auto shadow-md animate-bounce">
                {showAllCompletedAnimation ? "🏆" : "🏅"}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block">Урок успешно завершен!</span>
                <h3 className="text-2xl font-black text-emerald-800 font-display">
                  Поздравляем вас!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
                  Вы правильно ответили на все вопросы теста и освоили урок <strong>«{selectedLesson.title}»</strong>!
                </p>
              </div>

              {/* Added points callout block */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Заработанная награда:</span>
                <span className="text-3xl font-black text-amber-700 block font-sans">
                  +{selectedLesson.reward} "Спасибо"
                </span>
                
                {/* Cumulative school bonus indicator if all completed */}
                {showAllCompletedAnimation && (
                  <div className="border-t border-slate-200 pt-2.5 mt-2.5">
                    <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">Бонус школы грамотности:</span>
                    <span className="text-lg font-black text-emerald-600 block font-sans">
                      +35 "Спасибо" Супер-бонус!
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                      👑 Присвоено звание «Грамотный житель»!
                    </span>
                  </div>
                )}
              </div>

              {/* CTA button */}
              <button
                onClick={handleCloseCompletionModal}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md cursor-pointer"
              >
                <span>Получить награду и продолжить</span>
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
