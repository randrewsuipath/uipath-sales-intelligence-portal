export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export interface ProcessedAccount {
  accountId: string;
  accountName: string;
  region: string;
  accountDirector: string;
  tam: string;
  csm: string;
  arr: number;
  robotUtilisationPct: number;
  aiUtilisationPct: number;
  agenticUtilisationPct: number;
  licenceExpiryDate: string | null;
  lastSyncTime: string;
  riskScore: number;
  riskLevel: RiskLevel;
  avgUtilisation: number;
}
interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  avgUtilisation: number;
}
export interface RiskConfig {
  robotLowUtilisationThreshold?: number;
  aiLowUtilisationThreshold?: number;
  agenticLowUtilisationThreshold?: number;
  expiryWarningDays?: number;
  riskScoreWeights?: {
    utilisation: number;
    trend: number;
    expiry: number;
    arr: number;
  };
}
const DEFAULT_THRESHOLDS = {
  lowUtilisation: 30,
  expiryWarningDays: 90,
  weights: {
    utilisation: 0.4,
    trend: 0.3,
    expiry: 0.2,
    arr: 0.1,
  },
};
export function calculateRiskScore(account: ProcessedAccount, config?: RiskConfig): RiskScoreResult {
  const { robotUtilisationPct, aiUtilisationPct, agenticUtilisationPct, licenceExpiryDate, arr } = account;
  const robotThreshold = config?.robotLowUtilisationThreshold ?? DEFAULT_THRESHOLDS.lowUtilisation;
  const aiThreshold = config?.aiLowUtilisationThreshold ?? DEFAULT_THRESHOLDS.lowUtilisation;
  const agenticThreshold = config?.agenticLowUtilisationThreshold ?? DEFAULT_THRESHOLDS.lowUtilisation;
  const expiryDays = config?.expiryWarningDays ?? DEFAULT_THRESHOLDS.expiryWarningDays;
  const weights = config?.riskScoreWeights ?? DEFAULT_THRESHOLDS.weights;
  const avgUtilisation = (robotUtilisationPct + aiUtilisationPct + agenticUtilisationPct) / 3;
  const utilisationScore = Math.max(0, (100 - avgUtilisation) / 100);
  const belowThreshold = [
    robotUtilisationPct < robotThreshold ? 1 : 0,
    aiUtilisationPct < aiThreshold ? 1 : 0,
    agenticUtilisationPct < agenticThreshold ? 1 : 0,
  ].reduce((sum, val) => sum + val, 0);
  const trendPenalty = belowThreshold / 3;
  let expiryScore = 0;
  if (licenceExpiryDate) {
    const expiryDate = new Date(licenceExpiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.max(0, (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= expiryDays) {
      expiryScore = 1 - daysUntilExpiry / expiryDays;
    }
  }
  const arrScore = Math.min(1, arr / 10000000);
  const compositeScore =
    (utilisationScore * weights.utilisation +
      trendPenalty * weights.trend +
      expiryScore * weights.expiry +
      arrScore * weights.arr) *
    100;
  const level = getRiskLevel(compositeScore);
  return {
    score: Math.round(compositeScore),
    level,
    avgUtilisation,
  };
}
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}
export function getRiskBadgeClasses(level: RiskLevel): string {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  switch (level) {
    case 'Critical':
      return `${base} bg-red-100 text-red-700`;
    case 'High':
      return `${base} bg-orange-100 text-orange-700`;
    case 'Medium':
      return `${base} bg-yellow-100 text-yellow-700`;
    case 'Low':
      return `${base} bg-gray-100 text-gray-600`;
  }
}