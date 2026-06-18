import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../api/http";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(values);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      navigate(storedUser.role === "admin" ? "/admin" : storedUser.role === "doctor" ? "/appointments" : "/doctors");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to login"));
    }
  };

  return (
    <section className="container narrow-page">
      <form className="form-panel" onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <label className="form-label">Email</label>
        <input className="form-control" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} required />
        <label className="form-label mt-3">Password</label>
        <input className="form-control" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} required />
        <button className="btn btn-primary w-100 mt-4" type="submit">Login</button>
        <p className="text-center mt-3 mb-0">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </section>
  );
};

export default Login;
