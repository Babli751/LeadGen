"use client";
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

type FilterOptions = {
  hasEmail: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  statusFilter: 'all' | 'new' | 'email_sent';
  searchTerm: string;
};

type LeadFiltersProps = {
  onFiltersChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
};

export function LeadFilters({ onFiltersChange, totalCount, filteredCount }: LeadFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    hasEmail: false,
    hasPhone: false,
    hasWebsite: false,
    statusFilter: 'all',
    searchTerm: ''
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      hasEmail: false,
      hasPhone: false,
      hasWebsite: false,
      statusFilter: 'all',
      searchTerm: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
          {/* Search within results */}
          <div className="w-full sm:min-w-[200px] sm:max-w-[250px]">
            <Input
              placeholder="Lead'lerde ara..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
              className="w-full mobile-button"
            />
          </div>

          {/* Contact info filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={filters.hasEmail}
                onChange={(e) => handleFilterChange({ hasEmail: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="whitespace-nowrap">E-posta var</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={filters.hasPhone}
                onChange={(e) => handleFilterChange({ hasPhone: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="whitespace-nowrap">Telefon var</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={filters.hasWebsite}
                onChange={(e) => handleFilterChange({ hasWebsite: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="whitespace-nowrap">Website var</span>
            </label>
          </div>

          {/* Status filter */}
          <div className="w-full sm:min-w-[140px] sm:max-w-[160px]">
            <select
              value={filters.statusFilter}
              onChange={(e) => handleFilterChange({ statusFilter: e.target.value as FilterOptions['statusFilter'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mobile-button"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="new">Yeni</option>
              <option value="email_sent">E-posta Gönderildi</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full lg:w-auto">
          <span className="text-sm text-gray-600 whitespace-nowrap order-2 sm:order-1">
            {filteredCount} / {totalCount} lead
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            disabled={!filters.hasEmail && !filters.hasPhone && !filters.hasWebsite && filters.statusFilter === 'all' && !filters.searchTerm}
            className="mobile-button w-full sm:w-auto order-1 sm:order-2"
          >
            Filtreleri Temizle
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { FilterOptions };
