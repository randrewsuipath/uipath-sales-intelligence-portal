import type { ProcessedAccount } from '@/utils/riskScoring';
import { getRiskBadgeClasses } from '@/utils/riskScoring';
import { Building2, Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
interface AccountSidebarProps {
  account: ProcessedAccount;
}
export function AccountSidebar({ account }: AccountSidebarProps) {
  return (
    <div className="w-full lg:w-80 space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{account.accountName}</h2>
            <p className="text-sm text-gray-500 mt-1">{account.region}</p>
          </div>
          <span className={getRiskBadgeClasses(account.riskLevel)}>{account.riskLevel}</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Risk Score</p>
              <p className="text-sm font-semibold text-gray-900">{account.riskScore}/100</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Avg Utilisation</p>
              <p className="text-sm font-semibold text-gray-900">{account.avgUtilisation.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Annual Recurring Revenue</p>
              <p className="text-sm font-semibold text-gray-900">${(account.arr / 1000).toFixed(0)}K</p>
            </div>
          </div>
          {account.licenceExpiryDate && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Licence Expiry</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDistanceToNow(new Date(account.licenceExpiryDate), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Ownership Team</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Account Director</p>
            <p className="text-sm font-medium text-gray-900">{account.accountDirector}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Technical Account Manager</p>
            <p className="text-sm font-medium text-gray-900">{account.tam}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Customer Success Manager</p>
            <p className="text-sm font-medium text-gray-900">{account.csm}</p>
          </div>
        </div>
      </div>
    </div>
  );
}