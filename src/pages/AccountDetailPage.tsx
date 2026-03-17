import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Entities } from '@uipath/uipath-typescript/entities';
import type { EntityRecord } from '@uipath/uipath-typescript/entities';
import { usePolling } from '@/hooks/usePolling';
import { calculateRiskScore, type ProcessedAccount } from '@/utils/riskScoring';
import { AppLayout } from '@/components/layout/AppLayout';
import { AccountSidebar } from '@/components/AccountSidebar';
import { UtilisationTrends } from '@/components/UtilisationTrends';
import { LicenceInventory } from '@/components/LicenceInventory';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { RecommendedActions } from '@/components/RecommendedActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams, useNavigate } from 'react-router-dom';
import { exportAccountPDF } from '@/utils/pdfExport';
export function AccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { sdk, isAuthenticated } = useAuth();
  const entities = useMemo(() => (sdk ? new Entities(sdk) : null), [sdk]);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
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
  const fetchAccount = useCallback(async () => {
    if (!entities || !entityId || !accountId) return null;
    try {
      const result = await entities.getAllRecords(entityId, { pageSize: 500, expansionLevel: 1 });
      const record = result.items.find(r => (r.accountId as string) === accountId);
      return record || null;
    } catch (err) {
      console.error('Failed to fetch account:', err);
      throw err;
    }
  }, [entities, entityId, accountId]);
  const { data: rawRecord, isActive } = usePolling<EntityRecord | null>({
    fetchFn: fetchAccount,
    interval: 300000,
    enabled: isAuthenticated && !!entityId && !!accountId,
    immediate: true,
    deps: [entityId, accountId],
  });
  const lastRecordRef = useRef<EntityRecord | null>(null);
  const lastAccountIdRef = useRef(accountId);
  if (accountId !== lastAccountIdRef.current) {
    lastAccountIdRef.current = accountId;
    lastRecordRef.current = null;
  }
  if (rawRecord) lastRecordRef.current = rawRecord;
  const displayRecord = lastRecordRef.current;
  const account: ProcessedAccount | null = useMemo(() => {
    if (!displayRecord) return null;
    const acc: ProcessedAccount = {
      accountId: displayRecord.accountId as string,
      accountName: displayRecord.accountName as string,
      region: (displayRecord.region as string) || 'Unknown',
      accountDirector: (displayRecord.accountDirector as string) || 'Unassigned',
      tam: (displayRecord.tam as string) || 'Unassigned',
      csm: (displayRecord.csm as string) || 'Unassigned',
      arr: typeof displayRecord.arr === 'number' ? displayRecord.arr : 0,
      robotUtilisationPct: typeof displayRecord.robotUtilisationPct === 'number' ? displayRecord.robotUtilisationPct : 0,
      aiUtilisationPct: typeof displayRecord.aiUtilisationPct === 'number' ? displayRecord.aiUtilisationPct : 0,
      agenticUtilisationPct: typeof displayRecord.agenticUtilisationPct === 'number' ? displayRecord.agenticUtilisationPct : 0,
      licenceExpiryDate: (displayRecord.licenceExpiryDate as string) || null,
      lastSyncTime: (displayRecord.lastSyncTime as string) || new Date().toISOString(),
      riskScore: 0,
      riskLevel: 'Low',
      avgUtilisation: 0,
    };
    const risk = calculateRiskScore(acc);
    acc.riskScore = risk.score;
    acc.riskLevel = risk.level;
    acc.avgUtilisation = risk.avgUtilisation;
    return acc;
  }, [displayRecord]);
  const handleExport = useCallback(async () => {
    if (!account) return;
    setIsExporting(true);
    try {
      await exportAccountPDF(account);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  }, [account]);
  if (!isAuthenticated) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access account details</p>
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
  if (!displayRecord || !account) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="text-sm text-gray-500">Loading account details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/accounts')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Accounts
            </Button>
            {isActive && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <AccountSidebar account={account} />
          <div className="flex-1">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Utilisation Trends</TabsTrigger>
                <TabsTrigger value="licences">Licence Inventory</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6">
                <RecommendedActions account={account} />
                <UtilisationTrends account={account} period={30} />
              </TabsContent>
              <TabsContent value="trends" className="space-y-6">
                <UtilisationTrends account={account} period={30} />
                <UtilisationTrends account={account} period={60} />
                <UtilisationTrends account={account} period={90} />
              </TabsContent>
              <TabsContent value="licences">
                <LicenceInventory account={account} />
              </TabsContent>
              <TabsContent value="activity">
                <ActivityTimeline account={account} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}