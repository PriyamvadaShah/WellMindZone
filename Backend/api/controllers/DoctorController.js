// controllers/patientController.js
import { Doctor } from "../models/Doctor.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Appointment } from "../models/Appointment.js";

// Register a new patient
export const registerPatient = async (req, res) => {
    try {
        const { name, email, gender, mobile, age, password} = req.body;
        console.log("abc", req);
        // Check if the patient already exists
        const existingPatient = await Doctor.findOne({ email });
        if (existingPatient) {
          return res.status(400).json({ message: "Patient already exists" });
        }
        let saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Create a new patient
        const newPatient = await Doctor.create({
          name,
          email,
          gender,
          password: hashedPassword,
          mobile,
          age,
          doctorId: uuidv4(),
        });
    
        res
          .status(201)
          .json({ message: "Doctor registered successfully", newPatient });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
      }
};

export const getAllPatients = async (req, res) => {
  const patients = await Doctor.find();
  return res.status(200).json({ data: patients });
};
// Login a patient
export const loginPatient = async (req, res) => {
    try {
        console.log("kk", req.body);
        const { email, password } = req.body;
        // Find the patient by email
        const patient = await Doctor.findOne({ email });
        if (!patient) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
    
        // Compare the passwords
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
    
        // Generate a JWT token
        const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
    
        res.status(200).json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
      }
};

export const deletePatient = async (req, res) => {
  const { patientId } = req.body;

  const patient = await Doctor.deleteOne({ _id: patientId });

  console.log(patient);

  if (!patient) {
    return res.status(400).json({
      success: false,
      message: "Doctor not found",
    });
  }

  return res.status();
};

export const scheduleAppointment = async (req, res) => {
  try {
      console.log("kk", req.body);
      const { patientName, doctorName, dateAndTime} = req.body;
      // Find the patient by email
      let notes=req.body.notes?req.body.notes:"";
      const patient = await Appointment.create(
        { 
          patientName,
          doctorName,
          dateAndTime,
          notes
         });
  
      res.status(201)
      .json({ message: "Appointment registered successfully", patient });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
};

export const appointments = async (req, res) => {
  try {
      console.log("kk", req.query);
      // const { patientName, doctorName, dateAndTime} = req.body;
      // Find the patient by email
      // let notes=req.body.notes?req.body.notes:"";
      const patient = await Appointment.find();
      console.log("ll", patient);
      res.status(200)
      .json({ data: patient });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
};

export const deleteAppointment = async (req, res) => {
  console.log("kk", req.body);
  const { appointmentId } = req.body;
  const patient = await Appointment.deleteOne({ _id: appointmentId });

  console.log(patient);

  if (!patient) {
    return res.status(400).json({
      success: false,
      message: "Appointment not found",
    });
  }

  return res.status();
};