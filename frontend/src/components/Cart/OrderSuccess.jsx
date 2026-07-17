import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./OrderSuccess.css";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <div className="orderSuccessContainer">
      <div className="orderSuccessBox">
        <CheckCircleIcon />

        <p>Order Placed Successfully!</p>
        <span>Your package will be processed and shipped shortly.</span>
        
        <div className="successBtnGroup">
          <Link to="/orders" className="viewOrdersBtn">
            View Orders
          </Link>
          <Link to="/" className="continueShoppingBtn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
