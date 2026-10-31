import { useState, useEffect } from "react";
import { api } from "./api";

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Library({ user, goProfile,openDoc }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/library")
      .then((data) => setDocuments(data.documents))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function upload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const data = await api("/api/library", { method: "POST", body });
      setDocuments([data.document, ...documents]);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function remove(id) {
    if (!window.confirm("Delete this PDF?")) return;
    setError("");
    try {
      await api(`/api/library/${id}`, { method: "DELETE" });
      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="screen">
      <h1>Unispace</h1>
      <div className="topbar">
        <span>Hi, {user.full_name.split(" ")[0]}</span>
        <button className="link" onClick={goProfile}>Profile</button>
      </div>
        <div className="card">
          <h2>My library</h2>
          <label className="upload-btn">
            {uploading ? "Uploading..." : "+ Add PDF"}
            <input type="file" accept="application/pdf" onChange={upload} disabled={uploading} hidden />
          </label>
          {error && <div className="error">{error}</div>}
          {loading && <p>Loading...</p>}
          {!loading && documents.length === 0 && <p>No PDFs yet. Add your first one.</p>}
          <ul className="doc-list">
            {documents.map((d) => (
              <li key={d.id}>
                <button className="doc-open" onClick={() => openDoc(d)}>
                  <strong>{d.title}</strong>
                  <small>
                    {formatSize(d.size_bytes)}
                    {d.total_pages ? ` · Page ${d.last_page} of ${d.total_pages}` : " · Not opened yet"}
                  </small>
                </button>
                <button className="delete" onClick={() => remove(d.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
}