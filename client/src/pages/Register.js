import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/colors";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "resident",
    address: "",
    contactNumber: "",
  });

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ backgroundColor: Colors.background, minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "6rem 2rem",
          background: `linear-gradient(135deg, ${Colors.primaryButton}55, ${Colors.secondaryButton}55)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            color: Colors.textPrimary,
            marginBottom: "1rem",
          }}
        >
          Join Smart Waste Management
        </h1>
        <p
          style={{
            maxWidth: "600px",
            color: Colors.textSecondary,
            fontSize: "1.2rem",
            marginBottom: "2rem",
          }}
        >
          Create your account to monitor, track, and schedule waste collection
          efficiently. Residents, businesses, and waste authorities are all
          welcome!
        </p>

        {/* Registration Card */}
        <div
          style={{
            backgroundColor: Colors.card,
            borderRadius: "16px",
            padding: "3rem",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
              required={form.role === "resident" || form.role === "business"}
            />
            <input
              type="text"
              placeholder="Contact Number"
              value={form.contactNumber}
              onChange={(e) =>
                setForm({ ...form, contactNumber: e.target.value })
              }
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
              required
            />

            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                backgroundColor: "#fff",
              }}
            >
              <option value="resident">Resident</option>
              <option value="business">Business</option>
              <option value="collector">Waste Collector</option>
              <option value="authority">WMA Manager/Admin</option>
            </select>

            <button
              type="submit"
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                border: "none",
                fontSize: "1.1rem",
                fontWeight: "bold",
                background: `linear-gradient(90deg, ${Colors.primaryButton}, ${Colors.secondaryButton})`,
                color: "#fff",
                cursor: "pointer",
                marginTop: "1rem",
                transition: "all 0.3s",
              }}
              onMouseOver={(e) =>
                (e.target.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
            >
              Register
            </button>
          </form>
          <p style={{ textAlign: "center", color: Colors.textSecondary }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: Colors.link, fontWeight: "bold" }}>
              Login
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
