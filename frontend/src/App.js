import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import {
  clearAdminSession,
  getAdminSession,
  saveAdminSession
} from "./services/api";

function App() {
  const [adminSession, setAdminSession] = useState(() => getAdminSession());

  const handleAuthChange = (session) => {
    if (session) {
      saveAdminSession(session);
      setAdminSession(session);
      return;
    }

    clearAdminSession();
    setAdminSession(null);
  };

  return (
    <div className="app-shell">
      <Navbar adminSession={adminSession} onLogout={() => handleAuthChange(null)} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin"
            element={
              <Admin
                adminSession={adminSession}
                onAuthChange={handleAuthChange}
              />
            }
          />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
