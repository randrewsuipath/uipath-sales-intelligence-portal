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
// Default thresholds - will be configurable in Phase 4
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
export function calculateRiskScore(account: ProcessedAccount): RiskScoreResult {
  const { robotUtilisationPct, aiUtilisationPct, agenticUtilisationPct, licenceExpiryDate, arr } = account;
  // Calculate average utilisation
  const avgUtilisation = (robotUtilisationPct + aiUtilisationPct + agenticUtilisationPct) / 3;
  // Utilisation component (0-1, higher = worse)
  const utilisationScore = Math.max(0, (100 - avgUtilisation) / 100);
  // Trend penalty (placeholder - will need historical data for real trend calculation)
  // For now, penalise if any metric is below threshold
  const belowThreshold = [robotUtilisationPct, aiUtilisationPct, agenticUtilisationPct].filter(
    pct => pct < DEFAULT_THRESHOLDS.lowUtilisation
  ).length;
  const trendPenalty = belowThreshold / 3;
  // Expiry proximity component (0-1, higher = worse)
  let expiryScore = 0;
  if (licenceExpiryDate) {
    const expiryDate = new Date(licenceExpiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.max(0, (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= DEFAULT_THRESHOLDS.expiryWarningDays) {
      expiryScore = 1 - (daysUntilExpiry / DEFAULT_THRESHOLDS.expiryWarningDays);
    }
  }
  // ARR component (normalised 0-1, higher ARR = higher risk impact)
  // Assume max ARR of $10M for normalisation
  const arrScore = Math.min(1, arr / 10000000);
  // Composite score (0-100)
  const compositeScore = (
    utilisationScore * DEFAULT_THRESHOLDS.weights.utilisation +
    trendPenalty * DEFAULT_THRESHOLDS.weights.trend +
    expiryScore * DEFAULT_THRESHOLDS.weights.expiry +
    arrScore * DEFAULT_THRESHOLDS.weights.arr
  ) * 100;
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