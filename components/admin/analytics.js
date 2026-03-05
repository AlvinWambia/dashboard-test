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

const Dashboard = () => {
    return (
        <div className="p-8 bg-gray-50 min-h-screen text-slate-900">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total visitors" value="4,582" change="+ 9.8%" trend="up" icon={<Users size={20} />} />
                <StatCard title="Pageviews" value="15,743" change="+ 5.9%" trend="up" icon={<Eye size={20} />} />
                <StatCard title="Bounce rate" value="47.8%" change="- 2.1%" trend="down" icon={<LogOut size={20} />} />
                <StatCard title="Conversion Rate" value="5.2%" change="- 1.4%" trend="down" icon={<Percent size={20} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Traffic Overview */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 ">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-gray-500 font-medium">Traffic overview</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-3xl font-bold">25,821</span>
                                <span className="text-green-500 text-sm font-medium flex items-center">
                                    <TrendingUp size={14} className="mr-1" /> 15%
                                </span>
                            </div>
                        </div>
                        <Select>
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Period</SelectLabel>
                                    <SelectItem value="Last 7 days">Apple</SelectItem>
                                    <SelectItem value="Last 2 weeks">Last 2 weeks</SelectItem>
                                    <SelectItem value="Last 1 month">Last 1 month</SelectItem>
                                </SelectGroup>
                                <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel>Months</SelectLabel>
                                    <SelectItem value="Last 3 months">Last 3 months</SelectItem>
                                    <SelectItem value="Last 6 months">Last 6 months</SelectItem>
                                    <SelectItem value="Last 12 months">Last 12 months</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="h-[300px]">
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>

                {/* Peak Hours Heatmap */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 ">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-500 font-medium">Peak hours</h3>
                        <Select>
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Period</SelectLabel>
                                    <SelectItem value="Last 7 days">Apple</SelectItem>
                                    <SelectItem value="Last 2 weeks">Last 2 weeks</SelectItem>
                                    <SelectItem value="Last 1 month">Last 1 month</SelectItem>
                                </SelectGroup>
                                <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel>Months</SelectLabel>
                                    <SelectItem value="Last 3 months">Last 3 months</SelectItem>
                                    <SelectItem value="Last 6 months">Last 6 months</SelectItem>
                                    <SelectItem value="Last 12 months">Last 12 months</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mb-6">
                        <span className="text-3xl font-bold">4,231</span>
                        <p className="text-gray-400 text-sm">visitors in peak hour</p>
                    </div>
                    <Heatmap />
                </div>
            </div>
        </div>
    );
};

// --- Subcomponents ---

const StatCard = ({ title, value, change, trend, icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 ">
        <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center text-black mb-4">
            {icon}
        </div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <h2 className="text-2xl font-bold mb-2">{value}</h2>
        <p className={`text-xs font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-400'}`}>
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
            min: 0, max: 8000,
            ticks: { stepSize: 2000, callback: (v) => v === 0 ? 0 : v / 1000 + 'k' },
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