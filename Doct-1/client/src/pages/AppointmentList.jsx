import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import http, { apiErrorMessage } from "../api/http";
import { useAuth } from "../context/AuthContext";

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  const loadAppointments = async () => {
    setMessage("");
    try {
      const { data } = await http.get("/appointments");
      setAppointments(data);
    } catch (err) {
      setAppointments([]);
      setMessage(apiErrorMessage(err, "Unable to load appointments"));
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    setMessage("");
    try {
      await http.patch(`/appointments/${id}/status`, { status });
      loadAppointments();
    } catch (err) {
      setMessage(apiErrorMessage(err, "Unable to update appointment"));
    }
  };

  const uploadDocument = async (id, file) => {
    const formData = new FormData();
    formData.append("document", file);
    setMessage("");
    try {
      await http.post(`/appointments/${id}/documents`, formData);
      setMessage("Document uploaded successfully.");
      loadAppointments();
    } catch (err) {
      setMessage(apiErrorMessage(err, "Document upload failed"));
    }
  };

  const downloadDocument = async (appointmentId, document) => {
    setMessage("");
    try {
      const { data } = await http.get(`/appointments/${appointmentId}/documents/${document._id}`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage(apiErrorMessage(err, "Document download failed"));
    }
  };

  const statusAction = (appointment) => {
    if (user.role === "patient" && ["pending", "confirmed"].includes(appointment.status)) {
      return <button className="btn btn-outline-danger btn-sm" onClick={() => updateStatus(appointment._id, "cancelled")}>Cancel</button>;
    }
    if (user.role === "doctor" && appointment.status === "pending") {
      return (
        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={() => updateStatus(appointment._id, "confirmed")}>Confirm</button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => updateStatus(appointment._id, "cancelled")}>Decline</button>
        </div>
      );
    }
    if (user.role === "doctor" && appointment.status === "confirmed") {
      return <button className="btn btn-primary btn-sm" onClick={() => updateStatus(appointment._id, "completed")}>Complete</button>;
    }
    return null;
  };

  return (
    <section className="container page-space">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Care schedule</p>
          <h1>Appointments</h1>
        </div>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="table-responsive data-panel">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Documents</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{new Date(appointment.appointmentDate).toLocaleDateString()}<br /><span className="text-muted">{appointment.timeSlot}</span></td>
                <td>{appointment.doctor?.user?.name}</td>
                <td>{appointment.patient?.name}</td>
                <td>{appointment.reason}</td>
                <td>
                  <span className={`status status-${appointment.status}`}>{appointment.status}</span>
                  <div className="mt-2">{statusAction(appointment)}</div>
                </td>
                <td>
                  <div className="d-flex flex-column gap-2">
                    {appointment.documents?.map((document) => (
                      <button className="btn btn-link btn-sm p-0 text-start" key={document._id} onClick={() => downloadDocument(appointment._id, document)}>
                        {document.originalName}
                      </button>
                    ))}
                    {!appointment.documents?.length && <span className="text-muted">No documents</span>}
                    {user.role === "patient" && (
                      <label className="btn btn-outline-primary btn-sm upload-button">
                        <Upload size={15} /> Upload
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => e.target.files[0] && uploadDocument(appointment._id, e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!appointments.length && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">No appointments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AppointmentList;
