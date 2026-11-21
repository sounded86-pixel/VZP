export interface RegionInfo {
  code: string;
  name: string;
  type: 'republic' | 'krai' | 'oblast' | 'federal_city' | 'autonomous_okrug' | 'autonomous_oblast';
}

export interface DistrictInfo {
  code: string;
  name: string;
}

export interface VillageInfo {
  code: string;
  name: string;
}

// All 89 regions of the Russian Federation
export const RUSSIAN_REGIONS: RegionInfo[] = [
  // Republics (24)
  { code: 'RU-AD', name: 'Республика Адыгея', type: 'republic' },
  { code: 'RU-AL', name: 'Республика Алтай', type: 'republic' },
  { code: 'RU-BA', name: 'Республика Башкортостан', type: 'republic' },
  { code: 'RU-BU', name: 'Республика Бурятия', type: 'republic' },
  { code: 'RU-DA', name: 'Республика Дагестан', type: 'republic' },
  { code: 'RU-IN', name: 'Республика Ингушетия', type: 'republic' },
  { code: 'RU-KB', name: 'Кабардино-Балкарская Республика', type: 'republic' },
  { code: 'RU-KL', name: 'Республика Калмыкия', type: 'republic' },
  { code: 'RU-KC', name: 'Карачаево-Черкесская Республика', type: 'republic' },
  { code: 'RU-KR', name: 'Республика Карелия', type: 'republic' },
  { code: 'RU-KO', name: 'Республика Коми', type: 'republic' },
  { code: 'RU-CR', name: 'Республика Крым', type: 'republic' },
  { code: 'RU-ME', name: 'Республика Марий Эл', type: 'republic' },
  { code: 'RU-MO', name: 'Республика Мордовия', type: 'republic' },
  { code: 'RU-SA', name: 'Республика Саха (Якутия)', type: 'republic' },
  { code: 'RU-SE', name: 'Республика Северная Осетия — Алания', type: 'republic' },
  { code: 'RU-TA', name: 'Республика Татарстан', type: 'republic' },
  { code: 'RU-TY', name: 'Республика Тыва', type: 'republic' },
  { code: 'RU-UD', name: 'Удмуртская Республика', type: 'republic' },
  { code: 'RU-KK', name: 'Республика Хакасия', type: 'republic' },
  { code: 'RU-CE', name: 'Чеченская Республика', type: 'republic' },
  { code: 'RU-CU', name: 'Чувашская Республика', type: 'republic' },
  { code: 'RU-DL', name: 'Донецкая Народная Республика', type: 'republic' },
  { code: 'RU-LN', name: 'Луганская Народная Республика', type: 'republic' },

  // Krais (9)
  { code: 'RU-ALT', name: 'Алтайский край', type: 'krai' },
  { code: 'RU-ZAB', name: 'Забайкальский край', type: 'krai' },
  { code: 'RU-KAM', name: 'Камчатский край', type: 'krai' },
  { code: 'RU-KDA', name: 'Краснодарский край', type: 'krai' },
  { code: 'RU-KYA', name: 'Красноярский край', type: 'krai' },
  { code: 'RU-PER', name: 'Пермский край', type: 'krai' },
  { code: 'RU-PRI', name: 'Приморский край', type: 'krai' },
  { code: 'RU-STA', name: 'Ставропольский край', type: 'krai' },
  { code: 'RU-KHA', name: 'Хабаровский край', type: 'krai' },

  // Oblasts (48)
  { code: 'RU-AMU', name: 'Амурская область', type: 'oblast' },
  { code: 'RU-ARK', name: 'Архангельская область', type: 'oblast' },
  { code: 'RU-AST', name: 'Астраханская область', type: 'oblast' },
  { code: 'RU-BEL', name: 'Белгородская область', type: 'oblast' },
  { code: 'RU-BRY', name: 'Брянская область', type: 'oblast' },
  { code: 'RU-VLA', name: 'Владимирская область', type: 'oblast' },
  { code: 'RU-VGG', name: 'Волгоградская область', type: 'oblast' },
  { code: 'RU-VLG', name: 'Вологодская область', type: 'oblast' },
  { code: 'RU-VOR', name: 'Воронежская область', type: 'oblast' },
  { code: 'RU-ZAP', name: 'Запорожская область', type: 'oblast' },
  { code: 'RU-IVA', name: 'Ивановская область', type: 'oblast' },
  { code: 'RU-IRK', name: 'Иркутская область', type: 'oblast' },
  { code: 'RU-KGD', name: 'Калининградская область', type: 'oblast' },
  { code: 'RU-KLU', name: 'Калужская область', type: 'oblast' },
  { code: 'RU-KEM', name: 'Кемеровская область', type: 'oblast' },
  { code: 'RU-KIR', name: 'Кировская область', type: 'oblast' },
  { code: 'RU-KOS', name: 'Костромская область', type: 'oblast' },
  { code: 'RU-KUG', name: 'Курганская область', type: 'oblast' },
  { code: 'RU-KRS', name: 'Курская область', type: 'oblast' },
  { code: 'RU-LEN', name: 'Ленинградская область', type: 'oblast' },
  { code: 'RU-LIP', name: 'Липецкая область', type: 'oblast' },
  { code: 'RU-MAG', name: 'Магаданская область', type: 'oblast' },
  { code: 'RU-MOS', name: 'Московская область', type: 'oblast' },
  { code: 'RU-MUR', name: 'Мурманская область', type: 'oblast' },
  { code: 'RU-NGR', name: 'Новгородская область', type: 'oblast' },
  { code: 'RU-NVS', name: 'Новосибирская область', type: 'oblast' },
  { code: 'RU-OMS', name: 'Омская область', type: 'oblast' },
  { code: 'RU-ORE', name: 'Оренбургская область', type: 'oblast' },
  { code: 'RU-ORL', name: 'Орловская область', type: 'oblast' },
  { code: 'RU-PNZ', name: 'Пензенская область', type: 'oblast' },
  { code: 'RU-PSK', name: 'Псковская область', type: 'oblast' },
  { code: 'RU-ROS', name: 'Ростовская область', type: 'oblast' },
  { code: 'RU-RYA', name: 'Рязанская область', type: 'oblast' },
  { code: 'RU-SAM', name: 'Самарская область', type: 'oblast' },
  { code: 'RU-SAR', name: 'Саратовская область', type: 'oblast' },
  { code: 'RU-SAH', name: 'Сахалинская область', type: 'oblast' },
  { code: 'RU-SVE', name: 'Свердловская область', type: 'oblast' },
  { code: 'RU-SMO', name: 'Смоленская область', type: 'oblast' },
  { code: 'RU-TAM', name: 'Тамбовская область', type: 'oblast' },
  { code: 'RU-TVE', name: 'Тверская область', type: 'oblast' },
  { code: 'RU-TOM', name: 'Томская область', type: 'oblast' },
  { code: 'RU-TUL', name: 'Тульская область', type: 'oblast' },
  { code: 'RU-TYU', name: 'Тюменская область', type: 'oblast' },
  { code: 'RU-ULY', name: 'Ульяновская область', type: 'oblast' },
  { code: 'RU-KHE', name: 'Херсонская область', type: 'oblast' },
  { code: 'RU-CHE', name: 'Челябинская область', type: 'oblast' },
  { code: 'RU-YAR', name: 'Ярославская область', type: 'oblast' },

  // Federal Cities (3)
  { code: 'RU-MOW', name: 'г. Москва', type: 'federal_city' },
  { code: 'RU-SPE', name: 'г. Санкт-Петербург', type: 'federal_city' },
  { code: 'RU-SEV', name: 'г. Севастополь', type: 'federal_city' },

  // Autonomous Oblast (1)
  { code: 'RU-YEV', name: 'Еврейская автономная область', type: 'autonomous_oblast' },

  // Autonomous Okrugs (4)
  { code: 'RU-NEN', name: 'Ненецкий автономный округ', type: 'autonomous_okrug' },
  { code: 'RU-KHM', name: 'Ханты-Мансийский автономный округ — Югра', type: 'autonomous_okrug' },
  { code: 'RU-CHU', name: 'Чукотский автономный округ', type: 'autonomous_okrug' },
  { code: 'RU-YAN', name: 'Ямало-Ненецкий автономный округ', type: 'autonomous_okrug' }
];

// Pre-populated districts for key regions to provide rich experience
export const PRE_POPULATED_DISTRICTS: Record<string, DistrictInfo[]> = {
  'RU-ARK': [
    { code: 'UST', name: 'Устьянский район' },
    { code: 'VEL', name: 'Вельский район' },
    { code: 'KRA', name: 'Красноборский район' },
    { code: 'PLE', name: 'Плесецкий район' },
    { code: 'KOT', name: 'Котласский район' },
    { code: 'KHOL', name: 'Холмогорский район' },
    { code: 'NYAN', name: 'Няндомский район' },
    { code: 'PINE', name: 'Пинежский район' }
  ],
  'RU-VLG': [
    { code: 'VLG-VLG', name: 'Вологодский район' },
    { code: 'VLG-VEL', name: 'Великоустюгский район' },
    { code: 'VLG-SZH', name: 'Сямженский район' },
    { code: 'VLG-SOK', name: 'Сокольский район' },
    { code: 'VLG-KHA', name: 'Харовский район' }
  ],
  'RU-LEN': [
    { code: 'LEN-VYB', name: 'Выборгский район' },
    { code: 'LEN-VSE', name: 'Всеволожский район' },
    { code: 'LEN-GAT', name: 'Гатчинский район' },
    { code: 'LEN-PRI', name: 'Приозерский район' },
    { code: 'LEN-TOS', name: 'Тосненский район' }
  ],
  'RU-MOS': [
    { code: 'MOS-ODI', name: 'Одинцовский городской округ' },
    { code: 'MOS-IST', name: 'Истринский городской округ' },
    { code: 'MOS-RAM', name: 'Раменский городской округ' },
    { code: 'MOS-MYT', name: 'Мытищинский городской округ' },
    { code: 'MOS-SER', name: 'Сергиево-Посадский городской округ' }
  ],
  'RU-MOW': [
    { code: 'MOW-CAO', name: 'Центральный административный округ' },
    { code: 'MOW-ZAO', name: 'Западный административный округ' },
    { code: 'MOW-SAO', name: 'Северный административный округ' },
    { code: 'MOW-VAO', name: 'Восточный административный округ' },
    { code: 'MOW-TAO', name: 'Троицкий административный округ' }
  ],
  'RU-SPE': [
    { code: 'SPE-CEN', name: 'Центральный район' },
    { code: 'SPE-ADM', name: 'Адмиралтейский район' },
    { code: 'SPE-PRI', name: 'Приморский район' },
    { code: 'SPE-KUR', name: 'Курортный район' },
    { code: 'SPE-PUS', name: 'Пушкинский район' }
  ]
};

// Default pre-populated villages / settlements
export const PRE_POPULATED_VILLAGES: Record<string, VillageInfo[]> = {
  'UST': [
    { code: 'BRZ', name: 'Березник' },
    { code: 'SHG', name: 'Шангалы' },
    { code: 'OKT', name: 'Октябрьский' },
    { code: 'BES', name: 'Бестужево' },
    { code: 'EDM', name: 'Едьма' },
    { code: 'KID', name: 'Кизема' },
    { code: 'LOI', name: 'Лойга' },
    { code: 'ULY', name: 'Ульяновская' }
  ],
  'VEL': [
    { code: 'VEL-CEN', name: 'Вельск' },
    { code: 'VEL-ARG', name: 'Аргуновский' },
    { code: 'VEL-SOL', name: 'Солгинский' },
    { code: 'VEL-UST', name: 'Усть-Шоноша' }
  ],
  'KRA': [
    { code: 'KRA-CEN', name: 'Красноборск' },
    { code: 'KRA-CHL', name: 'Черевково' },
    { code: 'KRA-KOM', name: 'Комарово' }
  ],
  'VLG-VLG': [
    { code: 'VLG-CITY', name: 'Вологда' },
    { code: 'VLG-MOL', name: 'Молочное' },
    { code: 'VLG-SEM', name: 'Семёнково' }
  ],
  'VLG-VEL': [
    { code: 'VLG-VU', name: 'Великий Устюг' },
    { code: 'VLG-KRA', name: 'Красавино' },
    { code: 'VLG-KUZ', name: 'Кузино' }
  ],
  'LEN-VYB': [
    { code: 'LEN-VYB-CITY', name: 'Выборг' },
    { code: 'LEN-ROSH', name: 'Рощино' },
    { code: 'LEN-SVET', name: 'Светогорск' },
    { code: 'LEN-SOV', name: 'Советский' }
  ],
  'LEN-VSE': [
    { code: 'LEN-VSE-CITY', name: 'Всеволожск' },
    { code: 'LEN-MURA', name: 'Мурино' },
    { code: 'LEN-KUD', name: 'Кудрово' },
    { code: 'LEN-SERT', name: 'Сертолово' }
  ],
  'MOS-ODI': [
    { code: 'MOS-ODI-CITY', name: 'Одинцово' },
    { code: 'MOS-TRE', name: 'Трёхгорка' },
    { code: 'MOS-GOL', name: 'Голицыно' },
    { code: 'MOS-KUB', name: 'Кубинка' }
  ]
};

// Generates generic districts for any region code if not pre-populated
export function getDistrictsForRegion(regionCode: string): DistrictInfo[] {
  if (PRE_POPULATED_DISTRICTS[regionCode]) {
    return PRE_POPULATED_DISTRICTS[regionCode];
  }
  
  const region = RUSSIAN_REGIONS.find(r => r.code === regionCode);
  const regionName = region ? region.name : 'Регион';
  
  // Strip word "Республика", "край", "область" to make a nice district name prefix
  const cleanName = regionName
    .replace('Республика ', '')
    .replace(' область', '')
    .replace(' край', '')
    .replace(' город ', '')
    .trim();

  // Create 3 realistic districts based on region name
  return [
    { code: `${regionCode}-DIST1`, name: `${cleanName}ский район` },
    { code: `${regionCode}-DIST2`, name: `Центральный район` },
    { code: `${regionCode}-DIST3`, name: `Заречный район` }
  ];
}

// Generates generic villages for any district code/name if not pre-populated
export function getVillagesForDistrict(regionCode: string, districtCode: string, districtName: string): VillageInfo[] {
  // If we have pre-populated village code:
  if (PRE_POPULATED_VILLAGES[districtCode]) {
    return PRE_POPULATED_VILLAGES[districtCode];
  }

  // Also check if district name matches a pre-populated district code indirectly
  const arkDistricts = PRE_POPULATED_DISTRICTS['RU-ARK'] || [];
  const foundArkDist = arkDistricts.find(d => d.name === districtName);
  if (foundArkDist && PRE_POPULATED_VILLAGES[foundArkDist.code]) {
    return PRE_POPULATED_VILLAGES[foundArkDist.code];
  }

  const cleanDistName = districtName.replace(' район', '').replace(' городской округ', '').trim();

  return [
    { code: `${districtCode}-VILL1`, name: `с. ${cleanDistName}` },
    { code: `${districtCode}-VILL2`, name: `д. Зелёная Горка` },
    { code: `${districtCode}-VILL3`, name: `п. Лесной` },
    { code: `${districtCode}-VILL4`, name: `д. Сосновка` }
  ];
}
