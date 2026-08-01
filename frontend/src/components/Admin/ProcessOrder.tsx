import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MetaData from "@/components/Layout/MetaData";
import { Link, useParams } from "react-router-dom";
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Chip, 
  Divider, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  FormHelperText,
  CircularProgress
} from "@mui/material";
import SideBar from "@/components/Admin/Sidebar";
import {
  getOrderDetails,
  clearErrors,
  updateOrder,
  resetOrderState,
  isUserObject
} from "@/features/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Loader from "@/components/Layout/Loader/Loader";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import "@/components/Admin/ProcessOrder.css";
import { toast } from "react-toastify";
import { api } from "@/services/api";

const processOrderSchema = z.object({
  status: z.string().min(1, "Please select a status"),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

type ProcessOrderFormValues = z.infer<typeof processOrderSchema>;

const ProcessOrder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orderDetails: order, error, loading, isUpdated } = useAppSelector((state) => state.order);
  const { id } = useParams<{ id: string }>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProcessOrderFormValues>({
    resolver: zodResolver(processOrderSchema) as any,
    defaultValues: {
      status: "",
      courierName: "",
      trackingNumber: "",
      trackingUrl: "",
      estimatedDelivery: "",
    },
  });

  const [downloadingInvoice, setDownloadingInvoice] = React.useState(false);

  const handleDownloadInvoice = async () => {
    if (!id) return;
    setDownloadingInvoice(true);
    try {
      const response = await api.get(`/order/${id}/invoice`, {
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

  const selectedStatus = watch("status");
  const selectedCourier = watch("courierName");
  const enteredTrackingNum = watch("trackingNumber");

  // Auto-generate courier URL for popular presets if admin didn't paste a custom URL
  const getAutoTrackingUrl = (courier?: string, trackingNum?: string) => {
    if (!trackingNum) return "";
    const cleanNum = trackingNum.trim();
    if (courier === "BlueDart") return `https://www.bluedart.com/tracking?trackingNo=${cleanNum}`;
    if (courier === "FedEx") return `https://www.fedex.com/fedextrack/?trknbr=${cleanNum}`;
    if (courier === "DHL") return `https://www.dhl.com/en/express/tracking.html?AWB=${cleanNum}`;
    if (courier === "Delhivery") return `https://www.delhivery.com/track/package/${cleanNum}`;
    return "";
  };

  const onUpdateOrderSubmit = (data: ProcessOrderFormValues) => {
    if (!id) return;
    const finalTrackingUrl = data.trackingUrl?.trim() || getAutoTrackingUrl(data.courierName, data.trackingNumber);

    dispatch(updateOrder({ 
      id, 
      orderData: { 
        status: data.status,
        courierName: data.courierName,
        trackingNumber: data.trackingNumber,
        trackingUrl: finalTrackingUrl,
        estimatedDelivery: data.estimatedDelivery,
      } 
    }));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isUpdated) {
      toast.success("Order Status Updated Successfully");
      dispatch(resetOrderState());
    }

    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, error, id, isUpdated]);

  return (
    <Fragment>
      <MetaData title="Process Order - Admin Panel" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
          {!order ? (
            <Loader />
          ) : (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {/* Top Header */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>Current Status:</Typography>
                      <Chip 
                        label={order.orderStatus} 
                        color={order.orderStatus === "Delivered" ? "success" : order.orderStatus === "Cancelled" ? "error" : "warning"}
                        sx={{ fontWeight: 800, px: 2, fontSize: '0.85rem' }}
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Left Column: Details */}
                <Grid item xs={12} lg={8}>
                  <Paper elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: '1rem', p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                      <LocalShippingIcon sx={{ color: '#6366f1' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Shipping & Delivery</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Customer Contact</Typography>
                        <Typography sx={{ fontWeight: 600 }}>{isUserObject(order.user) ? order.user.name : order.guestName || 'Guest Customer'}</Typography>
                        <Typography variant="body2">{isUserObject(order.user) ? order.user.email : order.guestEmail || ''}</Typography>
                        <Typography variant="body2">{order.shippingInfo?.phoneNo}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Delivery Address</Typography>
                        <Typography variant="body2">
                          {order.shippingInfo &&
                          `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.pinCode}, ${order.shippingInfo.country}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Paper elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: '1rem', p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaymentIcon sx={{ color: '#10b981' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Financial Details</Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={downloadingInvoice}
                        onClick={handleDownloadInvoice}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 700,
                          borderColor: '#10b981',
                          color: '#059669',
                          '&:hover': { backgroundColor: '#ecfdf5', borderColor: '#059669' }
                        }}
                      >
                        {downloadingInvoice ? "Generating PDF..." : "📄 Download Official Invoice"}
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip 
                            label={order.orderStatus === "Cancelled" ? (order.paymentInfo?.status === "succeeded" ? "REFUNDED" : "VOIDED") : order.paymentInfo?.status === "succeeded" ? "PAID" : "UNPAID"} 
                            size="small"
                            color={order.orderStatus === "Cancelled" ? "default" : order.paymentInfo?.status === "succeeded" ? "success" : "error"}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Total Transaction Value</Typography>
                        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800 }}>
                          ₹{order.totalPrice?.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Paper elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: '1rem', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                      <ShoppingBagIcon sx={{ color: '#f59e0b' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Item Manifest</Typography>
                    </Box>
                    <List disablePadding>
                      {order.orderItems && order.orderItems.map((item, index) => (
                        <Fragment key={item.productId || item.product}>
                          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar 
                                src={item.image} 
                                variant="rounded" 
                                sx={{ width: 60, height: 60, mr: 2, border: '1px solid #f1f5f9' }} 
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Link to={`/product/${item.productId || item.product}`} style={{ textDecoration: 'none', color: '#6366f1', fontWeight: 600 }}>
                                  {item.name}
                                </Link>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ mt: 0.5, color: '#64748b' }}>
                                  SKU: {(item.productId || item.product)?.toString().slice(-6).toUpperCase() || "N/A"} | Qty: {item.quantity}
                                </Typography>
                              }
                            />
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.quantity} x ₹{item.price}
                              </Typography>
                            </Box>
                          </ListItem>
                          {index < order.orderItems.length - 1 && <Divider variant="inset" component="li" sx={{ ml: 8 }} />}
                        </Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                {/* Right Column: Logistics Action Card */}
                <Grid item xs={12} lg={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '1rem', 
                      p: 3, 
                      backgroundColor: '#f8fafc',
                      position: 'sticky',
                      top: '20px'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Logistics Center</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {order.orderStatus === "Delivered" || order.orderStatus === "Cancelled"
                        ? "This order has been completed/voided and archived." 
                        : "Update the delivery pipeline for this shipment."}
                    </Typography>

                    {/* Current Order Status Badge inside Card */}
                    <Box sx={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', p: 1.5, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Current Status:</Typography>
                      <Chip 
                        label={order.orderStatus} 
                        size="small"
                        color={order.orderStatus === "Delivered" ? "success" : order.orderStatus === "Cancelled" ? "error" : "warning"}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                      <form onSubmit={handleSubmit(onUpdateOrderSubmit)}>
                        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.status}>
                          <InputLabel id="status-label">Transition To</InputLabel>
                          <Select
                            labelId="status-label"
                            label="Transition To"
                            defaultValue=""
                            {...register("status")}
                            sx={{ backgroundColor: 'white' }}
                          >
                            <MenuItem value="">Choose Logistics Step</MenuItem>
                            {order.orderStatus === "Processing" && (
                              <MenuItem value="Shipped">Dispatched (Shipped)</MenuItem>
                            )}
                            {order.orderStatus === "Shipped" && (
                              <MenuItem value="Delivered">Completed (Delivered)</MenuItem>
                            )}
                            <MenuItem value="Cancelled">Void (Cancelled)</MenuItem>
                          </Select>
                          {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                        </FormControl>

                        {/* Optional Tracking Fields when Dispatching / Shipped */}
                        {selectedStatus === "Shipped" && (
                          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: '0.75rem', border: '1px border-gray-200' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#334155' }}>
                              🚚 Optional Courier Tracking Details
                            </Typography>
                            
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                              <InputLabel id="courier-label">Courier Partner</InputLabel>
                              <Select
                                labelId="courier-label"
                                label="Courier Partner"
                                defaultValue=""
                                {...register("courierName")}
                                sx={{ backgroundColor: 'white' }}
                              >
                                <MenuItem value="">Custom / Local Delivery</MenuItem>
                                <MenuItem value="BlueDart">BlueDart Express</MenuItem>
                                <MenuItem value="FedEx">FedEx</MenuItem>
                                <MenuItem value="DHL">DHL Express</MenuItem>
                                <MenuItem value="Delhivery">Delhivery</MenuItem>
                                <MenuItem value="Other">Other Courier</MenuItem>
                              </Select>
                            </FormControl>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <input
                                type="text"
                                placeholder="Tracking / AWB Number (e.g. BD-994820)"
                                {...register("trackingNumber")}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.875rem',
                                  outline: 'none',
                                  width: '100%',
                                  boxSizing: 'border-box'
                                }}
                              />

                              <input
                                type="url"
                                placeholder="Direct Tracking URL (optional)"
                                {...register("trackingUrl")}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.875rem',
                                  outline: 'none',
                                  width: '100%',
                                  boxSizing: 'border-box'
                                }}
                              />

                              <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                                  Estimated Delivery Date (optional)
                                </Typography>
                                <input
                                  type="date"
                                  {...register("estimatedDelivery")}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        )}

                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                          disabled={loading || !selectedStatus}
                          sx={{ 
                            borderRadius: '0.75rem',
                            py: 1.5,
                            fontWeight: 700,
                            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                          }}
                        >
                          {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={20} sx={{ color: '#fff' }} />
                              <span>Updating Order...</span>
                            </Box>
                          ) : (
                            "Confirm Logistics Move"
                          )}
                        </Button>
                      </form>
                    )}

                    {order.orderStatus === "Delivered" && (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Avatar sx={{ bgcolor: '#10b981', mx: 'auto', mb: 2 }}>
                          <AccountTreeIcon />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, color: '#10b981' }}>Workflow Finished</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default ProcessOrder;
