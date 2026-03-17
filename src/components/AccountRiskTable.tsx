import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProcessedAccount } from '@/utils/riskScoring';
import { getRiskBadgeClasses } from '@/utils/riskScoring';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
type SortField = 'accountName' | 'riskScore' | 'avgUtilisation' | 'arr' | 'licenceExpiryDate';
type SortDirection = 'asc' | 'desc';
interface AccountRiskTableProps {
  accounts: ProcessedAccount[];
}
export function AccountRiskTable({ accounts }: AccountRiskTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      if (sortField === 'licenceExpiryDate') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [accounts, sortField, sortDirection]);
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-gray-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-gray-600" />
    );
  };
  if (accounts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-sm text-gray-500">No accounts to display</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('accountName')}
              >
                <div className="flex items-center gap-2">
                  <span>Account Name</span>
                  <SortIcon field="accountName" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('riskScore')}
              >
                <div className="flex items-center gap-2">
                  <span>Risk Score</span>
                  <SortIcon field="riskScore" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('avgUtilisation')}
              >
                <div className="flex items-center gap-2">
                  <span>Avg Utilisation</span>
                  <SortIcon field="avgUtilisation" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Robot
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agentic
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('arr')}
              >
                <div className="flex items-center gap-2">
                  <span>ARR</span>
                  <SortIcon field="arr" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('licenceExpiryDate')}
              >
                <div className="flex items-center gap-2">
                  <span>Licence Expiry</span>
                  <SortIcon field="licenceExpiryDate" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Director
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAccounts.map((account) => (
              <tr
                key={account.accountId}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/accounts/${account.accountId}`)}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {account.accountName}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span className={getRiskBadgeClasses(account.riskLevel)}>{account.riskLevel}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                  {account.riskScore}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {account.avgUtilisation.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {account.robotUtilisationPct.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {account.aiUtilisationPct.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {account.agenticUtilisationPct.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  ${(account.arr / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {account.licenceExpiryDate
                    ? formatDistanceToNow(new Date(account.licenceExpiryDate), { addSuffix: true })
                    : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {account.accountDirector}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}