import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { z } from "zod";
import {
  findByQuery,
  normalizePhone,
  attachReceipt,
  timeLeftMs,
  formatTimeLeft,
  initReservations,
  type Reservation,
} from "@/lib/reservations";
import { BANK_ACCOUNTS, PAYMENT_CONTACT } from "@/lib/banks";
import { BadgeCanvas } from "@/components/SupporterBadge";

const searchSchema = z.object({
  tel: z.preprocess((val) => (val === undefined || val === null ? undefined : String(val)), z.string().optional()),
});

export const Route = createFileRoute("/verificador")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Verificador · Rifa Persona beneficiaria" },
      { name: "description", content: "Consulta tus boletos apartados y sube tu comprobante de pago." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Verificador,
});

function pad(n: number) {
  return n.toString().padStart(3, "0");
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

function Verificador() {
  const { tel } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(tel ?? "");
  const [submittedQuery, setSubmittedQuery] = useState(tel ?? "");
  const [results, setResults] = useState<Reservation[]>([]);
  const [searched, setSearched] = useState(Boolean(tel));
  const [openReservation, setOpenReservation] = useState<Reservation | null>(null);
  const [tick, setTick] = useState(0); // re-render para countdowns

  useEffect(() => {
    initReservations();
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  function runSearch(q: string) {
    const clean = q.trim();
    setSubmittedQuery(clean);
    setResults(findByQuery(clean));
    setSearched(true);
  }

  useEffect(() => {
    if (tel) runSearch(tel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tel]);

  // refrescar cuando otra pestaña/componente actualiza
  useEffect(() => {
    const refresh = () => {
      if (submittedQuery) setResults(findByQuery(submittedQuery));
    };
    window.addEventListener("rifa:reservations-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("rifa:reservations-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [submittedQuery]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const digits = normalizePhone(query);
    // mantengo `tel` en la URL para compatibilidad: si parece teléfono uso dígitos, si no, el texto.
    const param = digits.length >= 7 ? digits : query.trim();
    navigate({ to: "/verificador", search: { tel: param } });
    runSearch(query);
  }

  // referenciar tick para forzar re-render de tiempos
  void tick;

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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              Panel interno
            </p>
            <h1 className="text-xl font-extrabold sm:text-2xl">Verificador de boletos</h1>
          </div>
          <Link
            to="/"
            className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/10"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6">
          <StepBadge step={3} text="Haz la transferencia en tu banco u OXXO y sube tu comprobante aquí" />
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa tu celular, revisa el total de tus boletos y adjunta el comprobante. Así podremos confirmar tu participación y activar tu insignia VERIFIED SUPPORTER.
          </p>
        </div>

        <div
          className="mb-6 rounded-2xl border-2 px-5 py-4 text-sm font-semibold"
          style={{
            borderColor: "var(--gold)",
            background: "color-mix(in oklab, var(--gold) 14%, white)",
            color: "var(--emerald-deep)",
          }}
        >
          ⏱ Los boletos apartados se liberarán automáticamente si no se registra el pago en un límite de 12 horas.
        </div>

        <form
          onSubmit={onSearch}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Celular o nombre
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej. 662 123 4567 o María Pérez"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-soft)] active:scale-95"
            style={{ background: "var(--emerald)" }}
          >
            🔍 Buscar
          </button>
        </form>

        <section className="mt-8">
          {!searched ? (
            <EmptyState
              title="Busca por celular o nombre"
              body="Escribe tu número de celular o tu nombre para ver tus boletos apartados y subir tu comprobante."
            />
          ) : results.length === 0 ? (
            <EmptyState
              title="Sin boletos registrados"
              body={`No encontramos apartados para "${submittedQuery}". Verifica los datos o aparta tus boletos desde la página principal.`}
            />
          ) : (
            <div className="grid gap-4">
              {results.map((r) => (
                <ReservationCard
                  key={r.id}
                  reservation={r}
                  onUpload={() => setOpenReservation(r)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {openReservation && (
        <PaymentModal
          reservation={openReservation}
          onClose={() => setOpenReservation(null)}
          onUploaded={() => {
            setResults(findByQuery(submittedQuery));
            setOpenReservation(null);
          }}
        />
      )}
    </div>
  );
}

function ReservationCard({
  reservation,
  onUpload,
}: {
  reservation: Reservation;
  onUpload: () => void;
}) {
  const left = timeLeftMs(reservation);
  const hasReceipt = Boolean(reservation.receipt);
  const isPaid = reservation.status === "paid";
  const total = reservation.tickets.length * 100;
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-foreground">
            {reservation.name || "Sin nombre"}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{reservation.phone}</p>
        </div>
        <div className="shrink-0 rounded-full bg-cream px-3 py-1 text-xs font-extrabold text-emerald-deep">
          ${total} MXN
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {reservation.tickets.map((n) => (
          <span
            key={n}
            className="rounded-md px-2 py-1 text-[11px] font-bold text-white tabular-nums"
            style={{ background: isPaid ? "var(--emerald-deep)" : "var(--emerald)" }}
          >
            {pad(n)}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {isPaid ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: "color-mix(in oklab, var(--emerald) 18%, white)",
              color: "var(--emerald-deep)",
            }}
          >
            ✓ Confirmado · Pagado
          </span>
        ) : (
          <>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: "color-mix(in oklab, var(--gold) 22%, white)",
                color: "var(--emerald-deep)",
              }}
            >
              ● En revisión
            </span>
            {hasReceipt && (
              <p className="mt-1 text-[11px] font-semibold text-emerald">
                ✓ Comprobante recibido
              </p>
            )}
              <div className="pt-1">
                <StepBadge step={3} text="Haz la transferencia en tu banco u OXXO y sube tu comprobante aquí" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Transfiere el total y sube la foto o PDF del pago. Al confirmar, podrás descargar tu insignia de VERIFIED SUPPORTER y compartir tu apoyo.
                </p>
              </div>
          </>
        )}
        <BankDetailsInline />
        <p className="text-center text-xs font-semibold tabular-nums">
          {isPaid || hasReceipt ? (
            <span className="text-muted-foreground">Tiempo restante: —</span>
          ) : left !== null && left > 0 ? (
            <span className="text-amber-700">⏱ Se libera en {formatTimeLeft(left)}</span>
          ) : (
            <span className="text-destructive">Liberado</span>
          )}
        </p>
        {isPaid ? (
          <span className="block rounded-full bg-emerald/10 py-3 text-center text-sm font-bold text-emerald-deep">
            ✓ Sin acción
          </span>
        ) : (
          <button
            onClick={onUpload}
            className="mx-auto block w-full max-w-sm rounded-full px-6 py-4 text-center text-base font-extrabold text-white shadow-[var(--shadow-soft)] active:scale-95"
            style={{ background: hasReceipt ? "var(--emerald-deep)" : "var(--emerald)" }}
          >
            Subir comprobante
          </button>
        )}
      </div>
    </article>
  );
}

function BankDetailsInline() {
  const account = BANK_ACCOUNTS[0];
  return (
    <section
      className="rounded-2xl border-2 p-4"
      style={{
        borderColor: "var(--gold)",
        background: "color-mix(in oklab, var(--gold) 10%, white)",
      }}
      aria-label="Datos bancarios"
    >
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-deep">
        Datos de pago
      </p>
      <dl className="mt-3 grid gap-2 text-sm">
        <CopyableInlineDatum label="CLABE" value={account.clabe ?? ""} mono />
        <CopyableInlineDatum label="Beneficiario" value={account.holder} />
        <InlineDatum label="Institución" value={account.bank} />
      </dl>
    </section>
  );
}

function InlineDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-extrabold text-emerald-deep">
        {value}
      </dd>
    </div>
  );
}

function CopyableInlineDatum({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-2">
      <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd
          className={`mt-0.5 break-words text-sm font-extrabold text-emerald-deep ${
            mono ? "font-mono tabular-nums" : ""
          }`}
        >
          {value}
        </dd>
      </div>
      <button
        onClick={copy}
        className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-bold text-emerald-deep hover:bg-emerald/10"
      >
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <p className="text-base font-bold text-emerald-deep">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function PaymentModal({
  reservation,
  onClose,
  onUploaded,
}: {
  reservation: Reservation;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<"upload" | "badge">(
    reservation.receipt ? "badge" : "upload",
  );
  const total = useMemo(() => reservation.tickets.length * 100, [reservation]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const okExt = /\.(jpe?g|png|pdf)$/i.test(file.name);
    if (!allowed.includes(file.type) && !okExt) {
      setError("Solo se aceptan archivos .jpg, .png o .pdf");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("El archivo no debe superar 8 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      await attachReceipt(reservation.id, {
        name: file.name,
        type: file.type || "application/octet-stream",
        dataUrl,
      });
      const PAGO_URL =
        (import.meta as any).env?.VITE_WEBHOOK_PAGO_URL ??
        "";
      try {
        if (PAGO_URL) await fetch(PAGO_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "receipt_uploaded",
            reservation_id: reservation.id,
            name: reservation.name,
            phone: reservation.phone,
            tickets: reservation.tickets,
            total_mxn: reservation.tickets.length * 100,
            receipt: { name: file.name, type: file.type },
            submitted_at: new Date().toISOString(),
          }),
          keepalive: true,
        });
      } catch (whErr) {
        console.warn("Webhook procesar-pago falló:", whErr);
        try {
          if (PAGO_URL) await fetch(PAGO_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "receipt_uploaded",
              reservation_id: reservation.id,
              phone: reservation.phone,
            }),
            mode: "no-cors",
            keepalive: true,
          });
        } catch {
          /* ignorar */
        }
      }
      setView("badge");
    } catch (err) {
      console.error(err);
      setError("No se pudo procesar el archivo. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
      onClick={() => {
        if (view === "badge") onUploaded();
        else onClose();
      }}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald">
              {view === "badge" ? "¡Pago recibido!" : "Comprobante de pago"}
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-emerald-deep">
              {reservation.tickets.length} boleto{reservation.tickets.length === 1 ? "" : "s"} · ${total} MXN
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {reservation.name || "Sin nombre"} · {reservation.phone}
            </p>
          </div>
          <button
            onClick={() => (view === "badge" ? onUploaded() : onClose())}
            className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {view === "upload" ? (
          <>
            <div className="mt-5">
              <StepBadge step={3} text="Haz la transferencia en tu banco u OXXO y sube tu comprobante aquí" />
              <p className="mt-1.5 text-sm text-muted-foreground">
                Transfiere el total a los datos de abajo y sube la foto o PDF del pago. Al confirmar, podrás descargar tu insignia de VERIFIED SUPPORTER y compartir tu apoyo.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-border p-4" style={{ background: "var(--cream)" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-deep">
                Datos para transferencia bancaria
              </p>
              <div className="mt-3 space-y-3">
                {BANK_ACCOUNTS.map((b) => (
                  <div
                    key={b.bank}
                    className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm"
                  >
                    <p className="text-base font-extrabold text-emerald-deep">{b.bank}</p>
                    <div className="mt-2 space-y-2">
                      <CopyRow label="Titular" value={b.holder} stripSpaces={false} />
                      {b.clabe && <CopyRow label="CLABE" value={b.clabe} />}
                      {b.card && <CopyRow label="Tarjeta" value={b.card} />}
                      {b.account && <CopyRow label="Cuenta" value={b.account} />}
                      {b.concept && <InfoLine label="Concepto" value={b.concept} />}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Usa como concepto tu nombre completo para identificar tu pago.
              </p>
            </div>

            <div className="mt-6">
              <label
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors ${
                  uploading ? "opacity-60" : "hover:border-emerald hover:bg-emerald/5"
                }`}
                style={{ borderColor: "var(--emerald)" }}
              >
                <span className="text-3xl">📎</span>
                <span className="text-sm font-bold text-emerald-deep">
                  {uploading ? "Procesando..." : "Subir Comprobante de Pago"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Acepta archivos .jpg, .png o .pdf · máx. 8 MB
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={onFile}
                />
              </label>
              {error && (
                <p className="mt-2 text-center text-xs font-semibold text-destructive">{error}</p>
              )}
              {reservation.receipt && (
                <p className="mt-3 rounded-xl bg-emerald/10 px-3 py-2 text-center text-xs font-semibold text-emerald-deep">
                  ✓ Comprobante actual: {reservation.receipt.name}
                </p>
              )}
            </div>

            <p className="mt-5 text-center text-[11px] text-muted-foreground">
              ¿Dudas? Contacta a {PAYMENT_CONTACT.name} al {PAYMENT_CONTACT.display}.
            </p>
          </>
        ) : (
          <BadgeSection
            defaultName={reservation.name || ""}
            onDone={onUploaded}
          />
        )}
      </div>
    </div>
  );
}

function BadgeSection({
  defaultName,
  onDone,
}: {
  defaultName: string;
  onDone: () => void;
}) {
  const [badgeName, setBadgeName] = useState(defaultName);
  const [downloading, setDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const displayName = (badgeName.trim() || "TU NOMBRE").toUpperCase();
  const raffleLink =
    typeof window !== "undefined" ? window.location.origin : "https://tu-rifa.example";

  async function download() {
    if (!badgeRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(badgeRef.current, {
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: "#0b3a2e",
      });
      const filename = `insignia-${(badgeName.trim() || "apoyo")
        .replace(/\s+/g, "_")
        .toLowerCase()}.png`;

      // dataURL → Blob (necesario en Safari / Chrome móvil — los hrefs data:
      // muy largos no descargan ni abren correctamente en iOS).
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });

      // 1) iOS / Android moderno: Web Share API permite "Guardar imagen" en la galería.
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
        share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void>;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({
            files: [file],
            title: "Mi insignia de apoyo",
            text: "Apoyo la Rifa Solidaria por Persona beneficiaria 💚",
          });
          return;
        } catch (shareErr: any) {
          // El usuario canceló: no continuamos con fallback.
          if (shareErr?.name === "AbortError") return;
        }
      }

      // 2) Desktop / navegadores con soporte de download: descarga normal.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);

      // 3) Fallback final iOS Safari: si no se disparó la descarga,
      // abrir la imagen para que el usuario haga "Guardar en Fotos".
      const isiOS = /iP(hone|ad|od)/.test(navigator.userAgent);
      if (isiOS) {
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo generar la imagen. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(raffleLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-5">
      <div
        className="rounded-2xl border-2 px-4 py-3 text-sm font-semibold"
        style={{
          borderColor: "var(--emerald)",
          background: "color-mix(in oklab, var(--emerald) 10%, white)",
          color: "var(--emerald-deep)",
        }}
      >
        ✓ Tu comprobante fue recibido. Crea tu insignia de apoyo y compártela.
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <label className="text-sm font-semibold">Nombre en tu insignia</label>
        <input
          value={badgeName}
          onChange={(e) => setBadgeName(e.target.value)}
          placeholder="Como quieres aparecer"
          className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30"
        />

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Vista previa
          </p>
          <div className="mx-auto w-full max-w-[280px]">
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl"
              style={{ aspectRatio: "1080 / 1920" }}
            >
              <div
                className="absolute left-0 top-0 origin-top-left"
                style={{ transform: "scale(0.259259)", width: 1080, height: 1920 }}
              >
                <BadgeCanvas ref={badgeRef} name={displayName} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            onClick={download}
            disabled={downloading}
            className="rounded-full py-3.5 text-sm font-bold text-white shadow-[var(--shadow-soft)] active:scale-95 disabled:opacity-60"
            style={{ background: "var(--emerald)" }}
          >
            {downloading ? "Generando..." : "⬇️ Descargar insignia"}
          </button>
          <button
            onClick={copyLink}
            className="rounded-full border-2 py-3.5 text-sm font-bold active:scale-95"
            style={{
              borderColor: "var(--emerald)",
              color: "var(--emerald-deep)",
              background: "white",
            }}
          >
            {linkCopied ? "✓ Enlace copiado" : "🔗 Copiar liga de la rifa"}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Imagen 1080 × 1920 px, optimizada para Instagram Stories.
        </p>

        <button
          onClick={onDone}
          className="mt-5 w-full rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          Listo
        </button>
      </div>
    </div>
  );
}

function CopyRow({ label, value, stripSpaces = true }: { label: string; value: string; stripSpaces?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(stripSpaces ? value.replace(/\s+/g, "") : value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-mono text-sm font-semibold text-foreground">{value}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-bold text-emerald-deep hover:bg-emerald/10"
      >
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
