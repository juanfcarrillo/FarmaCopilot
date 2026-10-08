import { expect, test, type Page, type BrowserContext } from '@playwright/test';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8085';
const db = getFirestore(initializeApp({projectId:'demo-farmaenlace'},'e2e'));
async function createQr(page: Page) {
  await page.goto('/pos');
  const creation = page.waitForResponse(r=>r.url().endsWith('/api/registration-sessions') && r.request().method()==='POST');
  await page.getByRole('button',{name:/Generar QR/}).click();
  const response = await creation; expect(response.status()).toBe(201); return response.json() as Promise<{session:{id:string};qrToken:string}>;
}
async function registerCustomer(page: Page, session: {session:{id:string};qrToken:string}) {
  await page.goto(`/registro#id=${session.session.id}&token=${session.qrToken}`);
  await page.getByLabel('Cédula ecuatoriana').fill('1710034065'); await page.getByLabel('Correo electrónico').fill('cliente@example.com');
  await expect(page.getByRole('checkbox')).not.toBeChecked(); await page.getByRole('button',{name:'Obtener mi código'}).click();
  await expect(page.getByTestId('customer-code')).toBeVisible(); return (await page.getByTestId('customer-code').textContent())!;
}
async function post(context:BrowserContext,path:string,body:unknown) { return context.request.post(path,{headers:{origin:'http://localhost:3000'},data:body}); }
test('dos contextos: QR → registro → mismo código SSE → constancia manual y refresh', async ({ browser }) => {
  const posContext = await browser.newContext(), customerContext = await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  await customerContext.addInitScript(() => { Object.defineProperty(Crypto.prototype, 'randomUUID', { value: undefined, configurable: true }); });
  const pos = await posContext.newPage(), customer = await customerContext.newPage();
  try {
    const session=await createQr(pos), code=await registerCustomer(customer,session);
    await expect(pos.getByTestId('pos-code')).toHaveText(code);
    await expect(pos.getByText('Datos personales protegidos.')).toBeVisible();
    await customer.reload(); await expect(customer.getByTestId('customer-code')).toHaveText(code);
    await pos.reload(); await expect(pos.getByTestId('pos-code')).toHaveText(code);
    await pos.getByRole('button',{name:'Ya lo ingresé en Vendix'}).click();
    await expect(pos.locator('.manual-success')).toBeVisible();
    await expect(pos.getByText('No confirma una venta desde Vendix.')).toBeVisible();
    expect((await db.doc(`manualVendixRecords/${session.session.id}`).get()).get('source')).toBe('manual_unverified');
    await customer.screenshot({path:'test-results/registro-mobile.png',fullPage:true}); await pos.screenshot({path:'test-results/pos-desktop.png',fullPage:true});
  } finally {await posContext.close();await customerContext.close();}
});
test('dos cajas aisladas; cookie inexistente, falsa y QR no abren sesión ni PII',async({browser})=>{
  const a=await browser.newContext(), b=await browser.newContext(), phone=await browser.newContext();
  const pageA=await a.newPage(), pageB=await b.newPage(), mobile=await phone.newPage();
  try {
    const sa=await createQr(pageA),sb=await createQr(pageB);
    for(const method of ['read','cancel','record']){
      const path=`/api/registration-sessions/${sa.session.id}`;
      const result=method==='read'?await b.request.get(path):await post(b,path+(method==='cancel'?'/cancel':'/vendix-record'),method==='record'?{code:'FA-XXXX',ticket:''}:{});
      expect(result.status()).toBe(404);
    }
    expect((await phone.request.get(`/api/registration-sessions/${sa.session.id}`)).status()).toBe(404);
    await phone.addCookies([{name:'fa_console',value:sa.qrToken,domain:'localhost',path:'/'}]);
    expect((await phone.request.get(`/api/registration-sessions/${sa.session.id}`)).status()).toBe(404);
    const code=await registerCustomer(mobile,sa); await expect(pageA.getByTestId('pos-code')).toHaveText(code); await expect(pageB.getByTestId('pos-code')).toHaveText('FA-••••-••••-••');
    const response=await a.request.get(`/api/registration-sessions/${sa.session.id}`), data=await response.json();
    expect(data).not.toHaveProperty('document');expect(data).not.toHaveProperty('email');expect(data).not.toHaveProperty('ownerHash');expect(data).not.toHaveProperty('customerId');
    expect((await post(b,`/api/registration-sessions/${sb.session.id}/cancel`,{})).status()).toBe(200);
  }finally{await a.close();await b.close();await phone.close();}
});
test('vencimiento/cancelación y red muestran error real; envío idéntico idempotente',async({browser})=>{
  const posContext=await browser.newContext(), phoneContext=await browser.newContext();
  const pos=await posContext.newPage(),phone=await phoneContext.newPage();
  try {
    const expired=await createQr(pos); await db.doc(`registrationSessions/${expired.session.id}`).update({expiresAt:Date.now()-1});
    await phone.goto(`/registro#id=${expired.session.id}&token=${expired.qrToken}`);
    await phone.getByLabel('Cédula ecuatoriana').fill('1710034065');await phone.getByLabel('Correo electrónico').fill('cliente@example.com');await phone.getByRole('button',{name:'Obtener mi código'}).click();
    await expect(phone.getByRole('heading',{name:'Necesitas un nuevo QR.'})).toBeVisible();await expect(phone.getByText(/Este QR venció/)).toBeVisible();
    const cancelled=await createQr(pos);await pos.getByRole('button',{name:'Cancelar QR'}).click();
    const failed=await post(phoneContext,'/api/registrations',{sessionId:cancelled.session.id,token:cancelled.qrToken,document:'1710034065',email:'cliente@example.com',marketing:false,idempotencyKey:'cancelled-retry'});expect(failed.status()).toBe(410);
    const retry=await createQr(pos); await phone.goto(`/registro#id=${retry.session.id}&token=${retry.qrToken}`);await phone.getByLabel('Cédula ecuatoriana').fill('1710034065');await phone.getByLabel('Correo electrónico').fill('cliente@example.com');
    await phone.route('**/api/registrations',route=>route.abort('failed'));await phone.getByRole('button',{name:'Obtener mi código'}).click();await expect(phone.locator('form .alert')).toContainText('No hay conexión');await expect(phone.getByTestId('customer-code')).toHaveCount(0);await phone.unroute('**/api/registrations');await phone.getByRole('button',{name:'Obtener mi código'}).click();await expect(phone.getByTestId('customer-code')).toBeVisible();
    const body={sessionId:retry.session.id,token:retry.qrToken,document:'1710034065',email:'cliente@example.com',marketing:false,idempotencyKey:'same-payload-retry'};
    const a=await post(phoneContext,'/api/registrations',body),b=await post(phoneContext,'/api/registrations',body);expect((await a.json()).code).toBe((await b.json()).code);
    const conflict=await post(phoneContext,'/api/registrations',{...body,email:'different@example.com'});expect(conflict.status()).toBe(409);
  }finally{await posContext.close();await phoneContext.close();}
});
test('API rechaza origen ajeno y payload grande; SSE acotado y sin datos personales',async({browser})=>{
  const context=await browser.newContext(),page=await context.newPage();
  try {
    const session=await createQr(page);
    const bad=await context.request.post('/api/registration-sessions',{headers:{origin:'https://evil.test'},data:{location:'A',register:'1'}});expect(bad.status()).toBe(403);
    const huge=await post(context,'/api/registrations',{value:'x'.repeat(9000)});expect(huge.status()).toBe(413);
    const cookies=(await context.cookies()).map(c=>`${c.name}=${c.value}`).join(';');
    const start=Date.now(), response=await fetch(`http://localhost:3000/api/registration-sessions/${session.session.id}/events`,{headers:{cookie:cookies}}),text=await response.text();
    expect(response.headers.get('content-type')).toContain('text/event-stream');expect(Date.now()-start).toBeLessThan(30000);expect(text).toContain('awaiting_customer');expect(text).not.toContain('ownerHash');expect(text).not.toContain('tokenHash');expect(text).not.toContain('customerId');
  }finally{await context.close();}
});
test('restauración POS conserva sesión ante fallo de red y permite reintentar',async({browser})=>{
  const context=await browser.newContext(), page=await context.newPage();
  try {
    const session=await createQr(page);
    const result=await post(context,'/api/registrations',{sessionId:session.session.id,token:session.qrToken,document:'1710034065',email:'retry@example.com',marketing:false,idempotencyKey:'network-restore-test'}),code=(await result.json()).code;
    await expect(page.getByTestId('pos-code')).toHaveText(code);
    await page.route(`**/api/registration-sessions/${session.session.id}`,route=>route.abort('failed'));
    await page.reload(); await expect(page.locator('.alert')).toContainText('No hay conexión');
    await expect(page.getByRole('button',{name:'Generar QR'})).toBeDisabled();
    await expect(page.getByRole('button',{name:'Reintentar',exact:true})).toBeVisible();
    await page.unroute(`**/api/registration-sessions/${session.session.id}`);
    await page.getByRole('button',{name:'Reintentar',exact:true}).click(); await expect(page.getByTestId('pos-code')).toHaveText(code);
  }finally{await context.close();}
});
