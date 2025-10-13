import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Role: {user?.role}</p>

      {user?.role === "resident" && (
        <p>Resident features: schedule special collection, view bin alerts</p>
      )}
      {user?.role === "business" && (
        <p>Business features: business-specific dashboard</p>
      )}
      {user?.role === "collector" && (
        <p>Collector features: view assigned routes</p>
      )}
      {user?.role === "wma_admin" && (
        <p>Admin features: route optimization, reports</p>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
