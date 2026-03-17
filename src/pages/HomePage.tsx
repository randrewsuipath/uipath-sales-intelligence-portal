import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Entities } from '@uipath/uipath-typescript/entities';
import type { EntityRecord } from '@uipath/uipath-typescript/entities';
import { usePolling } from '@/hooks/usePolling';
import { calculateRiskScore, type ProcessedAccount } from '@/utils/riskScoring';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/MetricCard';
import { AccountRiskTable } from '@/components/AccountRiskTable';
import { AlertCircle, TrendingDown, DollarSign, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
export function HomePage() {
  const { sdk, isAuthenticated } = useAuth();
  const entities = useMemo(() => (sdk ? new Entities(sdk) : null), [sdk]);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Find AccountUtilisationMetrics entity on mount
  useEffect(() => {
    if (!entities || !isAuthenticated) return;
    const findEntity = async () => {
      try {
        const allEntities = await entities.getAll();
        const target = allEntities.find(e => e.name === 'AccountUtilisationMetrics');
        if (!target) {
          setError('AccountUtilisationMetrics entity not found in Data Fabric');
          return;
        }
        setEntityId(target.id);
      } catch (err) {
        console.error('Failed to load entities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load entities');
      }
    };
    findEntity();
  }, [entities, isAuthenticated]);
  const fetchAccounts = useCallback(async () => {
    if (!entities || !entityId) return [];
    try {
      const result = await entities.getAllRecords(entityId, { pageSize: 500, expansionLevel: 1 });
      return result.items;
    } catch (err) {
      console.error('Failed to fetch account records:', err);
      throw err;
    }
  }, [entities, entityId]);
  const { data: rawRecords, isLoading, isActive } = usePolling<EntityRecord[]>({
    fetchFn: fetchAccounts,
    interval: 300000, // 5 minutes
    enabled: isAuthenticated && !!entityId,
    immediate: true,
    deps: [entityId],
  });
  // Accumulate and process accounts - flicker prevention
  const lastRecordsRef = useRef<EntityRecord[] | null>(null);
  const lastEntityIdRef = useRef(entityId);
  const accumulatedAccountsRef = useRef<Map<string, EntityRecord>>(new Map());
  if (entityId !== lastEntityIdRef.current) {
    lastEntityIdRef.current = entityId;
    lastRecordsRef.current = null;
    accumulatedAccountsRef.current = new Map();
  }
  if (rawRecords) lastRecordsRef.current = rawRecords;
  const displayRecords = lastRecordsRef.current;
  if (displayRecords) {
    for (const record of displayRecords) {
      const accountId = record.accountId as string;
      if (accountId) {
        accumulatedAccountsRef.current.set(accountId, record);
      }
    }
  }
  const processedAccounts: ProcessedAccount[] = useMemo(() => {
    const records = [...accumulatedAccountsRef.current.values()];
    return records.map(record => {
      const account: ProcessedAccount = {
        accountId: record.accountId as string,
        accountName: record.accountName as string,
        region: (record.region as string) || 'Unknown',
        accountDirector: (record.accountDirector as string) || 'Unassigned',
        tam: (record.tam as string) || 'Unassigned',
        csm: (record.csm as string) || 'Unassigned',
        arr: typeof record.arr === 'number' ? record.arr : 0,
        robotUtilisationPct: typeof record.robotUtilisationPct === 'number' ? record.robotUtilisationPct : 0,
        aiUtilisationPct: typeof record.aiUtilisationPct === 'number' ? record.aiUtilisationPct : 0,
        agenticUtilisationPct: typeof record.agenticUtilisationPct === 'number' ? record.agenticUtilisationPct : 0,
        licenceExpiryDate: (record.licenceExpiryDate as string) || null,
        lastSyncTime: (record.lastSyncTime as string) || new Date().toISOString(),
        riskScore: 0,
        riskLevel: 'Low',
        avgUtilisation: 0,
      };
      const risk = calculateRiskScore(account);
      account.riskScore = risk.score;
      account.riskLevel = risk.level;
      account.avgUtilisation = risk.avgUtilisation;
      return account;
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [displayRecords]);
  const metrics = useMemo(() => {
    const atRiskAccounts = processedAccounts.filter(a => a.riskLevel === 'Critical' || a.riskLevel === 'High');
    const revenueAtRisk = atRiskAccounts.reduce((sum, a) => sum + a.arr, 0);
    const totalUtilisation = processedAccounts.length > 0
      ? processedAccounts.reduce((sum, a) => sum + a.avgUtilisation, 0) / processedAccounts.length
      : 0;
    return {
      totalAccounts: processedAccounts.length,
      atRiskCount: atRiskAccounts.length,
      revenueAtRisk,
      avgUtilisation: totalUtilisation,
    };
  }, [processedAccounts]);
  const topRiskAccounts = useMemo(() => processedAccounts.slice(0, 20), [processedAccounts]);
  if (!isAuthenticated) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access the Sales Intelligence Portal</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (error) {
    return (
      <AppLayout container>
        <Alert variant="destructive" className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }
  if (!displayRecords) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="text-sm text-gray-500">Loading account data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Executive Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Account health overview and risk analysis</p>
          </div>
          {isActive && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Accounts"
            value={metrics.totalAccounts}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <MetricCard
            title="At-Risk Accounts"
            value={metrics.atRiskCount}
            icon={AlertCircle}
            iconColor="text-red-600"
            iconBg="bg-red-100"
            subtitle={`${((metrics.atRiskCount / metrics.totalAccounts) * 100 || 0).toFixed(1)}% of total`}
          />
          <MetricCard
            title="Revenue at Risk"
            value={`$${(metrics.revenueAtRisk / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
          <MetricCard
            title="Avg Utilisation"
            value={`${metrics.avgUtilisation.toFixed(1)}%`}
            icon={TrendingDown}
            iconColor="text-gray-600"
            iconBg="bg-gray-100"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 20 At-Risk Accounts</h2>
          <AccountRiskTable accounts={topRiskAccounts} />
        </div>
        <footer className="text-center text-xs text-gray-400 pt-8 pb-4">
          © Powered by UiPath
        </footer>
      </div>
    </AppLayout>
  );
}