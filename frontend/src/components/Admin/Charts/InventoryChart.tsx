import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface InventoryChartProps {
  outOfStock: number;
  inStock: number;
}

const InventoryChart: React.FC<InventoryChartProps> = ({ outOfStock, inStock }) => {
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

  return <Doughnut data={stockChartData} />;
};

export default InventoryChart;
