import React, { Fragment, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import "./MyOrders.css";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, getMyOrders } from "../../features/order/orderSlice";
import Loader from "../Layout/Loader/Loader";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Typography from "@mui/material/Typography";
import MetaData from "../Layout/MetaData";
import LaunchIcon from "@mui/icons-material/Launch";

const MyOrders = () => {
  const dispatch = useDispatch();

  const { loading, error, myOrders } = useSelector((state) => state.newOrder);
  const { user } = useSelector((state) => state.user);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 300, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.5,
      cellClassName: (params) => {
        return params.row.status === "Delivered" ? "greenColor" : "redColor";
      },
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 150,
      flex: 0.3,
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
      minWidth: 270,
      flex: 0.5,
    },
    {
      field: "actions",
      flex: 0.3,
      headerName: "Actions",
      minWidth: 150,
      type: "number",
      sortable: false,
      renderCell: (params) => (
        <Link to={`/order/${params.row.id}`}>
          <LaunchIcon />
        </Link>
      ),
    },
  ];

  const rows = [];

  myOrders &&
    myOrders.forEach((order) => {
      rows.push({
        id: order._id,
        status: order.orderStatus,
        itemsQty: order.orderItems.length,
        amount: order.totalPrice,
      });
    });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    dispatch(getMyOrders());
  }, [dispatch]);

  return (
    <Fragment>
      <MetaData title={`${user?.name || "User"} - Orders`} />

      {loading ? (
        <Loader />
      ) : (
        <div className="myOrdersPage">
          <Typography id="myOrdersHeading">{user?.name}'s Orders</Typography>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            className="myOrdersTable"
            autoHeight
          />
        </div>
      )}
    </Fragment>
  );
};

export default MyOrders;
