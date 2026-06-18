import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http, { apiErrorMessage } from "../api/http";

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [values, setValues] = useState({ appointmentDate: "", timeSlot: "", reason: "" });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    http.get(`/doctors/${id}`)
      .then(({ data }) => setDoctor(data))
      .catch((err) => setMessage(apiErrorMessage(err, "Unable to load doctor")));
  }, [id]);

  const selectDate = async (appointmentDate) => {
    setValues({ ...values, appointmentDate, timeSlot: "" });
    setMessage("");
    if (!appointmentDate) return setSlots([]);

    setLoadingSlots(true);
    try {
      const { data } = await http.get(`/doctors/${id}/slots`, { params: { date: appointmentDate } });
      setSlots(data);
    } catch (err) {
      setSlots([]);
      setMessage(apiErrorMessage(err, "Unable to load available times"));
    } finally {
      setLoadingSlots(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await http.post("/appointments", { ...values, doctor: id });
      navigate("/appointments");
    } catch (err) {
      setMessage(apiErrorMessage(err, "Unable to book this appointment"));
    }
  };

  return (
    <section className="container narrow-page">
      <form className="form-panel" onSubmit={submit}>
        <p className="eyebrow">Appointment request</p>
        <h1>{doctor ? doctor.user?.name : "Doctor"}</h1>
        {doctor && <p className="text-muted">{doctor.specialty} | {doctor.location}</p>}
        {message && <div className="alert alert-danger">{message}</div>}
        <label className="form-label">Date</label>
        <input className="form-control" type="date" min={new Date().toISOString().slice(0, 10)} value={values.appointmentDate} onChange={(e) => selectDate(e.target.value)} required />
        <label className="form-label mt-3">Time slot</label>
        <select className="form-select" value={values.timeSlot} onChange={(e) => setValues({ ...values, timeSlot: e.target.value })} disabled={!values.appointmentDate || loadingSlots} required>
          <option value="">{loadingSlots ? "Loading times..." : "Select an available time"}</option>
          {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
        </select>
        {values.appointmentDate && !loadingSlots && !slots.length && <p className="small text-muted mt-2 mb-0">No times are available on this date.</p>}
        <label className="form-label mt-3">Reason</label>
        <textarea className="form-control" rows="4" value={values.reason} onChange={(e) => setValues({ ...values, reason: e.target.value })} required />
        <button className="btn btn-primary w-100 mt-4" type="submit">Confirm Booking</button>
      </form>
    </section>
  );
};

export default BookAppointment;
