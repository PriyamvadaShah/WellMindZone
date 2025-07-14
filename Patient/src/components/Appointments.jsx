'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "../context/LoginContext";
import { motion } from "framer-motion";
import {
  FaCalendarPlus,
  FaSearch,
  FaTrash,
  FaVideo,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Appointments = () => {
  const router = useRouter();
  const { isLoggedIn } = useLogin();

  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    doctorName: "",
    dateAndTime: "",
    notes: "",
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6005";

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/doctor/appointments`);
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setAppointments(result.data);
        } else {
          console.error("Expected array, got:", result.data);
        }
      } else {
        console.error("Fetch failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchAppointments();
  }, [isLoggedIn]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewAppointment((prev) => ({ ...prev, dateAndTime: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/api/doctor/schedule-appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newAppointment),
      });
      if (response.ok) {
        fetchAppointments();
        setShowForm(false);
        setNewAppointment({ patientName: "", doctorName: "", dateAndTime: "", notes: "" });
      } else {
        alert("Failed to schedule. Try again.");
      }
    } catch (err) {
      alert("Connection error.");
    }
  };

  const deleteAppointment = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/api/doctor/delete-appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appointmentId: id }),
      });
      if (response.ok) fetchAppointments();
      else alert("Failed to delete.");
    } catch (err) {
      alert("Delete error.");
    }
  };

  const filteredAppointments = appointments.filter((a) =>
    (a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return isLoggedIn ? (
    <div className="bg-light min-h-screen p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Appointment Management</h1>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-accent text-primary px-6 py-2 rounded-full font-bold flex items-center"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <FaCalendarPlus className="mr-2" />
          {showForm ? "Cancel" : "New Appointment"}
        </motion.button>
        <div className="relative w-full sm:w-auto">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-accent"
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
              name="patientName"
              placeholder="Patient Name"
              className="p-2 border border-gray-300 rounded"
              value={newAppointment.patientName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="doctorName"
              placeholder="Doctor Name"
              className="p-2 border border-gray-300 rounded"
              value={newAppointment.doctorName}
              onChange={handleInputChange}
              required
            />
            <DatePicker
              selected={newAppointment.dateAndTime}
              onChange={handleDateChange}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="p-2 border border-gray-300 rounded w-full"
            />
            <textarea
              name="notes"
              placeholder="Notes"
              className="p-2 border border-gray-300 rounded"
              value={newAppointment.notes}
              onChange={handleInputChange}
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-accent text-primary px-6 py-2 rounded-full font-bold"
          >
            Schedule
          </button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.map((appointment) => (
          <motion.div
            key={appointment._id}
            className="bg-white p-6 rounded-lg shadow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-2">{appointment.patientName}</h3>
            <p className="text-gray-600 mb-2">Doctor: {appointment.doctorName}</p>
            <p className="text-gray-600 mb-2">Date: {appointment.dateAndTime}</p>
            <p className="text-gray-600 mb-4">Notes: {appointment.notes}</p>
            <div className="flex justify-between items-center">
              <span className="px-2 py-1 rounded-full text-xs bg-yellow-200 text-yellow-800">Scheduled</span>
              <div className="flex gap-4">
                <button onClick={() => deleteAppointment(appointment._id)} className="text-red-500">
                  <FaTrash size={20} />
                </button>
                <button onClick={() => router.push("/lobby")} className="text-blue-600">
                  <FaVideo size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  ) : (
    <div className="text-center py-20 text-xl text-gray-600">
      Please log in to view appointments.
    </div>
  );
};

export default Appointments;
