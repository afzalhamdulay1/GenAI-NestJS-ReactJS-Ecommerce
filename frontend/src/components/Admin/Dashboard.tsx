import React, { useEffect } from "react";
import Sidebar from "@/components/Admin/Sidebar";
import "@/components/Admin/Dashboard.css";
import { Typography } from "@mui/material";
import SummaryCard from "@/components/Admin/Widgets/SummaryCard";
import SalesChart from "@/components/Admin/Charts/SalesChart";
import InventoryChart from "@/components/Admin/Charts/InventoryChart";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import MetaData from "@/components/Layout/MetaData";

import { getAdminProducts } from "@/features/products/productsSlice";
import { getAllOrders } from "@/features/order/orderSlice";
import { getAllUsers } from "@/features/user/userSlice";

import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TimelineIcon from "@mui/icons-material/Timeline";

import { useDashboardStats } from "@/components/Admin/hooks/useDashboardStats";
import TopProductsChart from "@/components/Admin/Charts/TopProductsChart";
import UserGrowthChart from "@/components/Admin/Charts/UserGrowthChart";
import OrderStatusChart from "@/components/Admin/Charts/OrderStatusChart";
import CategoryDistributionChart from "@/components/Admin/Charts/CategoryDistributionChart";
import RevenueByCategoryChart from "@/components/Admin/Charts/RevenueByCategoryChart";
import RecentOrdersTable from "@/components/Admin/Widgets/RecentOrdersTable";
import TopRatedProductsList from "@/components/Admin/Widgets/TopRatedProductsList";

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

import AIExecutiveBriefCard from "@/components/Admin/Widgets/AIExecutiveBriefCard";
import { io } from "socket.io-client";
import confetti from "canvas-confetti";
import { toast } from "react-toastify";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const { products } = useAppSelector((state) => state.products);
  const { orders } = useAppSelector((state) => state.order);
  const { users } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAdminProducts());
    dispatch(getAllOrders());
    dispatch(getAllUsers());

    // Connect to Backend WebSocket Gateway
    const backendUrl = window.location.hostname === "localhost" ? "http://localhost:4000" : window.location.origin;
    const socket = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("⚡ Admin Dashboard connected to Real-Time WebSockets");
    });

    socket.on("new_order", (data: any) => {
      console.log("🎉 Real-Time Order Event Received:", data);

      // 1. Confetti Burst Animation 🎊
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"],
      });

      // 2. Interactive Toast Alert 🔔
      toast.success(
        `🎉 Live Order Received! #${String(data.orderId).slice(-6)} by ${data.customerName} for $${Number(data.totalPrice).toFixed(2)}`,
        {
          autoClose: 8000,
          position: "top-right",
        }
      );

      // 3. Dynamic Stats Refetch (Real-Time update without page reload) 📊
      dispatch(getAllOrders());
      dispatch(getAdminProducts());
    });

    socket.on("new_support_request", (data: { customerName: string; sessionId: string }) => {
      toast.warn(`💬 New Live Support Request from ${data.customerName}! Go to Live Support Chat to respond.`, {
        autoClose: 10000,
        position: "top-right",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const {
    outOfStock,
    inStock,
    totalAmount,
    earningsByDay,
    orderStatusCounts,
    avgOrderValue,
    outOfStockRate,
    recentOrders,
    topRatedProducts,
    topProductsChartData,
    usersChartData,
    revByCatChartData,
    orderStatusData,
    categoryChartData,
  } = useDashboardStats(products, orders, users);

  const lowStockCount = products ? products.filter((p) => p.stock <= 5 && p.stock > 0).length : 0;

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

        {/* ✨ AI Executive Store Intelligence Brief */}
        <AIExecutiveBriefCard />

        <div className="dashboardSummary">
          <SummaryCard 
            title="Total Revenue" 
            value={`₹${totalAmount.toLocaleString()}`} 
            icon={<TrendingUpIcon />} 
            className="totalRevenueBox" 
          />

          <div className="dashboardSummaryBox2">
            <SummaryCard 
              title="Products" 
              value={products?.length || 0} 
              icon={<InventoryIcon />} 
              to="/admin/products" 
            />
            <SummaryCard 
              title="Orders" 
              value={orders?.length || 0} 
              icon={<ShoppingBagIcon />} 
              to="/admin/orders" 
            />
            <SummaryCard 
              title="Users" 
              value={users?.length || 0} 
              icon={<GroupIcon />} 
              to="/admin/users" 
            />
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
                 <TopProductsChart data={topProductsChartData} />
              </div>
            </div>

            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">User Growth</Typography>
                <p>New registrations trend</p>
              </div>
              <div className="lineChart mini">
                <UserGrowthChart data={usersChartData} />
              </div>
            </div>
          </div>

          <div className="statsGrid">
            <div className="statCard">
              <p>Avg. Order Value</p>
              <h3>₹{avgOrderValue}</h3>
            </div>
            <div className="statCard" style={{ borderLeft: '4px solid #f59e0b' }}>
              <p>Low Stock Alerts (≤5)</p>
              <h3 style={{ color: '#d97706' }}>{lowStockCount}</h3>
            </div>
            <div className="statCard">
              <p>Out of Stock Rate</p>
              <h3>{outOfStockRate}%</h3>
            </div>
            <div className="statCard">
              <p>Active Users</p>
              <h3>{users?.length || 0}</h3>
            </div>
          </div>

          <div className="chartSection fullWidth">
            <div className="chartHeader">
              <Typography variant="h6">Revenue Trend</Typography>
              <p>Sales performance over time</p>
            </div>
            <div className="lineChart">
              <SalesChart earningsByDay={earningsByDay} />
            </div>
          </div>

          <div className="chartGrid">
            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">Order Status</Typography>
                <p>Current distribution of orders</p>
              </div>
              <div className="doughnutChart">
                <OrderStatusChart data={orderStatusData} />
              </div>
            </div>

            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">Inventory Status</Typography>
                <p>Stock availability overview</p>
              </div>
              <div className="doughnutChart">
                <InventoryChart outOfStock={outOfStock} inStock={inStock} />
              </div>
            </div>

            <div className="chartSection">
              <div className="chartHeader">
                <Typography variant="h6">Category Distribution</Typography>
                <p>Products count by category</p>
              </div>
              <div className="barChart">
                <CategoryDistributionChart data={categoryChartData} />
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
                <RevenueByCategoryChart data={revByCatChartData} />
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
              <RecentOrdersTable rows={recentOrders.map(item => ({
                id: item._id,
                itemsQty: item.orderItems?.length || 0,
                amount: `₹${item.totalPrice}`,
                status: item.orderStatus,
              }))} />
            </div>

            <div className="topRatedSection">
              <div className="chartHeader">
                <Typography variant="h6">Top Rated Products</Typography>
                <p>Best performing items by ratings</p>
              </div>
              <TopRatedProductsList products={topRatedProducts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
