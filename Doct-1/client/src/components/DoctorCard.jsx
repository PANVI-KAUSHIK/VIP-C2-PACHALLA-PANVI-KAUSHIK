import { CalendarPlus, MapPin, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const DoctorCard = ({ doctor }) => (
  <article className="doctor-card">
    <div>
      <p className="small text-uppercase text-muted mb-1">{doctor.specialty}</p>
      <h3>{doctor.user?.name}</h3>
      <p className="mb-2 text-muted">{doctor.qualification} | {doctor.experience} years</p>
      <p className="doctor-bio">{doctor.bio || "Experienced healthcare provider available for consultations."}</p>
    </div>
    <div className="doctor-meta">
      <span><MapPin size={16} /> {doctor.location}</span>
      <span><Wallet size={16} /> Rs. {doctor.consultationFee}</span>
    </div>
    <Link className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2" to={`/book/${doctor._id}`}>
      <CalendarPlus size={18} />
      Book Appointment
    </Link>
  </article>
);

export default DoctorCard;
