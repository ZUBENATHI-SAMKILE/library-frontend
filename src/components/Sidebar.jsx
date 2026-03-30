import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../api";
import { Settings,BookOpen, Library,RefreshCcwIcon, DollarSign, Bookmark, HomeIcon, User, LogOut } from "lucide-react";

const NAV = [
  { to: "/dashboard", icon: <HomeIcon />, label: "Dashboard" },
  { to: "/books", icon: <Library />, label: "Books" },
  { to: "/members", icon: <User />, label: "Members" },
  { to: "/borrowings", icon: <RefreshCcwIcon />, label: "Borrowings" },
  { to: "/fines", icon: <DollarSign />, label: "Fines" },
  { to: "/reservations", icon: <Bookmark />, label: "Reservations" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon"><BookOpen  color="white"/></span>
        <div>
          <p className="logo-title">LibraryMS</p>
          <p className="logo-sub">Management System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Main Menu</p>
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${pathname.startsWith(item.to) ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {user?.role === "admin" && (
          <>
            <p className="nav-section-label" style={{ marginTop: "1.5rem" }}>Admin</p>
            <Link
              to="/admin"
              className={`nav-item ${pathname.startsWith("/admin") ? "active" : ""}`}
            >
              <span className="nav-icon"><Settings /></span>
              <span>Admin Dashboard</span>
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Staff"}</p>
            <p className="user-role">{user?.role || "librarian"}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}><LogOut /> Logout</button>
      </div>
    </aside>
  );
}