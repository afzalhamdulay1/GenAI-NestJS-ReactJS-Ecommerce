import React, { Fragment, useEffect, useState } from "react";
import "@/components/Order/OrderDetails.css";
import MetaData from "@/components/Layout/MetaData";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, Chip, Grid } from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getOrderDetails, clearErrors, isUserObject, cancelOrder, resetUpdateState } from "@/features/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Loader from "@/components/Layout/Loader/Loader";
import { toast } from "react-toastify";
import { api } from "@/services/api";
import { Order } from "@/types";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const dispatch = useAppDispatch();
  const { orderDetails, error, loading, isUpdated } = useAppSelector((state) => state.order);
  
  const [guestOrder, setGuestOrder] = useState<Order | null>(null);
  const [guestLoading, setGuestLoading] = useState<boolean>(!!token);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Fetch guest order if token param is present
  useEffect(() => {
    if (token && id) {
      setGuestLoading(true);
      api.get(`/order/guest/${id}?token=${token}`)
        .then((res) => {
          setGuestOrder(res.data.order);
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Failed to load guest order");
        })
        .finally(() => {
          setGuestLoading(false);
        });
    }
  }, [id, token]);

  const activeOrder = token ? guestOrder : orderDetails;

  useEffect(() => {
    if (!token) {
      if (error) {
        toast.error(error);
        dispatch(clearErrors());
      }

      if (isUpdated) {
        const refundedAmount = activeOrder?.totalPrice?.toLocaleString() || '0';
        toast.success(`Order cancelled. Your refund of ₹${refundedAmount} is being processed and will be credited to your account within 3-5 business days.`);
        dispatch(resetUpdateState());
      }

      if (id) {
        dispatch(getOrderDetails(id));
      }
    }
  }, [dispatch, id, error, isUpdated, token, activeOrder?.totalPrice]);

  const handleCancelOrder = async () => {
    if (!id) return;

    if (token) {
      setCancelling(true);
      try {
        const res = await api.put(`/order/guest/${id}/cancel?token=${token}`);
        const refundedAmount = activeOrder?.totalPrice?.toLocaleString() || '0';
        toast.success(res.data.message || `Order cancelled. Your refund of ₹${refundedAmount} is being processed and will be credited within 3-5 business days.`);
        setGuestOrder((prev) => prev ? { ...prev, orderStatus: "Cancelled" } : null);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to cancel order");
      } finally {
        setCancelling(false);
        setOpenCancelDialog(false);
      }
    } else {
      dispatch(cancelOrder(id));
      setOpenCancelDialog(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!id) return;
    setDownloadingInvoice(true);
    try {
      const endpoint = token ? `/order/guest/${id}/invoice?token=${token}` : `/order/${id}/invoice`;
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully");
    } catch (err) {
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading || guestLoading) return <Loader />;

  if (!activeOrder) return <p style={{ textAlign: 'center', padding: '50px' }}>Order details not available.</p>;

  const getProgressWidth = (status: string) => {
    if (status === "Processing") return "33.3%";
    if (status === "Shipped") return "66.6%";
    if (status === "Delivered") return "100%";
    return "0%";
  };

  return (
    <Fragment>
      <MetaData title="Order Details" />
      <div className="orderDetailsPage">
        {/* Shipping Information Section */}
        <div className="orderDetailsSection">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h1" className="orderDetailsHeading">Order Details</Typography>
              <Button
                variant="outlined"
                disabled={downloadingInvoice}
                onClick={handleDownloadInvoice}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  '&:hover': { backgroundColor: '#f5f3ff', borderColor: '#4f46e5' }
                }}
              >
                {downloadingInvoice ? "Generating PDF..." : "📄 Download PDF Invoice"}
              </Button>
            </Box>
            <div className="orderStatusSubheader">
               <p>Order ID: <span>#{activeOrder._id}</span></p>
            </div>
            {/* Visual Shipment Tracking Progress Stepper */}
            {activeOrder.orderStatus !== "Cancelled" && (
              <Box sx={{ my: 3.5, p: 3, bgcolor: '#f8fafc', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
                    🚚 Shipment Progress Stepper
                  </Typography>
                  
                  {/* Stepper Grid Container */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, position: 'relative', textAlign: 'center' }}>
                    {/* Background Connecting Track */}
                    <Box sx={{ position: 'absolute', top: 20, left: '12.5%', right: '12.5%', height: 4, bgcolor: '#e2e8f0', zIndex: 0, borderRadius: 2 }}>
                      {/* Active Green Progress Bar */}
                      <Box sx={{ height: '100%', width: getProgressWidth(activeOrder.orderStatus), bgcolor: '#10b981', borderRadius: 2, transition: 'width 0.5s ease-in-out' }} />
                    </Box>
                    
                    {/* Step 1: Placed */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        minWidth: 40,
                        minHeight: 40,
                        maxHeight: 40,
                        maxWidth: 40,
                        borderRadius: '50%', 
                        bgcolor: '#10b981', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700, 
                        fontSize: '0.95rem', 
                        lineHeight: 1,
                        boxShadow: '0 4px 10px rgba(16,185,129,0.3)', 
                        flexShrink: 0 
                      }}>
                        ✓
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 1.5, color: '#0f172a', fontSize: '0.875rem' }}>Order Placed</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', mt: 0.2 }}>
                        {new Date(activeOrder.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Step 2: Processing */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        minWidth: 40,
                        minHeight: 40,
                        maxHeight: 40,
                        maxWidth: 40,
                        borderRadius: '50%', 
                        bgcolor: activeOrder.orderStatus === 'Processing' || activeOrder.orderStatus === 'Shipped' || activeOrder.orderStatus === 'Delivered' ? '#10b981' : '#cbd5e1', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        lineHeight: 1,
                        flexShrink: 0 
                      }}>
                        {activeOrder.orderStatus === 'Processing' ? '⚙️' : '✓'}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 1.5, color: activeOrder.orderStatus === 'Processing' ? '#0284c7' : '#0f172a', fontSize: '0.875rem' }}>
                        Processing
                      </Typography>
                    </Box>

                    {/* Step 3: Shipped */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        minWidth: 40,
                        minHeight: 40,
                        maxHeight: 40,
                        maxWidth: 40,
                        borderRadius: '50%', 
                        bgcolor: activeOrder.orderStatus === 'Shipped' || activeOrder.orderStatus === 'Delivered' ? '#10b981' : '#cbd5e1', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        lineHeight: 1,
                        flexShrink: 0 
                      }}>
                        🚚
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 1.5, color: activeOrder.orderStatus === 'Shipped' ? '#0284c7' : '#0f172a', fontSize: '0.875rem' }}>
                        Dispatched
                      </Typography>
                      {activeOrder.trackingInfo?.shippedAt && (
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', mt: 0.2 }}>
                          {new Date(activeOrder.trackingInfo.shippedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Step 4: Delivered */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        minWidth: 40,
                        minHeight: 40,
                        maxHeight: 40,
                        maxWidth: 40,
                        borderRadius: '50%', 
                        bgcolor: activeOrder.orderStatus === 'Delivered' ? '#10b981' : '#cbd5e1', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        lineHeight: 1,
                        flexShrink: 0 
                      }}>
                        📦
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 1.5, color: activeOrder.orderStatus === 'Delivered' ? '#10b981' : '#64748b', fontSize: '0.875rem' }}>
                        Delivered
                      </Typography>
                      {activeOrder.deliveredAt && (
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', mt: 0.2 }}>
                          {new Date(activeOrder.deliveredAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                {/* Shipment Details Info Card */}
                {(activeOrder.orderStatus === "Shipped" || activeOrder.orderStatus === "Delivered") && (
                  <Box sx={{ mt: 3, p: 2.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369a1', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontFamily: "'Outfit', sans-serif" }}>
                      📦 Logistics Courier Info
                    </Typography>

                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          Courier Partner: <span style={{ color: '#0f172a', fontWeight: 700 }}>{activeOrder.trackingInfo?.courierName || 'Standard Express Delivery'}</span>
                        </Typography>
                        {activeOrder.trackingInfo?.trackingNumber && (
                          <Typography variant="body2" sx={{ color: '#334155', mt: 0.75, fontWeight: 600 }}>
                            AWB / Tracking Number: <code style={{ backgroundColor: '#e0f2fe', padding: '3px 8px', borderRadius: '6px', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem' }}>{activeOrder.trackingInfo.trackingNumber}</code>
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        {activeOrder.trackingInfo?.estimatedDelivery && (
                          <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                            Est. Delivery: <span style={{ color: '#0f172a', fontWeight: 700 }}>{new Date(activeOrder.trackingInfo.estimatedDelivery).toLocaleDateString()}</span>
                          </Typography>
                        )}

                        {activeOrder.trackingInfo?.trackingUrl ? (
                          <Button
                            variant="contained"
                            size="small"
                            href={activeOrder.trackingInfo.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7', borderRadius: '8px', '&:hover': { bgcolor: '#0369a1' } }}
                          >
                            🔗 Track Package Live →
                          </Button>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1, fontStyle: 'italic' }}>
                            Standard local delivery assigned.
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
            
            <Typography variant="h6">Shipping Info</Typography>
            <div className="orderDetailsContainerBox">
              <div>
                <p>Name:</p>
                <span>{isUserObject(activeOrder.user) ? activeOrder.user.name : activeOrder.guestName || (activeOrder.guestEmail ? 'Guest Customer' : String(activeOrder.user || 'Customer'))}</span>
              </div>
              <div>
                <p>Phone:</p>
                <span>{activeOrder.shippingInfo && activeOrder.shippingInfo.phoneNo}</span>
              </div>
              <div>
                <p>Address:</p>
                <span>
                  {activeOrder.shippingInfo &&
                    `${activeOrder.shippingInfo.address}, ${activeOrder.shippingInfo.city}, ${activeOrder.shippingInfo.state}, ${activeOrder.shippingInfo.pinCode}, ${activeOrder.shippingInfo.country}`}
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
                <span className={activeOrder.paymentInfo && activeOrder.paymentInfo.status === "succeeded" ? "greenColor" : "redColor"}>
                  {activeOrder.paymentInfo && activeOrder.paymentInfo.status === "succeeded" ? "PAID" : "UNPAID"}
                </span>
              </div>
              <div>
                <p>Amount:</p>
                <span>₹{activeOrder.totalPrice}</span>
              </div>
            </div>

            <Typography variant="h6">Order Status</Typography>
            <div className="orderDetailsContainerBox">
              <div>
                <span className={activeOrder.orderStatus === "Delivered" ? "greenColor" : activeOrder.orderStatus === "Cancelled" ? "redColor" : "amberColor"}>
                  {activeOrder.orderStatus}
                </span>
              </div>
            </div>

            {/* Refund Notification Banner if Order is Cancelled */}
            {activeOrder.orderStatus === "Cancelled" && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#dc2626' }}>
                  ℹ️ Refund Processing Notice
                </Typography>
                <Typography variant="caption" sx={{ color: '#991b1b', mt: 0.5, display: 'block' }}>
                  Your refund of ₹{activeOrder.totalPrice?.toLocaleString()} is currently processing via Stripe and will be credited to your original payment method within 3–5 business days.
                </Typography>
              </Box>
            )}

            {/* Cancel Button - Allowed only if Order is in Processing state */}
            {activeOrder.orderStatus === "Processing" && (
              <div className="cancelOrderSection">
                <Button 
                  variant="outlined" 
                  color="error" 
                  className="cancelOrderBtn"
                  onClick={() => setOpenCancelDialog(true)}
                  disabled={cancelling}
                  sx={{ mt: 3, fontWeight: 700, borderRadius: '8px' }}
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </Button>
              </div>
            )}
          </div>

          {/* Order Items Section */}
          <div className="orderDetailsCartItems">
            <Typography variant="h6">Order Items:</Typography>
            <div className="orderDetailsCartItemsContainer">
              {activeOrder.orderItems &&
                activeOrder.orderItems.map((item) => {
                  const variantText = item.selectedVariant && Object.keys(item.selectedVariant).length > 0
                    ? Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(" | ")
                    : null;

                  return (
                    <div key={item.productId || item.product} className="orderItemRow">
                      <img src={item.image} alt={item.name} />
                      <div className="orderItemInfo">
                        <Link to={`/product/${item.productId || item.product}`}>{item.name}</Link>
                        {variantText && (
                          <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                            {variantText}
                          </span>
                        )}
                      </div>
                      <span>
                        {item.quantity} X ₹{item.price} = <b>₹{item.quantity * item.price}</b>
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
      </div>

      {/* Confirmation Dialog for Cancelling Order */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          {"Confirm Order Cancellation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel Order #{activeOrder._id}? This action cannot be undone. Your refund of ₹{activeOrder.totalPrice?.toLocaleString()} will be automatically processed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCancelDialog(false)} color="inherit">
            Keep Order
          </Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained" autoFocus>
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default OrderDetails;
