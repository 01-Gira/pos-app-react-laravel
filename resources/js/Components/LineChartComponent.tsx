import { ChartDataProps, Purchase, Transaction, TransactionDetail } from '@/types';
import { formatRupiah } from '@/utils/Utils';
import {

BarElement,
LinearScale,
CategoryScale,
Chart,
PointElement,
LineElement,
TooltipItem
} from 'chart.js';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function LineChartComponent({ labels, datasets  } : ChartDataProps){

    const dataConfig = {
        labels: labels,
        datasets: datasets
    };

    const options = {
        scales: {
            y: {
            beginAtZero: true
            }
        },
        plugins: {

        },
    };

    return (
        <div>
        <Line data={dataConfig} options={options} />
        </div>
    );
};
