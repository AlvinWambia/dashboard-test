"use client";

import React from 'react';
import {
    Percent, ArrowUpRight, ArrowDownRight, ShoppingCart, DollarSign, Trophy
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
        revenueChange = 0,
        ordersChange = 0,
        avgOrderValueChange = 0,
        programStats = [],
        revenueTrend = []
    } = data || {};

    const chartData = {
        labels: revenueTrend.map(t => t.date),
        datasets: [{
            data: revenueTrend.map(t => t.revenue),
            borderColor: '#6366f1',
            borderWidth: 4,
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
        }]
    };

    return (
        <div className="space-y-6 text-slate-900">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Revenue" value={`KES ${totalRevenue.toLocaleString()}`} change={revenueChange} icon={<DollarSign size={20} />} />
                <StatCard title="Total Orders" value={totalOrders.toLocaleString()} change={ordersChange} icon={<ShoppingCart size={20} />} />
                <StatCard title="Avg Order Value" value={`KES ${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change={avgOrderValueChange} icon={<Percent size={20} />} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Revenue Trend — 3/5 width */}
                <div className="lg:col-span-3 bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Revenue Trend</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">KES {totalRevenue.toLocaleString()}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wider mt-1">
                            Last 7 days
                        </span>
                    </div>
                    <div className="h-[220px] lg:h-[260px] mt-5">
                        <Line data={chartData} options={lineOptions} />
                    </div>
                </div>

                {/* Program Performance — 2/5 width */}
                <ProgramPerformance programStats={programStats} totalRevenue={totalRevenue} />
            </div>
        </div>
    );
};

// Rank color palette for top 5
const RANK_PALETTE = [
    { bar: '#111827', badge: 'bg-gray-900 text-white',    border: 'border-gray-900' },
    { bar: '#374151', badge: 'bg-gray-700 text-white',    border: 'border-gray-700' },
    { bar: '#6B7280', badge: 'bg-gray-500 text-white',    border: 'border-gray-400' },
    { bar: '#9CA3AF', badge: 'bg-gray-400 text-white',    border: 'border-gray-300' },
    { bar: '#D1D5DB', badge: 'bg-gray-200 text-gray-600', border: 'border-gray-200' },
];

const ProgramPerformance = ({ programStats, totalRevenue }) => {
    const top5 = programStats.slice(0, 5);
    const maxRevenue = top5[0]?.revenue || 1;

    return (
        <div className="lg:col-span-2 bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Program Performance</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Top {top5.length} programs · last 30 days
                    </p>
                </div>
                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                    <Trophy size={15} />
                </div>
            </div>

            {top5.length > 0 ? (
                <div className="flex flex-col gap-4 flex-1">
                    {top5.map((program, idx) => {
                        const palette = RANK_PALETTE[idx] || RANK_PALETTE[RANK_PALETTE.length - 1];
                        // Bar width relative to #1 program (not total) for clear visual differentiation
                        const barPct = Math.round((program.revenue / maxRevenue) * 100);
                        const revPct = totalRevenue > 0
                            ? ((program.revenue / totalRevenue) * 100).toFixed(1)
                            : '0.0';

                        return (
                            <div key={idx} className="flex flex-col gap-1.5">
                                {/* Name row */}
                                <div className="flex items-center gap-2">
                                    <span className={`shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold border ${palette.badge} ${palette.border}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1 text-[13px] font-semibold text-gray-800 truncate" title={program.name}>
                                        {program.name}
                                    </span>
                                    <span className="shrink-0 text-[10px] font-bold text-gray-500 tabular-nums">
                                        {revPct}%
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-gray-100 rounded-full h-[7px] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${barPct}%`, backgroundColor: palette.bar }}
                                    />
                                </div>

                                {/* Revenue + sales */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-gray-600">
                                        KES {program.revenue.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {program.count} sale{program.count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-8 gap-3 text-center">
                    <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Trophy size={20} className="text-gray-300" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-600">No sales yet</p>
                        <p className="text-xs text-gray-400 mt-1 leading-snug">
                            Program rankings will appear<br />once sales come in.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, change, icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600">{icon}</div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${change >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(change).toFixed(1)}%
            </div>
        </div>
        <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
            <h2 className="text-2xl font-bold mt-1 text-gray-900">{value}</h2>
        </div>
    </div>
);

const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8 } },
    scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 11 } } }
    }
};

export default Dashboard;