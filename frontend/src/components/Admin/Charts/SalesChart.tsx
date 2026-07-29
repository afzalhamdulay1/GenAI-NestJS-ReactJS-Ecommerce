import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  earningsByDay: Record<string, number>;
}

const SalesChart: React.FC<SalesChartProps> = ({ earningsByDay }) => {
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

  return <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />;
};

export default SalesChart;
