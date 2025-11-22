import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail"); // Retrieve userEmail from localStorage
      const response = await api.post("/auth/verify-otp", { userId, otp });

      if (response.data.success) {
        alert(`OTP verified successfully for ${userEmail}!`); // Include email in success message
        navigate("/login"); // Redirect to login page after successful OTP verification
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center h-auto rounded-lg overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-5xl h-auto p-8 bg-white rounded-lg shadow-2xl border border-gray-300">
        <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">
          Verify OTP
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="otp"
              className="block text-lg font-semibold text-gray-700 mb-2"
            >
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="6-digit OTP"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 text-lg font-bold shadow-md"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
