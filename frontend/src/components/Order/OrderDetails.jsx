import { Fragment, useEffect } from "react";
import "./OrderDetails.css";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../Layout/MetaData";
import { Link, useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import { getOrderDetails, clearErrors } from "../../features/order/orderSlice";
import Loader from "../Layout/Loader/Loader";
import { toast } from "react-toastify";

const OrderDetails = () => {
  const { id } = useParams();
  const { orderDetails, error, loading } = useSelector(
    (state) => state.newOrder
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    dispatch(getOrderDetails(id));
  }, [dispatch, id, error]);

  if (loading) return <Loader />;

  if (!orderDetails) return <p>Order details not available.</p>;

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="Order Details" />
          <div className="orderDetailsPage">
            <div className="orderDetailsContainer">
              {/* Shipping Information Section */}
              <div className="orderDetailsSection">
                <Typography variant="h1">Order Details</Typography>
                <div className="orderStatusSubheader">
                   <p>Order ID: <span>#{orderDetails?._id}</span></p>
                </div>
                
                <Typography variant="h6">Shipping Info</Typography>
                <div className="orderDetailsContainerBox">
                  <div>
                    <p>Name:</p>
                    <span>{orderDetails.user && orderDetails.user.name}</span>
                  </div>
                  <div>
                    <p>Phone:</p>
                    <span>{orderDetails.shippingInfo && orderDetails.shippingInfo.phoneNo}</span>
                  </div>
                  <div>
                    <p>Address:</p>
                    <span>
                      {orderDetails.shippingInfo &&
                        `${orderDetails.shippingInfo.address}, ${orderDetails.shippingInfo.city}, ${orderDetails.shippingInfo.state}, ${orderDetails.shippingInfo.pinCode}, ${orderDetails.shippingInfo.country}`}
                    </span>
                  </div>
                </div>

                <Typography variant="h6">Payment History</Typography>
                <div className="orderDetailsContainerBox">
                  <div>
                    <p>Gateway:</p>
                    <span className="gatewayName">Stripe Terminal</span>
                  </div>
                  <div>
                    <p>Status:</p>
                    <span className={orderDetails.paymentInfo?.status === "succeeded" ? "greenColor" : "redColor"}>
                      {orderDetails.paymentInfo?.status === "succeeded" ? "Transaction Successful" : "Payment Required"}
                    </span>
                  </div>
                  <div>
                    <p>Total Amount:</p>
                    <span className="totalPriceTag">₹{orderDetails.totalPrice}</span>
                  </div>
                </div>

                <Typography variant="h6">Delivery Status</Typography>
                <div className="orderDetailsContainerBox">
                  <div>
                    <p>Current State:</p>
                    <span className={orderDetails.orderStatus === "Delivered" ? "greenColor" : "redColor"}>
                      {orderDetails.orderStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar: Order Items */}
            <div className="orderDetailsSection orderSummarySidebar">
              <Typography variant="h6">Purchased Items</Typography>
              <div className="orderDetailsCartItemsContainer">
                {orderDetails.orderItems &&
                  orderDetails.orderItems.map((item) => (
                    <div key={item.product} className="orderItemRow">
                      <img src={item.image} alt={item.name} />
                      <div className="orderItemInfo">
                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                        <span>
                          {item.quantity} × ₹{item.price} = <b>₹{item.price * item.quantity}</b>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default OrderDetails;
