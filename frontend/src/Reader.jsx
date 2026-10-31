import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { api, apiFile } from "./api";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default function Reader({ doc, onBack }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(doc.last_page || 1);
  const [jump, setJump] = useState("");
  const [error, setError] = useState("");
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. Download the PDF and open it (once)
  useEffect(() => {
    let cancelled = false;
    apiFile(`/api/library/${doc.id}/file`)
      .then((buffer) => pdfjsLib.getDocument({ data: buffer }).promise)
      .then((loaded) => {
        if (cancelled) return;
        setPdf(loaded);
        setNumPages(loaded.numPages);
        setPageNum((p) => Math.min(Math.max(p, 1), loaded.numPages));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not open this PDF.");
      });
    return () => {
      cancelled = true;
    };
  }, [doc.id]);

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

  // 3. Save where the student stopped
  useEffect(() => {
    if (!pdf) return;
    api(`/api/library/${doc.id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ last_page: pageNum, total_pages: numPages }),
    }).catch(() => {});
  }, [pdf, pageNum, numPages, doc.id]);

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