import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ data, xKey = 'Week', yKey = 'Achievement' }) => {
    const chartData = {
        labels: data.map(item => item[xKey]),
        datasets: [
            {
                label: yKey,
                data: data.map(item => item[yKey]),
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: { display: false }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return <Line data={chartData} options={options} />;
};

export default LineChart;
