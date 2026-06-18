import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import {
  compareDemoPassword,
  createDemoUser,
  demoDoctorId,
  findDemoUserByEmail
} from "../utils/demoStore.js";
import { signToken } from "../utils/token.js";

const authPayload = async (user) => {
  const doctorProfile = user.role === "doctor" && mongoose.connection.readyState === 1
    ? await Doctor.findOne({ user: user._id })
    : null;

  return {
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      doctorId: doctorProfile?._id || (user.role === "doctor" ? demoDoctorId : null)
    }
  };
};

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, email, password, phone, role } = req.body;
    const user = mongoose.connection.readyState === 1
      ? await User.create({ name, email, password, phone, role: role || "patient" })
      : await createDemoUser({ name, email, password, phone, role });

    res.status(201).json(await authPayload(user));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = mongoose.connection.readyState === 1
      ? await User.findOne({ email }).select("+password")
      : findDemoUserByEmail(email);

    const validPassword = user && (mongoose.connection.readyState === 1
      ? await user.comparePassword(password)
      : await compareDemoPassword(user, password));

    if (!user || !validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(await authPayload(user));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role
  });
};
