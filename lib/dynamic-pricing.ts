export function calculateDynamicPrice(basePrice: number, occupancyPercent: number): number {
  // 0-30% occupancy: -10% discount
  // 30-60%: base price
  // 60-80%: +15% markup
  // 80-100%: +30% markup
  if (occupancyPercent < 30) return Math.round(basePrice * 0.9)
  if (occupancyPercent < 60) return basePrice
  if (occupancyPercent < 80) return Math.round(basePrice * 1.15)
  return Math.round(basePrice * 1.3)
}
