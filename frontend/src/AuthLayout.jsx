import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

// PLACEHOLDER numbers copied from the design. Change both to your real figures before you share the app.
const STUDENTS_SHORT = "50K";
const STUDENTS_FULL = "50,000+";

const TILES = [
  { icon: "📖", title: "Digital Library", text: "Read & Learn Anywhere", login: true },
  { icon: "📄", title: "Lost PDF & Notes", text: "Get what you need, fast", login: true },
  { icon: "🔔", title: "Important Updates", text: "Never miss anything" },
  { icon: "👥", title: "Student Community", text: "Connect & Share" },
  { icon: "📅", title: "Events & Activities", text: "Be part of more" },
  { icon: "🎮", title: "Fun Zone", text: "Study. Play. Relax." },
];

const AVATARS = [
  { letter: "A", bg: "linear-gradient(135deg,#f472b6,#a855f7)" },
  { letter: "T", bg: "linear-gradient(135deg,#60a5fa,#6366f1)" },
  { letter: "K", bg: "linear-gradient(135deg,#34d399,#3b82f6)" },
  { letter: "M", bg: "linear-gradient(135deg,#fbbf24,#f472b6)" },
];

export default function AuthLayout({ children, onJoin }) {
  const [menu, setMenu] = useState(null); // null, "more" or "mode"
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  function say(message) {
    setMenu(null);
    setToast(message);
  }

  function scrollTo(selector) {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const nav = [
    { label: "Home", icon: "🏠", active: true, run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Features", icon: "▦", run: () => scrollTo(".tiles") },
    { label: "Library", icon: "📖", run: () => say("Log in to open your library") },
    { label: "Community", icon: "👥", run: () => say("Community is coming soon 🚀") },
  ];

  return (
    <div className="auth">
      <div className="auth-art" aria-hidden="true" />

      <header className="nav">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="" />
          <div>
            <strong className="brand-name">Unispace</strong>
            <small>Learn • Connect • Thrive</small>
          </div>
        </div>

        <nav className="nav-links">
          {nav.map((n) => (
            <button key={n.label} type="button" className={n.active ? "nav-btn active" : "nav-btn"} onClick={n.run}>
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
          <div className="menu-wrap">
            <button type="button" className="nav-btn" onClick={() => setMenu(menu === "more" ? null : "more")}>
              <span>✨</span> More ▾
            </button>
            {menu === "more" && (
              <div className="menu">
                <button type="button" onClick={() => say("About Unispace is coming soon")}>About Unispace</button>
                <button type="button" onClick={() => say("Help & feedback is coming soon")}>Help & feedback</button>
              </div>
            )}
          </div>
        </nav>

        <div className="nav-right">
          <ThemeToggle />
          <div className="menu-wrap mode-wrap">
            <button type="button" className="mode-btn" onClick={() => setMenu(menu === "mode" ? null : "mode")}>
              <span className="dot" /> Student Mode ▾
            </button>
            {menu === "mode" && (
              <div className="menu">
                <button type="button" onClick={() => setMenu(null)}>Student Mode <span>✓</span></button>
                <button type="button" onClick={() => say("Lecturer mode is coming soon")}>
                  Lecturer Mode <small>Soon</small>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {menu && <div className="menu-backdrop" onClick={() => setMenu(null)} />}

      <main className="auth-main">
        <section className="hero">
          <span className="pill">⚡ Your complete student companion</span>
          <h2 className="hero-title">
            Your University <br />
            Life, <span className="grad">Supercharged.</span>
          </h2>
          <div className="swoosh" />
          <p className="hero-text">
            Access notes, find <strong>important information</strong>, read on the go, and be part of a{" "}
            <strong>vibrant</strong> student community — all in one place.
          </p>

          <div className="tiles">
            {TILES.map((t, i) => (
              <button
                key={t.title}
                type="button"
                className="tile"
                style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                onClick={() => say(t.login ? "Log in to open your library" : "Coming soon 🚀")}
              >
                <span className="tile-icon">{t.icon}</span>
                <strong>{t.title}</strong>
                <small>{t.text}</small>
              </button>
            ))}
          </div>

          <div className="stats">
            <div className="avatars">
              {AVATARS.map((a) => (
                <span key={a.letter} style={{ background: a.bg }}>{a.letter}</span>
              ))}
            </div>
            <div>
              <strong>+{STUDENTS_SHORT}</strong>
              <small>Students are on Unispace <span className="dot" /></small>
            </div>
          </div>

          <p className="signature">Dream. Learn. Belong.</p>
        </section>

        <section className="auth-card-wrap">{children}</section>
      </main>

      <div className="join-banner">
        <span className="join-spark">✨</span>
        <span>Join a community of over <strong>{STUDENTS_FULL} amazing students</strong></span>
        <button type="button" className="join-btn" onClick={onJoin || (() => scrollTo(".auth-card-wrap"))} aria-label="Join">
          →
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}