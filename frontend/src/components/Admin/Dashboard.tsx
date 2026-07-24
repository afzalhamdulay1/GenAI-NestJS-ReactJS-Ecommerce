import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Dashboard.css";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Doughnut, Line } from "react-chartjs-2";
import { getAdminProducts } from "../../features/products/productsSlice";
import { getAllOrders } from "../../features/order/orderSlice";
import { getAllUsers } from "../../features/user/userSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import MetaData from "../Layout/MetaData";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TimelineIcon from "@mui/icons-material/Timeline";
import StarIcon from "@mui/icons-material/Star";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const { products } = useAppSelector((state) => state.products);
  const { orders } = useAppSelector((state) => state.order);
  const { users } = useAppSelector((state) => state.user);

  let outOfStock = 0;
  let inStock = 0;

  products &&
    products.forEach((item) => {
      const stockVal = item.Stock ?? (item as any).stock ?? 0;
      if (stockVal === 0) {
        outOfStock += 1;
      } else {
        inStock += 1;
      }
    });

  useEffect(() => {
    dispatch(getAdminProducts({}));
    dispatch(getAllOrders());
    dispatch(getAllUsers());
  }, [dispatch]);

  let totalAmount = 0;
  const earningsByDay: Record<string, number> = {};
  const orderStatusCounts: Record<string, number> = {
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
  };

  orders &&
    orders.forEach((item) => {
      totalAmount += item.totalPrice;
      const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      earningsByDay[date] = (earningsByDay[date] || 0) + item.totalPrice;
      if (orderStatusCounts[item.orderStatus] !== undefined) {
        orderStatusCounts[item.orderStatus] += 1;
      }
    });

  const categoryCounts: Record<string, number> = {};
  products && products.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const productSales: Record<string, number> = {};
  orders && orders.forEach(order => {
    order.orderItems?.forEach(item => {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
    });
  });

  const sortedProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topProductsChartData = {
    labels: sortedProducts.map(([name]) => name),
    datasets: [
      {
        label: "Units Sold",
        data: sortedProducts.map(([, qty]) => qty),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
      },
    ],
  };

  const userGrowthMap: Record<string, number> = {};
  users && users.forEach(u => {
    if (u.createdAt) {
      const date = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      userGrowthMap[date] = (userGrowthMap[date] || 0) + 1;
    }
  });

  const sortedUserDates = Object.keys(userGrowthMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const usersChartData = {
    labels: sortedUserDates.slice(-7),
    datasets: [
      {
        label: "New Registrations",
        data: sortedUserDates.slice(-7).map(date => userGrowthMap[date]),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const avgOrderValue = orders?.length > 0 ? (totalAmount / orders.length).toFixed(2) : "0";
  const outOfStockRate = products?.length > 0 ? ((outOfStock / products.length) * 100).toFixed(1) : "0";

  const recentOrders = orders ? orders.slice(-5).reverse() : [];
  
  const columns: GridColDef[] = [
    { field: "id", headerName: "Order ID", minWidth: 200, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.5,
      cellClassName: (params) => {
        return params.row.status === "Delivered" ? "greenColor" : "redColor";
      },
    },
    { field: "itemsQty", headerName: "Items Qty", type: "number", minWidth: 100, flex: 0.3 },
    { field: "amount", headerName: "Amount", type: "number", minWidth: 150, flex: 0.5 },
  ];

  const rows: any[] = [];
  recentOrders.forEach((item) => {
    rows.push({
      id: item._id,
      itemsQty: item.orderItems?.length || 0,
      amount: `₹${item.totalPrice}`,
      status: item.orderStatus,
    });
  });

  const topRatedProducts = products ? [...products].sort((a, b) => b.ratings - a.ratings).slice(0, 5) : [];

  const revenueByCategory: Record<string, number> = {};
  orders && orders.forEach(order => {
    order.orderItems?.forEach(item => {
      const pId = item.productId || item.product;
      const product = products.find(p => p._id === pId);
      const category = product ? product.category : "Others";
      revenueByCategory[category] = (revenueByCategory[category] || 0) + (item.price * item.quantity);
    });
  });

  const revByCatChartData = {
    labels: Object.keys(revenueByCategory),
    datasets: [
      {
        label: "Revenue (₹)",
        data: Object.values(revenueByCategory),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const revenueChartData = {
    labels: Object.keys(earningsByDay).slice(-7),
    datasets: [
      {
        label: "Revenue (₹)",
        data: Object.values(earningsByDay).slice(-7),
        borderColor: "rgb(79, 70, 229)",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(79, 70, 229)",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
      },
    ],
  };

  const orderStatusData = {
    labels: Object.keys(orderStatusCounts),
    datasets: [
      {
        data: Object.values(orderStatusCounts),
        backgroundColor: [
          "rgba(255, 159, 64, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const stockChartData = {
    labels: ["Out of Stock", "In Stock"],
    datasets: [
      {
        backgroundColor: ["#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
        data: [outOfStock, inStock],
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: "Products per Category",
        data: Object.values(categoryCounts),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(79, 70, 229, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(79, 70, 229, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard">
      <MetaData title="Dashboard - Admin Panel" />
      <Sidebar />

      <div className="dashboardContainer">
        <div className="dashboardHeader">
          <Typography component="h1">Admin Dashboard</Typography>
          <div className="dashboardDate">
            <TimelineIcon /> Overview of your store
          </div>
        </div>

        <div className="dashboardSummary">
          <div className="totalRevenueBox">
            <div className="boxIcon">
              <TrendingUpIcon />
            </div>
            <div className="boxContent">
              <p>Total Revenue</p>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="dashboardSummaryBox2">
            <Link to="/admin/products" className="summaryBox">
              <InventoryIcon className="boxIcon" />
              <div className="boxContent">
                <p>Products</p>
                <span>{products && products.length}</span>
              </div>
            </Link>
            <Link to="/admin/orders" className="summaryBox">
              <ShoppingBagIcon className="boxIcon" />
              <div className="boxContent">
                <p>Orders</p>
                <span>{orders && orders.length}</span>
              </div>
            </Link>
            <Link to="/admin/users" className="summaryBox">
              <GroupIcon className="boxIcon" />
              <div className="boxContent">
                <p>Users</p>
                <span>{users && users.length}</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="dashboardCharts">
          <div className="chartGrid2">
            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">Top Selling Products</Typography>
                <p>Most popular items by units sold</p>
              </div>
              <div className="barChart">
                 <Line data={topProductsChartData} options={{ indexAxis: 'y' as const, responsive: true }} />
              </div>
            </div>

            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">User Growth</Typography>
                <p>New registrations trend</p>
              </div>
              <div className="lineChart mini">
                <Line data={usersChartData} />
              </div>
            </div>
          </div>

          <div className="statsGrid">
            <div className="statCard">
              <p>Avg. Order Value</p>
              <h3>₹{avgOrderValue}</h3>
            </div>
            <div className="statCard">
              <p>Out of Stock Rate</p>
              <h3>{outOfStockRate}%</h3>
            </div>
            <div className="statCard">
              <p>Active Users</p>
              <h3>{users?.length}</h3>
            </div>
          </div>

          <div className="chartSection fullWidth">
            <div className="chartHeader">
              <Typography variant="h6">Revenue Trend</Typography>
              <p>Sales performance over time</p>
            </div>
            <div className="lineChart">
              <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="chartGrid">
            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">Order Status</Typography>
                <p>Current distribution of orders</p>
              </div>
              <div className="doughnutChart">
                <Doughnut data={orderStatusData} />
              </div>
            </div>

            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">Inventory Status</Typography>
                <p>Stock availability overview</p>
              </div>
              <div className="doughnutChart">
                <Doughnut data={stockChartData} />
              </div>
            </div>

            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">Category Distribution</Typography>
                <p>Products count by category</p>
              </div>
              <div className="barChart">
                <Doughnut data={categoryChartData} />
              </div>
            </div>
          </div>

          <div className="chartGrid2 last">
            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">Revenue By Category</Typography>
                <p>Financial performance per category</p>
              </div>
              <div className="doughnutChart">
                <Doughnut data={revByCatChartData} />
              </div>
            </div>

            <div className="chartSection">
                <div className="chartHeader">
                    <Typography variant="h6">Order Efficiency</Typography>
                    <p>Delivered vs Total Orders</p>
                </div>
                <div className="orderStatsBox">
                    <div className="orderStatItem">
                        <span>Success Rate</span>
                        <h2>{(((orderStatusCounts.Delivered || 0) / (orders?.length || 1)) * 100).toFixed(1)}%</h2>
                        <div className="progressBar">
                            <div className="progress" style={{ width: `${((orderStatusCounts.Delivered || 0) / (orders?.length || 1)) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="dashboardGrid3">
            <div className="recentOrders">
              <div className="chartHeader">
                <Typography variant="h6">Recent Orders</Typography>
                <p>Latest transactions across the store</p>
              </div>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[5]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                disableRowSelectionOnClick
                className="myOrdersTable"
                autoHeight
              />
            </div>

            <div className="topRatedSection">
              <div className="chartHeader">
                <Typography variant="h6">Top Rated Products</Typography>
                <p>Best performing items by ratings</p>
              </div>
              <div className="ratedList">
                {topRatedProducts.map(prod => (
                  <div className="ratedItem" key={prod._id}>
                    <img src={prod.images && prod.images[0] ? prod.images[0].url : ''} alt={prod.name} />
                    <div className="itemInfo">
                      <p>{prod.name}</p>
                      <div className="rating">
                        <StarIcon /> <span>{prod.ratings} ({prod.numOfReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
