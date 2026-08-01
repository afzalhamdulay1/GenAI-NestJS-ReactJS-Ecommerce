import React, { Fragment } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MetaData from "@/components/Layout/MetaData";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Container, Chip, Divider } from "@mui/material";
import { useAppSelector } from "@/app/hooks";

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);

  const rawGuestOrder = sessionStorage.getItem("lastGuestOrder");
  const guestOrderInfo = rawGuestOrder ? JSON.parse(rawGuestOrder) : null;

  const isGuest = !isAuthenticated || !!guestOrderInfo;
  const recipientEmail = user?.email || guestOrderInfo?.email || localStorage.getItem("guestEmail") || "your email";
  const recipientName = user?.name || guestOrderInfo?.name || localStorage.getItem("guestName") || "Valued Customer";

  return (
    <Fragment>
      <MetaData title="Order Success - Thank You!" />
      <Box 
        sx={{ 
          backgroundColor: '#f8fafc', 
          minHeight: '85vh', 
          display: 'flex', 
          alignItems: 'center', 
          py: 6 
        }}
      >
        <Container maxWidth="md">
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: '1.5rem', 
              p: { xs: 3, md: 5 }, 
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
              textAlign: 'center'
            }}
          >
            {/* Success Icon & Header */}
            <Box sx={{ mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: '#10b981', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Order Placed Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Thank you for your order, <b>{recipientName}</b>. Your items are being prepared for shipment.
              </Typography>
            </Box>

            {/* Email & Receipt Notification Box */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '1rem',
                p: { xs: 2.5, sm: 3.5 },
                textAlign: 'left',
                mb: 4
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ bgcolor: '#dcfce7', color: '#16a34a', p: 1, borderRadius: '10px', display: 'flex' }}>
                  <MarkEmailReadIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#15803d' }}>
                    Confirmation Email & Invoice Sent!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#166534' }}>
                    We sent an order receipt to <Chip label={recipientEmail} size="small" sx={{ fontWeight: 700, bgcolor: '#ffffff', color: '#15803d', border: '1px solid #86efac' }} />
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#bbf7d0' }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', mb: 1 }}>
                What's included in your email:
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <ReceiptLongIcon sx={{ color: '#16a34a', fontSize: 20, mt: 0.2 }} />
                  <Typography variant="caption" sx={{ color: '#14532d', fontSize: '0.85rem' }}>
                    <b>Official PDF Tax Invoice</b> attached directly to your message.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocalShippingIcon sx={{ color: '#16a34a', fontSize: 20, mt: 0.2 }} />
                  <Typography variant="caption" sx={{ color: '#14532d', fontSize: '0.85rem' }}>
                    <b>Live Tracking Button</b> to check your package status or cancel if needed.
                  </Typography>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: '#166534', display: 'block', mt: 2.5, fontStyle: 'italic' }}>
                💡 Tip: If you don't see the email in your primary inbox, please check your spam or promotions folder.
              </Typography>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              {guestOrderInfo?.orderId && guestOrderInfo?.token ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/order/guest/${guestOrderInfo.orderId}?token=${guestOrderInfo.token}`)}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#6366f1',
                    '&:hover': { backgroundColor: '#4f46e5' }
                  }}
                >
                  Track Order Live
                </Button>
              ) : isAuthenticated ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/orders')}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#6366f1',
                    '&:hover': { backgroundColor: '#4f46e5' }
                  }}
                >
                  View My Orders
                </Button>
              ) : null}

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/')}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  borderColor: '#94a3b8',
                  color: '#334155',
                  '&:hover': { borderColor: '#64748b', backgroundColor: '#f1f5f9' }
                }}
              >
                Continue Shopping
              </Button>
            </Box>

            {/* Guest Account Register Prompt */}
            {!isAuthenticated && (
              <Box sx={{ pt: 3, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <PersonAddIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Want to save your shipping info and track future orders in one place? {" "}
                  <Link 
                    to="/register" 
                    style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Create a free account
                  </Link>
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Fragment>
  );
};

export default OrderSuccess;
