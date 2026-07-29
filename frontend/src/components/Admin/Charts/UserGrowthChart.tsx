import React from 'react';
import { Line } from 'react-chartjs-2';

interface UserGrowthChartProps {
  data: any;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
  return <Line data={data} />;
};

export default UserGrowthChart;
