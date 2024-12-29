// models/Patient.js
import mongoose from 'mongoose';

const doctorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  password:{
    type: String,
    required: true,
  },
  age: {
    type: Number,
    // require: true
  }
}, { collection :"a0_doctors", timestamps: true });

export const Doctor = mongoose.model('Doctor', doctorSchema);
