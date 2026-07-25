import React from "react";
import { FaHardHat } from "react-icons/fa";
import "./Maintenance.css";

const Maintenance: React.FC = () => {
  return (
    <div className="maintenance-container">
      <div className="maintenance-card">
        <FaHardHat className="maintenance-icon" />
        <h1>System Under Maintenance</h1>
        <p>
          We're currently experiencing some network issues or performing scheduled maintenance on our servers.
          Our team is working hard to bring everything back online!
        </p>
        <button onClick={() => window.location.reload()} className="maintenance-btn">
          Try Again
        </button>
      </div>
    </div>
  );
};

export default Maintenance;
