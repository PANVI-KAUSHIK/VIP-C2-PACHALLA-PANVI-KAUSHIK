import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import http, { apiErrorMessage } from "../api/http";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    setMessage("");
    try {
      const [statsResponse, doctorsResponse] = await Promise.all([
        http.get("/admin/stats"),
        http.get("/admin/doctors")
      ]);
      setStats(statsResponse.data);
      setDoctors(doctorsResponse.data);
    } catch (err) {
      setMessage(apiErrorMessage(err, "Unable to load admin dashboard"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id, isApproved) => {
    setMessage("");
    try {
      await http.patch(`/admin/doctors/${id}/approval`, { isApproved });
      load();
    } catch (err) {
      setMessage(apiErrorMessage(err, "Unable to update doctor approval"));
    }
  };

  return (
    <section className="container page-space">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Platform management</p>
          <h1>Admin Dashboard</h1>
        </div>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="stats-grid">
        <div><strong>{stats.users || 0}</strong><span>Users</span></div>
        <div><strong>{stats.doctors || 0}</strong><span>Doctors</span></div>
        <div><strong>{stats.pendingDoctors || 0}</strong><span>Pending</span></div>
        <div><strong>{stats.appointments || 0}</strong><span>Appointments</span></div>
      </div>
      <div className="table-responsive data-panel mt-4">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor._id}>
                <td>{doctor.user?.name}<br /><span className="text-muted">{doctor.user?.email}</span></td>
                <td>{doctor.specialty}</td>
                <td>{doctor.location}</td>
                <td><span className={`status ${doctor.isApproved ? "status-confirmed" : "status-pending"}`}>{doctor.isApproved ? "approved" : "pending"}</span></td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={() => approve(doctor._id, true)}><CheckCircle size={16} /> Approve</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => approve(doctor._id, false)}><XCircle size={16} /> Hold</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminDashboard;
