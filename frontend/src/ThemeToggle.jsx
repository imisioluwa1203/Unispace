import { useState } from "react";
import { getTheme, applyTheme } from "./theme";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme());

  function pick(next) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      <button type="button" className={theme === "light" ? "on" : ""} onClick={() => pick("light")} aria-label="Light mode">
        <SunIcon />
      </button>
      <button type="button" className={theme === "dark" ? "on" : ""} onClick={() => pick("dark")} aria-label="Dark mode">
        <MoonIcon />
      </button>
    </div>
  );
}