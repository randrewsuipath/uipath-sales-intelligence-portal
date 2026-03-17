import type { ProcessedAccount } from '@/utils/riskScoring';
import { formatDistanceToNow } from 'date-fns';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
interface ActivityTimelineProps {
  account: ProcessedAccount;
}
interface ActivityEvent {
  id: string;
  type: 'utilisation-change' | 'licence-update' | 'risk-change' | 'sync';
  title: string;
  description: string;
  timestamp: string;
  icon: typeof CheckCircle;
  iconColor: string;
  iconBg: string;
}
export function ActivityTimeline({ account }: ActivityTimelineProps) {
  const events: ActivityEvent[] = [
    {
      id: '1',
      type: 'sync',
      title: 'Data Sync Completed',
      description: 'Latest utilisation metrics synced from Snowflake',
      timestamp: account.lastSyncTime,
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      id: '2',
      type: 'utilisation-change',
      title: 'Robot Utilisation Decreased',
      description: `Robot utilisation dropped to ${account.robotUtilisationPct.toFixed(1)}%`,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: TrendingDown,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    {
      id: '3',
      type: 'risk-change',
      title: 'Risk Score Updated',
      description: `Account risk score recalculated to ${account.riskScore}`,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      icon: AlertCircle,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
    },
    {
      id: '4',
      type: 'utilisation-change',
      title: 'AI Utilisation Increased',
      description: `AI utilisation improved to ${account.aiUtilisationPct.toFixed(1)}%`,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      icon: TrendingUp,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h3>
      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="flex gap-4">
              <div className="relative">
                <div className={`p-2 rounded-lg ${event.iconBg}`}>
                  <Icon className={`w-4 h-4 ${event.iconColor}`} />
                </div>
                {index < events.length - 1 && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-200" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}