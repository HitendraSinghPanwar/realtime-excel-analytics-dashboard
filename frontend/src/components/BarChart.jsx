import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CustomBarChart = ({ data, dataKey, xAxisKey, groupBy }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">
        <p>No data for this chart.</p>
      </div>
    );
  }

  const { chartData, groupKeys } = useMemo(() => {
    if (!groupBy) {
      return { chartData: data, groupKeys: [dataKey] };
    }

    const pivotData = {};
    const uniqueGroupKeys = new Set();

    data.forEach(item => {
      const xAxisValue = item[xAxisKey];
      const groupValue = item[groupBy];
      const count = item[dataKey] || 0;

      if (!pivotData[xAxisValue]) {
        pivotData[xAxisValue] = { [xAxisKey]: xAxisValue };
      }
      pivotData[xAxisValue][groupValue] = (pivotData[xAxisValue][groupValue] || 0) + count;
      uniqueGroupKeys.add(groupValue);
    });

    return {
      chartData: Object.values(pivotData),
      groupKeys: Array.from(uniqueGroupKeys),
    };
  }, [data, dataKey, xAxisKey, groupBy]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Legend />

        {groupKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId={groupBy ? 'a' : undefined}
            fill={COLORS[index % COLORS.length]}
            name={key}
          >
            <LabelList
              dataKey={key}
              position="top"
              formatter={val => (val != null ? val : '')}
              style={{
                fill: '#1f2937',
                fontWeight: '700',
                fontSize: 12,
                fontFamily: 'Segoe UI, system-ui, sans-serif',
              }}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;
