export interface LessonStep {
  instruction: string;
  voiceText: string;
  imageUrl?: string;
  simulationType:
    | 'power'
    | 'charger'
    | 'buttons'
    | 'call'
    | 'sms'
    | 'camera'
    | 'send_photo'
    | 'install'
    | 'chat'
    | 'video'
    | 'pc_power'
    | 'mouse'
    | 'keyboard'
    | 'search'
    | 'maps'
    | 'weather'
    | 'news'
    | 'shop'
    | 'bank'
    | 'security'
    | 'review'
    | 'none';
  simulationData?: any;
}

export interface Lesson {
  id: string;
  title: string;
  level: number; // 1-5
  category: 'phone' | 'computer' | 'internet' | 'apps' | 'safety';
  description: string;
  steps: LessonStep[];
  rewardStars: number;
  rewardAchievement?: string;
}

export const ELDERLY_LESSONS: Lesson[] = [
  {
    id: 'lesson_1',
    title: '🔋 Включение и зарядка',
    level: 1,
    category: 'phone',
    description: 'Как правильно включать телефон и вставлять зарядное устройство.',
    rewardStars: 5,
    rewardAchievement: 'first_step',
    steps: [
      {
        instruction: 'Найдите кнопку питания сбоку телефона. Зажмите её пальцем на 3 секунды, чтобы телефон включился.',
        voiceText: 'Найдите кнопку питания сбоку вашего смартфона. Нажмите и удерживайте её, чтобы включить устройство.',
        simulationType: 'power'
      },
      {
        instruction: 'Отлично! Теперь давайте зарядим телефон. Нажмите на зарядный провод, чтобы вставить его в гнездо внизу экрана.',
        voiceText: 'Теперь подключим зарядный кабель. Нажмите на провод под телефоном, чтобы вставить его в зарядный разъем.',
        simulationType: 'charger'
      }
    ]
  },
  {
    id: 'lesson_2',
    title: '📱 Основные кнопки',
    level: 1,
    category: 'phone',
    description: 'Что означают три главные кнопки внизу экрана телефона.',
    rewardStars: 5,
    steps: [
      {
        instruction: 'Кнопка "Домой" (круг внизу). Нажмите её, чтобы свернуть всё и вернуться на главный экран.',
        voiceText: 'Кнопка Домой в виде круга возвращает вас в самое начало. Нажмите на круглую кнопку внизу экрана.',
        simulationType: 'buttons',
        simulationData: { target: 'home' }
      },
      {
        instruction: 'Кнопка "Назад" (стрелочка или треугольник). Нажмите на треугольную стрелку, чтобы вернуться назад.',
        voiceText: 'Кнопка назад помогает вернуться на предыдущий экран. Нажмите на стрелочку внизу.',
        simulationType: 'buttons',
        simulationData: { target: 'back' }
      }
    ]
  },
  {
    id: 'lesson_3',
    title: '☎️ Звонок внуку',
    level: 1,
    category: 'phone',
    description: 'Как быстро позвонить любимому внуку или внучке.',
    rewardStars: 10,
    rewardAchievement: 'caller',
    steps: [
      {
        instruction: 'Откройте приложение "Телефон" (нажмите на зеленую трубку на экране).',
        voiceText: 'Давайте позвоним внуку. Для начала нажмите на зеленую трубку телефона на вашем экране.',
        simulationType: 'call',
        simulationData: { step: 'open_app' }
      },
      {
        instruction: 'В списке контактов найдите "Внук Сережа" и нажмите на его имя.',
        voiceText: 'В списке контактов найдите имя Внук Сережа и нажмите на него.',
        simulationType: 'call',
        simulationData: { step: 'select_contact' }
      },
      {
        instruction: 'Нажмите на зеленую кнопку вызова, чтобы пошел звонок.',
        voiceText: 'Теперь нажмите на зеленую кнопку с трубкой, чтобы начать звонок внуку.',
        simulationType: 'call',
        simulationData: { step: 'ringing' }
      }
    ]
  },
  {
    id: 'lesson_4',
    title: '📨 Отправить SMS',
    level: 1,
    category: 'phone',
    description: 'Как написать и отправить простое текстовое сообщение.',
    rewardStars: 5,
    steps: [
      {
        instruction: 'Откройте приложение "Сообщения" (синий значок с облачком разговора).',
        voiceText: 'Чтобы написать сообщение, найдите и нажмите на синий значок сообщений на экране.',
        simulationType: 'sms',
        simulationData: { step: 'open_app' }
      },
      {
        instruction: 'Нажмите на поле ввода текста и выберите сообщение "Привет! Я учусь!" из списка.',
        voiceText: 'Нажмите на строку ввода и выберите готовую фразу Привет, я учусь.',
        simulationType: 'sms',
        simulationData: { step: 'type_text' }
      },
      {
        instruction: 'Нажмите на синий кружок со стрелочкой вверх, чтобы отправить сообщение.',
        voiceText: 'Теперь нажмите на стрелочку справа от вашего текста, чтобы отправить его.',
        simulationType: 'sms',
        simulationData: { step: 'send' }
      }
    ]
  },
  {
    id: 'lesson_5',
    title: '📷 Сделать фото',
    level: 2,
    category: 'phone',
    description: 'Как сфотографировать красивый пейзаж или свою семью.',
    rewardStars: 10,
    rewardAchievement: 'photographer',
    steps: [
      {
        instruction: 'Откройте приложение "Камера" (значок фотоаппарата).',
        voiceText: 'Чтобы делать снимки, нажмите на значок фотоаппарата на главном экране.',
        simulationType: 'camera',
        simulationData: { step: 'open_app' }
      },
      {
        instruction: 'Наведите на красивый пейзаж нашей природы и нажмите на большую круглую белую кнопку внизу.',
        voiceText: 'Направьте камеру и нажмите на большую белую круглую кнопку внизу экрана.',
        simulationType: 'camera',
        simulationData: { step: 'take_photo' }
      }
    ]
  },
  {
    id: 'lesson_6',
    title: '📤 Отправить фото',
    level: 2,
    category: 'phone',
    description: 'Как отправить сделанную фотографию внуку в чате.',
    rewardStars: 10,
    rewardAchievement: 'sender',
    steps: [
      {
        instruction: 'Зайдите в чат с внуком Сережей и нажмите на значок скрепки или плюса (+).',
        voiceText: 'Давайте отправим фото внуку. Откройте чат с ним и нажмите на значок плюса внизу слева.',
        simulationType: 'send_photo',
        simulationData: { step: 'open_attach' }
      },
      {
        instruction: 'Выберите сделанное фото нашей прекрасной природы из галереи.',
        voiceText: 'Теперь нажмите на сделанную ранее красивую фотографию природы.',
        simulationType: 'send_photo',
        simulationData: { step: 'select_photo' }
      },
      {
        instruction: 'Нажмите на зеленую кнопку со стрелочкой для отправки фотографии внуку.',
        voiceText: 'Наконец, нажмите на зеленую стрелочку отправки, чтобы фото долетело до внука.',
        simulationType: 'send_photo',
        simulationData: { step: 'send' }
      }
    ]
  },
  {
    id: 'lesson_7',
    title: '📱 Скачать приложение',
    level: 2,
    category: 'apps',
    description: 'Как устанавливать новые полезные приложения.',
    rewardStars: 10,
    steps: [
      {
        instruction: 'Зайдите в магазин приложений "Play Маркет" (значок с разноцветным треугольником).',
        voiceText: 'Чтобы скачать новую программу, найдите значок Плей Маркет с разноцветным треугольником.',
        simulationType: 'install',
        simulationData: { step: 'open_store' }
      },
      {
        instruction: 'Нажмите на строку поиска вверху, введите "Взаимопомощь" и нажмите на поиск.',
        voiceText: 'Нажмите на строчку поиска вверху экрана, чтобы найти приложение Взаимопомощь.',
        simulationType: 'install',
        simulationData: { step: 'search_app' }
      },
      {
        instruction: 'Нажмите зеленую кнопку "Установить" под названием приложения.',
        voiceText: 'Нажмите на большую зеленую кнопку Установить и подождите несколько секунд.',
        simulationType: 'install',
        simulationData: { step: 'installing' }
      }
    ]
  },
  {
    id: 'lesson_8',
    title: '💬 Чат в мессенджере',
    level: 2,
    category: 'apps',
    description: 'Как общаться и отправлять веселые картинки-смайлики.',
    rewardStars: 5,
    steps: [
      {
        instruction: 'Откройте чат с Анной (волонтёром нашего приложения).',
        voiceText: 'Давайте напишем нашему доброму помощнику Анне. Нажмите на чат с Анной.',
        simulationType: 'chat',
        simulationData: { step: 'open_chat' }
      },
      {
        instruction: 'Нажмите на значок смайлика и выберите улыбающуюся рожицу 😊, чтобы поприветствовать Анну.',
        voiceText: 'Нажмите на веселую улыбающуюся рожицу на экране, чтобы отправить тёплое приветствие.',
        simulationType: 'chat',
        simulationData: { step: 'send_emoji' }
      }
    ]
  },
  {
    id: 'lesson_9',
    title: '📸 Видеозвонок',
    level: 3,
    category: 'phone',
    description: 'Как звонить так, чтобы видеть лица друг друга вживую.',
    rewardStars: 15,
    rewardAchievement: 'video_star',
    steps: [
      {
        instruction: 'В чате с внуком Сережей нажмите на круглый значок видеокамеры в правом верхнем углу.',
        voiceText: 'Чтобы позвонить по видеосвязи, нажмите на значок видеокамеры вверху экрана.',
        simulationType: 'video',
        simulationData: { step: 'start_call' }
      },
      {
        instruction: 'Связь установлена! Внук Сережа ответил. Помашите ему рукой в камеру и пожелайте хорошего дня.',
        voiceText: 'Связь пошла! Внук Сережа вас отлично видит и машет вам рукой. Поприветствуйте его.',
        simulationType: 'video',
        simulationData: { step: 'talking' }
      }
    ]
  },
  {
    id: 'lesson_10',
    title: '💻 Компьютер: включить',
    level: 3,
    category: 'computer',
    description: 'Как включить домашний компьютер или ноутбук.',
    rewardStars: 5,
    steps: [
      {
        instruction: 'Найдите большую круглую кнопку со знаком (I/O) на корпусе системного блока компьютера и нажмите её.',
        voiceText: 'Давайте научимся включать большой компьютер. Нажмите на круглую кнопку включения на системном блоке.',
        simulationType: 'pc_power'
      }
    ]
  },
  {
    id: 'lesson_11',
    title: '💻 Компьютер: мышь',
    level: 3,
    category: 'computer',
    description: 'Как водить и кликать компьютерной мышкой.',
    rewardStars: 10,
    steps: [
      {
        instruction: 'Поймайте курсором мыши три красивые бабочки на экране. Нажимайте на них левой кнопкой мыши!',
        voiceText: 'Потренируемся управлять мышкой. Передвигайте курсор и нажимайте левой кнопкой мыши на бабочек.',
        simulationType: 'mouse'
      }
    ]
  },
  {
    id: 'lesson_12',
    title: '💻 Компьютер: клавиатура',
    level: 3,
    category: 'computer',
    description: 'Как печатать слова на компьютерной клавиатуре.',
    rewardStars: 10,
    rewardAchievement: 'pc_user',
    steps: [
      {
        instruction: 'Давайте напечатаем слово "ПОМОЩЬ". Нажимайте по очереди на буквы на клавиатуре.',
        voiceText: 'Напечатаем красивое слово Помощь на компьютерной клавиатуре. Нажимайте буквы на экране.',
        simulationType: 'keyboard'
      }
    ]
  },
  {
    id: 'lesson_13',
    title: '🌐 Интернет: поиск',
    level: 4,
    category: 'internet',
    description: 'Как искать нужную информацию в Яндексе или Гугле.',
    rewardStars: 10,
    rewardAchievement: 'searcher',
    steps: [
      {
        instruction: 'Нажмите на строку поиска Яндекса посередине экрана.',
        voiceText: 'Давайте поищем что-нибудь в интернете. Сначала нажмите на поисковую строку Яндекса.',
        simulationType: 'search',
        simulationData: { step: 'focus' }
      },
      {
        instruction: 'Введите поисковый запрос "рецепт пирогов с брусникой" и нажмите желтую кнопку "Найти".',
        voiceText: 'Введите текст рецепт пирогов с брусникой и нажмите большую желтую кнопку Найти.',
        simulationType: 'search',
        simulationData: { step: 'results' }
      }
    ]
  },
  {
    id: 'lesson_14',
    title: '🌐 Интернет: карты',
    level: 4,
    category: 'internet',
    description: 'Как находить на карте наши поселки, больницы и магазины.',
    rewardStars: 10,
    steps: [
      {
        instruction: 'Откройте приложение "Яндекс Карты" на экране.',
        voiceText: 'Давайте посмотрим карту нашего района. Нажмите на значок Яндекс Карты на телефоне.',
        simulationType: 'maps',
        simulationData: { step: 'open_app' }
      },
      {
        instruction: 'В строке поиска введите "Октябрьский" и посмотрите проложенный маршрут от вашего села.',
        voiceText: 'Введите название поселка Октябрьский в поиске, чтобы узнать расстояние и дорогу.',
        simulationType: 'maps',
        simulationData: { step: 'route' }
      }
    ]
  },
  {
    id: 'lesson_15',
    title: '🌐 Интернет: погода',
    level: 4,
    category: 'internet',
    description: 'Как узнать, будет ли сегодня дождь в вашем селе.',
    rewardStars: 5,
    steps: [
      {
        instruction: 'Откройте прогноз погоды Яндекс на телефоне.',
        voiceText: 'Чтобы узнать, одеваться ли теплее, откройте прогноз погоды на экране.',
        simulationType: 'weather',
        simulationData: { step: 'open' }
      },
      {
        instruction: 'Нажмите на кнопку "Погода на выходные", чтобы спланировать поход за грибами.',
        voiceText: 'Нажмите кнопку Погода на выходные, чтобы увидеть прогноз на субботу и воскресенье.',
        simulationType: 'weather',
        simulationData: { step: 'weekend' }
      }
    ]
  },
  {
    id: 'lesson_16',
    title: '🌐 Интернет: новости',
    level: 4,
    category: 'internet',
    description: 'Как читать свежие районные новости в местных газетах.',
    rewardStars: 5,
    steps: [
      {
        instruction: 'Откройте новостной сайт местной газеты "Районные вести".',
        voiceText: 'Прочитаем свежие новости нашего района. Нажмите на сайт Районные Вести.',
        simulationType: 'news',
        simulationData: { step: 'open' }
      },
      {
        instruction: 'Нажмите на заголовок "В Березнике открылся новый сквер для прогулок!", чтобы прочитать статью.',
        voiceText: 'Нажмите на новость про новый красивый сквер в Березнике, чтобы открыть статью.',
        simulationType: 'news',
        simulationData: { step: 'read' }
      }
    ]
  },
  {
    id: 'lesson_17',
    title: '🛒 Покупки онлайн',
    level: 5,
    category: 'apps',
    description: 'Как заказывать продукты и товары с доставкой в местные деревни.',
    rewardStars: 15,
    steps: [
      {
        instruction: 'В интернет-магазине местных фермеров добавьте свежий деревенский хлеб и молоко в корзину.',
        voiceText: 'Закажем свежие продукты. Нажмите на хлеб и молоко, чтобы добавить их в корзину.',
        simulationType: 'shop',
        simulationData: { step: 'add_to_cart' }
      },
      {
        instruction: 'Нажмите кнопку "Оформить заказ", чтобы курьер-помощник привез продукты прямо к вам домой.',
        voiceText: 'Нажмите на кнопку Оформить доставку, чтобы получить продукты на дом.',
        simulationType: 'shop',
        simulationData: { step: 'submit' }
      }
    ]
  },
  {
    id: 'lesson_18',
    title: '🏦 Банк онлайн',
    level: 5,
    category: 'apps',
    description: 'Как безопасно проверять пенсию и оплачивать счета.',
    rewardStars: 15,
    steps: [
      {
        instruction: 'Откройте приложение вашего банка НашБанк-Онлайн.',
        voiceText: 'Давайте проверим зачисление пенсии. Нажмите на значок Банка на экране.',
        simulationType: 'bank',
        simulationData: { step: 'open' }
      },
      {
        instruction: 'Нажмите на закрытый глазок рядом с балансом карты, чтобы посмотреть остаток средств.',
        voiceText: 'Нажмите на значок глазика у карты, чтобы открыть баланс вашего счета.',
        simulationType: 'bank',
        simulationData: { step: 'show_balance' }
      }
    ]
  },
  {
    id: 'lesson_19',
    title: '🔒 Безопасность',
    level: 5,
    category: 'safety',
    description: 'Как не верить мошенникам и защитить свои сбережения.',
    rewardStars: 20,
    rewardAchievement: 'safe_user',
    steps: [
      {
        instruction: 'Вам звонит незнакомец с неизвестного номера и говорит: "Я из службы безопасности, продиктуйте код из сообщения!". Что вы сделаете?',
        voiceText: 'Вам звонят подозрительные люди и требуют коды или перевести деньги. Запомните: сотрудники банков никогда не просят коды! Срочно сбросьте звонок.',
        simulationType: 'security'
      }
    ]
  },
  {
    id: 'lesson_20',
    title: '📱 Все вместе',
    level: 5,
    category: 'safety',
    description: 'Итоговое повторение и получение главного диплома Мастера!',
    rewardStars: 25,
    rewardAchievement: 'master',
    steps: [
      {
        instruction: 'Выполните финальное задание: откройте чат с внуком и отправьте ему слово "УРА!", подтверждая свои знания.',
        voiceText: 'Вы дошли до конца курса! Напишите слово Ура в чате с внуком Сережей, чтобы завершить обучение.',
        simulationType: 'review'
      }
    ]
  }
];

export const ACHIEVEMENTS = [
  { id: 'first_step', title: 'Первый шаг 🚀', condition: 'Завершен 1 урок', icon: '🚀', desc: 'Начало вашего удивительного пути в цифровой мир!' },
  { id: 'caller', title: 'Я звоню! 📞', condition: 'Пройден урок "Звонок внуку"', icon: '📞', desc: 'Умеет легко созваниваться с близкими.' },
  { id: 'photographer', title: 'Фотограф 📷', condition: 'Пройден урок "Сделать фото"', icon: '📷', desc: 'Умеет ловить прекрасные моменты нашей жизни.' },
  { id: 'sender', title: 'Отправитель 📤', condition: 'Пройден урок "Отправить фото"', icon: '📤', desc: 'Делится красивыми снимками с семьей.' },
  { id: 'video_star', title: 'Видеозвезда 🎥', condition: 'Пройден урок "Видеозвонок"', icon: '🎥', desc: 'Видит лица родных, несмотря на расстояния.' },
  { id: 'pc_user', title: 'Пользователь ПК 💻', condition: 'Пройден урок "Компьютер: клавиатура"', icon: '💻', desc: 'Освоил большой домашний компьютер.' },
  { id: 'searcher', title: 'Поисковик 🔍', condition: 'Пройден урок "Интернет: поиск"', icon: '🔍', desc: 'Может найти ответ на любой сложный вопрос.' },
  { id: 'safe_user', title: 'Безопасный пользователь 🔒', condition: 'Пройден урок "Безопасность"', icon: '🔒', desc: 'Мошенникам его не обмануть!' },
  { id: 'master', title: 'Мастер Технологий 🌟', condition: 'Все 20 уроков пройдены!', icon: '🌟', desc: 'Гордость всей семьи и пример для соседей!' }
];

export const LEVELS = [
  { id: 1, name: '🌱 Ученик', desc: 'Начало пути. Освоение базовых кнопок и звонков.', badge: '🌱 Ученик' },
  { id: 2, name: '📱 Пользователь', desc: 'Базовый уровень. Сообщения, фото и скачивание программ.', badge: '📱 Пользователь' },
  { id: 3, name: '📸 Продвинутый', desc: 'Средний уровень. Видеозвонки и основы компьютера.', badge: '📸 Продвинутый' },
  { id: 4, name: '💻 Эксперт', desc: 'Высокий уровень. Поиск в Яндексе, карты и новости.', badge: '💻 Эксперт' },
  { id: 5, name: '🌟 Мастер', desc: 'Полный триумф! Онлайн-покупки, банки и безопасность.', badge: '🌟 Мастер' }
];
