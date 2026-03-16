import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute, AdminRoute } from "./components/PrivateRoute";
import { getCurrentUser, isLoggedIn } from "./api";
import Sidebar from "./components/Sidebar";
import MemberSidebar from "./components/MemberSidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Borrowings from "./pages/Borrowings";
import Fines from "./pages/Fines";
import Reservations from "./pages/Reservations";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/member/MemberDashboard";
import BrowseBooks from "./pages/member/BrowseBooks";
import MyBorrowings from "./pages/member/MyBorrowings";
import MyFines from "./pages/member/MyFines";
import MyReservations from "./pages/member/MyReservations";
import MyProfile from "./pages/member/MyProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function StaffLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function MemberLayout({ children }) {
  return (
    <div className="app-layout">
      <MemberSidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function MemberRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const user = getCurrentUser();
  if (user?.role !== "member") return <Navigate to="/dashboard" replace />;
  return children;
}

function SmartHome() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const user = getCurrentUser();
  if (user?.role === "member") return <Navigate to="/member/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SmartHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />

        {/* Staff routes */}
        <Route path="/dashboard" element={
          <PrivateRoute><StaffLayout><Dashboard /></StaffLayout></PrivateRoute>
        } />
        <Route path="/books" element={
          <PrivateRoute><StaffLayout><Books /></StaffLayout></PrivateRoute>
        } />
        <Route path="/members" element={
          <PrivateRoute><StaffLayout><Members /></StaffLayout></PrivateRoute>
        } />
        <Route path="/borrowings" element={
          <PrivateRoute><StaffLayout><Borrowings /></StaffLayout></PrivateRoute>
        } />
        <Route path="/fines" element={
          <PrivateRoute><StaffLayout><Fines /></StaffLayout></PrivateRoute>
        } />
        <Route path="/reservations" element={
          <PrivateRoute><StaffLayout><Reservations /></StaffLayout></PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><StaffLayout><AdminDashboard /></StaffLayout></AdminRoute>
        } />

        {/* Member routes */}
        <Route path="/member/dashboard" element={
          <MemberRoute><MemberLayout><MemberDashboard /></MemberLayout></MemberRoute>
        } />
        <Route path="/member/books" element={
          <MemberRoute><MemberLayout><BrowseBooks /></MemberLayout></MemberRoute>
        } />
        <Route path="/member/borrowings" element={
          <MemberRoute><MemberLayout><MyBorrowings /></MemberLayout></MemberRoute>
        } />
        <Route path="/member/fines" element={
          <MemberRoute><MemberLayout><MyFines /></MemberLayout></MemberRoute>
        } />
        <Route path="/member/reservations" element={
          <MemberRoute><MemberLayout><MyReservations /></MemberLayout></MemberRoute>
        } />
        <Route path="/member/profile" element={
          <MemberRoute><MemberLayout><MyProfile /></MemberLayout></MemberRoute>
        } />
      </Routes>
    </Router>
  );
}