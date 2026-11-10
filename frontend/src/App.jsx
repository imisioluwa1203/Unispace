import "@fontsource-variable/plus-jakarta-sans";
import "./theme";
import { useState, useEffect } from "react";
import "./index.css";
import { api, getToken, clearToken } from "./api";
import { clearOffline, useOnline, loadData, saveData } from "./Offline.js";
import Floaters from "./Floaters";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home.jsx";
import Library from "./Library";
import Profile from "./Profile";
import Reader from "./Reader";
import Calculator from "./Calculator";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [readerFrom, setReaderFrom] = useState("library");
  const [checking, setChecking] = useState(Boolean(getToken()));
  const online = useOnline();

  useEffect(() => {
    if (!getToken()) return;
    api("/api/auth/me")
      .then((data) => {
        const me = data.user || data;
        setUser(me);
        saveData("user", me);
        setScreen("home");
      })
      .catch((err) => {
        const savedUser = loadData("user");
        if (err.offline && savedUser) {
          setUser(savedUser);
          setScreen("home");
        } else if (!err.offline) {
          clearToken();
        }
      })
      .finally(() => setChecking(false));
  }, []);

  function handleAuth(newUser) {
    setUser(newUser);
    saveData("user", newUser);
    setScreen("home");
  }

  function updateUser(updated) {
    setUser(updated);
    saveData("user", updated);
  }

  function openDoc(doc, page) {
    setReaderFrom(screen === "home" ? "home" : "library");
    setCurrentDoc(page ? { ...doc, last_page: page } : doc);
    setScreen("reader");
  }

  function logout() {
    clearOffline();
    clearToken();
    setUser(null);
    setCurrentDoc(null);
    setScreen("login");
  }

  let screenView;
  if (checking) {
    screenView = <div className="screen"><p>Loading...</p></div>;
  } else if (screen === "signup") {
    screenView = <Signup onAuth={handleAuth} goLogin={() => setScreen("login")} />;
  } else if (screen === "home" && user) {
    screenView = <Home user={user} go={setScreen} openDoc={openDoc} />;
  } else if (screen === "library" && user) {
    screenView = <Library user={user} go={setScreen} openDoc={openDoc} />;
  } else if (screen === "calculator" && user) {
    screenView = <Calculator user={user} go={setScreen} />;
  } else if (screen === "reader" && currentDoc) {
    screenView = <Reader doc={currentDoc} onBack={() => setScreen(readerFrom)} />;
  } else if (screen === "profile" && user) {
    screenView = <Profile user={user} onUpdate={updateUser} onLogout={logout} go={setScreen} />;
  } else {
    screenView = <Login onAuth={handleAuth} goSignup={() => setScreen("signup")} />;
  }


  return (
    <>
      <Floaters />
      {!online && (
        <div className="offline-bar">You are offline. PDFs saved on this device still open.</div>
      )}
      {screenView}
    </>
  );
}