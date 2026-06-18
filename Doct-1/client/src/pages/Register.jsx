import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../api/http";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "", role: "patient" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(values);
      navigate(values.role === "doctor" ? "/doctor-profile" : "/doctors");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to register"));
    }
  };

  return (
    <section className="container narrow-page">
      <form className="form-panel" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <label className="form-label">Name</label>
        <input className="form-control" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
        <label className="form-label mt-3">Email</label>
        <input className="form-control" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} required />
        <label className="form-label mt-3">Phone</label>
        <input className="form-control" value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} />
        <label className="form-label mt-3">Password</label>
        <input className="form-control" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} required />
        <label className="form-label mt-3">Account type</label>
        <select className="form-select" value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value })}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        <button className="btn btn-primary w-100 mt-4" type="submit">Register</button>
        <p className="text-center mt-3 mb-0">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </section>
  );
};

export default Register;
