import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from 'recharts';

const Monthly100PctWithTrend = ({ data }) => {
  if (!data || data.length === 0)
    return <div className="flex items-center justify-center h-full text-gray-500">No data.</div>;

  const { percentStack, totals, recruiters } = useMemo(() => {
    const pivot = {};
    const recruiterSet = new Set();

    data.forEach(item => {
      const rawMonth = item.Month;
      const recruiter = (item['Recruiter Name'] || '').trim();
      const count = parseInt(item.Count) || 0;

      const dt = new Date(`${rawMonth}T00:00:00`);
      if (!recruiter || isNaN(dt)) return;

      const label = `${dt.toLocaleString('default', { month: 'short' })} ${dt.getFullYear()}`;

      recruiterSet.add(recruiter);
      pivot[label] = pivot[label] || { Month: label, __raw: {}, _sortDate: dt };
      pivot[label].__raw[recruiter] = (pivot[label].__raw[recruiter] || 0) + count;
    });

    const months = Object.values(pivot).sort((a, b) => a._sortDate - b._sortDate);

    const allRecruiters = Array.from(recruiterSet);
    const percentStackArr = [];
    const totalsArr = [];

    months.forEach(m => {
      const raw = m.__raw;
      const total = allRecruiters.reduce((sum, rec) => sum + (raw[rec] || 0), 0);
      const percentEntry = { Month: m.Month };
      allRecruiters.forEach(rec => {
        percentEntry[rec] = total > 0 ? (raw[rec] || 0) / total * 100 : 0;
      });
      percentStackArr.push(percentEntry);
      totalsArr.push({ Month: m.Month, total });
    });

    return {
      percentStack: percentStackArr,
      totals: totalsArr,
      recruiters: allRecruiters,
    };
  }, [data]);

  if (percentStack.length === 0 || recruiters.length === 0) {
    return <div className="text-center text-gray-500 p-6">No valid monthly data to show.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={percentStack}
        margin={{ top: 20, right: 60, left: 20, bottom: 5 }}
        stackOffset="expand"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Month" />
        <YAxis tickFormatter={v => `${Math.round(v)}%`} />
        <Tooltip formatter={(value, name) => [`${parseFloat(value).toFixed(1)}%`, name]} />
        <Legend />
        {recruiters.map(rec => (
          <Bar key={rec} dataKey={rec} stackId="a" />
        ))}
        <Line
          type="monotone"
          data={percentStack.map((row, i) => ({ Month: row.Month, total: totals[i]?.total || 0 }))}
          dataKey="total"
          name="Total Count"
          stroke="#111"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
