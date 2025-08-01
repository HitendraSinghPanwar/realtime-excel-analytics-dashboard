// WeeklyWithTrend.jsx
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';

// gentle distinct palette
const LINE_COLORS = ['#5B8FF9', '#5AD8A6', '#FFC658', '#FF9F7F', '#6E7074', '#9270CA'];

const WeeklyWithTrend = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data.
      </div>
    );

  // Pivot data: per week per recruiter, and total
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

    // merge total into perWeek for bar rendering
    const perWeekWithTotal = weeks.map(w => {
      const matchingTotal = totalArr.find(t => t.Week === w.Week);
      return { ...w, total: matchingTotal?.total || 0 };
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
      <ComposedChart
        data={perWeek}
        margin={{ top: 20, right: 60, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Week" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip
          wrapperStyle={{ borderRadius: 8 }}
          contentStyle={{ fontSize: 13 }}
        />
        <Legend verticalAlign="top" height={36} />
        {/* Background total bar */}
        <Bar
          dataKey="total"
          name="Total (context)"
          barSize={20}
          fill="#E2E8F0"
          isAnimationActive={false}
          opacity={0.6}
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
          >
            {/* Show value on last point only */}
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
                fontWeight: '700',
                fontSize: 12,
                fontFamily: 'Segoe UI, system-ui, sans-serif',
              }}
            />
          </Line>
        ))}

        {/* Average trend of total */}
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

export default WeeklyWithTrend;
