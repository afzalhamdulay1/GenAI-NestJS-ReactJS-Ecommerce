import React from 'react';
import { Doughnut } from 'react-chartjs-2';

interface DoughnutChartProps {
  data: any;
}

const OrderStatusChart: React.FC<DoughnutChartProps> = ({ data }) => {
  return <Doughnut data={data} />;
};

export default OrderStatusChart;
