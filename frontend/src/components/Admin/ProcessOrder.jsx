import React, { Fragment, useEffect, useState } from "react";
import MetaData from "../Layout/MetaData";
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
  Avatar
} from "@mui/material";
import SideBar from "./Sidebar";
import {
  getOrderDetails,
  clearErrors,
  updateOrder,
  resetOrderState
} from "../../features/order/orderSlice";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../Layout/Loader/Loader";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import "./ProcessOrder.css";
import { toast } from "react-toastify";

const ProcessOrder = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("");
  const { orderDetails:order, error, loading, isUpdated } = useSelector((state) => state.newOrder);
//   const { error: updateError, isUpdated } = useSelector((state) => state.order);
    const { id } = useParams()

  const updateOrderSubmitHandler = (e) => {
    e.preventDefault();
    if (!status) {
        alert('Please select a status');
        return;
    }
    console.log(status);
    
    const myForm = new FormData();
    myForm.set("status", status);
    dispatch(updateOrder({id, orderData: myForm}));
  };


  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    // if (updateError) {
    //   alert.error(updateError);
    //   dispatch(clearErrors());
    // }
    if (isUpdated) {
      toast.success("Order Updated Successfully");
      dispatch(resetOrderState());
      
    }

    dispatch(getOrderDetails(id));
  }, [dispatch, toast, error, id , isUpdated]);

  return (
    <Fragment>
      <MetaData title="Process Order - Admin Panel" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
          {loading || !order ? (
            <Loader />
          ) : (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {/* Order Summary & Status Header */}
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
                        <Chip 
                            label={order.orderStatus} 
                            color={order.orderStatus === "Delivered" ? "success" : "warning"}
                            sx={{ fontWeight: 700, px: 2 }}
                        />
                    </Box>
                </Grid>

                {/* Main Content Area */}
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: '1rem', p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                            <LocalShippingIcon sx={{ color: '#6366f1' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Shipping & Delivery</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Customer Contact</Typography>
                                <Typography sx={{ fontWeight: 600 }}>{order.user?.name}</Typography>
                                <Typography variant="body2">{order.user?.email}</Typography>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                            <PaymentIcon sx={{ color: '#10b981' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Financial Details</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip 
                                        label={order.paymentInfo?.status === "succeeded" ? "PAID" : "UNPAID"} 
                                        size="small"
                                        color={order.paymentInfo?.status === "succeeded" ? "success" : "error"}
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
                                <Fragment key={item.product}>
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
                                                <Link to={`/product/${item.product}`} style={{ textDecoration: 'none', color: '#6366f1', fontWeight: 600 }}>
                                                    {item.name}
                                                </Link>
                                            }
                                            secondary={
                                                <Typography variant="body2" sx={{ mt: 0.5, color: '#64748b' }}>
                                                    SKU: {item.product?.toString().slice(-6).toUpperCase() || "N/A"} | Qty: {item.quantity}
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

                {/* Sidebar Logistics Action Area */}
                <Grid item xs={12} lg={4}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            border: '1px solid #f1f5f9', 
                            borderRadius: '1rem', 
                            p: 3, 
                            backgroundColor: '#f8fafc',
                            position: 'sticky',
                            top: '20px'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Logistics Center</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {order.orderStatus === "Delivered" 
                             ? "This order has been completed and archived." 
                             : "Update the delivery pipeline for this shipment."}
                        </Typography>

                        {order.orderStatus !== "Delivered" && (
                            <form onSubmit={updateOrderSubmitHandler}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel id="status-label">Transition To</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        label="Transition To"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        sx={{ backgroundColor: 'white' }}
                                    >
                                        <MenuItem value="">Choose Logistics Step</MenuItem>
                                        {order.orderStatus === "Processing" && (
                                            <MenuItem value="Shipped">Dispatched (Shipped)</MenuItem>
                                        )}
                                        {order.orderStatus === "Shipped" && (
                                            <MenuItem value="Delivered">Completed (Delivered)</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading || !status}
                                    sx={{ 
                                        borderRadius: '0.75rem',
                                        py: 1.5,
                                        fontWeight: 700,
                                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    {loading ? "Updating..." : "Confirm Logistics Move"}
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
