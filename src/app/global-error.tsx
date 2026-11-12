"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
          color: "#172033",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 24px 60px -28px rgba(15, 23, 42, 0.35)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0b74de, #06b6d4)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "-0.03em",
            }}
          >
            3M
          </div>
          <h1 style={{ margin: "16px 0 0", fontSize: "22px", lineHeight: 1.2 }}>We hit a temporary snag</h1>
          <p style={{ margin: "8px 0 0", fontSize: "13px", lineHeight: 1.7, color: "#64748b" }}>
            The page did not finish loading. Your journey is safe — please try again, or call the travel desk if it keeps happening.
          </p>
          <div style={{ marginTop: "20px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: "999px",
                background: "#0b74de",
                color: "#ffffff",
                padding: "10px 18px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                borderRadius: "999px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#475569",
                padding: "10px 18px",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
