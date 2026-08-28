/** Datos de Europa 2026, extraídos del index.html original sin modificar.
 *  Son el contenido curado del viaje: beneficios, catálogo de ciudades, side quests,
 *  valija e itinerario. Solo este viaje los usa. */
import type { Benefit, CatalogCity, Fact, SideQuest, LuggageItem, RouteStop, TravelProfile } from '../types';

export const EUROPEAN_BENEFITS: Benefit[] = [
  {
    "id": "veranoJoven",
    "title": "1. El programa estatal \"Verano Joven\"",
    "sub": "Ahorro: Hasta 90% en transporte español",
    "desc": "Este beneficio es, por lejos, el más agresivo y el que más dinero neto te va a salvar durante tus 90 días, ya que coincide exactamente con tus fechas de viaje (julio-septiembre). Es una subvención directa del Ministerio de Transportes de España para jóvenes de hasta 30 años con nacionalidad española.",
    "bullets": [
      "<strong>90% de descuento</strong> en trenes de Media Distancia tradicional y en colectivos de líneas estatales que conectan distintas provincias.",
      "<strong>50% de descuento</strong> en trenes de alta velocidad (AVE, Avlo, Ouigo e Iryo) para moverte rápido (con un tope de €30 por tramo).",
      "<strong>50% de descuento</strong> en el Pase Global de Interrail (para recorrer el resto de Europa en tren) si lo comprás a través de la web oficial de Renfe."
    ],
    "howToUse": "Te registrás online en la web del Ministerio de Transportes con tus datos europeos para obtener tu código personal e intransferible.",
    "saving": 215,
    "cost": 0,
    "icon": "fa-train-subway",
    "color": "from-blue-600 to-sky-500",
    "badgeText": "Hasta 90% Descuento"
  },
  {
    "id": "tse",
    "title": "2. Tarjeta Sanitaria Europea / CPS",
    "sub": "Ahorro: ~USD 200 + costos médicos ilimitados",
    "desc": "Acceso al sistema de salud pública en los 27 países de la UE, más Islandia, Liechtenstein, Noruega y Suiza.",
    "bullets": [
      "<strong>100% de ahorro</strong> directo en la contratación de un seguro de asistencia al viajero internacional privado por los 3 meses.",
      "Si tenés una urgencia médica en París, Roma o Berlín, vas a un hospital público y te atienden gratis o pagando el copago mínimo local (ej. €10), sin facturas de miles de euros."
    ],
    "howToUse": "Se tramita de forma digital o en las oficinas del INSS en España pidiendo el Certificado Provisional Sustitutorio (CPS) por 90 días.",
    "saving": 200,
    "cost": 0,
    "icon": "fa-file-shield",
    "color": "from-emerald-600 to-teal-500",
    "badgeText": "100% Gratis"
  },
  {
    "id": "museos",
    "title": "3. Entrada Gratis a Museos Nacionales y Monumentos",
    "sub": "Ahorro: ~€300 en cultura del más alto nivel",
    "desc": "En Europa, la cultura está totalmente financiada para los jóvenes comunitarios menores de 25 o 26 años.",
    "bullets": [
      "<strong>París:</strong> Museo del Louvre (ahorrás €22), Palacio de Versalles (€21) y Museo de Orsay (€16) son 100% gratuitos.",
      "<strong>Madrid:</strong> El Museo del Prado y el Museo Nacional Centro de Arte Reina Sofía gratis.",
      "<strong>Roma:</strong> El Coliseo, Foro Romano y Palatino pasan de costar €18 a una tarifa simbólica de €2 (tarifa superreducida UE)."
    ],
    "howToUse": "Al reservar el ticket online en las páginas oficiales de cada museo, seleccionás la opción 'Joven UE 18-25 años (€0)'. En el ingreso mostrás el QR y tu pasaporte español físico.",
    "saving": 300,
    "cost": 0,
    "icon": "fa-building-columns",
    "color": "from-amber-600 to-yellow-500",
    "badgeText": "Acceso €0"
  },
  {
    "id": "abonoMadrid",
    "title": "4. Abono de Transporte Joven de Madrid",
    "sub": "Ahorro: Tarifa plana mensual de movilidad total",
    "desc": "Subsidio de transporte para la Comunidad de Madrid. Ideal para usar Madrid como base operativa sin gastar de más.",
    "bullets": [
      "<strong>Viajes ilimitados</strong> en el Metro de Madrid, colectivos urbanos e interurbanos y trenes de Cercanías por una tarifa plana de solo €10 al mes (según subvenciones locales vigentes).",
      "Un pase mensual normal para adultos supera los €50, lo que te permite ahorrar montos masivos mientras estás con tu madrina."
    ],
    "howToUse": "Lo gestionás digitalmente o en los centros de transporte públicos de Madrid con tu pasaporte español.",
    "saving": 120,
    "cost": 10,
    "icon": "fa-bus",
    "color": "from-rose-600 to-pink-500",
    "badgeText": "Tarifa Plana Joven"
  },
  {
    "id": "eyca",
    "title": "5. Carné Joven Europeo - EYCA",
    "sub": "Ahorro: 10% a 20% en comercios privados y traslados",
    "desc": "Una acreditación unificada para jóvenes europeos válida en más de 36 países de todo el continente.",
    "bullets": [
      "<strong>10% a 15% de descuento</strong> en pasajes de micros de larga distancia como FlixBus o Alsa.",
      "Descuentos en cadenas internacionales de hostels (como Generator Hostels), rebajas en pases de co-working diarios.",
      "Suscripción de Apple Music por €1,99 y pases reducidos en gimnasios y centros deportivos municipales de Europa para mantener tu rutina."
    ],
    "howToUse": "Se saca online de forma digital por unos pocos euros en la web de juventud de la Comunidad de Madrid apenas llegás.",
    "saving": 80,
    "cost": 4,
    "icon": "fa-id-card",
    "color": "from-violet-600 to-indigo-500",
    "badgeText": "Válido en 36 Países"
  }
];

export const BASE_CATALOG_CITIES: CatalogCity[] = [
  {
    "id": "city-madrid",
    "name": "Madrid (España)",
    "category": "Hub / Familiar",
    "costLvl": "Bajo",
    "minDays": 3,
    "maxDays": 7,
    "dynamic": "Familia",
    "hack": "Alojamiento gratis. Abono de transporte por €10 al mes y salud de la UE",
    "budget": 15,
    "core": "Negocios/Tech",
    "activities": [
      "Co-working",
      "Trámites de ciudadanía",
      "Tapeo con familia",
      "Tranquilidad"
    ]
  },
  {
    "id": "city-barcelona",
    "name": "Barcelona (España)",
    "category": "Hub / Familiar",
    "costLvl": "Alto",
    "minDays": 4,
    "maxDays": 6,
    "dynamic": "Solo / Amigos",
    "hack": "Descuento EYCA en hostels Generator y pases de co-working diarios",
    "budget": 55,
    "core": "Negocios/Tech",
    "activities": [
      "Running frente al mar",
      "Eventos IA",
      "Aticco Co-working",
      "Playa"
    ]
  },
  {
    "id": "city-milan",
    "name": "Milán (Italia)",
    "category": "Premium & Networking",
    "costLvl": "Medio",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Solo / Amigos",
    "hack": "Tarifas FrecciaYOUNG (€19-€39) y 30% desc. en bicis Dott vía Tarjeta EYCA",
    "budget": 52,
    "core": "Negocios/Tech",
    "activities": [
      "Co-workings de referencia",
      "Running Navigli / Parco Sempione",
      "Hub Milano Centrale"
    ]
  },
  {
    "id": "city-frankfurt",
    "name": "Fráncfort (Alemania)",
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "minDays": 3,
    "maxDays": 4,
    "dynamic": "Solo",
    "hack": "Deutschland-Ticket por €63 al mes y roaming Basic-Fit Premium Flex gratis",
    "budget": 58,
    "core": "Negocios/Tech",
    "activities": [
      "Startups fintech",
      "Co-working eSIM EYCA (20% off)",
      "Ciclismo río Meno"
    ]
  },
  {
    "id": "city-viena",
    "name": "Viena (Austria)",
    "category": "Premium & Networking",
    "costLvl": "Medio",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Dani / Familia",
    "hack": "Descuento joven transfronterizo EYCA/ISIC y cobertura médica gratis con CPS/TSE",
    "budget": 48,
    "core": "Paisaje",
    "activities": [
      "Running Palacio Schönbrunn",
      "Conexión Praga/Budapest",
      "Cafés y co-working"
    ]
  },
  {
    "id": "city-luxemburgo",
    "name": "Luxemburgo",
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "minDays": 2,
    "maxDays": 3,
    "dynamic": "Solo / Amigos",
    "hack": "100% de transporte público gratis sin billete y carné EYCA digital a €10",
    "budget": 42,
    "core": "Negocios/Tech",
    "activities": [
      "Albergues deportivos",
      "Basic-Fit libre de origen",
      "Networking corporativo"
    ]
  },
  {
    "id": "city-ljubljana",
    "name": "Liubliana (Eslovenia)",
    "category": "Caja de Ahorro",
    "costLvl": "Bajo",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Solo / Amigos",
    "hack": "Crédito €10 Avant2Go (carsharing) y 10% desc. en transfers GoOpti",
    "budget": 34,
    "core": "Deporte",
    "activities": [
      "Running Parque Tivoli",
      "Almuerzos menú EYCA baratos",
      "Descuentos museo 25%"
    ]
  },
  {
    "id": "city-innsbruck",
    "name": "Innsbruck (Austria)",
    "category": "Aventura y Naturaleza",
    "costLvl": "Medio",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Dani",
    "hack": "TSE activa para emergencias de montaña",
    "budget": 50,
    "core": "Deporte",
    "activities": [
      "Trekking alpino",
      "Ciclismo extremo",
      "Nordkette cable car",
      "Paisaje"
    ]
  },
  {
    "id": "city-interlaken",
    "name": "Interlaken / Zermatt (Suiza)",
    "category": "Aventura y Naturaleza",
    "costLvl": "Crítico",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Solo / Amigos",
    "hack": "⚠️ No UE: Salud (TSE) ni pases Interrail completos no cubren todo",
    "budget": 110,
    "core": "Paisaje",
    "activities": [
      "Parapente",
      "Senderismo Cervino",
      "Tren cremallera",
      "Deporte extremo"
    ]
  },
  {
    "id": "city-munich",
    "name": "Múnich / Garmisch (Alemania)",
    "category": "Aventura y Naturaleza",
    "costLvl": "Alto",
    "minDays": 4,
    "maxDays": 6,
    "dynamic": "Dani",
    "hack": "Deutschlandticket regional cubre conectividad total gratis",
    "budget": 65,
    "core": "Deporte",
    "activities": [
      "Lagos alpinos (Eibsee)",
      "Trekking Zugspitze",
      "Biergartens",
      "Auto alquilado"
    ]
  },
  {
    "id": "city-praga",
    "name": "Praga (República Checa)",
    "category": "Caja de Ahorro",
    "costLvl": "Bajo",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Amigos",
    "hack": "Costo de comida/bebida más bajo de la UE",
    "budget": 30,
    "core": "Paisaje",
    "activities": [
      "Castillo de Praga",
      "Bares medievales",
      "Puente Carlos",
      "Cerveza barata"
    ]
  },
  {
    "id": "city-berlin",
    "name": "Berlín (Alemania)",
    "category": "Caja de Ahorro",
    "costLvl": "Medio",
    "minDays": 4,
    "maxDays": 7,
    "dynamic": "Solo / Dani",
    "hack": "Descuento estudiantil/joven en pases y museos",
    "budget": 45,
    "core": "Negocios/Tech",
    "activities": [
      "Visitar Startups",
      "Tecnología de automatización",
      "Techno Clubs",
      "Muro de Berlín"
    ]
  },
  {
    "id": "city-budapest",
    "name": "Budapest (Hungría)",
    "category": "Caja de Ahorro",
    "costLvl": "Bajo",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Amigos",
    "hack": "Tarifas de estudiante en termas históricas y boliches",
    "budget": 28,
    "core": "Joda",
    "activities": [
      "Termas Széchenyi",
      "Ruin Bars (Szimpla)",
      "Crucero nocturno",
      "Parlamento"
    ]
  },
  {
    "id": "city-amsterdam",
    "name": "Ámsterdam (Países Bajos)",
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Solo",
    "hack": "EYCA para descuentos en canales y pases de museos",
    "budget": 80,
    "core": "Negocios/Tech",
    "activities": [
      "Ciclismo",
      "Networking IA",
      "Canales",
      "Museo Van Gogh"
    ]
  },
  {
    "id": "city-roma",
    "name": "Roma / Florencia (Italia)",
    "category": "Premium & Networking",
    "costLvl": "Medio",
    "minDays": 4,
    "maxDays": 7,
    "dynamic": "Solo / Amigos",
    "hack": "Coliseo y Foro Romano a solo €2 por ser Joven UE",
    "budget": 48,
    "core": "Paisaje",
    "activities": [
      "Coliseo",
      "Vaticano",
      "Pasta en Trastevere",
      "Galería Uffizi"
    ]
  },
  {
    "id": "city-paris",
    "name": "París (Francia)",
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "minDays": 4,
    "maxDays": 6,
    "dynamic": "Solo / Familia",
    "hack": "Louvre, Orsay y Versalles gratis mostrando Pasaporte Español (Ahorras €60+)",
    "budget": 75,
    "core": "Paisaje",
    "activities": [
      "Pícnic Torre Eiffel",
      "Museo del Louvre €0",
      "Montmartre",
      "Palacio de Versalles €0"
    ]
  },
  {
    "id": "city-napoles",
    "name": "Nápoles / Costa Amalfitana (Italia)",
    "category": "Aventura y Naturaleza",
    "costLvl": "Medio",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Solo / Amigos",
    "hack": "Pompeya y museos a tarifa reducida UE; ferry barato a Capri y Procida",
    "budget": 42,
    "core": "Paisaje",
    "activities": [
      "Pizza napolitana",
      "Ruinas de Pompeya",
      "Ferry a Capri",
      "Costa Amalfitana"
    ]
  },
  {
    "id": "city-londres",
    "name": "Londres (Reino Unido) 🇬🇧",
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Solo",
    "hack": "British Museum, Tate Modern y National Gallery son gratis. Oyster card / contactless para transporte.",
    "budget": 75,
    "core": "Paisaje",
    "activities": [
      "British Museum €0",
      "Camden Market",
      "Torre de Londres",
      "West End / Soho"
    ]
  },
  {
    "id": "city-cinqueterre",
    "name": "Cinque Terre (Italia)",
    "category": "Aventura y Naturaleza",
    "costLvl": "Medio",
    "minDays": 2,
    "maxDays": 4,
    "dynamic": "Solo / Amigos",
    "hack": "Cinque Terre Card joven; trenes regionales ilimitados entre los 5 pueblos",
    "budget": 50,
    "core": "Deporte",
    "activities": [
      "Trekking Sentiero Azzurro",
      "Pueblos costeros",
      "Snorkel",
      "Focaccia"
    ]
  },
  {
    "id": "city-venecia",
    "name": "Venecia (Italia)",
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "minDays": 2,
    "maxDays": 4,
    "dynamic": "Solo / Familia",
    "hack": "Museos cívicos y vaporetto con tarifa joven; Bienal de Arte",
    "budget": 70,
    "core": "Paisaje",
    "activities": [
      "Góndola / vaporetto",
      "Plaza San Marcos",
      "Murano y Burano",
      "Bienal"
    ]
  },
  {
    "id": "city-niza",
    "name": "Niza / Costa Azul (Francia)",
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "minDays": 2,
    "maxDays": 4,
    "dynamic": "Solo / Amigos",
    "hack": "Tren de la costa (€) hasta Mónaco y Cannes; descuentos EYCA",
    "budget": 65,
    "core": "Joda",
    "activities": [
      "Playas",
      "Mónaco day-trip",
      "Paseo de los Ingleses",
      "Bares"
    ]
  },
  {
    "id": "city-lisboa",
    "name": "Lisboa (Portugal)",
    "category": "Caja de Ahorro",
    "costLvl": "Medio",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Solo / Amigos",
    "hack": "Miradouros gratis, tranvía 28 y hostels Generator con EYCA; surf en Cascais",
    "budget": 40,
    "core": "Negocios/Tech",
    "activities": [
      "Tranvía 28",
      "Belém y pastéis",
      "Surf Cascais",
      "Hub de startups"
    ]
  },
  {
    "id": "city-oporto",
    "name": "Oporto (Portugal)",
    "category": "Caja de Ahorro",
    "costLvl": "Bajo",
    "minDays": 2,
    "maxDays": 4,
    "dynamic": "Amigos",
    "hack": "De lo más barato de Europa Occidental; cata de vino de Oporto joven",
    "budget": 30,
    "core": "Paisaje",
    "activities": [
      "Ribeira",
      "Cata de Oporto",
      "Livraria Lello",
      "Puente Don Luis I"
    ]
  },
  {
    "id": "city-split",
    "name": "Split / Dalmacia (Croacia)",
    "category": "Aventura y Naturaleza",
    "costLvl": "Medio",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Amigos",
    "hack": "Croacia es UE: islas en ferry (Hvar, Brač) y hostels económicos",
    "budget": 45,
    "core": "Joda",
    "activities": [
      "Palacio de Diocleciano",
      "Islas en ferry",
      "Playas",
      "Fiesta en Hvar"
    ]
  },
  {
    "id": "city-atenas",
    "name": "Atenas (Grecia)",
    "category": "Caja de Ahorro",
    "costLvl": "Medio",
    "minDays": 3,
    "maxDays": 5,
    "dynamic": "Solo / Amigos",
    "hack": "Acrópolis y sitios GRATIS para jóvenes UE menores de 25; islas cercanas en ferry",
    "budget": 42,
    "core": "Paisaje",
    "activities": [
      "Acrópolis €0",
      "Plaka",
      "Day-trip a islas",
      "Gyros baratos"
    ]
  },
  {
    "id": "city-cracovia",
    "name": "Cracovia (Polonia)",
    "category": "Caja de Ahorro",
    "costLvl": "Bajo",
    "minDays": 2,
    "maxDays": 4,
    "dynamic": "Amigos",
    "hack": "De lo más económico de la UE; casco medieval y EYCA en museos",
    "budget": 28,
    "core": "Joda",
    "activities": [
      "Plaza Rynek",
      "Mina de sal Wieliczka",
      "Barrio Kazimierz",
      "Vodka bars"
    ]
  },
  {
    "id": "city-copenhague",
    "name": "Copenhague (Dinamarca)",
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "minDays": 2,
    "maxDays": 4,
    "dynamic": "Solo",
    "hack": "Cara pero todo en bici; cultura de diseño y escena tech nórdica",
    "budget": 80,
    "core": "Negocios/Tech",
    "activities": [
      "Nyhavn",
      "Bici por la ciudad",
      "Christiania",
      "Diseño nórdico"
    ]
  }
];

export const PREDEFINED_FACTS: Fact[] = [
  {
    "id": "predefined-interrail",
    "halfPriceWith": "veranoJoven",
    "fullPrice": 429,
    "title": "Trenes: Pase de Interrail Global Pass (Youth)",
    "cost": 429,
    "saving": 0,
    "category": "Transporte",
    "desc": "Al ser ciudadano de la UE y menor de 27 años, tenés derecho a tarifa Youth. Un pase flexible de 15 días en un período de 2 meses te cuesta €429 de forma base. <em>(Si activás el beneficio Verano Joven en su pestaña, el costo de este pase se reducirá a la mitad: €214.50)</em>.",
    "tip": "Viajá de forma espontánea a tu propio ritmo para evitar el estrés y no planificar de más ('no over-travel').",
    "isPredefined": true
  },
  {
    "id": "predefined-deutschlandticket",
    "title": "Transporte: Deutschlandticket (Alemania) 🇩🇪",
    "cost": 49,
    "saving": 120,
    "category": "Transporte",
    "desc": "Suscripción mensual de tarifa plana de transporte que te permite viajar de forma ilimitada en todos los trenes regionales, metros y colectivos de Alemania por solo €49.",
    "tip": "Es ideal para recorrer el país con Dani sin consumir tus valiosos días de viaje del pase Interrail global. Recordá cancelarlo online antes del 10 del mes de uso para evitar la renovación automática.",
    "isPredefined": true
  },
  {
    "id": "predefined-esim",
    "title": "Conectividad: eSIM Vodafone España 🇪🇸 (3 meses)",
    "cost": 45,
    "saving": 165,
    "category": "Tecnología",
    "desc": "eSIM prepaga Vodafone España plan 15€/mes × 3 recargas = €45 totales. Roaming UE gratuito por ley en Alemania, Italia, Holanda y Bélgica. Alternativa a plataformas internacionales como HolaFly que cobran ~€210.",
    "tip": "Renovar el plan los días 28 y 56 desde la app 'Mi Vodafone' con tarjeta internacional. No hace falta estar en España para renovar.",
    "isPredefined": true
  }
];

export const DEFAULT_SIDE_QUESTS: SideQuest[] = [
  {
    "id": "quest-formentera",
    "title": "Formentera 🏝️ — Ses Illetes & Faro",
    "totalCost": 85,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "ferry": 40,
      "transport": 30,
      "food": 15
    },
    "itinerary": [
      {
        "day": "09:00",
        "title": "Ferry desde Ibiza Ciudad",
        "desc": "Aquabus o Balearia desde el puerto. 30-40 min de viaje. Vayan desayunados o con mates para disfrutar la cubierta."
      },
      {
        "day": "09:45",
        "title": "La Savina — Alquiler de Motos",
        "desc": "Apenas bajan, ignoren los taxis. Ir directo a alquilar motos de 125cc (carnet de auto +3 años) o bicis. La isla es chica y plana, se recorre al toque."
      },
      {
        "day": "10:30",
        "title": "⭐ Playa de Ses Illetes",
        "desc": "Parque Natural de las Salinas. Lengua de arena blanca finísima con agua turquesa que parece una pileta artificial. Hack gasolero: traigan viandas, lona y cervezas heladas — los beach clubs cobran €80 por un pescado."
      },
      {
        "day": "14:30",
        "title": "Es Pujols — Almuerzo y Helado",
        "desc": "La zona con más onda joven de la isla. Pizza al paso o paninis económicos, y un helado paseando por el paseo marítimo."
      },
      {
        "day": "16:00",
        "title": "Faro de Cap de Barbaria 📸",
        "desc": "Paisaje desértico con acantilados brutales mirando al mar. Al lado del faro: Cova Foradada, un agujero en el piso que sale a una cueva natural colgada sobre el mar. Fotos épicas con los pibes."
      },
      {
        "day": "19:30",
        "title": "Atardecer — Cala Saona o Beso Beach",
        "desc": "Plan tranqui: Cala Saona entre acantilados rojizos (el sol pinta todo de naranja). Plan fiesta: Beso Beach con DJ en vivo y movida joven (los tragos son caros pero el ambiente vale)."
      },
      {
        "day": "21:30",
        "title": "Ferry de regreso a Ibiza",
        "desc": "Devuelven las motos en el puerto de La Savina y se suben al ferry. Llegan a la isla grande bañados por el sol, listos para cenar algo por San José."
      }
    ],
    "hacks": [
      "Aquabus y Balearia son las más económicas. Ferry rápido ida y vuelta: ~€40. Compren en la web con anticipación — el lunes hay más disponibilidad.",
      "Motos de 125cc requieren carnet de auto con 3+ años de antigüedad o carnet de moto. Si no cumplen, alquilen bicis — la isla es plana y perfecta para pedalear.",
      "Hack gasolero: compren viandas, papas fritas y cervezas heladas en un super de Ibiza antes de subir al ferry. Los beach clubs de Ses Illetes son ridículamente caros.",
      "Vayan el lunes: los fines de semana los ferrys van colapsados de turistas de tres días. El lunes la isla respira y el alquiler de motos en La Savina es más ágil.",
      "La Cova Foradada está al lado del Faro de Cap de Barbaria — hay un agujero en el piso, se meten agachados y salen a una cueva colgada sobre el mar con una vista increíble."
    ],
    "isDefault": true
  },
  {
    "id": "quest-berlin-jul9",
    "title": "Berlín 🏛️ — Jueves 9 jul: Mirador, Muro, Mitte histórica & Kreuzberg",
    "dateLabel": "Jue 9 Jul",
    "totalCost": 32,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "transport": 10,
      "tickets": 4,
      "food": 18
    },
    "itinerary": [
      {
        "day": "08:15",
        "title": "🏠 Salida del hostel (a&o Berlin Friedrichshain)",
        "desc": "Hoy arrancás lejos a propósito: el mirador es el punto más alejado del hostel de todo el día, así que conviene despacharlo primero e ir acercándote de vuelta hacia Kreuzberg, donde termina la noche a 15-20 min de tu cama. ~35-40 min en transporte hasta el mirador (U-Bahn/S-Bahn + caminata).",
        "place": "Boxhagener Str. 73, 10245 Berlin",
        "lat": 52.5121,
        "lng": 13.4536
      },
      {
        "day": "09:00",
        "title": "⭐ Mirador Columna de la Victoria (Siegessäule)",
        "desc": "285 escalones sin ascensor hasta la plataforma: la mejor vista panorámica de Berlín, Tiergarten, Reichstag y la Puerta de Brandeburgo a lo lejos. Entrada ~€4, solo efectivo.",
        "place": "Siegessäule, Großer Stern, Berlin",
        "lat": 52.5145,
        "lng": 13.3501
      },
      {
        "day": "10:15",
        "title": "Traslado a Bernauer Straße",
        "desc": "U-Bahn/S-Bahn ~25-30 min hacia el norte de Mitte."
      },
      {
        "day": "10:45",
        "title": "Gedenkstätte Berliner Mauer (Bernauer Str.)",
        "desc": "El memorial REAL del Muro — no confundir con la East Side Gallery, que es otra cosa y está planeada para el día 10. 1.4km con tramo original, torre de vigilancia, el 'Fenster des Gedenkens' y centro de documentación. Entrada gratis.",
        "place": "Gedenkstätte Berliner Mauer, Bernauer Straße, Berlin",
        "lat": 52.535,
        "lng": 13.3903
      },
      {
        "day": "12:15",
        "title": "Barrio Judío / Scheunenviertel",
        "desc": "Caminata corta hacia Oranienburger Straße y Hackescher Markt: la Neue Synagoge con su cúpula dorada, y los patios escondidos de Hackesche Höfe con bares y tiendas de diseño. Buen lugar para almorzar.",
        "place": "Neue Synagoge, Oranienburger Straße 28-30, Berlin",
        "lat": 52.525,
        "lng": 13.3947
      },
      {
        "day": "14:00",
        "title": "Monumento al Holocausto",
        "desc": "Denkmal für die ermordeten Juden Europas: 2.711 bloques de hormigón, entrada libre. Visita breve pero fuerte, 20-30 min caminando entre las losas. Está pegado a la Puerta de Brandeburgo.",
        "place": "Denkmal für die ermordeten Juden Europas, Berlin",
        "lat": 52.5138,
        "lng": 13.3785
      },
      {
        "day": "14:45",
        "title": "Checkpoint Charlie",
        "desc": "Ex puesto fronterizo entre EEUU y la URSS. Hoy es bastante foto-turístico (actores disfrazados, réplica de la garita), pero los paneles históricos al aire libre sobre Zimmerstraße valen la parada rápida de 20 min.",
        "place": "Checkpoint Charlie, Berlin",
        "lat": 52.5074,
        "lng": 13.3904
      },
      {
        "day": "15:15",
        "title": "Kreuzberg alternativo",
        "desc": "Ya estás en el borde — seguí caminando hacia Oranienstraße y Bergmannkiez: arte callejero, tiendas vintage y la vibra multicultural más under de Berlín.",
        "place": "Oranienstraße, Kreuzberg, Berlin",
        "lat": 52.4993,
        "lng": 13.4183
      },
      {
        "day": "18:30",
        "title": "Atardecer en el Landwehrkanal",
        "desc": "Paseo tranquilo junto al canal, punto de encuentro local para sentarse en el pasto con una cerveza.",
        "place": "Paul-Lincke-Ufer, Berlin",
        "lat": 52.4934,
        "lng": 13.4224
      },
      {
        "day": "20:00",
        "title": "Cena en barrio auténtico",
        "desc": "Kreuzberg es meca turco-alemana: Curry 36 (currywurst clásico) o un kebab real en Hasir. Si cae jueves, Markthalle Neun tiene 'Street Food Thursday' (17-22h) con puestos de todo el mundo.",
        "place": "Markthalle Neun, Eisenbahnstraße 42/43, Berlin",
        "lat": 52.4989,
        "lng": 13.4257
      }
    ],
    "hacks": [
      "El 9 de julio 2026 cae jueves: Markthalle Neun hace su 'Street Food Thursday' semanal — buena opción gasolera para cenar variado (conviene confirmar que el evento siga vigente).",
      "La entrada a la Siegessäule se paga en efectivo, no aceptan tarjeta.",
      "Checkpoint Charlie y el Monumento al Holocausto son paradas cortas (20-30 min c/u) — no hace falta quedarse mucho, son más simbólicas que para 'recorrer'.",
      "Es un día largo con muchas paradas. Si llegás cansado a la tarde, lo primero que se puede cortar sin culpa es Checkpoint Charlie (es lo más sobrevalorado según locales)."
    ],
    "isDefault": true
  },
  {
    "id": "quest-berlin-jul10",
    "title": "Berlín 🛫 — Viernes 10 jul: Tempelhof, East Side, Holzmarkt & Karl-Marx-Allee",
    "dateLabel": "Vie 10 Jul",
    "totalCost": 35,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "transport": 8,
      "bikeRental": 10,
      "food": 17
    },
    "itinerary": [
      {
        "day": "08:45",
        "title": "🏠 Salida del hostel (a&o Berlin Friedrichshain)",
        "desc": "Hoy el recorrido es un gran círculo: arrancás lejos en el sur (Tempelhof) y vas subiendo hacia el norte durante el día, terminando la noche prácticamente en la puerta del hostel (Boxhagener Platz y Karl-Marx-Allee). ~35-40 min en transporte hasta Tempelhof.",
        "place": "Boxhagener Str. 73, 10245 Berlin",
        "lat": 52.5121,
        "lng": 13.4536
      },
      {
        "day": "09:30",
        "title": "Tempelhofer Feld (aeropuerto viejo)",
        "desc": "Entrada libre. Alquilá una bici en la entrada (~€10) para recorrer las pistas de aterrizaje reconvertidas en parque urbano: kitesurf con ruedas, huertas urbanas y el hangar histórico del puente aéreo de Berlín.",
        "place": "Tempelhofer Feld, Berlin",
        "lat": 52.4732,
        "lng": 13.4033
      },
      {
        "day": "12:00",
        "title": "Traslado a Neukölln",
        "desc": "15-20 min caminando o en bus desde Tempelhof."
      },
      {
        "day": "12:30",
        "title": "Türkenmarkt am Maybachufer",
        "desc": "Mercado turco sobre el canal Landwehr, solo martes y viernes — justo el 10 cae viernes. Almorzá gözleme, falafel y fruta baratísima sentado en el pasto del canal.",
        "place": "Türkenmarkt am Maybachufer, Berlin",
        "lat": 52.4886,
        "lng": 13.4283
      },
      {
        "day": "14:00",
        "title": "Neukölln alternativo",
        "desc": "Weserstraße y Sonnenallee: el barrio más under de Berlín, cafés de especialidad, librerías y arte urbano.",
        "place": "Weserstraße, Neukölln, Berlin",
        "lat": 52.4841,
        "lng": 13.4348
      },
      {
        "day": "16:00",
        "title": "Traslado a Friedrichshain",
        "desc": "25-30 min, volviendo cerca de tu hostel."
      },
      {
        "day": "16:30",
        "title": "East Side Gallery",
        "desc": "El tramo más largo que queda del Muro (1.3km), pintado por 100+ artistas en 1990. Imperdible el mural del beso Brézhnev-Honecker.",
        "place": "East Side Gallery, Mühlenstraße, Berlin",
        "lat": 52.5045,
        "lng": 13.4413
      },
      {
        "day": "17:30",
        "title": "RAW-Gelände",
        "desc": "Ex depósito ferroviario bombardeado en la guerra, hoy zona alternativa con arte callejero, skatepark y bares. A 5 min caminando de East Side Gallery, junto a Warschauer Straße.",
        "place": "RAW-Gelände, Revaler Straße 99, Berlin",
        "lat": 52.5106,
        "lng": 13.4489
      },
      {
        "day": "19:00",
        "title": "Atardecer en Holzmarkt 25",
        "desc": "El espacio cultural sobre el río Spree del video — terrazas, bares y buena música. Entrada libre, solo pagás lo que consumís.",
        "place": "Holzmarkt 25, Holzmarktstraße 25, Berlin",
        "lat": 52.5115,
        "lng": 13.4275
      },
      {
        "day": "20:30",
        "title": "Cena en el Kiez de Boxhagener Platz",
        "desc": "A 10 min de tu hostel: el barrio auténtico de Friedrichshain con biergartens y Kneipen locales, lejos del circuito turístico de Simon-Dach-Str.",
        "place": "Boxhagener Platz, Berlin",
        "lat": 52.5127,
        "lng": 13.4548
      },
      {
        "day": "22:00",
        "title": "Karl-Marx-Allee / Frankfurter Tor de noche",
        "desc": "Cierre gratis, caminando de vuelta al hostel: el bulevar soviético más impactante de Berlín, con el Kino International, el Café Moscú y las columnatas de mármol blanco de Frankfurter Tor iluminadas. Ningún blog de locales se lo salta y te queda literalmente en la puerta.",
        "place": "Frankfurter Tor, Berlin",
        "lat": 52.5157,
        "lng": 13.4544
      }
    ],
    "hacks": [
      "El mercado de Maybachufer es solo martes y viernes — el 10 de julio (viernes) cae perfecto para no perdértelo.",
      "RAW-Gelände y East Side Gallery están a 5-10 min caminando entre sí, junto a la estación Warschauer Straße.",
      "Holzmarkt 25 queda a ~15-20 min caminando de RAW-Gelände bordeando el Spree.",
      "Karl-Marx-Allee no te cuesta nada extra: es la caminata natural de vuelta al hostel desde Boxhagener Platz."
    ],
    "isDefault": true
  },
  {
    "id": "quest-amsterdam-day1",
    "title": "Ámsterdam 🌷 — Día 1: Centro Histórico, Zaandam y Mística Nocturna",
    "dateLabel": "Día 1 (14 jul)",
    "totalCost": 70,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "transport": 15,
      "tickets": 20,
      "food": 35
    },
    "itinerary": [
      {
        "day": "08:30",
        "title": "Desayuno y Plaza Dam",
        "desc": "Arrancá el día desayunando fuerte y andá a la plaza principal. Admirá la fachada del Palacio Real y el Monumento Nacional.",
        "place": "Plaza Dam, 1012 JS Amsterdam",
        "lat": 52.3731,
        "lng": 4.8926
      },
      {
        "day": "10:00",
        "title": "Canales históricos y Singel",
        "desc": "Caminata bordeando los canales principales hacia el canal Singel para ver las famosas fachadas torcidas de las casas del siglo XVII.",
        "place": "Singel, Amsterdam",
        "lat": 52.3721,
        "lng": 4.8895
      },
      {
        "day": "11:45",
        "title": "Tren a Zaandam",
        "desc": "Tren directo desde Amsterdam Centraal hacia la estación Zaandam. El trayecto dura exactamente 12 minutos."
      },
      {
        "day": "12:00",
        "title": "Zaandam — Casas Cubo y almuerzo",
        "desc": "Caminá por el centro urbano peatonal. Sacá la foto del Inntel Hotels Amsterdam Zaandam, el edificio que parece un apilamiento de casas de madera tradicionales verdes simulando bloques de juguete. Almorzá algo rápido en la zona peatonal (Gedempte Gracht).",
        "place": "Provincialeweg 102, 1506 MD Zaandam",
        "lat": 52.439,
        "lng": 4.8283
      },
      {
        "day": "14:15",
        "title": "Regreso en tren a Ámsterdam",
        "desc": "Mismo trayecto, 12 minutos de vuelta a Amsterdam Centraal."
      },
      {
        "day": "15:00",
        "title": "Las Nueve Calles (De Negen Straatjes)",
        "desc": "Recorré este microbarrio de canales repleto de tiendas de diseño, cafés y locales vintage.",
        "place": "Wolvenstraat / Huidenstraat, 1016 EE Amsterdam",
        "lat": 52.3695,
        "lng": 4.885
      },
      {
        "day": "18:00",
        "title": "Crucero al atardecer por los canales",
        "desc": "Crucero de 1 hora para ver cómo se encienden las luces de los puentes históricos desde el agua. Hay muelles de salida frente a la Estación Central o en el Damrak.",
        "place": "Damrak, Amsterdam",
        "lat": 52.378,
        "lng": 4.8994
      },
      {
        "day": "20:30",
        "title": "Barrio Rojo con audioguía y cena en Chinatown",
        "desc": "Con auriculares y tu app de audioguía, recorré de forma respetuosa los callejones iluminados con neones rojos. Al terminar, cená en Zeedijk (el barrio chino), famosa por sus restaurantes asiáticos.",
        "place": "Oudezijds Achterburgwal, 1012 DL Amsterdam",
        "lat": 52.3735,
        "lng": 4.9
      }
    ],
    "hacks": [
      "El tren a Zaandam sale directo desde Amsterdam Centraal, 12 minutos de viaje — no hace falta reservar, es de los trenes regionales normales (NS).",
      "El crucero por los canales tiene muelles de salida frente a la Estación Central o en el Damrak — comprá el ticket con un rato de antelación en temporada alta.",
      "Para el Barrio Rojo: es zona residencial además de turística, así que nada de fotos a las trabajadoras sexuales — la audioguía te va a explicar el código de respeto."
    ],
    "isDefault": true
  },
  {
    "id": "quest-amsterdam-day2",
    "title": "Ámsterdam 🚤 — Día 2: Escapada de Leyenda al Campo",
    "dateLabel": "Día 2 (15 jul)",
    "totalCost": 75,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "transport": 10,
      "boatRental": 45,
      "food": 20
    },
    "itinerary": [
      {
        "day": "09:00",
        "title": "Autobús al norte (líneas 314/316)",
        "desc": "Terminal de autobuses de la planta alta de la Estación Central. Pagás apoyando el celular o tarjeta (OVpay) al subir y al bajar. Bajada en Broek in Waterland (llegada 09:18)."
      },
      {
        "day": "09:30",
        "title": "Alquiler de bote eléctrico (Fluisterboot)",
        "desc": "Caminá 10 minutos hacia la granja de alquiler de botes. Manejás vos mismo el bote silencioso recorriendo los canales rurales entre campos, vacas y cisnes.",
        "place": "Fluisterbootverhuur Overleek, Overleek 3, 1151 CX Broek in Waterland",
        "lat": 52.413,
        "lng": 4.935
      },
      {
        "day": "12:00",
        "title": "Almuerzo de panqueques tradicionales",
        "desc": "Un pannenkoek (panqueque gigante) salado o dulce en una taberna histórica.",
        "place": "Pannenkoekenhuis De Witte Swaen, Dorpsstraat 11-13, 1151 AC Broek in Waterland",
        "lat": 52.4103,
        "lng": 4.9313
      },
      {
        "day": "13:45",
        "title": "Autobús de regreso a Ámsterdam Centraal",
        "desc": "Mismo trayecto en sentido contrario."
      },
      {
        "day": "14:30",
        "title": "Tarde libre en Jordaan",
        "desc": "Explorá las cafeterías y canales del barrio Jordaan. Para probar la tarta de manzana más famosa de la ciudad, parada técnica en Winkel 43.",
        "place": "Winkel 43, Noordermarkt 43, 1015 NA Amsterdam",
        "lat": 52.3846,
        "lng": 4.8853
      }
    ],
    "hacks": [
      "El bus 314/316 se paga con celular o tarjeta contactless (OVpay), no hace falta comprar boleto antes.",
      "El bote eléctrico se maneja sin necesidad de carnet náutico ni experiencia previa — es silencioso e ideal para ver la Holanda rural sin apuro.",
      "Winkel 43 siempre tiene cola — si no querés esperar, pedí la tarta para llevar en vez de sentarte."
    ],
    "isDefault": true
  },
  {
    "id": "quest-amsterdam-day3",
    "title": "Ámsterdam 🚆 — Día 3: Flores, Mercado y Tren a Bruselas",
    "dateLabel": "Día 3 (16 jul)",
    "totalCost": 70,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "transport": 45,
      "food": 15,
      "souvenirs": 10
    },
    "itinerary": [
      {
        "day": "09:30",
        "title": "Mercado de Flores (Bloemenmarkt)",
        "desc": "Caminá entre los puestos de flores flotantes sobre el canal. Ideal para fotos y comprar algún recuerdo típico.",
        "place": "Bloemenmarkt, Singel 630g, 1017 AZ Amsterdam",
        "lat": 52.3672,
        "lng": 4.8917
      },
      {
        "day": "11:30",
        "title": "Mercado Albert Cuyp y almuerzo en De Pijp",
        "desc": "Caminá al sur, al barrio de De Pijp. Recorré los cientos de puestos del mercado callejero más grande de Europa. Almorzá al paso: stroopwafels calientes, papas fritas dobles y arenque (herring).",
        "place": "Albert Cuypstraat, 1073 BD Amsterdam",
        "lat": 52.3565,
        "lng": 4.8917
      },
      {
        "day": "13:45",
        "title": "Descanso en Sarphatipark",
        "desc": "A dos cuadras del mercado, relajate en este parque de estilo inglés antes de cruzar los canales rumbo a la estación.",
        "place": "Sarphatipark, 1073 CZ Amsterdam",
        "lat": 52.3556,
        "lng": 4.8934
      },
      {
        "day": "16:30",
        "title": "Retiro de equipaje y traslado a Amsterdam Centraal",
        "desc": "Andá a buscar las valijas al hotel o al locker. El tren internacional a Bruselas sale directo desde la misma Estación Central de Ámsterdam — mucho más simple que viajar al aeropuerto. Caminá o tomá el tranvía cruzando los canales, sin apuro, para despedirte de la ciudad.",
        "place": "Amsterdam Centraal, Stationsplein, Amsterdam",
        "lat": 52.3791,
        "lng": 4.9003
      },
      {
        "day": "17:30",
        "title": "Embarque: tren internacional a Bruselas",
        "desc": "Para trenes internacionales conviene estar en el andén 30-45 min antes por los controles de acceso y andenes específicos. Dos opciones: Eurostar (ex-Thalys), ~1h50 directo a Bruxelles-Midi/Brussel-Zuid, con reserva de asiento obligatoria; o Intercity, ~2h45, sin reserva obligatoria y con tickets flexibles. Salida entre las 18:00 y 19:00. Al llegar tenés conexión directa con metro y trenes locales hacia tu alojamiento en Bruselas.",
        "place": "Amsterdam Centraal, Stationsplein, Amsterdam",
        "lat": 52.3791,
        "lng": 4.9003
      }
    ],
    "hacks": [
      "El Eurostar/ex-Thalys es más rápido (1h50) pero requiere reserva de asiento obligatoria — comprala con antelación online. El Intercity es más barato y flexible (billetes sin reserva) pero tarda casi una hora más (2h45).",
      "Llegá al andén 30-45 min antes de la salida: los trenes internacionales tienen control de acceso, a diferencia de los trenes regionales.",
      "Al bajar en Bruxelles-Midi/Brussel-Zuid hay conexión directa de metro y trenes locales hacia el alojamiento en Bruselas."
    ],
    "isDefault": true
  },
  {
    "id": "quest-vienna-day1",
    "title": "Viena 🚂 — Llegada: Naschmarkt y Karlskirche",
    "dateLabel": "Llegada (21 jul)",
    "totalCost": 20,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "transport": 5,
      "food": 15
    },
    "itinerary": [
      {
        "day": "17:00",
        "title": "Llegada a Wien Hauptbahnhof",
        "desc": "El tren desde Praga llega a la Estación Central (Hauptbahnhof), no a Westbahnhof — confirmá el andén antes de bajar. Es la misma estación desde la que vas a salir hacia Hallstatt el día 23.",
        "place": "Wien Hauptbahnhof, Vienna",
        "lat": 48.1858,
        "lng": 16.3764
      },
      {
        "day": "17:30",
        "title": "Check-in en el hotel",
        "desc": "MOOONS Vienna está a 10-15 min caminando de la estación, o una parada de metro/tranvía. Dejá las valijas y salí liviano — todo lo de esta tarde queda a pasos del hotel.",
        "place": "MOOONS Vienna, Wiedner Gürtel 16, Vienna",
        "lat": 48.19,
        "lng": 16.368
      },
      {
        "day": "18:30",
        "title": "Cena en el Naschmarkt",
        "desc": "El mercado gastronómico más famoso de Viena, a 5-10 min caminando del hotel. Puestos de comida turca, balcánica y austríaca — ideal para picar variado en vez de sentarse en un solo lugar. Abierto de lunes a sábado.",
        "place": "Naschmarkt, Vienna",
        "lat": 48.1974,
        "lng": 16.3639
      },
      {
        "day": "20:00",
        "title": "Karlskirche de noche",
        "desc": "La iglesia barroca más importante de Viena, a 5 min del Naschmarkt. De noche, iluminada y con la plaza tranquila, es un cierre lindo y relajado para el primer día sin necesidad de entrar.",
        "place": "Karlskirche, Vienna",
        "lat": 48.1982,
        "lng": 16.3712
      }
    ],
    "hacks": [
      "Confirmá que el tren llegue a Hauptbahnhof y no a Westbahnhof — son estaciones distintas, a varios km una de la otra.",
      "El Naschmarkt cierra los domingos — el 21 de julio cae martes, así que no hay problema.",
      "Primera noche: mejor no forzar mucho más después de un día entero viajando. Con Naschmarkt + Karlskirche alcanza."
    ],
    "isDefault": true
  },
  {
    "id": "quest-vienna-day2",
    "title": "Viena 👑 — Día 2: Schönbrunn y Centro Histórico",
    "dateLabel": "Día 2 (22 jul)",
    "totalCost": 55,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "tickets": 26,
      "transport": 8,
      "food": 21
    },
    "itinerary": [
      {
        "day": "09:00",
        "title": "⭐ Palacio de Schönbrunn",
        "desc": "La residencia de verano de los Habsburgo — Imperial Tour por los salones (~€26 pp) o simplemente recorrer los jardines, que son gratis y espectaculares (subí hasta la Gloriette para la vista panorámica). Arrancá temprano para evitar las colas.",
        "place": "Schönbrunn Palace, Vienna",
        "lat": 48.1858,
        "lng": 16.3122
      },
      {
        "day": "12:30",
        "title": "Almuerzo cerca del centro",
        "desc": "Volviendo de Schönbrunn hacia el casco histórico, paren a almorzar algo tranquilo antes de seguir caminando."
      },
      {
        "day": "13:30",
        "title": "Catedral de San Esteban (Stephansdom)",
        "desc": "El corazón simbólico de Viena, con su techo de tejas multicolor. Entrada a la nave principal gratis; subir a la torre tiene costo aparte si quieren la vista.",
        "place": "Stephansdom, Vienna",
        "lat": 48.2084,
        "lng": 16.3731
      },
      {
        "day": "14:30",
        "title": "Hofburg y Michaelerplatz",
        "desc": "El palacio imperial de invierno de los Habsburgo. Se puede ver el imponente exterior y la Michaelerplatz sin pagar entrada — ahí también está la Escuela Española de Equitación, famosa por los caballos lipizzanos.",
        "place": "Hofburg, Vienna",
        "lat": 48.2082,
        "lng": 16.3661
      },
      {
        "day": "15:30",
        "title": "Graben y Kärntner Straße",
        "desc": "Las calles peatonales más elegantes del centro, con la columna de la peste (Pestsäule) en el medio del Graben. Buen tramo para caminar sin apuro y curiosear vidrieras.",
        "place": "Graben, Vienna",
        "lat": 48.2088,
        "lng": 16.3707
      },
      {
        "day": "16:30",
        "title": "Café clásico vienés",
        "desc": "Parada obligada: un café tradicional (Café Central o Demel) con Sachertorte. La cultura del café vienés es Patrimonio Inmaterial de la UNESCO — no es solo tomar un café, es sentarse a no hacer nada por un rato largo.",
        "place": "Café Central, Vienna",
        "lat": 48.2103,
        "lng": 16.3654
      },
      {
        "day": "18:00",
        "title": "Ringstraße al atardecer",
        "desc": "El gran bulevar que rodea el centro histórico: Rathaus (ayuntamiento neogótico), el Parlamento y la Ópera Estatal quedan todos sobre esta misma avenida, a pocos minutos caminando entre sí.",
        "place": "Rathaus, Vienna",
        "lat": 48.2107,
        "lng": 16.3572
      },
      {
        "day": "20:00",
        "title": "Cena en el centro",
        "desc": "Cerrá el día con algo típico austríaco — un Wiener Schnitzel en alguna Beisl (taberna tradicional) del casco histórico."
      }
    ],
    "hacks": [
      "Los jardines de Schönbrunn son gratis — si el presupuesto aprieta, se puede disfrutar el palacio solo por fuera y desde la Gloriette sin pagar el tour de los salones.",
      "Comprá la entrada a Schönbrunn online con anticipación para saltear la cola de la boletería.",
      "Café Central suele tener fila larga al mediodía — yendo a media tarde (como en este plan) se hace más corto."
    ],
    "isDefault": true
  },
  {
    "id": "quest-vienna-day3",
    "title": "Viena 🎨 — Salida: Belvedere y tren a Hallstatt",
    "dateLabel": "Salida (23 jul)",
    "totalCost": 25,
    "includedInBudget": false,
    "days": 1,
    "details": {
      "tickets": 21,
      "transport": 4
    },
    "itinerary": [
      {
        "day": "09:30",
        "title": "Palacio Belvedere",
        "desc": "A minutos caminando del hotel y de Hauptbahnhof — de paso hacia la estación. El Belvedere Superior tiene 'El Beso' de Klimt (entrada ~€21 pp); si prefieren ahorrar, los jardines barrocos son gratis y ya justifican la parada.",
        "place": "Belvedere Palace, Vienna",
        "lat": 48.1916,
        "lng": 16.3809
      },
      {
        "day": "11:30",
        "title": "Retiro de equipaje en el hotel",
        "desc": "Vuelta rápida a MOOONS Vienna a buscar las valijas antes de ir a la estación.",
        "place": "MOOONS Vienna, Wiedner Gürtel 16, Vienna",
        "lat": 48.19,
        "lng": 16.368
      },
      {
        "day": "12:30",
        "title": "Tren a Hallstatt",
        "desc": "Salida desde Wien Hauptbahnhof. El viaje a Hallstatt no es directo: se toma un tren hasta Attnang-Puchheim con combinación a Hallstatt, y desde la estación de Hallstatt un ferry corto cruza el lago hasta el pueblo. Calculá varias horas de viaje en total.",
        "place": "Wien Hauptbahnhof, Vienna",
        "lat": 48.1858,
        "lng": 16.3764
      }
    ],
    "hacks": [
      "El Belvedere queda literalmente de paso entre el hotel y la estación — no hace falta desviarse.",
      "Revisá los horarios de combinación a Hallstatt con anticipación (vía Attnang-Puchheim): si el tren de conexión sale justo, no da margen para llegar tarde a la estación.",
      "El último tramo a Hallstatt es en ferry — asegurate de bajar en la estación correcta (Hallstatt, del lado del lago opuesto al pueblo) y no en Obertraun."
    ],
    "isDefault": true
  }
];

export const DEFAULT_LUGGAGE_ITEMS: LuggageItem[] = [
  {
    "id": "lug-1",
    "name": "Pasaporte Español físico",
    "category": "Documentos",
    "location": "Mochila"
  },
  {
    "id": "lug-2",
    "name": "Tarjeta Sanitaria Europea (TSE/CPS)",
    "category": "Documentos",
    "location": "Mochila"
  },
  {
    "id": "lug-3",
    "name": "Notebook / Laptop 17.3\" (Trabajo / Automatizaciones)",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-5",
    "name": "Zapatillas de Trail running (Alpes/Trekking)",
    "category": "Ropa/Calzado",
    "location": "Valija Grande"
  },
  {
    "id": "lug-6",
    "name": "Cortaviento impermeable ultraliviano",
    "category": "Ropa/Calzado",
    "location": "Mochila"
  },
  {
    "id": "lug-7",
    "name": "Adaptador de enchufe universal europeo",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-8",
    "name": "Bermudas deportivas y mallas de baño (Ibiza)",
    "category": "Ropa/Calzado",
    "location": "Valija Grande"
  },
  {
    "id": "lug-9",
    "name": "Kit aseo personal (Bolsillo Impermeable Humed/Seco)",
    "category": "Salud/Aseo",
    "location": "Mochila"
  },
  {
    "id": "lug-10",
    "name": "Powerbank 20.000 mAh de carga rápida",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-11",
    "name": "Cargador universal multi-puerto (USB-A / USB-C)",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-55",
    "name": "Cargador de celular",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-56",
    "name": "Cargador de reloj",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-57",
    "name": "Cargador de laptop",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-12",
    "name": "Kit lavandería (detergente en cápsulas + cuerda + ganchos plegables)",
    "category": "Salud/Aseo",
    "location": "Valija Grande"
  },
  {
    "id": "lug-13",
    "name": "Protector solar SPF 50+",
    "category": "Salud/Aseo",
    "location": "Mochila"
  },
  {
    "id": "lug-14",
    "name": "Molde bucal nocturno (higiene dental)",
    "category": "Salud/Aseo",
    "location": "Mochila"
  },
  {
    "id": "lug-15",
    "name": "Interrail Global Pass físico",
    "category": "Documentos",
    "location": "Mochila"
  },
  {
    "id": "lug-16",
    "name": "Tarjeta Wise/Revolut principal + €50–100 efectivo",
    "category": "Documentos",
    "location": "Mochila"
  },
  {
    "id": "lug-17",
    "name": "Auriculares (noise-cancelling o in-ear)",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-18",
    "name": "Cable USB-C corto 30cm de repuesto",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-19",
    "name": "Remera merino/dry-fit de repuesto (acceso diario)",
    "category": "Ropa/Calzado",
    "location": "Mochila"
  },
  {
    "id": "lug-20",
    "name": "Boxer de repuesto",
    "category": "Ropa/Calzado",
    "location": "Mochila"
  },
  {
    "id": "lug-21",
    "name": "Remeras x3 (1 merino, 1 dry-fit, 1 casual)",
    "category": "Ropa/Calzado",
    "location": "Carry-on"
  },
  {
    "id": "lug-22",
    "name": "Camisa/camiseta presentable (cenas con mamá, networking)",
    "category": "Ropa/Calzado",
    "location": "Carry-on"
  },
  {
    "id": "lug-23",
    "name": "Pantalón liviano de tela (ciudad + noches + mamá)",
    "category": "Ropa/Calzado",
    "location": "Carry-on"
  },
  {
    "id": "lug-24",
    "name": "Shorts x2 multipropósito (ciudad/playa)",
    "category": "Ropa/Calzado",
    "location": "Carry-on"
  },
  {
    "id": "lug-25",
    "name": "Boxers x5",
    "category": "Ropa/Calzado",
    "location": "Carry-on"
  },
  {
    "id": "lug-26",
    "name": "Calcetines x5 (3 cortos + 2 largos trekking/frío)",
    "category": "Ropa/Calzado",
    "location": "Carry-on"
  },
  {
    "id": "lug-27",
    "name": "Buzo / hoodie mediano (vuelos, noches, septiembre)",
    "category": "Ropa/Calzado",
    "location": "Carry-on"
  },
  {
    "id": "lug-28",
    "name": "Capa térmica fina top + bottom (Alpes y Hallstatt)",
    "category": "Ropa/Calzado",
    "location": "Carry-on"
  },
  {
    "id": "lug-29",
    "name": "Paracetamol + Ibuprofeno",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-30",
    "name": "Antidiarreico",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-31",
    "name": "Antihistamínico (alergias / picaduras)",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-32",
    "name": "Omeprazol / antiácido",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-33",
    "name": "Kit primeros auxilios (curitas, vendas, antiséptico)",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-61",
    "name": "Ibuprofeno",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-62",
    "name": "Qura Plus",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-63",
    "name": "Diclofenac",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-34",
    "name": "Fotocopias pasaporte + reservas clave (PDF offline)",
    "category": "Documentos",
    "location": "Carry-on"
  },
  {
    "id": "lug-35",
    "name": "Tarjeta de crédito backup (distinta a la de mochila)",
    "category": "Documentos",
    "location": "Carry-on"
  },
  {
    "id": "lug-36",
    "name": "Neceser de cabina (shampoo seco, pasta dental, desodorante sólido)",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-37",
    "name": "Toalla de microfibra compacta (hostels no siempre tienen)",
    "category": "Salud/Aseo",
    "location": "Carry-on"
  },
  {
    "id": "lug-38",
    "name": "Antifaces + tapones para oídos (hostels / vuelos)",
    "category": "Otros",
    "location": "Carry-on"
  },
  {
    "id": "lug-39",
    "name": "Candado de combinación (taquillas de hostels)",
    "category": "Otros",
    "location": "Carry-on"
  },
  {
    "id": "lug-40",
    "name": "Paraguas ultracompacto (Amsterdam, Bruselas)",
    "category": "Otros",
    "location": "Carry-on"
  },
  {
    "id": "lug-41",
    "name": "Zapatillas urbanas/sneakers cómodas (ciudad, 15–20 km/día)",
    "category": "Ropa/Calzado",
    "location": "Valija Grande"
  },
  {
    "id": "lug-42",
    "name": "Ojotas / flip-flops (Ibiza + duchas de hostels)",
    "category": "Ropa/Calzado",
    "location": "Valija Grande"
  },
  {
    "id": "lug-43",
    "name": "Campera de pluma comprimible (Alpes, Hallstatt, sep)",
    "category": "Ropa/Calzado",
    "location": "Valija Grande"
  },
  {
    "id": "lug-44",
    "name": "Polar / fleece ligero (Baviera, Austria, montaña)",
    "category": "Ropa/Calzado",
    "location": "Valija Grande"
  },
  {
    "id": "lug-45",
    "name": "Remeras extra x3 (rotación entre lavanderías)",
    "category": "Ropa/Calzado",
    "location": "Valija Grande"
  },
  {
    "id": "lug-46",
    "name": "Jean (noches frías, presentarse con mamá)",
    "category": "Ropa/Calzado",
    "location": "Valija Grande"
  },
  {
    "id": "lug-47",
    "name": "Shampoo + acondicionador (tamaño normal)",
    "category": "Salud/Aseo",
    "location": "Valija Grande"
  },
  {
    "id": "lug-48",
    "name": "Gel de ducha / jabón sólido",
    "category": "Salud/Aseo",
    "location": "Valija Grande"
  },
  {
    "id": "lug-49",
    "name": "Desodorante principal",
    "category": "Salud/Aseo",
    "location": "Valija Grande"
  },
  {
    "id": "lug-50",
    "name": "Hilo dental + enjuague bucal",
    "category": "Salud/Aseo",
    "location": "Valija Grande"
  },
  {
    "id": "lug-51",
    "name": "Afeitadora eléctrica o maquinillas",
    "category": "Salud/Aseo",
    "location": "Valija Grande"
  },
  {
    "id": "lug-52",
    "name": "Protector solar extra tamaño grande (temporada completa)",
    "category": "Salud/Aseo",
    "location": "Valija Grande"
  },
  {
    "id": "lug-53",
    "name": "Cubiertos plegables de camping (ahorro en comida para llevar)",
    "category": "Otros",
    "location": "Valija Grande"
  },
  {
    "id": "lug-54",
    "name": "Bolsas reutilizables plegables (supermercados europeos cobran la bolsa)",
    "category": "Otros",
    "location": "Valija Grande"
  },
  {
    "id": "lug-58",
    "name": "Antiparras / anteojos de buceo",
    "category": "Otros",
    "location": "Valija Grande"
  },
  {
    "id": "lug-59",
    "name": "Micrófonos",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-60",
    "name": "Peluches antiviento para micrófonos",
    "category": "Tecnología",
    "location": "Mochila"
  },
  {
    "id": "lug-64",
    "name": "Cartas de Truco españolas",
    "category": "Otros",
    "location": "Mochila"
  }
];

export const EUROPA_2026_STOPS: RouteStop[] = [
  {
    "id": "stop-1",
    "city": "Madrid (España)",
    "nights": 2,
    "transport": "Inicio del Viaje",
    "cost": 0,
    "dailyBudget": 15,
    "category": "Hub / Familiar",
    "costLvl": "Bajo",
    "core": "Negocios/Tech",
    "hack": "Alojamiento gratis. Abono de transporte por €10 al mes y salud de la UE"
  },
  {
    "id": "stop-ibiza",
    "city": "Ibiza (España) 🏝️",
    "nights": 5,
    "transport": "Vuelo Iberia Express (MAD 05:40 → IBZ 06:55)",
    "cost": 237,
    "dailyBudget": 33,
    "category": "Aventura y Naturaleza",
    "costLvl": "Alto",
    "core": "Joda",
    "hack": "Reserva confirmada. Vuelo I21693 Iberia Express 26 jun. ✈️ Booking: QHH4X. Alojamiento: Carrer de Sabadell, 18. Sant Josep de sa Talaia.",
    "isConfirmed": true,
    "isFixed": true,
    "hotelName": "Hotel en Sant Josep de sa Talaia",
    "address": "Carrer de Sabadell, 18",
    "accommodationCost": 210,
    "confirmationNumber": "QHH4X",
    "flightDetails": "Iberia Express I21693 | MAD 05:40 → IBZ 06:55 | 26 jun 2026 | €236.90 total (x2 pax: Ezequiel + Geronimo)",
    "photosAlbumUrl": "https://photos.app.goo.gl/tw6t3JbYDvwdxG1s5"
  },
  {
    "id": "stop-mallorca",
    "city": "Palma de Mallorca (España) 🇪🇸",
    "nights": 6,
    "transport": "Ferry / Vuelo desde Ibiza",
    "cost": 0,
    "dailyBudget": 30,
    "category": "Aventura y Naturaleza",
    "costLvl": "Medio",
    "core": "Joda",
    "hack": "Airbnb confirmado en Pollença (Townhouse Calvari · Home Villas 360), 1–7 jul. Self check-in con lockbox; avisar hora de llegada a reservas@homevillas360.com. Total $1.314,06 USD ÷ 4 personas = $328,52 c/u (~€288). Vuelo a Berlín el 7 jul: Ryanair PMI→BER 9:20-12:05. Booking: P325RJ.",
    "isFixed": true,
    "isConfirmed": true,
    "hotelName": "Townhouse Calvari · Pollença (Home Villas 360)",
    "address": "9 Carrer d'Alacantí, Pollença, Illes Balears 07460, España",
    "accommodationCost": 287.67,
    "confirmationNumber": "P325RJ",
    "flightDetails": "Ryanair (Malta Air) PMI 9:20 → BER 12:05 | 7 jul 2026 | €53.39 | Booking: P325RJ",
    "lodgingConfirmation": "HMNEKE5CXN",
    "lodgingHost": "Pep Vicens Llobera · Home Villas 360",
    "lodgingCheckIn": "Mié 1 jul 2026 · 16:00",
    "lodgingCheckOut": "Mar 7 jul 2026 · 10:00",
    "lodgingCheckInMethod": "Self check-in con Lockbox",
    "lodgingContact": "reservas@homevillas360.com",
    "lodgingCostNote": "$1.314,06 USD total ÷ 4 personas = $328,52 c/u (~€287,67)",
    "photosAlbumUrl": "https://photos.app.goo.gl/XN7ToGvj2WRefupLA"
  },
  {
    "id": "stop-berlin-solo",
    "city": "Berlín (Alemania) 🇩🇪",
    "nights": 4,
    "transport": "Vuelo Ryanair (PMI 9:20 → BER 12:05)",
    "cost": 53,
    "dailyBudget": 25,
    "category": "Caja de Ahorro",
    "costLvl": "Bajo",
    "core": "Negocios/Tech",
    "hack": "Solo. ✈️ Ryanair PMI→BER 7 jul. Booking: P325RJ. a&o hostel dormitorio 6 camas. Booking: AOAI-1-5200897.",
    "isConfirmed": true,
    "isFixed": true,
    "hotelName": "a&o Berlin Friedrichshain",
    "address": "Boxhagener Str. 73, 10245 Berlin",
    "confirmationNumber": "AOAI-1-5200897",
    "accommodationCost": 127.32,
    "flightDetails": "Ryanair (Malta Air) PMI 9:20 → BER 12:05 | 7 jul 2026 | €53.39 | Booking: P325RJ",
    "itineraryQuestIds": [
      "quest-berlin-jul9",
      "quest-berlin-jul10"
    ],
    "photosAlbumUrl": "https://photos.app.goo.gl/bqesz5JUXJNN7Gp27"
  },
  {
    "id": "stop-berlin-mitte",
    "city": "Berlín (Alemania) 🇩🇪",
    "nights": 2,
    "transport": "A pie / Uber (ambos hostels a cuadras)",
    "cost": 0,
    "dailyBudget": 25,
    "category": "Caja de Ahorro",
    "costLvl": "Bajo",
    "core": "Negocios/Tech",
    "hack": "Con Dani 🏔️. Reserva confirmada. Hostel a&o Berlin Mitte. EFECTIVO AL LLEGAR. Booking: AOE-4-5177917.",
    "isConfirmed": true,
    "isFixed": true,
    "isDaniTrip": true,
    "hotelName": "a&o Berlin Mitte",
    "address": "Köpenicker Str. 127-129, Mitte",
    "confirmationNumber": "AOE-4-5177917",
    "accommodationCost": 46.66,
    "cashAlert": true,
    "photosAlbumUrl": "https://photos.app.goo.gl/bqesz5JUXJNN7Gp27"
  },
  {
    "id": "stop-amsterdam-mom",
    "city": "Ámsterdam (Países Bajos) 🇳🇱",
    "nights": 3,
    "transport": "Vuelo KLM (BER 17:30 → AMS 18:45)",
    "cost": 188,
    "dailyBudget": 55,
    "category": "Hub / Familiar",
    "costLvl": "Alto",
    "core": "Paisaje",
    "hack": "Viaje con Mamá 👩. Vuelo KLM BER→AMS 13 jul 17:30-18:45. ✈️ Booking: X2R8XY. Mozart Hotel. ✅ Confirmada.",
    "isConfirmed": true,
    "isFixed": true,
    "isMomTrip": true,
    "hotelName": "Mozart Hotel",
    "address": "Ámsterdam, Países Bajos",
    "accommodationCost": 504.93,
    "confirmationNumber": "X2R8XY",
    "flightDetails": "KLM | BER 17:30 → AMS 18:45 | Ticket: 07421397986 32 | USD 218.33",
    "itineraryQuestIds": [
      "quest-amsterdam-day1",
      "quest-amsterdam-day2",
      "quest-amsterdam-day3"
    ],
    "photosAlbumUrl": "https://photos.app.goo.gl/uZcQjoLVQM7iAYjw8"
  },
  {
    "id": "stop-brussels-mom",
    "city": "Bruselas (Bélgica) 🇧🇪",
    "nights": 3,
    "transport": "Tren",
    "cost": 0,
    "dailyBudget": 45,
    "category": "Hub / Familiar",
    "costLvl": "Alto",
    "core": "Paisaje",
    "hack": "Viaje con Mamá 👩. Numa Brussels Royal Galleries. ✅ Confirmada.",
    "isConfirmed": true,
    "isFixed": true,
    "isMomTrip": true,
    "hotelName": "Numa Brussels Royal Galleries",
    "address": "Bruselas, Bélgica",
    "accommodationCost": 536.28,
    "photosAlbumUrl": "https://photos.app.goo.gl/9Pix6ofhSL2vNmcp7"
  },
  {
    "id": "stop-prague-mom",
    "city": "Praga (Rep. Checa) 🇨🇿",
    "nights": 2,
    "transport": "Vuelo Brussels Airlines BRU→FRA→PRG (escala Frankfurt)",
    "cost": 0,
    "dailyBudget": 20,
    "category": "Hub / Familiar",
    "costLvl": "Medio",
    "core": "Paisaje",
    "hack": "Viaje con Mamá 👩. ✈️ BRU→PRG vía FRA, 18 jul. Booking: XLRM8T. Dolce Vita Suites Boutique. ✅ Confirmada.",
    "isConfirmed": true,
    "isFixed": true,
    "isMomTrip": true,
    "hotelName": "Dolce Vita Suites Boutique",
    "address": "Vejvodova 4, Prague 1",
    "accommodationCost": 196,
    "confirmationNumber": "XLRM8T",
    "flightDetails": "Brussels Airlines LH5673 BRU 14:25→FRA 15:35 + LH1400 FRA 16:50→PRG 17:50 | 18 jul 2026 | Pax: Paula + Ezequiel",
    "photosAlbumUrl": "https://photos.app.goo.gl/8jQg7rPV661ihE8h8"
  },
  {
    "id": "stop-vienna-mom",
    "city": "Viena (Austria) 🇦🇹",
    "nights": 2,
    "transport": "Tren",
    "cost": 0,
    "dailyBudget": 25,
    "category": "Hub / Familiar",
    "costLvl": "Medio",
    "core": "Paisaje",
    "hack": "Viaje con Mamá 👩. Hotel MOOONS Vienna.",
    "isConfirmed": true,
    "isFixed": true,
    "isMomTrip": true,
    "hotelName": "MOOONS Vienna",
    "address": "Wiedner Gürtel 16, Vienna",
    "accommodationCost": 239.57,
    "itineraryQuestIds": [
      "quest-vienna-day1",
      "quest-vienna-day2",
      "quest-vienna-day3"
    ],
    "photosAlbumUrl": "https://photos.app.goo.gl/4Ve4bgwM8KCPMXow6"
  },
  {
    "id": "stop-hallstatt-mom",
    "city": "Hallstatt / Obertraun (Austria) 🇦🇹",
    "nights": 2,
    "transport": "Tren",
    "cost": 0,
    "dailyBudget": 25,
    "category": "Hub / Familiar",
    "costLvl": "Alto",
    "core": "Paisaje",
    "hack": "Viaje con Mamá 👩. B&B Hallstatt Lake Obertraun.",
    "isConfirmed": true,
    "isFixed": true,
    "isMomTrip": true,
    "hotelName": "B&B Hallstatt Lake Obertraun",
    "address": "Seestrasse 177, Obertraun",
    "accommodationCost": 419.1,
    "photosAlbumUrl": "https://photos.app.goo.gl/gDiqRaWaFEh22Pj77"
  },
  {
    "id": "stop-transit-2",
    "city": "Múnich (Alemania) 🇩🇪",
    "nights": 4,
    "transport": "Interrail Global Pass",
    "cost": 0,
    "dailyBudget": 45,
    "category": "Caja de Ahorro",
    "costLvl": "Medio",
    "core": "Negocios/Tech",
    "hack": "Días de transición y trabajo remoto. Reserva confirmada. Wombat's City Hostel Munich Werksviertel, 6 Bed Mixed Dorm Ensuite (1 plaza), no reembolsable. Check-in 25 jul – check-out 29 jul 2026. Booking Hostelworld: 309348-578498291. Tel: +36 1883 50 30630. Email: bookmunich@wombats.eu.",
    "isConfirmed": true,
    "isFixed": true,
    "hotelName": "Wombat's City Hostel Munich Werksviertel",
    "address": "Atelierstraße 20, 81671 Munich, Germany",
    "accommodationCost": 94.06,
    "confirmationNumber": "309348-578498291",
    "lodgingCostNote": "€32.29 + €18.63 + €22.69 + €20.45 = €94.06 total (4 noches, 1 huésped, no reembolsable)",
    "photosAlbumUrl": "https://photos.app.goo.gl/EQ6zWdqjbsm5QWeN6"
  },
  {
    "id": "stop-norte-espana",
    "city": "Pueblos del Norte de España 🇪🇸",
    "nights": 5,
    "transport": "Auto de alquiler",
    "cost": 0,
    "dailyBudget": 30,
    "category": "Hub / Familiar",
    "costLvl": "Medio",
    "core": "Paisaje",
    "hack": "Con Mamá y Laura 👩. Reemplazó el plan original de Alpes con Dani. 29 jul – 3 ago.",
    "isFixed": true,
    "isMomTrip": true
  },
  {
    "id": "stop-madrid-2",
    "city": "Madrid (España)",
    "nights": 18,
    "transport": "Auto de alquiler / Tren",
    "cost": 0,
    "dailyBudget": 20,
    "category": "Hub / Familiar",
    "costLvl": "Bajo",
    "core": "Negocios/Tech",
    "hack": "Con Mamá y Laura 👩, y luego solo. 3 – 21 ago. Alojamiento gratis en familia.",
    "isFixed": true,
    "isMomTrip": true
  },
  {
    "id": "stop-roma",
    "city": "Roma (Italia) 🇮🇹",
    "nights": 4,
    "transport": "Vuelo / Tren",
    "cost": 0,
    "dailyBudget": 30,
    "category": "Premium & Networking",
    "costLvl": "Medio",
    "core": "Paisaje",
    "hack": "Solo. Coliseo y Foro Romano a solo €2 por ser Joven UE. Alojamiento: Free Hostels Rome.",
    "isConfirmed": true,
    "isFixed": true,
    "hotelName": "Free Hostels Rome",
    "address": "Roma, Italia"
  },
  {
    "id": "stop-bari",
    "city": "Bari / Puglia (Italia) 🇮🇹",
    "nights": 5,
    "transport": "Bus nocturno Itabus (Roma Tiburtina 23:25 → Bari 05:20)",
    "cost": 17.99,
    "dailyBudget": 30,
    "category": "Aventura y Naturaleza",
    "costLvl": "Medio",
    "core": "Paisaje",
    "hack": "Solo. La noche del 25 se pasó a bordo del bus nocturno (sin alojamiento). Reserva confirmada. Gatto Bianco le Dimore. Check-in: Mié 26 ago 15:00–23:00. Check-out: Dom 30 ago hasta las 10:30.",
    "isConfirmed": true,
    "isFixed": true,
    "hotelName": "Gatto Bianco le Dimore",
    "address": "Bari, Puglia, Italia",
    "accommodationCost": 350,
    "confirmationNumber": "OX3D7N",
    "flightDetails": "Itabus bus 1181 | Roma (Tiburtina Terminal Bus, Largo Guido Mazzoni) 25 ago 23:25 → Bari (FS Park, Via Capruzzi) 26 ago 05:20 | Asiento 62 · Wow! Comfort | €17,99 | Incluye 1 bolso de mano (42x30x18) + 1 valija de bodega (80x50x30, máx 20 kg)"
  },
  {
    "id": "stop-sorrento-final",
    "city": "Sorrento (Italia)",
    "nights": 2,
    "transport": "FlixBus Bari → Nápoles → Sorrento (2 tramos, transbordo en Nápoles) — COMPRADO, €44",
    "cost": 44,
    "dailyBudget": 40,
    "category": "Aventura y Naturaleza",
    "costLvl": "Medio",
    "core": "Paisaje",
    "isConfirmed": true,
    "flightDetails": "FlixBus Ruta 571: Bari (FS Park Via Capruzzi) 06:45 → Nápoles (FS Park Stazione Centrale) 09:50, asiento 20A | Transbordo 1h55 | FlixBus Ruta 563: Nápoles (FS Park Stazione Centrale) 11:45 → Sorrento 13:25, asiento 14C | 30 ago 2026 | €44",
    "hotelName": "Seven Hostel",
    "address": "Via Iommella Grande, Sant'Agnello, Sorrento, Italia",
    "confirmationNumber": "26673-579651838",
    "accommodationCost": 54.5,
    "lodgingCostNote": "$62.23 USD total ($9.31 pagado online, ~€45.64 a pagar en el hostel al llegar) · 8 Bed Mixed Dorm Ensuite",
    "hack": "Solo. 30 ago: llega 13:25 en FlixBus, recorre Sorrento a la tarde/noche. 31 ago: day-trip a Capri, ferry directo Sorrento (Marina Piccola)↔Capri ~20 min — la ruta más frecuente de toda la zona (30-40/día en temporada), duerme en Sorrento de nuevo (no tiene sentido cambiar de base el mismo día del day-trip). Capri descartado para dormir (~$200/noche)."
  },
  {
    "id": "stop-napoles-final",
    "city": "Nápoles / Costa Amalfitana (Italia)",
    "nights": 2,
    "transport": "Sorrento → Nápoles (Circumvesuviana, ~1h)",
    "cost": 0,
    "dailyBudget": 42,
    "category": "Aventura y Naturaleza",
    "costLvl": "Medio",
    "core": "Paisaje",
    "isConfirmed": true,
    "hotelName": "CX Naples Centrale",
    "address": "Via Galileo Ferraris 4, Napoli, Nápoles, Italia",
    "confirmationNumber": "332965-579670753",
    "accommodationCost": 70.12,
    "lodgingCostNote": "$80.07 USD total ($14.62 pagado, resto a pagar en el hostel) · Standard 6 Bed Mixed Dorm Ensuite · 01-03 sep, 2 noches",
    "hack": "Solo. 1 sep: centro histórico (Spaccanapoli, Via Toledo, Cappella Sansevero — reservar Cristo Velato online), pizza a la noche. 2 sep: Pompeya (tren ~30-40min) a la mañana, Castel Sant'Elmo al atardecer, cena temprana — último día completo antes de un despertar muy temprano, no forzar de más. 3 sep, 05:00-05:15: taxi/Uber PRE-RESERVADO al aeropuerto (ningún bus sirve a esa hora — el primer Alibus sale 06:30, tarde para el vuelo de las 07:25)."
  },
  {
    "id": "stop-londres-final",
    "city": "Londres (Reino Unido) 🇬🇧",
    "nights": 4,
    "transport": "Vuelo Nápoles (NAP) → Londres (STN), self-transfer vía Eindhoven — COMPRADO",
    "cost": 70.98,
    "dailyBudget": 75,
    "category": "Premium & Networking",
    "costLvl": "Alto",
    "core": "Paisaje",
    "isConfirmed": true,
    "confirmationNumber": "40-1082799443 / PIN 3315 (Booking.com, vuelo)",
    "flightDetails": "Ryanair FR6832 NAP→EIN 07:25→09:50 (€17.99) + self-transfer en Eindhoven (2h25, recoger y re-facturar equipaje) + Ryanair FR2533 EIN→STN 12:15→12:20 (€52.99) | 3 sep 2026 | Total $89.34",
    "hotelName": "Palmers Lodge - Swiss Cottage",
    "lodgingConfirmation": "14348-579652597",
    "accommodationCost": 152.53,
    "lodgingCostNote": "$174.15 USD total ($39.18 pagado, resto a pagar en el hostel) · Standard 8 Bed Mixed Dorm · 03-07 sep, 4 noches",
    "hack": "Solo (amigos se van a Barcelona, ya conocida). Última ciudad del viaje: prioridad sobre Norte de Italia porque no vuelve a Europa en 1-2 años y ya conoció Roma/Bari/Nápoles (más Italia = rendimiento decreciente); Londres es un mundo distinto (anglosajón). Vuelo de ida madrugador (sale 07:25 de Nápoles) — implica salir del alojamiento en Nápoles ~05:00-05:15 en taxi pre-reservado. 3 sep (llegada mediodía) + 4, 5, 6, 7 sep completos. UK ETA aprobada (ref 2020-0000-6070-3591, válida hasta 26 ago 2028, costó €24,30)."
  },
  {
    "id": "stop-madrid-cierre",
    "city": "Madrid (España)",
    "nights": 1,
    "transport": "Vuelo Londres (STN) → Madrid — COMPRADO, Ryanair FR499",
    "cost": 0,
    "dailyBudget": 15,
    "category": "Hub / Familiar",
    "costLvl": "Bajo",
    "core": "Negocios/Tech",
    "isConfirmed": true,
    "flightDetails": "Ryanair FR499 STN→MAD 20:45→00:15 (+1, llega 8 sep) | 7 sep 2026 | Precio no visible en la confirmación",
    "hack": "Cierre del viaje. Día completo en Londres el 7 sep, vuelo recién a las 20:45 — llega Madrid pasada la medianoche (ya 8 sep). El 8 queda con ~20h de colchón en Madrid con familia antes del vuelo internacional de las 20:00 (cambiado desde el 22 sep original).",
    "isFixed": true
  }
];

/** Semilla del perfil de viajero (países ya visitados antes de esta versión). */
export const DEFAULT_TRAVEL_PROFILE: TravelProfile = {
  "AR": {
    "visits": 1,
    "subs": [
      "caba",
      "ba"
    ]
  },
  "UY": {
    "visits": 1,
    "subs": []
  },
  "BR": {
    "visits": 1,
    "subs": []
  },
  "CL": {
    "visits": 1,
    "subs": []
  },
  "US": {
    "visits": 1,
    "subs": []
  },
  "ES": {
    "visits": 2,
    "subs": [
      "mad",
      "bal",
      "cat"
    ]
  },
  "FR": {
    "visits": 1,
    "subs": [
      "idf"
    ]
  },
  "IT": {
    "visits": 1,
    "subs": [
      "laz",
      "pug",
      "cam"
    ]
  },
  "VA": {
    "visits": 1,
    "subs": []
  },
  "DE": {
    "visits": 1,
    "subs": [
      "be",
      "by"
    ]
  },
  "AT": {
    "visits": 1,
    "subs": [
      "vie",
      "alt"
    ]
  },
  "NL": {
    "visits": 1,
    "subs": [
      "nh"
    ]
  },
  "BE": {
    "visits": 1,
    "subs": [
      "bru"
    ]
  },
  "CZ": {
    "visits": 1,
    "subs": [
      "pra"
    ]
  },
  "GB": {
    "visits": 1,
    "subs": [
      "eng"
    ]
  }
};

export const CITY_COORDINATES: Record<string, [number, number]> = {
  "Madrid (España)": [
    40.416775,
    -3.70379
  ],
  "Barcelona (España)": [
    41.385064,
    2.173403
  ],
  "Milán (Italia)": [
    45.464204,
    9.189982
  ],
  "Fráncfort (Alemania)": [
    50.110922,
    8.682127
  ],
  "Viena (Austria)": [
    48.208174,
    16.373819
  ],
  "Luxemburgo": [
    49.611621,
    6.131935
  ],
  "Liubliana (Eslovenia)": [
    46.056947,
    14.505751
  ],
  "Innsbruck (Austria)": [
    47.269212,
    11.404102
  ],
  "Interlaken / Zermatt (Suiza)": [
    46.686305,
    7.863205
  ],
  "Múnich / Garmisch (Alemania)": [
    48.135125,
    11.581981
  ],
  "Múnich y Alpes (Alemania) 🇩🇪": [
    48.135125,
    11.581981
  ],
  "Praga (República Checa)": [
    50.075538,
    14.4378
  ],
  "Praga (Rep. Checa) 🇨🇿": [
    50.075538,
    14.4378
  ],
  "Berlín (Alemania)": [
    52.520008,
    13.404954
  ],
  "Berlín (Alemania) 🇩🇪": [
    52.520008,
    13.404954
  ],
  "Budapest (Hungría)": [
    47.497912,
    19.040235
  ],
  "Ámsterdam (Países Bajos)": [
    52.367573,
    4.904138
  ],
  "Roma / Florencia (Italia)": [
    41.902783,
    12.496366
  ],
  "Roma (Italia) 🇮🇹": [
    41.902783,
    12.496366
  ],
  "Bari / Puglia (Italia) 🇮🇹": [
    41.117143,
    16.871871
  ],
  "Pueblos del Norte de España 🇪🇸": [
    43.262985,
    -2.925176
  ],
  "París (Francia)": [
    48.856614,
    2.352222
  ],
  "Ibiza (España) 🏝️": [
    38.908857,
    1.432378
  ],
  "Viena (Austria) 🇦🇹": [
    48.208174,
    16.373819
  ],
  "Hallstatt / Obertraun (Austria) 🇦🇹": [
    47.5556,
    13.6493
  ],
  "Parada de Tránsito (Praga)": [
    50.075538,
    14.4378
  ],
  "Parada de Tránsito (Múnich)": [
    48.135125,
    11.581981
  ],
  "Múnich (Alemania) 🇩🇪": [
    48.135125,
    11.581981
  ],
  "Bruselas (Bélgica)": [
    50.85034,
    4.35171
  ],
  "Nápoles / Costa Amalfitana (Italia)": [
    40.8518,
    14.2681
  ],
  "Sorrento (Italia)": [
    40.6267,
    14.3755
  ],
  "Londres (Reino Unido) 🇬🇧": [
    51.507351,
    -0.127758
  ],
  "Cinque Terre (Italia)": [
    44.1279,
    9.7095
  ],
  "Venecia (Italia)": [
    45.4408,
    12.3155
  ],
  "Niza / Costa Azul (Francia)": [
    43.7102,
    7.262
  ],
  "Lisboa (Portugal)": [
    38.7223,
    -9.1393
  ],
  "Oporto (Portugal)": [
    41.1579,
    -8.6291
  ],
  "Split / Dalmacia (Croacia)": [
    43.5081,
    16.4402
  ],
  "Atenas (Grecia)": [
    37.9838,
    23.7275
  ],
  "Cracovia (Polonia)": [
    50.0647,
    19.945
  ],
  "Copenhague (Dinamarca)": [
    55.6761,
    12.5683
  ]
};
