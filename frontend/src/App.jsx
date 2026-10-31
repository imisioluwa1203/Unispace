import { useState, useEffect } from "react";
import "./index.css";
import { api, getToken, clearToken } from "./api";
import Floaters from "./Floaters";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";
import Library from "./Library";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api("/api/auth/me")
      .then((data) => {
        setUser(data.user || data);
        setScreen("library");
      })
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  function handleAuth(newUser) {
    setUser(newUser);
    setScreen("library");
  }

  function logout() {
    clearToken();
    setUser(null);
    setScreen("login");
  }

  let screenView;
  if (checking) {
    screenView = <div className="screen"><p>Loading...</p></div>;
  } else if (screen === "signup") {
    screenView = <Signup onAuth={handleAuth} goLogin={() => setScreen("login")} />;
  } else if (screen === "library" && user) {
    screenView = <Library user={user} goProfile={() => setScreen("profile")} />;
  } else if (screen === "profile" && user) {
    screenView = (
      <Profile user={user} onUpdate={setUser} onLogout={logout} goLibrary={() => setScreen("library")} />
    );
  } else {
    screenView = <Login onAuth={handleAuth} goSignup={() => setScreen("signup")} />;
  }

  return (
    <>
      <Floaters />
      {screenView}
    </>
  );
}