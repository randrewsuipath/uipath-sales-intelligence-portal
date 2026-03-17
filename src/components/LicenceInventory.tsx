import type { ProcessedAccount } from '@/utils/riskScoring';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle } from 'lucide-react';
interface LicenceInventoryProps {
  account: ProcessedAccount;
}
interface Licence {
  id: string;
  type: string;
  count: number;
  expiryDate: string;
  status: 'active' | 'expiring-soon' | 'expired';
}
export function LicenceInventory({ account }: LicenceInventoryProps) {
  const licences: Licence[] = [
    {
      id: '1',
      type: 'Unattended Robot',
      count: Math.floor(Math.random() * 50) + 10,
      expiryDate: account.licenceExpiryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    },
    {
      id: '2',
      type: 'AI Units',
      count: Math.floor(Math.random() * 1000) + 500,
      expiryDate: account.licenceExpiryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    },
    {
      id: '3',
      type: 'Agentic Automation',
      count: Math.floor(Math.random() * 20) + 5,
      expiryDate: account.licenceExpiryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    },
  ];
  const getStatusBadge = (status: Licence['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'expiring-soon':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expiring Soon
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Licence Inventory</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Licence Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licences.map((licence) => (
              <tr key={licence.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {licence.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{licence.count}</td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {formatDistanceToNow(new Date(licence.expiryDate), { addSuffix: true })}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">{getStatusBadge(licence.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}