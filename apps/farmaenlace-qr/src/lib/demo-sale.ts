import type { SessionView } from './client';

// Productos y precios ficticios: esta simulación no calcula promociones de PromoGo.
export const DEMO_ITEMS = [
  { name: 'Gel limpiador', detail: 'Cuidado personal · 1 unidad', cents: 850 },
  { name: 'Protector solar', detail: 'Cuidado personal · 1 unidad', cents: 1590 },
] as const;

export function demoSale(status: SessionView['status'] | undefined, percent: number) {
  if (!Number.isInteger(percent) || percent < 0 || percent > 30) throw new Error('Descuento demo fuera de rango.');
  const subtotal = DEMO_ITEMS.reduce((sum, item) => sum + item.cents, 0);
  const identified = status === 'registered' || status === 'recorded_manual';
  const discount = identified ? Math.round(subtotal * percent / 100) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

export const money = (cents: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(cents / 100);
