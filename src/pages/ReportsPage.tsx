import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBanner } from '../components/ui/DemoBanner';
import { demoReportsData } from '../services/demoData';

function AreaChartWrapper({ data, isEn }: { data: any[]; isEn: boolean }) {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
      <YAxis tick={{ fontSize: 10 }} />
      <Tooltip
        formatter={(val) => [`${val} ${isEn ? 'chats' : 'محادثة'}`, isEn ? 'Count' : 'العدد']}
        contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
      />
      <Line
        type="monotone"
        dataKey="count"
        stroke="#2563eb"
        strokeWidth={2.5}
        dot={{ r: 3, fill: '#2563eb' }}
      />
    </LineChart>
  );
}

export default function ReportsPage() {
  const { isDemo, language, t } = useApp();
  const isEn = language === 'en';
  const [dateRange, setDateRange] = useState('14d');
  const data = demoReportsData;

  const dateRanges = [
    { label: isEn ? 'Last 7 Days' : 'آخر 7 أيام', value: '7d' },
    { label: isEn ? 'Last 14 Days' : 'آخر 14 يوم', value: '14d' },
    { label: isEn ? 'Last 30 Days' : 'آخر 30 يوم', value: '30d' },
  ];

  const volumeData = data.conversationVolume.slice(
    dateRange === '7d' ? -7 : dateRange === '14d' ? -14 : -30
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('reportsTitle')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('reportsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DemoBanner />
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {dateRanges.map((r) => (
              <button
                key={r.value}
                id={`date-range-${r.value}`}
                onClick={() => setDateRange(r.value)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  dateRange === r.value
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: isEn ? 'Total Conversations' : 'إجمالي المحادثات',
            value: volumeData.reduce((a, b) => a + b.count, 0),
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
          },
          {
            label: isEn ? 'Resolution Rate' : 'معدل الحل',
            value: `${data.resolutionRate}%`,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/30',
          },
          {
            label: isEn ? 'Escalation Rate' : 'معدل التصعيد',
            value: `${data.escalationRate}%`,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/30',
          },
          {
            label: isEn ? 'Top Category' : 'أكثر فئة',
            value: isEn ? data.categoryDistribution[0]?.category || '—' : data.categoryDistribution[0]?.categoryAr || '—',
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/30',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="card text-center">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mx-auto mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Conversation volume chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            {isEn ? 'Conversation Volume' : 'حجم المحادثات'}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{isEn ? 'Daily' : 'يومي'}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChartWrapper data={volumeData} isEn={isEn} />
        </ResponsiveContainer>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category distribution */}
        <div className="card">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">
            {isEn ? 'Category Distribution' : 'توزيع الفئات'}
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.categoryDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey={isEn ? 'category' : 'categoryAr'}
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip
                formatter={(value) => [`${value} ${isEn ? 'chats' : 'محادثة'}`, isEn ? 'Count' : 'العدد']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket status pie */}
        <div className="card">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">
            {isEn ? 'Ticket Status Breakdown' : 'حالة التذاكر'}
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.ticketStatusDistribution}
                cx="50%"
                cy="45%"
                outerRadius={90}
                dataKey="count"
                label={({ status, statusAr, count }) => `${isEn ? status : statusAr}: ${count}`}
                labelLine={false}
              >
                {data.ticketStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
