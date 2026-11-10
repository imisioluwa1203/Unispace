import { useState, useEffect } from "react";
import { api } from "./api";
import AppShell from "./AppShell";
import { loadData, saveData, removeData, hasCachedPdf, removeCachedPdf, docKey } from "./Offline.js";
import { formatSize, pickContinue, pagesRead } from "./helpers";
import { FileIcon, BooksIcon, PencilIcon, ChevronIcon, ArrowIcon, PlusIcon } from "./Icons";

const EMPTY_SUMMARY = { notes_count: 0, recent_notes: [] };

export default function Library({ user, go, openDoc }) {
  const [documents, setDocuments] = useState(() => loadData("library") || []);
  const [summary, setSummary] = useState(() => loadData("summary") || EMPTY_SUMMARY);
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function refreshSummary() {
    api("/api/library/summary")
      .then((data) => {
        setSummary(data);
        saveData("summary", data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    api("/api/library")
      .then((data) => {
        setDocuments(data.documents);
        saveData("library", data.documents);
      })
      .catch((err) => {
        if (!err.offline) setError(err.message);
        else if (!loadData("library")) setError("No internet connection and no saved list yet.");
      })
      .finally(() => setLoading(false));
    refreshSummary();
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(documents.map((d) => hasCachedPdf(d))).then((flags) => {
      if (cancelled) return;
      const map = {};
      documents.forEach((d, i) => {
        map[d.id] = flags[i];
      });
      setSaved(map);
    });
    return () => {
      cancelled = true;
    };
  }, [documents]);

  async function upload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const data = await api("/api/library", { method: "POST", body });
      const updated = [data.document, ...documents];
      setDocuments(updated);
      saveData("library", updated);
    } catch (err) {
      setError(err.offline ? "You are offline. Connect to the internet to add a PDF." : err.message);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function remove(d) {
    if (!window.confirm("Delete this PDF?")) return;
    setError("");
    try {
      await api(`/api/library/${d.id}`, { method: "DELETE" });
      const updated = documents.filter((x) => x.id !== d.id);
      setDocuments(updated);
      saveData("library", updated);
      removeCachedPdf(d);
      removeData(`notes_${docKey(d)}`);
      removeData(`page_${docKey(d)}`);
      refreshSummary();
    } catch (err) {
      setError(err.offline ? "You are offline. Connect to the internet to delete a PDF." : err.message);
    }
  }

  const continueDoc = pickContinue(documents);
  const percent = continueDoc ? Math.round((continueDoc.last_page / continueDoc.total_pages) * 100) : 0;

  const uploadButton = (
    <label className="upload-btn">
      {uploading ? "Uploading..." : <><PlusIcon /> Add PDF</>}
      <input type="file" accept="application/pdf" onChange={upload} disabled={uploading} hidden />
    </label>
  );

  return (
    <AppShell active="library" user={user} go={go}>
      <h2 className="page-title">Library</h2>
      {error && <div className="error">{error}</div>}

      {documents.length === 0 && !loading ? (
        <section className="card empty">
          <FileIcon />
          <h3>Start your library</h3>
          <p className="muted">Add a PDF and read it anywhere, even offline.</p>
          {uploadButton}
        </section>
      ) : (
        <>
          {continueDoc && (
            <section className="card continue">
              <p className="eyebrow">Continue reading</p>
              <h3 className="doc-title">{continueDoc.title}</h3>
              <div className="progress"><span style={{ width: `${percent}%` }} /></div>
              <p className="muted small">
                Page {continueDoc.last_page} of {continueDoc.total_pages} · {percent}%
                {saved[continueDoc.id] ? " · Saved offline" : ""}
              </p>
              <button type="button" className="btn-main" onClick={() => openDoc(continueDoc)}>
                Resume reading <span className="arrow"><ArrowIcon /></span>
              </button>
            </section>
          )}

          <section className="stat-row">
            <div className="stat"><FileIcon /><strong>{documents.length}</strong><small>PDFs</small></div>
            <div className="stat"><BooksIcon /><strong>{pagesRead(documents)}</strong><small>Pages read</small></div>
            <div className="stat"><PencilIcon /><strong>{summary.notes_count}</strong><small>Notes</small></div>
          </section>

          {summary.recent_notes.length > 0 && (
            <>
              <h3 className="section-title">Recent notes</h3>
              <ul className="rows">
                {summary.recent_notes.map((n) => {
                  const d = documents.find((x) => x.id === n.doc_id);
                  return (
                    <li key={n.id}>
                      <button type="button" className="row-btn" disabled={!d} onClick={() => d && openDoc(d, n.page)}>
                        <span className="row-text">
                          <strong>{n.body}</strong>
                          <small>{n.doc_title} · Page {n.page}</small>
                        </span>
                        <ChevronIcon />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <section className="card">
            <h3 className="section-title">My PDFs</h3>
            {uploadButton}
            <ul className="doc-list">
              {documents.map((d) => (
                <li key={d.id}>
                  <button type="button" className="doc-open" onClick={() => openDoc(d)}>
                    <strong>{d.title}</strong>
                    <small>
                      {formatSize(d.size_bytes)}
                      {d.total_pages ? ` · Page ${d.last_page} of ${d.total_pages}` : " · Not opened yet"}
                      {saved[d.id] ? " · Saved offline" : ""}
                    </small>
                  </button>
                  <button type="button" className="delete" onClick={() => remove(d)}>Delete</button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </AppShell>
  );
}