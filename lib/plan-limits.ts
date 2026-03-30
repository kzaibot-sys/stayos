export const PLAN_LIMITS = {
  FREE: { maxRooms: 3, maxBookingsPerMonth: 20, features: ['site', 'booking'] },
  STARTER: { maxRooms: 10, maxBookingsPerMonth: 100, features: ['site', 'booking', 'telegram', 'email'] },
  PRO: { maxRooms: 30, maxBookingsPerMonth: Infinity, features: ['site', 'booking', 'telegram', 'email', 'reports', 'api', 'csv'] },
  ENTERPRISE: { maxRooms: Infinity, maxBookingsPerMonth: Infinity, features: ['site', 'booking', 'telegram', 'email', 'reports', 'api', 'csv', 'whitelabel', 'priority'] },
}

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.FREE
}

export function canAddRoom(plan: string, currentRoomCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentRoomCount < limits.maxRooms
}

export function canCreateBooking(plan: string, currentMonthBookings: number): boolean {
  const limits = getPlanLimits(plan)
  return currentMonthBookings < limits.maxBookingsPerMonth
}

export function hasFeature(plan: string, feature: string): boolean {
  const limits = getPlanLimits(plan)
  return limits.features.includes(feature)
}
