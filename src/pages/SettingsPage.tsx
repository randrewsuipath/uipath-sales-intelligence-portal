import { useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Entities } from '@uipath/uipath-typescript/entities';
import type { EntityRecord } from '@uipath/uipath-typescript/entities';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Save, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
interface ConfigData {
  robotLowUtilisationThreshold: number;
  aiLowUtilisationThreshold: number;
  agenticLowUtilisationThreshold: number;
  expiryWarningDays: number;
  riskScoreWeights: {
    utilisation: number;
    trend: number;
    expiry: number;
    arr: number;
  };
}
const DEFAULT_CONFIG: ConfigData = {
  robotLowUtilisationThreshold: 30,
  aiLowUtilisationThreshold: 30,
  agenticLowUtilisationThreshold: 20,
  expiryWarningDays: 90,
  riskScoreWeights: {
    utilisation: 0.4,
    trend: 0.3,
    expiry: 0.2,
    arr: 0.1,
  },
};
export function SettingsPage() {
  const { sdk, isAuthenticated } = useAuth();
  const entities = useMemo(() => (sdk ? new Entities(sdk) : null), [sdk]);
  const [configEntityId, setConfigEntityId] = useState<string | null>(null);
  const [configRecordId, setConfigRecordId] = useState<string | null>(null);
  const [config, setConfig] = useState<ConfigData>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!entities || !isAuthenticated) return;
    const loadConfig = async () => {
      try {
        const allEntities = await entities.getAll();
        const configEntity = allEntities.find(e => e.name === 'PortalConfig');
        if (!configEntity) {
          setError('PortalConfig entity not found. Using default settings.');
          setIsLoading(false);
          return;
        }
        setConfigEntityId(configEntity.id);
        const records = await entities.getAllRecords(configEntity.id, { pageSize: 1 });
        if (records.items.length > 0) {
          const record = records.items[0];
          setConfigRecordId(record.id as string);
          setConfig({
            robotLowUtilisationThreshold: (record.robotLowUtilisationThreshold as number) || DEFAULT_CONFIG.robotLowUtilisationThreshold,
            aiLowUtilisationThreshold: (record.aiLowUtilisationThreshold as number) || DEFAULT_CONFIG.aiLowUtilisationThreshold,
            agenticLowUtilisationThreshold: (record.agenticLowUtilisationThreshold as number) || DEFAULT_CONFIG.agenticLowUtilisationThreshold,
            expiryWarningDays: (record.expiryWarningDays as number) || DEFAULT_CONFIG.expiryWarningDays,
            riskScoreWeights: (record.riskScoreWeights as any) || DEFAULT_CONFIG.riskScoreWeights,
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [entities, isAuthenticated]);
  const handleSave = useCallback(async () => {
    if (!entities || !configEntityId) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const data = {
        robotLowUtilisationThreshold: config.robotLowUtilisationThreshold,
        aiLowUtilisationThreshold: config.aiLowUtilisationThreshold,
        agenticLowUtilisationThreshold: config.agenticLowUtilisationThreshold,
        expiryWarningDays: config.expiryWarningDays,
        riskScoreWeights: config.riskScoreWeights,
      };
      if (configRecordId) {
        await entities.updateRecordsById(configEntityId, [{ id: configRecordId, ...data }]);
      } else {
        const result = await entities.insertRecordById(configEntityId, data);
        setConfigRecordId(result.id as string);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  }, [entities, configEntityId, configRecordId, config]);
  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);
  if (!isAuthenticated) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access settings</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (isLoading) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="text-sm text-gray-500">Loading settings...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings & Configuration</h1>
              <p className="text-sm text-gray-500 mt-1">Manage risk thresholds and portal preferences</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {saveSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Settings saved successfully</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue="thresholds" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="thresholds">Risk Thresholds</TabsTrigger>
              <TabsTrigger value="weights">Risk Score Weights</TabsTrigger>
            </TabsList>
            <TabsContent value="thresholds" className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Utilisation Thresholds</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Accounts with utilisation below these thresholds will be flagged as at-risk
                </p>
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Robot Utilisation Threshold
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[config.robotLowUtilisationThreshold]}
                        onValueChange={([value]) =>
                          setConfig({ ...config, robotLowUtilisationThreshold: value })
                        }
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={config.robotLowUtilisationThreshold}
                        onChange={(e) =>
                          setConfig({ ...config, robotLowUtilisationThreshold: Number(e.target.value) })
                        }
                        className="w-20 text-center"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      AI Utilisation Threshold
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[config.aiLowUtilisationThreshold]}
                        onValueChange={([value]) => setConfig({ ...config, aiLowUtilisationThreshold: value })}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={config.aiLowUtilisationThreshold}
                        onChange={(e) => setConfig({ ...config, aiLowUtilisationThreshold: Number(e.target.value) })}
                        className="w-20 text-center"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Agentic Utilisation Threshold
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[config.agenticLowUtilisationThreshold]}
                        onValueChange={([value]) =>
                          setConfig({ ...config, agenticLowUtilisationThreshold: value })
                        }
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={config.agenticLowUtilisationThreshold}
                        onChange={(e) =>
                          setConfig({ ...config, agenticLowUtilisationThreshold: Number(e.target.value) })
                        }
                        className="w-20 text-center"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Licence Expiry Warning</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Show warning for accounts with licences expiring within this window
                </p>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Warning Window (Days)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[config.expiryWarningDays]}
                      onValueChange={([value]) => setConfig({ ...config, expiryWarningDays: value })}
                      min={30}
                      max={365}
                      step={30}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={config.expiryWarningDays}
                      onChange={(e) => setConfig({ ...config, expiryWarningDays: Number(e.target.value) })}
                      className="w-20 text-center"
                      min={30}
                      max={365}
                    />
                    <span className="text-sm text-gray-500">days</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="weights" className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Calculation Weights</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Adjust how different factors contribute to the composite risk score (must sum to 1.0)
                </p>
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Utilisation Weight ({(config.riskScoreWeights.utilisation * 100).toFixed(0)}%)
                    </Label>
                    <Slider
                      value={[config.riskScoreWeights.utilisation * 100]}
                      onValueChange={([value]) => {
                        const newVal = value / 100;
                        const remaining = 1 - newVal;
                        const currentSum =
                          config.riskScoreWeights.trend + config.riskScoreWeights.expiry + config.riskScoreWeights.arr;
                        const scale = currentSum > 0 ? remaining / currentSum : 0;
                        setConfig({
                          ...config,
                          riskScoreWeights: {
                            utilisation: newVal,
                            trend: config.riskScoreWeights.trend * scale,
                            expiry: config.riskScoreWeights.expiry * scale,
                            arr: config.riskScoreWeights.arr * scale,
                          },
                        });
                      }}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Trend Weight ({(config.riskScoreWeights.trend * 100).toFixed(0)}%)
                    </Label>
                    <Slider
                      value={[config.riskScoreWeights.trend * 100]}
                      onValueChange={([value]) => {
                        const newVal = value / 100;
                        const remaining = 1 - newVal;
                        const currentSum =
                          config.riskScoreWeights.utilisation +
                          config.riskScoreWeights.expiry +
                          config.riskScoreWeights.arr;
                        const scale = currentSum > 0 ? remaining / currentSum : 0;
                        setConfig({
                          ...config,
                          riskScoreWeights: {
                            utilisation: config.riskScoreWeights.utilisation * scale,
                            trend: newVal,
                            expiry: config.riskScoreWeights.expiry * scale,
                            arr: config.riskScoreWeights.arr * scale,
                          },
                        });
                      }}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Expiry Weight ({(config.riskScoreWeights.expiry * 100).toFixed(0)}%)
                    </Label>
                    <Slider
                      value={[config.riskScoreWeights.expiry * 100]}
                      onValueChange={([value]) => {
                        const newVal = value / 100;
                        const remaining = 1 - newVal;
                        const currentSum =
                          config.riskScoreWeights.utilisation +
                          config.riskScoreWeights.trend +
                          config.riskScoreWeights.arr;
                        const scale = currentSum > 0 ? remaining / currentSum : 0;
                        setConfig({
                          ...config,
                          riskScoreWeights: {
                            utilisation: config.riskScoreWeights.utilisation * scale,
                            trend: config.riskScoreWeights.trend * scale,
                            expiry: newVal,
                            arr: config.riskScoreWeights.arr * scale,
                          },
                        });
                      }}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      ARR Weight ({(config.riskScoreWeights.arr * 100).toFixed(0)}%)
                    </Label>
                    <Slider
                      value={[config.riskScoreWeights.arr * 100]}
                      onValueChange={([value]) => {
                        const newVal = value / 100;
                        const remaining = 1 - newVal;
                        const currentSum =
                          config.riskScoreWeights.utilisation +
                          config.riskScoreWeights.trend +
                          config.riskScoreWeights.expiry;
                        const scale = currentSum > 0 ? remaining / currentSum : 0;
                        setConfig({
                          ...config,
                          riskScoreWeights: {
                            utilisation: config.riskScoreWeights.utilisation * scale,
                            trend: config.riskScoreWeights.trend * scale,
                            expiry: config.riskScoreWeights.expiry * scale,
                            arr: newVal,
                          },
                        });
                      }}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Total:{' '}
                      <span className="font-semibold text-gray-900">
                        {(
                          (config.riskScoreWeights.utilisation +
                            config.riskScoreWeights.trend +
                            config.riskScoreWeights.expiry +
                            config.riskScoreWeights.arr) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <footer className="text-center text-xs text-gray-400 pt-8 pb-4">© Powered by UiPath</footer>
        </div>
      </div>
    </AppLayout>
  );
}