import { useState } from "react";
import { api, saveToken } from "./api";

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
      saveToken(data.token);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="screen">
      <h1>Unispace</h1>
      <form className="card" onSubmit={submit}>
        <h2>Create account</h2>
        <label>Full name</label>
        <input name="full_name" value={form.full_name} onChange={change} required />
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={change} required />
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={change} required />
        <label>Level</label>
        <select name="level" value={form.level} onChange={change}>
          {["100", "200", "300", "400", "500"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <label>Department</label>
        <input name="department" value={form.department} onChange={change} required />
        {error && <div className="error">{error}</div>}
        <button disabled={loading}>{loading ? "Please wait..." : "Sign up"}</button>
        <button type="button" className="link" onClick={goLogin}>
          I already have an account
        </button>
      </form>
    </div>
  );
}