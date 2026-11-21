export const MODULES_CONFIG = {
  // Бесплатное ядро (доступно всем всегда)
  free: {
    help: true,
    chat: true,
    masters: true,
    rating: true,
    news: true,
    rides: true,
    achievements: true,
    digital_literacy: true,
    public_control: true,
  },
  
  // Платные модули (включаются по пакету)
  paid: {
    products: 'business',      // Требует пакета BUSINESS
    transport: 'government',   // Требует пакета GOVERNMENT
    ecology: 'government',     // Требует пакета GOVERNMENT
    government: 'government',  // Требует пакета GOVERNMENT
    sos: 'government',         // Требует пакета GOVERNMENT
    marketplace: 'business',   // Требует пакета BUSINESS
    analytics: 'government',   // Требует пакета GOVERNMENT
  }
} as const;

export interface RegionModules {
  help: boolean;
  chat: boolean;
  masters: boolean;
  rating: boolean;
  news: boolean;
  products: boolean;
  transport: boolean;
  ecology: boolean;
  government: boolean;
  sos: boolean;
  analytics: boolean;
}

export function getModulesForPackages(packages: string[]): RegionModules {
  const hasBusiness = packages.includes('business') || packages.includes('government');
  const hasGovernment = packages.includes('government');

  return {
    help: true,
    chat: true,
    masters: true,
    rating: true,
    news: true,
    products: hasBusiness,
    transport: hasGovernment,
    ecology: hasGovernment,
    government: hasGovernment,
    sos: hasGovernment,
    analytics: hasGovernment,
  };
}

