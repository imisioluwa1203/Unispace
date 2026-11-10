import { useState, useEffect } from "react";
import { api } from "./api";
import AppShell from "./AppShell";
import { FEATURES } from "./features";
import { ICONS, SearchIcon, ArrowIcon } from "./Icons";
import { loadData, saveData } from "./Offline.js";
import { pickContinue, greeting } from "./helpers";

export default function Home({ user, go, openDoc }) {
  const [documents, setDocuments] = useState(() => loadData("library") || []);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    api("/api/library")
      .then((data) => {
        setDocuments(data.documents);
        saveData("library", data.documents);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const continueDoc = pickContinue(documents);
  const firstName = user.full_name.split(" ")[0];
  const shown = FEATURES.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()));

  function openFeature(f) {
    if (f.status === "live") go(f.screen);
    else setToast(`${f.name} is coming soon`);
  }

  return (
    <AppShell active="home" user={user} go={go}>
      <p className="greet-small">{greeting()}, {firstName}</p>
      <h1 className="home-title">What do you need today?</h1>

      <div className="search">
        <SearchIcon />
        <input type="search" placeholder="Search features" aria-label="Search features"
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {continueDoc ? (
        <button type="button" className="strip" onClick={() => openDoc(continueDoc)}>
          <span className="strip-text">
            <small>Continue reading</small>
            <strong>{continueDoc.title}</strong>
            <span className="progress">
              <span style={{ width: `${Math.round((continueDoc.last_page / continueDoc.total_pages) * 100)}%` }} />
            </span>
          </span>
          <span className="strip-go"><ArrowIcon /></span>
        </button>
      ) : (
        <button type="button" className="strip" onClick={() => go("library")}>
          <span className="strip-text">
            <small>Get started</small>
            <strong>Add your first PDF</strong>
            <span className="muted">Read it anywhere, even offline.</span>
          </span>
          <span className="strip-go"><ArrowIcon /></span>
        </button>
      )}

      <h3 className="section-title">Your apps</h3>
      {shown.length === 0 && <p className="muted">No feature matches that search.</p>}
      <div className="apps">
        {shown.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <button key={f.id} type="button" className={f.status === "live" ? "app live" : "app"} onClick={() => openFeature(f)}>
              <span className="app-icon"><Icon /></span>
              {f.name}
              <small>{f.status === "live" ? "Live" : "Soon"}</small>
            </button>
          );
        })}
      </div>

      {toast && <div className="toast raised">{toast}</div>}
    </AppShell>
  );
}