import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../api";
import { Library,RefreshCcwIcon, DollarSign, Bookmark, HomeIcon, User, LogOut, BookOpen } from "lucide-react";

const NAV = [
  { to: "/member/dashboard", icon: <HomeIcon />, label: "Dashboard" },
  { to: "/member/books", icon: <Library />, label: "Browse Books" },
  { to: "/member/borrowings", icon: <RefreshCcwIcon />, label: "My Borrowings" },
  { to: "/member/fines", icon: <DollarSign />, label: "My Fines" },
  { to: "/member/reservations", icon: <Bookmark />, label: "My Reservations" },
  { to: "/member/profile", icon: <User />, label: "My Profile" },
];

export default function MemberSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon"><BookOpen /></span>
        <div>
          <p className="logo-title">LibraryMS</p>
          <p className="logo-sub">Member Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">My Library</p>
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
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "M"}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Member"}</p>
            <p className="user-role">Member</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}><LogOut /> Logout</button>
      </div>
    </aside>
  );
}