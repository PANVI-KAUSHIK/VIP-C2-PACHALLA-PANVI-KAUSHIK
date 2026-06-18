import { useEffect, useState } from "react";
import http, { apiErrorMessage } from "../api/http";

const initialAvailability = [
  { day: "Monday", startTime: "09:00", endTime: "13:00" },
  { day: "Wednesday", startTime: "14:00", endTime: "18:00" }
];

const DoctorProfile = () => {
  const [values, setValues] = useState({
    specialty: "",
    qualification: "",
    experience: 0,
    consultationFee: 0,
    location: "",
    bio: "",
    availability: initialAvailability
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    http.get("/doctors/me")
      .then(({ data }) => setValues({
        specialty: data.specialty,
        qualification: data.qualification,
        experience: data.experience,
        consultationFee: data.consultationFee,
        location: data.location,
        bio: data.bio || "",
        availability: data.availability?.length ? data.availability : initialAvailability
      }))
      .catch((err) => setError(apiErrorMessage(err, "Unable to load doctor profile")));
  }, []);

  const setAvailability = (index, key, value) => {
    const availability = [...values.availability];
    availability[index] = { ...availability[index], [key]: value };
    setValues({ ...values, availability });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await http.put("/doctors/me", values);
      setMessage("Profile saved. Admin approval is required before patients can book you.");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to save doctor profile"));
    }
  };

  return (
    <section className="container page-space">
      <form className="form-panel wide-form" onSubmit={submit}>
        <p className="eyebrow">Doctor workspace</p>
        <h1>Profile and availability</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Specialty</label>
            <input className="form-control" value={values.specialty} onChange={(e) => setValues({ ...values, specialty: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Qualification</label>
            <input className="form-control" value={values.qualification} onChange={(e) => setValues({ ...values, qualification: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Experience</label>
            <input className="form-control" type="number" value={values.experience} onChange={(e) => setValues({ ...values, experience: Number(e.target.value) })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Fee</label>
            <input className="form-control" type="number" value={values.consultationFee} onChange={(e) => setValues({ ...values, consultationFee: Number(e.target.value) })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Location</label>
            <input className="form-control" value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} required />
          </div>
          <div className="col-12">
            <label className="form-label">Bio</label>
            <textarea className="form-control" rows="3" value={values.bio} onChange={(e) => setValues({ ...values, bio: e.target.value })} />
          </div>
        </div>
        <h2 className="subheading">Availability</h2>
        <div className="availability-list">
          {values.availability.map((slot, index) => (
            <div className="availability-row" key={index}>
              <select className="form-select" value={slot.day} onChange={(e) => setAvailability(index, "day", e.target.value)}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => <option key={day}>{day}</option>)}
              </select>
              <input className="form-control" type="time" value={slot.startTime} onChange={(e) => setAvailability(index, "startTime", e.target.value)} />
              <input className="form-control" type="time" value={slot.endTime} onChange={(e) => setAvailability(index, "endTime", e.target.value)} />
            </div>
          ))}
        </div>
        <button className="btn btn-outline-primary mt-3" type="button" onClick={() => setValues({ ...values, availability: [...values.availability, { day: "Monday", startTime: "09:00", endTime: "12:00" }] })}>Add Slot</button>
        <button className="btn btn-primary w-100 mt-4" type="submit">Save Profile</button>
      </form>
    </section>
  );
};

export default DoctorProfile;
