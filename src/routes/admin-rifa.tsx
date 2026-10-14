import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getAllReservations,
  setStatus,
  freezeReservation,
  updateNote,
  deleteReservation,
  timeLeftMs,
  formatTimeLeft,
  EXPIRY_MS,
  refreshReservations,
  getReservationReceipt,
  type Reservation,
} from "@/lib/reservations";
import { FlyersPanel } from "@/components/Flyers";
import { DrawPanel } from "@/components/DrawPanel";
import { getGoldenTicket, isGoldenTicket } from "@/lib/goldenTickets";

// Contraseña simple para acceso interno. Cambiar aquí cuando se necesite.
const ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD ?? "";
const AUTH_KEY = "rifa.admin.auth.v1";

export const Route = createFileRoute("/admin-rifa")({
  head: () => ({
    meta: [
      { title: "Admin · Rifa Persona beneficiaria" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminRifa,
});

function pad(n: number) {
  return n.toString().padStart(3, "0");
}

function AdminRifa() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ADMIN_PASSWORD && window.sessionStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
  }, []);

  function onLogin(e: React.FormEvent) {
    e.preventDefault();
    if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setError(null);
    } else {
      setError("Contraseña incorrecta.");
    }
  }

  function logout() {
    window.sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword("");
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <form
          onSubmit={onLogin}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald">
            Panel interno
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-emerald-deep">Admin Rifa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa la contraseña para administrar los apartados.
          </p>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30"
          />
          {error && (
            <p className="mt-2 text-xs font-semibold text-destructive">{error}</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-soft)] active:scale-95"
            style={{ background: "var(--emerald)" }}
          >
            Entrar
          </button>
          <Link
            to="/"
            className="mt-3 block text-center text-xs font-semibold text-muted-foreground hover:text-emerald-deep"
          >
            ← Volver al inicio
          </Link>
        </form>
      </div>
    );
  }

  return <AdminPanel onLogout={logout} />;
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "frozen" | "urgent">("all");
  const [tab, setTab] = useState<"apartados" | "sorteo">("apartados");
  const [search, setSearch] = useState("");

  // Umbral de "urgente": pendiente sin comprobante y a menos de 2h de liberarse.
  const URGENT_THRESHOLD_MS = 2 * 60 * 60 * 1000;

  function refresh() {
    setList(getAllReservations());
  }

  async function loadLatest(showLoading = false) {
    if (showLoading) setLoading(true);
    try {
      await refreshReservations();
      refresh();
      setLoadError(null);
    } catch (error) {
      console.error("[reservations] admin sync failed", error);
      setLoadError("No se pudo sincronizar. Toca Refrescar para intentar de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void loadLatest(false).finally(() => {
      if (!cancelled) setLoading(false);
    });
    const onUpdate = () => refresh();
    window.addEventListener("rifa:reservations-updated", onUpdate);
    const id = setInterval(() => {
      setTick((t) => t + 1);
      void loadLatest(false);
    }, 30_000);
    return () => {
      cancelled = true;
      window.removeEventListener("rifa:reservations-updated", onUpdate);
      clearInterval(id);
    };
  }, []);

  void tick;

  function isUrgent(r: Reservation): boolean {
    if (r.status === "paid" || r.status === "frozen") return false;
    if (r.receipt) return false;
    const left = timeLeftMs(r);
    return left !== null && left > 0 && left <= URGENT_THRESHOLD_MS;
  }

  const filtered = useMemo(() => {
    let sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "paid") sorted = sorted.filter((r) => r.status === "paid");
    else if (filter === "frozen") sorted = sorted.filter((r) => r.status === "frozen");
    else if (filter === "pending")
      sorted = sorted.filter((r) => r.status !== "paid" && r.status !== "frozen");
    else if (filter === "urgent") {
      sorted = sorted
        .filter(isUrgent)
        .sort((a, b) => (timeLeftMs(a) ?? 0) - (timeLeftMs(b) ?? 0));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      const digits = q.replace(/\D/g, "");
      sorted = sorted.filter((r) => {
        const nameMatch = (r.name ?? "").toLowerCase().includes(q);
        const phoneMatch = digits.length >= 2 && r.phone.includes(digits);
        return nameMatch || phoneMatch;
      });
    }
    return sorted;
  }, [list, filter, search]);

  const stats = useMemo(() => {
    const paid = list.filter((r) => r.status === "paid").length;
    const frozen = list.filter((r) => r.status === "frozen").length;
    const pending = list.length - paid - frozen;
    const urgent = list.filter(isUrgent).length;
    const ticketsSold = list
      .filter((r) => r.status === "paid")
      .reduce((acc, r) => acc + r.tickets.length, 0);
    return { paid, frozen, pending, urgent, ticketsSold, total: list.length };
  }, [list, tick]);

  function notifyPago(event: string, r: Reservation) {
    const PAGO_URL =
      (import.meta as any).env?.VITE_WEBHOOK_PAGO_URL ??
      "";
    if (!PAGO_URL) return;
    const payload = {
      event,
      reservation_id: r.id,
      name: r.name,
      phone: r.phone,
      tickets: r.tickets,
      total_mxn: r.tickets.length * 100,
      status: r.status ?? "pending",
      submitted_at: new Date().toISOString(),
    };
    fetch(PAGO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      fetch(PAGO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
        keepalive: true,
      }).catch(() => {});
    });
  }

  async function approve(r: Reservation) {
    try {
      await setStatus(r.id, "paid");
      notifyPago("approved", { ...r, status: "paid" });
      refresh();
    } catch {
      alert("No se pudo aprobar. Intenta de nuevo.");
    }
  }
  async function reject(r: Reservation) {
    if (!confirm(`¿Liberar boletos ${r.tickets.map(pad).join(", ")} de ${r.name ?? r.phone}?`)) return;
    notifyPago("rejected", r);
    try {
      await deleteReservation(r.id);
      refresh();
    } catch {
      alert("No se pudo liberar. Intenta de nuevo.");
    }
  }
  async function remove(r: Reservation) {
    if (!confirm(`¿Eliminar definitivamente el registro de ${r.name ?? r.phone}?`)) return;
    notifyPago("deleted", r);
    try {
      await deleteReservation(r.id);
      refresh();
    } catch {
      alert("No se pudo eliminar. Intenta de nuevo.");
    }
  }
  async function freeze(r: Reservation) {
    const defaultNote = r.note ?? "";
    const note = window.prompt(
      `Congelar apartado de ${r.name ?? r.phone}.\nEscribe una nota breve (opcional):`,
      defaultNote,
    );
    if (note === null) return; // cancelado
    try {
      await freezeReservation(r.id, note.trim() || null);
      notifyPago("frozen", { ...r, status: "frozen" });
      refresh();
    } catch {
      alert("No se pudo congelar. Intenta de nuevo.");
    }
  }
  async function unfreeze(r: Reservation) {
    try {
      await setStatus(r.id, "pending");
      notifyPago("unfrozen", { ...r, status: "pending" });
      refresh();
    } catch {
      alert("No se pudo descongelar. Intenta de nuevo.");
    }
  }
  async function saveNote(r: Reservation) {
    const note = window.prompt(`Editar nota para ${r.name ?? r.phone}:`, r.note ?? "");
    if (note === null) return;
    try {
      await updateNote(r.id, note.trim() || null);
      refresh();
    } catch {
      alert("No se pudo guardar la nota.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="border-b"
        style={{
          background:
            "linear-gradient(135deg, var(--emerald-deep), color-mix(in oklab, var(--emerald-deep) 75%, black))",
          color: "white",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              Panel interno
            </p>
            <h1 className="text-xl font-extrabold sm:text-2xl">Admin Rifa</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/10"
            >
              Inicio
            </Link>
            <button
              onClick={onLogout}
              className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/10"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
          <TabBtn active={tab === "apartados"} onClick={() => setTab("apartados")}>
            📋 Apartados
          </TabBtn>
          <TabBtn active={tab === "sorteo"} onClick={() => setTab("sorteo")}>
            🎰 Sorteo
          </TabBtn>
        </div>

        {tab === "sorteo" ? (
          <DrawPanel />
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-6">
              <StatCard label="Apartados" value={stats.total} />
              <StatCard label="Pendientes" value={stats.pending} />
              <StatCard label="Urgentes" value={stats.urgent} highlight={stats.urgent > 0 ? "red" : undefined} />
              <StatCard label="Congelados" value={stats.frozen} />
              <StatCard label="Pagados" value={stats.paid} />
              <StatCard label="Boletos vendidos" value={stats.ticketsSold} />
            </section>

            {loadError && (
              <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                {loadError}
              </div>
            )}

            <div className="mt-6">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o celular…"
                className="w-full rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30 sm:max-w-md"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(["all", "urgent", "pending", "frozen", "paid"] as const).map((f) => {
                const labels: Record<typeof f, string> = {
                  all: "Todos",
                  urgent: `🔥 Urgentes${stats.urgent ? ` (${stats.urgent})` : ""}`,
                  pending: "Pendientes",
                  frozen: "Congelados",
                  paid: "Pagados",
                };
                const activeBg =
                  f === "frozen" ? "#f59e0b" : f === "urgent" ? "#dc2626" : "var(--emerald)";
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                      filter === f
                        ? "text-white"
                        : "border border-border text-muted-foreground hover:bg-muted"
                    }`}
                    style={filter === f ? { background: activeBg } : undefined}
                  >
                    {labels[f]}
                  </button>
                );
              })}
              <button
                onClick={() => void loadLatest(true)}
                disabled={loading}
                className="ml-auto rounded-full border border-border px-4 py-1.5 text-xs font-bold text-emerald-deep hover:bg-muted disabled:opacity-60"
              >
                {loading ? "Sincronizando..." : "⟳ Refrescar"}
              </button>
            </div>


            <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              {loading && list.length === 0 ? (
                <div className="p-10 text-center text-sm font-semibold text-muted-foreground">
                  Cargando todos los apartados…
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Sin registros para mostrar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Número</th>
                        <th className="px-4 py-3">Celular</th>
                        <th className="px-4 py-3">Estatus</th>
                        <th className="px-4 py-3">Comprobante</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((r) => (
                        <Row
                          key={r.id}
                          r={r}
                          onApprove={() => approve(r)}
                          onReject={() => reject(r)}
                          onDelete={() => remove(r)}
                          onFreeze={() => freeze(r)}
                          onUnfreeze={() => unfreeze(r)}
                          onEditNote={() => saveNote(r)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <FlyersPanel />

            <p className="mt-4 text-[11px] text-muted-foreground">
              Datos sincronizados en la base de datos en tiempo real · Expiración automática: {EXPIRY_MS / 3600000} h sin comprobante.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px rounded-t-xl px-5 py-2.5 text-sm font-bold transition-colors ${
        active
          ? "border-b-2 border-emerald bg-card text-emerald-deep"
          : "border-b-2 border-transparent text-muted-foreground hover:text-emerald-deep"
      }`}
      style={active ? { borderColor: "var(--emerald)" } : undefined}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: "red" }) {
  return (
    <div
      className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)]"
      style={highlight === "red" ? { borderColor: "#dc2626", background: "color-mix(in oklab, #dc2626 8%, white)" } : { borderColor: "var(--border)" }}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-extrabold tabular-nums"
        style={highlight === "red" ? { color: "#dc2626" } : { color: "var(--emerald-deep)" }}
      >
        {value}
      </p>
    </div>
  );
}

function Row({
  r,
  onApprove,
  onReject,
  onDelete,
  onFreeze,
  onUnfreeze,
  onEditNote,
}: {
  r: Reservation;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onFreeze: () => void;
  onUnfreeze: () => void;
  onEditNote: () => void;
}) {
  const left = timeLeftMs(r);
  const isPaid = r.status === "paid";
  const isFrozen = r.status === "frozen";
  const expired = !isFrozen && !r.receipt && left !== null && left <= 0;
  const goldenHits = r.tickets.map(getGoldenTicket).filter((g): g is NonNullable<typeof g> => !!g);
  const hasGolden = goldenHits.length > 0;

  const rowStyle: React.CSSProperties = hasGolden
    ? { background: "color-mix(in oklab, #fbbf24 18%, white)", borderLeft: "4px solid #a16207" }
    : isFrozen
      ? { background: "color-mix(in oklab, #f59e0b 12%, white)" }
      : {};

  return (
    <tr className="align-top" style={rowStyle}>
      <td className="px-4 py-4">
        <p className="font-semibold text-foreground">{r.name || "Sin nombre"}</p>
        <p className="text-[11px] text-muted-foreground">
          {new Date(r.createdAt).toLocaleString("es-MX")}
        </p>
        {hasGolden && (
          <div className="mt-2 space-y-1">
            {goldenHits.map((g) => (
              <p
                key={g.number}
                className="inline-block rounded-md px-2 py-1 text-[11px] font-bold"
                style={{ background: "#a16207", color: "white" }}
              >
                🏆 GANADOR {pad(g.number)} · {g.prize} — {g.sponsor}
              </p>
            ))}
          </div>
        )}
        {r.note && (
          <p
            className="mt-1.5 inline-block max-w-[220px] rounded-md px-2 py-1 text-[11px] font-medium"
            style={{ background: "#fef3c7", color: "#92400e" }}
            title={r.note}
          >
            📝 {r.note}
          </p>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {r.tickets.map((n) => {
            const gold = isGoldenTicket(n);
            return (
              <span
                key={n}
                title={gold ? "🏆 Boleto de Oro ganador" : undefined}
                className="rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums text-white"
                style={{
                  background: gold ? "#a16207" : isFrozen ? "#f59e0b" : "var(--emerald)",
                  boxShadow: gold ? "0 0 0 2px #fbbf24" : undefined,
                }}
              >
                {gold ? "★ " : ""}{pad(n)}
              </span>
            );
          })}
        </div>
      </td>
      <td className="px-4 py-4 font-mono text-xs">{r.phone}</td>
      <td className="px-4 py-4">
        {isPaid ? (
          <Badge color="emerald">✓ Pagado</Badge>
        ) : isFrozen ? (
          <Badge color="amber">❄ Congelado</Badge>
        ) : r.receipt ? (
          <Badge color="gold">● En revisión</Badge>
        ) : expired ? (
          <Badge color="red">Expirado</Badge>
        ) : (
          <>
            <Badge color="gold">Pendiente</Badge>
            {left !== null && (
              <p className="mt-1 text-[10px] text-amber-700">⏱ {formatTimeLeft(left)}</p>
            )}
          </>
        )}
      </td>
      <td className="px-4 py-4">
        {r.receipt ? (
          <ReceiptButton reservation={r} />
        ) : (
          <span className="text-xs text-muted-foreground">Sin subir</span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap justify-end gap-1.5">
          {!isPaid && (
            <button
              onClick={onApprove}
              className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white shadow-[var(--shadow-soft)] active:scale-95"
              style={{ background: "var(--emerald)" }}
            >
              Aprobar
            </button>
          )}
          {!isPaid && !isFrozen && (
            <button
              onClick={onFreeze}
              className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white shadow-[var(--shadow-soft)] active:scale-95"
              style={{ background: "#f59e0b" }}
            >
              ❄ Congelar
            </button>
          )}
          {isFrozen && (
            <button
              onClick={onUnfreeze}
              className="rounded-full border border-amber-500 px-3 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-50 active:scale-95"
            >
              Descongelar
            </button>
          )}
          {(isFrozen || r.note) && (
            <button
              onClick={onEditNote}
              className="rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-emerald-deep hover:bg-muted active:scale-95"
            >
              📝 Nota
            </button>
          )}
          <button
            onClick={onReject}
            className="rounded-full border border-amber-500 px-3 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-50 active:scale-95"
          >
            Rechazar
          </button>
          <button
            onClick={onDelete}
            className="rounded-full border border-destructive px-3 py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/10 active:scale-95"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}

function ReceiptButton({ reservation }: { reservation: Reservation }) {
  const [loading, setLoading] = useState(false);

  async function openReceipt() {
    setLoading(true);
    try {
      const receipt = reservation.receipt?.dataUrl
        ? reservation.receipt
        : await getReservationReceipt(reservation.id);
      if (!receipt?.dataUrl) {
        alert("No se pudo abrir el comprobante. Intenta refrescar el panel.");
        return;
      }
      const a = document.createElement("a");
      a.href = receipt.dataUrl;
      a.download = receipt.name || "comprobante";
      a.target = "_blank";
      a.rel = "noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert("No se pudo abrir el comprobante. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openReceipt}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-bold text-emerald-deep hover:bg-emerald/10 disabled:opacity-60"
    >
      {loading ? "Abriendo..." : "📎 Ver archivo"}
    </button>
  );
}

function Badge({
  color,
  children,
}: {
  color: "emerald" | "gold" | "red" | "amber";
  children: React.ReactNode;
}) {
  const styles: Record<string, React.CSSProperties> = {
    emerald: {
      background: "color-mix(in oklab, var(--emerald) 18%, white)",
      color: "var(--emerald-deep)",
    },
    gold: {
      background: "color-mix(in oklab, var(--gold) 22%, white)",
      color: "var(--emerald-deep)",
    },
    red: {
      background: "color-mix(in oklab, var(--destructive) 18%, white)",
      color: "hsl(var(--destructive))",
    },
    amber: {
      background: "#fef3c7",
      color: "#92400e",
    },
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
      style={styles[color]}
    >
      {children}
    </span>
  );
}
