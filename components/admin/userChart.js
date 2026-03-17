"use client";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the elements Chart.js needs
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function UserChart({ chartData }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#f0fdf4',
                titleColor: '#166534',
                bodyColor: '#166534',
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.raw} users`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#9CA3AF' },
            },
            y: {
                display: false, // Hide Y axis as seen in your reference
                beginAtZero: true,
            },
        },
        elements: {
            bar: {
                borderRadius: 20, // This gives the pill shape
                borderSkipped: false,
            },
        },
    };

    const data = {
        labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        datasets: [
            {
                data: chartData, // Array of numbers e.g., [40, 60, 45, 90, 50, 40, 60]
                backgroundColor: (context) => {
                    const value = context.raw;
                    return value > 70 ? '#14532d' : '#86efac'; // Dark green for peaks
                },
            },
        ],
    };

    return (
        <div className="h-[150px] w-full">
            <Bar options={options} data={data} />
        </div>
    );
}