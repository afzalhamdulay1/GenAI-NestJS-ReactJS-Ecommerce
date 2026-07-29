import React, { Fragment, useEffect } from "react";
import "@/components/Order/OrderDetails.css";
import MetaData from "@/components/Layout/MetaData";
import { Link, useParams } from "react-router-dom";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box } from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getOrderDetails, clearErrors, isUserObject, cancelOrder, resetUpdateState } from "@/features/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Loader from "@/components/Layout/Loader/Loader";
import { toast } from "react-toastify";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orderDetails, error, loading, isUpdated } = useAppSelector(
    (state) => state.order
  );
  
  const [openCancelDialog, setOpenCancelDialog] = React.useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isUpdated) {
      toast.success("Order cancelled successfully");
      dispatch(resetUpdateState());
    }

    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id, error, isUpdated]);

  const handleCancelOrder = () => {
    if (id) {
      dispatch(cancelOrder(id));
      setOpenCancelDialog(false);
    }
  };

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
                    <span>{isUserObject(orderDetails.user) ? orderDetails.user.name : String(orderDetails.user)}</span>
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

                {orderDetails.orderStatus === "Processing" && (
                  <div style={{ marginTop: '2rem' }}>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => setOpenCancelDialog(true)}
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Dialog
              open={openCancelDialog}
              onClose={() => setOpenCancelDialog(false)}
              PaperProps={{
                sx: {
                  borderRadius: '1.5rem',
                  padding: '1.5rem',
                  maxWidth: '400px',
                  textAlign: 'center',
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: 1 }}>
                <Box sx={{ backgroundColor: '#fee2e2', borderRadius: '50%', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WarningAmberIcon sx={{ color: '#ef4444', fontSize: '2.5rem' }} />
                </Box>
              </Box>
              <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', p: 0, mb: 1, fontFamily: '"Outfit", sans-serif' }}>
                Cancel Order?
              </DialogTitle>
              <DialogContent sx={{ p: 0, mb: 3 }}>
                <DialogContentText sx={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>
                  Are you absolutely sure you want to cancel this order? Once cancelled, it cannot be recovered and you will have to place a new order.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ p: 0, display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <Button 
                  onClick={handleCancelOrder} 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    backgroundColor: '#ef4444', 
                    borderRadius: '50px',
                    padding: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    m: '0 !important',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#dc2626',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Yes, Cancel Order
                </Button>
                <Button 
                  onClick={() => setOpenCancelDialog(false)} 
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    borderRadius: '50px',
                    padding: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    color: '#64748b',
                    borderColor: '#e2e8f0',
                    m: '0 !important',
                    '&:hover': {
                      borderColor: '#cbd5e1',
                      backgroundColor: '#f8fafc'
                    }
                  }}
                >
                  No, Keep It
                </Button>
              </DialogActions>
            </Dialog>

            {/* Sidebar: Order Items */}
            <div className="orderDetailsSection orderSummarySidebar">
              <Typography variant="h6">Purchased Items</Typography>
              <div className="orderDetailsCartItemsContainer">
                {orderDetails.orderItems &&
                  orderDetails.orderItems.map((item) => (
                    <div key={item.productId || item.product} className="orderItemRow">
                      <img src={item.image} alt={item.name} />
                      <div className="orderItemInfo">
                        <Link to={`/product/${item.productId || item.product}`}>{item.name}</Link>
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
