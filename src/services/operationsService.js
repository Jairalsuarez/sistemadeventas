import { supabase, supabaseReady } from "./supabaseclient";
import {
  normalizeCommunityFeedback,
  normalizeExpenseCategory,
  normalizeDistributor,
  normalizeExpense,
  normalizeNotification,
  normalizeSale,
  normalizeSchedule,
  normalizeShift,
  normalizeWalletMovement,
  normalizeWalletState,
  safeNumber,
} from "./normalizers.js";

export async function fetchRemoteCommunityFeedback() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("community_feedback")
    .select("id,comment,created_at")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) return { ok: false, error: error.message };
  return { ok: true, feedbacks: (data || []).map(normalizeCommunityFeedback) };
}

export async function createRemoteCommunityFeedback(feedback) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    comment: feedback.comment,
  };

  const { data, error } = await supabase
    .from("community_feedback")
    .insert(payload)
    .select("id,comment,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, feedback: normalizeCommunityFeedback(data) };
}

export async function deleteRemoteCommunityFeedback(id) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { error } = await supabase.from("community_feedback").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchRemoteNotifications() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("notifications")
    .select("id,tipo,mensaje,actor_id,leido,created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return { ok: false, error: error.message };
  return { ok: true, notifications: (data || []).map(normalizeNotification) };
}

export async function fetchRemoteShifts() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("shifts")
    .select("id,user_id,user_name,estado,saldo_inicial,saldo_final,total_ventas,started_at,closed_at")
    .order("started_at", { ascending: false });

  if (error) return { ok: false, error: error.message };
  return { ok: true, shifts: (data || []).map(normalizeShift) };
}

export async function fetchRemoteWalletState() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase.from("wallet_state").select("id,saldo_actual,updated_at").eq("id", "principal").maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "No existe wallet_state principal." };
  return { ok: true, wallet: normalizeWalletState(data) };
}

export async function fetchRemoteSales() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select("id,shift_id,user_id,total,payment_method,payment_evidence_url,payment_evidence_name,created_at,profiles(nombre,apellido)")
    .order("created_at", { ascending: false });

  if (salesError) return { ok: false, error: salesError.message };
  if (!sales?.length) return { ok: true, sales: [] };

  const saleIds = sales.map((sale) => sale.id);
  const { data: items, error: itemsError } = await supabase
    .from("sale_items")
    .select("id,sale_id,product_id,nombre,precio,cantidad,subtotal")
    .in("sale_id", saleIds);

  if (itemsError) return { ok: false, error: itemsError.message };

  const salesMap = new Map(sales.map((sale) => [sale.id, []]));
  (items || []).forEach((item) => {
    const list = salesMap.get(item.sale_id) || [];
    list.push(item);
    salesMap.set(item.sale_id, list);
  });

  return { ok: true, sales: sales.map((sale) => normalizeSale(sale, salesMap.get(sale.id) || [])) };
}

export async function createRemoteSale(sale) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const salePayload = {
    shift_id: sale.shiftId,
    user_id: sale.userId,
    total: safeNumber(sale.total),
    payment_method: sale.paymentMethod || "efectivo",
    payment_evidence_url: sale.paymentEvidenceUrl || null,
    payment_evidence_name: sale.paymentEvidenceName || null,
    created_at: sale.createdAt,
  };

  const { data: createdSale, error: saleError } = await supabase
    .from("sales")
    .insert(salePayload)
    .select("id,shift_id,user_id,total,payment_method,payment_evidence_url,payment_evidence_name,created_at,profiles(nombre,apellido)")
    .single();

  if (saleError) return { ok: false, error: saleError.message };

  const itemPayload = sale.items.map((item) => ({
    sale_id: createdSale.id,
    product_id: item.productId,
    nombre: item.nombre,
    precio: safeNumber(item.precio),
    cantidad: safeNumber(item.cantidad),
    subtotal: safeNumber(item.subtotal),
  }));

  const { data: createdItems, error: itemError } = await supabase
    .from("sale_items")
    .insert(itemPayload)
    .select("id,sale_id,product_id,nombre,precio,cantidad,subtotal");

  if (itemError) return { ok: false, error: itemError.message };
  return { ok: true, sale: normalizeSale(createdSale, createdItems || []) };
}

export async function fetchRemoteExpenses() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("expenses")
    .select("id,categoria,descripcion,detalle_oferta,distributor_id,distributor_name,evidence_url,evidence_name,cantidad,unit_cost,confirmation_accepted,monto,user_id,created_at,profiles(nombre,apellido)")
    .order("created_at", { ascending: false });

  if (error) return { ok: false, error: error.message };
  return { ok: true, expenses: (data || []).map(normalizeExpense) };
}

export async function fetchRemoteExpenseCategories() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("expense_categories")
    .select("id,nombre,created_by,created_at")
    .order("nombre", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, categories: (data || []).map(normalizeExpenseCategory) };
}

export async function createRemoteExpenseCategory(category) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    nombre: category.nombre,
    created_by: category.createdBy || null,
  };

  const { data, error } = await supabase
    .from("expense_categories")
    .insert(payload)
    .select("id,nombre,created_by,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, category: normalizeExpenseCategory(data) };
}

export async function createRemoteExpense(expense) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    categoria: expense.categoria,
    descripcion: expense.descripcion,
    detalle_oferta: expense.detalleOferta || null,
    distributor_id: expense.distributorId || null,
    distributor_name: expense.distributorName || null,
    evidence_url: expense.evidenceUrl || null,
    evidence_name: expense.evidenceName || null,
    cantidad: safeNumber(expense.cantidad),
    unit_cost: safeNumber(expense.unitCost),
    confirmation_accepted: Boolean(expense.confirmationAccepted),
    monto: safeNumber(expense.monto),
    user_id: expense.userId,
    created_at: expense.createdAt,
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert(payload)
    .select("id,categoria,descripcion,detalle_oferta,distributor_id,distributor_name,evidence_url,evidence_name,cantidad,unit_cost,confirmation_accepted,monto,user_id,created_at,profiles(nombre,apellido)")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, expense: normalizeExpense(data) };
}

export async function fetchRemoteDistributors() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("distributors")
    .select("id,nombre,telefono,notas,created_by,created_at")
    .order("nombre", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, distributors: (data || []).map(normalizeDistributor) };
}

export async function createRemoteDistributor(distributor) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    nombre: distributor.nombre,
    telefono: distributor.telefono || null,
    notas: distributor.notas || null,
    created_by: distributor.createdBy || null,
  };

  const { data, error } = await supabase
    .from("distributors")
    .insert(payload)
    .select("id,nombre,telefono,notas,created_by,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, distributor: normalizeDistributor(data) };
}

export async function upsertRemoteWalletState(wallet, userId) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const payload = {
    id: "principal",
    saldo_actual: safeNumber(wallet.saldoActual),
    updated_at: new Date().toISOString(),
    updated_by: userId || null,
  };

  const { data, error } = await supabase.from("wallet_state").upsert(payload).select("id,saldo_actual,updated_at").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, wallet: normalizeWalletState(data) };
}

export async function createRemoteWalletMovement(movement) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const payload = {
    tipo: movement.tipo,
    monto: safeNumber(movement.monto),
    descripcion: movement.descripcion || null,
    created_by: movement.createdBy || null,
  };

  const { data, error } = await supabase
    .from("wallet_movements")
    .insert(payload)
    .select("id,tipo,monto,descripcion,created_by,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, movement: normalizeWalletMovement(data) };
}

export async function fetchRemoteSchedules() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("schedules")
    .select("id,fecha,inicio,fin,responsable,turno,notas,estado,created_at")
    .order("fecha", { ascending: true })
    .order("inicio", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, schedules: (data || []).map(normalizeSchedule) };
}

export async function createRemoteSchedule(schedule) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    id: schedule.id,
    fecha: schedule.fecha,
    inicio: schedule.inicio,
    fin: schedule.fin,
    responsable: schedule.responsable,
    turno: schedule.turno,
    notas: schedule.notas,
    estado: schedule.estado,
  };
  const { data, error } = await supabase
    .from("schedules")
    .insert(payload)
    .select("id,fecha,inicio,fin,responsable,turno,notas,estado,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, schedule: normalizeSchedule(data) };
}

export async function updateRemoteScheduleStatus(id, estado) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("schedules")
    .update({ estado })
    .eq("id", id)
    .select("id,fecha,inicio,fin,responsable,turno,notas,estado,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, schedule: normalizeSchedule(data) };
}

export async function deleteRemoteSchedule(id) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createRemoteShift(shift) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    user_id: shift.userId,
    user_name: shift.userName,
    estado: shift.estado,
    saldo_inicial: safeNumber(shift.saldoInicial),
    saldo_final: shift.saldoFinal,
    total_ventas: safeNumber(shift.totalVentas),
    started_at: shift.startedAt,
    closed_at: shift.closedAt,
  };
  const { data, error } = await supabase
    .from("shifts")
    .insert(payload)
    .select("id,user_id,user_name,estado,saldo_inicial,saldo_final,total_ventas,started_at,closed_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, shift: normalizeShift(data) };
}

export async function updateRemoteShift(shift) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    estado: shift.estado,
    saldo_inicial: safeNumber(shift.saldoInicial),
    saldo_final: shift.saldoFinal,
    total_ventas: safeNumber(shift.totalVentas),
    closed_at: shift.closedAt,
  };
  const { data, error } = await supabase
    .from("shifts")
    .update(payload)
    .eq("id", shift.id)
    .select("id,user_id,user_name,estado,saldo_inicial,saldo_final,total_ventas,started_at,closed_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, shift: normalizeShift(data) };
}
