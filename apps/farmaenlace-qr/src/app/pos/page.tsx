'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, CheckCheck, Clipboard, Copy, Link as LinkIcon, LoaderCircle, QrCode, RefreshCw, ScanLine, ShieldCheck, Store, Wifi, WifiOff, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Brand } from '@/components/brand';
import { api, ApiFailure, messageOf, type SessionView } from '@/lib/client';
const ACTIVE_KEY = 'farmaenlace.active-session';
type Active = { session: SessionView; qrToken: string };
export default function PosPage() {
  const [active, setActive] = useState<Active | null>(null), [location, setLocation] = useState('Local 001'), [register, setRegister] = useState('Caja 01');
  const [booting, setBooting] = useState(true), [restoreBlocked, setRestoreBlocked] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [connection, setConnection] = useState('idle'), [clock, setClock] = useState(0), [copied, setCopied] = useState(''), [ticket, setTicket] = useState(''), [baseUrl, setBaseUrl] = useState('');
  useEffect(() => {
    let disposed = false;
    const tick = setInterval(() => setClock(Date.now()), 1000);
    Promise.resolve().then(() => { if (!disposed) { setBaseUrl(window.location.origin); setClock(Date.now()); } });
    const saved = sessionStorage.getItem(ACTIVE_KEY);
    if (saved) { try { const parsed = JSON.parse(saved) as Active; api<SessionView>(`/api/registration-sessions/${parsed.session.id}`).then(session => { if (disposed) return; setActive({ session, qrToken: parsed.qrToken }); setLocation(session.location); setRegister(session.register); }).catch(e => { if (disposed) return; setError(messageOf(e)); if (e instanceof ApiFailure && [404,410].includes(e.status)) sessionStorage.removeItem(ACTIVE_KEY); else setRestoreBlocked(true); }).finally(() => { if (!disposed) setBooting(false); }); } catch { sessionStorage.removeItem(ACTIVE_KEY); Promise.resolve().then(() => setBooting(false)); } } else { Promise.resolve().then(() => setBooting(false)); }
    return () => { disposed = true; clearInterval(tick); };
  }, []);
  const session = active?.session;
  const sessionId = session?.id, sessionStatus = session?.status;
  useEffect(() => { if (active) sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(active)); }, [active]);
  useEffect(() => {
    if (!sessionId || sessionStatus !== 'awaiting_customer') return;
    let errors = 0, stopped = false, poll: ReturnType<typeof setInterval> | undefined;
    const stream = new EventSource(`/api/registration-sessions/${sessionId}/events`);
    const apply = (next: SessionView) => { if (!stopped) { setActive(current => current ? { ...current, session: next } : current); setConnection('live'); } };
    stream.onopen = () => { if (!stopped) setConnection('live'); };
    stream.addEventListener('session', event => { errors = 0; apply(JSON.parse((event as MessageEvent).data)); });
    stream.onerror = () => {
      if (stopped) return; setConnection('reconnecting'); errors++;
      if (errors >= 3) { stream.close(); setConnection('fallback'); poll = setInterval(() => { api<SessionView>(`/api/registration-sessions/${sessionId}`).then(next => { if (!stopped) { setActive(current => current ? { ...current, session: next } : current); setConnection('fallback'); } }).catch(() => { if (!stopped) setConnection('offline'); }); }, 5000); }
    };
    return () => { stopped = true; stream.close(); if (poll) clearInterval(poll); };
  }, [sessionId, sessionStatus]);
  async function create() {
    setBusy(true); setError(''); setCopied(''); setTicket('');
    try { const result = await api<Active>('/api/registration-sessions', { location, register }); setActive(result); setConnection('connecting'); } catch (e) { setError(messageOf(e)); } finally { setBusy(false); }
  }
  async function cancel() {
    if (!session) return; setBusy(true); setError('');
    try { const next = await api<SessionView>(`/api/registration-sessions/${session.id}/cancel`, {}); setActive(current => current ? { ...current, session: next } : current); } catch (e) { setError(messageOf(e)); } finally { setBusy(false); }
  }
  async function record() {
    if (!session) return; setBusy(true); setError('');
    try { const next = await api<SessionView>(`/api/registration-sessions/${session.id}/vendix-record`, { code: session.code, ticket }); setActive(current => current ? { ...current, session: next } : current); } catch (e) { setError(messageOf(e)); } finally { setBusy(false); }
  }
  async function copy(value: string, type: string) { try { await navigator.clipboard.writeText(value); setCopied(type); setTimeout(() => setCopied(''), 2500); } catch { setError('Tu navegador no permite copiar. Puedes seleccionar el código directamente.'); } }
  const seconds = session ? Math.max(0, Math.ceil((session.expiresAt - (clock || session.createdAt)) / 1000)) : 600;
  const waiting = session?.status === 'awaiting_customer', expired = session?.status === 'expired' || (waiting && seconds === 0), done = session?.status === 'registered' || session?.status === 'recorded_manual', recorded = session?.status === 'recorded_manual';
  const url = active && baseUrl ? `${baseUrl}/registro#id=${active.session.id}&token=${active.qrToken}` : '';
  const statusLabel = done ? 'Cliente registrado' : expired ? 'QR vencido' : session?.status === 'cancelled' ? 'Sesión cancelada' : waiting ? 'Esperando al cliente' : 'Lista para empezar';
  return <div className="pos-shell">
    <a className="skip-link" href="#registro-caja">Ir al registro en caja</a>
    <header className="topbar"><div className="topbar-inner"><Brand/><span className="workspace-title">Punto de venta</span></div></header>
    <div className="pos-content">
      <main id="registro-caja" className="pos-main"><div className="page-heading"><div><h1>Registro en caja</h1><p>Comparte el QR con el cliente y recibe su código para Vendix.</p></div></div>
        {error && <div className="alert" role="alert"><WifiOff size={19}/><span>{error}</span>{restoreBlocked ? <button className="text-button" onClick={() => window.location.reload()}>Reintentar</button> : <button aria-label="Cerrar aviso" onClick={() => setError('')}><X size={17}/></button>}</div>}
        <div className={`work-grid ${done ? 'registration-ready' : ''}`}><section className="qr-card"><div className="card-head"><div className="card-title"><QrCode size={21} aria-hidden="true"/><h2>Registro por QR</h2></div><span role="status" className={`status-pill ${done ? 'success' : expired || session?.status === 'cancelled' ? 'inactive' : ''}`}><span/>{statusLabel}</span></div>
          <div className="station-fields"><label><Store size={15}/> Local<input aria-label="Local" value={location} onChange={e => setLocation(e.target.value)} maxLength={60} disabled={waiting || busy}/></label><label><Clipboard size={15}/> Caja<input aria-label="Caja" value={register} onChange={e => setRegister(e.target.value)} maxLength={40} disabled={waiting || busy}/></label></div>
          <div className={`qr-stage ${done ? 'stage-success' : ''}`}>
            {done ? <div className="received-state"><span className="success-orbit"><CheckCheck size={38}/></span><h3>Datos recibidos</h3><p>Continúa con el código para Vendix.</p></div> : waiting && !expired ? <><div className="qr-frame" aria-label="QR para registro del cliente"><QRCodeSVG value={url || 'about:blank'} size={202} level="M" marginSize={1}/></div><h3>Pide al cliente que escanee el QR</h3><p>El cliente completa sus datos desde su teléfono.</p><div className={`countdown ${seconds < 60 ? 'urgent' : ''}`}><span/> Disponible por <b>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</b></div></> : <><div className="empty-qr"><QrCode size={76} strokeWidth={1}/><span><ScanLine size={22}/></span></div><h3>{expired ? 'Este QR ya venció.' : session?.status === 'cancelled' ? 'El QR fue cancelado.' : 'Identifica al cliente de esta compra'}</h3><p>{expired || session?.status === 'cancelled' ? 'Genera uno nuevo para que el cliente pueda registrarse.' : 'Genera un QR único para el cliente de esta compra.'}</p><button className="primary" onClick={create} disabled={busy || booting || restoreBlocked || !location.trim() || !register.trim()}>{busy ? <LoaderCircle size={18} className="spin"/> : <QrCode size={18}/>} {booting ? 'Recuperando sesión…' : 'Generar QR'} <ArrowRight size={18}/></button></>}
          </div>
          <div className="qr-footer">{waiting && !expired ? <><button className="text-button" onClick={() => copy(url, 'link')}><LinkIcon size={16}/>{copied === 'link' ? 'Enlace copiado' : 'Copiar enlace'}</button><a className="text-button form-link" href={url} target="_blank" rel="noopener noreferrer">Abrir formulario <ArrowRight size={14}/></a><button className="text-button muted" disabled={busy} onClick={cancel}><X size={15}/>Cancelar QR</button></> : <span><ShieldCheck size={15}/> QR único por registro · Vigencia de 10 minutos</span>}</div>
        </section>
        <aside className="result-column"><section className={`result-card ${done ? 'is-ready' : ''}`}><div className="card-title"><Clipboard size={21} aria-hidden="true"/><h2>Código para Vendix</h2></div><div className={`code-placeholder ${done ? 'has-code' : ''}`}><span className="code-label">{done ? 'Código de registro' : 'Esperando el registro'}</span><strong data-testid="pos-code" aria-live="polite" aria-atomic="true">{session?.code || 'FA-••••-••••-••'}</strong><p>{done ? 'Ingresa este código en el registro de la compra en Vendix.' : 'Se genera cuando el cliente completa sus datos.'}</p></div>{done && <button className="secondary full" onClick={() => copy(session.code!, 'code')}>{copied === 'code' ? <Check size={17}/> : <Copy size={17}/>} {copied === 'code' ? 'Código copiado' : 'Copiar código'}</button>}
            <div className="result-divider"/><div className="progress-line"><span className={`progress-dot ${session ? 'completed' : ''}`}>{session ? <Check size={13}/> : '1'}</span><div><b>QR generado</b><p>Un enlace único para esta sesión</p></div></div><div className="progress-line"><span className={`progress-dot ${done ? 'completed' : ''}`}>{done ? <Check size={13}/> : '2'}</span><div><b>Datos recibidos</b><p>{done ? 'Registro guardado correctamente' : 'Esperando el registro del cliente'}</p></div>{waiting && !expired && <LoaderCircle size={16} className="spin progress-spinner"/>}</div><div className="progress-line"><span className={`progress-dot ${recorded ? 'completed' : ''}`}>{recorded ? <Check size={13}/> : '3'}</span><div><b>Ingreso manual en Vendix</b><p>{recorded ? 'Constancia manual guardada' : 'El dependiente ingresa el código'}</p></div></div>
            {done && !recorded && <div className="manual-form"><label htmlFor="ticket">Referencia de ticket <span>(opcional)</span></label><input id="ticket" value={ticket} onChange={e => setTicket(e.target.value)} placeholder="Ej. referencia de tu comprobante" maxLength={80}/><button className="primary full" disabled={busy} onClick={record}>{busy ? <LoaderCircle size={17} className="spin"/> : <Check size={17}/>}Ya lo ingresé en Vendix</button></div>}
            {recorded && <div className="manual-success"><CheckCheck size={18}/><span>Constancia manual guardada.<small>No confirma una venta desde Vendix.</small></span></div>}
          </section><div className="privacy-note"><ShieldCheck size={19}/><p><b>Datos personales protegidos.</b> Esta pantalla muestra únicamente el código y el estado del registro.</p></div>{done && <button className="secondary full new-session" disabled={busy} onClick={create}><RefreshCw size={17}/>Siguiente cliente<ArrowRight size={17}/></button>}</aside></div>
        <p className="integration-note"><b>Vendix · Ingreso manual.</b> El dependiente ingresa el código en Vendix. La conexión automática aún no está habilitada.</p>
        <footer className="main-footer"><span>Farmaenlace · Identificación de clientes</span><span className={`connection ${connection === 'offline' ? 'offline' : ''}`}>{connection === 'offline' ? <WifiOff size={14}/> : <Wifi size={14}/>} {waiting && !expired ? connection === 'live' ? 'En tiempo real' : connection === 'fallback' ? 'Actualización cada 5 segundos' : connection === 'offline' ? 'Sin conexión · Reintentando' : 'Conectando al servicio…' : 'Registro de clientes'}</span></footer>
      </main>
    </div>
  </div>;
}
