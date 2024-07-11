
import { ChartDataProps } from '@/types';
import {
  ArcElement,
  Chart,
  Tooltip
} from 'chart.js';

import { Pie } from 'react-chartjs-2';

Chart.register(ArcElement, Tooltip);


export default function PieChartComponent({ labels, datasets }: ChartDataProps) {
    const dataConfig = {
        labels: labels,
        datasets: datasets
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                // Optional: Customize tooltips if needed
            },
        },
    };

    return (
        <div className="chart-container" style={{ position: 'relative', height: '500px' }}>
            <Pie data={dataConfig} options={options} />
        </div>
    );
}
