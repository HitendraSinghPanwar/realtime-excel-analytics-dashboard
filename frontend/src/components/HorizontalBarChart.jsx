import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell,
} from 'recharts';

const HorizontalBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No data available.</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.Count - a.Count);

  const counts = sorted.map(d => d.Count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const normalize = v => (max === min ? 1 : (v - min) / (max - min));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 5, right: 60, left: 120, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis
          dataKey="Name"
          type="category"
          width={140}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <Tooltip formatter={(value) => [value, 'Count']} />
        <Bar dataKey="Count" name="Total Count" isAnimationActive={false}>
          {/* Color fill for each bar */}
          {sorted.map((entry, index) => {
            const t = normalize(entry.Count);
            const start = [56, 78, 161];
            const end = [130, 202, 157];
            const lerp = (a, b, f) => Math.round(a + (b - a) * f);
            const color = `rgb(${lerp(start[0], end[0], t)},${lerp(start[1], end[1], t)},${lerp(start[2], end[2], t)})`;
            return <Cell key={index} fill={color} />;
          })}

          {/* Label Count Right side with clean style */}
          <LabelList
            dataKey="Count"
            position="right"
            style={{
              fill: '#333',
              fontWeight: 'bold',
              fontSize: 14,
              fontFamily: 'Arial, sans-serif',
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HorizontalBarChart;
