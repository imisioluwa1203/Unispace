import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { api, apiFile } from "./api";
import { getCachedPdf, savePdfToCache, loadData, saveData, removeData, docKey } from "./offline";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default function Reader({ doc, onBack }) {
  const key = docKey(doc);
  const notesKey = `notes_${key}`;
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(() => loadData(`page_${key}`) || doc.last_page || 1);
  const [jump, setJump] = useState("");
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState("");
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. Open the PDF: from this device if saved, otherwise download it once and save it
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let buffer = await getCachedPdf(doc);
        if (!buffer) {
          buffer = await apiFile(`/api/library/${doc.id}/file`);
          await savePdfToCache(doc, buffer);
        }
        const loaded = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (cancelled) return;
        setPdf(loaded);
        setNumPages(loaded.numPages);
        setPageNum((p) => Math.min(Math.max(p, 1), loaded.numPages));
      } catch (err) {
        if (!cancelled) {
          setError(
            err.offline
              ? "This PDF is not saved on your device yet. Connect to the internet and open it once."
              : err.message || "Could not open this PDF."
          );
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  // 2. Draw the current page whenever the page number changes
  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    let renderTask = null;
    window.scrollTo({ top: 0 });

    pdf.getPage(pageNum).then((page) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const base = page.getViewport({ scale: 1 });
      const fit = wrapRef.current.clientWidth / base.width;
      const viewport = page.getViewport({ scale: fit * (window.devicePixelRatio || 1) });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      renderTask = page.render({ canvasContext: canvas.getContext("2d"), viewport });
      renderTask.promise.catch(() => {});
    });

    return () => {
      cancelled = true;
      if (renderTask) renderTask.cancel();
    };
  }, [pdf, pageNum]);

  // 3. Save where the student stopped (kept on the device if offline, synced later)
  useEffect(() => {
    if (!pdf) return;
    api(`/api/library/${doc.id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ last_page: pageNum, total_pages: numPages }),
    })
      .then(() => removeData(`page_${key}`))
      .catch((err) => {
        if (err.offline) saveData(`page_${key}`, pageNum);
      });
  }, [pdf, pageNum, numPages, doc.id, key]);

  // 4. Notes: show the saved copy at once, then refresh from the server
  useEffect(() => {
    const savedNotes = loadData(notesKey);
    if (savedNotes) setNotes(savedNotes);
    api(`/api/library/${doc.id}/notes`)
      .then((data) => {
        setNotes(data.notes);
        saveData(notesKey, data.notes);
      })
      .catch((err) => {
        if (!err.offline) setNoteError("Could not load notes.");
      });
  }, [doc.id, notesKey]);

  const pageNotes = notes.filter((n) => n.page === pageNum);

  async function addNote(e) {
    e.preventDefault();
    setNoteError("");
    try {
      const data = await api(`/api/library/${doc.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ page: pageNum, content: noteText }),
      });
      const updated = [...notes, data.note];
      setNotes(updated);
      saveData(notesKey, updated);
      setNoteText("");
    } catch (err) {
      setNoteError(err.offline ? "You are offline, so this note was not saved. Try again with internet." : err.message);
    }
  }

  async function removeNote(id) {
    if (!window.confirm("Delete this note?")) return;
    setNoteError("");
    try {
      await api(`/api/library/${doc.id}/notes/${id}`, { method: "DELETE" });
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      saveData(notesKey, updated);
    } catch (err) {
      setNoteError(err.offline ? "You are offline, so this note was not deleted." : err.message);
    }
  }

  function goTo(e) {
    e.preventDefault();
    const n = parseInt(jump, 10);
    if (n >= 1 && n <= numPages) setPageNum(n);
    setJump("");
  }

  return (
    <div className="screen reader">
      <h1>Unispace</h1>
      <div className="topbar">
        <button className="link" onClick={onBack}>← Library</button>
        <span className="reader-title">{doc.title}</span>
      </div>

      <div className="page-wrap" ref={wrapRef}>
        {error && <div className="error">{error}</div>}
        {!pdf && !error && <p>Opening PDF...</p>}
        <canvas ref={canvasRef} style={{ display: pdf ? "block" : "none" }} />
      </div>

      {pdf && (
        <div className="card notes-card">
          <h2>Notes on page {pageNum}</h2>
          <form onSubmit={addNote}>
            <textarea
              rows={3}
              maxLength={2000}
              placeholder="Write a note for this page..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button disabled={!noteText.trim()}>Add note</button>
          </form>
          {noteError && <div className="error">{noteError}</div>}
          {pageNotes.length === 0 && <p className="muted">No notes on this page yet.</p>}
          <ul className="doc-list">
            {pageNotes.map((n) => (
              <li key={n.id}>
                <span className="note-text">{n.body}</span>
                <button className="delete" onClick={() => removeNote(n.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pdf && (
        <div className="reader-bar">
          <button disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)}>◀</button>
          <span>Page {pageNum} of {numPages}</span>
          <button disabled={pageNum >= numPages} onClick={() => setPageNum(pageNum + 1)}>▶</button>
          <form onSubmit={goTo}>
            <input
              type="number"
              min="1"
              max={numPages}
              placeholder="Go to"
              value={jump}
              onChange={(e) => setJump(e.target.value)}
            />
            <button>Go</button>
          </form>
        </div>
      )}
    </div>
  );
}