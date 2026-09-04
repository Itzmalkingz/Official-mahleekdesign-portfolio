import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-padding" style={{ paddingTop: "9rem", textAlign: "center" }}>
      <p className="section-kicker">404</p>
      <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontFamily: "Georgia, serif", fontWeight: 500, marginTop: "0.5rem" }}>
        Page not found
      </h1>
      <p style={{ color: "#58677d", marginTop: "1rem", maxWidth: "36rem", marginInline: "auto" }}>
        The page you’re looking for doesn’t exist or was moved. Let’s get you back to the work.
      </p>
      <Link href="/" className="btn-primary" style={{ marginTop: "2rem" }}>
        Back to Home
      </Link>
    </section>
  );
}
