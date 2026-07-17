import React, { Fragment, useEffect, useRef, useState } from "react";
import CheckoutSteps from "./CheckoutSteps";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../Layout/MetaData";
import { Typography } from "@mui/material";
import { toast } from "react-toastify";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import axios from "axios";
import "./Payment.css";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EventIcon from "@mui/icons-material/Event";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { createOrder, clearErrors } from "../../features/order/orderSlice";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();
  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));

  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const payBtn = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false); // State to track processing status

  const { shippingInfo, cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const { error } = useSelector((state) => state.newOrder);

  const paymentData = {
    amount: Math.round(orderInfo.totalPrice * 100),
  };

  const order = {
    shippingInfo,
    orderItems: cartItems,
    itemsPrice: orderInfo.subtotal,
    taxPrice: orderInfo.tax,
    shippingPrice: orderInfo.shippingCharges,
    totalPrice: orderInfo.totalPrice,
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    payBtn.current.disabled = true;
    setIsProcessing(true); // Set processing state to true

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await api.post("/payment/process", paymentData, config);

      const client_secret = data.client_secret;

      if (!stripe || !elements) return;

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user.name,
            email: user.email,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.pinCode,
              country: shippingInfo.country,
            },
          },
        },
      });

      if (result.error) {
        payBtn.current.disabled = false;
        setIsProcessing(false); // Reset processing state
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          order.paymentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
          };

          dispatch(createOrder(order));

          navigate("/success");
        } else {
          toast.error("There's some issue while processing payment ");
        }
      }
    } catch (error) {
      payBtn.current.disabled = false;
      setIsProcessing(false); // Reset processing state
      toast.error(error.response);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error, toast]);

  return (
    <Fragment>
      <MetaData title="Payment" />
      <CheckoutSteps activeStep={2} />
      <div className="paymentContainer">
        <div className="paymentInfoBox">
          <h2 style={{ color: "red", marginBottom: "1rem" }}>
            Please dont use your real debit/credit. This is a real payment system.
            The amount will be deducted from your account. And if I recieve any
            money, I wont give it back! Just kidding 😂, contact me through mail:{" "}
            afzalhamdulay.work@gmail.com if things go wrong😉.
          </h2>
          <p style={{ color: "rgb(248 113 113)", marginBottom: "0.5rem" }}>
            Use this fake card number for payment testing: 5555 0503 6000 0007
          </p>
          <p style={{ color: "rgb(248 113 113)", marginBottom: "0.5rem" }}>
            Enter any valid month and year which is not yet passed
          </p>
          <p style={{ color: "rgb(248 113 113)", marginBottom: "0.5rem" }}>
            Enter any random CVC code and it will work
          </p>
        </div>

        <form className="paymentForm" onSubmit={(e) => submitHandler(e)}>
          <p>Card Info</p>

          <div>
            <CreditCardIcon />
            <CardNumberElement className="paymentInput" />
          </div>
          <div>
            <EventIcon />
            <CardExpiryElement className="paymentInput" />
          </div>
          <div>
            <VpnKeyIcon />
            <CardCvcElement className="paymentInput" />
          </div>

          <input
            type="submit"
            value={
              isProcessing
                ? "Processing..." // Show "Processing..." when payment is processing
                : `Pay - ₹${orderInfo && orderInfo.totalPrice}`
            }
            ref={payBtn}
            className="paymentFormBtn"
            disabled={isProcessing} // Disable button while processing
          />
        </form>
      </div>
    </Fragment>
  );
};

export default Payment;
