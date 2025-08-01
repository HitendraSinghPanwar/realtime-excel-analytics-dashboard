import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import {
  BarChart as ReBarChart,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
LabelList, 
} from 'recharts';

import CustomPieChart from './PieChart';
import BarChart from './BarChart';
import HorizontalBarChart from './HorizontalBarChart';

const socket = io('http://localhost:8000', { transports: ['websocket'] });

const LINE_COLORS = ['#5B8FF9', '#5AD8A6', '#FFC658', '#FF9F7F', '#6E7074', '#9270CA'];

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-xl shadow-lg transition-shadow hover:shadow-2xl w-full h-full">
    <h3 className="text-3xl font-semibold mb-4 text-gray-800 text-center">{title}</h3>
    <div className="h-[70vh]">{children}</div>
  </div>
);

const StatusDisplay = ({ message, isError = false }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div
      className={`p-8 rounded-lg shadow-md text-xl ${
        isError ? 'bg-red-100 text-red-600' : 'bg-white text-gray-700'
      }`}
    >
      {message}
    </div>
  </div>
);

const WeeklyWithTrend = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data.
      </div>
    );

  const { perWeek, recruiters, totalPerWeek } = useMemo(() => {
    const weekMap = {};
    const recruiterSet = new Set();

    data.forEach(item => {
      const week = item.Week;
      const recruiter = (item['Recruiter Name'] || '').trim();
      const count = item.Count || 0;
      if (!weekMap[week]) weekMap[week] = { Week: week };
      weekMap[week][recruiter] = (weekMap[week][recruiter] || 0) + count;
      recruiterSet.add(recruiter);
    });

    const weeks = Object.values(weekMap).sort((a, b) => {
      const na = parseInt(a.Week.replace(/\D/g, '')) || 0;
      const nb = parseInt(b.Week.replace(/\D/g, '')) || 0;
      return na - nb;
    });

    const totalArr = weeks.map(w => {
      const { Week, ...rest } = w;
      const sum = Object.values(rest).reduce((acc, v) => acc + (v || 0), 0);
      return { Week, total: sum };
    });

    const perWeekWithTotal = weeks.map(w => {
      const matching = totalArr.find(t => t.Week === w.Week);
      return { ...w, total: matching?.total || 0 };
    });

    return {
      perWeek: perWeekWithTotal,
      recruiters: Array.from(recruiterSet),
      totalPerWeek: totalArr,
    };
  }, [data]);

  if (!perWeek.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No valid weekly data.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={perWeek} margin={{ top: 20, right: 60, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Week" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip wrapperStyle={{ borderRadius: 8 }} contentStyle={{ fontSize: 13 }} />
        <Legend verticalAlign="top" height={36} />

        {/* Background total bar for context */}
        <Bar dataKey="total" name="Total (context)" barSize={20} fill="#E2E8F0" opacity={0.6} isAnimationActive={false}>
          <LabelList
            dataKey="total"
            position="top"
            formatter={val => (val ? val : '')}
            style={{
              fill: '#374151',
              fontWeight: 600,
              fontSize: 12,
              fontFamily: 'Segoe UI, system-ui, sans-serif',
            }}
          />
        </Bar>

        {/* One line per recruiter */}
        {recruiters.map((rec, idx) => (
          <Line
            key={rec}
            type="monotone"
            dataKey={rec}
            name={rec}
            stroke={LINE_COLORS[idx % LINE_COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
            isAnimationActive={true}
          >
            <LabelList
              dataKey={rec}
              position="top"
              formatter={(val, entry) => {
                const lastWeek = perWeek[perWeek.length - 1];
                if (entry && entry.Week === lastWeek.Week) {
                  return val;
                }
                return '';
              }}
              style={{
                fill: LINE_COLORS[idx % LINE_COLORS.length],
                fontWeight: 700,
                fontSize: 12,
                fontFamily: 'Segoe UI, system-ui, sans-serif',
              }}
            />
          </Line>
        ))}

        {/* Average total trend (dashed) */}
        <Line
          type="monotone"
          data={totalPerWeek}
          dataKey="total"
          name="Average Total"
          stroke="#111827"
          strokeDasharray="5 5"
          strokeWidth={2}
          dot={false}
          legendType="circle"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
const Monthly100PctWithTrend = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data.
      </div>
    );

  const { perMonth, recruiters, totalPerMonth } = useMemo(() => {
    const monthMap = {};
    const recruiterSet = new Set();

    data.forEach(item => {
      const rawMonth = item.Month;
      const recruiter = (item['Recruiter Name'] || '').trim();
      const count = Number(item.Count) || 0;
      if (!recruiter) return;

      const dt = new Date(`${rawMonth}T00:00:00`);
      if (isNaN(dt)) return;

      const label = `${dt.toLocaleString('default', { month: 'short' })} ${dt.getFullYear()}`;
      if (!monthMap[label]) monthMap[label] = { Month: label };
      monthMap[label][recruiter] = (monthMap[label][recruiter] || 0) + count;
      recruiterSet.add(recruiter);
    });

    const months = Object.values(monthMap).sort((a, b) => {
      const parseLabel = lbl => {
        const [mon, year] = lbl.split(' ');
        return new Date(`${mon} 1, ${year}`);
      };
      return parseLabel(a.Month) - parseLabel(b.Month);
    });

    const totalArr = months.map(m => {
      const { Month, ...rest } = m;
      const sum = Object.values(rest).reduce((acc, v) => acc + (v || 0), 0);
      return { Month, total: sum };
    });

    const perMonthWithTotal = months.map(m => {
      const matching = totalArr.find(t => t.Month === m.Month);
      return { ...m, total: matching?.total || 0 };
    });

    return {
      perMonth: perMonthWithTotal,
      recruiters: Array.from(recruiterSet),
      totalPerMonth: totalArr,
    };
  }, [data]);

  if (!perMonth.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No valid monthly data.
      </div>
    );
  }

  const latestMonth = perMonth[perMonth.length - 1]?.Month;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={perMonth}
        margin={{ top: 20, right: 60, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Month" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip wrapperStyle={{ borderRadius: 8 }} contentStyle={{ fontSize: 13 }} />
        <Legend verticalAlign="top" height={36} />

        {/* Background total bar for context */}
        <Bar
          dataKey="total"
          name="Total (context)"
          barSize={20}
          fill="#E2E8F0"
          opacity={0.6}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="total"
            position="top"
            formatter={val => (val ? val : '')}
            style={{
              fill: '#374151',
              fontWeight: 600,
              fontSize: 12,
              fontFamily: 'Segoe UI, system-ui, sans-serif',
            }}
          />
        </Bar>

        {/* One line per recruiter */}
        {recruiters.map((rec, idx) => (
          <Line
            key={rec}
            type="monotone"
            dataKey={rec}
            name={rec}
            stroke={LINE_COLORS[idx % LINE_COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
            isAnimationActive={true}
            legendType="circle"
          >
            <LabelList
              dataKey={rec}
              position="top"
              formatter={(val, entry) => {
                if (entry && entry.Month === latestMonth) return val;
                return '';
              }}
              style={{
                fill: LINE_COLORS[idx % LINE_COLORS.length],
                fontWeight: 700,
                fontSize: 12,
                fontFamily: 'Segoe UI, system-ui, sans-serif',
              }}
            />
          </Line>
        ))}

        {/* Total trend dashed line */}
        <Line
          type="monotone"
          data={totalPerMonth}
          dataKey="total"
          name="Average Total"
          stroke="#111827"
          strokeDasharray="5 5"
          strokeWidth={2}
          dot={false}
          legendType="circle"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};



const Dashboard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    socket.on('data_updated', data => {
      console.log('Received final data from backend:', data);
      if (data.error) {
        setError(data.error);
        setChartData(null);
      } else {
        setChartData(data);
        console.log('📊 monthlyPerformance Sample:', data.monthlyPerformance?.slice(0, 3));
        setError(null);
      }
      setIsLoading(false);
    });

    return () => {
      socket.off('data_updated');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 6);
    },4000); // every 4 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <StatusDisplay message="Dashboard Loading..." />;
  if (error) return <StatusDisplay message={`Error: ${error}`} isError={true} />;
  if (!chartData) return <StatusDisplay message="data not found" />;

  const chartSlides = [
    
  {
   title: "Individual Performance (Total Entries)",
      content: (
        <div className="w-full flex justify-center items-center" style={{ minHeight: 420 }}>
          <div className="w-full max-w-[750px]">
            <CustomPieChart data={chartData.individualPerformance} />
          </div>
        </div>
      ),
    },

    {
      title: "Interview Status Count",
      content: <BarChart data={chartData.interviewStatus} dataKey="Count" xAxisKey="Status" />,
    },
    {
      title: "Tech Stack Requirements",
      content: <BarChart data={chartData.techStack} dataKey="Count" xAxisKey="Name" />,
    },
    {
      title: "Date Wise Performance",
      content: <BarChart data={chartData.dateWisePerformance} dataKey="Count" xAxisKey="Date" />,
    },
    {
      title: "Weekly Performance (by Recruiter)",
      content: <WeeklyWithTrend data={chartData.weeklyPerformance} />,
    },
    {
      title: "Monthly Performance (by Recruiter)",
      content: <Monthly100PctWithTrend data={chartData.monthlyPerformance} />,
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 transition-all duration-500 ease-in-out">
      <header>
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">B2C Team Hiring - MIS Dashboard</h1>
      </header>
      <main className="w-full h-full flex items-center justify-center px-4">
        <ChartCard title={chartSlides[currentSlide].title}>
          {chartSlides[currentSlide].content}
        </ChartCard>
      </main>
    </div>
  );
};

export default Dashboard;
