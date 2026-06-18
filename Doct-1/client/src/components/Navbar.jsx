import { CalendarPlus, LogOut, Stethoscope, UserCog } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <Stethoscope size={24} />
          Book a Doctor
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <NavLink className="nav-link" to="/doctors">Doctors</NavLink>
            {user && <NavLink className="nav-link" to="/appointments">Appointments</NavLink>}
            {user?.role === "doctor" && <NavLink className="nav-link" to="/doctor-profile">Doctor Profile</NavLink>}
            {user?.role === "admin" && <NavLink className="nav-link" to="/admin"><UserCog size={18} /> Admin</NavLink>}
            {!user ? (
              <>
                <NavLink className="btn btn-outline-primary btn-sm" to="/login">Login</NavLink>
                <NavLink className="btn btn-primary btn-sm" to="/register">Register</NavLink>
              </>
            ) : (
              <button className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1" onClick={logout}>
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
