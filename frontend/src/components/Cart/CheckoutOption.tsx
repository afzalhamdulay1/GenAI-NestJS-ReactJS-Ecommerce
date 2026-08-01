import React, { Fragment } from "react";
import MetaData from "@/components/Layout/MetaData";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Container } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BoltIcon from "@mui/icons-material/Bolt";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const CheckoutOption: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Fragment>
      <MetaData title="Choose Checkout Method" />
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
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' 
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                How would you like to check out?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select your preferred checkout method to proceed with your order
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
              {/* Option A: Guest Checkout */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '2px solid #e2e8f0',
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#6366f1', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.1)' }
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', p: 1, borderRadius: '10px', display: 'flex' }}>
                      <BoltIcon />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Guest Checkout</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Fast & simple checkout. No password needed! You can track your order live via email or create an account after ordering.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/shipping?guest=true')}
                  sx={{
                    py: 1.5,
                    borderRadius: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#4f46e5',
                    '&:hover': { backgroundColor: '#4338ca' }
                  }}
                >
                  Continue as Guest
                </Button>
              </Paper>

              {/* Option B: Log In */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '2px solid #e2e8f0',
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#10b981', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)' }
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ bgcolor: '#d1fae5', color: '#059669', p: 1, borderRadius: '10px', display: 'flex' }}>
                      <PersonIcon />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Returning Customer</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Log in to access your saved addresses, track all past orders in your dashboard, and check out faster.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login?redirect=shipping')}
                  sx={{
                    py: 1.5,
                    borderRadius: '0.75rem',
                    fontWeight: 700,
                    borderColor: '#10b981',
                    color: '#059669',
                    '&:hover': { backgroundColor: '#ecfdf5', borderColor: '#047857' }
                  }}
                >
                  Log In to Account
                </Button>
              </Paper>
            </Box>

            {/* Bottom Register Option */}
            <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid #f1f5f9' }}>
              <Typography variant="body2" color="text.secondary">
                New customer? {" "}
                <Link 
                  to="/register?redirect=shipping" 
                  style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}
                >
                  Create a new account
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Fragment>
  );
};

export default CheckoutOption;
