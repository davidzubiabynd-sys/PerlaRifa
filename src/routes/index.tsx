import { RAFFLE, PRICE_LABEL, amountLabel } from "@/lib/raffle";
import { Heart } from "lucide-react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  addReservation,
  getTakenTickets,
  normalizePhone,
  refreshReservations,
} from "@/lib/reservations";




export const Route = createFileRoute("/")({
  component: Index,
});

const TOTAL = RAFFLE.totalTickets;
const PRICE = RAFFLE.ticketPrice ?? 0;
const WHATSAPP = RAFFLE.whatsapp;
const WEBHOOK_URL = (import.meta as any).env?.VITE_WEBHOOK_URL ?? "";
const RAFFLE_DATE = RAFFLE.drawDate ? new Date(RAFFLE.drawDate) : null;

function pad(n: number) {
  return n.toString().padStart(3, "0");
}

function useCountdown(target: Date | null) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null || target === null) return { d: "--", h: "--", m: "--", s: "--", ready: false } as const;
  const diff = Math.max(0, target.getTime() - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
    ready: true,
  } as const;
}

function Index() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [whats, setWhats] = useState("");
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [taken, setTaken] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);
  const { d, h, m, s } = useCountdown(RAFFLE_DATE);
  const navigate = useNavigate();

  function syncTakenFromCache() {
    const currentTaken = getTakenTickets();
    setTaken(currentTaken);
    setSelected((current) => {
      let changed = false;
      const next = new Set(current);
      for (const ticket of current) {
        if (currentTaken.has(ticket)) {
          next.delete(ticket);
          changed = true;
        }
      }
      return changed ? next : current;
    });
    return currentTaken;
  }

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) return;
    let cancelled = false;
    setReady(false);
    refreshReservations()
      .then(() => {
        if (cancelled) return;
        syncTakenFromCache();
        setReady(true);
      })
      .catch((error) => {
        console.error("[reservations] initial sync failed", error);
        if (!cancelled) setReady(false);
      });
    const onUpdate = () => {
      syncTakenFromCache();
      setReady(true);
    };
    window.addEventListener("rifa:reservations-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    const id = setInterval(() => {
      void refreshReservations().then(() => {
        if (!cancelled) syncTakenFromCache();
      }).catch((error) => console.error("[reservations] background sync failed", error));
    }, 30_000);
    return () => {
      cancelled = true;
      window.removeEventListener("rifa:reservations-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
      clearInterval(id);
    };
  }, []);

  const total = selected.size * PRICE;
  const sortedSel = useMemo(() => [...selected].sort((a, b) => a - b), [selected]);

  function toggle(n: number) {
    if (!ready) return;
    if (taken.has(n)) return;
    setSelected((set) => {
      const next = new Set(set);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  function scrollToBoletos() {
    document.getElementById("boletos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (RAFFLE.ticketPrice === null) return alert("El precio del boleto está pendiente. Los apartados abrirán al confirmar el precio.");
    if (!ready) return alert("Espera un momento: estamos sincronizando los boletos apartados.");
    if (selected.size === 0) return alert("Selecciona al menos un boleto.");
    const phoneDigits = normalizePhone(whats);
    if (phoneDigits.length < 10) return alert("Por favor ingresa un número de celular válido.");

    setSubmitting(true);
    try {
      await refreshReservations();
      const currentTaken = syncTakenFromCache();
      const conflict = sortedSel.find((n) => currentTaken.has(n));
      if (conflict) {
        alert(`El boleto ${pad(conflict)} acaba de ser apartado por alguien más. Elige otro.`);
        return;
      }

      const payload = {
        name: name.trim() || null,
        whatsapp: phoneDigits,
        ticket_ids: sortedSel,
        tickets_formatted: sortedSel.map(pad),
        quantity: selected.size,
        price_per_ticket: PRICE,
        total_mxn: total,
        currency: "MXN",
        source: "landing",
        submitted_at: new Date().toISOString(),
      };

      const reservation = await addReservation({
        name: payload.name,
        phone: phoneDigits,
        tickets: sortedSel,
      });
      syncTakenFromCache();

      // Notificar al webhook (no bloquea la redirección si falla)
      if (WEBHOOK_URL) {
        try {
          await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, reservation_id: reservation.id }),
            keepalive: true,
          });
        } catch (err) {
          console.warn("Webhook falló, reintentando no-cors:", err);
          try {
            await fetch(WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, reservation_id: reservation.id }),
              mode: "no-cors",
              keepalive: true,
            });
          } catch (err2) {
            console.error("Webhook falló también con no-cors:", err2);
          }
        }
      }

      // Redirigir al verificador interno
      await navigate({ to: "/verificador", search: { tel: phoneDigits } });
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "No se pudo registrar tu apartado en la base de datos. Intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const numbers = useMemo(() => Array.from({ length: TOTAL }, (_, i) => i + 1), []);
  const filtered = useMemo(
    () =>
      filter
        ? numbers.filter((n) => pad(n).includes(filter.replace(/\D/g, "")))
        : numbers,
    [filter, numbers],
  );
  const availableNumbers = useMemo(
    () => (ready ? filtered.filter((n) => !taken.has(n)) : []),
    [filtered, ready, taken],
  );
  const takenNumbers = useMemo(
    () => (ready ? filtered.filter((n) => taken.has(n)) : []),
    [filtered, ready, taken],
  );
  const orderedNumbers = useMemo(
    () => ready ? [...availableNumbers, ...takenNumbers] : filtered,
    [availableNumbers, takenNumbers, ready, filtered],
  );

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* ===== HERO ===== */}
      <header className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-12 md:pt-20 md:pb-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur">
            <span
              className="h-2 w-2 animate-pulse rounded-full"
              style={{ background: "var(--gold)" }}
            />
            RIFA DE PERLA MADRIGAL · 200 BOLETOS
          </div>

          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <h1 className="text-3xl font-extrabold leading-[1.08] text-white sm:text-5xl md:text-6xl">
                Gana una tablet
                <br />
                <span style={{ color: "var(--gold)" }}>Perla Madrigal</span>
                <br />
                <span className="text-white/90">200 boletos disponibles</span>
              </h1>
              <p className="mt-5 max-w-xl text-base font-medium text-white/85 sm:text-lg">
                Participa por una tablet Acer A11 como la de la imagen. Fecha y precio por confirmar.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={scrollToBoletos}
                  className="pulse-cta rounded-full px-7 py-4 text-base font-bold shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.03] active:scale-95"
                  style={{ background: "var(--gold)", color: "oklch(0.2 0.03 160)" }}
                >
                  💚 Apartar mis boletos
                </button>
                <Link
                  to="/verificador"
                  className="rounded-full border border-white/30 px-6 py-4 text-center text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                >
                  Confirmar mi apartado
                </Link>
              </div>

              <p className="mt-5 text-sm font-medium text-white/70">
                Precio del boleto: {" "}
                <span className="font-bold text-white">{PRICE_LABEL}</span>. El sorteo contará con 200 boletos.
              </p>
            </div>

            {/* Photo of Perla Madrigal — replace /public/beneficiario.jpg with the real photo */}
            <div className="relative mx-auto w-full max-w-[280px] md:max-w-none">
              <div
                className="absolute -inset-3 rounded-[2rem] opacity-40 blur-2xl"
                style={{ background: "var(--gold)" }}
              />
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-4 shadow-2xl"
                style={{ borderColor: "var(--gold)" }}
              >
                <img
                  src={RAFFLE.prizeImage}
                  alt={RAFFLE.prize}
                  className="h-full w-full object-contain bg-white p-4"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3 text-center"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                  }}
                >
                  <p className="text-sm font-semibold text-white">{RAFFLE.prize}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur md:p-6">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {RAFFLE_DATE ? "⏳ Cuenta regresiva para el sorteo" : "📅 Fecha del sorteo pendiente"}
            </p>
            {RAFFLE_DATE && <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {[
                { v: d, l: "Días" },
                { v: h, l: "Horas" },
                { v: m, l: "Min" },
                { v: s, l: "Seg" },
              ].map((u) => (
                <div
                  key={u.l}
                  className="rounded-xl bg-white/10 py-3 text-center backdrop-blur"
                >
                  <div className="text-2xl font-extrabold tabular-nums text-white sm:text-4xl">
                    {String(u.v).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/70 sm:text-xs">
                    {u.l}
                  </div>
                </div>
              ))}
            </div>}
            {!RAFFLE_DATE && <p className="text-center text-sm text-white/80">Anunciaremos la fecha y hora cuando estén confirmadas.</p>}
          </div>
        </div>
      </header>

      {/* ===== SOCIAL PROOF ===== */}
      <SocialProof />

      {/* ===== BOLETOS DE ORO ===== */}
      {/* Los premios instantáneos se activarán únicamente si se confirman. */}

      {/* ===== CÓMO FUNCIONA ===== */}
      <section className="px-5 py-14 md:py-20" style={{ background: "var(--cream)" }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald">
              Cómo participar
            </p>
            <h2 className="text-2xl font-bold text-emerald-deep sm:text-4xl">
              Es muy fácil, en 3 pasos
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              En menos de 2 minutos aseguras tu participación. Te guiamos paso a paso.
            </p>
          </div>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            <StepCard
              num={1}
              title="Elige tus boletos"
              desc={`Elige entre 001 y 200. ${PRICE_LABEL}.`}
              icon="🎟️"
            />
            <StepCard
              num={2}
              title="Registra tu nombre y número"
              desc="Escribe tu nombre y celular para apartar tus boletos. En segundos quedan reservados."
              icon="📝"
            />
            <StepCard
              num={3}
              title="Haz la transferencia y sube tu comprobante"
              desc="Transfiere en tu banco u OXXO y sube la foto o PDF de tu pago. ¡Listo, ya estás participando! 💚"
              icon="✅"
            />
          </ol>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={scrollToBoletos}
              className="w-full rounded-full px-7 py-4 text-base font-bold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.02] active:scale-95 sm:w-auto"
              style={{ background: "var(--emerald)" }}
            >
              Empezar ahora →
            </button>
            <Link
              to="/verificador"
              className="w-full rounded-full border-2 px-6 py-4 text-center text-base font-semibold transition-colors hover:bg-emerald/5 sm:w-auto"
              style={{ borderColor: "var(--emerald)", color: "var(--emerald-deep)" }}
            >
              Ya aparté, subir comprobante
            </Link>
          </div>
        </div>
      </section>

      {/* ===== MOTIVO ===== */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald">
          El motivo
        </p>
        <h2 className="text-2xl font-bold text-emerald-deep sm:text-4xl">
          La causa de esta rifa
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Rifa organizada en nombre de Perla Madrigal. El premio es una tablet Acer A11 como la referencia mostrada. Los detalles del sorteo y su fecha se anunciarán al confirmarse.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Agradecemos infinitamente tu empatía y apoyo al sumarte a esta causa.
        </p>
      </section>

      {/* ===== INFO ===== */}
      <section className="px-5 py-16 md:py-24" style={{ background: "var(--cream)" }}>
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald">
            Información del sorteo
          </p>
          <h2 className="text-2xl font-bold text-emerald-deep sm:text-4xl">
            Transparencia total
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <InfoCard label="🏆 Premio" value={RAFFLE.prize} sub="Como la imagen de referencia; especificaciones por confirmar" highlight />
            <InfoCard label="🎟️ Boletos disponibles" value="200 boletos" sub="Numeración del 001 al 200" />
            <InfoCard label="📅 Fecha del sorteo" value="Por confirmar" sub="Fecha y hora pendientes" />
            <InfoCard label="⏰ Cierre de ventas" value="Por confirmar" sub="Se anunciará junto con las condiciones del sorteo" />
          </div>

          <div
            className="mt-8 rounded-2xl border-2 px-5 py-4 text-center text-sm font-semibold sm:text-base"
            style={{
              borderColor: "var(--emerald)",
              background: "color-mix(in oklab, var(--emerald) 8%, white)",
              color: "var(--emerald-deep)",
            }}
          >
            Fecha, precio y condiciones del sorteo pendientes de confirmación.
          </div>
        </div>
      </section>

      {/* ===== BOLETOS ===== */}
      <section id="boletos" className="mx-auto max-w-5xl px-5 py-16 md:py-24">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <StepBadge step={1} text="Elige tus boletos" />
            <h2 className="mt-2 text-2xl font-bold text-emerald-deep sm:text-4xl">
              Panel de boletos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Toca los números disponibles. Puedes elegir varios.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-card px-4 py-3 text-right shadow-[var(--shadow-card)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Por boleto
            </p>
            <p className="text-lg font-extrabold text-emerald-deep">{PRICE_LABEL}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <Legend border>Disponible</Legend>
          <Legend colorVar="var(--emerald)">Seleccionado</Legend>
          <Legend colorVar="oklch(0.75 0.02 260)">Ya apartado</Legend>
        </div>

        <div className="mt-5">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            inputMode="numeric"
            placeholder="🔍  Buscar número (ej. 042)"
            className="w-full rounded-2xl border border-input bg-card px-5 py-4 text-sm font-medium outline-none transition-shadow focus:border-emerald focus:shadow-[var(--shadow-soft)]"
          />
        </div>

        {RAFFLE.ticketPrice === null && <p className="mt-5 rounded-xl border border-border bg-card p-4 text-sm">Los 200 boletos se muestran como referencia. Los apartados abrirán al confirmar el precio y conectar la base de datos.</p>}

        {/* Scrollable, uniform grid. auto-fill ensures buttons never get cut. */}
        <div
          className="relative mt-6 max-h-[60vh] overflow-y-auto overscroll-contain rounded-3xl border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:p-5"
          style={{ WebkitOverflowScrolling: "touch" }}
          aria-busy={!ready && RAFFLE.ticketPrice !== null}
        >
          {!ready && RAFFLE.ticketPrice !== null && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-card/85 backdrop-blur-sm">
              <div className="flex items-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-emerald shadow-[var(--shadow-soft)]">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
                Cargando disponibilidad…
              </div>
            </div>
          )}
          <div
            className={`grid gap-2 sm:gap-2.5 ${!ready ? "opacity-40" : ""}`}
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))" }}
          >
            {orderedNumbers.map((n) => {
              const isTaken = taken.has(n);
              const isSel = selected.has(n);
              const disabled = !ready || RAFFLE.ticketPrice === null || isTaken;
              const takenTitle = `Boleto ${pad(n)} · Ya apartado`;
              return (
                <button
                  key={n}
                  onClick={() => !isTaken && toggle(n)}
                  disabled={disabled}
                  aria-label={isTaken ? takenTitle : `Boleto ${pad(n)}`}
                  aria-pressed={isSel}
                  title={isTaken ? takenTitle : undefined}
                  className={`aspect-square rounded-lg text-[11px] font-bold tabular-nums transition-all sm:text-xs ${
                    isTaken
                      ? "cursor-not-allowed line-through"
                      : isSel
                        ? "scale-[1.06] text-white shadow-[var(--shadow-soft)]"
                        : "border border-border bg-background text-foreground hover:border-emerald hover:text-emerald active:scale-95"
                  } ${!ready ? "cursor-wait" : ""}`}
                  style={
                    isTaken
                      ? {
                          background: "oklch(0.9 0.005 260)",
                          color: "oklch(0.55 0.01 260)",
                        }
                      : isSel
                        ? { background: "var(--emerald)" }
                        : undefined
                  }
                >

                  {pad(n)}
                </button>
              );
            })}
          </div>
          {ready && orderedNumbers.length === 0 && (
            <div className="py-8 text-center text-sm font-semibold text-muted-foreground">
              No hay boletos disponibles con ese número.
            </div>
          )}
          {ready && orderedNumbers.length > 0 && (
            <div className="pointer-events-none sticky bottom-0 left-0 right-0 mt-3 flex justify-center">
              <div
                className="rounded-full border border-border bg-background/95 px-4 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur"
              >
                ⬇️ Desliza hacia abajo para ver más boletos
              </div>
            </div>
          )}
        </div>


        {/* ===== FORM (desktop visible / mobile is sticky bottom) ===== */}
        <div className="mt-10 hidden rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] md:block">
          <FormPanel
            name={name}
            setName={setName}
            whats={whats}
            setWhats={setWhats}
            selected={selected}
            sortedSel={sortedSel}
            total={total}
            submit={submit}
            submitting={submitting}
            ready={ready}
          />
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="px-5 py-16 pb-44 md:py-20 md:pb-24"
        style={{ background: "var(--emerald-deep)", color: "white" }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                200 BOLETOS · TABLET ACER A11
              </p>
              <h3 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">
                Gracias por participar en la rifa de Perla Madrigal.
              </h3>
            </div>
            <div className="space-y-5 text-sm">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--gold)" }}
                >
                  ¿Tienes alguna duda? Escríbeme
                </p>
                <p className="mt-1.5 text-base font-bold">Perla Madrigal</p>
                <a
                  href={RAFFLE.instagramUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80 underline-offset-4 hover:underline"
                >
                  Instagram por confirmar
                </a>
              </div>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--gold)" }}
                >
                  Mándame un WhatsApp al:
                </p>
                <a
                  href={WHATSAPP ? `https://wa.me/${WHATSAPP}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block text-base font-bold text-white underline-offset-4 hover:underline"
                >
                  WhatsApp por confirmar
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-white/15 pt-6 text-center text-xs text-white/60">
            © 2026 Rifa de Perla Madrigal
          </div>
        </div>
      </footer>

      {/* ===== STICKY MOBILE FORM ===== */}
      <MobileStickyForm
        name={name}
        setName={setName}
        whats={whats}
        setWhats={setWhats}
        selected={selected}
        sortedSel={sortedSel}
        total={total}
        submit={submit}
        submitting={submitting}
        ready={ready}
      />
    </div>
  );
}

function StepCard({
  num,
  title,
  desc,
  icon,
}: {
  num: number;
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <li className="relative flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl font-extrabold text-white"
        style={{ background: "var(--emerald)" }}
        aria-hidden
      >
        {num}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            {icon}
          </span>
          <h3 className="text-base font-bold text-emerald-deep sm:text-lg">{title}</h3>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

function StepBadge({ step, text }: { step: number; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-deep shadow-sm">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-[10px] font-extrabold text-white">
        {step}
      </span>
      {text}
    </div>
  );
}


function FormPanel(props: {
  name: string;
  setName: (v: string) => void;
  whats: string;
  setWhats: (v: string) => void;
  selected: Set<number>;
  sortedSel: number[];
  total: number;
  submit: (e: React.FormEvent) => void;
  submitting: boolean;
  ready: boolean;
}) {
  const { name, setName, whats, setWhats, selected, sortedSel, total, submit, submitting, ready } = props;
  return (
    <div className="space-y-4">
      <div>
        <StepBadge step={2} text="Registra tu nombre y número" />
        <p className="mt-2 text-sm text-muted-foreground">
          Completa tus datos para apartar tus boletos. El pago lo harás en el siguiente paso.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground">Tus boletos seleccionados</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-deep">
            {selected.size} {selected.size === 1 ? "boleto" : "boletos"}
          </p>
          <div className="mt-3 flex min-h-[2.5rem] flex-wrap gap-1.5">
            {sortedSel.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Toca los números de arriba para seleccionarlos.
              </p>
            ) : (
              sortedSel.map((n) => (
                <span
                  key={n}
                  className="rounded-md px-2 py-1 text-xs font-bold text-white"
                  style={{ background: "var(--emerald)" }}
                >
                  {pad(n)}
                </span>
              ))
            )}
          </div>
          <div className="rounded-2xl p-5" style={{ background: "var(--cream)" }}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total a pagar</span>
              <span className="text-3xl font-extrabold text-emerald-deep">{amountLabel(selected.size)}</span>
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-foreground">Tu nombre (opcional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como te conocen"
              className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3.5 text-sm font-medium outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Número de Celular *</label>
            <input
              value={whats}
              onChange={(e) => setWhats(e.target.value)}
              required
              inputMode="tel"
              placeholder="662 123 4567"
              className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3.5 text-sm font-medium outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30"
            />
          </div>
          <button
            type="submit"
            disabled={RAFFLE.ticketPrice === null || submitting || !ready || selected.size === 0}
            className="w-full rounded-full py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
            style={{ background: "var(--emerald)" }}
          >
            {RAFFLE.ticketPrice === null ? "Apartados pendientes de apertura" : !ready ? "Sincronizando boletos..." : submitting ? "Registrando..." : "💚 Apartar mis boletos"}
          </button>
          <p className="rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 text-center text-[11px] font-semibold text-amber-900">
            ⏱ Los boletos apartados se liberarán automáticamente si no se registra el pago en un límite de 12 horas.
          </p>
        </form>
      </div>
    </div>
  );
}

function MobileStickyForm(props: React.ComponentProps<typeof FormPanel>) {
  const [open, setOpen] = useState(false);
  const { selected, total, submit, whats, setWhats, name, setName, sortedSel, submitting, ready } = props;
  const hasSelection = selected.size > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden" style={{ pointerEvents: "none" }}>
      {/* Expandable sheet */}
      <div
        className={`pointer-events-auto mx-3 overflow-hidden rounded-t-3xl border border-border bg-card transition-[max-height,transform,opacity] duration-300 ease-out ${
          open ? "max-h-[75vh] translate-y-0 opacity-100" : "max-h-0 translate-y-4 opacity-0"
        }`}
        style={{
          boxShadow: "0 -24px 60px -16px rgba(0,0,0,0.28)",
          marginBottom: "calc(1rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="max-h-[75vh] overflow-y-auto p-5 pb-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Tus boletos seleccionados
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-deep">
                {selected.size} {selected.size === 1 ? "boleto" : "boletos"}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
              aria-label="Cerrar formulario"
            >
              ✕
            </button>
          </div>

          <div className="mb-5 flex min-h-[2.75rem] flex-wrap gap-1.5">
            {sortedSel.length === 0 ? (
              <p className="text-sm text-muted-foreground">Toca los números para seleccionarlos.</p>
            ) : (
              sortedSel.map((n) => (
                <span
                  key={n}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                  style={{ background: "var(--emerald)" }}
                >
                  {pad(n)}
                </span>
              ))
            )}
          </div>

          <div className="mb-5">
            <StepBadge step={2} text="Registra tu nombre y número" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Completa tus datos para apartar. El pago lo harás en el siguiente paso.
            </p>
          </div>

          <div className="mb-5 mt-5 rounded-2xl p-4" style={{ background: "var(--cream)" }}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total a pagar</span>
              <span className="text-3xl font-extrabold text-emerald-deep">{amountLabel(selected.size)}</span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-full rounded-2xl border border-input bg-background px-4 py-3.5 text-sm font-medium outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30"
            />
            <input
              value={whats}
              onChange={(e) => setWhats(e.target.value)}
              required
              inputMode="tel"
              placeholder="Número de celular · 662 123 4567"
              className="w-full rounded-2xl border border-input bg-background px-4 py-3.5 text-sm font-medium outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30"
            />
            <button
              type="submit"
              disabled={RAFFLE.ticketPrice === null || submitting || !ready || selected.size === 0}
              className="w-full rounded-full py-4 text-base font-bold text-white shadow-[var(--shadow-soft)] active:scale-95 disabled:opacity-50"
              style={{ background: "var(--emerald)" }}
            >
              {RAFFLE.ticketPrice === null ? "Apartados pendientes de apertura" : !ready ? "Sincronizando boletos..." : submitting ? "Registrando..." : `💚 Apartar ${selected.size > 0 ? `${selected.size} boletos` : "boletos"}`}
            </button>
            <p className="rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 text-center text-[11px] font-semibold text-amber-900">
              ⏱ Se liberarán si no registras el pago en 12 horas.
            </p>
          </form>
        </div>
      </div>

      {/* Floating action bar */}
      <div
        className="pointer-events-auto mx-3 mb-3 rounded-2xl border border-border bg-card/95 p-3 backdrop-blur-xl"
        style={{
          boxShadow: "0 14px 40px -10px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="min-w-0 flex-1 text-left"
            aria-label={open ? "Cerrar formulario" : "Ver resumen de boletos"}
          >
            <div className="flex items-center gap-2">
              {hasSelection ? (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: "var(--emerald)" }}
                >
                  {selected.size}
                </span>
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[11px] font-semibold text-muted-foreground">
                  0
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {hasSelection
                    ? `${selected.size} boleto${selected.size > 1 ? "s" : ""} · ${amountLabel(selected.size)}`
                    : ready ? PRICE_LABEL : "Sincronizando boletos"}
                </p>
                <p className="truncate text-sm font-extrabold text-emerald-deep">
                  {!ready ? "Espera un momento" : hasSelection ? "Listo para apartar" : "Selecciona tus números"}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setOpen(true)}
            disabled={!hasSelection}
            className="shrink-0 whitespace-nowrap rounded-full px-4 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "var(--emerald)" }}
          >
            {hasSelection ? "Apartar" : "Elegir"}
          </button>
        </div>

        {/* Mini ticket chips when selected */}
        {hasSelection && (
          <div className="mt-2.5 flex flex-wrap gap-1 border-t border-border/60 pt-2.5">
            {sortedSel.slice(0, 8).map((n) => (
              <span
                key={n}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ background: "var(--emerald)" }}
              >
                {pad(n)}
              </span>
            ))}
            {sortedSel.length > 8 && (
              <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-emerald-deep bg-emerald/15">
                +{sortedSel.length - 8}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function InfoCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
      style={
        highlight
          ? { borderColor: "var(--gold)", borderWidth: "2px" }
          : { borderColor: "var(--border)" }
      }
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2.5 text-xl font-extrabold text-emerald-deep sm:text-2xl">{value}</p>
      <p className="mt-1.5 text-sm font-medium text-muted-foreground">{sub}</p>
    </div>
  );
}

function Legend({
  children,
  colorVar,
  border,
}: {
  children: React.ReactNode;
  colorVar?: string;
  border?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-block h-4 w-4 rounded ${border ? "border border-border bg-background" : ""}`}
        style={colorVar ? { background: colorVar } : undefined}
      />
      {children}
    </span>
  );
}

function formatSupporterName(raw: string): string {
  const clean = raw.trim().replace(/\s+/g, " ");
  if (!clean) return "";
  const parts = clean.split(" ");
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  if (parts.length === 1) return first;
  const last = parts[1].charAt(0).toUpperCase();
  return `${first} ${last}.`;
}

function SocialProof() {
  const [names, setNames] = useState<string[]>([]);
  const [extra, setExtra] = useState(0);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) return;
    let cancelled = false;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("reservations")
        .select("name")
        .not("name", "is", null)
        .order("created_at", { ascending: false });
      if (cancelled || !data) return;
      const formatted = Array.from(
        new Set(
          data
            .map((r) => formatSupporterName((r as { name: string | null }).name ?? ""))
            .filter(Boolean),
        ),
      );
      const visibleCount = Math.min(formatted.length, 8);
      setNames(formatted.slice(0, visibleCount));
      setExtra(formatted.length);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (names.length === 0) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % names.length);
        setVisible(true);
      }, 500);
    }, 2800);
    return () => clearInterval(id);
  }, [names.length]);

  if (names.length === 0) return null;

  return (
    <div className="w-full border-y border-border/40 bg-emerald-deep/[0.04] backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-h-[60px] items-center justify-center gap-2 px-4 sm:h-16 sm:max-h-[72px]">
        <Heart
          className="shrink-0 animate-pulse text-emerald"
          size={16}
          strokeWidth={2.5}
        />
        <span className="whitespace-nowrap text-xs font-semibold text-emerald-deep sm:text-sm">
          Últimos en apoyar:
        </span>
        <span
          className="whitespace-nowrap text-xs font-medium text-foreground transition-opacity duration-500 ease-in-out sm:text-sm"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {names[index]}
        </span>
        {extra > 0 && (
          <span className="whitespace-nowrap text-xs font-semibold text-emerald sm:text-sm">
            +{extra}
          </span>
        )}
      </div>
    </div>
  );
}

