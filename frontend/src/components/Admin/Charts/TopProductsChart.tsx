import React from 'react';
import { Line } from 'react-chartjs-2';

interface TopProductsChartProps {
  data: any;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  return (
    <Line
      data={data}
      options={{ indexAxis: 'y' as const, responsive: true }}
    />
  );
};

export default TopProductsChart;
