"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="section-padding" style={{ paddingTop: "9rem", textAlign: "center" }}>
      <p className="section-kicker">Something went wrong</p>
      <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontFamily: "Georgia, serif", fontWeight: 500, marginTop: "0.5rem" }}>
        We hit an unexpected error
      </h2>
      <p style={{ color: "#58677d", marginTop: "1rem", maxWidth: "36rem", marginInline: "auto", wordBreak: "break-word" }}>
        {error.message || "An unknown error occurred. Please try again."}
      </p>
      <button type="button" className="btn-primary" style={{ marginTop: "2rem" }} onClick={reset}>
        Try Again
      </button>
    </section>
  );
}
