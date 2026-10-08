import { describe, expect, it } from 'vitest';
import { demoSale } from '../src/lib/demo-sale';

describe('venta de demostración', () => {
  it('habilita beneficio solo después de registro confirmado', () => {
    for (const status of [undefined, 'awaiting_customer', 'expired', 'cancelled'] as const) {
      expect(demoSale(status, 10)).toEqual({ subtotal: 2440, discount: 0, total: 2440 });
    }
    for (const status of ['registered', 'recorded_manual'] as const) {
      expect(demoSale(status, 10)).toEqual({ subtotal: 2440, discount: 244, total: 2196 });
    }
  });
  it('redondea centavos y rechaza porcentajes fuera de límites', () => {
    expect(demoSale('registered', 7)).toEqual({ subtotal: 2440, discount: 171, total: 2269 });
    for (const percent of [-1, 31, NaN, Infinity, 10.5]) expect(() => demoSale('registered', percent)).toThrow();
    expect(demoSale('registered', 0).discount).toBe(0);
  });
});
