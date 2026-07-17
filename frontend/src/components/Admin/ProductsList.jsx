import React, { Fragment, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import "./ProductsList.css";
import { useSelector, useDispatch } from "react-redux";
import {
  clearErrors,
  getAdminProducts,
} from "../../features/products/productsSlice.js";
import { Link, useNavigate } from "react-router-dom";
import { 
  Button, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  IconButton, 
  Tooltip, 
  Paper,
  Breadcrumbs
} from "@mui/material";
import MetaData from "../Layout/MetaData.jsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SideBar from "./Sidebar.jsx";
import { toast } from "react-toastify";
import { deleteProduct, resetProductState } from "../../features/products/productSlice.js";
import Loader from "../Layout/Loader/Loader.jsx";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const ProductsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, products } = useSelector((state) => state.products);

  const { error: deleteError, success, message, loading } = useSelector(
    (state) => state.product
  );

  const deleteProductHandler = (id) => {
    console.log(id);
    
    dispatch(deleteProduct(id));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (deleteError) {
      toast.error(deleteError);
      dispatch(clearErrors());
    }

    if (success) {
      toast.success(message);
      navigate("/admin/products");
      dispatch(resetProductState());
    }

    dispatch(getAdminProducts());
  }, [dispatch, deleteError, navigate, success, toast]);

  const columns = [
    { 
      field: "image", 
      headerName: "Product", 
      minWidth: 100, 
      flex: 0.3,
      sortable: false,
      renderCell: (params) => (
        <Avatar 
          src={params.row.image} 
          variant="rounded" 
          sx={{ width: 45, height: 45, my: 1 }}
        />
      )
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 250,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#334155" }}>
          {params.value}
        </Typography>
      )
    },
    {
        field: "category",
        headerName: "Category",
        minWidth: 150,
        flex: 0.4,
    },
    {
      field: "stock",
      headerName: "Stock Status",
      minWidth: 150,
      flex: 0.4,
      renderCell: (params) => {
        const stock = params.value;
        return (
          <Chip 
            label={stock > 0 ? `In Stock (${stock})` : "Out of Stock"}
            color={stock > 0 ? "success" : "error"}
            variant="soft"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      }
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      minWidth: 120,
      flex: 0.3,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
          ₹{params.value.toLocaleString()}
        </Typography>
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
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%', pr: 1 }}>
            <Tooltip title="Edit Product">
                <IconButton 
                    component={Link} 
                    to={`/admin/product/${params.row.id}`}
                    size="small"
                    sx={{ color: '#6366f1', background: '#eef2ff', '&:hover': { background: '#e0e7ff' } }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip title="Delete Product">
                <IconButton 
                    onClick={() => deleteProductHandler(params.row.id)}
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
  products &&
    products.forEach((item) => {
      rows.push({
        id: item._id,
        stock: item.stock,
        price: item.price,
        name: item.name,
        image: item.images[0]?.url,
        category: item.category,
      });
    });

  return (
    <Fragment>
      <MetaData title={`ALL PRODUCTS - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <Box className="headerSection">
            <Box>
                <Typography variant="h6" className="pageHeading">
                    Product Inventory
                </Typography>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link to="/admin/dashboard" className="breadcrumbLink">Admin</Link>
                    <Typography color="text.primary" fontSize="0.875rem">Products</Typography>
                </Breadcrumbs>
            </Box>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                component={Link}
                to="/admin/product"
                className="addNewBtn"
            >
                Add New Product
            </Button>
          </Box>

          <Paper elevation={0} className="productListTableContainer">
            {loading ? <Loader/> : 
              <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              className="productListTable"
              autoHeight
              rowHeight={65}
              sx={{
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontSize: "1.125rem !important",
                  fontWeight: "700 !important",
                  textTransform: "capitalize !important",
                  color: "#1e293b !important",
                }
              }}
            />
            }
          </Paper>
        </div>
      </div>
    </Fragment>
  );
};

export default ProductsList;
