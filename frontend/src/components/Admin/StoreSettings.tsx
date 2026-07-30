import React, { Fragment, useState, useEffect } from 'react';
import MetaData from '@/components/Layout/MetaData';
import SideBar from '@/components/Admin/Sidebar';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import {
  Button,
  TextField,
  Paper,
  Typography,
  Grid,
  Box,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { api } from '@/services/api';
import { toast } from 'react-toastify';

const StoreSettings: React.FC = () => {
  const [taxRate, setTaxRate] = useState<number | ''>(18);
  const [shippingFee, setShippingFee] = useState<number | ''>(200);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | ''>(1000);
  const [isTaxEnabled, setIsTaxEnabled] = useState(true);
  const [isShippingFeeEnabled, setIsShippingFeeEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const { data } = await api.get('/admin/settings');
        if (data.settings) {
          setTaxRate(data.settings.taxRate ?? 18);
          setShippingFee(data.settings.shippingFee ?? 200);
          setFreeShippingThreshold(data.settings.freeShippingThreshold ?? 1000);
          setIsTaxEnabled(data.settings.isTaxEnabled ?? true);
          setIsShippingFeeEnabled(data.settings.isShippingFeeEnabled ?? true);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load store settings');
      } finally {
        setFetching(false);
      }
    };

    fetchAdminSettings();
  }, []);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await api.put('/admin/settings', {
        taxRate: taxRate === '' ? 0 : Number(taxRate),
        shippingFee: shippingFee === '' ? 0 : Number(shippingFee),
        freeShippingThreshold: freeShippingThreshold === '' ? 0 : Number(freeShippingThreshold),
        isTaxEnabled,
        isShippingFeeEnabled,
      });

      toast.success('Store settings updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update store settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <MetaData title="Store Settings - Admin" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer" style={{ padding: '20px 40px' }}>
          <AdminPageHeader
            title="STORE SETTINGS"
            breadcrumbText="Settings"
          />

          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 650,
              mx: 'auto',
              mt: 3,
              borderRadius: 3,
              backgroundColor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3 }}>
              <SettingsIcon sx={{ color: '#0284c7', fontSize: 30 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Tax & Shipping Configurations
              </Typography>
            </Box>

            {fetching ? (
              <Typography align="center" sx={{ py: 4, color: '#64748b' }}>
                Loading settings...
              </Typography>
            ) : (
              <form onSubmit={submitHandler}>
                <Grid container spacing={3}>
                  {/* Tax Section */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon sx={{ color: '#0284c7' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>
                          GST & Tax Settings
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isTaxEnabled}
                            onChange={(e) => setIsTaxEnabled(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={isTaxEnabled ? 'Enabled' : 'Disabled'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="GST Tax Percentage (%)"
                      placeholder="18"
                      disabled={!isTaxEnabled}
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                      helperText="Applied to subtotal after promo code discounts"
                    />
                  </Grid>

                  {/* Shipping Section */}
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingIcon sx={{ color: '#0284c7' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>
                          Shipping Fee Settings
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isShippingFeeEnabled}
                            onChange={(e) => setIsShippingFeeEnabled(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={isShippingFeeEnabled ? 'Enabled' : 'Disabled'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Standard Shipping Fee (₹)"
                      placeholder="200"
                      disabled={!isShippingFeeEnabled}
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value === '' ? '' : Number(e.target.value))}
                      helperText="Flat delivery charge on orders"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Free Shipping Minimum (₹)"
                      placeholder="1000"
                      disabled={!isShippingFeeEnabled}
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                      helperText="Orders above this amount get Free Shipping"
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}>
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
                      {loading ? 'Saving Changes...' : 'Save Store Settings'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>
        </div>
      </div>
    </Fragment>
  );
};

export default StoreSettings;
