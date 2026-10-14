import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { RAFFLE, PRICE_LABEL } from "@/lib/raffle";

// Los flyers usan el mismo premio y configuración que la página y el sorteo.
export function FlyersPanel() {
  const generalRef = useRef<HTMLDivElement>(null);
  const winnerRef = useRef<HTMLDivElement>(null);
  const [winnerName, setWinnerName] = useState("");
  const [winnerTicket, setWinnerTicket] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const validWinner = Boolean(winnerName.trim()) && /^\d{1,3}$/.test(winnerTicket) && Number(winnerTicket) >= 1 && Number(winnerTicket) <= RAFFLE.totalTickets;

  async function download(kind: "general" | "winner") {
    const node = kind === "general" ? generalRef.current : winnerRef.current;
    if (!node || (kind === "winner" && !validWinner)) return;
    setLoading(kind);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(node, { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `perla-madrigal-${kind}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Rifa de Perla Madrigal" });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") alert("No se pudo generar el flyer. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  function canvas(winner: boolean) {
    return (
      <div ref={winner ? winnerRef : generalRef} style={{ width: 1080, height: 1920, padding: "100px 90px", boxSizing: "border-box", background: "linear-gradient(160deg, #0b3a2e, #246650)", color: "white", fontFamily: "Poppins, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 40 }}>
        <p style={{ fontSize: 28, letterSpacing: 5, color: "#efd083" }}>RIFA DE PERLA MADRIGAL</p>
        <h2 style={{ fontSize: 80, lineHeight: 1.1, fontWeight: 800 }}>{winner ? "¡Felicidades!" : "Gana una tablet"}</h2>
        {!winner && <p style={{ fontSize: 30 }}>En apoyo a los gastos hospitalarios de Perla</p>}
        <p style={{ fontSize: 48, color: "#efd083", fontWeight: 700 }}>{RAFFLE.prize}</p>
        <img src={RAFFLE.prizeImage} alt={RAFFLE.prize} style={{ height: 740, width: 700, objectFit: "contain", background: "white", borderRadius: 40, padding: 20 }} />
        {winner ? <>
          <p style={{ fontSize: 54, fontWeight: 800, overflowWrap: "anywhere", maxWidth: "100%" }}>{winnerName.trim() || "Nombre del ganador"}</p>
          <p style={{ fontSize: 48 }}>Boleto {validWinner ? winnerTicket.padStart(3, "0") : "por confirmar"}</p>
        </> : <>
          <p style={{ fontSize: 52, fontWeight: 800 }}>200 boletos · 001 al 200</p>
          <p style={{ fontSize: 42 }}>{PRICE_LABEL}</p>
          <p style={{ fontSize: 36 }}>Ganador al vender los 200 boletos</p>
        </>}
        <p style={{ marginTop: "auto", fontSize: 27 }}>{RAFFLE.publicUrl || "WhatsApp: 662 290 5054"}</p>
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-extrabold">Flyers descargables</h2>
      <p className="mt-1 text-sm text-muted-foreground">Historias de 1080 × 1920 para compartir o descargar. Solo se rifa la tablet Acer Iconia Tab A11.</p>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 font-bold">Invitación a la rifa</h3>
          <div className="relative overflow-hidden rounded-xl" style={{ width: 270, height: 480, maxWidth: "100%" }}><div style={{ transform: "scale(.25)", transformOrigin: "top left" }}>{canvas(false)}</div></div>
          <button disabled={loading !== null} onClick={() => download("general")} className="mt-3 rounded-full bg-emerald px-5 py-3 font-bold text-white disabled:opacity-50">{loading === "general" ? "Generando…" : "Compartir / descargar"}</button>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Ganador de la tablet</h3>
          <label className="block text-sm">Nombre del ganador<input maxLength={50} value={winnerName} onChange={e => setWinnerName(e.target.value)} className="mb-3 mt-1 block w-full rounded-lg border p-2" /></label>
          <label className="block text-sm">Boleto ganador (001–200)<input inputMode="numeric" maxLength={3} value={winnerTicket} onChange={e => setWinnerTicket(e.target.value)} className="mb-3 mt-1 block w-full rounded-lg border p-2" /></label>
          <p className="mb-3 text-xs text-muted-foreground">Completa estos datos únicamente con el resultado confirmado en el panel de sorteo.</p>
          <div className="relative overflow-hidden rounded-xl" style={{ width: 270, height: 480, maxWidth: "100%" }}><div style={{ transform: "scale(.25)", transformOrigin: "top left" }}>{canvas(true)}</div></div>
          <button disabled={loading !== null || !validWinner} onClick={() => download("winner")} className="mt-3 rounded-full bg-emerald px-5 py-3 font-bold text-white disabled:opacity-50">{loading === "winner" ? "Generando…" : "Compartir / descargar ganador"}</button>
        </div>
      </div>
    </section>
  );
}
