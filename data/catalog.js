// Catálogo demostrativo de Verano Rosa. Precios ilustrativos en MXN.
// Las fotos de marca vienen del collage de identidad; el resto son fotos de Unsplash (uso libre).
const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const M = name => `/img/marca/${name}.jpg`;

const IMG = {
  tulipanesRamo: U('1561181286-d3fee7d55364'),
  rosaFlorero: U('1518895949257-7621c3c786d7'),
  ramoBlancoRosa: U('1563241527-3004b7be0ffd'),
  corazonFlores: U('1526047932273-341f2a7631f9'),
  tulipanRosa: U('1520763185298-1b434c919102'),
  regaloRosa: U('1549465220-1a8b9238cd48'),
  regaloListon: U('1513201099705-a9746e1e201f'),
  chocolates: U('1481391319762-47dff72954d9'),
  globos: U('1530103862676-de8c9debad1d'),
  pastelVela: U('1527481138388-31827a7c94d5'),
  aretes: U('1535632066927-ab7c9ab60908'),
  collar: U('1599643478518-a784e5dc4c8f'),
  pulsera: U('1611591437281-460bfbe1220a'),
  joyeriaPlata: U('1606760227091-3dd870d97f1d'),
  peonias: U('1582794543139-8ac9cb0f7b11'),
  rosasRojasCampo: U('1494972308805-463bc619d34e'),
  ramoOscuro: U('1457089328109-e5d9bd499191'),
  tulipanTallo: U('1525310072745-f49212b5ac6d'),
  tulipanesBicolor: U('1468327768560-75b778cbb551'),
  rosaRoja: U('1496062031456-07b8f162a322'),
  rosasRojas: U('1519378058457-4c29a0a2efac'),
  ramoMano: U('1567696153798-9111f9cd3d0d'),
  regaloManos: U('1512909006721-3d6018887383'),
  pastel: U('1464349095431-e9a21285b5f3'),
  decoracion: U('1523438885200-e635ba2c371e'),
  peluche: U('1559454403-b8fb88521f11'),
  anillosFlores: U('1529634806980-85c3dd6d34ac'),
  ramoDurazno: U('1572454591674-2739f30d8c40'),
  monosDorados: U('1607344645866-009c320b63e0'),
  rosasBlancas: U('1525258946800-98cfd641d0de'),
  ramoRosaRojo: U('1521543832500-49e69fb2bea2'),
  rosaRoja2: U('1562690868-60bbe7293e94'),
  ramoColor: U('1533616688419-b7a585564566'),
  tarjeta: U('1515787366009-7cbdd2dc587b'),
  globosRosa: U('1525268771113-32d9e9021a97'),
  anillos: U('1606800052052-a08af7148866'),
};

const categories = [
  { slug: 'ramos', name: 'Ramos de flores', short: 'Ramos', icon: 'bouquet', image: M('ramo'), description: 'Ramos envueltos a mano con papel coreano y listón de satín.' },
  { slug: 'arreglos', name: 'Arreglos florales', short: 'Arreglos', icon: 'vase', image: IMG.ramoBlancoRosa, description: 'Composiciones en florero, caja o base para lucir en casa u oficina.' },
  { slug: 'rosas-tulipanes', name: 'Rosas y tulipanes', short: 'Rosas y tulipanes', icon: 'rose', image: IMG.tulipanesRamo, description: 'Los clásicos que nunca fallan, en docenas y combinaciones.' },
  { slug: 'cajas-regalo', name: 'Cajas de regalo', short: 'Cajas de regalo', icon: 'gift', image: M('caja'), description: 'Cajas con firma Verano Rosa listas para sorprender.' },
  { slug: 'flores-chocolates', name: 'Flores con chocolates', short: 'Con chocolates', icon: 'choco', image: M('peluche'), description: 'La combinación más dulce: flores frescas y chocolates finos.' },
  { slug: 'peluches-globos', name: 'Peluches y globos', short: 'Peluches y globos', icon: 'bear', image: IMG.peluche, description: 'Peluches suaves y globos metálicos para completar el detalle.' },
  { slug: 'tarjetas-detalles', name: 'Tarjetas y detalles personalizados', short: 'Tarjetas y detalles', icon: 'card', image: M('gracias'), description: 'Tarjetas, etiquetas y detalles con el nombre de quien quieres.' },
  { slug: 'joyeria', name: 'Joyería de fantasía', short: 'Joyería', icon: 'ring', image: IMG.collar, description: 'Accesorios delicados con baño dorado, ideales para regalar.' },
];

const occasions = [
  { slug: 'cumpleanos', name: 'Cumpleaños', image: IMG.pastelVela, tagline: 'Celebra un año más con color y alegría.' },
  { slug: 'aniversario', name: 'Aniversarios', image: IMG.anillosFlores, tagline: 'Para recordar por qué todo empezó.' },
  { slug: 'graduacion', name: 'Graduaciones', image: IMG.ramoMano, tagline: 'Un logro así merece flores.' },
  { slug: 'san-valentin', name: 'San Valentín', image: IMG.corazonFlores, tagline: 'Amor y amistad en cada pétalo.' },
  { slug: 'dia-de-las-madres', name: 'Día de las Madres', image: IMG.peonias, tagline: 'Para la mujer que lo merece todo.' },
];

// p(id, nombre, categoría, precio, precioAnterior, imagen, ocasiones, etiqueta, descripción, incluye)
const products = [];
function p(id, name, category, price, oldPrice, image, occ, badge, description, includes) {
  products.push({ id, name, category, price, oldPrice, image, occasions: occ, badge, description, includes, rating: +(4.5 + ((id.length * 7) % 5) / 10).toFixed(1) });
}

// Ramos de flores
p('ramo-verano-rosa', 'Ramo Verano Rosa', 'ramos', 899, null, M('ramo'), ['cumpleanos', 'aniversario', 'dia-de-las-madres'], 'Más vendido', 'Nuestro ramo insignia: rosas rosa palo, nube y follaje, envuelto en papel rosa empolvado con moño de satín.', ['12 rosas rosa palo', 'Nube (gypsophila)', 'Etiqueta Verano Rosa']);
p('ramo-amanecer', 'Ramo Amanecer', 'ramos', 749, 849, IMG.ramoDurazno, ['cumpleanos', 'graduacion'], 'Promo', 'Tonos durazno y rosa que recuerdan un amanecer de verano.', ['Rosas durazno', 'Clavel', 'Eucalipto']);
p('ramo-campestre', 'Ramo Campestre', 'ramos', 659, null, IMG.ramoColor, ['cumpleanos', 'graduacion'], 'Nuevo', 'Mezcla alegre de flores de temporada con un toque silvestre.', ['Flores de temporada', 'Papel kraft', 'Listón']);
p('ramo-dulce-encanto', 'Ramo Dulce Encanto', 'ramos', 1049, null, IMG.ramoRosaRojo, ['san-valentin', 'aniversario'], null, 'Rosas rosas y rojas con astromelias para decir lo que sientes.', ['18 flores mixtas', 'Follaje fino', 'Tarjeta']);

// Arreglos florales
p('arreglo-nube-rosa', 'Arreglo Nube Rosa', 'arreglos', 1190, null, IMG.ramoBlancoRosa, ['dia-de-las-madres', 'aniversario'], 'Más vendido', 'Arreglo en florero de cristal con rosas jardín, ranúnculos y nube.', ['Florero de cristal', 'Rosas jardín', 'Ranúnculos']);
p('arreglo-corazon', 'Arreglo Corazón en Flor', 'arreglos', 1390, 1590, IMG.corazonFlores, ['san-valentin', 'aniversario'], 'Promo', 'Corazón floral con rosas y claveles en tonos rosa y coral.', ['Base en forma de corazón', '30 flores aprox.']);
p('arreglo-elegancia-blanca', 'Elegancia Blanca', 'arreglos', 1290, null, IMG.rosasBlancas, ['aniversario', 'graduacion'], null, 'Rosas blancas y durazno, sobrio y sofisticado para cualquier espacio.', ['Rosas blancas', 'Rosas durazno', 'Base de cerámica']);
p('arreglo-jardin-secreto', 'Jardín Secreto', 'arreglos', 1590, null, IMG.ramoOscuro, ['cumpleanos', 'aniversario'], 'Nuevo', 'Arreglo de autor con flores en tonos profundos y follaje abundante.', ['Flores premium', 'Base de madera']);

// Rosas y tulipanes
p('docena-rosas-rosa', 'Docena de Rosas Rosa Palo', 'rosas-tulipanes', 690, null, IMG.rosaFlorero, ['san-valentin', 'cumpleanos'], null, '12 rosas rosa palo de tallo largo en envoltura Verano Rosa.', ['12 rosas', 'Envoltura premium']);
p('rosas-rojas-24', '24 Rosas Rojas Pasión', 'rosas-tulipanes', 1290, 1490, IMG.rosasRojas, ['san-valentin', 'aniversario'], 'Promo', 'Dos docenas de rosas rojas para un amor que no cabe en una.', ['24 rosas rojas', 'Follaje', 'Moño de satín']);
p('tulipanes-rosa', 'Tulipanes Rosa Empolvado', 'rosas-tulipanes', 990, null, IMG.tulipanesRamo, ['dia-de-las-madres', 'cumpleanos'], 'Más vendido', 'Ramo de 15 tulipanes rosa empolvado, frescos y elegantes.', ['15 tulipanes', 'Papel rosa']);
p('tulipanes-bicolor', 'Tulipanes Bicolor', 'rosas-tulipanes', 1090, null, IMG.tulipanesBicolor, ['graduacion', 'cumpleanos'], 'Nuevo', 'Tulipanes blanco con rojo, una edición especial de temporada.', ['15 tulipanes bicolor', 'Florero opcional']);

// Cajas de regalo
p('caja-firma', 'Caja Firma Verano Rosa', 'cajas-regalo', 1150, null, M('caja'), ['cumpleanos', 'aniversario', 'dia-de-las-madres'], 'Más vendido', 'Caja rosa con logo dorado, moño de satín y sorpresa floral en su interior.', ['Caja rígida', 'Rosas preservadas', 'Moño de satín']);
p('caja-mimos', 'Caja de Mimos', 'cajas-regalo', 890, 990, IMG.regaloRosa, ['cumpleanos', 'graduacion'], 'Promo', 'Caja fucsia con listón dorado: vela aromática, chocolates y mini flores.', ['Vela aromática', 'Chocolates', 'Mini ramo']);
p('caja-detalle-dorado', 'Detalle Dorado', 'cajas-regalo', 790, null, IMG.regaloListon, ['cumpleanos'], null, 'Caja kraft con listón rosa y tres sorpresas a elegir.', ['3 detalles sorpresa', 'Tarjeta']);
p('caja-celebra', 'Caja Celebra', 'cajas-regalo', 1290, null, IMG.regaloManos, ['graduacion', 'cumpleanos'], 'Nuevo', 'Caja grande para festejar en grande: flores, dulces y globo.', ['Flores', 'Dulces', 'Globo mini']);

// Flores con chocolates
p('rosas-ferrero', 'Rosas y Ferrero', 'flores-chocolates', 1190, null, M('peluche'), ['san-valentin', 'cumpleanos'], 'Más vendido', 'Caja con rosas rosas, chocolates Ferrero y un osito de peluche.', ['6 rosas', '6 Ferrero Rocher', 'Peluche']);
p('tulipanes-bombones', 'Tulipanes con Bombones', 'flores-chocolates', 1090, null, IMG.tulipanRosa, ['dia-de-las-madres'], null, 'Tulipanes rosa acompañados de una caja de bombones artesanales.', ['10 tulipanes', '12 bombones']);
p('caja-chocolates-flores', 'Caja Gourmet', 'flores-chocolates', 990, 1150, IMG.chocolates, ['aniversario', 'cumpleanos'], 'Promo', 'Chocolates rellenos de autor con mini arreglo floral.', ['16 chocolates', 'Mini arreglo']);
p('rosa-unica-chocolate', 'Rosa Única y Chocolate', 'flores-chocolates', 390, null, IMG.rosaRoja2, ['san-valentin'], null, 'Una rosa roja premium con tableta de chocolate. Pequeño pero inolvidable.', ['1 rosa', '1 tableta']);

// Peluches y globos
p('oso-vainilla', 'Oso Vainilla', 'peluches-globos', 549, null, IMG.peluche, ['cumpleanos', 'san-valentin'], 'Más vendido', 'Oso de peluche color vainilla de 40 cm, suave y abrazable.', ['Peluche 40 cm', 'Moño rosa']);
p('globos-rosa', 'Bouquet de Globos Rosa', 'peluches-globos', 459, null, IMG.globosRosa, ['cumpleanos', 'graduacion'], null, 'Cinco globos metálicos y de látex en tonos rosa y perla.', ['5 globos', 'Peso decorativo']);
p('globos-fiesta', 'Globos Fiesta', 'peluches-globos', 499, 590, IMG.globos, ['cumpleanos', 'graduacion'], 'Promo', 'Globos metálicos multicolor para una celebración inolvidable.', ['8 globos', 'Listones']);
p('oso-rosas', 'Oso con Rosas', 'peluches-globos', 999, null, M('peluche'), ['san-valentin', 'aniversario'], null, 'Peluche con caja de rosas y chocolates; el combo favorito.', ['Peluche', 'Rosas', 'Chocolates']);

// Tarjetas y detalles personalizados
p('tarjeta-gracias', 'Tarjeta "Gracias"', 'tarjetas-detalles', 89, null, M('gracias'), ['graduacion', 'cumpleanos'], null, 'Tarjeta impresa con flores rosas y tu mensaje escrito a mano.', ['Tarjeta 12×12 cm', 'Sobre']);
p('etiqueta-nombre', 'Etiqueta con Nombre', 'tarjetas-detalles', 69, null, M('etiqueta'), ['cumpleanos', 'dia-de-las-madres'], 'Nuevo', 'Etiqueta circular con el nombre de quien recibe, para colgar en tu regalo.', ['Etiqueta personalizada', 'Cordón dorado']);
p('bolsa-regalo', 'Bolsa de Regalo Verano Rosa', 'tarjetas-detalles', 129, null, M('bolsa'), ['cumpleanos', 'graduacion'], null, 'Bolsa de papel con papel china rosa, lista para tu detalle.', ['Bolsa mediana', 'Papel china']);
p('carta-escrita', 'Carta Escrita a Mano', 'tarjetas-detalles', 149, null, IMG.tarjeta, ['aniversario', 'san-valentin'], null, 'Escribimos tu carta con caligrafía en papel algodón.', ['Hasta 150 palabras', 'Sobre lacrado']);

// Joyería de fantasía
p('collar-gota', 'Collar Gota Dorada', 'joyeria', 459, null, IMG.collar, ['cumpleanos', 'graduacion'], 'Más vendido', 'Collar con dije de gota y baño de oro de 18k.', ['Cadena 45 cm', 'Estuche']);
p('pulsera-eslabones', 'Pulsera Eslabones', 'joyeria', 389, 459, IMG.pulsera, ['dia-de-las-madres', 'aniversario'], 'Promo', 'Pulsera de eslabones finos con acabado dorado brillante.', ['Ajustable', 'Estuche']);
p('aretes-zafiro', 'Aretes Zafiro', 'joyeria', 429, null, IMG.aretes, ['aniversario'], null, 'Aretes con cristal azul y zirconias, estilo vintage.', ['Par de aretes', 'Estuche']);
p('anillos-duo', 'Dúo de Anillos', 'joyeria', 499, null, IMG.anillos, ['aniversario', 'san-valentin'], 'Nuevo', 'Par de anillos dorados para compartir con alguien especial.', ['2 anillos', 'Estuche']);
p('set-plata', 'Set Plateado', 'joyeria', 590, null, IMG.joyeriaPlata, ['cumpleanos', 'graduacion'], null, 'Set de collar, pulsera y aretes con acabado plateado.', ['3 piezas', 'Estuche']);

// Regalos personalizados y especiales (fotos propias del proyecto)
const P = name => `/img/productos/${name}.jpg`;
p('cuadro-lego-calendario', 'Cuadro LEGO con Calendario', 'tarjetas-detalles', 1290, null, P('cuadro-lego-calendario'), ['aniversario', 'san-valentin'], 'Nuevo', 'Cuadro de sombra con figuras tipo LEGO personalizadas, calendario con la fecha especial marcada con un corazón y tres fotos de su historia.', ['Marco blanco 23×30 cm', 'Figuras personalizadas', 'Calendario con fecha', '3 fotos impresas']);
p('cuadro-lego-punto-x', 'Cuadro LEGO "Punto X"', 'tarjetas-detalles', 990, null, P('cuadro-lego-punto-x'), ['aniversario', 'san-valentin'], null, 'Diseño minimalista con dos figuras personalizadas, sus nombres y la fecha en que todo comenzó.', ['Marco blanco', '2 figuras personalizadas', 'Fecha y frase']);
p('cuadro-collage', 'Cuadro Collage de Recuerdos', 'tarjetas-detalles', 690, null, P('cuadro-collage'), ['aniversario', 'san-valentin', 'cumpleanos'], null, 'Collage impreso con 4 de tus fotos favoritas y una dedicatoria en letra caligráfica, enmarcado y listo para regalar.', ['Marco negro 30×40 cm', '4 fotos', 'Frase personalizada']);
p('relicario-corazon', 'Relicario Corazón con Foto', 'joyeria', 549, null, P('relicario-corazon'), ['aniversario', 'san-valentin', 'dia-de-las-madres'], 'Más vendido', 'Collar con dije de corazón que se abre para guardar dos fotos. Acabado dorado y cadena fina.', ['Dije de corazón', '2 fotos impresas', 'Cadena 45 cm', 'Estuche']);
p('caja-kinder', 'Caja Kinder Sorpresa', 'cajas-regalo', 490, null, P('caja-kinder'), ['cumpleanos', 'san-valentin'], null, 'Caja kraft con ventana y moño de satín blanco, llena de chocolates Kinder surtidos.', ['Kinder Bueno', 'Kinder Sorpresa', 'Kinder Delice y Country', 'Moño de satín']);
p('corazon-dulce', 'Corazón Dulce con Cartas', 'cajas-regalo', 890, null, P('corazon-dulce'), ['san-valentin', 'aniversario'], null, 'Caja roja en forma de corazón con chocolates, notas de amor escritas a mano y una foto impresa.', ['Caja corazón', 'Chocolates surtidos', 'Notas escritas', 'Foto impresa']);
p('caja-corazon-spa', 'Caja Corazón Flores & Spa', 'cajas-regalo', 1690, 1890, P('caja-corazon-spa'), ['cumpleanos', 'dia-de-las-madres'], 'Promo', 'Caja corazón rosa con rosas y margaritas, más un kit de cuidado personal: taza, vela, diadema, mascarilla y rodillo facial.', ['Rosas y margaritas', 'Taza y vela aromática', 'Diadema de orejitas', 'Mascarilla y rodillo']);
p('box-globo-burbuja', 'Box Aniversario con Globo Burbuja', 'peluches-globos', 1890, null, P('box-globo-burbuja'), ['aniversario', 'cumpleanos'], 'Nuevo', 'Sombrerera con flores rosas, oso de peluche, fresas, galletas y globo burbuja con el nombre de quien recibe.', ['Flores rosas', 'Oso de peluche', 'Fresas y galletas', 'Globo burbuja personalizado']);
p('ramo-chocolates', 'Ramo de Chocolates', 'flores-chocolates', 1290, null, P('ramo-chocolates'), ['cumpleanos', 'san-valentin'], 'Más vendido', 'Ramo envuelto en papel rosa hecho solo de chocolates: Kinder, Ferrero Rocher y Raffaello, con tarjeta.', ['Kinder surtidos', 'Ferrero Rocher', 'Raffaello', 'Tarjeta']);
p('arreglo-globo-corazon', 'Arreglo "Feliz Cumple" con Globo', 'arreglos', 1190, null, P('arreglo-globo-corazon'), ['cumpleanos', 'dia-de-las-madres'], null, 'Arreglo en caja cilíndrica rosa con rosas, gerberas, margaritas y alstroemerias, coronado con globo de corazón personalizado.', ['Flores mixtas', 'Caja rosa', 'Globo corazón con tu mensaje']);

const addons = [
  { id: 'tarjeta-premium', name: 'Tarjeta premium', price: 59 },
  { id: 'chocolates', name: 'Chocolates Ferrero (x8)', price: 189 },
  { id: 'globo', name: 'Globo metálico', price: 129 },
  { id: 'peluche-mini', name: 'Peluche mini', price: 199 },
  { id: 'florero', name: 'Florero de cristal', price: 179 },
];

const custom = {
  bases: [
    { id: 'ramo', name: 'Ramo', price: 380, image: M('ramo') },
    { id: 'caja', name: 'Caja', price: 480, image: M('caja') },
    { id: 'florero', name: 'Florero', price: 520, image: IMG.ramoBlancoRosa },
    { id: 'canasta', name: 'Canasta', price: 560, image: M('peluche') },
  ],
  flowers: [
    { id: 'rosas', name: 'Rosas', price: 320 },
    { id: 'tulipanes', name: 'Tulipanes', price: 420 },
    { id: 'peonias', name: 'Peonías', price: 560 },
    { id: 'mixto', name: 'Flores mixtas', price: 260 },
  ],
  colors: [
    { id: 'rosa-palo', name: 'Rosa palo', hex: '#efc6cf' },
    { id: 'rosa-empolvado', name: 'Rosa empolvado', hex: '#d99aa8' },
    { id: 'blanco', name: 'Blanco perla', hex: '#faf6f2' },
    { id: 'rojo', name: 'Rojo pasión', hex: '#b3263e' },
    { id: 'durazno', name: 'Durazno', hex: '#f4b99a' },
  ],
  sizes: [
    { id: 'chico', name: 'Chico', factor: 1 },
    { id: 'mediano', name: 'Mediano', factor: 1.35 },
    { id: 'grande', name: 'Grande', factor: 1.8 },
  ],
};

const promos = [
  { title: 'Envío gratis', text: 'En compras desde $1,499', code: null },
  { title: 'Entrega el mismo día', text: 'Pedidos antes de las 3:00 pm', code: null },
  { title: 'Martes de tulipanes', text: '2×1 en tulipanes seleccionados', code: null },
];

module.exports = { categories, occasions, products, addons, custom, promos, hero: { image: U('1582794543139-8ac9cb0f7b11', 1800), alt: U('1563241527-3004b7be0ffd', 1400), store: M('tienda'), van: M('camioneta'), bag: M('bolsa'), tag: M('etiqueta') }, whatsapp: '5215512345678' };
