export type SettlementType = 
  | 'село' 
  | 'деревня' 
  | 'поселок' 
  | 'станица' 
  | 'хутор' 
  | 'аул' 
  | 'агрогородок' 
  | 'пгт' 
  | 'рп'
  | 'райцентр'
  | 'город';

export interface LocationItem {
  id: string;
  name: string;
  type: SettlementType;
  district?: string; // район / округ
  region: string; // область, край, республика
  countryCode: 'RU' | 'BY' | 'KZ' | 'CIS';
  countryName: string;
  flag: string;
}

export interface CountryDef {
  code: 'RU' | 'BY' | 'KZ' | 'CIS';
  name: string;
  flag: string;
  regionsCount: number;
}

export const COUNTRIES: CountryDef[] = [
  { code: 'RU', name: 'Россия (РФ)', flag: '🇷🇺', regionsCount: 89 },
  { code: 'BY', name: 'Беларусь', flag: '🇧🇾', regionsCount: 6 },
  { code: 'KZ', name: 'Казахстан', flag: '🇰🇿', regionsCount: 20 },
  { code: 'CIS', name: 'Страны СНГ', flag: '🌐', regionsCount: 6 }
];

export interface RegionDef {
  id: string;
  name: string;
  countryCode: 'RU' | 'BY' | 'KZ' | 'CIS';
  districtGroup?: string; // Федеральный округ или область
}

// -------------------------------------------------------------
// РЕГИОНЫ: РФ (89 субъектов), Беларусь (6 областей + Минск), 
// Казахстан (17 областей + 3 города), СНГ (Узбекистан, Кыргызстан, Таджикистан, Армения, Азербайджан, Молдова)
// -------------------------------------------------------------
export const ALL_REGIONS: RegionDef[] = [
  // --- РОССИЯ (РФ) ---
  // Северо-Западный ФО
  { id: 'ru-arkh', name: 'Архангельская область', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-volog', name: 'Вологодская область', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-len', name: 'Ленинградская область', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-spb', name: 'г. Санкт-Петербург', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-karel', name: 'Республика Карелия', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-komi', name: 'Республика Коми', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-murm', name: 'Мурманская область', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-novg', name: 'Новгородская область', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-pskov', name: 'Псковская область', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-kalin', name: 'Калининградская область', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },
  { id: 'ru-nen', name: 'Ненецкий автономный округ', countryCode: 'RU', districtGroup: 'Северо-Западный ФО' },

  // Центральный ФО
  { id: 'ru-mos-obl', name: 'Московская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-msk', name: 'г. Москва', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-belg', name: 'Белгородская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-bryn', name: 'Брянская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-vlad', name: 'Владимирская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-vorn', name: 'Воронежская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-ivan', name: 'Ивановская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-kalu', name: 'Калужская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-kost', name: 'Костромская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-kurs', name: 'Курская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-lipe', name: 'Липецкая область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-orlo', name: 'Орловская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-ryaz', name: 'Рязанская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-smol', name: 'Смоленская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-tamb', name: 'Тамбовская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-tver', name: 'Тверская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-tula', name: 'Тульская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },
  { id: 'ru-yaro', name: 'Ярославская область', countryCode: 'RU', districtGroup: 'Центральный ФО' },

  // Приволжский ФО
  { id: 'ru-tatar', name: 'Республика Татарстан', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-bashk', name: 'Республика Башкортостан', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-nizh', name: 'Нижегородская область', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-samar', name: 'Самарская область', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-sarat', name: 'Саратовская область', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-perm', name: 'Пермский край', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-oren', name: 'Оренбургская область', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-penz', name: 'Пензенская область', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-ulyan', name: 'Ульяновская область', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-kirov', name: 'Кировская область', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-udm', name: 'Удмуртская Республика', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-chuv', name: 'Чувашская Республика', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-mari', name: 'Республика Марий Эл', countryCode: 'RU', districtGroup: 'Приволжский ФО' },
  { id: 'ru-mord', name: 'Республика Мордовия', countryCode: 'RU', districtGroup: 'Приволжский ФО' },

  // Южный ФО
  { id: 'ru-krasn', name: 'Краснодарский край (Кубань)', countryCode: 'RU', districtGroup: 'Южный ФО' },
  { id: 'ru-rost', name: 'Ростовская область', countryCode: 'RU', districtGroup: 'Южный ФО' },
  { id: 'ru-volg', name: 'Волгоградская область', countryCode: 'RU', districtGroup: 'Южный ФО' },
  { id: 'ru-astr', name: 'Астраханская область', countryCode: 'RU', districtGroup: 'Южный ФО' },
  { id: 'ru-adyg', name: 'Республика Адыгея', countryCode: 'RU', districtGroup: 'Южный ФО' },
  { id: 'ru-kalm', name: 'Республика Калмыкия', countryCode: 'RU', districtGroup: 'Южный ФО' },
  { id: 'ru-krym', name: 'Республика Крым', countryCode: 'RU', districtGroup: 'Южный ФО' },
  { id: 'ru-sevas', name: 'г. Севастополь', countryCode: 'RU', districtGroup: 'Южный ФО' },

  // Северо-Кавказский ФО
  { id: 'ru-stavr', name: 'Ставропольский край', countryCode: 'RU', districtGroup: 'Северо-Кавказский ФО' },
  { id: 'ru-dag', name: 'Республика Дагестан', countryCode: 'RU', districtGroup: 'Северо-Кавказский ФО' },
  { id: 'ru-chech', name: 'Чеченская Республика', countryCode: 'RU', districtGroup: 'Северо-Кавказский ФО' },
  { id: 'ru-ing', name: 'Республика Ингушетия', countryCode: 'RU', districtGroup: 'Северо-Кавказский ФО' },
  { id: 'ru-kbr', name: 'Кабардино-Балкарская Республика', countryCode: 'RU', districtGroup: 'Северо-Кавказский ФО' },
  { id: 'ru-kch', name: 'Карачаево-Черкесская Республика', countryCode: 'RU', districtGroup: 'Северо-Кавказский ФО' },
  { id: 'ru-oset', name: 'Республика Северная Осетия — Алания', countryCode: 'RU', districtGroup: 'Северо-Кавказский ФО' },

  // Уральский ФО
  { id: 'ru-sverd', name: 'Свердловская область', countryCode: 'RU', districtGroup: 'Уральский ФО' },
  { id: 'ru-chel', name: 'Челябинская область', countryCode: 'RU', districtGroup: 'Уральский ФО' },
  { id: 'ru-tyum', name: 'Тюменская область', countryCode: 'RU', districtGroup: 'Уральский ФО' },
  { id: 'ru-kurg', name: 'Курганская область', countryCode: 'RU', districtGroup: 'Уральский ФО' },
  { id: 'ru-khanty', name: 'Ханты-Мансийский АО — Югра', countryCode: 'RU', districtGroup: 'Уральский ФО' },
  { id: 'ru-yamal', name: 'Ямало-Ненецкий АО', countryCode: 'RU', districtGroup: 'Уральский ФО' },

  // Сибирский ФО
  { id: 'ru-novos', name: 'Новосибирская область', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-omsk', name: 'Омская область', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-tomsk', name: 'Томская область', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-kemer', name: 'Кемеровская область — Кузбасс', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-alt-kray', name: 'Алтайский край', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-alt-rep', name: 'Республика Алтай', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-krasnoy', name: 'Красноярский край', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-irk', name: 'Иркутская область', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-khakas', name: 'Республика Хакасия', countryCode: 'RU', districtGroup: 'Сибирский ФО' },
  { id: 'ru-tyva', name: 'Республика Тыва', countryCode: 'RU', districtGroup: 'Сибирский ФО' },

  // Дальневосточный ФО
  { id: 'ru-prim', name: 'Приморский край', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-khab', name: 'Хабаровский край', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-amur', name: 'Амурская область', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-yakut', name: 'Республика Саха (Якутия)', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-buryat', name: 'Республика Бурятия', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-zabayk', name: 'Забайкальский край', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-sakhal', name: 'Сахалинская область', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-kamch', name: 'Камчатский край', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-magad', name: 'Магаданская область', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-eao', name: 'Еврейская автономная область', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },
  { id: 'ru-chukot', name: 'Чукотский автономный округ', countryCode: 'RU', districtGroup: 'Дальневосточный ФО' },

  // Новые субъекты
  { id: 'ru-dnr', name: 'Донецкая Народная Республика', countryCode: 'RU', districtGroup: 'Южные регионы' },
  { id: 'ru-lnr', name: 'Луганская Народная Республика', countryCode: 'RU', districtGroup: 'Южные регионы' },
  { id: 'ru-zap', name: 'Запорожская область', countryCode: 'RU', districtGroup: 'Южные регионы' },
  { id: 'ru-kher', name: 'Херсонская область', countryCode: 'RU', districtGroup: 'Южные регионы' },

  // --- БЕЛАРУСЬ ---
  { id: 'by-minsk', name: 'Минская область', countryCode: 'BY', districtGroup: 'Республика Беларусь' },
  { id: 'by-brest', name: 'Брестская область', countryCode: 'BY', districtGroup: 'Республика Беларусь' },
  { id: 'by-viteb', name: 'Витебская область', countryCode: 'BY', districtGroup: 'Республика Беларусь' },
  { id: 'by-gomel', name: 'Гомельская область', countryCode: 'BY', districtGroup: 'Республика Беларусь' },
  { id: 'by-grodno', name: 'Гродненская область', countryCode: 'BY', districtGroup: 'Республика Беларусь' },
  { id: 'by-mogil', name: 'Могилевская область', countryCode: 'BY', districtGroup: 'Республика Беларусь' },
  { id: 'by-msk-c', name: 'г. Минск', countryCode: 'BY', districtGroup: 'Республика Беларусь' },

  // --- КАЗАХСТАН ---
  { id: 'kz-akmola', name: 'Акмолинская область', countryCode: 'KZ', districtGroup: 'Северный Казахстан' },
  { id: 'kz-almaty-obl', name: 'Алматинская область', countryCode: 'KZ', districtGroup: 'Южный Казахстан' },
  { id: 'kz-turk', name: 'Туркестанская область', countryCode: 'KZ', districtGroup: 'Южный Казахстан' },
  { id: 'kz-zham', name: 'Жамбылская область', countryCode: 'KZ', districtGroup: 'Южный Казахстан' },
  { id: 'kz-karag', name: 'Карагандинская область', countryCode: 'KZ', districtGroup: 'Центральный Казахстан' },
  { id: 'kz-kost', name: 'Костанайская область', countryCode: 'KZ', districtGroup: 'Северный Казахстан' },
  { id: 'kz-pavl', name: 'Павлодарская область', countryCode: 'KZ', districtGroup: 'Северный Казахстан' },
  { id: 'kz-sko', name: 'Северо-Казахстанская область (СКО)', countryCode: 'KZ', districtGroup: 'Северный Казахстан' },
  { id: 'kz-vko', name: 'Восточно-Казахстанская область (ВКО)', countryCode: 'KZ', districtGroup: 'Восточный Казахстан' },
  { id: 'kz-zko', name: 'Западно-Казахстанская область (ЗКО)', countryCode: 'KZ', districtGroup: 'Западный Казахстан' },
  { id: 'kz-aktobe', name: 'Актюбинская область', countryCode: 'KZ', districtGroup: 'Западный Казахстан' },
  { id: 'kz-atyr', name: 'Атырауская область', countryCode: 'KZ', districtGroup: 'Западный Казахстан' },
  { id: 'kz-mang', name: 'Мангистауская область', countryCode: 'KZ', districtGroup: 'Западный Казахстан' },
  { id: 'kz-kyzyl', name: 'Кызылординская область', countryCode: 'KZ', districtGroup: 'Южный Казахстан' },
  { id: 'kz-abay', name: 'Область Абай', countryCode: 'KZ', districtGroup: 'Восточный Казахстан' },
  { id: 'kz-zhet', name: 'Область Жетысу', countryCode: 'KZ', districtGroup: 'Юго-Восточный Казахстан' },
  { id: 'kz-ulyt', name: 'Область Улытау', countryCode: 'KZ', districtGroup: 'Центральный Казахстан' },
  { id: 'kz-astana', name: 'г. Астана', countryCode: 'KZ', districtGroup: 'Города республиканского значения' },
  { id: 'kz-almaty', name: 'г. Алматы', countryCode: 'KZ', districtGroup: 'Города республиканского значения' },
  { id: 'kz-shym', name: 'г. Шымкент', countryCode: 'KZ', districtGroup: 'Города республиканского значения' },

  // --- СТРАНЫ СНГ ---
  { id: 'cis-uzb-tash', name: 'Ташкентская область (Узбекистан)', countryCode: 'CIS', districtGroup: 'Узбекистан' },
  { id: 'cis-uzb-sam', name: 'Самаркандская область (Узбекистан)', countryCode: 'CIS', districtGroup: 'Узбекистан' },
  { id: 'cis-uzb-ferg', name: 'Ферганская область (Узбекистан)', countryCode: 'CIS', districtGroup: 'Узбекистан' },
  { id: 'cis-kg-chuy', name: 'Чуйская область (Кыргызстан)', countryCode: 'CIS', districtGroup: 'Кыргызстан' },
  { id: 'cis-kg-issyk', name: 'Иссык-Кульская область (Кыргызстан)', countryCode: 'CIS', districtGroup: 'Кыргызстан' },
  { id: 'cis-kg-osh', name: 'Ошская область (Кыргызстан)', countryCode: 'CIS', districtGroup: 'Кыргызстан' },
  { id: 'cis-tj-sogd', name: 'Согдийская область (Таджикистан)', countryCode: 'CIS', districtGroup: 'Таджикистан' },
  { id: 'cis-tj-khatl', name: 'Хатлонская область (Таджикистан)', countryCode: 'CIS', districtGroup: 'Таджикистан' },
  { id: 'cis-am-kotayk', name: 'Марз Котайк (Армения)', countryCode: 'CIS', districtGroup: 'Армения' },
  { id: 'cis-am-tavush', name: 'Марз Тавуш (Армения)', countryCode: 'CIS', districtGroup: 'Армения' },
  { id: 'cis-am-gegh', name: 'Марз Гегаркуник (Армения)', countryCode: 'CIS', districtGroup: 'Армения' },
  { id: 'cis-az-quba', name: 'Губа-Хачмазский регион (Азербайджан)', countryCode: 'CIS', districtGroup: 'Азербайджан' },
  { id: 'cis-az-shaki', name: 'Шеки-Загатальский регион (Азербайджан)', countryCode: 'CIS', districtGroup: 'Азербайджан' },
  { id: 'cis-md-orhei', name: 'Район Орхей (Молдова)', countryCode: 'CIS', districtGroup: 'Молдова' },
  { id: 'cis-md-cahul', name: 'Район Кагул (Молдова)', countryCode: 'CIS', districtGroup: 'Молдова' },
  { id: 'cis-md-gagauz', name: 'АТО Гагаузия (Молдова)', countryCode: 'CIS', districtGroup: 'Молдова' }
];

// -------------------------------------------------------------
// РАСШИРЕННЫЙ СПИСОК НАСЕЛЕННЫХ ПУНКТОВ (СЁЛА, ДЕРЕВНИ, ПОСЁЛКИ, АУЛЫ)
// -------------------------------------------------------------
export const EXPANDED_LOCATIONS: LocationItem[] = [
  // --- РОССИЯ: АРХАНГЕЛЬСКАЯ ОБЛАСТЬ ---
  { id: 'ru-shangaly', name: 'Шангалы', type: 'село', district: 'Устьянский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-oktyabrsky', name: 'Октябрьский', type: 'пгт', district: 'Устьянский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-bereznik', name: 'Березник', type: 'село', district: 'Устьянский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-kizema', name: 'Кизема', type: 'поселок', district: 'Устьянский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-malodory', name: 'Малодоры', type: 'деревня', district: 'Устьянский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-stroevskoe', name: 'Строевское', type: 'село', district: 'Устьянский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-sovetsky', name: 'Советский', type: 'поселок', district: 'Устьянский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-tarasonav', name: 'Тарасонаволоцкая', type: 'деревня', district: 'Устьянский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-velsk', name: 'Вельск', type: 'город', district: 'Вельский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-kulikovo', name: 'Куликово', type: 'поселок', district: 'Красноборский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-krasnoborsk', name: 'Красноборск', type: 'село', district: 'Красноборский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-karpogory', name: 'Карпогоры', type: 'село', district: 'Пинежский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-verkhnyaya-toyma', name: 'Верхняя Тойма', type: 'село', district: 'Верхнетоемский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-plesetsk', name: 'Плесецк', type: 'пгт', district: 'Плесецкий р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-konocha', name: 'Коноша', type: 'пгт', district: 'Коношский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-kholmogory', name: 'Холмогоры', type: 'село', district: 'Холмогорский р-н', region: 'Архангельская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: ВОЛОГОДСКАЯ ОБЛАСТЬ ---
  { id: 'ru-tarnoga', name: 'Тарногский Городок', type: 'село', district: 'Тарногский р-н', region: 'Вологодская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-nyuksenitsa', name: 'Нюксеница', type: 'село', district: 'Нюксенский р-н', region: 'Вологодская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-totma', name: 'Тотьма', type: 'город', district: 'Тотемский р-н', region: 'Вологодская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-veliky-ustyug', name: 'Великий Устюг', type: 'город', district: 'Великоустюгский р-н', region: 'Вологодская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-ferapontovo', name: 'Ферапонтово', type: 'село', district: 'Кирилловский р-н', region: 'Вологодская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-belozersk', name: 'Белозерск', type: 'город', district: 'Белозерский р-н', region: 'Вологодская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-vytegra', name: 'Вытегра', type: 'город', district: 'Вытегорский р-н', region: 'Вологодская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: ЛЕНИНГРАДСКАЯ ОБЛАСТЬ ---
  { id: 'ru-siversky', name: 'Сиверский', type: 'пгт', district: 'Гатчинский р-н', region: 'Ленинградская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-roshchino', name: 'Рощино', type: 'поселок', district: 'Выборгский р-н', region: 'Ленинградская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-volosovo', name: 'Волосово', type: 'город', district: 'Волосовский р-н', region: 'Ленинградская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-staraya-ladoga', name: 'Старая Ладога', type: 'село', district: 'Волховский р-н', region: 'Ленинградская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-sosnovo', name: 'Сосново', type: 'поселок', district: 'Приозерский р-н', region: 'Ленинградская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-vyritsa', name: 'Вырица', type: 'пгт', district: 'Гатчинский р-н', region: 'Ленинградская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: МОСКОВСКАЯ ОБЛАСТЬ ---
  { id: 'ru-kolyubakino', name: 'Колюбакино', type: 'поселок', district: 'Рузский р-н', region: 'Московская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-ostashevo', name: 'Осташёво', type: 'село', district: 'Волоколамский р-н', region: 'Московская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-serednikovo', name: 'Середниково', type: 'поселок', district: 'Солнечногорский р-н', region: 'Московская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-novopetrovskoe', name: 'Новопетровское', type: 'село', district: 'Истринский р-н', region: 'Московская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-teryaevo', name: 'Теряево', type: 'село', district: 'Волоколамский р-н', region: 'Московская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: КРАСНОДАРСКИЙ КРАЙ (КУБАНЬ) ---
  { id: 'ru-kanevskaya', name: 'Каневская', type: 'станица', district: 'Каневской р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-leningradskaya', name: 'Ленинградская', type: 'станица', district: 'Ленинградский р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-pavlovskaya', name: 'Павловская', type: 'станица', district: 'Павловский р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-dingirskaya', name: 'Динская', type: 'станица', district: 'Динской р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-kushchevskaya', name: 'Кущёвская', type: 'станица', district: 'Кущёвский р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-poltavskaya', name: 'Полтавская', type: 'станица', district: 'Красноармейский р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-starominskaya', name: 'Староминская', type: 'станица', district: 'Староминский р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-bryukhovetskaya', name: 'Брюховецкая', type: 'станица', district: 'Брюховецкий р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-tbilisskaya', name: 'Тбилисская', type: 'станица', district: 'Тбилисский р-н', region: 'Краснодарский край (Кубань)', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: РОСТОВСКАЯ ОБЛАСТЬ ---
  { id: 'ru-veshenskaya', name: 'Вёшенская', type: 'станица', district: 'Шолоховский р-н', region: 'Ростовская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-chaltyr', name: 'Чалтырь', type: 'село', district: 'Мясниковский р-н', region: 'Ростовская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-remontnoe', name: 'Ремонтное', type: 'село', district: 'Ремонтненский р-н', region: 'Ростовская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-bokovskaya', name: 'Боковская', type: 'станица', district: 'Боковский р-н', region: 'Ростовская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-kagalnitskaya', name: 'Кагальницкая', type: 'станица', district: 'Кагальницкий р-н', region: 'Ростовская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: ТАТАРСТАН ---
  { id: 'ru-arksk', name: 'Арск', type: 'город', district: 'Арский р-н', region: 'Республика Татарстан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-bua', name: 'Буинск', type: 'город', district: 'Буинский р-н', region: 'Республика Татарстан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-bog-saby', name: 'Богатые Сабы', type: 'пгт', district: 'Сабинский р-н', region: 'Республика Татарстан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-aktobe-tat', name: 'Актюбинский', type: 'пгт', district: 'Азнакаевский р-н', region: 'Республика Татарстан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-kukmor', name: 'Кукмор', type: 'город', district: 'Кукморский р-н', region: 'Республика Татарстан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-mamykovo', name: 'Мамыково', type: 'село', district: 'Нурлатский р-н', region: 'Республика Татарстан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: БАШКОРТОСТАН ---
  { id: 'ru-mesyagutovo', name: 'Месягутово', type: 'село', district: 'Дуванский р-н', region: 'Республика Башкортостан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-chishmy', name: 'Чишмы', type: 'рп', district: 'Чишминский р-н', region: 'Республика Башкортостан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-kushnarenkovo', name: 'Кушнаренково', type: 'село', district: 'Кушнаренковский р-н', region: 'Республика Башкортостан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-krasnousolsky', name: 'Красноусольский', type: 'село', district: 'Гафурийский р-н', region: 'Республика Башкортостан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-askino', name: 'Аскино', type: 'село', district: 'Аскинский р-н', region: 'Республика Башкортостан', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: НИЖЕГОРОДСКАЯ ОБЛАСТЬ ---
  { id: 'ru-dikveevo', name: 'Дивеево', type: 'село', district: 'Дивеевский р-н', region: 'Нижегородская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-bolshoe-boldino', name: 'Большое Болдино', type: 'село', district: 'Болдинский р-н', region: 'Нижегородская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-krasnye-baki', name: 'Красные Баки', type: 'рп', district: 'Краснобаковский р-н', region: 'Нижегородская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-voskresenskoe', name: 'Воскресенское', type: 'рп', district: 'Воскресенский р-н', region: 'Нижегородская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: АЛТАЙСКИЙ КРАЙ & РЕСПУБЛИКА АЛТАЙ ---
  { id: 'ru-alt-kulunda', name: 'Кулунда', type: 'село', district: 'Кулундинский р-н', region: 'Алтайский край', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-alt-srostki', name: 'Сростки', type: 'село', district: 'Бийский р-н', region: 'Алтайский край', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-alt-mikhaylovskoe', name: 'Михайловское', type: 'село', district: 'Михайловский р-н', region: 'Алтайский край', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-alt-pavl', name: 'Павловск', type: 'село', district: 'Павловский р-н', region: 'Алтайский край', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-alt-chem', name: 'Чемал', type: 'село', district: 'Чемальский р-н', region: 'Республика Алтай', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-alt-kosha', name: 'Кош-Агач', type: 'село', district: 'Кош-Агачский р-н', region: 'Республика Алтай', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-alt-mayma', name: 'Майма', type: 'село', district: 'Майминский р-н', region: 'Республика Алтай', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: НОВОСИБИРСКАЯ ОБЛАСТЬ ---
  { id: 'ru-ordynskoe', name: 'Ордынское', type: 'рп', district: 'Ордынский р-н', region: 'Новосибирская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-maslyanino', name: 'Маслянино', type: 'рп', district: 'Маслянинский р-н', region: 'Новосибирская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-kochenevo', name: 'Коченёво', type: 'рп', district: 'Коченёвский р-н', region: 'Новосибирская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-cherepanovo', name: 'Черепаново', type: 'город', district: 'Черепановский р-н', region: 'Новосибирская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: СВЕРДЛОВСКАЯ ОБЛАСТЬ ---
  { id: 'ru-arti', name: 'Арти', type: 'пгт', district: 'Артинский р-н', region: 'Свердловская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-shalya', name: 'Шаля', type: 'пгт', district: 'Шалинский р-н', region: 'Свердловская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-baishevo', name: 'Байкалово', type: 'село', district: 'Байкаловский р-н', region: 'Свердловская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-tur-sloboda', name: 'Туринская Слобода', type: 'село', district: 'Слободо-Туринский р-н', region: 'Свердловская область', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- РОССИЯ: КРЫМ ---
  { id: 'ru-vilino', name: 'Вилино', type: 'село', district: 'Бахчисарайский р-н', region: 'Республика Крым', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-chernomorskoe', name: 'Черноморское', type: 'пгт', district: 'Черноморский р-н', region: 'Республика Крым', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-lenino', name: 'Ленино', type: 'пгт', district: 'Ленинский р-н', region: 'Республика Крым', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },
  { id: 'ru-novoselovskoe', name: 'Новосёловское', type: 'пгт', district: 'Раздольненский р-н', region: 'Республика Крым', countryCode: 'RU', countryName: 'Россия', flag: '🇷🇺' },

  // --- БЕЛАРУСЬ: МИНСКАЯ ОБЛАСТЬ ---
  { id: 'by-ostrovets', name: 'Острошицкий Городок', type: 'агрогородок', district: 'Минский р-н', region: 'Минская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-kolodischi', name: 'Колодищи', type: 'агрогородок', district: 'Минский р-н', region: 'Минская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-nesvizh', name: 'Несвиж', type: 'город', district: 'Несвижский р-н', region: 'Минская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-gorodeya', name: 'Городея', type: 'пгт', district: 'Несвижский р-н', region: 'Минская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-stolbtsy', name: 'Столбцы', type: 'город', district: 'Столбцовский р-н', region: 'Минская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-kopyl', name: 'Копыль', type: 'город', district: 'Копыльский р-н', region: 'Минская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-myadel', name: 'Мядель', type: 'город', district: 'Мядельский р-н', region: 'Минская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-naroch', name: 'Нарочь', type: 'агрогородок', district: 'Мядельский р-н', region: 'Минская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },

  // --- БЕЛАРУСЬ: БРЕСТСКАЯ ОБЛАСТЬ ---
  { id: 'by-motol', name: 'Мотоль', type: 'агрогородок', district: 'Ивановский р-н', region: 'Брестская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-ruzhany', name: 'Ружаны', type: 'пгт', district: 'Пружанский р-н', region: 'Брестская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-kamenets', name: 'Каменец', type: 'город', district: 'Каменецкий р-н', region: 'Брестская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-belovezhsky', name: 'Беловежский', type: 'агрогородок', district: 'Каменецкий р-н', region: 'Брестская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-ivanovo', name: 'Иваново', type: 'город', district: 'Ивановский р-н', region: 'Брестская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-olshany', name: 'Ольшаны', type: 'агрогородок', district: 'Столинский р-н', region: 'Брестская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-stolin', name: 'Столин', type: 'город', district: 'Столинский р-н', region: 'Брестская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },

  // --- БЕЛАРУСЬ: ГРОДНЕНСКАЯ ОБЛАСТЬ ---
  { id: 'by-mir', name: 'Мир', type: 'пгт', district: 'Кореличский р-н', region: 'Гродненская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-zhirovichi', name: 'Жировичи', type: 'агрогородок', district: 'Слонимский р-н', region: 'Гродненская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-korelichi', name: 'Кореличи', type: 'пгт', district: 'Кореличский р-н', region: 'Гродненская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-volkovysk', name: 'Волковыск', type: 'город', district: 'Волковысский р-н', region: 'Гродненская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-novogrudok', name: 'Новогрудок', type: 'город', district: 'Новогрудский р-н', region: 'Гродненская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },

  // --- БЕЛАРУСЬ: ВИТЕБСКАЯ ОБЛАСТЬ ---
  { id: 'by-braslav', name: 'Браслав', type: 'город', district: 'Браславский р-н', region: 'Витебская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-glubokoe', name: 'Глубокое', type: 'город', district: 'Глубокский р-н', region: 'Витебская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-lepel', name: 'Лепель', type: 'город', district: 'Лепельский р-н', region: 'Витебская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-sharkovshchina', name: 'Шарковщина', type: 'пгт', district: 'Шарковщинский р-н', region: 'Витебская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },

  // --- БЕЛАРУСЬ: ГОМЕЛЬСКАЯ ОБЛАСТЬ ---
  { id: 'by-turov', name: 'Туров', type: 'город', district: 'Житковичский р-н', region: 'Гомельская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-rechitsa', name: 'Речица', type: 'город', district: 'Речицкий р-н', region: 'Гомельская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-rogachev', name: 'Рогачёв', type: 'город', district: 'Рогачёвский р-н', region: 'Гомельская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-vetka', name: 'Ветка', type: 'город', district: 'Ветковский р-н', region: 'Гомельская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },

  // --- БЕЛАРУСЬ: МОГИЛЕВСКАЯ ОБЛАСТЬ ---
  { id: 'by-aleksandriya', name: 'Александрия', type: 'агрогородок', district: 'Шкловский р-н', region: 'Могилевская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-shklov', name: 'Шклов', type: 'город', district: 'Шкловский р-н', region: 'Могилевская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-gorki', name: 'Горки', type: 'город', district: 'Горецкий р-н', region: 'Могилевская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },
  { id: 'by-bykhov', name: 'Быхов', type: 'город', district: 'Быховский р-н', region: 'Могилевская область', countryCode: 'BY', countryName: 'Беларусь', flag: '🇧🇾' },

  // --- КАЗАХСТАН: АЛМАТИНСКАЯ ОБЛАСТЬ & ЖЕТЫСУ ---
  { id: 'kz-kaskelen', name: 'Каскелен', type: 'город', district: 'Карасайский р-н', region: 'Алматинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-shelek', name: 'Шелек (Чилик)', type: 'село', district: 'Енбекшиказахский р-н', region: 'Алматинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-uzunagash', name: 'Узынагаш', type: 'село', district: 'Жамбылский р-н', region: 'Алматинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-turgen', name: 'Тургень', type: 'село', district: 'Енбекшиказахский р-н', region: 'Алматинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-chundzha', name: 'Шонжы (Чунджа)', type: 'село', district: 'Уйгурский р-н', region: 'Алматинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-sarkand', name: 'Сарканд', type: 'город', district: 'Саркандский р-н', region: 'Область Жетысу', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-bakhty', name: 'Бахты', type: 'село', district: 'Урджарский р-н', region: 'Область Абай', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },

  // --- КАЗАХСТАН: АКМОЛИНСКАЯ ОБЛАСТЬ ---
  { id: 'kz-zerenda', name: 'Зеренда', type: 'село', district: 'Зерендинский р-н', region: 'Акмолинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-burabay', name: 'Бурабай (Боровое)', type: 'поселок', district: 'Бурабайский р-н', region: 'Акмолинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-shchuchinsk', name: 'Щучинск', type: 'город', district: 'Бурабайский р-н', region: 'Акмолинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-arshaly', name: 'Аршалы', type: 'поселок', district: 'Аршалынский р-н', region: 'Акмолинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-astrakhanka', name: 'Астраханка', type: 'село', district: 'Астраханский р-н', region: 'Акмолинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-korgalzhyn', name: 'Коргалжын', type: 'село', district: 'Коргалжынский р-н', region: 'Акмолинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },

  // --- КАЗАХСТАН: ТУРКЕСТАНСКАЯ ОБЛАСТЬ ---
  { id: 'kz-saryagash', name: 'Сарыагаш', type: 'город', district: 'Сарыагашский р-н', region: 'Туркестанская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-zhetysay', name: 'Жетысай', type: 'город', district: 'Жетысайский р-н', region: 'Туркестанская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-sholakkorgan', name: 'Шолаккорган', type: 'село', district: 'Сузакский р-н', region: 'Туркестанская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-shayan', name: 'Шаян', type: 'село', district: 'Байдибекский р-н', region: 'Туркестанская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-temirlan', name: 'Темирлан', type: 'село', district: 'Ордабасинский р-н', region: 'Туркестанская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },

  // --- КАЗАХСТАН: ЖАМБЫЛСКАЯ ОБЛАСТЬ ---
  { id: 'kz-merke', name: 'Мерке', type: 'село', district: 'Меркенский р-н', region: 'Жамбылская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-korday', name: 'Кордай', type: 'село', district: 'Кордайский р-н', region: 'Жамбылская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-kulan', name: 'Кулан', type: 'село', district: 'Турара Рыскулова р-н', region: 'Жамбылская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-asa', name: 'Аса', type: 'село', district: 'Жамбылский р-н', region: 'Жамбылская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },

  // --- КАЗАХСТАН: СЕВЕРНЫЙ & ЦЕНТРАЛЬНЫЙ КАЗАХСТАН (СКО, КОСТАНАЙ, КАРАГАНДА, ПАВЛОДАР) ---
  { id: 'kz-fedorovka', name: 'Фёдоровка', type: 'село', district: 'Фёдоровский р-н', region: 'Костанайская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-aubakir', name: 'Боровской', type: 'село', district: 'Мендыкаринский р-н', region: 'Костанайская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-tayynsha', name: 'Тайынша', type: 'город', district: 'Тайыншинский р-н', region: 'Северо-Казахстанская область (СКО)', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-saumalkol', name: 'Саумалколь', type: 'село', district: 'Айыртауский р-н', region: 'Северо-Казахстанская область (СКО)', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-bayanaul', name: 'Баянаул', type: 'село', district: 'Баянаульский р-н', region: 'Павлодарская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-osakarovka', name: 'Осакаровка', type: 'поселок', district: 'Осакаровский р-н', region: 'Карагандинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-botakara', name: 'Ботакара', type: 'поселок', district: 'Бухар-Жырауский р-н', region: 'Карагандинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-ulytau-s', name: 'Улытау', type: 'село', district: 'Улытауский р-н', region: 'Область Улытау', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },

  // --- КАЗАХСТАН: ЗАПАДНЫЙ КАЗАХСТАН (ЗКО, АКТЮБИНСК, АТЫРАУ, МАНГИСТАУ) ---
  { id: 'kz-martuk', name: 'Мартук', type: 'село', district: 'Мартукский р-н', region: 'Актюбинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-badamsha', name: 'Бадамша', type: 'село', district: 'Каргалинский р-н', region: 'Актюбинская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-beyneu', name: 'Бейнеу', type: 'село', district: 'Бейнеуский р-н', region: 'Мангистауская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-makhambet', name: 'Махамбет', type: 'село', district: 'Махамбетский р-н', region: 'Атырауская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-tascala', name: 'Таскала', type: 'село', district: 'Таскалинский р-н', region: 'Западно-Казахстанская область (ЗКО)', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },
  { id: 'kz-shieli', name: 'Шиели', type: 'поселок', district: 'Шиелийский р-н', region: 'Кызылординская область', countryCode: 'KZ', countryName: 'Казахстан', flag: '🇰🇿' },

  // --- СТРАНЫ СНГ: УЗБЕКИСТАН ---
  { id: 'cis-bostanlyk', name: 'Бостанлык (Чарвак)', type: 'поселок', district: 'Бостанлыкский р-н', region: 'Ташкентская область (Узбекистан)', countryCode: 'CIS', countryName: 'Узбекистан', flag: '🇺🇿' },
  { id: 'cis-kibray', name: 'Кибрай', type: 'поселок', district: 'Кибрайский р-н', region: 'Ташкентская область (Узбекистан)', countryCode: 'CIS', countryName: 'Узбекистан', flag: '🇺🇿' },
  { id: 'cis-yangiyul', name: 'Янгиюль', type: 'город', district: 'Янгиюльский р-н', region: 'Ташкентская область (Узбекистан)', countryCode: 'CIS', countryName: 'Узбекистан', flag: '🇺🇿' },
  { id: 'cis-urgut', name: 'Ургут', type: 'город', district: 'Ургутский р-н', region: 'Самаркандская область (Узбекистан)', countryCode: 'CIS', countryName: 'Узбекистан', flag: '🇺🇿' },
  { id: 'cis-pastdargom', name: 'Джума', type: 'город', district: 'Пастдаргомский р-н', region: 'Самаркандская область (Узбекистан)', countryCode: 'CIS', countryName: 'Узбекистан', flag: '🇺🇿' },
  { id: 'cis-rishtan', name: 'Риштан', type: 'город', district: 'Риштанский р-н', region: 'Ферганская область (Узбекистан)', countryCode: 'CIS', countryName: 'Узбекистан', flag: '🇺🇿' },
  { id: 'cis-kuva', name: 'Кува', type: 'город', district: 'Кувинский р-н', region: 'Ферганская область (Узбекистан)', countryCode: 'CIS', countryName: 'Узбекистан', flag: '🇺🇿' },

  // --- СТРАНЫ СНГ: КЫРГЫЗСТАН ---
  { id: 'cis-kant', name: 'Кант', type: 'город', district: 'Ысык-Атинский р-н', region: 'Чуйская область (Кыргызстан)', countryCode: 'CIS', countryName: 'Кыргызстан', flag: '🇰🇬' },
  { id: 'cis-belovodskoe', name: 'Беловодское', type: 'село', district: 'Московский р-н', region: 'Чуйская область (Кыргызстан)', countryCode: 'CIS', countryName: 'Кыргызстан', flag: '🇰🇬' },
  { id: 'cis-sokuluk', name: 'Сокулук', type: 'село', district: 'Сокулукский р-н', region: 'Чуйская область (Кыргызстан)', countryCode: 'CIS', countryName: 'Кыргызстан', flag: '🇰🇬' },
  { id: 'cis-bosteri', name: 'Бостери', type: 'село', district: 'Иссык-Кульский р-н', region: 'Иссык-Кульская область (Кыргызстан)', countryCode: 'CIS', countryName: 'Кыргызстан', flag: '🇰🇬' },
  { id: 'cis-cholpon-ata', name: 'Чолпон-Ата', type: 'город', district: 'Иссык-Кульский р-н', region: 'Иссык-Кульская область (Кыргызстан)', countryCode: 'CIS', countryName: 'Кыргызстан', flag: '🇰🇬' },
  { id: 'cis-tyup', name: 'Тюп', type: 'село', district: 'Тюпский р-н', region: 'Иссык-Кульская область (Кыргызстан)', countryCode: 'CIS', countryName: 'Кыргызстан', flag: '🇰🇬' },
  { id: 'cis-aravan', name: 'Араван', type: 'село', district: 'Араванский р-н', region: 'Ошская область (Кыргызстан)', countryCode: 'CIS', countryName: 'Кыргызстан', flag: '🇰🇬' },

  // --- СТРАНЫ СНГ: ТАДЖИКИСТАН ---
  { id: 'cis-isfara', name: 'Исфара', type: 'город', district: 'Исфаринский р-н', region: 'Согдийская область (Таджикистан)', countryCode: 'CIS', countryName: 'Таджикистан', flag: '🇹🇯' },
  { id: 'cis-penjikent', name: 'Пенджикент', type: 'город', district: 'Пенджикентский р-н', region: 'Согдийская область (Таджикистан)', countryCode: 'CIS', countryName: 'Таджикистан', flag: '🇹🇯' },
  { id: 'cis-dangara', name: 'Дангара', type: 'поселок', district: 'Дангаринский р-н', region: 'Хатлонская область (Таджикистан)', countryCode: 'CIS', countryName: 'Таджикистан', flag: '🇹🇯' },
  { id: 'cis-yavan', name: 'Яван', type: 'поселок', district: 'Яванский р-н', region: 'Хатлонская область (Таджикистан)', countryCode: 'CIS', countryName: 'Таджикистан', flag: '🇹🇯' },

  // --- СТРАНЫ СНГ: АРМЕНИЯ ---
  { id: 'cis-garni', name: 'Гарни', type: 'село', district: 'Котайк', region: 'Марз Котайк (Армения)', countryCode: 'CIS', countryName: 'Армения', flag: '🇦🇲' },
  { id: 'cis-tsaghkadzor', name: 'Цахкадзор', type: 'город', district: 'Котайк', region: 'Марз Котайк (Армения)', countryCode: 'CIS', countryName: 'Армения', flag: '🇦🇲' },
  { id: 'cis-dilijan', name: 'Дилижан', type: 'город', district: 'Тавуш', region: 'Марз Тавуш (Армения)', countryCode: 'CIS', countryName: 'Армения', flag: '🇦🇲' },
  { id: 'cis-sevan', name: 'Севан', type: 'город', district: 'Гегаркуник', region: 'Марз Гегаркуник (Армения)', countryCode: 'CIS', countryName: 'Армения', flag: '🇦🇲' },
  { id: 'cis-tatev', name: 'Татев', type: 'село', district: 'Сюник', region: 'Марз Сюник (Армения)', countryCode: 'CIS', countryName: 'Армения', flag: '🇦🇲' },

  // --- СТРАНЫ СНГ: АЗЕРБАЙДЖАН ---
  { id: 'cis-quba', name: 'Губа', type: 'город', district: 'Губинский р-н', region: 'Губа-Хачмазский регион (Азербайджан)', countryCode: 'CIS', countryName: 'Азербайджан', flag: '🇦🇿' },
  { id: 'cis-qusar', name: 'Гусар', type: 'город', district: 'Гусарский р-н', region: 'Губа-Хачмазский регион (Азербайджан)', countryCode: 'CIS', countryName: 'Азербайджан', flag: '🇦🇿' },
  { id: 'cis-khachmaz', name: 'Хачмаз', type: 'город', district: 'Хачмазский р-н', region: 'Губа-Хачмазский регион (Азербайджан)', countryCode: 'CIS', countryName: 'Азербайджан', flag: '🇦🇿' },
  { id: 'cis-sheki', name: 'Шеки', type: 'город', district: 'Шекинский р-н', region: 'Шеки-Загатальский регион (Азербайджан)', countryCode: 'CIS', countryName: 'Азербайджан', flag: '🇦🇿' },
  { id: 'cis-zaqatala', name: 'Загатала', type: 'город', district: 'Загатальский р-н', region: 'Шеки-Загатальский регион (Азербайджан)', countryCode: 'CIS', countryName: 'Азербайджан', flag: '🇦🇿' },

  // --- СТРАНЫ СНГ: МОЛДОВА ---
  { id: 'cis-trebujeni', name: 'Требужень (Старый Орхей)', type: 'село', district: 'Орхей', region: 'Район Орхей (Молдова)', countryCode: 'CIS', countryName: 'Молдова', flag: '🇲🇩' },
  { id: 'cis-orhei', name: 'Орхей (Оргеев)', type: 'город', district: 'Орхей', region: 'Район Орхей (Молдова)', countryCode: 'CIS', countryName: 'Молдова', flag: '🇲🇩' },
  { id: 'cis-cahul', name: 'Кагул', type: 'город', district: 'Кагул', region: 'Район Кагул (Молдова)', countryCode: 'CIS', countryName: 'Молдова', flag: '🇲🇩' },
  { id: 'cis-comrat', name: 'Комрат', type: 'город', district: 'Гагаузия', region: 'АТО Гагаузия (Молдова)', countryCode: 'CIS', countryName: 'Молдова', flag: '🇲🇩' },
  { id: 'cis-ciadir-lunga', name: 'Чадыр-Лунга', type: 'город', district: 'Гагаузия', region: 'АТО Гагаузия (Молдова)', countryCode: 'CIS', countryName: 'Молдова', flag: '🇲🇩' }
];

// Helper: Fast Search with caching & fuzzy prefix matching
export function searchLocations(query: string, limit = 20): LocationItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return EXPANDED_LOCATIONS.slice(0, limit);

  return EXPANDED_LOCATIONS.filter((item) => {
    return (
      item.name.toLowerCase().includes(clean) ||
      (item.district && item.district.toLowerCase().includes(clean)) ||
      item.region.toLowerCase().includes(clean) ||
      item.countryName.toLowerCase().includes(clean)
    );
  }).slice(0, limit);
}

// Cyrillic Alphabet for 1-tap first-letter index navigation
export const CYRILLIC_ALPHABET = [
  'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'
];

// Helper: Normalize Russian/Cyrillic strings with 'е'/'ё' equivalence and whitespace stripping
export function normalizeCyrillic(str: string): string {
  return str
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s-]/g, '')
    .trim();
}

export interface ScoredLocationItem {
  item: LocationItem;
  score: number;
  matchType: 'prefix' | 'word-prefix' | 'contains' | 'region';
}

// Intelligent prefix-first search with ranking, autocomplete scoring & country awareness
export function searchLocationsWithPrefix(
  query: string,
  options?: {
    countryCode?: 'RU' | 'BY' | 'KZ' | 'CIS';
    regionId?: string;
    limit?: number;
  }
): ScoredLocationItem[] {
  const normQuery = normalizeCyrillic(query);
  if (!normQuery) {
    let pool = EXPANDED_LOCATIONS;
    if (options?.countryCode) {
      pool = pool.filter((i) => i.countryCode === options.countryCode);
    }
    return pool.slice(0, options?.limit || 40).map((item) => ({
      item,
      score: 1,
      matchType: 'contains'
    }));
  }

  const results: ScoredLocationItem[] = [];

  for (const item of EXPANDED_LOCATIONS) {
    const normName = normalizeCyrillic(item.name);
    const normDistrict = item.district ? normalizeCyrillic(item.district) : '';
    const normRegion = normalizeCyrillic(item.region);
    const normCountry = normalizeCyrillic(item.countryName);

    let score = 0;
    let matchType: 'prefix' | 'word-prefix' | 'contains' | 'region' = 'contains';

    // 1. Exact match on settlement name
    if (normName === normQuery) {
      score = 150;
      matchType = 'prefix';
    }
    // 2. Settlement name starts with query (First letters matching!)
    else if (normName.startsWith(normQuery)) {
      score = 100 - Math.min(20, (normName.length - normQuery.length) * 0.5);
      matchType = 'prefix';
    }
    // 3. Word within settlement name starts with query
    else {
      const words = normName.split(/[\s-]+/);
      const matchingWord = words.find((w) => w.startsWith(normQuery));
      if (matchingWord) {
        score = 80;
        matchType = 'word-prefix';
      } else if (normName.includes(normQuery)) {
        score = 50;
        matchType = 'contains';
      } else if (normDistrict.startsWith(normQuery)) {
        score = 45;
        matchType = 'region';
      } else if (normRegion.startsWith(normQuery)) {
        score = 40;
        matchType = 'region';
      } else if (normDistrict.includes(normQuery) || normRegion.includes(normQuery)) {
        score = 25;
        matchType = 'region';
      } else if (normCountry.startsWith(normQuery) || normCountry.includes(normQuery)) {
        score = 15;
        matchType = 'region';
      }
    }

    if (score > 0) {
      // Prioritize active country if set
      if (options?.countryCode && item.countryCode === options.countryCode) {
        score += 8;
      }
      results.push({ item, score, matchType });
    }
  }

  // Sort by score desc, then alphabetically by name
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name, 'ru');
  });

  return results.slice(0, options?.limit || 40);
}

// Helper: Get Regions by Country
export function getRegionsByCountry(countryCode: 'RU' | 'BY' | 'KZ' | 'CIS'): RegionDef[] {
  return ALL_REGIONS.filter((r) => r.countryCode === countryCode);
}

// Helper: Get Settlements by Region
export function getSettlementsByRegion(regionName: string): LocationItem[] {
  return EXPANDED_LOCATIONS.filter(
    (item) => item.region.toLowerCase() === regionName.toLowerCase()
  );
}

// Helper: Format location label nicely (e.g., "село Шангалы (Архангельская обл., РФ)")
export function formatLocationLabel(item: LocationItem): string {
  const parts = [`${item.flag} ${item.type} ${item.name}`];
  if (item.district) {
    parts.push(item.district);
  }
  parts.push(item.region);
  return parts.join(', ');
}

