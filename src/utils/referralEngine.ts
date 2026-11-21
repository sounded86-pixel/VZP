import { UserProfile } from '../types';
import { getUserRoleAndTariff } from '../hooks/useUserRole';

/**
 * Recalculates and awards referral bonus points to a referrer based on a referred friend's current state.
 * Supports:
 * - Resident registration: +10 points
 * - Master promotion: +30 points total (recalculated as +30 points)
 * - Entrepreneur promotion: +40 points total (recalculated as +40 points)
 * - Tariff upgrades:
 *   - Master PRO: +50 points
 *   - Master VIP: +100 points
 *   - Entrepreneur PRO: +60 points
 *   - Entrepreneur VIP: +120 points
 */
export function processReferralAwards(users: UserProfile[], referredUser: UserProfile): UserProfile[] {
  const referrerId = referredUser.referrals?.referredBy;
  if (!referrerId) return users;

  // Find referrer
  const referrerIdx = users.findIndex(u => u.id === referrerId);
  if (referrerIdx === -1) return users;

  const referrer = { ...users[referrerIdx] };
  const referrerHistory = [...(referrer.referrals?.history || [])];

  // Determine current role & tariff of the referred user
  const roleResult = getUserRoleAndTariff(referredUser);
  const currentRole = roleResult.role; // 'resident' | 'master' | 'entrepreneur' | etc.
  const currentTariff = referredUser.tariff || null; // 'pro' | 'vip' | null

  // Calculate base bonus points
  let basePoints = 10; // default for resident
  if (currentRole === 'master') {
    basePoints = 30;
  } else if (currentRole === 'entrepreneur') {
    basePoints = 40;
  }

  // Calculate upgrade points
  let upgradePoints = 0;
  const upgradeHistory: { tariff: 'pro' | 'vip'; pointsEarned: number; date: string }[] = [];

  if (currentRole === 'master') {
    if (currentTariff === 'pro') {
      upgradePoints = 50;
      upgradeHistory.push({ tariff: 'pro', pointsEarned: 50, date: new Date().toISOString().split('T')[0] });
    } else if (currentTariff === 'vip') {
      upgradePoints = 100;
      upgradeHistory.push({ tariff: 'vip', pointsEarned: 100, date: new Date().toISOString().split('T')[0] });
    }
  } else if (currentRole === 'entrepreneur') {
    if (currentTariff === 'pro') {
      upgradePoints = 60;
      upgradeHistory.push({ tariff: 'pro', pointsEarned: 60, date: new Date().toISOString().split('T')[0] });
    } else if (currentTariff === 'vip') {
      upgradePoints = 120;
      upgradeHistory.push({ tariff: 'vip', pointsEarned: 120, date: new Date().toISOString().split('T')[0] });
    }
  }

  const totalPointsForThisFriend = basePoints + upgradePoints;

  // Find or create history entry for this friend in referrer's profile
  const friendIdx = referrerHistory.findIndex(h => h.userId === referredUser.id);
  
  // Calculate difference in points to adjust referrer's thanksCount
  let pointsDiff = 0;
  if (friendIdx === -1) {
    // New friend!
    referrerHistory.push({
      userId: referredUser.id,
      userName: referredUser.name,
      userRole: currentRole,
      pointsEarned: totalPointsForThisFriend,
      date: new Date().toISOString().split('T')[0],
      upgrades: upgradeHistory
    });
    pointsDiff = totalPointsForThisFriend;
  } else {
    // Existing friend, update their details and calculate difference
    const oldPoints = referrerHistory[friendIdx].pointsEarned;
    referrerHistory[friendIdx] = {
      ...referrerHistory[friendIdx],
      userName: referredUser.name,
      userRole: currentRole,
      pointsEarned: totalPointsForThisFriend,
      upgrades: upgradeHistory.length > 0 ? upgradeHistory : referrerHistory[friendIdx].upgrades
    };
    pointsDiff = totalPointsForThisFriend - oldPoints;
  }

  // Only update if points actually changed
  if (pointsDiff !== 0 || friendIdx === -1) {
    const nextThanksCount = (referrer.thanksCount || 0) + pointsDiff;
    const nextTotalEarnedPoints = (referrer.referrals?.totalEarnedPoints || 0) + pointsDiff;
    const nextTotalFriends = referrerHistory.length;

    referrer.thanksCount = nextThanksCount;
    referrer.referrals = {
      ...referrer.referrals,
      code: referrer.referrals?.code || `UST-${Math.floor(1000 + Math.random() * 9000)}-${Array.from({ length: 3 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]).join('')}`,
      total: nextTotalFriends,
      totalEarnedPoints: nextTotalEarnedPoints,
      history: referrerHistory,
      referredBy: referrer.referrals?.referredBy
    };

    const nextUsers = [...users];
    nextUsers[referrerIdx] = referrer;
    return nextUsers;
  }

  return users;
}
