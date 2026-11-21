import { InteractiveVillage, VillageHouse, VillageResident, VillageFamilyTree, MemorialPlaqueConfig } from '../types';

export const INITIAL_VILLAGES: InteractiveVillage[] = [
  {
    id: 'village_likhachevo',
    name: 'Лихачёво',
    region: 'Архангельская область',
    district: 'Устьянский район',
    description: 'Старинная северная деревня на высоком берегу реки Устья. Славится династиями мастеров деревянного зодчества, резными пятистенными избами и вековыми традициями взаимопомощи.',
    coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    map: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    foundedYear: 1710,
    housesCount: 28,
    residentsCount: 94,
    heritageFeatures: ['Северное деревянное зодчество', 'Резные наличники', 'Родовые гнезда', 'Река Устья'],
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'village_bereznik',
    name: 'Березник',
    region: 'Архангельская область',
    district: 'Устьянский район',
    description: 'Живописная деревня среди березовых рощ и заливных лугов. Известна своими кузнецами, династиями пчеловодов и уникальным родником с целебной студеной водой.',
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    map: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    foundedYear: 1745,
    housesCount: 34,
    residentsCount: 118,
    heritageFeatures: ['Березовые рощи', 'Кузнечный хутор', 'Пасеки', 'Святой источник'],
    createdAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: 'village_shangaly',
    name: 'Шангалы',
    region: 'Архангельская область',
    district: 'Устьянский район',
    description: 'Историческое поморское село с многовековой летописью. Родина просветителей, краеведов, мастеров резьбы по кости и строителей северных лодок-карбасов.',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    map: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    foundedYear: 1650,
    housesCount: 52,
    residentsCount: 186,
    heritageFeatures: ['Краеведческий архив', 'Музей северного быта', 'Лодки-карбасы', 'Торговые ряды'],
    createdAt: '2024-02-10T00:00:00.000Z'
  },
  {
    id: 'village_dmitrievo',
    name: 'Дмитриево',
    region: 'Архангельская область',
    district: 'Устьянский район',
    description: 'Деревня северных сказителей и плотников. Здесь сохранились двухэтажные срубы XIX века с взвозами для саней и просторными подклетами.',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    map: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    foundedYear: 1780,
    housesCount: 19,
    residentsCount: 62,
    heritageFeatures: ['Двухэтажные избы', 'Взвозы для телег', 'Северное ткачество'],
    createdAt: '2024-03-05T00:00:00.000Z'
  }
];

export const INITIAL_HOUSES: VillageHouse[] = [
  // --- Лихачёво Houses ---
  {
    id: 'house_likh_1',
    villageId: 'village_likhachevo',
    address: 'ул. Центральная, д. 5',
    houseNumber: '5',
    street: 'ул. Центральная',
    coordinates: { lat: 61.1245, lng: 43.1890, mapX: 28, mapY: 38 },
    photo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=80'
    ],
    yearBuilt: 1952,
    architecturalStyle: 'Северная пятистенная изба из лиственницы',
    residents: ['res_petrov_ivan', 'res_petrova_anna', 'res_petrov_sergey'],
    history: 'Дом построен в 1952 году ветераном войны Иваном Васильевичем Петровым взамен старой сгоревшей отцовской избы. Рубили всем миром из отборного смолистого леса, сплавленного по Устье. Крыльцо украшено ажурной пропильной резьбой с солярными знаками.',
    condition: 'preserved',
    memorialPlaque: {
      houseId: 'house_likh_1',
      villageId: 'village_likhachevo',
      title: 'ДОМ ПЕТРОВЫХ',
      subtitle: 'Родовое гнездо с 1952 года',
      foundersNames: ['Иван Васильевич Петров (1930–2005)', 'Анна Григорьевна Петрова (1935–2010)'],
      addressText: 'д. Лихачёво, ул. Центральная, д. 5',
      style: 'wood',
      customQuote: '«Помни корни свои, храни доброту и тепло родного очага»',
      includeQr: true,
      orderRequested: false
    },
    createdAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: 'house_likh_2',
    villageId: 'village_likhachevo',
    address: 'ул. Набережная, д. 1',
    houseNumber: '1',
    street: 'ул. Набережная',
    coordinates: { lat: 61.1250, lng: 43.1870, mapX: 45, mapY: 22 },
    photo: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=80',
    photos: [
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=80'
    ],
    yearBuilt: 1912,
    architecturalStyle: 'Дом-усадьба с мезонином и высоким подклетом',
    residents: ['res_smirnov_nikolay', 'res_smirnova_marfa'],
    history: 'Родовой дом купца и артельщика Смирнова. В Великую Отечественную войну в мезонине дома размещался сельский штаб помощи фронту и пункт сбора теплых вещей для бойцов.',
    condition: 'wooden_heritage',
    memorialPlaque: {
      houseId: 'house_likh_2',
      villageId: 'village_likhachevo',
      title: 'УСАДЬБА СМИРНОВЫХ',
      subtitle: 'Памятник северного быта 1912 года',
      foundersNames: ['Николай Андреевич Смирнов (1905–1983)', 'Марфа Ильинична Смирнова (1908–1996)'],
      addressText: 'д. Лихачёво, ул. Набережная, д. 1',
      style: 'brass',
      includeQr: true
    },
    createdAt: '2024-01-22T00:00:00.000Z'
  },
  {
    id: 'house_likh_3',
    villageId: 'village_likhachevo',
    address: 'ул. Заречная, д. 12',
    houseNumber: '12',
    street: 'ул. Заречная',
    coordinates: { lat: 61.1235, lng: 43.1920, mapX: 68, mapY: 55 },
    photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    yearBuilt: 1968,
    architecturalStyle: 'Бревенчатый сруб с резным крыльцом и пасекой',
    residents: ['res_kovalev_fedor', 'res_kovaleva_pelageya'],
    history: 'Дом деревенского кузнеца Федора Ковалёва. На усадьбе до сих пор действует старинная ручная кузница, где ковались плуги, топоры и подковы для всей округи.',
    condition: 'renovated',
    createdAt: '2024-01-25T00:00:00.000Z'
  },
  {
    id: 'house_likh_4',
    villageId: 'village_likhachevo',
    address: 'ул. Луговая, д. 8',
    houseNumber: '8',
    street: 'ул. Луговая',
    coordinates: { lat: 61.1220, lng: 43.1850, mapX: 18, mapY: 72 },
    photo: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80',
    yearBuilt: 1975,
    architecturalStyle: 'Светлая сосновая изба с яблоневым садом',
    residents: ['res_petrov_dmitry', 'res_petrova_elena'],
    history: 'Построен младшим поколением семьи Петровых. Дом славится гостеприимством и семейными праздниками с самоваром на еловых шишках.',
    condition: 'preserved',
    createdAt: '2024-01-28T00:00:00.000Z'
  },

  // --- Березник Houses ---
  {
    id: 'house_ber_1',
    villageId: 'village_bereznik',
    address: 'ул. Сосновая, д. 3',
    houseNumber: '3',
    street: 'ул. Сосновая',
    coordinates: { lat: 61.2100, lng: 43.2500, mapX: 35, mapY: 42 },
    photo: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1000&q=80',
    yearBuilt: 1938,
    architecturalStyle: 'Двухрядный северный дом с хлевом и сеновалом под одной крышей',
    residents: ['res_morozov_arkadiy'],
    history: 'Традиционный северный дом «кошель». Зимой жильцы не выходили на мороз для ухода за скотом. В доме сохранилась русская печь с лежанкой и глинобитными подами.',
    condition: 'preserved',
    memorialPlaque: {
      houseId: 'house_ber_1',
      villageId: 'village_bereznik',
      title: 'ДОМ МОРОЗОВЫХ',
      subtitle: 'Династия пчеловодов и хлеборобов',
      foundersNames: ['Аркадий Степанович Морозов (1920–2001)'],
      addressText: 'д. Березник, ул. Сосновая, д. 3',
      style: 'granite',
      includeQr: true
    },
    createdAt: '2024-02-05T00:00:00.000Z'
  },

  // --- Шангалы Houses ---
  {
    id: 'house_shan_1',
    villageId: 'village_shangaly',
    address: 'ул. Ленина, д. 14',
    houseNumber: '14',
    street: 'ул. Ленина',
    coordinates: { lat: 61.1500, lng: 43.1600, mapX: 52, mapY: 48 },
    photo: 'https://images.unsplash.com/photo-1473800447596-01729482b8eb?auto=format&fit=crop&w=1000&q=80',
    yearBuilt: 1905,
    architecturalStyle: 'Купеческий особняк с резными балконами',
    residents: ['res_belozerov_semen'],
    history: 'Старинный дом рода Белозеровых. Здесь располагалась первая в волости бесплатная изба-читальня и склад семян для крестьянских хозяйств.',
    condition: 'wooden_heritage',
    createdAt: '2024-02-12T00:00:00.000Z'
  }
];

export const INITIAL_RESIDENTS: VillageResident[] = [
  // Петров Иван Васильевич (Дедушка)
  {
    id: 'res_petrov_ivan',
    houseId: 'house_likh_1',
    villageId: 'village_likhachevo',
    name: 'Иван Васильевич Петров',
    gender: 'male',
    birthYear: 1930,
    deathYear: 2005,
    birthPlace: 'д. Лихачёво, Устьянский район',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    biography: 'Родился и всю жизнь прожил в Лихачёво. В подростковом возрасте в военные годы трудился на колхозных полях и сплаве леса по Устье. Освоил ремесло плотника у деда. Построил более 15 жилых домов в деревне и соседних селах, отреставрировал деревенскую часовню. 42 года проработал бригадиром строительной бригады совхоза «Устьянский». Всегда приходил на помощь соседям, учил молодежь топору и честному труду.',
    achievements: [
      'Ветеран труда',
      'Медаль «За доблестный труд в Великой Отечественной войне 1941–1945 гг.»',
      'Почётный мастер Устьянского района',
      'Орден «Знак Почёта» (1976)'
    ],
    occupation: 'Главный мастер-плотник, бригадир',
    militaryService: 'Труженик тыла (1941–1945), служба в погранвойсках (1950–1953)',
    isAlive: false,
    relatives: [
      { residentId: 'res_petrova_anna', relation: 'spouse', note: 'Венчались в 1955 году, прожили вместе 50 лет' },
      { residentId: 'res_petrov_sergey', relation: 'child', note: 'Сын' },
      { residentId: 'res_petrova_maria', relation: 'child', note: 'Дочь' },
      { residentId: 'res_petrova_olga', relation: 'grandchild', note: 'Внучка' },
      { residentId: 'res_petrov_dmitry', relation: 'grandchild', note: 'Внук' }
    ],
    gallery: [
      { id: 'g1', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80', caption: 'Иван Васильевич за рубкой сруба, 1968 г.', year: 1968 },
      { id: 'g2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', caption: 'Семейное торжество у дома №5, 1980 г.', year: 1980 }
    ],
    createdAt: '2024-01-20T00:00:00.000Z'
  },

  // Петрова Анна Григорьевна (Бабушка)
  {
    id: 'res_petrova_anna',
    houseId: 'house_likh_1',
    villageId: 'village_likhachevo',
    name: 'Анна Григорьевна Петрова (дев. Смирнова)',
    gender: 'female',
    birthYear: 1935,
    deathYear: 2010,
    birthPlace: 'д. Березник',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    biography: 'Учительница начальных классов сельской школы. Окончила Великоустюгское педагогическое училище. Научила грамоте и любви к книге три поколения деревенских ребят. Собирала поморские сказки, частушки и рукоделие. Создала первый школьный музей боевой и трудовой славы.',
    achievements: [
      'Отличник народного просвещения РСФСР',
      'Заслуженный учитель',
      'Медаль «Ветеран труда»',
      'Хранитель народных традиций'
    ],
    occupation: 'Учитель начальных классов, директор сельской школы',
    isAlive: false,
    relatives: [
      { residentId: 'res_petrov_ivan', relation: 'spouse', note: 'Муж' },
      { residentId: 'res_petrov_sergey', relation: 'child', note: 'Сын' },
      { residentId: 'res_petrova_maria', relation: 'child', note: 'Дочь' },
      { residentId: 'res_petrova_olga', relation: 'grandchild', note: 'Внучка' },
      { residentId: 'res_petrov_dmitry', relation: 'grandchild', note: 'Внук' }
    ],
    createdAt: '2024-01-20T00:00:00.000Z'
  },

  // Петров Сергей Иванович (Сын)
  {
    id: 'res_petrov_sergey',
    houseId: 'house_likh_1',
    villageId: 'village_likhachevo',
    name: 'Сергей Иванович Петров',
    gender: 'male',
    birthYear: 1960,
    birthPlace: 'д. Лихачёво',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    biography: 'Продолжатель династии плотников. Окончил Архангельский лесотехнический институт. Эксперт по сохранению деревянных памятников Русского Севера. Ведет мастер-классы для молодежи, активно участвует в проекте «Взаимопомощь» и оцифровке архивов деревни.',
    achievements: [
      'Мастер народных художественных промыслов',
      'Участник восстановления памятников деревянного зодчества',
      'Медаль за вклад в культуру Русского Севера'
    ],
    occupation: 'Инженер-строитель, мастер-реставратор',
    isAlive: true,
    relatives: [
      { residentId: 'res_petrov_ivan', relation: 'parent', note: 'Отец' },
      { residentId: 'res_petrova_anna', relation: 'parent', note: 'Мать' },
      { residentId: 'res_petrova_maria', relation: 'sibling', note: 'Сестра' },
      { residentId: 'res_petrova_olga', relation: 'child', note: 'Дочь' },
      { residentId: 'res_petrov_dmitry', relation: 'child', note: 'Сын' }
    ],
    createdAt: '2024-01-21T00:00:00.000Z'
  },

  // Петрова Ольга Сергеевна (Внучка)
  {
    id: 'res_petrova_olga',
    houseId: 'house_likh_1',
    villageId: 'village_likhachevo',
    name: 'Ольга Сергеевна Петрова',
    gender: 'female',
    birthYear: 1985,
    birthPlace: 'пос. Октябрьский',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    biography: 'Врач общей практики Устьянской районной больницы. Инициатор создания цифрового медицинского пункта и консультаций для пожилых жителей отдаленных деревень.',
    achievements: [
      'Врач высшей категории',
      'Победитель конкурса «Сельский доктор»',
      'Волонтер движения взаимопомощи'
    ],
    occupation: 'Семейный доктор, терапевт',
    isAlive: true,
    relatives: [
      { residentId: 'res_petrov_sergey', relation: 'parent', note: 'Отец' },
      { residentId: 'res_petrov_dmitry', relation: 'sibling', note: 'Брат' },
      { residentId: 'res_petrov_ivan', relation: 'grandparent', note: 'Дедушка' },
      { residentId: 'res_petrova_anna', relation: 'grandparent', note: 'Бабушка' }
    ],
    createdAt: '2024-01-22T00:00:00.000Z'
  },

  // Петров Дмитрий Сергеевич (Внук)
  {
    id: 'res_petrov_dmitry',
    houseId: 'house_likh_4',
    villageId: 'village_likhachevo',
    name: 'Дмитрий Сергеевич Петров',
    gender: 'male',
    birthYear: 1990,
    birthPlace: 'д. Лихачёво',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    biography: 'Инженер-программист и энтузиаст краеведения. Живет в Лихачёво, работает удаленно и развивает деревенскую инфраструктуру, скоростной интернет и цифровые сервисы для земляков.',
    achievements: [
      'Организатор точки доступа Wi-Fi в деревне',
      'Разработчик цифрового архива Устьян',
      'Активист молодежного совета района'
    ],
    occupation: 'IT-специалист, общественный деятель',
    isAlive: true,
    relatives: [
      { residentId: 'res_petrov_sergey', relation: 'parent', note: 'Отец' },
      { residentId: 'res_petrova_olga', relation: 'sibling', note: 'Сестра' },
      { residentId: 'res_petrova_elena', relation: 'spouse', note: 'Супруга' }
    ],
    createdAt: '2024-01-23T00:00:00.000Z'
  },

  // Петрова Елена Александровна (Жена Дмитрия)
  {
    id: 'res_petrova_elena',
    houseId: 'house_likh_4',
    villageId: 'village_likhachevo',
    name: 'Елена Александровна Петрова',
    gender: 'female',
    birthYear: 1992,
    birthPlace: 'с. Шангалы',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    biography: 'Преподаватель биологии и экологии. Организует школьные ботанические экспедиции по реке Устья, возрождает традиции сбора северных трав и ферментированного иван-чая.',
    achievements: [
      'Руководитель школьного лесничества',
      'Автор книги «Травы и былицы Поважья»'
    ],
    occupation: 'Эколог, педагог',
    isAlive: true,
    relatives: [
      { residentId: 'res_petrov_dmitry', relation: 'spouse', note: 'Муж' }
    ],
    createdAt: '2024-01-24T00:00:00.000Z'
  },

  // Петрова Мария Ивановна (Дочь Ивана Васильевича)
  {
    id: 'res_petrova_maria',
    houseId: 'house_likh_1',
    villageId: 'village_likhachevo',
    name: 'Мария Ивановна Петрова',
    gender: 'female',
    birthYear: 1965,
    birthPlace: 'д. Лихачёво',
    photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
    biography: 'Экономист, долгие годы заведовала сельским почтовым отделением, связывала жителей с родственниками по всей стране через письма, телеграммы и посылки.',
    achievements: [
      'Почетный работник связи',
      'Благодарность губернатора Архангельской области'
    ],
    occupation: 'Заведующая почтовым отделением',
    isAlive: true,
    relatives: [
      { residentId: 'res_petrov_ivan', relation: 'parent', note: 'Отец' },
      { residentId: 'res_petrova_anna', relation: 'parent', note: 'Мать' },
      { residentId: 'res_petrov_sergey', relation: 'sibling', note: 'Брат' }
    ],
    createdAt: '2024-01-25T00:00:00.000Z'
  },

  // Смирнов Николай Андреевич
  {
    id: 'res_smirnov_nikolay',
    houseId: 'house_likh_2',
    villageId: 'village_likhachevo',
    name: 'Николай Андреевич Смирнов',
    gender: 'male',
    birthYear: 1905,
    deathYear: 1983,
    birthPlace: 'д. Лихачёво',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    biography: 'Участник Великой Отечественной войны. Воевал на Карельском фронте, командовал пулеметным расчетом. После демобилизации вернулся в родную деревню, восстанавливал колхозную мельницу и лесопилку. Был бессменным сельским судьей чести и мира.',
    achievements: [
      'Орден Отечественной войны I степени',
      'Орден Красной Звезды',
      'Медаль «За отвагу»',
      'Медаль «За оборону Советского Заполярья»'
    ],
    occupation: 'Мельник, фронтовик, старейшина деревни',
    militaryService: '1941–1945, Карельский фронт',
    isAlive: false,
    relatives: [
      { residentId: 'res_smirnova_marfa', relation: 'spouse', note: 'Супруга' }
    ],
    createdAt: '2024-01-22T00:00:00.000Z'
  },

  // Смирнова Марфа Ильинична
  {
    id: 'res_smirnova_marfa',
    houseId: 'house_likh_2',
    villageId: 'village_likhachevo',
    name: 'Марфа Ильинична Смирнова',
    gender: 'female',
    birthYear: 1908,
    deathYear: 1996,
    birthPlace: 'д. Березник',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    biography: 'Знаменитая северная кружевница и травница. Ее полотенца с бранным ткачеством и вышивкой хранятся в Архангельском музее краеведения. Знала старинные северные заговоры от болезней, помогала роженицам.',
    achievements: [
      'Мастер традиционного северного ткачества',
      'Медаль за доблестный труд в тылу'
    ],
    occupation: 'Ткачиха, народный лекарь',
    isAlive: false,
    relatives: [
      { residentId: 'res_smirnov_nikolay', relation: 'spouse', note: 'Муж' }
    ],
    createdAt: '2024-01-22T00:00:00.000Z'
  },

  // Ковалёв Федор Михайлович
  {
    id: 'res_kovalev_fedor',
    houseId: 'house_likh_3',
    villageId: 'village_likhachevo',
    name: 'Федор Михайлович Ковалёв',
    gender: 'male',
    birthYear: 1918,
    deathYear: 1991,
    birthPlace: 'д. Лихачёво',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    biography: 'Потомственный кузнец. Его отец ковал решетки и кресты для северных храмов, а Федор обустроил образцовую механическую мастерскую. В годы войны ковал санитарные волокуши и инструмент для лесозаготовок.',
    achievements: [
      'Почетный кузнец Устьянского района',
      'Ветеран трудового фронта'
    ],
    occupation: 'Кузнец, мастер художественной ковки',
    isAlive: false,
    relatives: [
      { residentId: 'res_kovaleva_pelageya', relation: 'spouse', note: 'Супруга' }
    ],
    createdAt: '2024-01-25T00:00:00.000Z'
  },

  // Ковалёва Пелагея Савельевна
  {
    id: 'res_kovaleva_pelageya',
    houseId: 'house_likh_3',
    villageId: 'village_likhachevo',
    name: 'Пелагея Савельевна Ковалёва',
    gender: 'female',
    birthYear: 1922,
    deathYear: 2004,
    birthPlace: 'с. Шангалы',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    biography: 'Медсестра военного госпиталя, после войны — бессменный фельдшер деревень Лихачёво и Березник. В любую метель пешком или на лошади добиралась до больных хуторов.',
    achievements: [
      'Медаль «За боевые заслуги»',
      'Знак «Отличник здравоохранения»'
    ],
    occupation: 'Военная медсестра, сельский фельдшер',
    isAlive: false,
    relatives: [
      { residentId: 'res_kovalev_fedor', relation: 'spouse', note: 'Муж' }
    ],
    createdAt: '2024-01-25T00:00:00.000Z'
  },

  // Морозов Аркадий Степанович (Березник)
  {
    id: 'res_morozov_arkadiy',
    houseId: 'house_ber_1',
    villageId: 'village_bereznik',
    name: 'Аркадий Степанович Морозов',
    gender: 'male',
    birthYear: 1920,
    deathYear: 2001,
    birthPlace: 'д. Березник',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    biography: 'Основатель образцовой пасеки «Северный нектар». Изучал зимовку пчел в суровых северных условиях. Снабжал целебным вересковым и липовым медом госпитали и школы.',
    achievements: [
      'Заслуженный пчеловод РСФСР',
      'Орден Трудового Красного Знамени'
    ],
    occupation: 'Главный пасечник, агроном',
    isAlive: false,
    relatives: [],
    createdAt: '2024-02-05T00:00:00.000Z'
  },

  // Белозеров Семен Карпович (Шангалы)
  {
    id: 'res_belozerov_semen',
    houseId: 'house_shan_1',
    villageId: 'village_shangaly',
    name: 'Семен Карпович Белозеров',
    gender: 'male',
    birthYear: 1885,
    deathYear: 1962,
    birthPlace: 'с. Шангалы',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    biography: 'Купец II гильдии, меценат, основатель первой публичной библиотеки и школы грамоты для крестьянских детей. Внес огромный вклад в строительство моста через Устью.',
    achievements: [
      'Почетный гражданин Устьянского края',
      'Благотворитель народных школ'
    ],
    occupation: 'Купец, меценат, просветитель',
    isAlive: false,
    relatives: [],
    createdAt: '2024-02-12T00:00:00.000Z'
  }
];

export const INITIAL_FAMILY_TREES: VillageFamilyTree[] = [
  {
    id: 'tree_petrov_family',
    villageId: 'village_likhachevo',
    rootResidentId: 'res_petrov_ivan',
    connections: [
      { from: 'res_petrov_ivan', to: 'res_petrova_anna', relation: 'spouse' },
      { from: 'res_petrov_ivan', to: 'res_petrov_sergey', relation: 'child' },
      { from: 'res_petrov_ivan', to: 'res_petrova_maria', relation: 'child' },
      { from: 'res_petrov_sergey', to: 'res_petrova_olga', relation: 'child' },
      { from: 'res_petrov_sergey', to: 'res_petrov_dmitry', relation: 'child' },
      { from: 'res_petrov_dmitry', to: 'res_petrova_elena', relation: 'spouse' }
    ],
    createdAt: '2024-01-20T00:00:00.000Z'
  }
];

// Local storage keys for instant responsiveness and offline caching
export const STORAGE_KEYS = {
  VILLAGES: 'vzaimopomosh_village_archive_villages',
  HOUSES: 'vzaimopomosh_village_archive_houses',
  RESIDENTS: 'vzaimopomosh_village_archive_residents',
  TREES: 'vzaimopomosh_village_archive_trees',
  PLAQUES: 'vzaimopomosh_village_archive_plaques'
};

export function getStoredVillages(): InteractiveVillage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VILLAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached villages:', e);
  }
  return INITIAL_VILLAGES;
}

export function saveStoredVillages(villages: InteractiveVillage[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VILLAGES, JSON.stringify(villages));
  } catch (e) {
    console.error('Failed to save villages to storage:', e);
  }
}

export function getStoredHouses(): VillageHouse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOUSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached houses:', e);
  }
  return INITIAL_HOUSES;
}

export function saveStoredHouses(houses: VillageHouse[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(houses));
  } catch (e) {
    console.error('Failed to save houses to storage:', e);
  }
}

export function getStoredResidents(): VillageResident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached residents:', e);
  }
  return INITIAL_RESIDENTS;
}

export function saveStoredResidents(residents: VillageResident[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
  } catch (e) {
    console.error('Failed to save residents to storage:', e);
  }
}

export function getStoredFamilyTrees(): VillageFamilyTree[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TREES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached family trees:', e);
  }
  return INITIAL_FAMILY_TREES;
}

export function saveStoredFamilyTrees(trees: VillageFamilyTree[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TREES, JSON.stringify(trees));
  } catch (e) {
    console.error('Failed to save family trees to storage:', e);
  }
}
