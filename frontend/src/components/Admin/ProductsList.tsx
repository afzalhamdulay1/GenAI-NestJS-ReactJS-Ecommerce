import React, { Fragment, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import "@/components/Admin/ProductsList.css";
import {
  clearErrors,
  getAdminProducts,
} from "@/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
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
import MetaData from "@/components/Layout/MetaData";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SideBar from "@/components/Admin/Sidebar";
import AdminPageHeader from "@/components/Admin/AdminPageHeader";
import { toast } from "react-toastify";
import AddIcon from '@mui/icons-material/Add';
import { deleteProduct, resetProductState } from "@/features/products/productSlice";
import Loader from "@/components/Layout/Loader/Loader";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const ProductsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { error, products } = useAppSelector((state) => state.products);
  const { error: deleteError, success, message, loading } = useAppSelector((state) => state.product);

  const deleteProductHandler = (id: string) => {
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

    if (success && message) {
      toast.success(message);
      navigate("/admin/products");
      dispatch(resetProductState());
    }

    dispatch(getAdminProducts());
  }, [dispatch, deleteError, error, navigate, success, message]);

  const columns: GridColDef[] = [
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
          ₹{params.value ? params.value.toLocaleString() : 0}
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

  interface ProductRow {
    id: string;
    stock: number;
    price: number;
    name: string;
    image: string;
    category: string;
  }

  const rows: ProductRow[] = [];
  products &&
    products.forEach((item) => {
      rows.push({
        id: item._id,
        stock: item.stock || 0,
        price: item.price,
        name: item.name,
        image: item.images && item.images[0] ? item.images[0].url : '',
        category: item.category,
      });
    });

  return (
    <Fragment>
      <MetaData title={`ALL PRODUCTS - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <AdminPageHeader
            title="Product Inventory"
            breadcrumbText="Products"
          >
            <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                component={Link}
                to="/admin/product"
                className="addNewBtn"
            >
                Add New Product
            </Button>
          </AdminPageHeader>

          <Paper elevation={0} className="productListTableContainer">
            {loading ? <Loader/> : 
              <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
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
