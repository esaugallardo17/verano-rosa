/* Verano Rosa · Frontend demostrativo (SPA sin dependencias) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const money = n => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0 }) + ' MXN';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, cls = '') => `<svg class="${cls}"><use href="#i-${id}"/></svg>`;

  const state = { catalog: null, cart: { lines: [], count: 0, subtotal: 0, shipping: 0, total: 0, freeShippingFrom: 1499 }, favs: [] };

  // ---------- API ----------
  async function api(path, opts = {}) {
    const res = await fetch('/api' + path, { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Error'), { data });
    return data;
  }
  const setCart = c => { state.cart = c; renderCartBadge(); renderDrawer(); };
  async function addToCart(productId, qty = 1, addons = []) {
    setCart(await api('/cart/items', { method: 'POST', body: { productId, qty, addons } }));
    const p = product(productId);
    toast(`${esc(p.name)} se agregó al carrito <a href="#/carrito">Ver carrito</a>`);
  }

  // ---------- Helpers de catálogo ----------
  const product = id => state.catalog.products.find(p => p.id === id);
  const category = slug => state.catalog.categories.find(c => c.slug === slug);
  const occasion = slug => state.catalog.occasions.find(o => o.slug === slug);
  const waLink = (text = 'Hola Verano Rosa, me gustaría información sobre un arreglo 🌸') => `https://wa.me/${state.catalog.whatsapp}?text=${encodeURIComponent(text)}`;

  function stars(r) { return `<span class="stars" aria-label="${r} de 5">${icon('star').repeat(5)}<span>${r.toFixed(1)}</span></span>`; }
  function priceHtml(p) { return `<span class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</span>`; }
  function badge(p) {
    if (!p.badge) return '';
    const cls = p.badge === 'Promo' ? 'badge--promo' : p.badge === 'Nuevo' ? 'badge--nuevo' : '';
    const label = p.badge === 'Promo' && p.oldPrice ? `-${Math.round((1 - p.price / p.oldPrice) * 100)}%` : p.badge;
    return `<span class="badge ${cls}">${label}</span>`;
  }
  function productCard(p) {
    const fav = state.favs.includes(p.id);
    return `<article class="card">
      <a class="card__media" href="#/producto/${p.id}">
        <img src="${p.image}" alt="${esc(p.name)}" loading="lazy">
        ${badge(p)}
      </a>
      <button class="fav ${fav ? 'is-on' : ''}" data-action="fav" data-id="${p.id}" aria-label="${fav ? 'Quitar de' : 'Agregar a'} favoritos" aria-pressed="${fav}">${icon('heart')}</button>
      <div class="card__body">
        <span class="card__cat">${esc(category(p.category).short)}</span>
        <a class="card__title" href="#/producto/${p.id}">${esc(p.name)}</a>
        <p class="card__desc">${esc(p.description)}</p>
        <div class="card__foot">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">${priceHtml(p)}${stars(p.rating)}</div>
          <button class="btn btn--primary btn--sm btn--block" data-action="add" data-id="${p.id}">${icon('cart')} Agregar al carrito</button>
        </div>
      </div>
    </article>`;
  }
  // .card__media necesita position:relative para el botón de favorito
  const gridOf = list => list.length ? `<div class="grid">${list.map(productCard).join('')}</div>` : emptyState('No encontramos productos con esos filtros', 'Prueba con otra categoría u ocasión.', '#/tienda', 'Ver toda la tienda');
  function emptyState(title, text, href, cta) {
    return `<div class="empty"><img src="/img/logo.svg" alt=""><h3>${title}</h3><p class="muted">${text}</p>${href ? `<a class="btn btn--primary" href="${href}">${cta}</a>` : ''}</div>`;
  }
  function pageHero(title, text, crumbs = [], img) {
    const c = [['Inicio', '#/'], ...crumbs].map(([t, h], i, a) => i < a.length - 1 ? `<a href="${h}">${t}</a> / ` : `<span>${t}</span>`).join('');
    return `<section class="page-hero ${img ? 'page-hero--img' : ''}">${img ? `<img src="${img}" alt="">` : ''}<div class="container"><div class="crumbs">${c}</div><h1>${title}</h1>${text ? `<p>${text}</p>` : ''}</div></section>`;
  }

  // ---------- Vistas ----------
  const views = {};

  views.home = () => {
    const { categories, products, occasions, hero } = state.catalog;
    const best = products.filter(p => p.badge === 'Más vendido').slice(0, 8);
    const promos = products.filter(p => p.oldPrice);
    return `
    <section class="hero">
      <img class="hero__bg" src="${hero.image}" alt="Arreglo de peonías y rosas rosa palo">
      <div class="container hero__content fade-in">
        <img class="hero__logo" src="/img/logo.svg" alt="Logotipo Verano Rosa">
        <h1>Verano Rosa</h1>
        <div class="hero__slogan">«Para hacer especial lo cotidiano»</div>
        <p class="lead">Ramos, arreglos florales y regalos hechos a mano con flores frescas. Entrega a domicilio el mismo día.</p>
        <div class="hero__ctas">
          <a class="btn btn--light" href="#/tienda">Comprar ahora ${icon('arrow')}</a>
          <a class="btn btn--gold" href="#/personaliza">${icon('gift')} Personaliza tu regalo</a>
        </div>
        <div class="hero__chips">${occasions.map(o => `<a href="#/ocasiones/${o.slug}">${o.name}</a>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head"><span class="eyebrow">Nuestra tienda</span><h2>Compra por categoría</h2><p>Encuentra el detalle perfecto entre flores, regalos y accesorios.</p></div>
        <div class="cats">${categories.map(c => `<a class="cat" href="#/tienda/${c.slug}"><span class="cat__img"><img src="${c.image}" alt="" loading="lazy"></span>${esc(c.short)}</a>`).join('')}</div>
      </div>
    </section>

    <section class="section section--tint" style="padding-top:0">
      <div class="container">
        <div class="promos">
          <a class="promo" href="#/promociones"><img src="${hero.alt}" alt="" loading="lazy"><span class="tag-off">Hasta -20%</span><div><h3>Promociones de temporada</h3><p>Ramos y arreglos seleccionados con precio especial.</p><span class="link" style="color:#fff">Ver promociones ${icon('arrow')}</span></div></a>
          <a class="promo" href="#/ocasiones/san-valentin"><img src="${occasion('san-valentin').image}" alt="" loading="lazy"><div><h3>Amor y amistad</h3><p>Rosas, peluches y chocolates.</p></div></a>
          <a class="promo" href="#/tienda/flores-chocolates"><img src="/img/marca/peluche.jpg" alt="" loading="lazy"><span class="tag-off">Favorito</span><div><h3>Flores + chocolates</h3><p>La combinación más dulce.</p></div></a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="row-between"><div><span class="eyebrow">Favoritos de nuestros clientes</span><h2 style="margin:6px 0 0">Los más vendidos</h2></div><a class="link" href="#/tienda">Ver toda la tienda ${icon('arrow')}</a></div>
        ${gridOf(best)}
      </div>
    </section>

    <section class="section section--tint">
      <div class="container">
        <div class="section__head"><span class="eyebrow">Ocasiones especiales</span><h2>Un detalle para cada momento</h2></div>
        <div class="occ-grid">${occasions.map(o => `<a class="occ" href="#/ocasiones/${o.slug}"><img src="${o.image}" alt="" loading="lazy"><h3>${o.name}</h3><p>${o.tagline}</p></a>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="container split">
        <div class="split__media"><img src="/img/marca/caja.jpg" alt="Caja de regalo Verano Rosa" loading="lazy"><img class="float-img" src="/img/marca/etiqueta.jpg" alt="Etiqueta personalizada" loading="lazy"></div>
        <div>
          <span class="eyebrow">Hecho para ti</span>
          <h2>Personaliza tu regalo</h2>
          <p class="muted">Elige la base, las flores, el color y los complementos. Nosotros lo armamos a mano y lo entregamos con tu mensaje.</p>
          <ul class="checks">
            <li>${icon('check')} Ramo, caja, florero o canasta</li>
            <li>${icon('check')} Rosas, tulipanes, peonías o flores mixtas</li>
            <li>${icon('check')} Chocolates, globo, peluche y tarjeta</li>
          </ul>
          <a class="btn btn--primary" href="#/personaliza">Crear mi regalo ${icon('arrow')}</a>
        </div>
      </div>
    </section>

    <section class="section section--tint">
      <div class="container">
        <div class="perks">
          <div class="perk"><span class="perk__icon">${icon('truck')}</span><div><b>Entrega el mismo día</b><span>En pedidos antes de las 3:00 pm.</span></div></div>
          <div class="perk"><span class="perk__icon">${icon('leaf')}</span><div><b>Flores frescas</b><span>Seleccionadas cada mañana.</span></div></div>
          <div class="perk"><span class="perk__icon">${icon('card')}</span><div><b>Tarjeta sin costo</b><span>Con tu mensaje escrito a mano.</span></div></div>
          <div class="perk"><span class="perk__icon">${icon('shield')}</span><div><b>Compra segura</b><span>Pago protegido (demostrativo).</span></div></div>
        </div>
      </div>
    </section>

    ${promos.length ? `<section class="section"><div class="container"><div class="row-between"><div><span class="eyebrow">Por tiempo limitado</span><h2 style="margin:6px 0 0">Promociones</h2></div><a class="link" href="#/promociones">Ver todas ${icon('arrow')}</a></div>${gridOf(promos.slice(0, 4))}</div></section>` : ''}

    <section class="section section--tint">
      <div class="container">
        <div class="section__head"><span class="eyebrow">Así se vive</span><h2>La experiencia Verano Rosa</h2><p>Desde nuestra tienda hasta la puerta de quien más quieres.</p></div>
        <div class="brand-gallery">
          <figure><img src="${hero.store}" alt="Fachada de la tienda Verano Rosa" loading="lazy"><figcaption>Nuestra tienda</figcaption></figure>
          <figure><img src="${hero.bag}" alt="Bolsa de regalo" loading="lazy"><figcaption>Empaque de marca</figcaption></figure>
          <figure><img src="/img/marca/ramo.jpg" alt="Ramo con etiqueta" loading="lazy"><figcaption>Hecho a mano</figcaption></figure>
          <figure style="grid-column:span 2"><img src="${hero.van}" alt="Camioneta de reparto" loading="lazy"><figcaption>Entrega a domicilio</figcaption></figure>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head"><span class="eyebrow">Opiniones</span><h2>Lo que dicen nuestros clientes</h2></div>
        <div class="testis">
          <blockquote class="testi"><span class="stars">${icon('star').repeat(5)}</span><p>El ramo llegó puntual y precioso, exactamente como en la foto. Mi mamá lloró de emoción.</p><footer>Mariana G.<small>Día de las Madres</small></footer></blockquote>
          <blockquote class="testi"><span class="stars">${icon('star').repeat(5)}</span><p>Me encantó poder escribir la tarjeta y elegir el horario. La caja con chocolates es lo máximo.</p><footer>Daniel R.<small>Aniversario</small></footer></blockquote>
          <blockquote class="testi"><span class="stars">${icon('star').repeat(5)}</span><p>Muy fácil de comprar desde el celular, y la atención por WhatsApp fue rapidísima.</p><footer>Sofía L.<small>Graduación</small></footer></blockquote>
        </div>
      </div>
    </section>`;
  };

  // Tienda (todas, categoría, ocasión, búsqueda, promos, favoritos)
  function shopView({ title, text, crumbs, list, activeCat, activeOcc, img, baseHash }) {
    const { categories, occasions, products } = state.catalog;
    const q = new URLSearchParams(location.hash.split('?')[1] || '');
    const sort = q.get('orden') || 'relevancia', max = q.get('max') || '';
    let items = [...list];
    if (max) items = items.filter(p => p.price <= +max);
    if (sort === 'menor') items.sort((a, b) => a.price - b.price);
    if (sort === 'mayor') items.sort((a, b) => b.price - a.price);
    if (sort === 'nombre') items.sort((a, b) => a.name.localeCompare(b.name));
    const ranges = [['', 'Todos'], ['500', 'Hasta $500'], ['900', 'Hasta $900'], ['1200', 'Hasta $1,200']];
    const qs = (k, v) => { const n = new URLSearchParams(q); v ? n.set(k, v) : n.delete(k); const s = n.toString(); return baseHash + (s ? '?' + s : ''); };
    return `${pageHero(title, text, crumbs, img)}
    <div class="container shop">
      <aside class="filters" id="filters">
        <div><h4>Categorías</h4><ul class="filter-list">
          <li><a href="#/tienda" class="${!activeCat && !activeOcc && baseHash === '#/tienda' ? 'is-active' : ''}">Todo <small>${products.length}</small></a></li>
          ${categories.map(c => `<li><a href="#/tienda/${c.slug}" class="${activeCat === c.slug ? 'is-active' : ''}">${esc(c.short)} <small>${products.filter(p => p.category === c.slug).length}</small></a></li>`).join('')}
        </ul></div>
        <div><h4>Ocasión</h4><ul class="filter-list">
          ${occasions.map(o => `<li><a href="#/ocasiones/${o.slug}" class="${activeOcc === o.slug ? 'is-active' : ''}">${o.name} <small>${products.filter(p => p.occasions.includes(o.slug)).length}</small></a></li>`).join('')}
        </ul></div>
        <div><h4>Precio</h4><div class="chips">${ranges.map(([v, l]) => `<a class="chip ${max === v ? 'is-on' : ''}" href="${qs('max', v)}">${l}</a>`).join('')}</div></div>
        <a class="box" href="#/personaliza" style="display:block;margin:0;text-align:center"><b class="script" style="font-size:1.6rem">¿No lo encuentras?</b><br><span class="muted" style="font-size:.88rem">Arma un regalo a tu gusto</span></a>
      </aside>
      <div>
        <div class="toolbar">
          <button class="btn btn--light btn--sm filters-toggle" data-action="toggle-filters">Filtros</button>
          <span class="muted">${items.length} producto${items.length === 1 ? '' : 's'}</span>
          <label>Ordenar: <select data-sort data-base="${baseHash}">
            ${[['relevancia', 'Relevancia'], ['menor', 'Precio: menor a mayor'], ['mayor', 'Precio: mayor a menor'], ['nombre', 'Nombre A–Z']].map(([v, l]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select></label>
        </div>
        ${gridOf(items)}
      </div>
    </div>`;
  }

  views.shop = ([slug]) => {
    const { products } = state.catalog;
    if (!slug) return shopView({ title: 'Tienda en línea', text: 'Flores frescas, regalos y detalles para cualquier ocasión.', crumbs: [['Tienda', '#/tienda']], list: products, baseHash: '#/tienda' });
    const c = category(slug);
    if (!c) return views.notFound();
    return shopView({ title: c.name, text: c.description, crumbs: [['Tienda', '#/tienda'], [c.short, '']], list: products.filter(p => p.category === slug), activeCat: slug, img: c.image, baseHash: '#/tienda/' + slug });
  };

  views.occasions = ([slug]) => {
    const { occasions, products } = state.catalog;
    if (slug) {
      const o = occasion(slug);
      if (!o) return views.notFound();
      return shopView({ title: o.name, text: o.tagline, crumbs: [['Ocasiones', '#/ocasiones'], [o.name, '']], list: products.filter(p => p.occasions.includes(slug)), activeOcc: slug, img: o.image, baseHash: '#/ocasiones/' + slug });
    }
    return `${pageHero('Ocasiones especiales', 'Cada fecha importante merece un detalle a la altura. Elige la ocasión y te mostramos nuestras sugerencias.', [['Ocasiones', '']])}
    <section class="section"><div class="container" style="display:grid;gap:56px">
      ${occasions.map((o, i) => {
        const list = products.filter(p => p.occasions.includes(o.slug)).slice(0, 4);
        return `<div>
          <div class="split" style="margin-bottom:26px;${i % 2 ? 'direction:rtl' : ''}">
            <div class="split__media" style="direction:ltr"><img src="${o.image}" alt="${o.name}" loading="lazy" style="aspect-ratio:16/9"></div>
            <div style="direction:ltr"><span class="eyebrow">Ocasión</span><h2>${o.name}</h2><p class="muted">${o.tagline} Tenemos ${products.filter(p => p.occasions.includes(o.slug)).length} productos pensados para esta fecha.</p><a class="btn btn--ghost" href="#/ocasiones/${o.slug}">Ver todo para ${o.name.toLowerCase()} ${icon('arrow')}</a></div>
          </div>
          ${gridOf(list)}
        </div>`;
      }).join('')}
    </div></section>`;
  };

  views.promos = () => {
    const list = state.catalog.products.filter(p => p.oldPrice);
    return `${pageHero('Promociones', 'Precios especiales por tiempo limitado. ¡Aprovecha!', [['Promociones', '']], state.catalog.hero.alt)}
    <section class="section" style="padding-top:36px"><div class="container">
      <div class="perks" style="margin-bottom:36px">${state.catalog.promos.map(pr => `<div class="perk"><span class="perk__icon">${icon('gift')}</span><div><b>${pr.title}</b><span>${pr.text}</span></div></div>`).join('')}<div class="perk"><span class="perk__icon">${icon('card')}</span><div><b>Tarjeta gratis</b><span>En todos los pedidos.</span></div></div></div>
      ${gridOf(list)}
    </div></section>`;
  };

  views.search = ([term]) => {
    const t = decodeURIComponent(term || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const list = state.catalog.products.filter(p => norm(p.name + ' ' + p.description + ' ' + category(p.category).name).includes(t));
    return shopView({ title: `Resultados para “${esc(decodeURIComponent(term || ''))}”`, text: '', crumbs: [['Búsqueda', '']], list, baseHash: '#/buscar/' + term });
  };

  views.favorites = () => {
    const list = state.favs.map(product).filter(Boolean);
    return `${pageHero('Mis favoritos', 'Los productos que guardaste para después.', [['Favoritos', '']])}
    <section class="section" style="padding-top:36px"><div class="container">${list.length ? gridOf(list) : emptyState('Aún no tienes favoritos', 'Toca el corazón en cualquier producto para guardarlo aquí.', '#/tienda', 'Explorar la tienda')}</div></section>`;
  };

  views.product = ([id]) => {
    const p = product(id);
    if (!p) return views.notFound();
    const c = category(p.category);
    const related = state.catalog.products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
    const fav = state.favs.includes(p.id);
    return `<div class="container">
      <div class="crumbs" style="padding-top:22px"><a href="#/">Inicio</a> / <a href="#/tienda">Tienda</a> / <a href="#/tienda/${c.slug}">${esc(c.short)}</a> / <span>${esc(p.name)}</span></div>
      <div class="pdp fade-in">
        <div class="pdp__media"><img src="${p.image.replace('w=800', 'w=1200')}" alt="${esc(p.name)}">${badge(p)}<img class="stamp" src="/img/logo.svg" alt=""></div>
        <div>
          <span class="card__cat">${esc(c.name)}</span>
          <h1>${esc(p.name)}</h1>
          ${stars(p.rating)}
          <div class="pdp__price" data-pdp-price>${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s><span class="save">Ahorras ${money(p.oldPrice - p.price)}</span>` : ''}</div>
          <p>${esc(p.description)}</p>
          <ul class="includes">${p.includes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          <form class="box" data-form="pdp" data-id="${p.id}">
            <h4>Complementa tu regalo</h4>
            <div class="addons">${state.catalog.addons.map(a => `<label class="addon"><input type="checkbox" name="addon" value="${a.id}"><span>${a.name}</span><b>+${money(a.price)}</b></label>`).join('')}</div>
            <div class="buy-row" style="margin-top:18px">
              <div class="qty"><button type="button" data-step="-1" aria-label="Menos">−</button><input name="qty" type="number" value="1" min="1" max="20" aria-label="Cantidad"><button type="button" data-step="1" aria-label="Más">+</button></div>
              <button class="btn btn--primary" style="flex:1" type="submit">${icon('cart')} Agregar al carrito</button>
              <button class="icon-btn fav ${fav ? 'is-on' : ''}" style="position:static;border:1px solid var(--linea)" type="button" data-action="fav" data-id="${p.id}" aria-label="Favorito" aria-pressed="${fav}">${icon('heart')}</button>
            </div>
            <button class="btn btn--ghost btn--block" type="button" data-action="buy-now" style="margin-top:10px">Comprar ahora</button>
          </form>
          <div class="delivery-note">
            <div>${icon('truck')} Entrega el mismo día en CDMX y área metropolitana (pedidos antes de las 3:00 pm).</div>
            <div>${icon('card')} Incluye tarjeta con tu mensaje sin costo.</div>
            <div>${icon('whatsapp')} <a class="link" href="${waLink('Hola, quiero información sobre: ' + p.name)}" target="_blank" rel="noopener">Pregunta por WhatsApp</a></div>
          </div>
        </div>
      </div>
      ${related.length ? `<section style="padding-bottom:64px"><h2>También te puede gustar</h2>${gridOf(related)}</section>` : ''}
    </div>`;
  };

  views.custom = () => {
    const c = state.catalog.custom;
    const opt = (name, list, render, first = true) => list.map((x, i) => `<label class="opt"><input type="radio" name="${name}" value="${x.id}" ${first && i === 0 ? 'checked' : ''}>${render(x)}</label>`).join('');
    return `${pageHero('Personaliza tu regalo', 'Arma un detalle único en 4 pasos. Lo preparamos a mano y lo entregamos con tu mensaje.', [['Personaliza', '']])}
    <div class="container builder">
      <form data-form="custom" style="display:grid;gap:18px">
        <div class="box"><h4>1 · Elige la base</h4><div class="opt-grid">${opt('base', c.bases, b => `<img src="${b.image}" alt="">${b.name}<small>desde ${money(b.price)}</small>`)}</div></div>
        <div class="box"><h4>2 · Elige las flores</h4><div class="opt-grid">${opt('flower', c.flowers, f => `${f.name}<small>+${money(f.price)}</small>`)}</div></div>
        <div class="box"><h4>3 · Color y tamaño</h4>
          <div class="opt-grid opt-grid--5" style="margin-bottom:12px">${opt('color', c.colors, x => `<span class="swatch" style="background:${x.hex}"></span>${x.name}`)}</div>
          <div class="opt-grid opt-grid--3">${opt('size', c.sizes, s => `${s.name}<small>${s.factor === 1 ? 'Precio base' : '×' + s.factor}</small>`)}</div>
        </div>
        <div class="box"><h4>4 · Complementos y nota</h4>
          <div class="addons" style="margin-bottom:14px">${state.catalog.addons.map(a => `<label class="addon"><input type="checkbox" name="extra" value="${a.id}"><span>${a.name}</span><b>+${money(a.price)}</b></label>`).join('')}</div>
          <div class="field"><label for="c-note">Indicaciones para el florista (opcional)</label><input id="c-note" name="note" maxlength="140" placeholder="Ej. Sin lirios, por favor; listón dorado"></div>
        </div>
      </form>
      <aside class="panel preview-card">
        <div class="pv-img"><img data-pv-img src="${c.bases[0].image}" alt="Vista previa"><span class="pv-tint" data-pv-tint></span><img class="pv-tag" src="/img/logo.svg" alt=""></div>
        <h3 style="margin-bottom:4px" data-pv-title></h3>
        <p class="muted" data-pv-detail style="font-size:.9rem"></p>
        <div class="sum-row sum-row--total"><span>Total</span><span data-pv-price></span></div>
        <button class="btn btn--primary btn--block" data-action="add-custom" style="margin-top:14px">${icon('cart')} Agregar al carrito</button>
        <p class="muted" style="font-size:.78rem;margin:10px 0 0;text-align:center">Vista previa ilustrativa: el diseño final puede variar según la temporada.</p>
      </aside>
    </div>`;
  };
  function updateCustomPreview() {
    const f = $('[data-form="custom"]'); if (!f) return;
    const c = state.catalog.custom, fd = new FormData(f);
    const base = c.bases.find(x => x.id === fd.get('base')), flower = c.flowers.find(x => x.id === fd.get('flower'));
    const color = c.colors.find(x => x.id === fd.get('color')), size = c.sizes.find(x => x.id === fd.get('size'));
    const extras = fd.getAll('extra').map(id => state.catalog.addons.find(a => a.id === id));
    const total = Math.round((base.price + flower.price) * size.factor) + extras.reduce((a, e) => a + e.price, 0);
    $('[data-pv-img]').src = base.image;
    $('[data-pv-tint]').style.background = color.hex;
    $('[data-pv-title]').textContent = `${base.name} de ${flower.name.toLowerCase()}`;
    $('[data-pv-detail]').textContent = `${color.name} · Tamaño ${size.name.toLowerCase()}${extras.length ? ' · ' + extras.map(e => e.name).join(', ') : ''}`;
    $('[data-pv-price]').textContent = money(total);
  }

  views.about = () => `
    ${pageHero('Nosotros', 'Somos Verano Rosa: una florería y tienda de regalos que cree que los pequeños detalles transforman los días comunes.', [['Nosotros', '']], state.catalog.hero.store)}
    <section class="section"><div class="container split">
      <div class="split__media"><img src="/img/marca/ramo.jpg" alt="Ramo Verano Rosa" loading="lazy"><img class="float-img" src="/img/marca/gracias.jpg" alt="" loading="lazy"></div>
      <div>
        <span class="eyebrow">Nuestra historia</span>
        <h2>Para hacer especial <span class="script" style="font-size:1.2em">lo cotidiano</span></h2>
        <p>Verano Rosa nace de una idea sencilla: no hace falta esperar una fecha importante para demostrar cariño. Un ramo un martes cualquiera, una caja con chocolates después de un día largo o una tarjeta escrita a mano pueden convertir lo ordinario en un recuerdo.</p>
        <p class="muted">Diseñamos cada arreglo a mano, con flores frescas seleccionadas cada mañana y un empaque que refleja nuestra esencia: elegante, femenina y cálida.</p>
        <div class="stats"><div><b>+5,000</b><span>regalos entregados*</span></div><div><b>4.9</b><span>calificación promedio*</span></div><div><b>3 h</b><span>tiempo de entrega*</span></div></div>
        <p class="muted" style="font-size:.75rem;margin-top:10px">*Cifras ilustrativas del proyecto.</p>
      </div>
    </div></section>
    <section class="section section--tint"><div class="container">
      <div class="section__head"><span class="eyebrow">Lo que nos mueve</span><h2>Misión, visión y valores</h2></div>
      <div class="values">
        <div class="value"><span class="perk__icon">${icon('heart')}</span><h3>Misión</h3><p class="muted">Ayudar a las personas a expresar sus emociones con flores y regalos de calidad, entregados con puntualidad y un servicio cercano.</p></div>
        <div class="value"><span class="perk__icon">${icon('leaf')}</span><h3>Visión</h3><p class="muted">Ser la florería en línea favorita de quienes buscan un detalle elegante y accesible para cualquier día del año.</p></div>
        <div class="value"><span class="perk__icon">${icon('shield')}</span><h3>Valores</h3><p class="muted">Calidez, creatividad, frescura, puntualidad y respeto por cada historia que nos confían.</p></div>
      </div>
    </div></section>
    <section class="section"><div class="container">
      <div class="section__head"><span class="eyebrow">Identidad de marca</span><h2>Nuestra paleta</h2><p>Tonos rosa palo y rosa empolvado, blanco y detalles dorados.</p></div>
      <div class="palette">
        ${[['#f6dde2', 'Rosa palo'], ['#d99aa8', 'Rosa empolvado'], ['#a3485f', 'Rosa vino'], ['#ffffff', 'Blanco'], ['#c5a05a', 'Dorado']].map(([h, n]) => `<div><span style="background:${h}"></span><p><b>${n}</b><br><small class="muted">${h}</small></p></div>`).join('')}
      </div>
      <div class="brand-gallery" style="margin-top:32px">
        <figure><img src="/img/marca/peluche.jpg" alt="" loading="lazy"><figcaption>Cajas de regalo</figcaption></figure>
        <figure><img src="/img/marca/bolsa.jpg" alt="" loading="lazy"><figcaption>Bolsa</figcaption></figure>
        <figure><img src="/img/marca/etiqueta.jpg" alt="" loading="lazy"><figcaption>Etiqueta</figcaption></figure>
        <figure style="grid-column:span 2"><img src="/img/marca/camioneta.jpg" alt="" loading="lazy"><figcaption>Reparto</figcaption></figure>
      </div>
    </div></section>`;

  views.contact = () => `
    ${pageHero('Contacto', '¿Tienes dudas sobre un pedido o quieres un arreglo especial? Escríbenos, con gusto te ayudamos.', [['Contacto', '']])}
    <div class="container contact">
      <div class="contact-card">
        <div class="wa-card">${icon('whatsapp')}<div><h3>WhatsApp</h3><p>Atención inmediata para pedidos y cotizaciones.</p><a class="btn btn--sm" href="${waLink()}" target="_blank" rel="noopener">Abrir chat</a></div></div>
        <div class="contact-item"><span class="perk__icon">${icon('pin')}</span><div><b>Visítanos</b><span>Av. de las Flores 123, Col. Jardines, CDMX</span></div></div>
        <div class="contact-item"><span class="perk__icon">${icon('phone')}</span><div><b>Llámanos</b><span>55 1234 5678</span></div></div>
        <div class="contact-item"><span class="perk__icon">${icon('mail')}</span><div><b>Correo</b><span>hola@veranorosa.mx</span></div></div>
        <div class="contact-item"><span class="perk__icon">${icon('clock')}</span><div><b>Horario</b><span>Lun a Sáb 9:00 – 20:00 · Dom 10:00 – 15:00</span></div></div>
        <div class="map"><div>${icon('pin')} Mapa ilustrativo · Verano Rosa</div></div>
      </div>
      <div style="display:grid;gap:22px">
        <form class="panel" data-form="contact" novalidate>
          <h3>Envíanos un mensaje</h3>
          <div class="form-grid">
            ${field('name', 'Nombre', 'text', true)}${field('email', 'Correo electrónico', 'email', true)}
            ${field('phone', 'Teléfono', 'tel')}
            <div class="field"><label for="f-topic">Tema</label><select id="f-topic" name="topic"><option>Información general</option><option>Estado de mi pedido</option><option>Cotizar evento</option><option>Pedido empresarial</option></select></div>
            <div class="field full"><label for="f-message">Mensaje <i>*</i></label><textarea id="f-message" name="message" required></textarea><span class="err">Escribe tu mensaje</span></div>
          </div>
          <button class="btn btn--primary" style="margin-top:18px">Enviar mensaje</button>
        </form>
        <div class="faq">
          <h3>Preguntas frecuentes</h3>
          <details><summary>¿Hacen entregas el mismo día?</summary><p>Sí, en pedidos confirmados antes de las 3:00 pm dentro de la zona de cobertura.</p></details>
          <details><summary>¿Puedo enviar un regalo anónimo?</summary><p>Claro. En el checkout marca la opción “Enviar como anónimo” y no incluiremos tu nombre en la tarjeta.</p></details>
          <details><summary>¿Qué pasa si la persona no está?</summary><p>Te contactamos para reprogramar la entrega o dejarlo con alguien de confianza.</p></details>
          <details><summary>¿Las flores son frescas?</summary><p>Seleccionamos nuestras flores cada mañana y las preparamos el mismo día de la entrega.</p></details>
        </div>
      </div>
    </div>`;

  function field(name, label, type = 'text', required = false, attrs = '', cls = '', hint = '') {
    return `<div class="field ${cls}"><label for="f-${name}">${label}${required ? ' <i>*</i>' : ''}</label><input id="f-${name}" name="${name}" type="${type}" ${required ? 'required' : ''} ${attrs}>${hint ? `<span class="hint">${hint}</span>` : ''}<span class="err">Este campo es obligatorio</span></div>`;
  }

  // Carrito
  function lineHtml(l, compact = false) {
    return `<div class="line">
      <img src="${l.image}" alt="">
      <div>
        <div class="line__name">${esc(l.name)}</div>
        ${l.details ? `<div class="line__meta">${esc(l.details)}</div>` : ''}
        ${l.addonNames?.length ? `<div class="line__meta">+ ${esc(l.addonNames.join(', '))}</div>` : ''}
        <div class="line__meta">${money(l.unitPrice)} c/u</div>
        <div class="line__actions">
          <div class="qty qty--sm"><button data-action="qty" data-line="${l.lineId}" data-q="${l.qty - 1}" ${l.qty <= 1 ? 'disabled' : ''} aria-label="Menos">−</button><input value="${l.qty}" readonly aria-label="Cantidad"><button data-action="qty" data-line="${l.lineId}" data-q="${l.qty + 1}" aria-label="Más">+</button></div>
          <button class="remove" data-action="remove" data-line="${l.lineId}">${icon('trash')}${compact ? '' : ' Eliminar'}</button>
        </div>
      </div>
      <div class="line__price">${money(l.total)}</div>
    </div>`;
  }
  function shippingBar(c) {
    const left = c.freeShippingFrom - c.subtotal;
    const pct = Math.min(100, (c.subtotal / c.freeShippingFrom) * 100);
    return `<div class="progress"><span style="width:${pct}%"></span></div><div class="ship-msg">${left > 0 ? `Te faltan <b>${money(left)}</b> para envío gratis` : '¡Tienes envío gratis! 🎉'}</div>`;
  }
  function totalsHtml(c) {
    return `<div class="sum-row"><span>Subtotal (${c.count} art.)</span><span>${money(c.subtotal)}</span></div>
      <div class="sum-row"><span>Envío</span><span>${c.shipping ? money(c.shipping) : 'Gratis'}</span></div>
      <div class="sum-row"><span>Tarjeta con mensaje</span><span>Gratis</span></div>
      <div class="sum-row sum-row--total"><span>Total</span><span>${money(c.total)}</span></div>`;
  }
  views.cart = () => {
    const c = state.cart;
    if (!c.lines.length) return `${pageHero('Tu carrito', '', [['Carrito', '']])}<div class="container" style="padding:40px 0 80px">${emptyState('Tu carrito está vacío', 'Agrega flores o regalos para comenzar tu pedido.', '#/tienda', 'Ir a la tienda')}</div>`;
    return `${pageHero('Tu carrito', 'Revisa tu pedido antes de continuar.', [['Carrito', '']])}
    <div class="container cart-page">
      <div class="panel" style="padding-top:8px">${c.lines.map(l => lineHtml(l)).join('')}
        <div style="display:flex;justify-content:space-between;margin-top:18px;flex-wrap:wrap;gap:10px"><a class="link" href="#/tienda">← Seguir comprando</a><a class="link" href="#/personaliza">Agregar un regalo personalizado ${icon('arrow')}</a></div>
      </div>
      <aside class="summary"><h3>Resumen del pedido</h3>${shippingBar(c)}${totalsHtml(c)}
        <a class="btn btn--primary btn--block" href="#/checkout" style="margin-top:18px">Continuar con la compra ${icon('arrow')}</a>
        <p class="muted" style="font-size:.78rem;text-align:center;margin:12px 0 0">${icon('shield')} Compra demostrativa: no se realiza ningún cargo.</p>
      </aside>
    </div>`;
  };
  function renderDrawer() {
    const body = $('[data-drawer-body]'); const c = state.cart;
    body.innerHTML = c.lines.length ? `${shippingBar(c).replace('class="progress"', 'class="progress" style="margin-top:16px"')}${c.lines.map(l => lineHtml(l, true)).join('')}
      <div class="drawer__foot">${totalsHtml(c)}<a class="btn btn--primary btn--block" href="#/checkout">Finalizar compra</a><a class="btn btn--light btn--block" href="#/carrito">Ver carrito completo</a></div>`
      : `<div style="margin:auto">${emptyState('Tu carrito está vacío', 'Descubre nuestros ramos y regalos.', '#/tienda', 'Ir a la tienda')}</div>`;
  }
  function renderCartBadge() {
    const b = $('[data-cart-count]'); b.textContent = state.cart.count; b.hidden = !state.cart.count;
    const f = $('[data-fav-count]'); f.textContent = state.favs.length; f.hidden = !state.favs.length;
  }

  // Checkout
  let draft = {}, step = 1;
  const STEP_FIELDS = {
    1: ['recipientName', 'recipientPhone', 'street', 'colony', 'zip', 'city', 'date', 'timeSlot'],
    2: [],
    3: ['senderName', 'senderEmail', 'payment'],
  };
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  views.checkout = () => {
    const c = state.cart;
    if (!c.lines.length) return `${pageHero('Finalizar compra', '', [['Checkout', '']])}<div class="container" style="padding:40px 0 80px">${emptyState('No hay productos en tu carrito', 'Agrega algo especial antes de finalizar la compra.', '#/tienda', 'Ir a la tienda')}</div>`;
    const slots = ['9:00 – 13:00', '13:00 – 17:00', '17:00 – 21:00'];
    const msgs = ['¡Feliz cumpleaños! Que este año florezca tanto como tú. 🌸', 'Feliz aniversario. Gracias por hacer especial cada día a tu lado.', '¡Felicidades por tu graduación! Estoy muy orgulloso(a) de ti.', 'Para la mejor mamá del mundo. Te quiero mucho.', 'Solo porque sí: pensé en ti hoy.'];
    return `<div class="page-hero" style="padding:36px 0 26px"><div class="container"><h1 style="font-size:2.4rem">Finalizar compra</h1>
      <ol class="steps" data-steps style="margin-top:18px"><li>Entrega</li><li>Tarjeta</li><li>Pago</li></ol></div></div>
    <div class="container checkout" style="padding-top:32px">
      <form data-form="checkout" novalidate>
        <section class="panel" data-step="1">
          <h3>${icon('pin')} ¿A quién se lo enviamos?</h3>
          <div class="form-grid">
            ${field('recipientName', 'Nombre del destinatario', 'text', true, 'autocomplete="off"')}
            ${field('recipientPhone', 'Teléfono del destinatario', 'tel', true, 'inputmode="tel" pattern="[0-9 ]{8,20}"', '', 'Solo lo usamos para coordinar la entrega')}
            ${field('street', 'Calle y número', 'text', true, '', 'full')}
            ${field('colony', 'Colonia', 'text', true)}
            ${field('zip', 'Código postal', 'text', true, 'inputmode="numeric" pattern="[0-9]{5}" maxlength="5"')}
            ${field('city', 'Ciudad / Alcaldía', 'text', true)}
            <div class="field"><label for="f-place">Tipo de lugar</label><select id="f-place" name="placeType"><option>Casa</option><option>Oficina</option><option>Hospital</option><option>Escuela</option><option>Otro</option></select></div>
            <div class="field full"><label for="f-references">Referencias (opcional)</label><input id="f-references" name="references" placeholder="Ej. Portón blanco, junto a la farmacia"></div>
            ${field('date', 'Fecha de entrega', 'date', true, `min="${today()}"`)}
            <div class="field"><label>Horario <i>*</i></label><select name="timeSlot" required><option value="">Selecciona un horario</option>${slots.map(s => `<option>${s}</option>`).join('')}</select><span class="err">Elige un horario</span></div>
          </div>
          <div class="step-actions"><a class="link" href="#/carrito">← Volver al carrito</a><button type="button" class="btn btn--primary" data-action="next-step">Continuar ${icon('arrow')}</button></div>
        </section>

        <section class="panel" data-step="2" hidden>
          <h3>${icon('card')} Mensaje de la tarjeta</h3>
          <p class="muted" style="font-size:.9rem">Lo escribimos a mano en una tarjeta Verano Rosa sin costo.</p>
          <div class="suggest" style="margin-bottom:12px">${msgs.map(m => `<button type="button" class="chip" data-action="use-msg" data-msg="${esc(m)}">${esc(m.split(/[.!]/)[0].slice(0, 26))}…</button>`).join('')}</div>
          <div class="form-grid">
            <div class="field full"><label for="f-cardMessage">Mensaje</label><textarea id="f-cardMessage" name="cardMessage" maxlength="250" placeholder="Escribe aquí tu dedicatoria…"></textarea><span class="hint"><span data-count>0</span>/250 caracteres</span></div>
            <div class="field"><label for="f-cardSignature">Firma</label><input id="f-cardSignature" name="cardSignature" placeholder="Con cariño, …"></div>
            <div class="field" style="justify-content:end"><label class="check"><input type="checkbox" name="anonymous"> Enviar como anónimo</label></div>
          </div>
          <div class="card-preview"><img src="/img/logo.svg" alt=""><p data-card-text>Tu mensaje aparecerá aquí</p><small data-card-sign></small></div>
          <div class="step-actions"><button type="button" class="btn btn--light" data-action="prev-step">← Atrás</button><button type="button" class="btn btn--primary" data-action="next-step">Continuar ${icon('arrow')}</button></div>
        </section>

        <section class="panel" data-step="3" hidden>
          <h3>${icon('user')} Tus datos</h3>
          <div class="form-grid">
            ${field('senderName', 'Tu nombre', 'text', true, 'autocomplete="name"')}
            ${field('senderEmail', 'Correo electrónico', 'email', true, 'autocomplete="email"', '', 'Te enviaríamos aquí la confirmación')}
            ${field('senderPhone', 'Tu teléfono', 'tel', false, 'autocomplete="tel"')}
          </div>
          <h3 style="margin-top:26px">${icon('shield')} Método de pago</h3>
          <div class="radios">
            <label class="radio-card"><input type="radio" name="payment" value="Tarjeta (simulada)"><b>Tarjeta</b>Crédito / débito</label>
            <label class="radio-card"><input type="radio" name="payment" value="Transferencia SPEI (simulada)"><b>SPEI</b>Transferencia</label>
            <label class="radio-card"><input type="radio" name="payment" value="Pago en OXXO (simulado)"><b>OXXO</b>Pago en efectivo</label>
          </div>
          <div class="field" data-pay-field><span class="err">Elige un método de pago</span></div>
          <p class="note" style="margin-top:14px">🌸 Esta es una tienda demostrativa: no se solicitan datos bancarios ni se realiza ningún cargo. Al confirmar se genera un pedido simulado.</p>
          <label class="check" style="margin-top:12px"><input type="checkbox" name="terms" required> Acepto los términos y el aviso de privacidad (demostrativos)</label>
          <div class="field" data-terms-field><span class="err">Debes aceptar para continuar</span></div>
          <div class="step-actions"><button type="button" class="btn btn--light" data-action="prev-step">← Atrás</button><button type="submit" class="btn btn--primary">Confirmar pedido · ${money(c.total)}</button></div>
        </section>
      </form>
      <aside class="summary">
        <h3>Tu pedido</h3>
        <div class="mini-lines">${c.lines.map(l => `<div class="mini-line"><img src="${l.image}" alt=""><div>${esc(l.name)}<em>Cant. ${l.qty}${l.addonNames?.length ? ' · + ' + esc(l.addonNames.join(', ')) : ''}</em></div><b>${money(l.total)}</b></div>`).join('')}</div>
        ${totalsHtml(c)}
        <div data-delivery-summary class="note" style="margin-top:16px;display:none"></div>
      </aside>
    </div>`;
  };
  function initCheckout() {
    const f = $('[data-form="checkout"]'); if (!f) return;
    step = 1;
    for (const [k, v] of Object.entries(draft)) { const el = f.elements[k]; if (!el) continue; if (el.type === 'checkbox') el.checked = !!v; else if (el instanceof RadioNodeList) el.value = v; else el.value = v; }
    syncCardPreview(); showStep(1);
  }
  function showStep(n) {
    step = n;
    $$('section[data-step]').forEach(s => s.hidden = +s.dataset.step !== n);
    $$('[data-steps] li').forEach((li, i) => { li.className = i + 1 < n ? 'is-done' : i + 1 === n ? 'is-active' : ''; });
    const d = draft, box = $('[data-delivery-summary]');
    if (box) { box.style.display = n > 1 ? 'block' : 'none'; box.innerHTML = `<b>Entrega para ${esc(d.recipientName || '')}</b><br>${esc(d.street || '')}, ${esc(d.colony || '')}, CP ${esc(d.zip || '')}<br>${esc(fmtDate(d.date))} · ${esc(d.timeSlot || '')}`; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function validateStep(n) {
    const f = $('[data-form="checkout"]'); let ok = true, first;
    for (const name of STEP_FIELDS[n]) {
      if (name === 'payment') { const bad = !f.elements.payment.value; $('[data-pay-field]').classList.toggle('has-error', bad); if (bad) { ok = false; } continue; }
      const el = f.elements[name]; const bad = !el.value.trim() || !el.checkValidity();
      el.closest('.field').classList.toggle('has-error', bad);
      if (bad) { ok = false; first ||= el; }
    }
    if (n === 3) { const bad = !f.elements.terms.checked; $('[data-terms-field]').classList.toggle('has-error', bad); if (bad) ok = false; }
    first?.focus();
    return ok;
  }
  function readCheckout() {
    const f = $('[data-form="checkout"]'), out = {};
    for (const el of f.elements) { if (!el.name) continue; if (el.type === 'checkbox') out[el.name] = el.checked; else if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; } else out[el.name] = el.value; }
    return out;
  }
  let draftTimer;
  function saveDraftSoon() { clearTimeout(draftTimer); draftTimer = setTimeout(() => { draft = readCheckout(); api('/checkout/draft', { method: 'PUT', body: draft }).catch(() => {}); }, 400); }
  function syncCardPreview() {
    const f = $('[data-form="checkout"]'); if (!f) return;
    const m = f.elements.cardMessage.value, s = f.elements.cardSignature.value, anon = f.elements.anonymous.checked;
    $('[data-card-text]').textContent = m || 'Tu mensaje aparecerá aquí';
    $('[data-card-sign]').textContent = anon ? '— Anónimo' : s ? '— ' + s : '';
    $('[data-count]').textContent = m.length;
  }
  const fmtDate = d => d ? new Date(d + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

  // Confirmación y pedidos
  views.order = async ([folio]) => {
    let o; try { o = await api('/orders/' + folio); } catch { return views.notFound(); }
    const steps = ['Confirmado', 'En preparación', 'En camino', 'Entregado'];
    return `<div class="container confirm fade-in">
      <img class="confirm__seal" src="/img/logo.svg" alt="">
      <span class="eyebrow">Pedido confirmado</span>
      <h1 class="script" style="font-size:clamp(2.8rem,7vw,4.2rem);margin:6px 0">¡Gracias por tu compra!</h1>
      <p class="muted">Hemos recibido tu pedido. Enviamos la confirmación a <b>${esc(o.sender.email)}</b> (simulado).</p>
      <div class="folio">${o.folio}</div>
      <div class="panel">
        <h3>Seguimiento</h3>
        <div class="timeline">${steps.map((s, i) => `<div class="${i === 0 ? 'on' : ''}">${s}</div>`).join('')}</div>
      </div>
      <div class="panel">
        <h3>Detalles de entrega</h3>
        <dl>
          <dt>Destinatario</dt><dd>${esc(o.delivery.recipientName)} · ${esc(o.delivery.recipientPhone)}</dd>
          <dt>Dirección</dt><dd>${esc(o.delivery.street)}, ${esc(o.delivery.colony)}, CP ${esc(o.delivery.zip)}, ${esc(o.delivery.city)}${o.delivery.references ? `<br><small class="muted">${esc(o.delivery.references)}</small>` : ''}</dd>
          <dt>Fecha y horario</dt><dd>${esc(fmtDate(o.delivery.date))} · ${esc(o.delivery.timeSlot)}</dd>
          <dt>Mensaje de tarjeta</dt><dd>${o.card.message ? `<i>“${esc(o.card.message)}”</i> ${o.card.anonymous ? '— Anónimo' : o.card.signature ? '— ' + esc(o.card.signature) : ''}` : '<span class="muted">Sin mensaje</span>'}</dd>
          <dt>Pago</dt><dd>${esc(o.payment.method)}</dd>
        </dl>
      </div>
      <div class="panel">
        <h3>Productos</h3>
        <div class="mini-lines" style="max-height:none">${o.lines.map(l => `<div class="mini-line"><img src="${l.image}" alt=""><div>${esc(l.name)}<em>Cant. ${l.qty}${l.addonNames?.length ? ' · + ' + esc(l.addonNames.join(', ')) : ''}</em></div><b>${money(l.total)}</b></div>`).join('')}</div>
        ${totalsHtml(o)}
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a class="btn btn--primary" href="#/">Volver al inicio</a>
        <a class="btn btn--light" href="#/mis-pedidos">Ver mis pedidos</a>
        <a class="btn btn--light" target="_blank" rel="noopener" href="${waLink('Hola, quiero dar seguimiento a mi pedido ' + o.folio)}">${icon('whatsapp')} Seguimiento por WhatsApp</a>
      </div>
    </div>`;
  };

  views.orders = async () => {
    const list = await api('/orders');
    return `${pageHero('Mis pedidos', 'Consulta el estado de tus compras o rastrea un pedido con su folio.', [['Mis pedidos', '']])}
    <div class="container" style="padding:36px 0 72px;display:grid;gap:26px">
      <form class="panel" data-form="track" style="display:flex;gap:12px;align-items:end;flex-wrap:wrap">
        <div class="field" style="flex:1;min-width:220px"><label for="f-folio">Rastrear por folio</label><input id="f-folio" name="folio" placeholder="VR-12345678" required></div>
        <button class="btn btn--primary">Buscar</button>
      </form>
      ${list.length ? `<div class="orders">${list.map(o => `<a class="order-row" href="#/pedido/${o.folio}"><span class="folio-sm">${o.folio}</span><span>${esc(o.delivery.recipientName)}<br><small class="muted">${esc(fmtDate(o.delivery.date))}</small></span><span class="pill">${o.status}</span><b>${money(o.total)}</b></a>`).join('')}</div>`
        : emptyState('Aún no tienes pedidos', 'Cuando completes una compra aparecerá aquí.', '#/tienda', 'Ir a la tienda')}
    </div>`;
  };

  views.panel = async () => {
    const d = await api('/admin/summary');
    return `${pageHero('Panel demostrativo', 'Así se ve lo que el backend guarda mientras los visitantes usan la tienda (data/db.json).', [['Panel', '']])}
    <div class="container" style="padding:36px 0 72px">
      <div class="kpis">
        <div class="kpi"><b>${d.sessions}</b><span>Visitantes (sesiones)</span></div>
        <div class="kpi"><b>${d.activeCarts}</b><span>Carritos activos</span></div>
        <div class="kpi"><b>${d.orders.length}</b><span>Pedidos recientes</span></div>
        <div class="kpi"><b>${money(d.revenue)}</b><span>Ventas simuladas</span></div>
      </div>
      <h3>Pedidos</h3>
      <div class="tbl-wrap" style="margin-bottom:28px"><table class="tbl"><thead><tr><th>Folio</th><th>Fecha</th><th>Destinatario</th><th>Entrega</th><th>Artículos</th><th>Total</th></tr></thead><tbody>
        ${d.orders.length ? d.orders.map(o => `<tr><td><a class="link" href="#/pedido/${o.folio}">${o.folio}</a></td><td>${new Date(o.createdAt).toLocaleString('es-MX')}</td><td>${esc(o.delivery.recipientName)}</td><td>${esc(o.delivery.date)} · ${esc(o.delivery.timeSlot)}</td><td>${o.count}</td><td>${money(o.total)}</td></tr>`).join('') : '<tr><td colspan="6" class="muted">Sin pedidos todavía</td></tr>'}
      </tbody></table></div>
      <h3>Mensajes de contacto</h3>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fecha</th><th>Nombre</th><th>Tema</th><th>Mensaje</th></tr></thead><tbody>
        ${d.messages.length ? d.messages.map(m => `<tr><td>${new Date(m.at).toLocaleString('es-MX')}</td><td>${esc(m.name)}</td><td>${esc(m.topic)}</td><td>${esc(m.message)}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">Sin mensajes todavía</td></tr>'}
      </tbody></table></div>
    </div>`;
  };

  views.notFound = () => `<div class="container" style="padding:60px 0 90px">${emptyState('Página no encontrada', 'Parece que esta flor se nos escapó.', '#/', 'Volver al inicio')}</div>`;

  // ---------- Router ----------
  const routes = [
    [/^\/?$/, views.home, 'inicio'],
    [/^\/tienda(?:\/([\w-]+))?$/, views.shop, 'tienda'],
    [/^\/producto\/([\w-]+)$/, views.product, 'tienda'],
    [/^\/ocasiones(?:\/([\w-]+))?$/, views.occasions, 'ocasiones'],
    [/^\/promociones$/, views.promos, 'promociones'],
    [/^\/personaliza$/, views.custom, 'personaliza'],
    [/^\/nosotros$/, views.about, 'nosotros'],
    [/^\/contacto$/, views.contact, 'contacto'],
    [/^\/carrito$/, views.cart, ''],
    [/^\/checkout$/, views.checkout, ''],
    [/^\/pedido\/([\w-]+)$/, views.order, ''],
    [/^\/mis-pedidos$/, views.orders, ''],
    [/^\/favoritos$/, views.favorites, ''],
    [/^\/buscar\/(.+)$/, views.search, 'tienda'],
    [/^\/panel$/, views.panel, ''],
  ];
  let lastPath = null;
  async function router() {
    const [path] = (location.hash.slice(1) || '/').split('?');
    const match = routes.map(([re, fn, nav]) => [path.match(re), fn, nav]).find(([m]) => m) || [[], views.notFound, ''];
    const [m, fn, nav] = match;
    closeAll();
    const html = await fn(m.slice(1));
    app.innerHTML = `<div class="fade-in">${html}</div>`;
    $$('[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === nav));
    if (path !== lastPath) window.scrollTo(0, 0);
    lastPath = path;
    if (fn === views.custom) updateCustomPreview();
    if (fn === views.checkout) initCheckout();
    document.title = (app.querySelector('h1')?.textContent.trim() || 'Verano Rosa') + ' · Verano Rosa';
    if (fn === views.home) document.title = 'Verano Rosa · Florería y regalos';
  }

  // ---------- UI global ----------
  function toast(html) {
    const t = $('#toast'); t.innerHTML = icon('check') + `<span>${html}</span>`; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
  }
  const scrim = $('.scrim');
  function openCart() { $('#cart-drawer').classList.add('is-open'); $('#cart-drawer').setAttribute('aria-hidden', 'false'); scrim.hidden = false; }
  function closeAll() { $('#cart-drawer').classList.remove('is-open'); $('#cart-drawer').setAttribute('aria-hidden', 'true'); $('#nav').classList.remove('is-open'); scrim.hidden = true; }

  document.addEventListener('click', async e => {
    const el = e.target.closest('[data-action]');
    if (!el) { if (e.target.closest('#nav a')) closeAll(); if (e.target.closest('#cart-drawer a')) closeAll(); return; }
    const a = el.dataset.action;
    try {
      if (a === 'add') { el.disabled = true; await addToCart(el.dataset.id); el.disabled = false; }
      if (a === 'fav') {
        state.favs = await api('/favorites', { method: 'POST', body: { productId: el.dataset.id } });
        const on = state.favs.includes(el.dataset.id);
        $$(`[data-action="fav"][data-id="${el.dataset.id}"]`).forEach(b => { b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
        renderCartBadge(); toast(on ? 'Guardado en favoritos <a href="#/favoritos">Ver</a>' : 'Quitado de favoritos');
        if (location.hash.startsWith('#/favoritos')) router();
      }
      if (a === 'open-cart') openCart();
      if (a === 'open-menu') { $('#nav').classList.add('is-open'); scrim.hidden = false; }
      if (a === 'close-menu' || a === 'close-all') closeAll();
      if (a === 'qty') { setCart(await api('/cart/items/' + el.dataset.line, { method: 'PATCH', body: { qty: +el.dataset.q } })); refreshCartViews(); }
      if (a === 'remove') { setCart(await api('/cart/items/' + el.dataset.line, { method: 'DELETE' })); refreshCartViews(); toast('Producto eliminado'); }
      if (a === 'toggle-filters') $('#filters').classList.toggle('is-open');
      if (a === 'buy-now') { const f = el.closest('form'); await submitPdp(f, true); }
      if (a === 'add-custom') {
        const fd = new FormData($('[data-form="custom"]'));
        setCart(await api('/cart/custom', { method: 'POST', body: { base: fd.get('base'), flower: fd.get('flower'), color: fd.get('color'), size: fd.get('size'), extras: fd.getAll('extra'), note: fd.get('note') } }));
        toast('Tu regalo personalizado está en el carrito <a href="#/carrito">Ver carrito</a>'); openCart();
      }
      if (a === 'next-step') { if (validateStep(step)) { draft = readCheckout(); saveDraftSoon(); showStep(step + 1); } }
      if (a === 'prev-step') showStep(step - 1);
      if (a === 'use-msg') { const f = $('[data-form="checkout"]'); f.elements.cardMessage.value = el.dataset.msg; syncCardPreview(); saveDraftSoon(); }
    } catch (err) { toast(esc(err.message)); el.disabled = false; }
  });
  function refreshCartViews() { if (['#/carrito', '#/checkout'].includes(location.hash.split('?')[0])) router(); }

  async function submitPdp(f, goCheckout) {
    const fd = new FormData(f);
    await addToCart(f.dataset.id, +fd.get('qty') || 1, fd.getAll('addon'));
    if (goCheckout) location.hash = '#/checkout'; else openCart();
  }

  document.addEventListener('submit', async e => {
    const f = e.target; const kind = f.dataset.form; if (!kind) return;
    e.preventDefault();
    try {
      if (kind === 'search') { const q = f.q.value.trim(); if (q) { location.hash = '#/buscar/' + encodeURIComponent(q); f.q.blur(); } }
      if (kind === 'pdp') await submitPdp(f, false);
      if (kind === 'track') location.hash = '#/pedido/' + encodeURIComponent(f.folio.value.trim().toUpperCase());
      if (kind === 'contact') {
        let ok = true;
        for (const n of ['name', 'email', 'message']) { const el = f.elements[n]; const bad = !el.value.trim() || !el.checkValidity(); el.closest('.field').classList.toggle('has-error', bad); if (bad) ok = false; }
        if (!ok) return;
        await api('/contact', { method: 'POST', body: Object.fromEntries(new FormData(f)) });
        f.reset(); toast('¡Gracias! Te responderemos muy pronto 💌');
      }
      if (kind === 'checkout') {
        if (!validateStep(3)) return;
        const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Procesando pago simulado…';
        await new Promise(r => setTimeout(r, 900));
        const order = await api('/checkout', { method: 'POST', body: readCheckout() });
        draft = { senderName: order.sender.name, senderEmail: order.sender.email, senderPhone: order.sender.phone };
        setCart(await api('/cart'));
        location.hash = '#/pedido/' + order.folio;
      }
    } catch (err) {
      toast(esc(err.message));
      const btn = f.querySelector('[type=submit]'); if (btn) btn.disabled = false;
      if (kind === 'checkout') { btn.textContent = 'Confirmar pedido'; }
    }
  });

  document.addEventListener('input', e => {
    const f = e.target.form;
    if (f?.dataset.form === 'custom') updateCustomPreview();
    if (f?.dataset.form === 'checkout') {
      e.target.closest('.field')?.classList.remove('has-error');
      if (e.target.name === 'payment') $('[data-pay-field]').classList.remove('has-error');
      syncCardPreview(); saveDraftSoon();
    }
  });
  document.addEventListener('change', e => {
    if (e.target.matches('[data-sort]')) { const base = e.target.dataset.base; const q = new URLSearchParams(location.hash.split('?')[1] || ''); q.set('orden', e.target.value); location.hash = base + '?' + q; }
    if (e.target.form?.dataset.form === 'checkout') { syncCardPreview(); saveDraftSoon(); }
    if (e.target.form?.dataset.form === 'custom') updateCustomPreview();
    if (e.target.form?.dataset.form === 'pdp') {
      const f = e.target.form, p = product(f.dataset.id);
      const extra = new FormData(f).getAll('addon').reduce((a, id) => a + state.catalog.addons.find(x => x.id === id).price, 0);
      $('[data-pdp-price]').innerHTML = money(p.price + extra) + (extra ? `<span class="save">incluye complementos</span>` : p.oldPrice ? `<s>${money(p.oldPrice)}</s><span class="save">Ahorras ${money(p.oldPrice - p.price)}</span>` : '');
    }
  });
  // Botones +/− de cantidad en la ficha
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-step]'); if (!b || b.tagName !== 'BUTTON') return;
    const input = b.parentElement.querySelector('input'); input.value = Math.max(1, Math.min(20, (+input.value || 1) + +b.dataset.step));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  // ---------- Inicio ----------
  (async () => {
    app.innerHTML = '<div class="skeleton">Cargando Verano Rosa…</div>';
    const [catalog, cart, favs, d] = await Promise.all([api('/catalog'), api('/cart'), api('/favorites'), api('/checkout/draft')]);
    Object.assign(state, { catalog, cart, favs }); draft = d;
    $('[data-mega]').innerHTML = catalog.categories.map(c => `<a href="#/tienda/${c.slug}"><img src="${c.image}" alt="" loading="lazy">${esc(c.short)}</a>`).join('');
    $('[data-footer-cats]').innerHTML = catalog.categories.map(c => `<li><a href="#/tienda/${c.slug}">${esc(c.name)}</a></li>`).join('');
    $$('[data-whatsapp]').forEach(a => { a.href = waLink(); a.target = '_blank'; a.rel = 'noopener'; });
    renderCartBadge(); renderDrawer();
    window.addEventListener('hashchange', router);
    router();
  })();
})();
