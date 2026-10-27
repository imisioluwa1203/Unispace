import { useState } from "react";
import { api, saveToken } from "./api";

export default function Login({ onAuth, goSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const data = await api("/api/auth/login", {
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
        <h2>Log in</h2>
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={change} required />
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={change} required />
        {error && <div className="error">{error}</div>}
        <button disabled={loading}>{loading ? "Please wait..." : "Log in"}</button>
        <button type="button" className="link" onClick={goSignup}>
          Create an account
        </button>
      </form>
    </div>
  );
}