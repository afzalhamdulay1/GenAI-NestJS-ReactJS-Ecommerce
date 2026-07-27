import React, { Fragment, useEffect, useRef, useState } from "react";
import CheckoutSteps from "@/components/Cart/CheckoutSteps";
import MetaData from "@/components/Layout/MetaData";
import { toast } from "react-toastify";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "@/components/Cart/Payment.css";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EventIcon from "@mui/icons-material/Event";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { createOrder, clearErrors } from "@/features/order/orderSlice";
import { emptyCart } from "@/features/cart/cartSlice";
import { Order } from "@/types";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo") || "{}");

  const dispatch = useAppDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const payBtn = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const { shippingInfo, cartItems } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.user);
  const { error } = useAppSelector((state) => state.order);

  const paymentData = {
    amount: Math.round((orderInfo?.totalPrice || 0) * 100),
  };

  const order: Partial<Order> = {
    shippingInfo: shippingInfo ? {
      ...shippingInfo,
      pinCode: Number(shippingInfo.pinCode),
      phoneNo: Number(shippingInfo.phoneNo)
    } : undefined,
    orderItems: cartItems.map(item => ({
      ...item,
      product: item.product || item.productId
    })),
    itemsPrice: orderInfo?.subtotal || 0,
    taxPrice: orderInfo?.tax || 0,
    shippingPrice: orderInfo?.shippingCharges || 0,
    totalPrice: orderInfo?.totalPrice || 0,
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (payBtn.current) {
      payBtn.current.disabled = true;
    }
    setIsProcessing(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await api.post("/payment/process", paymentData, config);

      const client_secret = data.client_secret;

      if (!stripe || !elements) return;

      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) return;

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name || "Customer",
            email: user?.email || "customer@example.com",
            address: {
              line1: shippingInfo?.address,
              city: shippingInfo?.city,
              state: shippingInfo?.state,
              postal_code: shippingInfo?.pinCode ? String(shippingInfo.pinCode) : undefined,
              country: shippingInfo?.country,
            },
          },
        },
      });

      if (result.error) {
        if (payBtn.current) {
          payBtn.current.disabled = false;
        }
        setIsProcessing(false);
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          order.paymentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
          };

          try {
            await dispatch(createOrder(order as Omit<Order, '_id' | 'createdAt' | 'user' | 'orderStatus' | 'deliveredAt'>)).unwrap();
            dispatch(emptyCart());
            navigate("/success");
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : "Failed to create order on server";
            toast.error(errorMessage);
            if (payBtn.current) {
              payBtn.current.disabled = false;
            }
            setIsProcessing(false);
          }
        } else {
          toast.error("There's some issue while processing payment");
        }
      }
    } catch (error) {
      if (payBtn.current) {
        payBtn.current.disabled = false;
      }
      setIsProcessing(false);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Payment processing failed");
      } else {
        toast.error("Payment processing failed");
      }
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

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

        <form className="paymentForm" onSubmit={submitHandler}>
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
                ? "Processing..."
                : `Pay - ₹${orderInfo?.totalPrice || 0}`
            }
            ref={payBtn}
            className="paymentFormBtn"
            disabled={isProcessing}
          />
        </form>
      </div>
    </Fragment>
  );
};

export default Payment;
