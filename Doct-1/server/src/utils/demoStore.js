import bcrypt from "bcryptjs";

export const demoDoctorId = "000000000000000000000001";
export const demoDoctorUserId = "000000000000000000000012";

export const demoDoctor = {
  _id: demoDoctorId,
  user: {
    _id: demoDoctorUserId,
    name: "Dr. Ananya Rao",
    email: "doctor@bookdoctor.test",
    phone: "9000000002"
  },
  specialty: "Cardiology",
  qualification: "MBBS, MD",
  experience: 9,
  consultationFee: 800,
  location: "Hyderabad",
  bio: "Focused on preventive cardiac care and long-term patient wellness.",
  availability: [
    { day: "Monday", startTime: "09:00", endTime: "13:00" },
    { day: "Wednesday", startTime: "14:00", endTime: "18:00" },
    { day: "Friday", startTime: "10:00", endTime: "15:00" }
  ],
  isApproved: true
};

const demoAppointments = [];
const demoDoctorProfiles = new Map([[demoDoctorUserId, demoDoctor]]);

const demoUsers = [
  {
    _id: "000000000000000000000010",
    name: "Admin User",
    email: "admin@bookdoctor.test",
    password: "Admin@123",
    role: "admin",
    phone: ""
  },
  {
    _id: "000000000000000000000011",
    name: "Patient User",
    email: "patient@bookdoctor.test",
    password: "Patient@123",
    role: "patient",
    phone: "9000000001"
  },
  {
    _id: "000000000000000000000012",
    name: "Dr. Ananya Rao",
    email: "doctor@bookdoctor.test",
    password: "Doctor@123",
    role: "doctor",
    phone: "9000000002"
  }
];

export const findDemoUserByEmail = (email) =>
  demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const findDemoUserById = (id) =>
  demoUsers.find((user) => user._id.toString() === id.toString());

export const createDemoUser = async ({ name, email, password, phone, role }) => {
  if (findDemoUserByEmail(email)) {
    const error = new Error("Duplicate record found");
    error.statusCode = 409;
    throw error;
  }

  const user = {
    _id: Date.now().toString(16).padStart(24, "0").slice(-24),
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 12),
    phone,
    role: role || "patient"
  };

  demoUsers.push(user);
  if (user.role === "doctor") {
    demoDoctorProfiles.set(user._id, {
      _id: Date.now().toString(16).padStart(24, "0").slice(-24),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      specialty: "",
      qualification: "",
      experience: 0,
      consultationFee: 0,
      location: "",
      bio: "",
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "13:00" },
        { day: "Wednesday", startTime: "14:00", endTime: "18:00" }
      ],
      isApproved: false
    });
  }
  return user;
};

export const compareDemoPassword = async (user, password) => {
  if (user.password.startsWith("$2")) return bcrypt.compare(password, user.password);
  return user.password === password;
};

export const getDemoDoctorForUser = (userId) =>
  demoDoctorProfiles.get(userId?.toString()) || null;

export const updateDemoDoctor = (user, payload) => {
  const current = demoDoctorProfiles.get(user._id.toString()) || {
    _id: Date.now().toString(16).padStart(24, "0").slice(-24),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    isApproved: false
  };

  const updated = {
    ...current,
    ...payload,
    user: current.user,
    _id: current._id,
    isApproved: current.isApproved ?? false
  };

  demoDoctorProfiles.set(user._id.toString(), updated);
  return updated;
};

export const listDemoDoctors = () =>
  Array.from(demoDoctorProfiles.values()).filter((doctor) =>
    doctor.isApproved && doctor.specialty && doctor.location
  );

export const listDemoDoctorApplications = () => Array.from(demoDoctorProfiles.values());

export const setDemoDoctorApproval = (id, isApproved) => {
  const doctor = Array.from(demoDoctorProfiles.values()).find((profile) => profile._id === id);
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  doctor.isApproved = Boolean(isApproved);
  return doctor;
};

export const getDemoStats = () => ({
  users: demoUsers.length,
  doctors: demoDoctorProfiles.size,
  pendingDoctors: 0,
  appointments: demoAppointments.length
});

export const getDemoAppointments = (user) => {
  if (user.role === "admin") return demoAppointments;
  if (user.role === "doctor") return demoAppointments.filter((appointment) => appointment.doctor._id === demoDoctorId);
  return demoAppointments.filter((appointment) => appointment.patient._id === user._id);
};

export const createDemoAppointment = ({ patient, appointmentDate, timeSlot, reason }) => {
  const conflict = demoAppointments.some((appointment) =>
    appointment.doctor._id === demoDoctorId
    && appointment.appointmentDate === appointmentDate
    && appointment.timeSlot === timeSlot
    && appointment.status !== "cancelled"
  );

  if (conflict) {
    const error = new Error("This time slot has just been booked");
    error.statusCode = 409;
    throw error;
  }

  const appointment = {
    _id: Date.now().toString(16).padStart(24, "0").slice(-24),
    patient: {
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone
    },
    doctor: demoDoctor,
    appointmentDate,
    timeSlot,
    reason,
    status: "pending",
    documents: []
  };

  demoAppointments.push(appointment);
  return appointment;
};

export const updateDemoAppointmentStatus = (id, status, user) => {
  const appointment = demoAppointments.find((item) => item._id === id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "patient" && appointment.patient._id !== user._id) {
    const error = new Error("Cannot update another patient's appointment");
    error.statusCode = 403;
    throw error;
  }

  appointment.status = status;
  return appointment;
};
