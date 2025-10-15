import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";
import Colors from "../constants/colors";
import "../App.css";

const AssignCollectors = () => {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [assigningId, setAssigningId] = useState(null);
  const [selectedCollectors, setSelectedCollectors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectionRes = await API.get("/collections");
        const collectorRes = await API.get("/auth/collectors");

        setCollections(Array.isArray(collectionRes.data) ? collectionRes.data : []);
        setFilteredCollections(Array.isArray(collectionRes.data) ? collectionRes.data : []);

        setCollectors(
          Array.isArray(collectorRes.data.collectors) ? collectorRes.data.collectors : []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = collections;

    if (filterStatus !== "all") {
      filtered = filtered.filter((col) => col.status === filterStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (col) =>
          col.wasteCategory?.toLowerCase().includes(term) ||
          col.pickupLocation?.address?.toLowerCase().includes(term) ||
          col.userId?.name?.toLowerCase().includes(term)
      );
    }

    setFilteredCollections(filtered);
  }, [searchTerm, filterStatus, collections]);

  const handleAssign = async (collectionId) => {
    const collectorId = selectedCollectors[collectionId];
    if (!collectorId) return alert("Please select a collector!");

    try {
      setAssigningId(collectionId);

      const response = await API.patch(
        `/collections/${collectionId}/assign-collector`,
        { collectorId }
      );

      if (response.data && response.data.request) {
        setCollections((prev) =>
          prev.map((col) =>
            col._id === collectionId ? response.data.request : col
          )
        );
        alert("✅ Collector assigned successfully!");
      }
    } catch (error) {
      console.error("Error assigning collector:", error);
      alert("❌ Failed to assign collector");
    } finally {
      setAssigningId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      confirmed: "#17a2b8",
      assigned: "#007bff",
      "in-progress": "#6c757d",
      completed: "#28a745",
      cancelled: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "confirmed":
        return <CheckCircle size={16} />;
      case "assigned":
        return <User size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div style={{ backgroundColor: Colors.background, minHeight: "100vh" }}>
      {/* Hero Header */}
      <section
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: `linear-gradient(135deg, ${Colors.primaryButton}80, ${Colors.primaryButton})`,
          color: "#fff",
        }}
      >
        <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Assign Collectors to Collection Requests
        </h2>
        <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
          Manage waste collection assignments efficiently
        </p>
      </section>

      {/* Search & Filter */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div
          style={{
            backgroundColor: Colors.card,
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                <Search size={16} style={{ marginRight: "0.5rem" }} />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by user, address, waste type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: `1px solid ${Colors.border}`,
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                <Filter size={16} style={{ marginRight: "0.5rem" }} />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: `1px solid ${Colors.border}`,
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "1rem", color: Colors.textSecondary, fontSize: "0.9rem" }}>
            Showing {filteredCollections.length} of {collections.length} requests
          </div>
        </div>

        {/* Collection Cards */}
        {filteredCollections.length === 0 ? (
          <div
            style={{
              backgroundColor: Colors.card,
              padding: "3rem",
              borderRadius: "12px",
              textAlign: "center",
              color: Colors.textSecondary,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <AlertCircle size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p>No collection requests found matching your criteria.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {filteredCollections.map((col) => {
              const statusColor = getStatusColor(col.status);
              return (
                <div
                  key={col._id}
                  style={{
                    backgroundColor: Colors.card,
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    borderLeft: `4px solid ${statusColor}`,
                    overflow: "hidden",
                    transition: "transform 0.2s",
                  }}
                  className="feature-card"
                >
                  <div style={{ padding: "1.5rem" }}>
                    <h6 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                      {col.wasteCategory?.toUpperCase()}
                    </h6>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.25rem 0.75rem",
                        backgroundColor: statusColor + "20",
                        color: statusColor,
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        marginLeft: "0.5rem",
                      }}
                    >
                      {getStatusIcon(col.status)}
                      {col.status?.toUpperCase()}
                    </span>
                    {col.userId?.name && (
                      <span style={{ color: Colors.textSecondary, fontSize: "0.9rem", marginLeft: "0.5rem" }}>
                        • {col.userId.name}
                      </span>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "1rem",
                        fontSize: "0.9rem",
                        color: Colors.textSecondary,
                        marginTop: "0.5rem",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Calendar size={14} />
                        {new Date(col.scheduledDate).toLocaleDateString()} • {col.scheduledTime}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <MapPin size={14} />
                        {col.pickupLocation?.address?.substring(0, 50)}...
                      </span>
                    </div>

                    {(col.status === "pending" || col.status === "confirmed") && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "1rem",
                          backgroundColor: Colors.primaryButton + "10",
                          borderRadius: "8px",
                        }}
                      >
                        <h6 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <User size={18} />
                          Assign Collector
                        </h6>
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                          <select
                            value={selectedCollectors[col._id] || ""}
                            onChange={(e) =>
                              setSelectedCollectors({ ...selectedCollectors, [col._id]: e.target.value })
                            }
                            disabled={assigningId === col._id}
                            style={{
                              flex: 1,
                              minWidth: "200px",
                              padding: "0.75rem",
                              border: `1px solid ${Colors.border}`,
                              borderRadius: "8px",
                              fontSize: "0.95rem",
                            }}
                          >
                            <option value="">-- Select Collector --</option>
                            {Array.isArray(collectors) &&
                              collectors.map((collector) => (
                                <option key={collector._id} value={collector._id}>
                                  {collector.name} - {collector.contactNumber}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => handleAssign(col._id)}
                            disabled={assigningId === col._id}
                            style={{
                              padding: "0.75rem 1.5rem",
                              backgroundColor: Colors.primaryButton,
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: 500,
                              cursor: assigningId === col._id ? "not-allowed" : "pointer",
                              opacity: assigningId === col._id ? 0.6 : 1,
                            }}
                          >
                            {assigningId === col._id ? "Assigning..." : "Assign"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AssignCollectors;
