// Apartados persistidos directamente en la base de datos con sincronización en vivo.
// La caché en memoria solo refleja la base y se rehidrata antes de escribir.

import { supabase } from "@/integrations/supabase/client";

export type ReservationStatus = "pending" | "paid" | "frozen";

export type ReservationReceipt = {
  name: string;
  type: string;
  dataUrl?: string;
  uploadedAt: number;
};

export type Reservation = {
  id: string;
  name: string | null;
  phone: string; // solo dígitos
  tickets: number[];
  createdAt: number; // ms epoch
  status?: ReservationStatus;
  receipt?: ReservationReceipt;
  note?: string | null;
};

type Row = {
  id: string;
  name: string | null;
  phone: string;
  tickets: number[];
  status: string | null;
  receipt?: ReservationReceipt | null;
  receipt_meta?: ReservationReceipt | null;
  created_at: string;
  note?: string | null;
};

export const EXPIRY_MS = 12 * 60 * 60 * 1000;
const RESERVATIONS_FETCH_LIMIT = 5000;

function rowToReservation(row: Row): Reservation {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    tickets: Array.isArray(row.tickets) ? [...row.tickets].sort((a, b) => a - b) : [],
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    status: (row.status as ReservationStatus) ?? "pending",
    receipt: row.receipt ?? row.receipt_meta ?? undefined,
    note: row.note ?? null,
  };
}

const LIGHT_SELECT = "id,name,phone,tickets,status,receipt_meta,created_at,note";

// ---------- Cache + realtime ----------

const cache = new Map<string, Reservation>();
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;
let realtimeBound = false;
const LEGACY_MIGRATION_FLAG = "rifa.reservations.supabase-migrated.v2";

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("rifa:reservations-updated"));
}

function upsert(r: Reservation) {
  cache.set(r.id, r);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseTickets(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 1000)
      .sort((a, b) => a - b);
  }
  if (typeof value === "string") {
    return value
      .split(/[^0-9]+/)
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 1000)
      .sort((a, b) => a - b);
  }
  return [];
}

function extractLegacyItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const obj = value as Record<string, unknown>;
  if (Array.isArray(obj.reservations)) return obj.reservations;
  if (Array.isArray(obj.apartados)) return obj.apartados;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.phone || obj.whatsapp || obj.celular) return [obj];
  return Object.values(obj).filter((item) => item && typeof item === "object");
}

function normalizeLegacyItem(item: unknown): Omit<Reservation, "id"> & { id?: string } | null {
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;
  const phone = normalizePhone(String(obj.phone ?? obj.whatsapp ?? obj.celular ?? ""));
  const tickets = parseTickets(obj.tickets ?? obj.ticket_ids ?? obj.numbers ?? obj.numeros ?? obj.selected);
  if (phone.length < 10 || tickets.length === 0) return null;

  const rawDate = obj.createdAt ?? obj.created_at ?? obj.date ?? obj.timestamp;
  const createdAt =
    typeof rawDate === "number"
      ? rawDate
      : typeof rawDate === "string" && !Number.isNaN(new Date(rawDate).getTime())
        ? new Date(rawDate).getTime()
        : Date.now();
  const status = obj.status === "paid" || obj.status === "pagado" ? "paid" : "pending";
  const receipt = (obj.receipt ?? obj.comprobante) as ReservationReceipt | undefined;

  return {
    id: isUuid(obj.id) ? obj.id : undefined,
    name: typeof obj.name === "string" ? obj.name : typeof obj.nombre === "string" ? obj.nombre : null,
    phone,
    tickets,
    createdAt,
    status,
    receipt: receipt && typeof receipt === "object" ? receipt : undefined,
  };
}

function sameTickets(a: number[], b: number[]) {
  return a.length === b.length && a.every((ticket, index) => ticket === b[index]);
}

function existsInCache(candidate: Omit<Reservation, "id"> & { id?: string }) {
  return Array.from(cache.values()).some(
    (r) =>
      (candidate.id && r.id === candidate.id) ||
      (r.phone === candidate.phone && sameTickets(r.tickets, candidate.tickets)),
  );
}

async function migrateLegacyLocalReservations() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(LEGACY_MIGRATION_FLAG)) return;

  const candidates: Array<Omit<Reservation, "id"> & { id?: string }> = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i) ?? "";
    const lowerKey = key.toLowerCase();
    if (lowerKey.startsWith("sb-") || lowerKey.includes("supabase")) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    if (
      !lowerKey.includes("rifa") &&
      !lowerKey.includes("reservation") &&
      !lowerKey.includes("apart") &&
      !raw.includes("tickets") &&
      !raw.includes("ticket_ids")
    ) {
      continue;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      for (const item of extractLegacyItems(parsed)) {
        const normalized = normalizeLegacyItem(item);
        if (normalized && !existsInCache(normalized)) candidates.push(normalized);
      }
    } catch {
      // No era JSON de apartados.
    }
  }

  if (candidates.length === 0) {
    window.localStorage.setItem(LEGACY_MIGRATION_FLAG, "empty");
    return;
  }

  for (const candidate of candidates) {
    if (existsInCache(candidate)) continue;
    const insertPayload = {
      ...(candidate.id ? { id: candidate.id } : {}),
      name: candidate.name,
      phone: candidate.phone,
      tickets: candidate.tickets,
      status: candidate.status ?? "pending",
      receipt: candidate.receipt ?? null,
      created_at: new Date(candidate.createdAt).toISOString(),
    };
    const { data, error } = await supabase.from("reservations").insert(insertPayload).select(LIGHT_SELECT).single();
    if (error) {
      console.error("[reservations] legacy migration failed", error);
      return;
    }
    if (data) upsert(rowToReservation(data as Row));
  }
  window.localStorage.setItem(LEGACY_MIGRATION_FLAG, new Date().toISOString());
  emit();
}

function bindRealtime() {
  if (realtimeBound || typeof window === "undefined") return;
  realtimeBound = true;
  supabase
    .channel("reservations-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reservations" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          const old = payload.old as { id?: string } | null;
          if (old?.id) cache.delete(old.id);
        } else {
          const row = payload.new as Row;
          if (row?.id) upsert(rowToReservation(row));
        }
        emit();
      },
    )
    .subscribe();
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = (async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select(LIGHT_SELECT)
      .order("created_at", { ascending: false })
      .range(0, RESERVATIONS_FETCH_LIMIT - 1);
    if (error) {
      console.error("[reservations] fetch failed", error);
      hydrationPromise = null;
      throw error;
    }
    if ((data?.length ?? 0) >= RESERVATIONS_FETCH_LIMIT) {
      console.warn("[reservations] fetch reached row limit; increase RESERVATIONS_FETCH_LIMIT.");
    }
    cache.clear();
    for (const row of (data ?? []) as Row[]) upsert(rowToReservation(row));
    await migrateLegacyLocalReservations();
    hydrated = true;
    bindRealtime();
    emit();
  })();
  return hydrationPromise;
}

/** Arranca la hidratación en background. Llamar en montaje de las páginas. */
export function initReservations(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  bindRealtime();
  return hydrate();
}

/** True cuando la caché ya se sincronizó con la base al menos una vez. */
export function isReservationsReady(): boolean {
  return hydrated;
}

// ---------- Selectores síncronos sobre la caché ----------

function isActive(r: Reservation): boolean {
  if (r.status === "paid") return true;
  if (r.status === "frozen") return true;
  if (r.receipt) return true;
  return Date.now() - r.createdAt < EXPIRY_MS;
}

export function getActiveReservations(): Reservation[] {
  return Array.from(cache.values()).filter(isActive);
}

export function getAllReservations(): Reservation[] {
  return Array.from(cache.values());
}

export function getTakenTickets(): Set<number> {
  const set = new Set<number>();
  for (const r of getActiveReservations()) {
    for (const t of r.tickets) set.add(t);
  }
  return set;
}

export function findByPhone(phone: string): Reservation[] {
  const target = normalizePhone(phone);
  if (!target) return [];
  return getActiveReservations().filter((r) => r.phone === target);
}

/**
 * Busca apartados activos por celular o nombre.
 * - Si la query parece celular (>=7 dígitos tras normalizar), coincide por inclusión de dígitos.
 * - También coincide por nombre (case-insensitive, includes).
 */
export function findByQuery(query: string): Reservation[] {
  const raw = query.trim();
  if (!raw) return [];
  const digits = normalizePhone(raw);
  const nameNeedle = raw.toLowerCase();
  return getActiveReservations().filter((r) => {
    const phoneMatch = digits.length >= 4 && r.phone.includes(digits);
    const nameMatch = (r.name ?? "").toLowerCase().includes(nameNeedle);
    return phoneMatch || nameMatch;
  });
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

// ---------- Mutaciones (async) ----------

export async function addReservation(input: {
  name: string | null;
  phone: string;
  tickets: number[];
}): Promise<Reservation> {
  const tickets = [...input.tickets].sort((a, b) => a - b);
  await refreshReservations();
  const conflict = tickets.find((ticket) => getTakenTickets().has(ticket));
  if (conflict) {
    throw new Error(`El boleto ${conflict.toString().padStart(3, "0")} ya fue apartado.`);
  }

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      name: input.name,
      phone: normalizePhone(input.phone),
      tickets,
      status: "pending",
    })
    .select(LIGHT_SELECT)
    .single();
  if (error || !data) {
    console.error("[reservations] insert failed", error);
    throw error ?? new Error("No se pudo registrar el apartado.");
  }
  const r = rowToReservation(data as Row);
  upsert(r);
  emit();
  return r;
}

export async function attachReceipt(
  id: string,
  receipt: { name: string; type: string; dataUrl: string },
): Promise<void> {
  const payload: ReservationReceipt = { ...receipt, uploadedAt: Date.now() };
  const { data, error } = await supabase
    .from("reservations")
    .update({ receipt: payload })
    .eq("id", id)
    .select(LIGHT_SELECT)
    .single();
  if (error) {
    console.error("[reservations] attachReceipt failed", error);
    throw error;
  }
  if (data) upsert(rowToReservation(data as Row));
  emit();
}

export async function setStatus(
  id: string,
  status: ReservationStatus,
  options?: { note?: string | null },
): Promise<void> {
  const patch: { status: ReservationStatus; note?: string | null } = { status };
  if (options && "note" in options) patch.note = options.note ?? null;
  const { data, error } = await supabase
    .from("reservations")
    .update(patch)
    .eq("id", id)
    .select(LIGHT_SELECT)
    .single();
  if (error) {
    console.error("[reservations] setStatus failed", error);
    throw error;
  }
  if (data) upsert(rowToReservation(data as Row));
  emit();
}

export async function freezeReservation(id: string, note?: string | null): Promise<void> {
  return setStatus(id, "frozen", { note: note ?? null });
}

export async function updateNote(id: string, note: string | null): Promise<void> {
  const { data, error } = await supabase
    .from("reservations")
    .update({ note: note ?? null })
    .eq("id", id)
    .select(LIGHT_SELECT)
    .single();
  if (error) {
    console.error("[reservations] updateNote failed", error);
    throw error;
  }
  if (data) upsert(rowToReservation(data as Row));
  emit();
}

export async function deleteReservation(id: string): Promise<void> {
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) {
    console.error("[reservations] delete failed", error);
    throw error;
  }
  cache.delete(id);
  emit();
}

export async function getReservationReceipt(id: string): Promise<ReservationReceipt | null> {
  const { data, error } = await supabase
    .from("reservations")
    .select("receipt")
    .eq("id", id)
    .single();
  if (error) {
    console.error("[reservations] receipt fetch failed", error);
    throw error;
  }
  return (data?.receipt as ReservationReceipt | null) ?? null;
}

/** Recarga manual desde la base. */
export async function refreshReservations(): Promise<void> {
  hydrated = false;
  hydrationPromise = null;
  await hydrate();
}

// ---------- Utilidades de tiempo ----------

export function timeLeftMs(r: Reservation): number | null {
  if (r.status === "paid" || r.status === "frozen") return null;
  if (r.receipt) return null;
  return Math.max(0, EXPIRY_MS - (Date.now() - r.createdAt));
}

export function formatTimeLeft(ms: number) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
