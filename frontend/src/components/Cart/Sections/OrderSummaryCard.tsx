import React from "react";

interface OrderSummaryCardProps {
  subtotal: number;
  shippingCharges: number;
  tax: number;
  totalPrice: number;
  onProceedToPayment: () => void;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  subtotal,
  shippingCharges,
  tax,
  totalPrice,
  onProceedToPayment,
}) => {
  return (
    <div className="orderSummaryContainer">
      <div className="orderSummary">
        <p>Order Summary</p>
        <div className="orderSummaryBox">
          <div>
            <p>Subtotal:</p>
            <span>₹{subtotal}</span>
          </div>
          <div>
            <p>Shipping Charges:</p>
            <span>₹{shippingCharges}</span>
          </div>
          <div>
            <p>GST (18%):</p>
            <span>₹{tax}</span>
          </div>
        </div>

        <div className="orderSummaryTotal">
          <p>Total:</p>
          <span>₹{totalPrice}</span>
        </div>

        <button onClick={onProceedToPayment}>Proceed To Payment</button>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
