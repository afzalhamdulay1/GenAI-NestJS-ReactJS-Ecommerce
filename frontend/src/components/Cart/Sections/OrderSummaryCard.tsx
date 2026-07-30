import React from "react";

interface OrderSummaryCardProps {
  subtotal: number;
  shippingCharges: number;
  tax: number;
  discount?: number;
  couponCode?: string;
  totalPrice: number;
  onProceedToPayment: () => void;
  couponInput?: string;
  setCouponInput?: (val: string) => void;
  onApplyCoupon?: () => void;
  onRemoveCoupon?: () => void;
  couponLoading?: boolean;
  couponMessage?: { text: string; type: "success" | "error" } | null;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  subtotal,
  shippingCharges,
  tax,
  discount = 0,
  couponCode = "",
  totalPrice,
  onProceedToPayment,
  couponInput = "",
  setCouponInput,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading = false,
  couponMessage = null,
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

          {discount > 0 && (
            <div style={{ color: "#16a34a", fontWeight: 600 }}>
              <p className="flex items-center gap-1">
                Discount ({couponCode}):
                {onRemoveCoupon && (
                  <button
                    onClick={onRemoveCoupon}
                    style={{
                      marginLeft: "6px",
                      fontSize: "11px",
                      color: "#ef4444",
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </p>
              <span>-₹{discount}</span>
            </div>
          )}
        </div>

        {/* Promo Code Input Box */}
        {setCouponInput && onApplyCoupon && !discount && (
          <div style={{ marginTop: "15px", marginBottom: "10px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#475569" }}>
              Have a Promo Code?
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  textTransform: "uppercase",
                }}
              />
              <button
                type="button"
                onClick={onApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: couponLoading || !couponInput.trim() ? "#cbd5e1" : "#1e293b",
                  color: "#ffffff",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: couponLoading || !couponInput.trim() ? "not-allowed" : "pointer",
                }}
              >
                {couponLoading ? "Applying..." : "Apply"}
              </button>
            </div>

            {/* Inline Coupon Message */}
            {couponMessage && (
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginTop: "6px",
                  color: couponMessage.type === "success" ? "#16a34a" : "#ef4444",
                }}
              >
                {couponMessage.text}
              </p>
            )}
          </div>
        )}

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
