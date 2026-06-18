import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { getDemoStats, listDemoDoctorApplications, setDemoDoctorApproval } from "../utils/demoStore.js";

export const dashboardStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(getDemoStats());
    }

    const [users, doctors, pendingDoctors, appointments] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Doctor.countDocuments({ isApproved: false }),
      Appointment.countDocuments()
    ]);

    res.json({ users, doctors, pendingDoctors, appointments });
  } catch (error) {
    next(error);
  }
};

export const listDoctorApplications = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(listDemoDoctorApplications());
    }

    const doctors = await Doctor.find().populate("user", "name email phone").sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

export const setDoctorApproval = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(setDemoDoctorApproval(req.params.id, req.body.isApproved));
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved },
      { new: true, runValidators: true }
    ).populate("user", "name email phone");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};
