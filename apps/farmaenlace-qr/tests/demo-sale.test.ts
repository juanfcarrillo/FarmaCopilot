import { describe, expect, it } from 'vitest';
import { demoSale, registeredPromotions } from '../src/lib/demo-sale';

describe('venta de demostración', () => {
  it('habilita beneficio solo después de registro confirmado', () => {
    for (const status of [undefined, 'awaiting_customer', 'expired', 'cancelled'] as const) {
      expect(demoSale(status)).toEqual({ subtotal: 2440, discount: 0, total: 2440 });
    }
    for (const status of ['registered', 'recorded_manual'] as const) {
      expect(demoSale(status)).toEqual({ subtotal: 2440, discount: 244, total: 2196 });
    }
  });
  it('mantiene promociones exclusivas bloqueadas ante ausencia, espera, cancelación o vencimiento', () => {
    for (const status of [undefined, 'awaiting_customer', 'expired', 'cancelled'] as const) {
      const promotions = registeredPromotions(status);
      expect(promotions).toHaveLength(2);
      expect(promotions.every(p => !p.active && p.discount === 0)).toBe(true);
    }
  });
  it('activa promociones por producto y deriva el total sin acumular un descuento general extra', () => {
    for (const status of ['registered', 'recorded_manual'] as const) {
      const promotions = registeredPromotions(status);
      expect(promotions.every(p => p.active)).toBe(true);
      expect(promotions.map(p => p.discount)).toEqual([85, 159]);
      expect(new Set(promotions.map(p => p.itemId)).size).toBe(2);
      expect(demoSale(status).discount).toBe(promotions.reduce((sum, p) => sum + p.discount, 0));
    }
  });
});
