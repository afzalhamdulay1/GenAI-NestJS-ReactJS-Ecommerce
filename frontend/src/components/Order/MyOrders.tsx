import React, { Fragment, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import "@/components/Order/MyOrders.css";
import { clearErrors, getMyOrders } from "@/features/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Loader from "@/components/Layout/Loader/Loader";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Typography from "@mui/material/Typography";
import MetaData from "@/components/Layout/MetaData";
import LaunchIcon from "@mui/icons-material/Launch";

const MyOrders: React.FC = () => {
  const dispatch = useAppDispatch();

  const { loading, error, myOrders } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.user);

  const columns: GridColDef[] = [
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
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Link to={`/order/${params.row.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6366f1' }}>
          <LaunchIcon />
        </Link>
      ),
    },
  ];

  interface OrderRow {
    id: string;
    status: string;
    itemsQty: number;
    amount: number;
  }

  const rows: OrderRow[] = [];

  myOrders &&
    myOrders.forEach((order) => {
      rows.push({
        id: order._id,
        status: order.orderStatus,
        itemsQty: order.orderItems?.length || 0,
        amount: order.totalPrice,
      });
    });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    dispatch(getMyOrders());
  }, [dispatch, error]);

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
            pageSizeOptions={[10]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            className="myOrdersTable"
            autoHeight
          />
        </div>
      )}
    </Fragment>
  );
};

export default MyOrders;
