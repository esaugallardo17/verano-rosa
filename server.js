// Verano Rosa — servidor demostrativo (sin dependencias, solo Node.js)
// Guarda carrito, pedidos, mensajes y regalos personalizados en data/db.json
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const catalog = require('./data/catalog');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// ---------- "Base de datos" en archivo JSON ----------
function loadDb() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { sessions: {}, orders: [], messages: [] }; }
}
let db = loadDb();
function saveDb() { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function getSession(req, res) {
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]));
  let sid = cookies.vr_sid;
  if (!sid || !db.sessions[sid]) {
    sid = crypto.randomUUID();
    db.sessions[sid] = { createdAt: new Date().toISOString(), cart: [], favorites: [] };
    res.setHeader('Set-Cookie', `vr_sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    saveDb();
  }
  const s = db.sessions[sid];
  s.lastSeen = new Date().toISOString();
  return { sid, s };
}

// ---------- Utilidades ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json' };
function send(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}
function readBody(req) {
  return new Promise(resolve => {
    let b = ''; req.on('data', c => { b += c; if (b.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
  });
}
const SHIPPING = 99, FREE_SHIPPING_FROM = 1499;
function cartSummary(cart) {
  const lines = cart.map(l => ({ ...l, total: l.unitPrice * l.qty }));
  const subtotal = lines.reduce((a, l) => a + l.total, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING;
  return { lines, count: lines.reduce((a, l) => a + l.qty, 0), subtotal, shipping, total: subtotal + shipping, freeShippingFrom: FREE_SHIPPING_FROM };
}
function addonPrice(ids = []) {
  return ids.reduce((a, id) => a + (catalog.addons.find(x => x.id === id)?.price || 0), 0);
}

// ---------- API ----------
async function api(req, res, url) {
  const { s } = getSession(req, res);
  const p = url.pathname, m = req.method;

  if (p === '/api/catalog' && m === 'GET') return send(res, 200, catalog);

  if (p === '/api/cart' && m === 'GET') return send(res, 200, cartSummary(s.cart));

  if (p === '/api/cart/items' && m === 'POST') {
    const b = await readBody(req);
    const prod = catalog.products.find(x => x.id === b.productId);
    if (!prod) return send(res, 404, { error: 'Producto no encontrado' });
    const addons = (b.addons || []).filter(id => catalog.addons.some(a => a.id === id));
    const qty = Math.max(1, Math.min(20, parseInt(b.qty) || 1));
    const same = s.cart.find(l => l.productId === prod.id && JSON.stringify(l.addons) === JSON.stringify(addons) && !l.custom);
    if (same) same.qty = Math.min(20, same.qty + qty);
    else s.cart.push({ lineId: crypto.randomUUID().slice(0, 8), productId: prod.id, name: prod.name, image: prod.image, addons, addonNames: addons.map(id => catalog.addons.find(a => a.id === id).name), unitPrice: prod.price + addonPrice(addons), qty });
    saveDb();
    return send(res, 200, cartSummary(s.cart));
  }

  // Regalo armado en "Personaliza tu regalo"
  if (p === '/api/cart/custom' && m === 'POST') {
    const b = await readBody(req);
    const c = catalog.custom;
    const base = c.bases.find(x => x.id === b.base), flower = c.flowers.find(x => x.id === b.flower), color = c.colors.find(x => x.id === b.color), size = c.sizes.find(x => x.id === b.size);
    if (!base || !flower || !color || !size) return send(res, 400, { error: 'Selecciona base, flor, color y tamaño' });
    const extras = (b.extras || []).map(id => catalog.addons.find(a => a.id === id)).filter(Boolean);
    const unitPrice = Math.round((base.price + flower.price) * size.factor) + extras.reduce((a, e) => a + e.price, 0);
    s.cart.push({ lineId: crypto.randomUUID().slice(0, 8), custom: true, productId: 'custom', name: `Regalo personalizado: ${base.name} de ${flower.name.toLowerCase()}`,
      details: `${color.name} · ${size.name}${b.note ? ' · Nota: ' + String(b.note).slice(0, 140) : ''}`, image: base.image,
      addons: extras.map(e => e.id), addonNames: extras.map(e => e.name), unitPrice, qty: 1 });
    saveDb();
    return send(res, 200, cartSummary(s.cart));
  }

  let mm = p.match(/^\/api\/cart\/items\/([\w-]+)$/);
  if (mm && m === 'PATCH') {
    const b = await readBody(req); const l = s.cart.find(x => x.lineId === mm[1]);
    if (l) l.qty = Math.max(1, Math.min(20, parseInt(b.qty) || 1));
    saveDb(); return send(res, 200, cartSummary(s.cart));
  }
  if (mm && m === 'DELETE') {
    s.cart = s.cart.filter(x => x.lineId !== mm[1]); saveDb();
    return send(res, 200, cartSummary(s.cart));
  }

  if (p === '/api/favorites' && m === 'GET') return send(res, 200, s.favorites);
  if (p === '/api/favorites' && m === 'POST') {
    const { productId } = await readBody(req);
    s.favorites = s.favorites.includes(productId) ? s.favorites.filter(x => x !== productId) : [...s.favorites, productId];
    saveDb(); return send(res, 200, s.favorites);
  }

  // Borrador del checkout: se guarda lo que el usuario va escribiendo
  if (p === '/api/checkout/draft' && m === 'GET') return send(res, 200, s.draft || {});
  if (p === '/api/checkout/draft' && m === 'PUT') {
    const b = await readBody(req);
    s.draft = Object.fromEntries(Object.entries(b).filter(([k, v]) => typeof v === 'string' || typeof v === 'boolean').map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 500) : v]));
    saveDb(); return send(res, 200, { ok: true });
  }

  if (p === '/api/checkout' && m === 'POST') {
    const b = await readBody(req);
    if (!s.cart.length) return send(res, 400, { error: 'Tu carrito está vacío' });
    const required = ['recipientName', 'recipientPhone', 'street', 'colony', 'zip', 'city', 'date', 'timeSlot', 'senderName', 'senderEmail', 'payment'];
    const missing = required.filter(k => !String(b[k] || '').trim());
    if (missing.length) return send(res, 400, { error: 'Faltan datos obligatorios', missing });
    const summary = cartSummary(s.cart);
    const order = {
      folio: 'VR-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10),
      createdAt: new Date().toISOString(),
      status: 'Confirmado',
      sessionOwner: crypto.createHash('sha1').update(req.headers.cookie || '').digest('hex').slice(0, 10),
      delivery: { recipientName: b.recipientName, recipientPhone: b.recipientPhone, street: b.street, colony: b.colony, zip: b.zip, city: b.city, references: b.references || '', date: b.date, timeSlot: b.timeSlot },
      card: { message: b.cardMessage || '', signature: b.cardSignature || '', anonymous: !!b.anonymous },
      sender: { name: b.senderName, email: b.senderEmail, phone: b.senderPhone || '' },
      payment: { method: b.payment, simulated: true },
      ...summary,
    };
    db.orders.push(order);
    s.orders = [...(s.orders || []), order.folio];
    s.cart = [];
    s.draft = { senderName: b.senderName, senderEmail: b.senderEmail, senderPhone: b.senderPhone || '' };
    saveDb();
    return send(res, 201, order);
  }

  if (p === '/api/orders' && m === 'GET') {
    return send(res, 200, (s.orders || []).map(f => db.orders.find(o => o.folio === f)).filter(Boolean).reverse());
  }
  mm = p.match(/^\/api\/orders\/([\w-]+)$/);
  if (mm && m === 'GET') {
    const o = db.orders.find(x => x.folio === mm[1].toUpperCase());
    return o ? send(res, 200, o) : send(res, 404, { error: 'No encontramos ese folio' });
  }

  if (p === '/api/contact' && m === 'POST') {
    const b = await readBody(req);
    if (!b.name || !b.email || !b.message) return send(res, 400, { error: 'Completa nombre, correo y mensaje' });
    db.messages.push({ id: Date.now(), at: new Date().toISOString(), name: b.name, email: b.email, phone: b.phone || '', topic: b.topic || 'General', message: String(b.message).slice(0, 2000) });
    saveDb(); return send(res, 201, { ok: true });
  }

  // Resumen para presentar el proyecto (lo que el backend ha guardado)
  if (p === '/api/admin/summary' && m === 'GET') {
    return send(res, 200, {
      sessions: Object.keys(db.sessions).length,
      activeCarts: Object.values(db.sessions).filter(x => x.cart.length).length,
      orders: db.orders.slice(-20).reverse(),
      revenue: db.orders.reduce((a, o) => a + o.total, 0),
      messages: db.messages.slice(-20).reverse(),
    });
  }

  send(res, 404, { error: 'Ruta no encontrada' });
}

// ---------- Archivos estáticos ----------
function serveStatic(req, res, url) {
  let file = path.normalize(path.join(PUBLIC, decodeURIComponent(url.pathname)));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  if (url.pathname === '/' || !path.extname(file)) file = path.join(PUBLIC, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) api(req, res, url).catch(e => { console.error(e); send(res, 500, { error: 'Error interno' }); });
  else serveStatic(req, res, url);
}).listen(PORT, () => console.log(`🌸 Verano Rosa listo en http://localhost:${PORT}`));
