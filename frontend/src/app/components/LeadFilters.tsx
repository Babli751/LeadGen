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
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search within results */}
          <div className="min-w-[200px]">
            <Input
              placeholder="Lead'lerde ara..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Contact info filters */}
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.hasEmail}
                onChange={(e) => handleFilterChange({ hasEmail: e.target.checked })}
                className="h-4 w-4"
              />
              E-posta var
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.hasPhone}
                onChange={(e) => handleFilterChange({ hasPhone: e.target.checked })}
                className="h-4 w-4"
              />
              Telefon var
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.hasWebsite}
                onChange={(e) => handleFilterChange({ hasWebsite: e.target.checked })}
                className="h-4 w-4"
              />
              Website var
            </label>
          </div>

          {/* Status filter */}
          <div className="min-w-[120px]">
            <select
              value={filters.statusFilter}
              onChange={(e) => handleFilterChange({ statusFilter: e.target.value as FilterOptions['statusFilter'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="new">Yeni</option>
              <option value="email_sent">E-posta Gönderildi</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {filteredCount} / {totalCount} lead
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            disabled={!filters.hasEmail && !filters.hasPhone && !filters.hasWebsite && filters.statusFilter === 'all' && !filters.searchTerm}
          >
            Filtreleri Temizle
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { FilterOptions };
