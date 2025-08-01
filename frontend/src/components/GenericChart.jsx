import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GenericChart = ({ title, data }) => {
  console.log("Chart Title:", title);
  console.log("Chart Data:", data);

  if (!data || data.length === 0) return null;

  // Assuming first object keys are dynamic, get keys for plotting
  const keys = Object.keys(data[0]).filter(k => k !== 'name');

  return (
    <div className="bg-white shadow-xl rounded-2xl p-4 mb-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {keys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={['#8884d8', '#82ca9d', '#ff7300', '#ff0000'][index % 4]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericChart;
