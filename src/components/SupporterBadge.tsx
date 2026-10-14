import React from "react";

export const BadgeCanvas = ({
  name,
  ref,
}: {
  name: string;
  ref: React.Ref<HTMLDivElement>;
}) => (
  <div
    ref={ref}
    style={{
      width: 1080,
      height: 1920,
      position: "relative",
      background:
        "linear-gradient(160deg, oklch(0.28 0.08 162) 0%, oklch(0.38 0.11 165) 55%, oklch(0.48 0.13 162) 100%)",
      color: "white",
      fontFamily: "Poppins, system-ui, sans-serif",
      overflow: "hidden",
      padding: "120px 96px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.1,
        backgroundImage:
          "radial-gradient(circle at 20% 20%, white 2px, transparent 2px)",
        backgroundSize: "64px 64px",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -180,
        top: -180,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "oklch(0.78 0.13 75)",
        filter: "blur(140px)",
        opacity: 0.45,
      }}
    />

    <div style={{ position: "relative", zIndex: 2 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 28px",
          borderRadius: 999,
          border: "2px solid rgba(255,255,255,0.25)",
          background: "rgba(255,255,255,0.08)",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.3em",
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "oklch(0.78 0.13 75)",
          }}
        />
        RIFA SOLIDARIA · 2026
      </div>

      <p
        style={{
          marginTop: 80,
          fontSize: 56,
          letterSpacing: "0.4em",
          fontWeight: 700,
          color: "oklch(0.78 0.13 75)",
        }}
      >
        APOYO OFICIAL
      </p>

      <h1
        style={{
          marginTop: 28,
          fontSize: name.length > 18 ? 130 : 168,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "white",
          wordBreak: "break-word",
        }}
      >
        {name}
      </h1>

      <div
        style={{
          marginTop: 36,
          height: 6,
          width: 220,
          background: "oklch(0.78 0.13 75)",
          borderRadius: 999,
        }}
      />

      <p
        style={{
          marginTop: 56,
          fontSize: 36,
          lineHeight: 1.45,
          fontWeight: 500,
          color: "rgba(255,255,255,0.92)",
          maxWidth: 820,
        }}
      >
        Ya puse mi granito de arena en apoyo a{" "}
        <span style={{ fontWeight: 800, color: "oklch(0.78 0.13 75)" }}>Persona beneficiaria</span> y estoy participando por{" "}
        <span style={{ fontWeight: 800 }}>$7,000 MXN</span> o una{" "}
        <span style={{ fontWeight: 800 }}>Amazon Echo Show</span>.
      </p>
    </div>

    <div style={{ position: "relative", zIndex: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "6px solid oklch(0.78 0.13 75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-8deg)",
            background: "rgba(255,255,255,0.04)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 14,
              borderRadius: "50%",
              border: "2px dashed rgba(255,255,255,0.35)",
            }}
          />
          <div style={{ textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 48, lineHeight: 1 }}>✓</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.18em",
                color: "oklch(0.78 0.13 75)",
              }}
            >
              VERIFIED
              <br />
              SUPPORTER
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, color: "white" }}>
            ¿Te sumas?
          </p>
          <p
            style={{
              marginTop: 8,
              fontSize: 28,
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Te toma menos de 2 minutos.
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: 56,
          paddingTop: 32,
          borderTop: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 22,
          color: "rgba(255,255,255,0.7)",
          fontWeight: 600,
          letterSpacing: "0.12em",
        }}
      >
        <span>RIFA-PARA-YOLANDA.LOVABLE.APP</span>
        <span style={{ color: "oklch(0.78 0.13 75)" }}>@DAVIDZUBIAA</span>
      </div>
    </div>
  </div>
);
