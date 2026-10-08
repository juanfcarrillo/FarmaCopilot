import 'server-only';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DomainError } from './domain';
import { RegistrationService } from './service';
export function service() {
  const projectId = process.env.FIREBASE_PROJECT_ID, secret = process.env.CUSTOMER_KEY_SECRET;
  if (!projectId || !secret || secret.length < 32) throw new DomainError(503, 'El servicio de registro aún no está configurado. Solicita ayuda al responsable del sistema.', 'not_configured');
  if (process.env.NODE_ENV === 'production' && process.env.FIRESTORE_EMULATOR_HOST && !projectId.startsWith('demo-')) throw new DomainError(503, 'La configuración del servicio requiere revisión.', 'not_configured');
  const existing = getApps().find(app => app.name === 'farmaenlace-qr');
  const credential = process.env.FIRESTORE_EMULATOR_HOST ? undefined : process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY ? cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }) : applicationDefault();
  const app = existing || initializeApp({ projectId, ...(credential ? { credential } : {}) }, 'farmaenlace-qr');
  return new RegistrationService(getFirestore(app), { secret });
}
