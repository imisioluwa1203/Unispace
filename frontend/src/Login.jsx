import { useState } from "react";
import { api, saveToken } from "./api";
import AuthLayout from "./AuthLayout.jsx";
import PasswordField from "./PasswordField";
import { MailIcon } from "./Icons";

export default function Login({ onAuth, goSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    const id = form.email.trim();
    if (!id.includes("@")) {
      setError("Matric number login is coming soon. Please use your email for now.");
      return;
    }
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: id, password: form.password }),
      });
      saveToken(data.token, remember);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <AuthLayout onJoin={goSignup}>
      <form className="card" onSubmit={submit}>
        <img className="card-logo" src="/logo.png" alt="Unispace" />
        <h2 className="center">Welcome Back!</h2>
        <p className="center sub">Let's continue your Unispace journey 🚀</p>

        <div className="field">
          <MailIcon />
          <input
            name="email"
            type="text"
            placeholder="Matric / Email Address"
            autoComplete="username"
            value={form.email}
            onChange={change}
            required
          />
        </div>
        <PasswordField
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={change}
        />

        <div className="row-between">
          <label className="check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <button type="button" className="text-link" onClick={() => setNotice("Password reset by email is coming soon.")}>
            Forgot Password?
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {notice && <div className="info">{notice}</div>}

        <button className="btn-main" disabled={loading}>
          {loading ? "Please wait..." : <>Log In <span className="arrow">→</span></>}
        </button>

        <div className="or"><span>or</span></div>
        <button type="button" className="btn-social" onClick={() => setNotice("Google sign-in is coming soon.")}>
          <span className="g-logo">G</span> Continue with Google
        </button>

        <p className="switch">
          Don't have an account?{" "}
          <button type="button" className="inline-link" onClick={goSignup}>Sign Up</button>
        </p>
      </form>
    </AuthLayout>
  );
}