import React from "react";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

const EmptyCartState: React.FC = () => {
  return (
    <div className="emptyCart">
      <RemoveShoppingCartIcon />
      <Typography>No Product in Your Cart</Typography>
      <Link to="/products">View Products</Link>
    </div>
  );
};

export default EmptyCartState;
