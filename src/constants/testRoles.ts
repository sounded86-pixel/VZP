import { UserProfile } from '../types';

export interface TestRoleProfile extends UserProfile {
  title: string;
  badgeColor: string;
  ratingText: string;
}

export const TEST_ROLES: TestRoleProfile[] = [
  {
    id: "test_resident",
    name: "Иван Иванов",
    phone: "+7 911 123-45-67",
    village: "Березник",
    skills: ["woodcutter", "housekeeper"],
    thanksCount: 127,
    createdCount: 5,
    resolvedCount: 4,
    blocked: false,
    reportsCount: 0,
    role: "resident",
    title: "Житель",
    badgeColor: "bg-emerald-500 text-white",
    ratingText: "⭐ 4.8 (127 спасибо)"
  },
  {
    id: "test_pensioner",
    name: "Мария Петровна",
    phone: "+7 921 555-66-77",
    village: "Октябрьский",
    skills: ["medic"],
    thanksCount: 89,
    createdCount: 1,
    resolvedCount: 20,
    blocked: false,
    reportsCount: 0,
    role: "elderly",
    title: "Пенсионер",
    badgeColor: "bg-amber-500 text-slate-950",
    ratingText: "⭐ 4.5 (89 спасибо)",
    isSimplifiedMode: true
  },
  {
    id: "test_master",
    name: "Пётр Сидоров",
    phone: "+7 921 765-43-21",
    village: "Шангалы",
    skills: ["tractorist", "driver"],
    thanksCount: 56,
    createdCount: 2,
    resolvedCount: 8,
    blocked: false,
    reportsCount: 0,
    role: "master",
    isMaster: true,
    title: "Мастер",
    badgeColor: "bg-blue-600 text-white",
    ratingText: "⭐ 4.9 (56 спасибо)"
  },
  {
    id: "test_entrepreneur",
    name: "Анна Смирнова",
    phone: "+7 921 555-11-22",
    village: "Октябрьский",
    skills: ["housekeeper"],
    thanksCount: 152,
    createdCount: 3,
    resolvedCount: 15,
    blocked: false,
    reportsCount: 0,
    role: "resident",
    title: "Активист села",
    badgeColor: "bg-teal-600 text-white",
    ratingText: "⭐ 4.9 (152 спасибо)"
  },
  {
    id: "test_admin",
    name: "Администратор",
    phone: "+7 900 000-00-00",
    village: "Октябрьский",
    skills: ["lawyer"],
    thanksCount: 100,
    createdCount: 0,
    resolvedCount: 0,
    blocked: false,
    reportsCount: 0,
    role: "admin",
    title: "Администратор",
    badgeColor: "bg-red-600 text-white",
    ratingText: "🛡️ Модерация и помощь"
  },
  {
    id: "test_partner",
    name: "Елена Кузнецова",
    phone: "+7 921 999-88-77",
    village: "Вельский район",
    skills: ["medic"],
    thanksCount: 45,
    createdCount: 2,
    resolvedCount: 9,
    blocked: false,
    reportsCount: 0,
    role: "resident",
    title: "Волонтёр района",
    badgeColor: "bg-purple-600 text-white",
    ratingText: "🤝 Взаимовыручка (45 спасибо)"
  },
  {
    id: "test_developer",
    name: "Разработчик",
    phone: "+7 999 000-00-00",
    village: "Шангалы",
    skills: [],
    thanksCount: 999,
    createdCount: 0,
    resolvedCount: 0,
    blocked: false,
    reportsCount: 0,
    role: "developer",
    title: "Разработчик",
    badgeColor: "bg-slate-900 border border-slate-700 text-slate-100",
    ratingText: "⚙️ Полный доступ (dev_mode)"
  }
];
