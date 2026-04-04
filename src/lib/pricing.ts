/**
 * Buy-6-get-1-free deal: every 7th cup is free.
 * Returns the number of free cups and charged cups for a given quantity.
 */
export function calcPricing(quantity: number, pricePerCupStr: string) {
  const price = parseFloat(pricePerCupStr);
  const freeCups = Math.floor(quantity / 7);
  const chargedCups = quantity - freeCups;
  const total = chargedCups * price;
  return { freeCups, chargedCups, total };
}

export function formatTotal(total: number): string {
  return total.toFixed(2);
}
