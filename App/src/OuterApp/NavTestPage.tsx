import Navbar from "./Navbar";

// Minimal plain page for isolating mobile navbar performance.
// Intentionally contains NO canvas backgrounds, NO animations, NO heavy
// components — just the Navbar over lightweight static content so the
// navbar can be tested without any competing main-thread work.
const NavTestPage = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#0D0D1A", color: "#fff" }}>
      <Navbar />
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "96px 20px 64px",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 16 }}>
          Navbar performance test page
        </h1>
        <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: 24 }}>
          This is a deliberately plain page with no background canvas
          animations, no particles, and no heavy content. Open the mobile
          menu, switch languages, and navigate — it should feel instant.
        </p>

        {Array.from({ length: 20 }).map((_, i) => (
          <p
            key={i}
            style={{
              opacity: 0.6,
              lineHeight: 1.6,
              marginBottom: 12,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: 12,
            }}
          >
            Scroll block #{i + 1} — plain text so you can scroll and confirm
            the top bar and menu stay smooth.
          </p>
        ))}
      </main>
    </div>
  );
};

export default NavTestPage;
