import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import beneficiarioAsset from "@/assets/beneficiario.asset.json";
import burrititosAsset from "@/assets/burrititos.png.asset.json";
import pizzeriaAsset from "@/assets/pizzeria-las-lomas.png.asset.json";
import sonoraAsset from "@/assets/sonora-mi-amor.png.asset.json";
import chipsAsset from "@/assets/chips-and-sweets.png.asset.json";
import miniPancakesAsset from "@/assets/mini-pancakes.png.asset.json";
import deeDeeAsset from "@/assets/dee-dee.png.asset.json";
import veganaAsset from "@/assets/vegana-del-norte.png.asset.json";

const EMERALD_DARK = "oklch(0.24 0.07 162)";
const EMERALD = "oklch(0.38 0.11 165)";
const EMERALD_MID = "oklch(0.48 0.13 162)";
const GOLD = "oklch(0.82 0.14 78)";
const GOLD_DEEP = "oklch(0.70 0.15 70)";
const CREAM = "oklch(0.97 0.02 85)";

const FONT = "Poppins, system-ui, sans-serif";

/* -------------------------------------------------------------------------- */
/*  FLYER 1 · Rifa general                                                    */
/* -------------------------------------------------------------------------- */

export const RaffleFlyer = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div
    ref={ref}
    style={{
      width: 1080,
      height: 1920,
      position: "relative",
      background: `linear-gradient(165deg, ${EMERALD_DARK} 0%, ${EMERALD} 55%, ${EMERALD_MID} 100%)`,
      color: "white",
      fontFamily: FONT,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* textura de puntos */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.08,
        backgroundImage: "radial-gradient(circle at 20% 20%, white 2px, transparent 2px)",
        backgroundSize: "72px 72px",
      }}
    />
    {/* halo dorado */}
    <div
      style={{
        position: "absolute",
        right: -220,
        top: -220,
        width: 720,
        height: 720,
        borderRadius: "50%",
        background: GOLD,
        filter: "blur(160px)",
        opacity: 0.45,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -180,
        bottom: -180,
        width: 520,
        height: 520,
        borderRadius: "50%",
        background: EMERALD_MID,
        filter: "blur(140px)",
        opacity: 0.6,
      }}
    />

    {/* HEADER */}
    <div style={{ position: "relative", zIndex: 2, padding: "72px 80px 0" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 22px",
          borderRadius: 999,
          border: `2px solid ${GOLD}`,
          background: "rgba(0,0,0,0.2)",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: GOLD,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
        RIFA SOLIDARIA · 2026
      </div>

      <h1
        style={{
          marginTop: 28,
          fontSize: 118,
          lineHeight: 0.95,
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}
      >
        En apoyo
        <br />
        de <span style={{ color: GOLD }}>Persona beneficiaria.</span>
      </h1>

      <p
        style={{
          marginTop: 22,
          fontSize: 28,
          lineHeight: 1.35,
          fontWeight: 500,
          maxWidth: 820,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        Cada boleto es un abrazo que se convierte en tratamiento médico. Súmate por{" "}
        <span style={{ fontWeight: 800, color: GOLD }}>$100 MXN</span>.
      </p>
    </div>

    {/* FOTO + PREMIOS */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        marginTop: 36,
        padding: "0 80px",
        display: "flex",
        gap: 36,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 260,
          height: 260,
          borderRadius: "50%",
          overflow: "hidden",
          border: `7px solid ${GOLD}`,
          flexShrink: 0,
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.5)",
        }}
      >
        <img
          src={beneficiarioAsset.url}
          alt=""
          crossOrigin="anonymous"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 18, letterSpacing: "0.3em", fontWeight: 700, color: GOLD, marginBottom: 8 }}>
          PREMIOS
        </p>
        <p style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>
          $7,000
        </p>
        <p style={{ fontSize: 26, fontWeight: 600, marginTop: 4, color: "rgba(255,255,255,0.85)" }}>
          en efectivo · 1er lugar
        </p>
        <div
          style={{
            marginTop: 14,
            padding: "12px 18px",
            borderRadius: 16,
            border: "2px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 700, color: GOLD, letterSpacing: "0.14em" }}>
            2º LUGAR
          </p>
          <p style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>Amazon Echo Show</p>
        </div>
      </div>
    </div>

    {/* CTA card */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        margin: "40px 80px 0",
        borderRadius: 32,
        background: CREAM,
        color: EMERALD_DARK,
        padding: "34px 40px",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <p style={{ fontSize: 18, letterSpacing: "0.28em", fontWeight: 700, color: GOLD_DEEP }}>
            SORTEO
          </p>
          <p style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.05, marginTop: 6 }}>
            31 de julio
            <br />
            de 2026
          </p>
          <p style={{ fontSize: 20, marginTop: 8, fontWeight: 600, color: EMERALD }}>
            8:30 PM · ruleta en vivo
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: GOLD_DEEP, letterSpacing: "0.2em" }}>
            BOLETO
          </p>
          <p style={{ fontSize: 82, fontWeight: 800, lineHeight: 1, marginTop: 4 }}>$100</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: EMERALD }}>MXN c/u</p>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: "18px 22px",
          borderRadius: 18,
          background: EMERALD_DARK,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 15, letterSpacing: "0.24em", fontWeight: 700, color: GOLD }}>
            APARTA EN
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>
            tu-rifa.example
          </p>
        </div>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: GOLD,
            color: EMERALD_DARK,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          →
        </div>
      </div>
    </div>

    {/* BONUS EXPRESS strip */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        margin: "28px 80px 0",
        borderRadius: 28,
        padding: "22px 26px",
        background: `linear-gradient(120deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`,
        color: EMERALD_DARK,
        boxShadow: "0 20px 60px -20px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, letterSpacing: "0.24em" }}>
        ⚡ BONUS · BOLETOS DE ORO
      </div>
      <p style={{ marginTop: 6, fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>
        ¡Compra tu boleto y gana al instante!
      </p>
      <p style={{ marginTop: 6, fontSize: 17, fontWeight: 500, lineHeight: 1.35 }}>
        Busca los <b>Boletos de Oro</b> escondidos cortesía de nuestros patrocinadores. Cualquier número puede ser un Boleto de Oro.
      </p>
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { logo: burrititosAsset.url, name: "Patrocinador B" },
          { logo: pizzeriaAsset.url, name: "Patrocinador A" },
          { logo: sonoraAsset.url, name: "Patrocinador C" },
          { logo: chipsAsset.url, name: "Patrocinador D" },
          { logo: miniPancakesAsset.url, name: "Patrocinador E" },
          { logo: deeDeeAsset.url, name: "Patrocinador F" },
          { logo: veganaAsset.url, name: "Patrocinador G" },
        ].map((s) => (
          <div
            key={s.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px 6px 6px",
              borderRadius: 999,
              background: "white",
              minWidth: 0,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <img src={s.logo} alt="" crossOrigin="anonymous" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        marginTop: "auto",
        padding: "32px 80px 56px",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 18,
        fontWeight: 600,
        color: "rgba(255,255,255,0.75)",
        letterSpacing: "0.14em",
      }}
    >
      <span>1,000 BOLETOS · SIN FINES DE LUCRO</span>
      <span style={{ color: GOLD }}>@DAVIDZUBIAA</span>
    </div>
  </div>
));
RaffleFlyer.displayName = "RaffleFlyer";

/* -------------------------------------------------------------------------- */
/*  FLYER 2 · Bonus Express                                                   */
/* -------------------------------------------------------------------------- */

export const BonusFlyer = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div
    ref={ref}
    style={{
      width: 1080,
      height: 1920,
      position: "relative",
      background: `linear-gradient(165deg, #3a2a08 0%, #6a4a10 55%, ${GOLD_DEEP} 100%)`,
      color: "white",
      fontFamily: FONT,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* patrón diagonal */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.12,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0 2px, transparent 2px 40px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -180,
        top: -180,
        width: 640,
        height: 640,
        borderRadius: "50%",
        background: GOLD,
        filter: "blur(160px)",
        opacity: 0.55,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -160,
        bottom: -160,
        width: 520,
        height: 520,
        borderRadius: "50%",
        background: EMERALD_MID,
        filter: "blur(140px)",
        opacity: 0.5,
      }}
    />

    <div style={{ position: "relative", zIndex: 2, padding: "72px 72px 0" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 22px",
          borderRadius: 999,
          background: "white",
          color: GOLD_DEEP,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.3em",
        }}
      >
        ⚡ BONUS EXPRESS
      </div>

      <h1
        style={{
          marginTop: 28,
          fontSize: 128,
          lineHeight: 0.9,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          textShadow: "0 6px 40px rgba(0,0,0,0.35)",
        }}
      >
        Boletos
        <br />
        <span style={{ color: "#fff4c9" }}>DE ORO.</span>
      </h1>

      <p style={{ marginTop: 22, fontSize: 32, lineHeight: 1.2, fontWeight: 700, maxWidth: 920, color: "#fff4c9" }}>
        ¡Compra tu boleto y gana al instante!
      </p>
      <p style={{ marginTop: 12, fontSize: 22, lineHeight: 1.35, fontWeight: 500, maxWidth: 920, color: "rgba(255,255,255,0.94)" }}>
        Busca los <span style={{ fontWeight: 800, color: "#fff4c9" }}>Boletos de Oro</span> escondidos cortesía de nuestros patrocinadores. <span style={{ fontWeight: 800 }}>Cualquier número puede ser un Boleto de Oro.</span>
      </p>
    </div>

    {/* CARD DE PATROCINADORES */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        margin: "40px 56px 0",
        borderRadius: 36,
        background: "white",
        color: EMERALD_DARK,
        padding: "36px 32px 32px",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
      }}
    >
      <p style={{ fontSize: 18, letterSpacing: "0.3em", fontWeight: 800, color: GOLD_DEEP, textAlign: "center" }}>
        PATROCINADORES · COMIDA GRATIS
      </p>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { logo: burrititosAsset.url, name: "Patrocinador B", prize: "Burritos" },
          { logo: pizzeriaAsset.url, name: "Patrocinador A", prize: "Pizza" },
          { logo: sonoraAsset.url, name: "Patrocinador C", prize: "Tacos" },
          { logo: chipsAsset.url, name: "Patrocinador D", prize: "Bebidas" },
          { logo: miniPancakesAsset.url, name: "Patrocinador E", prize: "Pancakes" },
          { logo: deeDeeAsset.url, name: "Patrocinador F", prize: "Ensalada" },
          { logo: veganaAsset.url, name: "Patrocinador G", prize: "Platillos" },
        ].map((s) => (
          <div
            key={s.name}
            style={{
              padding: "14px 8px",
              borderRadius: 18,
              border: `2px solid ${GOLD}`,
              background: `linear-gradient(180deg, #fffdf5, #fff6dc)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 14,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
              }}
            >
              <img
                src={s.logo}
                alt=""
                crossOrigin="anonymous"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.15, minHeight: 36 }}>{s.name}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: GOLD_DEEP, letterSpacing: "0.04em" }}>{s.prize} GRATIS</p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 28,
          padding: "22px 24px",
          borderRadius: 20,
          background: EMERALD_DARK,
          color: "white",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.24em", color: GOLD }}>
          ¿CÓMO GANO?
        </p>
        <p style={{ fontSize: 22, fontWeight: 600, marginTop: 8, lineHeight: 1.35 }}>
          Compra tu boleto y descubre al instante si te tocó un <b>Boleto de Oro</b>. Cualquier número puede esconder un premio.
        </p>
      </div>
    </div>

    {/* CTA */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        marginTop: "auto",
        padding: "32px 72px 56px",
      }}
    >
      <div
        style={{
          padding: "20px 26px",
          borderRadius: 999,
          background: "white",
          color: EMERALD_DARK,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 20px 60px -20px rgba(0,0,0,0.5)",
        }}
      >
        <div>
          <p style={{ fontSize: 14, letterSpacing: "0.28em", fontWeight: 800, color: GOLD_DEEP }}>
            APARTA YA EN
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>
            tu-rifa.example
          </p>
        </div>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: GOLD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            fontWeight: 900,
            color: EMERALD_DARK,
            flexShrink: 0,
          }}
        >
          →
        </div>
      </div>
      <p style={{ marginTop: 18, textAlign: "center", fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.16em" }}>
        RIFA SOLIDARIA POR YOLANDA · @DAVIDZUBIAA
      </p>
    </div>
  </div>
));
BonusFlyer.displayName = "BonusFlyer";

/* -------------------------------------------------------------------------- */
/*  FLYER 3 · Validación de premios (por patrocinador)                        */
/* -------------------------------------------------------------------------- */

type ValidationFolio = { code: string; prize: string };
type ValidationSponsor = {
  key: "burrititos" | "lomas" | "sonora" | "chips" | "pancakes" | "deedee" | "vegana";
  brand: string;
  logo: string;
  folios: ValidationFolio[];
  conditions?: string[];
};

const DEFAULT_CONDITIONS = [
  "El cliente presenta su cupón digital con el folio visible.",
  "Verificar que el folio coincida exactamente con esta lista.",
  "No incluye bebida, especiales ni delivery.",
  "No acumulable con otras promociones vigentes.",
  "Vigencia: 30 de julio de 2026.",
];

const VALIDATION_SPONSORS: ValidationSponsor[] = [
  {
    key: "burrititos",
    brand: "Patrocinador B",
    logo: burrititosAsset.url,
    folios: [
      { code: "ORO-TITO-001", prize: "Burro Percherón mediano" },
      { code: "ORO-TITO-002", prize: "Burro Percherón mediano" },
      { code: "ORO-TITO-003", prize: "Burro Percherón mediano" },
      { code: "ORO-TITO-004", prize: "2 Burros medianos" },
    ],
  },
  {
    key: "lomas",
    brand: "Patrocinador A",
    logo: pizzeriaAsset.url,
    folios: [
      { code: "ORO-LOMAS-001", prize: "Pizza grande pepperoni" },
      { code: "ORO-LOMAS-002", prize: "Pizza grande pepperoni" },
    ],
  },
  {
    key: "sonora",
    brand: "Patrocinador C",
    logo: sonoraAsset.url,
    folios: [{ code: "ORO-TACOS-001", prize: "2 Tacos de carne asada" }],
  },
  {
    key: "chips",
    brand: "Patrocinador D",
    logo: chipsAsset.url,
    folios: [{ code: "ORO-CHIPS-0012", prize: "2 Bebidas gratis" }],
    conditions: [
      "El cliente presenta su cupón digital con el folio visible.",
      "Verificar que el folio coincida exactamente con esta lista.",
      "Sin especiales.",
      "Sin delivery.",
      "No acumulable con otras promociones vigentes.",
      "Vigencia: 30 de julio de 2026.",
    ],
  },
  {
    key: "pancakes",
    brand: "Patrocinador E",
    logo: miniPancakesAsset.url,
    folios: [
      { code: "ORO-PAN-001", prize: "Charola de 12 Patrocinador E" },
      { code: "ORO-PAN-002", prize: "Charola de 12 Patrocinador E" },
    ],
    conditions: [
      "El cliente presenta su cupón digital con el folio visible.",
      "Verificar que el folio coincida exactamente con esta lista.",
      "Sin bebida incluida.",
      "Sin especiales.",
      "Sin delivery.",
      "No acumulable con otras promociones vigentes.",
      "Vigencia: 30 de julio de 2026.",
    ],
  },
  {
    key: "deedee",
    brand: "Patrocinador F",
    logo: deeDeeAsset.url,
    folios: [{ code: "ORO-DEE DEE-001", prize: "1 Ensalada Chica gratis" }],
    conditions: [
      "El cliente presenta su cupón digital con el folio visible.",
      "Verificar que el folio coincida exactamente con esta lista.",
      "Sin especiales.",
      "Sin delivery.",
      "No acumulable con otras promociones vigentes.",
      "Vigencia: 30 de julio de 2026.",
    ],
  },
  {
    key: "vegana",
    brand: "Patrocinador G",
    logo: veganaAsset.url,
    folios: [
      { code: "ORO-VEGANA-001", prize: "1 Entrada + 1 Platillo gratis" },
      { code: "ORO-VEGANA-002", prize: "1 Entrada + 1 Platillo gratis" },
    ],
    conditions: [
      "El cliente presenta su cupón digital con el folio visible.",
      "Verificar que el folio coincida exactamente con esta lista.",
      "Sin especiales.",
      "Sin delivery.",
      "No acumulable con otras promociones vigentes.",
      "Vigencia: 30 de julio de 2026.",
    ],
  },
];



export const ValidationFlyer = React.forwardRef<
  HTMLDivElement,
  { sponsor: ValidationSponsor }
>(({ sponsor }, ref) => (
  <div
    ref={ref}
    style={{
      width: 1080,
      height: 1920,
      position: "relative",
      background: `linear-gradient(170deg, ${EMERALD_DARK} 0%, ${EMERALD} 60%, ${EMERALD_MID} 100%)`,
      color: "white",
      fontFamily: FONT,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.07,
        backgroundImage:
          "radial-gradient(circle at 20% 15%, white 2px, transparent 2px)",
        backgroundSize: "80px 80px",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -220,
        top: -220,
        width: 720,
        height: 720,
        borderRadius: "50%",
        background: GOLD,
        filter: "blur(160px)",
        opacity: 0.4,
      }}
    />

    <div style={{ position: "relative", zIndex: 2, padding: "88px 88px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 22px",
              borderRadius: 999,
              border: `2px solid ${GOLD}`,
              background: "rgba(0,0,0,0.25)",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: GOLD,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
            RIFA SOLIDARIA · YOLANDA
          </div>
          <h1
            style={{
              marginTop: 36,
              fontSize: 108,
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Validación
            <br />
            de <span style={{ color: GOLD }}>premios.</span>
          </h1>
          <p
            style={{
              marginTop: 22,
              fontSize: 24,
              lineHeight: 1.4,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Lista oficial de folios
            <br />
            autorizados para canje
          </p>
        </div>
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 32,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 22,
            flexShrink: 0,
            boxShadow: "0 25px 60px -18px rgba(0,0,0,0.5)",
          }}
        >
          <img
            src={sponsor.logo}
            alt=""
            crossOrigin="anonymous"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        </div>
      </div>
    </div>

    <div
      style={{
        position: "relative",
        zIndex: 2,
        margin: "56px 72px 0",
        borderRadius: 40,
        background: `linear-gradient(160deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`,
        color: EMERALD_DARK,
        padding: "44px 44px 40px",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingBottom: 20,
          borderBottom: "2px dashed rgba(0,0,0,0.25)",
        }}
      >
        <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.28em" }}>
          FOLIOS AUTORIZADOS
        </p>
        <p style={{ fontSize: 20, fontWeight: 700, opacity: 0.75 }}>
          {sponsor.brand.toUpperCase()}
        </p>
      </div>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        {sponsor.folios.map((f) => (
          <div
            key={f.code}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "22px 26px",
              borderRadius: 22,
              background: "rgba(255,255,255,0.55)",
              border: "2px solid rgba(0,0,0,0.08)",
            }}
          >
            <div>
              <p style={{ fontSize: 40, fontWeight: 900, letterSpacing: "0.02em", lineHeight: 1 }}>
                {f.code}
              </p>
              <p style={{ fontSize: 22, fontWeight: 600, marginTop: 6, opacity: 0.75 }}>
                {f.prize}
              </p>
            </div>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: EMERALD_DARK,
                color: GOLD,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
          </div>
        ))}
      </div>
    </div>

    <div
      style={{
        position: "relative",
        zIndex: 2,
        margin: "40px 72px 0",
        borderRadius: 32,
        background: "rgba(0,0,0,0.28)",
        border: "1px solid rgba(255,255,255,0.14)",
        padding: "34px 40px",
      }}
    >
      <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.3em", color: GOLD }}>
        CONDICIONES
      </p>
      <ul
        style={{
          marginTop: 18,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {(sponsor.conditions ?? DEFAULT_CONDITIONS).map((c) => (
          <li
            key={c}
            style={{
              display: "flex",
              gap: 14,
              fontSize: 22,
              lineHeight: 1.35,
              fontWeight: 500,
              color: "rgba(255,255,255,0.94)",
            }}
          >
            <span style={{ color: GOLD, fontWeight: 900 }}>◆</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>

    <div
      style={{
        position: "relative",
        zIndex: 2,
        marginTop: "auto",
        padding: "40px 72px 64px",
        borderTop: "1px solid rgba(255,255,255,0.14)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 20,
        fontWeight: 700,
        color: "rgba(255,255,255,0.8)",
        letterSpacing: "0.16em",
      }}
    >
      <span>¡GRACIAS POR SUMARTE A ESTA CAUSA!</span>
      <span style={{ color: GOLD }}>@DAVIDZUBIAA</span>
    </div>
  </div>
));
ValidationFlyer.displayName = "ValidationFlyer";

/* -------------------------------------------------------------------------- */
/*  FLYER 4 · Ganador Amazon Echo Show                                        */
/* -------------------------------------------------------------------------- */

export const WinnerFlyerEcho = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div
    ref={ref}
    style={{
      width: 1080,
      height: 1920,
      position: "relative",
      background: `linear-gradient(165deg, ${EMERALD_DARK} 0%, ${EMERALD} 55%, ${EMERALD_MID} 100%)`,
      color: "white",
      fontFamily: FONT,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.08,
        backgroundImage:
          "radial-gradient(circle at 20% 20%, white 2px, transparent 2px)",
        backgroundSize: "72px 72px",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -240,
        top: -240,
        width: 800,
        height: 800,
        borderRadius: "50%",
        background: GOLD,
        filter: "blur(180px)",
        opacity: 0.5,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -200,
        bottom: -200,
        width: 560,
        height: 560,
        borderRadius: "50%",
        background: EMERALD_MID,
        filter: "blur(150px)",
        opacity: 0.6,
      }}
    />

    {/* Confetti */}
    {[
      { t: 8, l: 12, s: 28, c: GOLD },
      { t: 14, l: 84, s: 22, c: "#fff4c9" },
      { t: 32, l: 8, s: 18, c: GOLD },
      { t: 26, l: 92, s: 24, c: GOLD },
      { t: 72, l: 18, s: 20, c: "#fff4c9" },
      { t: 78, l: 78, s: 26, c: GOLD },
    ].map((d, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          top: `${d.t}%`,
          left: `${d.l}%`,
          width: d.s,
          height: d.s,
          background: d.c,
          borderRadius: "30%",
          transform: `rotate(${i * 45}deg)`,
          opacity: 0.9,
          zIndex: 1,
        }}
      />
    ))}

    <div style={{ position: "relative", zIndex: 2, padding: "72px 80px 0", textAlign: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 24px",
          borderRadius: 999,
          border: `2px solid ${GOLD}`,
          background: "rgba(0,0,0,0.2)",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: GOLD,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
        RIFA SOLIDARIA · YOLANDA
      </div>

      <h1
        style={{
          marginTop: 50,
          fontSize: 132,
          lineHeight: 0.95,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          textShadow: "0 6px 40px rgba(0,0,0,0.35)",
        }}
      >
        ¡<span style={{ color: GOLD }}>Felicidades</span>!
      </h1>

      <p
        style={{
          marginTop: 28,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        Ganador del 2º lugar
      </p>
    </div>

    <div
      style={{
        position: "relative",
        zIndex: 2,
        margin: "60px 72px 0",
        borderRadius: 44,
        background: `linear-gradient(160deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`,
        color: EMERALD_DARK,
        padding: "56px 48px",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.45)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: EMERALD_DARK,
          color: GOLD,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          margin: "0 auto",
        }}
      >
        🎁
      </div>
      <p
        style={{
          marginTop: 28,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Premio
      </p>
      <p
        style={{
          marginTop: 10,
          fontSize: 64,
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        Amazon Echo Show
      </p>
      <div
        style={{
          marginTop: 34,
          padding: "24px 28px",
          borderRadius: 24,
          background: "rgba(255,255,255,0.55)",
          border: "2px solid rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.16em", color: GOLD_DEEP }}>
          GANADOR
        </p>
        <p
          style={{
            marginTop: 8,
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            wordBreak: "break-word",
          }}
        >
          Christian Valdez
        </p>
      </div>
    </div>

    <div
      style={{
        position: "relative",
        zIndex: 2,
        marginTop: "auto",
        padding: "32px 80px 56px",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.04em",
        }}
      >
        Gracias por ser parte de esta causa.
      </p>
      <p
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: 700,
          color: GOLD,
          letterSpacing: "0.16em",
        }}
      >
        @DAVIDZUBIAA · RIFA SOLIDARIA 2026
      </p>
    </div>
  </div>
));
WinnerFlyerEcho.displayName = "WinnerFlyerEcho";

/* -------------------------------------------------------------------------- */
/*  FLYER 5 · Ganador $7,000 MXN                                              */
/* -------------------------------------------------------------------------- */

export const WinnerFlyerCash = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div
    ref={ref}
    style={{
      width: 1080,
      height: 1920,
      position: "relative",
      background: `linear-gradient(165deg, ${EMERALD_DARK} 0%, ${EMERALD} 55%, ${EMERALD_MID} 100%)`,
      color: "white",
      fontFamily: FONT,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.08,
        backgroundImage:
          "radial-gradient(circle at 20% 20%, white 2px, transparent 2px)",
        backgroundSize: "72px 72px",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -240,
        top: -240,
        width: 800,
        height: 800,
        borderRadius: "50%",
        background: GOLD,
        filter: "blur(180px)",
        opacity: 0.55,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -200,
        bottom: -200,
        width: 560,
        height: 560,
        borderRadius: "50%",
        background: EMERALD_MID,
        filter: "blur(150px)",
        opacity: 0.6,
      }}
    />

    {/* Confetti */}
    {[
      { t: 10, l: 10, s: 26, c: GOLD },
      { t: 16, l: 86, s: 22, c: "#fff4c9" },
      { t: 30, l: 6, s: 20, c: GOLD },
      { t: 24, l: 94, s: 24, c: GOLD },
      { t: 70, l: 16, s: 22, c: "#fff4c9" },
      { t: 76, l: 80, s: 26, c: GOLD },
    ].map((d, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          top: `${d.t}%`,
          left: `${d.l}%`,
          width: d.s,
          height: d.s,
          background: d.c,
          borderRadius: "30%",
          transform: `rotate(${i * 45}deg)`,
          opacity: 0.9,
          zIndex: 1,
        }}
      />
    ))}

    <div style={{ position: "relative", zIndex: 2, padding: "72px 80px 0", textAlign: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 24px",
          borderRadius: 999,
          border: `2px solid ${GOLD}`,
          background: "rgba(0,0,0,0.2)",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: GOLD,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
        RIFA SOLIDARIA · YOLANDA
      </div>

      <h1
        style={{
          marginTop: 50,
          fontSize: 132,
          lineHeight: 0.95,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          textShadow: "0 6px 40px rgba(0,0,0,0.35)",
        }}
      >
        ¡<span style={{ color: GOLD }}>Felicidades</span>!
      </h1>

      <p
        style={{
          marginTop: 28,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        Ganador del 1er lugar
      </p>
    </div>

    <div
      style={{
        position: "relative",
        zIndex: 2,
        margin: "60px 72px 0",
        borderRadius: 44,
        background: `linear-gradient(160deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`,
        color: EMERALD_DARK,
        padding: "56px 48px",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.45)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: EMERALD_DARK,
          color: GOLD,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          margin: "0 auto",
        }}
      >
        🏆
      </div>
      <p
        style={{
          marginTop: 28,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Premio mayor
      </p>
      <p
        style={{
          marginTop: 4,
          fontSize: 96,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        $7,000
      </p>
      <p
        style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "0.02em",
          marginTop: 4,
        }}
      >
        MXN en efectivo
      </p>
      <div
        style={{
          marginTop: 34,
          padding: "24px 28px",
          borderRadius: 24,
          background: "rgba(255,255,255,0.55)",
          border: "2px solid rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.16em", color: GOLD_DEEP }}>
          GANADOR
        </p>
        <p
          style={{
            marginTop: 8,
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            wordBreak: "break-word",
          }}
        >
          Alejandro Mendivil
        </p>
      </div>
    </div>

    <div
      style={{
        position: "relative",
        zIndex: 2,
        marginTop: "auto",
        padding: "32px 80px 56px",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.04em",
        }}
      >
        Gracias por ser parte de esta causa.
      </p>
      <p
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: 700,
          color: GOLD,
          letterSpacing: "0.16em",
        }}
      >
        @DAVIDZUBIAA · RIFA SOLIDARIA 2026
      </p>
    </div>
  </div>
));
WinnerFlyerCash.displayName = "WinnerFlyerCash";

/* -------------------------------------------------------------------------- */
/*  Panel de descarga (para admin)                                            */
/* -------------------------------------------------------------------------- */





async function downloadNode(node: HTMLElement, filename: string, bg: string) {
  const dataUrl = await toPng(node, { pixelRatio: 1, cacheBust: true, backgroundColor: bg });
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void>;
  };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: "Flyer Rifa Persona beneficiaria" });
      return;
    } catch (err: any) {
      if (err?.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function FlyersPanel() {
  const raffleRef = useRef<HTMLDivElement>(null);
  const bonusRef = useRef<HTMLDivElement>(null);
  const winnerEchoRef = useRef<HTMLDivElement>(null);
  const winnerCashRef = useRef<HTMLDivElement>(null);
  type SponsorKey = "burrititos" | "lomas" | "sonora" | "chips" | "pancakes" | "deedee" | "vegana";
  const validationRefs: Record<SponsorKey, React.RefObject<HTMLDivElement | null>> = {
    burrititos: useRef<HTMLDivElement>(null),
    lomas: useRef<HTMLDivElement>(null),
    sonora: useRef<HTMLDivElement>(null),
    chips: useRef<HTMLDivElement>(null),
    pancakes: useRef<HTMLDivElement>(null),
    deedee: useRef<HTMLDivElement>(null),
    vegana: useRef<HTMLDivElement>(null),
  };
  type Kind = "raffle" | "bonus" | "winner-echo" | "winner-cash" | `val-${SponsorKey}`;

  const [loading, setLoading] = useState<Kind | null>(null);

  async function handle(kind: Kind) {
    let node: HTMLDivElement | null = null;
    let filename = "";
    let bg = "#0b3a2e";
    if (kind === "raffle") {
      node = raffleRef.current;
      filename = "rifa-ejemplo-flyer.png";
    } else if (kind === "bonus") {
      node = bonusRef.current;
      filename = "rifa-ejemplo-bonus-express.png";
      bg = "#3a2a08";
    } else if (kind === "winner-echo") {
      node = winnerEchoRef.current;
      filename = "rifa-ejemplo-ganador-echo-show.png";
    } else if (kind === "winner-cash") {
      node = winnerCashRef.current;
      filename = "rifa-ejemplo-ganador-7000.png";
    } else {
      const key = kind.replace("val-", "") as SponsorKey;
      node = validationRefs[key].current;
      filename = `rifa-ejemplo-validacion-${key}.png`;
    }

    if (!node) return;
    setLoading(kind);
    try {
      await downloadNode(node, filename, bg);
    } catch (e) {
      console.error(e);
      alert("No se pudo generar el flyer. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-deep">
            Recursos
          </p>
          <h2 className="mt-1 text-lg font-extrabold">Flyers descargables</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tamaño 1080×1920 (Instagram/Facebook Stories · WhatsApp Estados).
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <FlyerCard
          title="Flyer general de la rifa"
          subtitle="Para invitar a apartar boletos"
          gradient={`linear-gradient(160deg, ${EMERALD_DARK}, ${EMERALD_MID})`}
          onDownload={() => handle("raffle")}
          loading={loading === "raffle"}
          previewRef={raffleRef}
          Preview={<RaffleFlyer ref={raffleRef} />}
        />
        <FlyerCard
          title="Flyer Bonus Express"
          subtitle="Para redes · patrocinadores + premios comida"
          gradient={`linear-gradient(160deg, #3a2a08, ${GOLD_DEEP})`}
          onDownload={() => handle("bonus")}
          loading={loading === "bonus"}
          previewRef={bonusRef}
          Preview={<BonusFlyer ref={bonusRef} />}
        />
      </div>

      <div className="mt-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-deep">
          Validación de premios
        </p>
        <h3 className="mt-1 text-base font-extrabold">
          Para entregar a cada restaurante
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Lista oficial de folios autorizados para canje.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {VALIDATION_SPONSORS.map((s) => (
            <FlyerCard
              key={s.key}
              title={`Validación · ${s.brand}`}
              subtitle={`${s.folios.length} folio${s.folios.length === 1 ? "" : "s"} autorizado${s.folios.length === 1 ? "" : "s"}`}
              gradient={`linear-gradient(160deg, ${EMERALD_DARK}, ${EMERALD})`}
              onDownload={() => handle(`val-${s.key}` as Kind)}
              loading={loading === `val-${s.key}`}
              previewRef={validationRefs[s.key]}
              Preview={<ValidationFlyer ref={validationRefs[s.key]} sponsor={s} />}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-deep">
          Ganadores del sorteo
        </p>
        <h3 className="mt-1 text-base font-extrabold">
          Felicitaciones para publicar
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Imágenes listas para compartir con los ganadores de los premios mayores.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <FlyerCard
            title="🎁 Amazon Echo Show"
            subtitle="Christian Valdez · 2º lugar"
            gradient={`linear-gradient(160deg, ${EMERALD_DARK}, ${EMERALD_MID})`}
            onDownload={() => handle("winner-echo")}
            loading={loading === "winner-echo"}
            previewRef={winnerEchoRef}
            Preview={<WinnerFlyerEcho ref={winnerEchoRef} />}
          />
          <FlyerCard
            title="🏆 $7,000 MXN en efectivo"
            subtitle="Alejandro Mendivil · 1er lugar"
            gradient={`linear-gradient(160deg, ${EMERALD_DARK}, ${EMERALD_MID})`}
            onDownload={() => handle("winner-cash")}
            loading={loading === "winner-cash"}
            previewRef={winnerCashRef}
            Preview={<WinnerFlyerCash ref={winnerCashRef} />}
          />
        </div>
      </div>
    </section>
  );
}



function FlyerCard({
  title,
  subtitle,
  gradient,
  onDownload,
  loading,
  Preview,
}: {
  title: string;
  subtitle: string;
  gradient: string;
  onDownload: () => void;
  loading: boolean;
  previewRef: React.RefObject<HTMLDivElement | null>;
  Preview: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div
        style={{ background: gradient }}
        className="relative flex h-64 items-center justify-center overflow-hidden"
      >
        {/* Miniatura escalada del flyer real */}
        <div
          style={{
            transform: "scale(0.18)",
            transformOrigin: "center",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {Preview}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-extrabold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        <button
          onClick={onDownload}
          disabled={loading}
          className="mt-4 w-full rounded-full bg-emerald px-4 py-2.5 text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98] disabled:opacity-60"
          style={{ background: "var(--emerald)" }}
        >
          {loading ? "Generando…" : "⬇️  Descargar PNG"}
        </button>
      </div>
    </div>
  );
}
