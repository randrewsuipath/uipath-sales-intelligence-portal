import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Entities } from '@uipath/uipath-typescript/entities';
import type { EntityRecord } from '@uipath/uipath-typescript/entities';
import { usePolling } from '@/hooks/usePolling';
import { calculateRiskScore, type ProcessedAccount, type RiskLevel } from '@/utils/riskScoring';
import { AppLayout } from '@/components/layout/AppLayout';
import { AccountRiskTable } from '@/components/AccountRiskTable';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'react-router-dom';
export function AccountsPage() {
  const { sdk, isAuthenticated } = useAuth();
  const entities = useMemo(() => (sdk ? new Entities(sdk) : null), [sdk]);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  // Filter state from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>(
    (searchParams.get('risk')?.split(',').filter(Boolean) as RiskLevel[]) || []
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    searchParams.get('region')?.split(',').filter(Boolean) || []
  );
  const [selectedOwners, setSelectedOwners] = useState<string[]>(
    searchParams.get('owner')?.split(',').filter(Boolean) || []
  );
  const [minUtilisation, setMinUtilisation] = useState<number>(
    Number(searchParams.get('minUtil')) || 0
  );
  const [maxUtilisation, setMaxUtilisation] = useState<number>(
    Number(searchParams.get('maxUtil')) || 100
  );
  const [expiryDays, setExpiryDays] = useState<number>(
    Number(searchParams.get('expiryDays')) || 365
  );
  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedRiskLevels.length > 0) params.set('risk', selectedRiskLevels.join(','));
    if (selectedRegions.length > 0) params.set('region', selectedRegions.join(','));
    if (selectedOwners.length > 0) params.set('owner', selectedOwners.join(','));
    if (minUtilisation > 0) params.set('minUtil', String(minUtilisation));
    if (maxUtilisation < 100) params.set('maxUtil', String(maxUtilisation));
    if (expiryDays < 365) params.set('expiryDays', String(expiryDays));
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedRiskLevels, selectedRegions, selectedOwners, minUtilisation, maxUtilisation, expiryDays, setSearchParams]);
  // Find entity
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
  const { data: rawRecords, isActive } = usePolling<EntityRecord[]>({
    fetchFn: fetchAccounts,
    interval: 300000,
    enabled: isAuthenticated && !!entityId,
    immediate: true,
    deps: [entityId],
  });
  // Accumulate accounts
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
    });
  }, [displayRecords]);
  // Extract unique values for filters
  const uniqueRegions = useMemo(() => {
    const regions = new Set(processedAccounts.map(a => a.region));
    return Array.from(regions).sort();
  }, [processedAccounts]);
  const uniqueOwners = useMemo(() => {
    const owners = new Set<string>();
    processedAccounts.forEach(a => {
      if (a.accountDirector !== 'Unassigned') owners.add(a.accountDirector);
      if (a.tam !== 'Unassigned') owners.add(a.tam);
      if (a.csm !== 'Unassigned') owners.add(a.csm);
    });
    return Array.from(owners).sort();
  }, [processedAccounts]);
  // Apply filters
  const filteredAccounts = useMemo(() => {
    return processedAccounts.filter(account => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = account.accountName.toLowerCase().includes(query) ||
          account.accountDirector.toLowerCase().includes(query) ||
          account.region.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      // Risk level filter
      if (selectedRiskLevels.length > 0 && !selectedRiskLevels.includes(account.riskLevel)) {
        return false;
      }
      // Region filter
      if (selectedRegions.length > 0 && !selectedRegions.includes(account.region)) {
        return false;
      }
      // Owner filter
      if (selectedOwners.length > 0) {
        const hasOwner = selectedOwners.includes(account.accountDirector) ||
          selectedOwners.includes(account.tam) ||
          selectedOwners.includes(account.csm);
        if (!hasOwner) return false;
      }
      // Utilisation filter
      if (account.avgUtilisation < minUtilisation || account.avgUtilisation > maxUtilisation) {
        return false;
      }
      // Expiry filter
      if (account.licenceExpiryDate) {
        const expiryDate = new Date(account.licenceExpiryDate);
        const now = new Date();
        const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysUntilExpiry > expiryDays) return false;
      }
      return true;
    });
  }, [processedAccounts, searchQuery, selectedRiskLevels, selectedRegions, selectedOwners, minUtilisation, maxUtilisation, expiryDays]);
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedRiskLevels([]);
    setSelectedRegions([]);
    setSelectedOwners([]);
    setMinUtilisation(0);
    setMaxUtilisation(100);
    setExpiryDays(365);
  }, []);
  if (!isAuthenticated) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access the Account Risk List</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">Account Risk List</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredAccounts.length} of {processedAccounts.length} accounts
            </p>
          </div>
          {isActive && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          )}
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by account name, director, or region..."
        />
        <FilterBar
          selectedRiskLevels={selectedRiskLevels}
          onRiskLevelsChange={setSelectedRiskLevels}
          selectedRegions={selectedRegions}
          onRegionsChange={setSelectedRegions}
          availableRegions={uniqueRegions}
          selectedOwners={selectedOwners}
          onOwnersChange={setSelectedOwners}
          availableOwners={uniqueOwners}
          minUtilisation={minUtilisation}
          onMinUtilisationChange={setMinUtilisation}
          maxUtilisation={maxUtilisation}
          onMaxUtilisationChange={setMaxUtilisation}
          expiryDays={expiryDays}
          onExpiryDaysChange={setExpiryDays}
          onClearFilters={handleClearFilters}
        />
        <AccountRiskTable accounts={filteredAccounts} />
        <footer className="text-center text-xs text-gray-400 pt-8 pb-4">
          © Powered by UiPath
        </footer>
      </div>
    </AppLayout>
  );
}