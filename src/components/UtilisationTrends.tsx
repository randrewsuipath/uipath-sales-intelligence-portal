import type { ProcessedAccount } from '@/utils/riskScoring';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
interface UtilisationTrendsProps {
  account: ProcessedAccount;
  period: 30 | 60 | 90;
}
export function UtilisationTrends({ account, period }: UtilisationTrendsProps) {
  const data = useMemo(() => {
    const points = period === 30 ? 10 : period === 60 ? 12 : 15;
    const result = [];
    const now = new Date();
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * Math.floor(period / points)));
      const variance = (Math.random() - 0.5) * 10;
      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        robot: Math.max(0, Math.min(100, account.robotUtilisationPct + variance)),
        ai: Math.max(0, Math.min(100, account.aiUtilisationPct + variance)),
        agentic: Math.max(0, Math.min(100, account.agenticUtilisationPct + variance)),
      });
    }
    return result;
  }, [account, period]);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{period}-Day Utilisation Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="robot" stroke="#2563eb" strokeWidth={2} name="Robot" />
          <Line type="monotone" dataKey="ai" stroke="#10b981" strokeWidth={2} name="AI" />
          <Line type="monotone" dataKey="agentic" stroke="#f59e0b" strokeWidth={2} name="Agentic" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}