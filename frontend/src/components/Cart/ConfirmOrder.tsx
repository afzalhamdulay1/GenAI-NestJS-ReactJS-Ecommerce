import React, { Fragment } from "react";
import CheckoutSteps from "@/components/Cart/CheckoutSteps";
import MetaData from "@/components/Layout/MetaData";
import "@/components/Cart/ConfirmOrder.css";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import OrderSummaryCard from "@/components/Cart/Sections/OrderSummaryCard";

const ConfirmOrder: React.FC = () => {
  const navigate = useNavigate();
  const { shippingInfo, cartItems } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.user);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const shippingCharges = subtotal > 1000 ? 0 : 200;
  const tax = subtotal * 0.18;
  const totalPrice = subtotal + tax + shippingCharges;

  const address = `${shippingInfo?.address}, ${shippingInfo?.city}, ${shippingInfo?.state}, ${shippingInfo?.pinCode}, ${shippingInfo?.country}`;

  const proceedToPayment = () => {
    const data = {
      subtotal,
      shippingCharges,
      tax,
      totalPrice,
    };

    sessionStorage.setItem("orderInfo", JSON.stringify(data));
    navigate("/process/payment");
  };

  return (
    <Fragment>
      <MetaData title="Confirm Order" />
      <CheckoutSteps activeStep={1} />
      <div className="confirmOrderPage">
        <div>
          <div className="confirmshippingArea">
            <p>Shipping Info</p>
            <div className="confirmshippingAreaBox">
              <div>
                <p>Name:</p>
                <span>{user?.name}</span>
              </div>
              <div>
                <p>Phone:</p>
                <span>{shippingInfo?.phoneNo}</span>
              </div>
              <div>
                <p>Address:</p>
                <span>{address}</span>
              </div>
            </div>
          </div>
          <div className="confirmCartItems">
            <p>Your Cart Items:</p>
            <div className="confirmCartItemsContainer">
              {cartItems &&
                cartItems.map((item) => (
                  <div key={item.productId}>
                    <img src={item.image} alt="Product" />
                    <Link to={`/product/${item.product || item.productId}`}>
                      {item.name}
                    </Link>{" "}
                    <span>
                      {item.quantity} X ₹{item.price} ={" "}
                      <b>₹{item.price * item.quantity}</b>
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <OrderSummaryCard
          subtotal={subtotal}
          shippingCharges={shippingCharges}
          tax={tax}
          totalPrice={totalPrice}
          onProceedToPayment={proceedToPayment}
        />
      </div>
    </Fragment>
  );
};

export default ConfirmOrder;
