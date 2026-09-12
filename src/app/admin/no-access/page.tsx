import Link from "next/link";

export default function NoAccessPage() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "26rem" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            margin: "0 auto 1.25rem",
            display: "grid",
            placeItems: "center",
            background: "#fdebea",
            color: "var(--ared)",
            fontSize: "1.2rem",
            fontWeight: 700,
          }}
        >
          !
        </div>
        <h1 style={{ fontSize: "1.35rem", margin: 0, letterSpacing: "-0.02em" }}>
          No access
        </h1>
        <p style={{ color: "var(--slate)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
          Your account has a limited role. Ask the studio owner to grant you
          admin or editor access to the control center.
        </p>
        <Link
          href="/admin/login"
          style={{
            display: "inline-block",
            marginTop: "1.5rem",
            padding: "0.55rem 1.1rem",
            borderRadius: 9,
            background: "#1363df",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}