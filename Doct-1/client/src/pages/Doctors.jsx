import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import http, { apiErrorMessage } from "../api/http";
import DoctorCard from "../components/DoctorCard";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ specialty: "", location: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await http.get("/doctors", { params: filters });
      setDoctors(data);
    } catch (err) {
      setDoctors([]);
      setError(apiErrorMessage(err, "Unable to load doctors"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  return (
    <section className="container page-space">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Verified doctors</p>
          <h1>Find care by specialty and location</h1>
        </div>
      </div>
      <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); loadDoctors(); }}>
        <input className="form-control" placeholder="Specialty" value={filters.specialty} onChange={(e) => setFilters({ ...filters, specialty: e.target.value })} />
        <input className="form-control" placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit"><Search size={18} /> Search</button>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Loading doctors...</p>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
          {!doctors.length && <p className="text-muted">No approved doctors match your search.</p>}
        </div>
      )}
    </section>
  );
};

export default Doctors;
