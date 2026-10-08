'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCheck, Copy, CreditCard, LoaderCircle, Mail, ScanLine, ShieldCheck, Smartphone, WifiOff } from 'lucide-react';
import { Brand } from '@/components/brand';
import { api, ApiFailure, messageOf } from '@/lib/client';
import { isValidDocument } from '@/lib/validation';
export default function RegistrationPage() {
  const [link, setLink] = useState<{ id: string; token: string } | null>(null), [loaded, setLoaded] = useState(false);
  const [document, setDocument] = useState(''), [email, setEmail] = useState(''), [marketing, setMarketing] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [fieldError, setFieldError] = useState(''), [code, setCode] = useState(''), [copied, setCopied] = useState(false), [unusable, setUnusable] = useState(false);
  const requestId = useRef('');
  useEffect(() => {
    const readLink = () => {
      const params = new URLSearchParams(window.location.hash.slice(1)), id = params.get('id'), token = params.get('token');
      setError(''); setFieldError(''); setUnusable(false); setCode(''); setDocument(''); setEmail(''); setMarketing(false); requestId.current = '';
      if (id && token && /^[a-f0-9-]{36}$/.test(id) && /^[\w-]{43}$/.test(token)) {
        setLink({ id, token });
        try { const saved = sessionStorage.getItem(`fa.registration:${id}`); if (saved && /^FA-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{2}$/.test(saved)) setCode(saved); requestId.current = sessionStorage.getItem(`fa.request:${id}`) || ''; } catch {}
      } else { setLink(null); }
      setLoaded(true);
    };
    Promise.resolve().then(readLink); window.addEventListener('hashchange', readLink);
    return () => window.removeEventListener('hashchange', readLink);
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    if (!isValidDocument(document)) { setFieldError('Revisa tu cédula: debe tener 10 dígitos y ser válida.'); return; }
    if (!link) return; setFieldError(''); setBusy(true);
    try {
      if (!requestId.current) { requestId.current = Array.from(crypto.getRandomValues(new Uint8Array(16)), value => value.toString(16).padStart(2, '0')).join(''); try { sessionStorage.setItem(`fa.request:${link.id}`, requestId.current); } catch {} } const result = await api<{ code: string }>('/api/registrations', { sessionId: link.id, token: link.token, document, email, marketing, idempotencyKey: requestId.current }); setCode(result.code); try { sessionStorage.setItem(`fa.registration:${link.id}`, result.code); } catch {} setDocument(''); setEmail(''); } catch (e) { setError(messageOf(e)); if (e instanceof ApiFailure && [404,410].includes(e.status)) setUnusable(true); } finally { setBusy(false); }
  }
  async function copy() { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setError('Selecciona el código para copiarlo o muéstralo al dependiente.'); } }
  return <div className="customer-shell"><header className="customer-header"><Brand/><span className="customer-tag"><ShieldCheck size={14}/>Registro seguro</span></header><main className="customer-main"><div className="customer-illustration"><span className="illustration-circle"/><Smartphone size={48} strokeWidth={1.3}/><span className="illustration-check"><Check size={20}/></span><span className="illustration-dot"/></div>
    {code ? <section className="customer-card success-card"><div className="eyebrow">REGISTRO COMPLETADO</div><h1>Ya estamos<br/>conectados<span>.</span></h1><p className="customer-intro">Muestra este código al dependiente para que lo ingrese en Vendix.</p><div className="customer-code"><span>TU CÓDIGO DE REGISTRO</span><strong data-testid="customer-code">{code}</strong><button className="secondary full" onClick={copy}>{copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? 'Código copiado' : 'Copiar código'}</button></div><div className="success-caption"><CheckCheck size={19}/><p>Tus datos se guardaron correctamente.<br/><b>Ya puedes continuar con tu compra.</b></p></div>{error && <div className="alert" role="alert">{error}</div>}</section> : loaded && (!link || unusable) ? <section className="customer-card invalid-card"><ScanLine size={37}/><h1>{unusable ? 'Necesitas un nuevo QR.' : 'Empieza desde el QR.'}</h1><p>{error || 'Pide al dependiente que genere un QR y escanéalo con la cámara de tu teléfono.'}</p><div className="privacy-inline"><ShieldCheck size={20}/><p>Cada QR es único y está disponible por 10 minutos.</p></div></section> : <section className="customer-card"><div className="eyebrow">TU REGISTRO, EN UN MOMENTO</div><h1>Tu próxima compra,<br/>más cerca de ti<span>.</span></h1><p className="customer-intro">Completa tus datos y recibe el código para asociar tu registro a esta compra.</p><form onSubmit={submit}>
      <label className="form-label" htmlFor="document">Cédula ecuatoriana</label><div className={`input-wrap ${fieldError ? 'input-error' : ''}`}><CreditCard size={19}/><input id="document" name="document" placeholder="Tus 10 dígitos" inputMode="numeric" autoComplete="off" value={document} onChange={e => { setDocument(e.target.value.replace(/\D/g, '').slice(0,10)); setFieldError(''); }} maxLength={10} minLength={10} pattern="[0-9]{10}" required disabled={busy || !loaded}/></div>{fieldError ? <p className="field-error" role="alert">{fieldError}</p> : <p className="field-hint">Nos ayuda a reconocer tu registro en futuras compras.</p>}
      <label className="form-label" htmlFor="email">Correo electrónico</label><div className="input-wrap"><Mail size={19}/><input id="email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} required disabled={busy || !loaded}/></div><p className="field-hint">Usa un correo al que tengas acceso.</p>
      <label className="consent"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} disabled={busy}/><span>Quiero recibir promociones y novedades por correo.<small>Opcional. Puedes registrarte sin aceptar.</small></span></label>
      <div className="privacy-inline"><ShieldCheck size={19}/><p>Usaremos tu cédula y correo para identificar tu registro y vincularlo con la compra. Solo recibirás promociones si lo eliges.</p></div>{error && <div className="alert" role="alert"><WifiOff size={18}/>{error}</div>}
      <button className="primary full customer-submit" type="submit" disabled={busy || !loaded}>{busy ? <><LoaderCircle size={18} className="spin"/>Guardando tu registro…</> : <>Obtener mi código<ArrowRight size={19}/></>}</button><p className="no-account">Sin cuentas. Sin contraseñas. Así de fácil.</p>
    </form></section>}
    <footer className="customer-footer">Farmaenlace · Más cerca de ti</footer></main><div className="customer-bottom-bar"/></div>;
}
