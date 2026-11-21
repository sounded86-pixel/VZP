import { UserProfile } from '../types';

export type UserRoleType = 'resident' | 'master' | 'entrepreneur' | 'admin' | 'developer' | 'child' | 'elderly' | 'parent' | 'grandparent' | 'partner';
export type TariffType = 'basic' | 'pro' | 'vip' | null;

export interface UseUserRoleResult {
  role: UserRoleType;
  tariff: TariffType;
  isResident: boolean;
  isMaster: boolean;
  isEntrepreneur: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  isChild: boolean;
  isElderly: boolean;
  isParent: boolean;
  isGrandparent: boolean;
  isPartner: boolean;
  isPro: boolean;
  isVip: boolean;
  getFeatures: () => string[];
}

export function getUserRoleAndTariff(user: UserProfile | null | undefined): UseUserRoleResult {
  if (!user) {
    return {
      role: 'resident',
      tariff: null,
      isResident: true,
      isMaster: false,
      isEntrepreneur: false,
      isAdmin: false,
      isDeveloper: false,
      isChild: false,
      isElderly: false,
      isParent: false,
      isGrandparent: false,
      isPartner: false,
      isPro: false,
      isVip: false,
      getFeatures: () => ['view_feed', 'request_help']
    };
  }

  // Map role adaptively based on selected profileType simulation or core role
  let mappedRole: UserRoleType = 'resident';
  const activeProfileType = user.profileType;

  if (activeProfileType) {
    if (activeProfileType === 'craftsman' || activeProfileType === 'master') {
      mappedRole = 'master';
    } else if (activeProfileType === 'entrepreneur_goods' || activeProfileType === 'entrepreneur' || activeProfileType === 'taxi' || activeProfileType === 'bus') {
      mappedRole = 'entrepreneur';
    } else if (activeProfileType === 'administration' || activeProfileType === 'admin') {
      mappedRole = 'admin';
    } else if (activeProfileType === 'developer') {
      mappedRole = 'developer';
    } else if (activeProfileType === 'child') {
      mappedRole = 'child';
    } else if (activeProfileType === 'pensioner' || activeProfileType === 'elderly') {
      mappedRole = 'elderly';
    } else if (activeProfileType === 'parent') {
      mappedRole = 'parent';
    } else if (activeProfileType === 'grandparent') {
      mappedRole = 'grandparent';
    } else if (activeProfileType === 'partner') {
      mappedRole = 'partner';
    } else {
      mappedRole = 'resident';
    }
  } else {
    const r = user.role;
    if (r === 'admin' || r === 'main_admin' || r === 'village_admin' || user.id === 'user_admin') {
      mappedRole = 'admin';
    } else if (r === 'developer') {
      mappedRole = 'developer';
    } else if (r === 'master' || user.isMaster) {
      mappedRole = 'master';
    } else if (r === 'entrepreneur' || user.isEntrepreneur) {
      mappedRole = 'entrepreneur';
    } else if (r === 'child') {
      mappedRole = 'child';
    } else if (r === 'elderly' || (r as string) === 'pensioner') {
      mappedRole = 'elderly';
    } else if (r === 'parent') {
      mappedRole = 'parent';
    } else if (r === 'grandparent') {
      mappedRole = 'grandparent';
    } else if (r === 'partner') {
      mappedRole = 'partner';
    } else {
      mappedRole = 'resident';
    }
  }

  // Tariffs for master and entrepreneur
  const tariff: TariffType = (mappedRole === 'master' || mappedRole === 'entrepreneur') 
    ? (user.tariff || 'basic') 
    : null;

  const isResident = mappedRole === 'resident';
  const isMaster = mappedRole === 'master';
  const isEntrepreneur = mappedRole === 'entrepreneur';
  const isAdmin = mappedRole === 'admin';
  const isDeveloper = mappedRole === 'developer';
  const isChild = mappedRole === 'child';
  const isElderly = mappedRole === 'elderly';
  const isParent = mappedRole === 'parent';
  const isGrandparent = mappedRole === 'grandparent';
  const isPartner = mappedRole === 'partner';

  const isPro = tariff === 'pro';
  const isVip = tariff === 'vip';

  const getFeatures = () => {
    const features: string[] = ['view_feed', 'request_help', 'notes', 'calendar', 'sos', 'transport'];

    if (isResident) {
      features.push('view_masters', 'view_products', 'rate_master', 'order_product');
    }

    if (isPartner) {
      features.push('partner_cabinet', 'view_feed');
    }

    if (isMaster) {
      features.push('view_masters', 'master_cabinet', 'view_orders', 'edit_portfolio');
      if (tariff === 'pro' || tariff === 'vip') {
        features.push('priority_placement', 'analytics');
      }
      if (tariff === 'vip') {
        features.push('sms_notifications', 'exclusive_badge');
      }
    }

    if (isEntrepreneur) {
      features.push('view_products', 'order_product', 'merchant_cabinet', 'manage_goods');
      if (tariff === 'basic') {
        features.push('basic_delivery');
      }
      if (tariff === 'pro' || tariff === 'vip') {
        features.push('analytics', 'promotions', 'priority_listing');
      }
      if (tariff === 'vip') {
        features.push('api_integration', 'personal_support', 'sms_notifications', 'vip_badge');
      }
    }

    if (isAdmin || isDeveloper) {
      features.push(
        'view_masters', 'view_products', 'admin_panel', 'moderate_content', 
        'block_users', 'manage_tariffs', 'analytics', 'promotions'
      );
    }

    if (isDeveloper) {
      features.push('developer_console', 'simulate_users', 'view_system_logs', 'firestore_manager', 'run_tests');
    }

    if (isChild) {
      features.push('view_games', 'child_sos', 'call_parent');
    }

    if (isElderly) {
      features.push('digital_school', 'large_font', 'call_grandchildren');
    }

    if (isParent) {
      features.push('manage_children', 'assign_tasks', 'view_child_location');
    }

    if (isGrandparent) {
      features.push('view_grandchild_progress', 'digital_school');
    }

    return features;
  };

  return {
    role: mappedRole,
    tariff,
    isResident,
    isMaster,
    isEntrepreneur,
    isAdmin,
    isDeveloper,
    isChild,
    isElderly,
    isParent,
    isGrandparent,
    isPartner,
    isPro,
    isVip,
    getFeatures
  };
}

export function useUserRole(user: UserProfile | null | undefined): UseUserRoleResult {
  return getUserRoleAndTariff(user);
}
