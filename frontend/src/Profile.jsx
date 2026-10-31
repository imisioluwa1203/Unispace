import { useState } from "react";
import { api } from "./api";

export default function Profile({ user, onUpdate, onLogout, goLibrary }) {
  const [form, setForm] = useState({
    full_name: user.full_name,
    level: user.level,
    department: user.department,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function save(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const data = await api("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      onUpdate(data.user || data);
      setMessage("Saved");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="screen">
      <h1>Unispace</h1>
      <form className="card" onSubmit={save}>
        <h2>My profile</h2>
        <p>{user.email}</p>
        <label>Full name</label>
        <input name="full_name" value={form.full_name} onChange={change} />
        <label>Level</label>
        <select name="level" value={form.level} onChange={change}>
          {["100", "200", "300", "400", "500"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <label>Department</label>
        <input name="department" value={form.department} onChange={change} />
        {message && <div className="ok">{message}</div>}
        {error && <div className="error">{error}</div>}
        <button>Save changes</button>
         <button type="button" className="link" onClick={goLibrary}>Back to library</button>
        <button type="button" className="link" onClick={onLogout}>Log out</button>
      </form>
    </div>
  );
}