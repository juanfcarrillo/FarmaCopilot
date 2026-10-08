'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCheck, Clipboard, CreditCard, LoaderCircle, Mail, QrCode, ReceiptText, RefreshCw, ScanLine, ShieldCheck, ShoppingBag, Store, Tag, UserRound, Wifi, WifiOff, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Brand } from '@/components/brand';
import { api, ApiFailure, messageOf, type SessionView } from '@/lib/client';
import { DEMO_ITEMS, demoSale, money, registeredPromotions } from '@/lib/demo-sale';
import { isValidDocument } from '@/lib/validation';

const ACTIVE_KEY = 'farmaenlace.active-session';
type Active = { session: SessionView; qrToken: string; receipt?: ReturnType<typeof demoSale> };
type Capture = { document: string; email: string; marketing: boolean; idempotencyKey: string };

function AssistedForm({ busy, disabled, onSubmit }: { busy: boolean; disabled: boolean; onSubmit: (data: Capture) => Promise<void> }) {
  const [document, setDocument] = useState(''), [email, setEmail] = useState(''), [marketing, setMarketing] = useState(false), [fieldError, setFieldError] = useState('');
  const requestId = useRef('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValidDocument(document)) { setFieldError('Revisa la cédula: debe tener 10 dígitos y ser válida.'); return; }
    setFieldError('');
    if (!requestId.current) requestId.current = Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
    await onSubmit({ document, email, marketing, idempotencyKey: requestId.current });
  }
  return <form className="assisted-form" onSubmit={submit}>
    <h3>El cliente te dicta sus datos</h3><p className="capture-intro">Regístralos para activar sus promociones exclusivas en caja.</p>
    <label className="form-label" htmlFor="assisted-document">Cédula del cliente</label>
    <div className={`input-wrap ${fieldError ? 'input-error' : ''}`}><CreditCard size={19}/><input id="assisted-document" inputMode="numeric" autoComplete="off" placeholder="10 dígitos" value={document} onChange={e => { setDocument(e.target.value.replace(/\D/g, '').slice(0, 10)); setFieldError(''); }} pattern="[0-9]{10}" minLength={10} maxLength={10} required disabled={busy || disabled} aria-invalid={!!fieldError} aria-describedby={fieldError ? 'assisted-error' : undefined}/></div>
    {fieldError && <p id="assisted-error" className="field-error" role="alert">{fieldError}</p>}
    <label className="form-label" htmlFor="assisted-email">Correo del cliente</label>
    <div className="input-wrap"><Mail size={19}/><input id="assisted-email" type="email" autoComplete="off" placeholder="cliente@correo.com" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} required disabled={busy || disabled}/></div>
    <label className="consent"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} disabled={busy || disabled}/><span>El cliente desea recibir promociones por correo.<small>Opcional. Marca solo si el cliente lo solicita.</small></span></label>
    <button type="submit" className="primary full" disabled={busy || disabled}>{busy ? <LoaderCircle size={18} className="spin"/> : <UserRound size={18}/>} {busy ? 'Guardando registro…' : 'Registrar cliente'}</button>
  </form>;
}

export default function PosPage() {
  const [active, setActive] = useState<Active | null>(null), [location, setLocation] = useState('Local 001'), [register, setRegister] = useState('Caja 01');
  const [mode, setMode] = useState<'qr' | 'assisted'>('qr');
  const [booting, setBooting] = useState(true), [restoreBlocked, setRestoreBlocked] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [connection, setConnection] = useState('idle'), [clock, setClock] = useState(0), [baseUrl, setBaseUrl] = useState('');
  useEffect(() => {
    let disposed = false;
    const tick = setInterval(() => setClock(Date.now()), 1000);
    Promise.resolve().then(() => { if (!disposed) { setBaseUrl(window.location.origin); setClock(Date.now()); } });
    const saved = sessionStorage.getItem(ACTIVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Active;
        api<SessionView>(`/api/registration-sessions/${parsed.session.id}`).then(session => {
          if (disposed) return;
          setActive({ ...parsed, session }); setLocation(session.location); setRegister(session.register);
        }).catch(e => {
          if (disposed) return;
          setError(messageOf(e));
          if (e instanceof ApiFailure && [404,410].includes(e.status)) sessionStorage.removeItem(ACTIVE_KEY);
          else setRestoreBlocked(true);
        }).finally(() => { if (!disposed) setBooting(false); });
      } catch { sessionStorage.removeItem(ACTIVE_KEY); Promise.resolve().then(() => setBooting(false)); }
    } else Promise.resolve().then(() => setBooting(false));
    return () => { disposed = true; clearInterval(tick); };
  }, []);
  const session = active?.session, sessionId = session?.id, sessionStatus = session?.status;
  useEffect(() => { if (active) sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(active)); }, [active]);
  useEffect(() => {
    if (!sessionId || sessionStatus !== 'awaiting_customer') return;
    let errors = 0, stopped = false, poll: ReturnType<typeof setInterval> | undefined;
    const stream = new EventSource(`/api/registration-sessions/${sessionId}/events`);
    const apply = (next: SessionView, state = 'live') => {
      if (!stopped) { setActive(current => current?.session.id === sessionId ? { ...current, session: next } : current); setConnection(state); }
    };
    stream.onopen = () => { if (!stopped) setConnection('live'); };
    stream.addEventListener('session', event => { errors = 0; apply(JSON.parse((event as MessageEvent).data)); });
    stream.onerror = () => {
      if (stopped) return;
      setConnection('reconnecting'); errors++;
      if (errors >= 3 && !poll) {
        stream.close(); setConnection('fallback');
        poll = setInterval(() => { api<SessionView>(`/api/registration-sessions/${sessionId}`).then(next => apply(next, 'fallback')).catch(() => { if (!stopped) setConnection('offline'); }); }, 5000);
      }
    };
    return () => { stopped = true; stream.close(); if (poll) clearInterval(poll); };
  }, [sessionId, sessionStatus]);
  async function startSession() {
    const result = await api<Active>('/api/registration-sessions', { location, register });
    setActive(result); setConnection('connecting'); return result;
  }
  async function create() {
    setBusy(true); setError('');
    try { await startSession(); } catch (e) { setError(messageOf(e)); } finally { setBusy(false); }
  }
  async function cancel() {
    if (!session) return;
    setBusy(true); setError('');
    try { const next = await api<SessionView>(`/api/registration-sessions/${session.id}/cancel`, {}); setActive(current => current?.session.id === next.id ? { ...current, session: next } : current); setMode('qr'); } catch (e) { setError(messageOf(e)); } finally { setBusy(false); }
  }
  async function submitAssisted(data: Capture) {
    setBusy(true); setError('');
    let target = active;
    try {
      if (!target || target.session.status !== 'awaiting_customer' || target.session.expiresAt <= Date.now()) target = await startSession();
      const next = await api<SessionView>(`/api/registration-sessions/${target.session.id}/assisted-registration`, data);
      setActive(current => current?.session.id === next.id ? { ...current, session: next } : current);
    } catch (e) {
      setError(messageOf(e));
      if (target && e instanceof ApiFailure && e.status === 409) {
        try { const next = await api<SessionView>(`/api/registration-sessions/${target.session.id}`); setActive(current => current?.session.id === next.id ? { ...current, session: next } : current); } catch {}
      }
    } finally { setBusy(false); }
  }
  function nextCustomer() { sessionStorage.removeItem(ACTIVE_KEY); setActive(null); setMode('qr'); setError(''); setConnection('idle'); }
  const seconds = session ? Math.max(0, Math.ceil((session.expiresAt - (clock || session.createdAt)) / 1000)) : 600;
  const waiting = session?.status === 'awaiting_customer', expired = session?.status === 'expired' || (waiting && seconds === 0), done = session?.status === 'registered' || session?.status === 'recorded_manual';
  const sale = active?.receipt || demoSale(session?.status), completed = !!active?.receipt;
  const url = active && baseUrl ? `${baseUrl}/registro#id=${active.session.id}&token=${active.qrToken}` : '';
  const statusLabel = done ? 'Cliente registrado' : expired ? 'Sesión vencida' : session?.status === 'cancelled' ? 'Sesión cancelada' : waiting ? 'Esperando al cliente' : 'Lista para empezar';
  const promotions = registeredPromotions(session?.status);
  const cannotStart = busy || booting || restoreBlocked || !location.trim() || !register.trim();
  return <div className="pos-shell">
    <a className="skip-link" href="#registro-caja">Ir al registro en caja</a>
    <header className="topbar"><div className="topbar-inner"><Brand/><span className="workspace-title">Vendix <span className="demo-tag">DEMO</span></span></div></header>
    <main id="registro-caja" className="pos-main">
      <div className="page-heading"><div><span className="eyebrow">DEPENDIENTE DEMO · PUNTO DE VENTA</span><h1>Una compra, un cliente.</h1><p>Identifica al cliente por QR o registra los datos que te dicte.</p></div></div>
      {error && <div className="alert" role="alert"><WifiOff size={19}/><span>{error}</span>{restoreBlocked ? <button className="text-button" onClick={() => window.location.reload()}>Reintentar</button> : <button aria-label="Cerrar aviso" onClick={() => setError('')}><X size={17}/></button>}</div>}
      <div className={`work-grid ${done ? 'registration-ready' : ''}`}>
        <section className="qr-card"><div className="card-head"><div className="card-title"><UserRound size={21} aria-hidden="true"/><h2>Identificar cliente</h2></div><span role="status" className={`status-pill ${done ? 'success' : expired || session?.status === 'cancelled' ? 'inactive' : ''}`}><span/>{statusLabel}</span></div>
          <div className="station-fields"><label><Store size={15}/> Local<input aria-label="Local" value={location} onChange={e => setLocation(e.target.value)} maxLength={60} disabled={!!session || busy || booting}/></label><label><Clipboard size={15}/> Caja<input aria-label="Caja" value={register} onChange={e => setRegister(e.target.value)} maxLength={40} disabled={!!session || busy || booting}/></label></div>
          {done ? <div className="qr-stage stage-success"><div className="received-state"><span className="success-orbit"><CheckCheck size={38}/></span><h3>Gracias por registrarte.</h3><p>El cliente ya está vinculado a esta sesión. Sus promociones exclusivas ya están activas en esta compra demo.</p><span className="capture-source">{session.registrationMethod === 'assisted' ? 'Datos capturados por el dependiente' : 'Datos recibidos desde el QR'}</span></div></div> : <>
            <div className="capture-switch" aria-label="Método de registro"><button className={mode === 'qr' ? 'selected' : ''} aria-pressed={mode === 'qr'} disabled={busy || booting || restoreBlocked} onClick={() => { setMode('qr'); setError(''); }}><QrCode size={17}/>Por QR</button><button className={mode === 'assisted' ? 'selected' : ''} aria-pressed={mode === 'assisted'} disabled={busy || booting || restoreBlocked} onClick={() => { setMode('assisted'); setError(''); }}><UserRound size={17}/>Datos dictados</button></div>
            {mode === 'assisted' ? <AssistedForm busy={busy} disabled={cannotStart && !busy} onSubmit={submitAssisted}/> : <div className="qr-stage">
              {waiting && !expired ? <><div className="qr-frame" aria-label="QR para registro del cliente"><QRCodeSVG value={url || 'about:blank'} size={202} level="M" marginSize={1}/></div><h3>Pide al cliente que escanee el QR</h3><p>Completa sus datos en el teléfono y la caja se actualiza automáticamente.</p><div className={`countdown ${seconds < 60 ? 'urgent' : ''}`}><span/> Disponible por <b>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</b></div></> : <><div className="empty-qr"><QrCode size={76} strokeWidth={1}/><span><ScanLine size={22}/></span></div><h3>{expired ? 'Esta sesión ya venció.' : session?.status === 'cancelled' ? 'El QR fue cancelado.' : 'Invita al cliente a registrarse'}</h3><p>{expired || session?.status === 'cancelled' ? 'Genera un nuevo QR o usa los datos dictados.' : 'Un registro breve para reconocerlo en esta compra.'}</p><button className="primary" onClick={create} disabled={cannotStart}>{busy ? <LoaderCircle size={18} className="spin"/> : <QrCode size={18}/>} {booting ? 'Recuperando sesión…' : 'Generar QR'}<ArrowRight size={18}/></button></>}
            </div>}
          </>}
          <div className="qr-footer">{waiting && !expired ? <>{mode === 'qr' && <a className="text-button form-link" href={url} target="_blank" rel="noopener noreferrer">Abrir formulario <ArrowRight size={14}/></a>}<button className="text-button muted" disabled={busy} onClick={cancel}><X size={15}/>Cancelar QR</button></> : <span><ShieldCheck size={15}/> Sin cuentas ni contraseñas · Registro seguro</span>}</div>
        </section>
        <aside className="result-column"><section className="result-card sale-card"><div className="sale-heading"><div className="card-title"><ShoppingBag size={21} aria-hidden="true"/><h2>Compra de demostración</h2></div><span>2 productos</span></div>
          <div className={`client-summary ${done ? 'identified' : ''}`}><UserRound size={21}/><div><strong data-testid="client-status" aria-live="polite">{done ? 'Cliente registrado' : 'Cliente sin identificar'}</strong><p>{done ? 'Registro guardado y recibido en esta caja.' : 'Completa su registro para continuar con la compra.'}</p></div>{done && <CheckCheck size={20}/>}</div>
          <div className="cart-items">{DEMO_ITEMS.map(item => <div className="cart-item" key={item.name}><div><b>{item.name}</b><small>{item.detail}</small></div><strong>{money(item.cents)}</strong></div>)}</div>
          {done && <><section className="exclusive-promotions" aria-labelledby="promotions-heading">
            <div className="promotions-heading"><Tag size={18} aria-hidden="true"/><h3 id="promotions-heading">Promociones exclusivas</h3><span>DEMO</span></div>
            <p className="promotions-intro">Solo para clientes registrados. Se aplican automáticamente a estos productos.</p>
            <div className="promotion-list">{promotions.map(promotion => <article key={promotion.id} className="promotion-offer active" data-testid="exclusive-promotion" data-state="active">
              <span className="promotion-icon"><CheckCheck size={19} aria-hidden="true"/></span>
              <div><h4>{promotion.percent}% en {promotion.itemName.toLowerCase()}</h4><p>Aplicada a esta compra</p></div><strong>{`−${money(promotion.discount)}`}</strong>
            </article>)}</div>
          </section>
          <div className="demo-benefit applied"><ShieldCheck size={20}/><div><strong data-testid="discount-status" aria-live="polite">Promociones aplicadas</strong><p>Ahorras {money(sale.discount)} por ser cliente registrado.</p></div></div></>}
          <dl className="sale-totals"><div><dt>Subtotal</dt><dd>{money(sale.subtotal)}</dd></div>{done && <div className="discount-row"><dt>Promociones de registrados</dt><dd>−{money(sale.discount)}</dd></div>}<div className="total-row"><dt>Total simulado</dt><dd data-testid="sale-total">{money(sale.total)}</dd></div></dl>
          {completed ? <div className="demo-receipt" role="status"><ReceiptText size={23}/><div><h3>Venta simulada completada</h3><p>Comprobante de demostración asociado a esta sesión. No se realizó un cobro ni se emitió una factura.</p></div></div> : <><button className="primary full" disabled={!done || busy || booting} onClick={() => setActive(current => current ? { ...current, receipt: demoSale(current.session.status) } : current)}><ReceiptText size={18}/>Finalizar venta simulada<ArrowRight size={17}/></button><p className="sale-help">{done ? 'Continúa la demostración con el cliente identificado.' : 'Primero registra al cliente por QR o datos dictados.'}</p></>}
        </section><div className="privacy-note"><ShieldCheck size={19}/><p><b>Datos personales protegidos.</b> El resumen de caja muestra el estado del registro, sin cédula ni correo.</p></div>{done && <button className="secondary full new-session" disabled={busy} onClick={nextCustomer}><RefreshCw size={17}/>Siguiente cliente<ArrowRight size={17}/></button>}</aside>
      </div>
      <p className="integration-note"><b>Simulación de Vendix.</b> El registro de identidad se guarda en Firebase. Los productos, precios, descuento y venta son ficticios; todavía no hay conexión con Vendix ni PromoGo.</p>
      <footer className="main-footer"><span>Farmaenlace · Identificación de clientes</span><span className={`connection ${connection === 'offline' ? 'offline' : ''}`}>{connection === 'offline' ? <WifiOff size={14}/> : <Wifi size={14}/>} {waiting && !expired ? connection === 'live' ? 'En tiempo real' : connection === 'fallback' ? 'Actualización cada 5 segundos' : connection === 'offline' ? 'Sin conexión · Reintentando' : 'Conectando al servicio…' : 'Registro de clientes'}</span></footer>
    </main>
  </div>;
}
