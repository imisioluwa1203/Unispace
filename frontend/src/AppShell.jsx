import { initials } from "./helpers";
import { HomeIcon, BooksIcon, UserIcon } from "./Icons";

const TABS = [
  { key: "home", label: "Home", Icon: HomeIcon },
  { key: "library", label: "Library", Icon: BooksIcon },
  { key: "profile", label: "Profile", Icon: UserIcon },
];

export default function AppShell({ active, user, go, narrow, children }) {
  return (
    <>
        <div className="app-art" aria-hidden="true" />
      <header className="app-header">
        <div className="app-nav">
          <button type="button" className="app-brand" onClick={() => go("home")}>
            <img src="/logo.png" alt="" /> Unispace
          </button>
          <nav className="app-links" aria-label="Main">
            {TABS.slice(0, 2).map(({ key, label }) => (
              <button key={key} type="button" className={active === key ? "nav-btn active" : "nav-btn"} onClick={() => go(key)}>
                {label}
              </button>
            ))}
          </nav>
          <button type="button" className="avatar-btn" onClick={() => go("profile")} aria-label="Open profile">
            {initials(user.full_name)}
          </button>
        </div>
      </header>

      <main className={narrow ? "page narrow" : "page"}>{children}</main>

      <nav className="tabbar" aria-label="Tabs">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} type="button" className={active === key ? "on" : ""} onClick={() => go(key)}>
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}