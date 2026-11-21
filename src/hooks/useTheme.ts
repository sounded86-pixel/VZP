import { UserProfile } from '../types';
import { useUserRole } from './useUserRole';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  name: string;
  themeClass: string;
  isBusiness: boolean;
  isElderly: boolean;
  isChild: boolean;
  isPro: boolean;
  isVip: boolean;
  
  // Theme Customizer additions:
  fontSize?: string;
  fontFamily?: string;
  borderRadius?: string;
  shadowSize?: string;
}

export const THEME_PALETTES: Record<string, ThemeColors> = {
  // 1. КЛАССИЧЕСКИЙ (classic) (🏠)
  classic: {
    primary: '#3B82F6',
    secondary: '#2563EB',
    accent: '#DBEAFE',
    background: '#FFFFFF',
    card: '#F8FAFC',
    text: '#1E293B',
    name: 'Классический',
    themeClass: 'theme-classic',
    isBusiness: false,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false,
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    borderRadius: '4px',
    shadowSize: '0 1px 3px rgba(0,0,0,0.1)'
  },
  // 2. ДЕРЕВЕНСКИЙ (village) (🌿)
  village: {
    primary: '#2C5F2D',
    secondary: '#D4AF37',
    accent: '#FFF8EE',
    background: '#F9F1E0',
    card: '#FFF8EE',
    text: '#4A3728',
    name: 'Деревенский',
    themeClass: 'theme-village',
    isBusiness: false,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false,
    fontSize: '18px',
    fontFamily: "'Georgia', serif",
    borderRadius: '16px',
    shadowSize: '0 4px 12px rgba(0,0,0,0.08)'
  },
  // 3. ДЕТСКИЙ (child) (🌈)
  child: {
    primary: '#0EA5E9',
    secondary: '#FBBF24',
    accent: '#FEF3C7',
    background: '#F0F9FF',
    card: '#FFFFFF',
    text: '#0C4A6E',
    name: 'Детский',
    themeClass: 'theme-child',
    isBusiness: false,
    isElderly: false,
    isChild: true,
    isPro: false,
    isVip: false,
    fontSize: '16px',
    fontFamily: "'Comic Sans MS', sans-serif",
    borderRadius: '24px',
    shadowSize: '0 4px 16px rgba(0,0,0,0.1)'
  },
  // 4. ТЁМНЫЙ (dark) (🌙)
  dark: {
    primary: '#818CF8',
    secondary: '#A78BFA',
    accent: '#1E293B',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    name: 'Тёмный',
    themeClass: 'theme-dark',
    isBusiness: false,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false,
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    borderRadius: '8px',
    shadowSize: '0 2px 8px rgba(0,0,0,0.3)'
  },
  // 5. МИНИМАЛИСТИЧНЫЙ (minimal) (⬜)
  minimal: {
    primary: '#64748B',
    secondary: '#94A3B8',
    accent: '#F1F5F9',
    background: '#FFFFFF',
    card: '#F1F5F9',
    text: '#0F172A',
    name: 'Минималистичный',
    themeClass: 'theme-minimal',
    isBusiness: false,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false,
    fontSize: '14px',
    fontFamily: "'Courier New', monospace",
    borderRadius: '2px',
    shadowSize: '0 1px 2px rgba(0,0,0,0.05)'
  },
  // 6. ЭКОЛОГИЧНЫЙ (eco) (🍃)
  eco: {
    primary: '#059669',
    secondary: '#065F46',
    accent: '#D1FAE5',
    background: '#F0FDF4',
    card: '#FFFFFF',
    text: '#064E3B',
    name: 'Экологичный',
    themeClass: 'theme-eco',
    isBusiness: false,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false,
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    borderRadius: '12px',
    shadowSize: '0 2px 8px rgba(5,150,105,0.1)'
  },
  // 7. VIP (vip) (👑)
  vip: {
    primary: '#D4AF37',
    secondary: '#FCD34D',
    accent: '#1A1A1A',
    background: '#0A0A0A',
    card: '#1A1A1A',
    text: '#FFFFFF',
    name: 'VIP',
    themeClass: 'theme-vip',
    isBusiness: true,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: true,
    fontSize: '16px',
    fontFamily: "'Playfair Display', serif",
    borderRadius: '8px',
    shadowSize: '0 4px 20px rgba(212,175,55,0.2)'
  },
  // 8. ПРОСТОЙ (elderly) (👵)
  elderly: {
    primary: '#2563EB',
    secondary: '#1D4ED8',
    accent: '#F8FAFC',
    background: '#FFFFFF',
    card: '#F8FAFC',
    text: '#000000',
    name: 'Простой',
    themeClass: 'theme-elderly',
    isBusiness: false,
    isElderly: true,
    isChild: false,
    isPro: false,
    isVip: false,
    fontSize: '20px',
    fontFamily: "'Inter', sans-serif",
    borderRadius: '8px',
    shadowSize: '0 2px 8px rgba(0,0,0,0.1)'
  },

  // Existing system fallback palettes:
  resident: {
    primary: '#1B4332',
    secondary: '#40916C',
    accent: '#D8F3DC',
    background: '#F8FAF9',
    card: '#FFFFFF',
    text: '#1B4332',
    name: 'Изумрудный Сад (Житель)',
    themeClass: 'theme-resident',
    isBusiness: false,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false
  },
  partner: {
    primary: '#4F46E5',
    secondary: '#6366F1',
    accent: '#818CF8',
    background: '#EEF2F6',
    card: '#FFFFFF',
    text: '#1E1B4B',
    name: 'Франшиза (Партнёр)',
    themeClass: 'theme-partner',
    isBusiness: true,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false
  },
  business_basic: {
    primary: '#EA580C',
    secondary: '#F97316',
    accent: '#FB923C',
    background: '#FFF7ED',
    card: '#FFFFFF',
    text: '#7C2D12',
    name: 'Янтарный Инструмент (Бизнес Базовый)',
    themeClass: 'theme-business-basic',
    isBusiness: true,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false
  },
  business_pro: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    accent: '#A78BFA',
    background: '#F5F3FF',
    card: '#FFFFFF',
    text: '#4C1D95',
    name: 'Аметистовое Небо (PRO-Аккаунт)',
    themeClass: 'theme-pro',
    isBusiness: true,
    isElderly: false,
    isChild: false,
    isPro: true,
    isVip: false
  },
  business_vip: {
    primary: '#111111',
    secondary: '#D4AF37',
    accent: '#E2B13C',
    background: '#0F0F0F',
    card: '#161616',
    text: '#F3E5AB',
    name: 'Золотая Симфония (VIP-Интерфейс)',
    themeClass: 'theme-vip',
    isBusiness: true,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: true
  },
  admin: {
    primary: '#1F2937',
    secondary: '#374151',
    accent: '#EF4444',
    background: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    name: 'Стальной Гранит (Администратор)',
    themeClass: 'theme-admin',
    isBusiness: true,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false
  },
  developer: {
    primary: '#0F172A',
    secondary: '#1E293B',
    accent: '#0EA5E9',
    background: '#0B0F19',
    card: '#1E293B',
    text: '#F8FAFC',
    name: 'Космический Код (Разработчик)',
    themeClass: 'theme-developer',
    isBusiness: true,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false
  },
  cozy: {
    primary: '#2C5F2D',
    secondary: '#6B4226',
    accent: '#D4AF37',
    background: '#F9F1E0',
    card: '#FCF8F2',
    text: '#6B4226',
    name: 'Душевная деревня',
    themeClass: 'theme-cozy',
    isBusiness: false,
    isElderly: false,
    isChild: false,
    isPro: false,
    isVip: false
  }
};

export function getUserTheme(user: UserProfile | null | undefined): ThemeColors {
  // 1. Check manual theme preference from Firestore or localStorage (if autoTheme is not explicitly forced/enabled)
  const isAutoTheme = user?.preferences?.autoTheme !== false; // defaults to true
  
  if (!isAutoTheme) {
    const manualTheme = user?.preferences?.theme || localStorage.getItem('theme_preference');
    if (manualTheme && THEME_PALETTES[manualTheme]) {
      return THEME_PALETTES[manualTheme];
    }
  }

  // 2. Automatic theme determination (or if user has autoTheme turned on)
  if (user) {
    const r = user.role;
    
    // Explicit Age check
    if (user.age && user.age > 65) {
      return THEME_PALETTES.elderly;
    }
    // Explicit age < 14 or child role check
    if ((user.age && user.age < 14) || r === 'child' || user.profileType === 'child') {
      return THEME_PALETTES.child;
    }
    // Explicit Tariff checks
    if ((user.tariff as string) === 'vip' || r === 'entrepreneur' && (user.tariff as string) === 'vip') {
      return THEME_PALETTES.vip;
    }
    if ((user.tariff as string) === 'pro') {
      return THEME_PALETTES.classic;
    }

    // Role fallbacks:
    if (r === 'developer' || user.profileType === 'developer') {
      return THEME_PALETTES.developer;
    }
    if (r === 'admin' || r === 'main_admin' || r === 'village_admin' || user.id === 'user_admin') {
      return THEME_PALETTES.admin;
    }
    if (r === 'partner' || user.profileType === 'partner') {
      return THEME_PALETTES.partner;
    }
    if (r === 'elderly' || user.profileType === 'pensioner') {
      return THEME_PALETTES.elderly;
    }
  }

  // Default theme is Classic
  return THEME_PALETTES.classic;
}

export function useTheme(user: UserProfile | null | undefined): ThemeColors {
  return getUserTheme(user);
}
