import { useState } from "react";
import { api } from "./api";
import AppShell from "./AppShell";
import ThemeToggle from "./ThemeToggle";
import { initials } from "./helpers";
import { UserIcon, CapIcon, BarsIcon } from "./Icons";

export default function Profile({ user, onUpdate, onLogout, go }) {
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
      const data = await api("/api/auth/me", { method: "PATCH", body: JSON.stringify(form) });
      onUpdate(data.user || data);
      setMessage("Saved");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell active="profile" user={user} go={go} narrow>
      <h2 className="page-title">Profile</h2>
      <form className="card" onSubmit={save}>
        <div className="profile-head">
          <div className="avatar-lg">{initials(user.full_name)}</div>
          <div>
            <strong>{user.full_name}</strong>
            <p className="muted profile-email">{user.email}</p>
          </div>
        </div>

        <div className="field">
          <UserIcon />
          <input name="full_name" placeholder="Full name" value={form.full_name} onChange={change} />
        </div>
        <div className="field">
          <BarsIcon />
          <select name="level" value={form.level} onChange={change}>
            {["100", "200", "300", "400", "500"].map((l) => (
              <option key={l} value={l}>{l} Level</option>
            ))}
          </select>
        </div>
        <div className="field">
          <CapIcon />
          <input name="department" placeholder="Department" value={form.department} onChange={change} />
        </div>

        {message && <div className="ok">{message}</div>}
        {error && <div className="error">{error}</div>}
        <button className="btn-main">Save changes</button>
      </form>

      <section className="card setting-card">
        <div className="setting-row">
          <span>Appearance</span>
          <ThemeToggle />
        </div>
        <button type="button" className="danger-btn" onClick={onLogout}>Log out</button>
      </section>
    </AppShell>
  );
}