import React from "react";

interface CartSummaryProps {
  grossTotal: number;
  onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ grossTotal, onCheckout }) => {
  return (
    <div className="cartGrossProfit">
      <div></div>
      <div className="cartGrossProfitBox">
        <p>Gross Total</p>
        <p>{`₹${grossTotal}`}</p>
      </div>
      <div></div>
      <div className="checkOutBtn">
        <button onClick={onCheckout}>Check Out</button>
      </div>
    </div>
  );
};

export default CartSummary;
