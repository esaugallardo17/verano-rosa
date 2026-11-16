# Verano Rosa · Tienda en línea demostrativa

Plantilla de e‑commerce para la florería y tienda de regalos **Verano Rosa** («Para hacer especial lo cotidiano»).
Proyecto escolar: los precios son ilustrativos y no hay cobros ni entregas reales.

## Cómo ejecutarlo

Solo necesitas [Node.js](https://nodejs.org) 18 o superior (no hay que instalar dependencias).

```bash
cd verano-rosa
node server.js
```

Abre <http://localhost:3000>. Para usar otro puerto: `PORT=8080 node server.js`.

## Qué incluye

| Vista | Ruta |
|---|---|
| Inicio (portada, categorías, promos, más vendidos, ocasiones, testimonios) | `#/` |
| Tienda y categorías (filtros por categoría, ocasión, precio y orden) | `#/tienda`, `#/tienda/ramos`… |
| Ficha de producto (complementos, cantidad, favoritos, WhatsApp) | `#/producto/:id` |
| Ocasiones especiales | `#/ocasiones`, `#/ocasiones/cumpleanos`… |
| Promociones | `#/promociones` |
| Personaliza tu regalo (constructor con vista previa y precio) | `#/personaliza` |
| Nosotros (historia, misión, visión, valores, paleta) | `#/nosotros` |
| Contacto (formulario, WhatsApp, preguntas frecuentes) | `#/contacto` |
| Carrito y carrito lateral | `#/carrito` |
| Checkout en 3 pasos: entrega → tarjeta → pago simulado | `#/checkout` |
| Confirmación con folio y seguimiento | `#/pedido/:folio` |
| Mis pedidos / rastreo por folio · Favoritos | `#/mis-pedidos`, `#/favoritos` |
| Panel demostrativo (lo que guarda el backend) | `#/panel` |

## Backend (server.js)

Servidor HTTP de Node sin dependencias. Identifica a cada visitante con una cookie y guarda en
`data/db.json`:

- **Carrito** de la sesión (productos, complementos, cantidades y regalos personalizados).
- **Favoritos**.
- **Borrador del checkout**: lo que el usuario va escribiendo (destinatario, dirección, fecha, mensaje) se guarda automáticamente; si recarga la página, sigue ahí.
- **Pedidos** confirmados (folio, entrega, tarjeta, remitente, método de pago simulado y totales).
- **Mensajes** del formulario de contacto.

Para empezar de cero, detén el servidor y deja `data/db.json` como `{"sessions":{},"orders":[],"messages":[]}`.

## Personalizar

- **Productos, precios, categorías y ocasiones:** `data/catalog.js`.
- **Número de WhatsApp:** campo `whatsapp` al final de `data/catalog.js` (formato internacional, sin `+`).
- **Logotipo:** `public/img/logo.svg` es una recreación vectorial del sello. Si tienes el archivo original, reemplázalo (o cambia las rutas `/img/logo.svg` por tu PNG).
- **Colores y tipografías:** variables al inicio de `public/css/styles.css`.
- **Fotos de marca** (fachada, bolsa, caja, etiqueta, camioneta, tarjeta) recortadas del collage de identidad en `public/img/marca/`. Las demás fotos de producto se cargan desde Unsplash, así que necesitan conexión a internet.
