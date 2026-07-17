import React, { Fragment, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import "./ProductsList.css";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  Button, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Tooltip, 
  Paper,
  Breadcrumbs
} from "@mui/material";
import MetaData from "../Layout/MetaData";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SideBar from "./Sidebar";
import {
  deleteOrder,
  getAllOrders,
  clearErrors,
  resetDeleteState
} from "../../features/order/orderSlice";
import { toast } from "react-toastify";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const OrdersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const { error, orders, isDeleted, isUpdated } = useSelector((state) => state.newOrder);

//   const { error: deleteError, isDeleted } = useSelector((state) => state.order);

  const deleteOrderHandler = (id) => {
    dispatch(deleteOrder(id));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isDeleted) {
      toast.success("Order Deleted Successfully");
      navigate("/admin/orders");
      dispatch(resetDeleteState());
    }

    dispatch(getAllOrders());
  }, [dispatch, toast, navigate, isDeleted]);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 200, flex: 0.6 },
    {
      field: "date",
      headerName: "Order Date",
      type: "dateTime",
      minWidth: 150,
      flex: 0.4,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {new Date(params.value).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </Typography>
      )
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.4,
      renderCell: (params) => {
        const status = params.value;
        let color = "default";
        if (status === "Delivered") color = "success";
        else if (status === "Processing") color = "warning";
        else color = "primary";

        return (
          <Chip 
            label={status}
            color={color}
            variant="soft"
            size="small"
            sx={{ fontWeight: 600, minWidth: '95px' }}
          />
        );
      }
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 100,
      flex: 0.3,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#334155" }}>
          {params.value} Pack(s)
        </Typography>
      )
    },
    {
      field: "amount",
      headerName: "Total Amount",
      type: "number",
      minWidth: 170,
      flex: 0.5,
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
            <Tooltip title="Process Order">
                <IconButton 
                    component={Link} 
                    to={`/admin/order/${params.row.id}`}
                    size="small"
                    sx={{ color: '#6366f1', background: '#eef2ff', '&:hover': { background: '#e0e7ff' } }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip title="Delete Order">
                <IconButton 
                    onClick={() => deleteOrderHandler(params.row.id)}
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
  orders &&
    orders.forEach((item) => {
      rows.push({
        id: item._id,
        itemsQty: item.orderItems.length,
        amount: item.totalPrice,
        status: item.orderStatus,
        date: new Date(item.createdAt),
      });
    });

  return (
    <Fragment>
      <MetaData title={`ALL ORDERS - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <Box className="headerSection">
            <Box>
                <Typography variant="h6" className="pageHeading">
                    Financial Orders
                </Typography>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link to="/admin/dashboard" className="breadcrumbLink">Admin</Link>
                    <Typography color="text.primary" fontSize="0.875rem">Orders</Typography>
                </Breadcrumbs>
            </Box>
          </Box>

          <Paper elevation={0} className="productListTableContainer">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              className="productListTable"
              autoHeight
              rowHeight={60}
              sx={{
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontSize: "1.125rem !important",
                  fontWeight: "700 !important",
                  textTransform: "capitalize !important",
                  color: "#1e293b !important",
                }
              }}
            />
          </Paper>
        </div>
      </div>
    </Fragment>
  );
};

export default OrdersList;
