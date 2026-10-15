import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUp, Plus, MessageSquare, Sparkles, PanelLeftClose, Menu, LogOut, ArrowUpRight, Code2, PenLine, Lightbulb, X, LoaderCircle, Leaf } from 'lucide-react';
import './style.css';

const ideas = [
  { icon: PenLine, title: 'Temukan kata yang tepat', text: 'Bantu saya menulis email profesional untuk mengajukan kerja sama.' },
  { icon: Lightbulb, title: 'Mulai dari sebuah ide', text: 'Berikan 5 ide kreatif untuk meningkatkan produktivitas tim kecil.' },
  { icon: Code2, title: 'Pecahkan sebuah masalah', text: 'Jelaskan cara membuat REST API dengan Python menggunakan contoh sederhana.' },
];
async function request(path, body, token) {
  let response;
  try { response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }); }
  catch { throw new Error('Tidak dapat terhubung. Periksa koneksi dan pastikan server berjalan.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(response.status === 401 || response.status === 403 ? (path.includes('login') ? 'Username atau password tidak sesuai.' : 'Sesi berakhir. Silakan masuk kembali.') : typeof data.detail === 'string' ? data.detail : 'Permintaan gagal. Silakan coba lagi.');
    error.status = response.status; throw error;
  }
  return data;
}
function App() {
  const [account, setAccount] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sidebar, setSidebar] = useState(false);
  const end = useRef(null);
  const input = useRef(null);
  const lock = useRef(false);
  const dialog = useRef(null);
  const owner = useRef(null);
  const current = chats.find(c => c.id === active);
  const messages = current?.messages || [];
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [chats, busy]);
  useEffect(() => { if (loginOpen) dialog.current?.showModal(); else dialog.current?.close(); }, [loginOpen]);
  function newChat() { if (busy) return; setActive(null); setDraft(''); setError(''); setSidebar(false); input.current?.focus(); }
  async function login(event) {
    event.preventDefault(); if (loginBusy) return;
    const data = new FormData(event.currentTarget); setLoginBusy(true); setLoginError('');
    try { const user = await request('/user/login', { username: data.get('username'), password: data.get('password') }); if (owner.current && owner.current !== user.username) { setChats([]); setActive(null); setDraft(''); } owner.current = user.username; setAccount(user); setLoginOpen(false); event.target.reset(); }
    catch (e) { setLoginError(e.message); } finally { setLoginBusy(false); }
  }
  async function send(event) {
    event.preventDefault(); const prompt = draft.trim(); if (!prompt || lock.current) return;
    if (!account) { setLoginOpen(true); return; }
    lock.current = true; setBusy(true); setError('');
    const id = active || crypto.randomUUID();
    const history = messages.filter(m => !m.failed).slice(-40).map(({ role, content }) => ({ role, content: content.slice(0, 20000) }));
    const userMessage = { role: 'user', content: prompt };
    if (!active) { setChats(prev => [{ id, title: prompt, messages: [userMessage] }, ...prev]); setActive(id); }
    else setChats(prev => prev.map(c => c.id === id ? { ...c, messages: [...c.messages, userMessage] } : c));
    setDraft('');
    try {
      const data = await request('/model/', { prompt, history }, account.token);
      const content = data.response ?? data.reponse;
      if (typeof content !== 'string' || !content.trim()) throw new Error('Model tidak memberikan jawaban. Silakan coba lagi.');
      setChats(prev => prev.map(c => c.id === id ? { ...c, messages: [...c.messages, { role: 'assistant', content }] } : c));
    } catch (e) {
      setError(e.message); setDraft(prompt);
      setChats(prev => prev.map(c => c.id === id ? { ...c, messages: c.messages.slice(0, -1) } : c));
      if ([401, 403].includes(e.status)) { setAccount(null); setLoginOpen(true); }
    } finally { lock.current = false; setBusy(false); input.current?.focus(); }
  }
  return <div className="app">
    {sidebar && <button className="scrim" aria-label="Tutup navigasi" onClick={() => setSidebar(false)}/>}
    <aside className={sidebar ? 'sidebar open' : 'sidebar'}>
      <a className="brand" href="/" aria-label="Ruang AI beranda"><span className="brand-mark"><Leaf size={21}/></span>ruang<span className="brand-ai">ai</span><span className="beta">BETA</span></a>
      <button className="new-chat" onClick={newChat} disabled={busy}><Plus size={18}/> Percakapan baru <span>↗</span></button>
      <div className="section-label">PERCAKAPAN ANDA</div>
      <nav aria-label="Riwayat percakapan" className="chat-list">{chats.length ? chats.map(c => <button disabled={busy} key={c.id} className={c.id === active ? 'chat-link selected' : 'chat-link'} onClick={() => { setActive(c.id); setError(''); setDraft(''); setSidebar(false); }}><MessageSquare size={16}/><span>{c.title}</span></button>) : <p className="empty-history">Ide besar dimulai dari<br/>percakapan kecil.</p>}</nav>
      <div className="sidebar-note"><Sparkles size={19}/><strong>Ruang untuk rasa ingin tahu.</strong><p>Tulis, jelajahi, dan temukan sudut pandang baru bersama AI.</p></div>
      <div className="account"><span className="avatar">{account ? account.username[0].toUpperCase() : 'T'}</span><div><strong>{account?.username || 'Tamu'}</strong><small>{account ? 'Sesi aktif' : 'Masuk untuk mulai'}</small></div><button className="icon-button" disabled={busy} aria-label={account ? 'Keluar akun' : 'Masuk akun'} onClick={() => { if (account) { setAccount(null); setChats([]); newChat(); } else setLoginOpen(true); }}>{account ? <LogOut size={18}/> : <ArrowUpRight size={18}/>}</button></div>
    </aside>
    <main>
      <header><div className="header-left"><button className="icon-button mobile-menu" aria-label="Buka navigasi" onClick={() => setSidebar(true)}><Menu size={20}/></button><PanelLeftClose className="desktop-icon" size={18}/><span>Workspace <span className="slash">/</span> <strong>Chat AI</strong></span></div><span className="model-pill"><span/> DeepSeek R1 <small>7B</small></span></header>
      <div className="conversation">
        {!messages.length && !busy ? <section className="welcome"><div className="eyebrow"><span/> TEMAN BERPIKIR ANDA</div><h1>Ide Anda, kemungkinan<br/><em>tanpa batas.</em></h1><p>Ada yang ingin Anda jelajahi hari ini?<br/>Mulai percakapan, biarkan ide berkembang.</p><div className="suggestions">{ideas.map(({icon: Icon, title, text}, i) => <button key={title} onClick={() => { setDraft(text); input.current?.focus(); }}><span className={`suggestion-icon color-${i}`}><Icon size={20}/></span><strong>{title}</strong><span className="suggestion-text">{text}</span><ArrowUpRight className="suggestion-arrow" size={17}/></button>)}</div><div className="welcome-foot"><span/> Dibangun untuk percakapan yang lebih bermakna</div></section> : <section className="messages" aria-label="Percakapan" aria-live="polite">{messages.map((m, i) => <article className={`message ${m.role}`} key={i}><span className="message-avatar">{m.role === 'assistant' ? <Sparkles size={18}/> : account?.username?.[0]?.toUpperCase() || 'A'}</span><div><strong>{m.role === 'assistant' ? 'Ruang AI' : 'Anda'}</strong><div className="message-body">{m.content}</div></div></article>)}{busy && <div className="thinking" role="status"><LoaderCircle size={17} className="spin"/> Sedang merangkai jawaban…</div>}<div ref={end}/></section>}
      </div>
      <footer className="composer-area">{error && <div className="error" role="alert">{error}</div>}<form className="composer" onSubmit={send}><label className="sr-only" htmlFor="prompt">Pesan untuk AI</label><textarea id="prompt" ref={input} rows={2} maxLength={8000} placeholder="Tanyakan sesuatu, atau bagikan ide Anda…" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(e); } }}/><div className="composer-bottom"><span><Sparkles size={14}/> {busy ? 'Memproses pertanyaan Anda' : 'Sedikit rasa ingin tahu, banyak kemungkinan.'}</span><button className="send" disabled={busy || !draft.trim()} aria-label="Kirim pesan">{busy ? <LoaderCircle size={19} className="spin"/> : <ArrowUp size={20}/>}</button></div></form><p className="disclaimer">AI dapat membuat kesalahan. Periksa kembali informasi penting.<span>Shift + Enter untuk baris baru</span></p></footer>
    </main>
    <dialog ref={dialog} onCancel={() => setLoginOpen(false)} onClose={() => setLoginOpen(false)}><button className="dialog-close icon-button" aria-label="Tutup login" onClick={() => setLoginOpen(false)}><X size={20}/></button><span className="brand-mark"><Leaf size={24}/></span><h2>Selamat datang di Ruang AI.</h2><p>Masuk dengan akun Anda untuk memulai percakapan.</p><form onSubmit={login}><label htmlFor="username">Username</label><input id="username" name="username" autoComplete="username" required autoFocus maxLength={100}/><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required/>{loginError && <div className="error" role="alert">{loginError}</div>}<button className="login-submit" disabled={loginBusy}>{loginBusy ? 'Sedang masuk…' : 'Masuk ke workspace'}<ArrowUpRight size={18}/></button></form><small>Belum punya akun? Hubungi pengelola workspace.</small></dialog>
  </div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
