import { CalendarCheck, ClipboardList, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => (
  <section className="home-band">
    <div className="container">
      <div className="home-grid">
        <div>
          <p className="eyebrow">Healthcare booking platform</p>
          <h1>Book a Doctor</h1>
          <p className="lead">
            Find verified doctors, schedule appointments, upload reports, and manage care from one secure dashboard.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary btn-lg" to="/doctors">Browse Doctors</Link>
            <Link className="btn btn-outline-primary btn-lg" to="/register">Create Account</Link>
          </div>
        </div>
        <div className="quick-panel">
          <div><CalendarCheck /> Real-time appointment requests</div>
          <div><ClipboardList /> Reports and prescriptions linked to visits</div>
          <div><ShieldCheck /> Role-based patient, doctor, and admin access</div>
        </div>
      </div>
    </div>
  </section>
);

export default Home;
