import { response } from '@/lib/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() { return response({ configured: Boolean(process.env.FIREBASE_PROJECT_ID && process.env.CUSTOMER_KEY_SECRET && process.env.CUSTOMER_KEY_SECRET.length>=32), storage: process.env.FIRESTORE_EMULATOR_HOST ? 'firestore_emulator' : 'firestore', vendix: 'not_connected' }); }
