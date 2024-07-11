import { ChartDataProps, Purchase, Transaction } from '@/types';
import {
  BarElement,
  LinearScale,
  CategoryScale,
  Chart,
  PointElement,
  LineElement,
  Tooltip,
  TooltipItem
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import { eachDayOfInterval, parseISO, format } from 'date-fns';
import { formatRupiah } from '@/utils/Utils';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip);


export default function BarChartComponent({ labels, datasets }: ChartDataProps) {

    const dataConfig = {
        labels: labels,
        datasets: datasets
    };

    const options = {
        scales: {
        y: {
            beginAtZero: true,
        },
        },
        plugins: {
        //   tooltip: {
        //     callbacks: {
        //       label: (tooltipItem: any) => {
        //         const date = dateRange[tooltipItem.dataIndex];
        //         const transactionsOnDate = transactions.filter(
        //           transaction => format(transaction.transaction_date, 'dd MMMM yyyy') === date
        //         );
        //         const transactionDetails = transactionsOnDate.map(transaction =>
        //           `Date: ${format(transaction.transaction_date, 'dd MMMM yyyy')}\nTotal Payment: ${formatRupiah(transaction.total_payment)}\n`
        //         ).join('\n');

        //         return transactionDetails || 'No data';
        //       },
        //     },
        //   },
        },
    };

    return (
        <div>
        <Bar data={dataConfig} options={options} />
        </div>
    );
};
