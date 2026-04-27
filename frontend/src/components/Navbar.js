import { NavLink } from "react-router-dom";

function Navbar({ adminSession, onLogout }) {
  const linkClassName = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <header className="site-header">
      <div className="container navbar">
        <NavLink className="brand" to="/">
          Career Compass
        </NavLink>

        <nav className="nav-links">
          <NavLink className={linkClassName} to="/">
            Home
          </NavLink>
          <NavLink className={linkClassName} to="/quiz">
            Quiz
          </NavLink>
          <NavLink className={linkClassName} to="/result">
            Result
          </NavLink>
          <NavLink className={linkClassName} to="/admin">
            Admin
          </NavLink>

          {adminSession?.user?.name && (
            <span className="admin-pill">{adminSession.user.name}</span>
          )}

          {adminSession?.token && (
            <button className="nav-button" type="button" onClick={onLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
