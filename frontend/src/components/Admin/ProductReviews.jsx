import React, { Fragment, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import "./ProductReviews.css";
import { useSelector, useDispatch } from "react-redux";
import {
  clearErrors,
  getAllReviews,
  deleteReview,
  resetReviewState,
} from "../../features/review/reviewSlice";
import { getAdminProducts } from "../../features/products/productsSlice";
import { 
  Button, 
  Typography, 
  Box, 
  TextField, 
  Paper, 
  Grid, 
  Breadcrumbs, 
  Avatar, 
  Chip, 
  IconButton, 
  Tooltip,
  Divider,
  Rating,
  InputAdornment
} from "@mui/material";
import MetaData from "../Layout/MetaData";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import SideBar from "./Sidebar";
import { toast } from "react-toastify";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader/Loader";

const ProductReviews = () => {
  const dispatch = useDispatch();

  const { error, reviews, loading, isDeleted } = useSelector((state) => state.reviews);
  const { products } = useSelector((state) => state.products);

  const [productId, setProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const deleteReviewHandler = (reviewId) => {
    dispatch(deleteReview({ reviewId, productId: selectedProduct?._id || productId }));
  };

  const productReviewsSubmitHandler = (e) => {
    e.preventDefault();
    if (productId.length === 24) {
        dispatch(getAllReviews(productId));
        const found = products?.find(p => p._id === productId);
        setSelectedProduct(found || { _id: productId, name: "Remote Product" });
    } else {
        toast.warn("Please enter a valid Product ID (24 characters)");
    }
  };

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setProductId(prod._id);
    dispatch(getAllReviews(prod._id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    dispatch(getAdminProducts());
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isDeleted) {
      toast.success("Review Deleted Successfully");
      dispatch(resetReviewState());
      dispatch(getAllReviews(selectedProduct?._id || productId));
    }
  }, [dispatch, error, isDeleted, selectedProduct, productId]);

  const columns = [
    { field: "id", headerName: "Review ID", minWidth: 180, flex: 0.5 },
    {
      field: "user",
      headerName: "Customer Name",
      minWidth: 150,
      flex: 0.5,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: "comment",
      headerName: "Review Comment",
      minWidth: 350,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: "rating",
      headerName: "Rating",
      type: "number",
      minWidth: 160,
      flex: 0.4,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={params.value} readOnly size="small" precision={0.5} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: params.value >= 3 ? '#10b981' : '#ef4444' }}>
                ({params.value})
            </Typography>
        </Box>
      )
    },
    {
      field: "actions",
      flex: 0.4,
      headerName: "Actions",
      minWidth: 120,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', pr: 1 }}>
            <Tooltip title="Delete Review">
                <IconButton 
                    onClick={() => deleteReviewHandler(params.row.id)}
                    size="small"
                    sx={{ color: '#ef4444', background: '#fef2f2', '&:hover': { background: '#fee2e2' } }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const rows = [];
  reviews &&
    reviews.forEach((item) => {
      rows.push({
        id: item._id,
        rating: item.rating,
        comment: item.comment,
        user: item.name,
      });
    });

  const productsWithReviews = products?.filter(p => p.numOfReviews > 0) || [];

  return (
    <Fragment>
      <MetaData title={`Product Reviews Audit - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productReviewsContainer">
          <Box className="headerSection">
            <Box>
                <Typography variant="h6" className="pageHeading">
                    Review Moderation
                </Typography>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link to="/admin/dashboard" className="breadcrumbLink">Admin</Link>
                    <Typography color="text.primary" fontSize="0.875rem">Reviews</Typography>
                </Breadcrumbs>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Search Top Bar */}
            <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                    <form className="productReviewsForm" onSubmit={productReviewsSubmitHandler} style={{ padding: 0, margin: 0, width: '100%', maxWidth: 'none', boxShadow: 'none' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SearchIcon color="primary" /> Find Specific Product Reviews
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                placeholder="Enter Product ID (e.g. 5f8d...)"
                                variant="outlined"
                                size="large"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <InventoryIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '0.75rem', 
                                    '& .MuiOutlinedInput-root': { height: '56px', borderRadius: '0.75rem' } 
                                }}
                            />
                            <Button
                                id="createProductBtn"
                                type="submit"
                                variant="contained"
                                disabled={loading || !productId}
                                sx={{ 
                                    height: '56px', 
                                    minWidth: '180px', 
                                    borderRadius: '0.75rem',
                                    whiteSpace: 'nowrap',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
                                    marginTop: '0 !important'
                                }}
                            >
                                {loading ? "Searching..." : "Fetch Reviews"}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Grid>

            {/* Main Content: Reviews List */}
            <Grid item xs={12} lg={8}>
                {selectedProduct ? (
                    <Paper elevation={0} className="productListTableContainer" sx={{ p: 0 }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar 
                              src={selectedProduct.images?.[0]?.url} 
                              variant="rounded" 
                              sx={{ width: 50, height: 50 }} 
                            />
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                    {selectedProduct.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Total Reviews: {selectedProduct.numOfReviews || reviews?.length || 0} | Avg Rating: {selectedProduct.ratings || 0}
                                </Typography>
                            </Box>
                        </Box>
                        {reviews && reviews.length > 0 ? (
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={10}
                                disableSelectionOnClick
                                className="productListTable"
                                autoHeight
                                sx={{
                                    "& .MuiDataGrid-columnHeaderTitle": {
                                      fontSize: "1.125rem !important",
                                      fontWeight: "700 !important",
                                      textTransform: "capitalize !important",
                                      color: "#1e293b !important",
                                    }
                                }}
                            />
                        ) : (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary">
                                    No reviews yet for this product.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                ) : (
                    <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                        <InventoryIcon sx={{ fontSize: 60, color: '#f1f5f9', mb: 2 }} />
                        <Typography color="text.secondary">
                            Select a product from the list or search by ID to manage reviews.
                        </Typography>
                    </Paper>
                )}
            </Grid>

            {/* Sidebar: Active Review Products */}
            <Grid item xs={12} lg={4}>
                {productsWithReviews.length > 0 ? (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '1rem', border: '1px solid #f1f5f9', backgroundColor: '#fcfdff' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#0f172a' }}>
                            Products with Reviews
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {productsWithReviews.map((prod) => (
                                <Box 
                                    key={prod._id}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2, 
                                        p: 1.5, 
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: selectedProduct?._id === prod._id ? '2px solid #6366f1' : '1px solid transparent',
                                        backgroundColor: selectedProduct?._id === prod._id ? '#fff' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: '#fff',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }
                                    }}
                                    onClick={() => handleSelectProduct(prod)}
                                >
                                    <Avatar src={prod.images?.[0]?.url} variant="rounded" sx={{ width: 45, height: 45 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {prod.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Rating value={prod.ratings} readOnly size="small" precision={0.5} sx={{ fontSize: '0.75rem' }} />
                                            <Typography variant="caption" color="text.secondary">({prod.numOfReviews})</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                ) : (
                    <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '1rem', border: '1px dashed #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <Typography variant="body2" color="text.secondary">
                            No products found with existing customer reviews.
                        </Typography>
                    </Paper>
                )}
            </Grid>
          </Grid>
        </div>
      </div>
    </Fragment>
  );
};

export default ProductReviews;
