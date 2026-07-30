import React, { Fragment, useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import '@/components/Admin/ProductsList.css';
import { Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Button,
} from '@mui/material';
import MetaData from '@/components/Layout/MetaData';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SideBar from '@/components/Admin/Sidebar';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import { api } from '@/services/api';
import { toast } from 'react-toastify';

export interface CouponData {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
}

const CouponsList: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.coupons || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const deleteCouponHandler = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupon/${id}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: 'Code',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOfferIcon sx={{ color: '#ec4899', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'discount',
      headerName: 'Discount',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#16a34a' }}>
            {row.discountType === 'percentage'
              ? `${row.discountValue}% OFF`
              : `₹${row.discountValue} OFF`}
          </Typography>
        );
      },
    },
    {
      field: 'minAmount',
      headerName: 'Min Order',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => `₹${params.value || 0}`,
    },
    {
      field: 'expiresAt',
      headerName: 'Expires On',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => {
        const isExpired = new Date(params.value) < new Date();
        return (
          <Chip
            label={new Date(params.value).toLocaleDateString()}
            size="small"
            color={isExpired ? 'error' : 'default'}
            variant={isExpired ? 'filled' : 'outlined'}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Delete Coupon">
          <IconButton
            onClick={() => deleteCouponHandler(params.id as string)}
            sx={{ color: '#ef4444' }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = coupons.map((coupon) => ({
    id: coupon._id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minAmount: coupon.minAmount,
    maxDiscount: coupon.maxDiscount,
    expiresAt: coupon.expiresAt,
    isActive: coupon.isActive,
  }));

  return (
    <Fragment>
      <MetaData title="ALL COUPONS - Admin" />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <AdminPageHeader
            title="ALL COUPONS"
            breadcrumbText="Coupons"
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, px: 2 }}>
            <Link to="/admin/coupon/new" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#1e293b',
                  '&:hover': { backgroundColor: '#0f172a' },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Create New Coupon
              </Button>
            </Link>
          </Box>

          <Paper elevation={0} className="productListTableContainer">
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              className="productListTable"
              autoHeight
              rowHeight={60}
            />
          </Paper>
        </div>
      </div>
    </Fragment>
  );
};

export default CouponsList;
