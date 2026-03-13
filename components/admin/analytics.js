"use client";

import React from 'react';
import {
    Users, Eye, LogOut, Percent,
    TrendingUp, TrendingDown
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
} from 'chart.js';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Filler
);

const Dashboard = ({ data }) => {
    const { 
        totalRevenue = 0, 
        totalOrders = 0, 
        avgOrderValue = 0, 
        programStats = [], 
        revenueTrend = [] 
    } = data || {};

    // Prepare chart data from revenueTrend
    const chartData = {
        labels: revenueTrend.map(t => t.date),
        datasets: [{
            data: revenueTrend.map(t => t.revenue),
            borderColor: '#000000',
            borderWidth: 3,
            fill: true,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#000000',
        }]
    };

    return (
        <div className="p-0 bg-transparent min-h-screen text-slate-900">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
                <StatCard 
                    title="Total Revenue" 
                    value={`KES ${totalRevenue.toLocaleString()}`} 
                    change="+12.5%" 
                    trend="up" 
                    icon={<TrendingUp size={20} />} 
                />
                <StatCard 
                    title="Total Orders" 
                    value={totalOrders.toString()} 
                    change="+8.2%" 
                    trend="up" 
                    icon={<Users size={20} />} 
                />
                <StatCard 
                    title="Avg Order Value" 
                    value={`KES ${avgOrderValue.toLocaleString()}`} 
                    change="+3.1%" 
                    trend="up" 
                    icon={<Percent size={20} />} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Revenue Overview */}
                <div className="lg:col-span-2 bg-white p-5 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-gray-500 font-medium text-sm lg:text-base">Revenue overview</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-2xl lg:text-3xl font-bold">KES {totalRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-wider">Last 7 Days</div>
                    </div>
                    <div className="h-[250px] lg:h-[300px]">
                        <Line data={chartData} options={lineOptions} />
                    </div>
                </div>

                {/* Program Leaderboard */}
                <div className="bg-white p-5 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 font-medium mb-6 text-sm lg:text-base">Program Performance</h3>
                    <div className="space-y-6">
                        {programStats.length > 0 ? programStats.slice(0, 5).map((program, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                                <div className="flex justify-between text-[11px] lg:text-xs font-bold text-gray-800 uppercase tracking-tight">
                                    <span className="truncate max-w-[150px]">{program.name}</span>
                                    <span>{program.count} sales</span>
                                </div>
                                <div className="w-full bg-gray-50 rounded-full h-1.5 lg:h-2">
                                    <div 
                                        className="bg-black h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${(program.revenue / totalRevenue) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-[9px] lg:text-[10px] text-gray-400 font-semibold">
                                    KES {program.revenue.toLocaleString()} REVENUE
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-sm">No sales data yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Subcomponents ---

const StatCard = ({ title, value, change, trend, icon }) => (
    <div className="bg-white p-5 lg:p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
        <div className="bg-gray-50 w-10 h-10 rounded-xl flex items-center justify-center text-black mb-4">
            {icon}
        </div>
        <p className="text-gray-500 text-xs lg:text-sm mb-1 font-medium">{title}</p>
        <h2 className="text-xl lg:text-2xl font-bold mb-2">{value}</h2>
        <p className={`text-[10px] lg:text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {change} <span className="text-gray-400 font-normal">from last month</span>
        </p>
    </div>
);

const Heatmap = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm'];

    // Dummy intensity logic
    const getIntensity = (h, d) => {
        if ((h === 3 && d >= 3) || (h === 4 && d === 4)) return 'bg-indigo-500'; // 3000+
        if (h >= 2 && h <= 5 && d >= 2) return 'bg-indigo-300'; // 1000-2000
        return 'bg-indigo-50'; // <1000
    };

    return (
        <div className="mt-4">
            <div className="flex justify-end gap-3 mb-4 text-[10px] text-gray-400">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-500" /> 3,000+</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-300" /> 1,000-2,000</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-50" /> &lt;1,000</div>
            </div>
            <div className="grid grid-cols-[30px_1fr] gap-2">
                <div className="flex flex-col justify-between text-[10px] text-gray-400 py-1">
                    {hours.map(h => <span key={h}>{h}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 49 }).map((_, i) => (
                        <div key={i} className={`h-6 rounded-sm ${getIntensity(Math.floor(i / 7), i % 7)}`} />
                    ))}
                    {days.map(d => <span key={d} className="text-[10px] text-gray-400 text-center mt-1">{d}</span>)}
                </div>
            </div>
        </div>
    );
};

// --- Chart Config ---

const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
            min: 0,
            ticks: { 
                callback: (v) => v === 0 ? '0' : (v >= 1000 ? (v / 1000 + 'k') : v) 
            },
            border: { display: false }
        }
    },
    elements: { line: { tension: 0.4 } }
};

const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        data: [0, 4200, 4800, 2800, 6000, 6200, 4500, 5800],
        borderColor: '#6366f1',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#6366f1',
    }]
};

export default Dashboard;