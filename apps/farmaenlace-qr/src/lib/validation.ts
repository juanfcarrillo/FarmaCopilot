// Validación de formato/checksum, no verificación de titularidad.
export function isValidDocument(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{10}$/.test(value)) return false;
  const province = Number(value.slice(0, 2));
  if (province < 1 || (province > 24 && province !== 30) || Number(value[2]) > 5 || /^0+$/.test(value)) return false;
  let total = 0;
  for (let i = 0; i < 9; i++) { let digit = Number(value[i]) * (i % 2 ? 1 : 2); if (digit > 9) digit -= 9; total += digit; }
  return (10 - total % 10) % 10 === Number(value[9]);
}
export function isValidEmail(value: string) { return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
