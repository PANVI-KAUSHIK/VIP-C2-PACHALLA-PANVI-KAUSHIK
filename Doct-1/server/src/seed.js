import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Appointment from "./models/Appointment.js";
import Doctor from "./models/Doctor.js";
import User from "./models/User.js";

dotenv.config();

await connectDB();

await Promise.all([Appointment.deleteMany(), Doctor.deleteMany(), User.deleteMany()]);

const [admin, patient, doctorUser] = await User.create([
  { name: "Admin User", email: "admin@bookdoctor.test", password: "Admin@123", role: "admin" },
  { name: "Patient User", email: "patient@bookdoctor.test", password: "Patient@123", role: "patient", phone: "9000000001" },
  { name: "Dr. Ananya Rao", email: "doctor@bookdoctor.test", password: "Doctor@123", role: "doctor", phone: "9000000002" }
]);

await Doctor.create({
  user: doctorUser._id,
  specialty: "Cardiology",
  qualification: "MBBS, MD",
  experience: 9,
  consultationFee: 800,
  location: "Hyderabad",
  bio: "Focused on preventive cardiac care and long-term patient wellness.",
  isApproved: true,
  availability: [
    { day: "Monday", startTime: "09:00", endTime: "13:00" },
    { day: "Wednesday", startTime: "14:00", endTime: "18:00" },
    { day: "Friday", startTime: "10:00", endTime: "15:00" }
  ]
});

console.log("Seed data created");
console.log({ admin: admin.email, patient: patient.email, doctor: doctorUser.email });
process.exit(0);
