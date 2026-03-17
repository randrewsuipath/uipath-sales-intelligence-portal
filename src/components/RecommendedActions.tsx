import type { ProcessedAccount } from '@/utils/riskScoring';
import { AlertCircle, Calendar, Phone, Mail } from 'lucide-react';
interface RecommendedActionsProps {
  account: ProcessedAccount;
}
interface Action {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: typeof AlertCircle;
}
export function RecommendedActions({ account }: RecommendedActionsProps) {
  const actions: Action[] = [];
  if (account.riskLevel === 'Critical' || account.riskLevel === 'High') {
    actions.push({
      id: '1',
      priority: 'high',
      title: 'Schedule Urgent QBR',
      description: `Account is at ${account.riskLevel.toLowerCase()} risk. Schedule immediate quarterly business review with ${account.accountDirector}.`,
      icon: Calendar,
    });
  }
  if (account.robotUtilisationPct < 30) {
    actions.push({
      id: '2',
      priority: 'high',
      title: 'Address Robot Underutilisation',
      description: `Robot utilisation at ${account.robotUtilisationPct.toFixed(1)}%. Identify automation opportunities or right-size licence count.`,
      icon: AlertCircle,
    });
  }
  if (account.aiUtilisationPct < 30) {
    actions.push({
      id: '3',
      priority: 'medium',
      title: 'AI Adoption Workshop',
      description: `AI utilisation at ${account.aiUtilisationPct.toFixed(1)}%. Schedule workshop to demonstrate AI capabilities and use cases.`,
      icon: Phone,
    });
  }
  if (account.licenceExpiryDate) {
    const daysUntilExpiry = Math.floor(
      (new Date(account.licenceExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 90) {
      actions.push({
        id: '4',
        priority: 'high',
        title: 'Renewal Discussion',
        description: `Licence expires in ${daysUntilExpiry} days. Initiate renewal conversation with ${account.accountDirector}.`,
        icon: Mail,
      });
    }
  }
  if (actions.length === 0) {
    actions.push({
      id: '5',
      priority: 'low',
      title: 'Maintain Engagement',
      description: 'Account health is good. Continue regular check-ins and monitor utilisation trends.',
      icon: AlertCircle,
    });
  }
  const getPriorityBadge = (priority: Action['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-gray-100 text-gray-600';
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
      <div className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div key={action.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-lg h-fit">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">{action.title}</h4>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(
                      action.priority
                    )}`}
                  >
                    {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}