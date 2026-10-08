'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCheck, CreditCard, LoaderCircle, Mail, ScanLine, ShieldCheck, WifiOff } from 'lucide-react';
import { Brand } from '@/components/brand';
import { api, ApiFailure, messageOf } from '@/lib/client';
import { isValidDocument } from '@/lib/validation';
export default function RegistrationPage() {
  const [link, setLink] = useState<{ id: string; token: string } | null>(null), [loaded, setLoaded] = useState(false);
  const [document, setDocument] = useState(''), [email, setEmail] = useState(''), [marketing, setMarketing] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [fieldError, setFieldError] = useState(''), [code, setCode] = useState(''), [unusable, setUnusable] = useState(false);
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
  return <div className="customer-shell"><header className="customer-header"><Brand/><span className="customer-tag">Registro de cliente</span></header><main className="customer-main">
    {code ? <section className="customer-card success-card" data-testid="customer-thanks"><span className="success-orbit"><CheckCheck size={36}/></span><h1>¡Gracias por registrarte<span>!</span></h1><p className="customer-intro">Tu registro llegó automáticamente a la caja. Ya puedes continuar con tu compra.</p><div className="customer-benefit"><ShieldCheck size={24}/><div><h2>Continúa con tu descuento en caja</h2><p>El dependiente ya puede seguir con el beneficio de esta demostración.</p></div></div><div className="success-caption"><CheckCheck size={19}/><p>Tus datos se guardaron correctamente.<br/><b>El dependiente recibió la confirmación.</b></p></div><p className="demo-customer-note">Esta es una demostración. El descuento es simulado y no representa una promoción vigente.</p></section> : loaded && (!link || unusable) ? <section className="customer-card invalid-card"><ScanLine size={37}/><h1>{unusable ? 'Necesitas un nuevo QR.' : 'Empieza desde el QR.'}</h1><p>{error || 'Pide al dependiente que genere un QR y escanéalo con la cámara de tu teléfono.'}</p><div className="privacy-inline"><ShieldCheck size={20}/><p>Cada QR es único y está disponible por 10 minutos.</p></div></section> : <section className="customer-card"><h1>Identifica tu compra<span>.</span></h1><p className="customer-intro">Completa tu cédula y correo. Tu registro llegará directamente a la caja.</p><form onSubmit={submit}>
      <label className="form-label" htmlFor="document">Cédula ecuatoriana</label><div className={`input-wrap ${fieldError ? 'input-error' : ''}`}><CreditCard size={19}/><input id="document" name="document" placeholder="Tus 10 dígitos" inputMode="numeric" autoComplete="off" value={document} onChange={e => { setDocument(e.target.value.replace(/\D/g, '').slice(0,10)); setFieldError(''); }} aria-invalid={!!fieldError} aria-describedby="document-help" maxLength={10} minLength={10} pattern="[0-9]{10}" required disabled={busy || !loaded}/></div>{fieldError ? <p id="document-help" className="field-error" role="alert">{fieldError}</p> : <p id="document-help" className="field-hint">Nos ayuda a reconocer tu registro en futuras compras.</p>}
      <label className="form-label" htmlFor="email">Correo electrónico</label><div className="input-wrap"><Mail size={19}/><input id="email" name="email" type="email" aria-describedby="email-help" placeholder="tu@correo.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} required disabled={busy || !loaded}/></div><p id="email-help" className="field-hint">Usa un correo al que tengas acceso.</p>
      <label className="consent"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} disabled={busy}/><span>Quiero recibir promociones y novedades por correo.<small>Opcional. Puedes registrarte sin aceptar.</small></span></label>
      <div className="privacy-inline"><ShieldCheck size={19}/><p>Usaremos tu cédula y correo para identificar tu registro y vincularlo con esta sesión de caja. Solo recibirás promociones si lo eliges.</p></div>{error && <div className="alert" role="alert"><WifiOff size={18}/>{error}</div>}
      <button className="primary full customer-submit" type="submit" disabled={busy || !loaded}>{busy ? <><LoaderCircle size={18} className="spin"/>Guardando tu registro…</> : <>Registrarme y continuar<ArrowRight size={19}/></>}</button><p className="no-account">Sin cuentas. Sin contraseñas. Así de fácil.</p>
    </form></section>}
    <footer className="customer-footer">Farmaenlace · Más cerca de ti</footer></main><div className="customer-bottom-bar"/></div>;
}
