import type { SessionView } from './client';

// Catálogo ficticio: estas ofertas no proceden de PromoGo ni son campañas vigentes.
export const DEMO_ITEMS = [
  { id: 'gel', name: 'Gel limpiador', detail: 'Cuidado personal · 1 unidad', cents: 850 },
  { id: 'solar', name: 'Protector solar', detail: 'Cuidado personal · 1 unidad', cents: 1590 },
] as const;

const DEMO_PROMOTIONS = [
  { id: 'registered-gel', itemId: 'gel', percent: 10 },
  { id: 'registered-solar', itemId: 'solar', percent: 10 },
] as const satisfies readonly { id: string; itemId: typeof DEMO_ITEMS[number]['id']; percent: number }[];

export function registeredPromotions(status: SessionView['status'] | undefined) {
  // Marketing por correo es una preferencia independiente de la elegibilidad en caja.
  const active = status === 'registered' || status === 'recorded_manual';
  return DEMO_PROMOTIONS.map(promotion => {
    const item = DEMO_ITEMS.find(item => item.id === promotion.itemId)!;
    const potentialDiscount = Math.round(item.cents * promotion.percent / 100);
    return { ...promotion, itemName: item.name, active, potentialDiscount, discount: active ? potentialDiscount : 0 };
  });
}

export function demoSale(status: SessionView['status'] | undefined) {
  const subtotal = DEMO_ITEMS.reduce((sum, item) => sum + item.cents, 0);
  const discount = registeredPromotions(status).reduce((sum, promotion) => sum + promotion.discount, 0);
  return { subtotal, discount, total: subtotal - discount };
}

export const money = (cents: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(cents / 100);
