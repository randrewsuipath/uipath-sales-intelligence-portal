import { useMemo } from 'react';
import type { RiskLevel } from '@/utils/riskScoring';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter, X, ChevronDown } from 'lucide-react';
interface FilterBarProps {
  selectedRiskLevels: RiskLevel[];
  onRiskLevelsChange: (levels: RiskLevel[]) => void;
  selectedRegions: string[];
  onRegionsChange: (regions: string[]) => void;
  availableRegions: string[];
  selectedOwners: string[];
  onOwnersChange: (owners: string[]) => void;
  availableOwners: string[];
  minUtilisation: number;
  onMinUtilisationChange: (value: number) => void;
  maxUtilisation: number;
  onMaxUtilisationChange: (value: number) => void;
  expiryDays: number;
  onExpiryDaysChange: (days: number) => void;
  onClearFilters: () => void;
}
const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];
export function FilterBar({
  selectedRiskLevels,
  onRiskLevelsChange,
  selectedRegions,
  onRegionsChange,
  availableRegions,
  selectedOwners,
  onOwnersChange,
  availableOwners,
  minUtilisation,
  onMinUtilisationChange,
  maxUtilisation,
  onMaxUtilisationChange,
  expiryDays,
  onExpiryDaysChange,
  onClearFilters,
}: FilterBarProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedRiskLevels.length > 0) count++;
    if (selectedRegions.length > 0) count++;
    if (selectedOwners.length > 0) count++;
    if (minUtilisation > 0 || maxUtilisation < 100) count++;
    if (expiryDays < 365) count++;
    return count;
  }, [selectedRiskLevels, selectedRegions, selectedOwners, minUtilisation, maxUtilisation, expiryDays]);
  const toggleRiskLevel = (level: RiskLevel) => {
    if (selectedRiskLevels.includes(level)) {
      onRiskLevelsChange(selectedRiskLevels.filter(l => l !== level));
    } else {
      onRiskLevelsChange([...selectedRiskLevels, level]);
    }
  };
  const toggleRegion = (region: string) => {
    if (selectedRegions.includes(region)) {
      onRegionsChange(selectedRegions.filter(r => r !== region));
    } else {
      onRegionsChange([...selectedRegions, region]);
    }
  };
  const toggleOwner = (owner: string) => {
    if (selectedOwners.includes(owner)) {
      onOwnersChange(selectedOwners.filter(o => o !== owner));
    } else {
      onOwnersChange([...selectedOwners, owner]);
    }
  };
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Risk Level Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-gray-300">
              Risk Level
              {selectedRiskLevels.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedRiskLevels.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-2">
              {RISK_LEVELS.map(level => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`risk-${level}`}
                    checked={selectedRiskLevels.includes(level)}
                    onCheckedChange={() => toggleRiskLevel(level)}
                  />
                  <Label
                    htmlFor={`risk-${level}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {/* Region Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-gray-300">
              Region
              {selectedRegions.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedRegions.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 max-h-64 overflow-y-auto" align="start">
            <div className="space-y-2">
              {availableRegions.map(region => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={selectedRegions.includes(region)}
                    onCheckedChange={() => toggleRegion(region)}
                  />
                  <Label
                    htmlFor={`region-${region}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {region}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {/* Owner Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-gray-300">
              Owner
              {selectedOwners.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedOwners.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 max-h-64 overflow-y-auto" align="start">
            <div className="space-y-2">
              {availableOwners.map(owner => (
                <div key={owner} className="flex items-center space-x-2">
                  <Checkbox
                    id={`owner-${owner}`}
                    checked={selectedOwners.includes(owner)}
                    onCheckedChange={() => toggleOwner(owner)}
                  />
                  <Label
                    htmlFor={`owner-${owner}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {owner}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {/* Utilisation Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-gray-300">
              Utilisation
              {(minUtilisation > 0 || maxUtilisation < 100) && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {minUtilisation}%-{maxUtilisation}%
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Minimum Utilisation</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[minUtilisation]}
                    onValueChange={([value]) => onMinUtilisationChange(value)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {minUtilisation}%
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Maximum Utilisation</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[maxUtilisation]}
                    onValueChange={([value]) => onMaxUtilisationChange(value)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {maxUtilisation}%
                  </span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {/* Expiry Days Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-gray-300">
              Expiry
              {expiryDays < 365 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {expiryDays}d
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Expires within (days)</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[expiryDays]}
                  onValueChange={([value]) => onExpiryDaysChange(value)}
                  min={30}
                  max={365}
                  step={30}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {expiryDays}d
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}