import { supabaseReady } from "./supabaseclient";
import { createNotice, DEFAULT_LOGO, normalizeCommunityFeedback, normalizeProduct } from "./normalizers.js";

const APP_KEY = "ventas-app-v2";
const BUSINESS_CONTACT = {
  telefono: "+593981305654",
  whatsapp: "593981305654",
  horario: "Lunes a Domingo - 09:00 - 22:00",
};

function seed() {
  const localUsers = supabaseReady
    ? []
    : [
        {
          id: crypto.randomUUID(),
          nombre: "Administrador",
          apellido: "Principal",
          telefono: "593999999998",
          email: "admin@saborestropicales.app",
          role: "admin",
          avatarUrl: "",
          password: "admin123",
          source: "local",
        },
        {
          id: crypto.randomUUID(),
          nombre: "Vendedor",
          apellido: "Principal",
          telefono: "593999999997",
          email: "vendedor@saborestropicales.app",
          role: "vendedor",
          avatarUrl: "",
          password: "vendedor123",
          source: "local",
        },
      ];

  return {
    business: {
      nombre: "Sabores Tropicales y Algo Más",
      descripcion: "Panel comercial para ventas, inventario, clientes, turnos y control del negocio.",
      telefono: BUSINESS_CONTACT.telefono,
      whatsapp: BUSINESS_CONTACT.whatsapp,
      ubicacion: "Buena Fe, Ecuador",
      horario: BUSINESS_CONTACT.horario,
      mapaUrl: "https://maps.google.com",
      instagramUrl: "https://instagram.com",
      facebookUrl: "https://facebook.com",
      logoUrl: DEFAULT_LOGO,
      featuredProductId: null,
    },
    wallet: { saldoActual: 0, updatedAt: new Date().toISOString() },
    users: localUsers,
    products: [
      normalizeProduct({
        id: crypto.randomUUID(),
        nombre: "Jugo de mango",
        categoria: "Jugos",
        marca: "Sabores Tropicales",
        descripcion: "Preparado fresco con fruta natural y servido al momento.",
        precio: 2.5,
        stock: 12,
        imagen_url: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80",
        activo: true,
      }),
      normalizeProduct({
        id: crypto.randomUUID(),
        nombre: "Batido de fresa",
        categoria: "Batidos",
        marca: "Sabores Tropicales",
        descripcion: "Textura cremosa y sabor dulce para media tarde.",
        precio: 3.25,
        stock: 7,
        imagen_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=80",
        activo: true,
      }),
      normalizeProduct({
        id: crypto.randomUUID(),
        nombre: "Combo tropical",
        categoria: "Combos",
        marca: "Sabores Tropicales",
        descripcion: "Fruta fresca, snack y bebida para una venta rapida.",
        precio: 4.8,
        stock: 5,
        imagen_url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=1200&q=80",
        activo: true,
      }),
    ],
    sales: [],
    expenses: [],
    expenseCategories: [
      { id: crypto.randomUUID(), nombre: "Mercaderia", createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), nombre: "Servicios", createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), nombre: "Pagos", createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), nombre: "Inversion", createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), nombre: "Transporte", createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), nombre: "Otros", createdAt: new Date().toISOString() },
    ],
    distributors: [
      { id: crypto.randomUUID(), nombre: "Distribuidora Central", telefono: "", notas: "", createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), nombre: "Frutas del Litoral", telefono: "", notas: "", createdAt: new Date().toISOString() },
    ],
    turnos: [],
    schedules: [],
    communityFeedbacks: [
      normalizeCommunityFeedback({
        id: crypto.randomUUID(),
        comment: "La atencion fue rapida y el pedido llego fresco. Me gusto que todo se entienda facil desde la tienda.",
      }),
      normalizeCommunityFeedback({
        id: crypto.randomUUID(),
        comment: "Buena variedad y precios claros. Seria lindo ver mas recomendaciones del dia.",
      }),
      normalizeCommunityFeedback({
        id: crypto.randomUUID(),
        comment: "Me sirvio mucho poder pedir por WhatsApp sin perder tiempo. Todo estuvo bastante ordenado.",
      }),
    ],
    notifications: [createNotice("La jornada está lista para comenzar.", "Sabores Tropicales")],
  };
}

export function getAppData() {
  try {
    const raw = localStorage.getItem(APP_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) return seed();
    const merged = { ...seed(), ...parsed };
    merged.business = { ...seed().business, ...(parsed.business || {}), ...BUSINESS_CONTACT };
    if (supabaseReady) {
      merged.users = [];
      merged.products = [];
      merged.sales = [];
      merged.expenses = [];
      merged.turnos = [];
      merged.schedules = [];
      merged.notifications = [];
      merged.communityFeedbacks = [];
      merged.distributors = [];
    }
    return merged;
  } catch {
    return seed();
  }
}

export function saveAppData(data) {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}
