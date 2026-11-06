import { useState } from "react";
import { api, saveToken } from "./api";
import AuthLayout from "./AuthLayout.jsx";
import PasswordField from "./PasswordField";
import { MailIcon, UserIcon, CapIcon, BarsIcon } from "./Icons";

export default function Signup({ onAuth, goLogin }) {
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", level: "100", department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveToken(data.token, true);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <AuthLayout>
      <form className="card" onSubmit={submit}>
        <img className="card-logo" src="/logo.png" alt="Unispace" />
        <h2 className="center">Join Unispace 🚀</h2>
        <p className="center sub">Your PDFs, notes and progress in one place.</p>

        <div className="field">
          <UserIcon />
          <input name="full_name" placeholder="Full name" autoComplete="name" value={form.full_name} onChange={change} required />
        </div>
        <div className="field">
          <MailIcon />
          <input name="email" type="email" placeholder="Email address" autoComplete="email" value={form.email} onChange={change} required />
        </div>
        <PasswordField
          name="password"
          placeholder="Password (8+ characters)"
          autoComplete="new-password"
          value={form.password}
          onChange={change}
        />
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
          <input name="department" placeholder="Department" value={form.department} onChange={change} required />
        </div>

        {error && <div className="error">{error}</div>}

        <button className="btn-main" disabled={loading}>
          {loading ? "Please wait..." : <>Create account <span className="arrow">→</span></>}
        </button>

        <p className="switch">
          Already have an account?{" "}
          <button type="button" className="inline-link" onClick={goLogin}>Log In</button>
        </p>
      </form>
    </AuthLayout>
  );
}