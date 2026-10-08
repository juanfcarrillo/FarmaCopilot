/** Contrato futuro, no API real: no se confirma una venta desde este MVP. */
export type VendixRegistrationReference = { registrationCode: string; location: string; register: string; ticketReference?: string; source: 'manual_unverified' };
export interface VendixAdapter { readonly integrationStatus: 'not_connected' | 'connected'; registerReference(reference: VendixRegistrationReference): Promise<{ status: 'manual_required' | 'linked'; confirmedByVendix: boolean }> }
export class ManualVendixAdapter implements VendixAdapter {
  readonly integrationStatus = 'not_connected' as const;
  async registerReference(_reference: VendixRegistrationReference) { void _reference; return { status:'manual_required' as const, confirmedByVendix:false }; }
}
