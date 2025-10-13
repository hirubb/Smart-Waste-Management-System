import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation
import '../SideNavigation.css'; // For styling your navigation

// Import icons (example using Font Awesome or a similar library)
// import { FaHome, FaBox, FaTrash, FaCreditCard, FaChartBar, FaCog, FaQuestionCircle, FaAngleDown, FaAngleUp } from 'react-icons/fa';

const SideNavigation = () => {
  // State to manage the visibility of dropdown menus
  const [openDropdown, setOpenDropdown] = useState(null); // 'collections', 'wasteTypes', etc.

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  return (
    <div className="side-navigation">
      <div className="navigation-header">
        <h3>Navigation</h3>
        <button className="menu-toggle-button">☰</button> {/* Hamburger icon */}
      </div>
      <ul className="nav-list">
        {/* Dashboard */}
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link">
            {/* <FaHome /> */} <span>Dashboard</span>
          </Link>
        </li>

        {/* Collections with Dropdown */}
        <li className="nav-item has-dropdown">
          <div className="nav-link" onClick={() => toggleDropdown('collections')}>
            {/* <FaBox /> */} <span>Collections</span>
            {/* {openDropdown === 'collections' ? <FaAngleUp /> : <FaAngleDown />} */}
          </div>
          {openDropdown === 'collections' && (
            <ul className="dropdown-menu">
              <li><Link to="/collections/scheduled">Scheduled</Link></li>
              <li><Link to="/collections/history">History</Link></li>
              {/* Add more collection-related links */}
            </ul>
          )}
        </li>

        {/* Waste Types with Dropdown */}
        <li className="nav-item has-dropdown">
          <div className="nav-link" onClick={() => toggleDropdown('wasteTypes')}>
            {/* <FaTrash /> */} <span>Waste Types</span>
            {/* {openDropdown === 'wasteTypes' ? <FaAngleUp /> : <FaAngleDown />} */}
          </div>
          {openDropdown === 'wasteTypes' && (
            <ul className="dropdown-menu">
              <li><Link to="/wastetypes/manage">Manage Types</Link></li>
              <li><Link to="/wastetypes/categories">Categories</Link></li>
              {/* Add more waste type links */}
            </ul>
          )}
        </li>

        {/* Payment with Dropdown */}
        <li className="nav-item has-dropdown">
          <div className="nav-link" onClick={() => toggleDropdown('payment')}>
            {/* <FaCreditCard /> */} <span>Payment</span>
            {/* {openDropdown === 'payment' ? <FaAngleUp /> : <FaAngleDown />} */}
          </div>
          {openDropdown === 'payment' && (
            <ul className="dropdown-menu">
              <li><Link to="/payment/history">Payment History</Link></li>
              <li><Link to="/payment/methods">Payment Methods</Link></li>
            </ul>
          )}
        </li>

        {/* Reports */}
        <li className="nav-item">
          <Link to="/reports" className="nav-link">
            {/* <FaChartBar /> */} <span>Reports</span>
          </Link>
        </li>

        {/* Settings with Dropdown */}
        <li className="nav-item has-dropdown">
          <div className="nav-link" onClick={() => toggleDropdown('settings')}>
            {/* <FaCog /> */} <span>Settings</span>
            {/* {openDropdown === 'settings' ? <FaAngleUp /> : <FaAngleDown />} */}
          </div>
          {openDropdown === 'settings' && (
            <ul className="dropdown-menu">
              <li><Link to="/settings/profile">Profile</Link></li>
              <li><Link to="/settings/account">Account</Link></li>
            </ul>
          )}
        </li>

        {/* Support with Dropdown */}
        <li className="nav-item has-dropdown">
          <div className="nav-link" onClick={() => toggleDropdown('support')}>
            {/* <FaQuestionCircle /> */} <span>Support</span>
            {/* {openDropdown === 'support' ? <FaAngleUp /> : <FaAngleDown />} */}
          </div>
          {openDropdown === 'support' && (
            <ul className="dropdown-menu">
              <li><Link to="/support/faq">FAQ</Link></li>
              <li><Link to="/support/contact">Contact Us</Link></li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default SideNavigation;