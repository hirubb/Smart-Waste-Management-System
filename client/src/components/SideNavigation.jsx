import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "../SideNavigation.css";
import { AuthContext } from "../context/AuthContext";

const SideNavigation = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [role, setRole] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const storedRole = user?.role || localStorage.getItem("role");
    setRole(storedRole);
  }, [user]);

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const renderMenuByRole = () => {
    switch (role) {
      case "authority":
        return (
          <>
            <li className="nav-item">
              <Link to="/admin-dashboard" className="nav-link">
                <span>Admin Dashboard</span>
              </Link>
            </li>
             <li className="nav-item">
              <Link to="/manage-users" className="nav-link">
                <span>Optimize Route</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/manage-users" className="nav-link">
                <span>Live Route Monitoring</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/assign-collectors" className="nav-link">
                <span>Assign Collectors</span>
              </Link>
            </li>
            <li className="nav-item has-dropdown">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("reports")}
              >
                <span>Reports & Analytics</span>
              </div>
              {openDropdown === "reports" && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/monthly-reports">Monthly Reports</Link>
                  </li>
                  <li>
                    <Link to="/custom-reports">Custom Reports</Link>
                  </li>
                </ul>
              )}
            </li>
            <hr></hr>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <span>Manager Profile</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/settings" className="nav-link">
                <span>Settings</span>
              </Link>
            </li>
          </>
        );

      case "waste_manager":
        return (
          <>
            <li className="nav-item">
              <Link to="/waste-manager-dashboard" className="nav-link">
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="nav-item has-dropdown">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("reports")}
              >
                <span>Reports & Analytics</span>
              </div>
              {openDropdown === "reports" && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/monthly-reports">Monthly Reports</Link>
                  </li>
                  <li>
                    <Link to="/custom-reports">Custom Reports</Link>
                  </li>
                  <li>
                    <Link to="/report-history">Report History</Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="nav-item">
              <Link to="/collection-summary" className="nav-link">
                <span>Collection Analytics</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/assign-collectors" className="nav-link">
                <span>Collector Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/admin-routes" className="nav-link">
                <span>Route Optimization</span>
              </Link>
            </li>
            <hr></hr>
            <li className="nav-item">
              <Link to="/manager/profile" className="nav-link">
                <span>Profile</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/settings" className="nav-link">
                <span>Settings</span>
              </Link>
            </li>
          </>
        );

      case "collector":
        return (
          <>
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="nav-item has-dropdown">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("collections")}
              >
                <span>Collections</span>
              </div>
              {openDropdown === "collections" && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/assigned-collections">Assigned Collections</Link>
                  </li>
                  <li>
                    <Link to="/completed-collections">Completed Collections</Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="nav-item">
              <Link to="/reports" className="nav-link">
                <span>Reports</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/reports" className="nav-link">
                <span>Payments</span>
              </Link>
            </li>
            <hr></hr>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <span>Collector Profile</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/settings" className="nav-link">
                <span>Settings</span>
              </Link>
            </li>
          </>
        );

      // ✅ Resident and Business users get the full menu
      case "resident":
      case "business":
      default:
        return (
          <>
            {/* Dashboard */}
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                <span>Dashboard</span>
              </Link>
            </li>

            {/* Collections with Dropdown */}
            <li className="nav-item has-dropdown">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("collections")}
              >
                <span>Collections</span>
              </div>
              {openDropdown === "collections" && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/special">Schedule Collection</Link>
                  </li>
                  <li>
                    <Link to="/collection-history">Collection History</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Waste Types with Dropdown */}
            <li className="nav-item has-dropdown">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("wasteTypes")}
              >
                <span>Waste Types</span>
              </div>
              {openDropdown === "wasteTypes" && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="#">Manage Types</Link>
                  </li>
                  <li>
                    <Link to="#">Categories</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Payment with Dropdown */}
            <li className="nav-item has-dropdown">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("payment")}
              >
                <span>Payment</span>
              </div>
              {openDropdown === "payment" && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/payment-history">Payment History</Link>
                  </li>
                  <li>
                    <Link to="/payment-methods">Payment Methods</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Reports */}
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <span>Reports</span>
              </Link>
            </li>

            {/* Settings with Dropdown */}
            <li className="nav-item has-dropdown">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("settings")}
              >
                <span>Settings</span>
              </div>
              {openDropdown === "settings" && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <Link to="/account">Account</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Support with Dropdown */}
            <li className="nav-item has-dropdown">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("support")}
              >
                <span>Support</span>
              </div>
              {openDropdown === "support" && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="#">FAQ</Link>
                  </li>
                  <li>
                    <Link to="#">Contact Us</Link>
                  </li>
                </ul>
              )}
            </li>
          </>
        );
    }
  };

  return (
    <div className="side-navigation">
      <div className="navigation-header">
        <h3>
          {role
            ? `${role.charAt(0).toUpperCase() + role.slice(1)} Panel`
            : "Navigation"}
        </h3>
      </div>

      <ul className="nav-list">{renderMenuByRole()}</ul>
    </div>
  );
};

export default SideNavigation;
