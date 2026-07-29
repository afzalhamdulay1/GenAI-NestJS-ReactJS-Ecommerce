import { Product, Order, User } from '@/types';

export const useDashboardStats = (
  products: Product[] | null,
  orders: Order[] | null,
  users: User[] | null
) => {
  let outOfStock = 0;
  let inStock = 0;

  if (products) {
    products.forEach((item) => {
      const stockVal = item.stock || 0;
      if (stockVal === 0) {
        outOfStock += 1;
      } else {
        inStock += 1;
      }
    });
  }

  let totalAmount = 0;
  const earningsByDay: Record<string, number> = {};
  const orderStatusCounts: Record<string, number> = {
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
  };

  if (orders) {
    orders.forEach((item) => {
      totalAmount += item.totalPrice;
      const date = new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      earningsByDay[date] = (earningsByDay[date] || 0) + item.totalPrice;
      if (orderStatusCounts[item.orderStatus] !== undefined) {
        orderStatusCounts[item.orderStatus] += 1;
      }
    });
  }

  const categoryCounts: Record<string, number> = {};
  if (products) {
    products.forEach((item) => {
      categoryCounts[item.category] =
        (categoryCounts[item.category] || 0) + 1;
    });
  }

  const productSales: Record<string, number> = {};
  if (orders) {
    orders.forEach((order) => {
      order.orderItems?.forEach((item) => {
        const name = item.name;
        if (name) {
            productSales[name] = (productSales[name] || 0) + item.quantity;
        }
      });
    });
  }

  const sortedProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topProductsChartData = {
    labels: sortedProducts.map(([name]) => name),
    datasets: [
      {
        label: 'Units Sold',
        data: sortedProducts.map(([, qty]) => qty),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const userGrowthMap: Record<string, number> = {};
  if (users) {
    users.forEach((u) => {
      if (u.createdAt) {
        const date = new Date(u.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        userGrowthMap[date] = (userGrowthMap[date] || 0) + 1;
      }
    });
  }

  const sortedUserDates = Object.keys(userGrowthMap).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const usersChartData = {
    labels: sortedUserDates.slice(-7),
    datasets: [
      {
        label: 'New Registrations',
        data: sortedUserDates.slice(-7).map((date) => userGrowthMap[date]),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const avgOrderValue =
    orders && orders.length > 0 ? (totalAmount / orders.length).toFixed(2) : '0';
  const outOfStockRate =
    products && products.length > 0
      ? ((outOfStock / products.length) * 100).toFixed(1)
      : '0';

  const recentOrders = orders ? [...orders].reverse().slice(0, 5) : [];

  const topRatedProducts = products
    ? [...products].sort((a, b) => b.ratings - a.ratings).slice(0, 5)
    : [];

  const revenueByCategory: Record<string, number> = {};
  if (orders && products) {
    orders.forEach((order) => {
      order.orderItems?.forEach((item) => {
        const pId = item.productId || item.product;
        const product = products.find((p) => p._id === pId);
        const category = product ? product.category : 'Others';
        revenueByCategory[category] =
          (revenueByCategory[category] || 0) + item.price * item.quantity;
      });
    });
  }

  const revByCatChartData = {
    labels: Object.keys(revenueByCategory),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: Object.values(revenueByCategory),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const orderStatusData = {
    labels: Object.keys(orderStatusCounts),
    datasets: [
      {
        data: Object.values(orderStatusCounts),
        backgroundColor: [
          'rgba(255, 159, 64, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Products per Category',
        data: Object.values(categoryCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(79, 70, 229, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(79, 70, 229, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return {
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
  };
};
