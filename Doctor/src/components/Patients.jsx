'use client'; // required in app/ directory to use hooks

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUserPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    mobile: "",
    email: "",
  });

  const handleInputChange = (e) => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (newPatient.name.trim().length < 4) {
        alert("Name must be at least 4 characters long.");
        return;
      }

      const contactRegex = /^[0-9]{10}$/;
      if (newPatient.mobile && !contactRegex.test(newPatient.mobile)) {
        alert("Contact must be a 10-digit number.");
        return;
      }

      // Submit to API (replace URL with your actual endpoint)
      // await axios.post('/api/patients/register', newPatient);

      setPatients([newPatient, ...patients]);
      setNewPatient({ name: "", age: "", gender: "", mobile: "", email: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  const deletePatient = async (id) => {
    try {
      // await axios.post('/api/patients/delete-patient', { patientId: id });
      setPatients(patients.filter(p => p._id !== id));
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  useEffect(() => {
    const baseUrl=process.env.NEXT_PUBLIC_API_URL || "http://localhost:6005";
    async function fetchPatients() {
      try {
        const res = await axios.get(`${baseUrl}/api/patient/get-patients`);
        console.log("Fetched patients:", res.data);
        setPatients(res.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    }

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-light min-h-screen p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Patient Management</h1>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-accent text-primary px-6 py-2 rounded-full font-bold flex items-center"
          onClick={() => setShowForm(!showForm)}
        >
          <FaUserPlus className="mr-2" />
          {showForm ? "Cancel" : "Add New Patient"}
        </motion.button>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow mb-8"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Patient Name"
              value={newPatient.name}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Patient Email"
              value={newPatient.email}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={newPatient.age}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            />
            <select
              name="gender"
              value={newPatient.gender}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="tel"
              name="mobile"
              placeholder="Contact Number"
              value={newPatient.mobile}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-accent text-primary px-6 py-2 rounded-full font-bold"
          >
            Add Patient
          </button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded-lg shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold text-primary mb-2">
              {patient.name}
            </h3>
            <p className="text-gray-600">Age: {patient.age}</p>
            <p className="text-gray-600">Gender: {patient.gender}</p>
            <p className="text-gray-600 mb-4">Contact: {patient.mobile}</p>
            <div className="flex justify-end gap-2">
              <button className="text-blue-500"><FaEdit /></button>
              <button className="text-red-500" onClick={() => deletePatient(patient._id)}><FaTrash /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Patients;
