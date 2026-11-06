import { useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon } from "./Icons";

export default function PasswordField({ name, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <LockIcon />
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required
      />
      <button type="button" className="eye" onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}