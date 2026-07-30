import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '@/components/Layout/MetaData';
import SideBar from '@/components/Admin/Sidebar';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import {
  Button,
  MenuItem,
  TextField,
  Paper,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { api } from '@/services/api';
import { toast } from 'react-toastify';

const NewCoupon: React.FC = () => {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [minAmount, setMinAmount] = useState<number | ''>(0);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const createCouponSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !discountValue || !expiresAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/coupon/new', {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minAmount: minAmount === '' ? 0 : Number(minAmount),
        maxDiscount: maxDiscount === '' ? undefined : Number(maxDiscount),
        expiresAt,
      });

      toast.success('Coupon Created Successfully');
      navigate('/admin/coupons');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <MetaData title="Create Coupon - Admin" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer" style={{ padding: '20px 40px' }}>
          <AdminPageHeader
            title="CREATE COUPON"
            breadcrumbText="New Coupon"
          />

          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              mx: 'auto',
              mt: 3,
              borderRadius: 3,
              backgroundColor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
              <LocalOfferIcon sx={{ color: '#ec4899', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Create Promo Code
              </Typography>
            </Box>

            <form onSubmit={createCouponSubmitHandler}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Coupon Code"
                    placeholder="e.g. SAVE20"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    inputProps={{ style: { textTransform: 'uppercase', fontWeight: 600 } }}
                    helperText="Customers enter this code at checkout"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Discount Type"
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as 'percentage' | 'fixed')
                    }
                  >
                    <MenuItem value="percentage">Percentage Off (%)</MenuItem>
                    <MenuItem value="fixed">Fixed Amount Off (₹)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                    placeholder={discountType === 'percentage' ? '20' : '200'}
                    required
                    value={discountValue}
                    onChange={(e) =>
                      setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={discountType === 'percentage' ? 6 : 12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Order Subtotal (₹)"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) =>
                      setMinAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    helperText="Min order required to use coupon"
                  />
                </Grid>

                {discountType === 'percentage' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Discount Cap (₹)"
                      placeholder="Optional"
                      value={maxDiscount}
                      onChange={(e) =>
                        setMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      helperText="Maximum discount limit in ₹"
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Expiration Date"
                    required
                    InputLabelProps={{ shrink: true }}
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      backgroundColor: '#1e293b',
                      '&:hover': { backgroundColor: '#0f172a' },
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                    }}
                  >
                    {loading ? 'Creating Coupon...' : 'Create Promo Code'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </div>
      </div>
    </Fragment>
  );
};

export default NewCoupon;
