import { BarElement, LinearScale, CategoryScale,  Chart, PointElement, LineElement } from 'chart.js';
import React from 'react';
import { Bar, Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement);

interface ChartDataProps {
    labels: string[];
    dataset1Data: number[];
    dataset2Data: number[];
  }

export default function LineChartComponent({ labels, dataset1Data, dataset2Data } : ChartDataProps){
    const dataConfig = {
        labels: labels,
        datasets: [
          {
            label: 'Dataset 1',
            backgroundColor: 'rgba(75, 192, 192, 1)',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 2,
            data: dataset1Data,
          },
          {
            label: 'Dataset 2',
            backgroundColor: 'rgba(255, 99, 132, 1)',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 2,
            data: dataset2Data,
          },
        ],
      };

  const options = {
    scales: {
        y: {
          beginAtZero: true
        }
      }
  };

  return (
    <div>
      <Line data={dataConfig} options={options} />
    </div>
  );
};
