import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { it } from 'vitest';
it('deniega toda lectura/escritura SDK cliente, incluso identidad fabricada', async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-farmaenlace', firestore: { host: '127.0.0.1', port: 8085, rules: await readFile('firestore.rules', 'utf8') } });
  try {
    for (const context of [env.unauthenticatedContext(), env.authenticatedContext('fabricated')]) {
      for (const collection of ['customers','customerKeys','registrationSessions','registrationCodes','events','manualVendixRecords','customerObservations']) {
        await assertFails(getDoc(doc(context.firestore(), collection, 'sample')));
        await assertFails(setDoc(doc(context.firestore(), collection, 'sample'), { email: 'never@public.test' }));
      }
    }
  } finally { await env.cleanup(); }
});
