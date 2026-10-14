import { useEffect, useMemo, useState } from "react";
import { getAllReservations, refreshReservations, type Reservation } from "@/lib/reservations";

// Premios en el orden en que se sortean.
// Primero los premios chicos de patrocinadores, luego los grandes.
type Prize = {
  id: string;
  name: string;
  sponsor?: string;
  tier: "small" | "big";
  emoji: string;
};

const PRIZES: Prize[] = [
  {
    id: "burrititos-cena",
    name: "Cena para 2 · 2 Burros Medianos",
    sponsor: "Patrocinador B",
    tier: "small",
    emoji: "🌯",
  },
  {
    id: "mini-pancakes",
    name: "Charola de 12 mini pancakes",
    sponsor: "Patrocinador E",
    tier: "small",
    emoji: "🥞",
  },
  {
    id: "deedee-ensalada",
    name: "Ensalada chica",
    sponsor: "Patrocinador F",
    tier: "small",
    emoji: "🥗",
  },
  {
    id: "vegana-entrada",
    name: "Entrada + 1 platillo",
    sponsor: "Patrocinador G",
    tier: "small",
    emoji: "🌱",
  },
  {
    id: "echo-show",
    name: "Amazon Echo Show",
    tier: "big",
    emoji: "🎁",
  },
  {
    id: "grand-prize",
    name: "$7,000 MXN en efectivo",
    tier: "big",
    emoji: "🏆",
  },
];

type Winner = {
  prizeId: string;
  ticket: number;
  reservationId: string | null;
  name: string | null;
  phone: string | null;
  drawnAt: number;
  seed: string;
  poolSize: number;
  index: number;
  mode: "real" | "prueba";
};

function pad(n: number) {
  return n.toString().padStart(3, "0");
}

// Random criptográficamente seguro: elige un entero en [0, max) sin sesgo.
function secureRandomInt(max: number): { index: number; seed: string } {
  if (max <= 0) throw new Error("Pool vacío");
  const range = 0x100000000; // 2^32
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  let n: number;
  do {
    crypto.getRandomValues(buf);
    n = buf[0];
  } while (n >= limit);
  return { index: n % max, seed: n.toString(16).padStart(8, "0") };
}

export function DrawPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"real" | "prueba">("real");
  const [testPool, setTestPool] = useState<"apartados" | "todos">("apartados");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [reel, setReel] = useState<number | null>(null);

  async function loadLatest() {
    setLoading(true);
    try {
      await refreshReservations();
      setReservations(getAllReservations());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLatest();
    const onUpdate = () => setReservations(getAllReservations());
    window.addEventListener("rifa:reservations-updated", onUpdate);
    return () => window.removeEventListener("rifa:reservations-updated", onUpdate);
  }, []);

  // Construye el pool según el modo.
  const pool = useMemo(() => {
    const wonTickets = new Set(winners.map((w) => w.ticket));
    let entries: { ticket: number; reservation: Reservation | null }[] = [];

    if (mode === "real") {
      for (const r of reservations) {
        if (r.status !== "paid") continue;
        for (const t of r.tickets) entries.push({ ticket: t, reservation: r });
      }
    } else if (testPool === "apartados") {
      // Pool de prueba: todos los apartados actuales (sin importar status).
      for (const r of reservations) {
        for (const t of r.tickets) entries.push({ ticket: t, reservation: r });
      }
    } else {
      // Pool de prueba: 1-1000 simulado.
      for (let i = 1; i <= 1000; i++) entries.push({ ticket: i, reservation: null });
    }

    return entries.filter((e) => !wonTickets.has(e.ticket));
  }, [reservations, winners, mode, testPool]);

  const nextPrize = PRIZES.find((p) => !winners.some((w) => w.prizeId === p.id));

  async function drawNext() {
    if (!nextPrize || spinning) return;
    if (pool.length === 0) {
      alert("El pool está vacío. No hay boletos elegibles para sortear.");
      return;
    }

    setSpinning(true);
    // Animación: cicla números aleatorios durante ~2.5s.
    const start = Date.now();
    const duration = 2500;
    const spinInterval = setInterval(() => {
      const idx = Math.floor(Math.random() * pool.length);
      setReel(pool[idx].ticket);
    }, 60);

    await new Promise((r) => setTimeout(r, duration));
    clearInterval(spinInterval);

    const { index, seed } = secureRandomInt(pool.length);
    const chosen = pool[index];
    setReel(chosen.ticket);

    const winner: Winner = {
      prizeId: nextPrize.id,
      ticket: chosen.ticket,
      reservationId: chosen.reservation?.id ?? null,
      name: chosen.reservation?.name ?? null,
      phone: chosen.reservation?.phone ?? null,
      drawnAt: Date.now(),
      seed,
      poolSize: pool.length,
      index,
      mode,
    };
    setWinners((w) => [...w, winner]);
    // Deja el número visible ~800ms antes de permitir el siguiente giro.
    setTimeout(() => setSpinning(false), 500);
    void start;
  }

  function resetDraw() {
    if (winners.length === 0) return;
    if (!confirm("¿Reiniciar el sorteo? Se borrarán todos los ganadores mostrados en pantalla.")) return;
    setWinners([]);
    setReel(null);
  }

  function exportWinners() {
    const lines = winners.map((w) => {
      const p = PRIZES.find((x) => x.id === w.prizeId);
      return `${p?.emoji ?? ""} ${p?.name ?? w.prizeId}${p?.sponsor ? ` — ${p.sponsor}` : ""}: Boleto ${pad(w.ticket)}${w.name ? ` · ${w.name}` : ""}${w.phone ? ` · ${w.phone}` : ""} · seed ${w.seed} · idx ${w.index}/${w.poolSize} · ${new Date(w.drawnAt).toLocaleString("es-MX")}`;
    });
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(
      () => alert("Resultados copiados al portapapeles."),
      () => alert("No se pudo copiar. Selecciona el texto manualmente."),
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald">
            Sorteo en vivo
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-emerald-deep">🎰 Ruleta digital</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sorteo aleatorio criptográficamente seguro (crypto.getRandomValues).
          </p>
        </div>
        <button
          onClick={() => void loadLatest()}
          disabled={loading}
          className="rounded-full border border-border px-4 py-1.5 text-xs font-bold text-emerald-deep hover:bg-muted disabled:opacity-60"
        >
          {loading ? "Sincronizando..." : "⟳ Recargar boletos"}
        </button>
      </div>

      {/* Modo */}
      <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Modo del sorteo
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <ModeButton active={mode === "real"} onClick={() => setMode("real")} color="emerald">
            🔴 Producción (boletos pagados)
          </ModeButton>
          <ModeButton active={mode === "prueba"} onClick={() => setMode("prueba")} color="amber">
            🧪 Prueba
          </ModeButton>
        </div>
        {mode === "prueba" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <SubButton active={testPool === "apartados"} onClick={() => setTestPool("apartados")}>
              Pool: apartados actuales
            </SubButton>
            <SubButton active={testPool === "todos"} onClick={() => setTestPool("todos")}>
              Pool: 001–1000 simulado
            </SubButton>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {mode === "real"
            ? "Solo participan boletos con estatus PAGADO. Ideal para la transmisión oficial."
            : "Modo prueba: los resultados NO son oficiales. Úsalo para ensayar la mecánica en vivo."}
        </p>
      </div>

      {/* Info pool + reel */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Boletos elegibles
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-deep">
            {pool.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ganadores hasta ahora: {winners.length}/{PRIZES.length}
          </p>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-2xl border-2 p-5"
          style={{
            borderColor: spinning ? "#f59e0b" : "var(--emerald)",
            background: spinning
              ? "color-mix(in oklab, #fbbf24 14%, white)"
              : "color-mix(in oklab, var(--emerald) 8%, white)",
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {spinning ? "Girando..." : reel !== null ? "Último número" : "Listo para girar"}
          </p>
          <p
            className="mt-1 text-6xl font-extrabold tabular-nums"
            style={{ color: spinning ? "#a16207" : "var(--emerald-deep)" }}
          >
            {reel !== null ? pad(reel) : "---"}
          </p>
        </div>
      </div>

      {/* Botón principal */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {nextPrize ? (
          <button
            onClick={drawNext}
            disabled={spinning || pool.length === 0}
            className="flex-1 rounded-2xl px-6 py-5 text-lg font-extrabold text-white shadow-[var(--shadow-soft)] transition-transform active:scale-95 disabled:opacity-50 sm:flex-none sm:min-w-[280px]"
            style={{
              background: spinning
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "linear-gradient(135deg, var(--emerald), var(--emerald-deep))",
            }}
          >
            {spinning ? "🎰 Sorteando..." : `🎰 Sortear: ${nextPrize.emoji} ${nextPrize.name}`}
          </button>
        ) : (
          <div className="flex-1 rounded-2xl border-2 border-emerald bg-emerald/10 px-6 py-5 text-center text-lg font-extrabold text-emerald-deep">
            ✅ Sorteo completo — todos los premios entregados
          </div>
        )}
        {winners.length > 0 && (
          <>
            <button
              onClick={exportWinners}
              className="rounded-full border border-border px-4 py-2 text-xs font-bold text-emerald-deep hover:bg-muted"
            >
              📋 Copiar resultados
            </button>
            <button
              onClick={resetDraw}
              className="rounded-full border border-destructive px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
            >
              ↺ Reiniciar
            </button>
          </>
        )}
      </div>

      {nextPrize && (
        <p className="mt-3 text-xs text-muted-foreground">
          Próximo premio: <strong>{nextPrize.emoji} {nextPrize.name}</strong>
          {nextPrize.sponsor ? ` — ${nextPrize.sponsor}` : ""} ({nextPrize.tier === "small" ? "premio patrocinador" : "premio mayor"}).
        </p>
      )}

      {/* Lista de premios y ganadores */}
      <div className="mt-6 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Orden del sorteo
        </p>
        {PRIZES.map((p, idx) => {
          const winner = winners.find((w) => w.prizeId === p.id);
          const isNext = !winner && nextPrize?.id === p.id;
          return (
            <div
              key={p.id}
              className="rounded-xl border p-3 transition-colors"
              style={{
                borderColor: winner
                  ? "var(--emerald)"
                  : isNext
                    ? "#f59e0b"
                    : "var(--border)",
                background: winner
                  ? "color-mix(in oklab, var(--emerald) 10%, white)"
                  : isNext
                    ? "color-mix(in oklab, #fbbf24 12%, white)"
                    : "white",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {idx + 1}. {p.tier === "small" ? "Premio patrocinador" : "Premio mayor"}
                  </p>
                  <p className="mt-0.5 font-bold text-emerald-deep">
                    {p.emoji} {p.name}
                  </p>
                  {p.sponsor && (
                    <p className="text-xs text-muted-foreground">{p.sponsor}</p>
                  )}
                </div>
                {winner ? (
                  <div className="text-right">
                    <p
                      className="rounded-md px-3 py-1 text-lg font-extrabold tabular-nums text-white"
                      style={{ background: "var(--emerald)" }}
                    >
                      🎉 {pad(winner.ticket)}
                    </p>
                    {winner.name && (
                      <p className="mt-1 text-xs font-semibold text-emerald-deep">
                        {winner.name}
                      </p>
                    )}
                    {winner.phone && (
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {winner.phone}
                      </p>
                    )}
                    {winner.mode === "prueba" && (
                      <p className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        PRUEBA
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      seed {winner.seed} · idx {winner.index}/{winner.poolSize}
                    </p>
                  </div>
                ) : isNext ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                    Siguiente
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Aleatoriedad basada en <code>crypto.getRandomValues</code> del navegador (misma primitiva usada por bancos). Cada resultado registra el índice y semilla para auditar.
      </p>
    </section>
  );
}

function ModeButton({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: "emerald" | "amber";
  children: React.ReactNode;
}) {
  const bg = color === "emerald" ? "var(--emerald)" : "#f59e0b";
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
        active ? "text-white" : "border border-border text-muted-foreground hover:bg-muted"
      }`}
      style={active ? { background: bg } : undefined}
    >
      {children}
    </button>
  );
}

function SubButton({
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
      className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
        active
          ? "bg-emerald-deep text-white"
          : "border border-border text-muted-foreground hover:bg-muted"
      }`}
      style={active ? { background: "var(--emerald-deep)" } : undefined}
    >
      {children}
    </button>
  );
}
