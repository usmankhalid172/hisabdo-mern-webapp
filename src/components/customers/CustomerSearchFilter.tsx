'use client';

import { FilterBar } from '@/components/ui/FilterBar';
import { Button } from '@/components/ui/Button';

export type CustomerFilterType =
  | 'all'
  | 'receivable'
  | 'payable'
  | 'settled';

interface CustomerSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterType: CustomerFilterType;
  onFilterChange: (value: CustomerFilterType) => void;
  customerCount: number;
}

export default function CustomerSearchFilter({
  searchValue,
  onSearchChange,
  filterType,
  onFilterChange,
  customerCount,
}: CustomerSearchFilterProps) {
  const filters: { label: string; value: CustomerFilterType }[] = [
    { label: `All Parties (${customerCount})`, value: 'all' },
    { label: 'Lene Hain (Debit)', value: 'receivable' },
    { label: 'Dene Hain (Credit)', value: 'payable' },
    { label: 'Settled (0)', value: 'settled' },
  ];

  return (
    <FilterBar
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name, phone or email..."
    >
      {filters.map((filter) => (
        <Button
          key={filter.value}
          type="button"
          size="sm"
          variant={filterType === filter.value ? 'primary' : 'secondary'}
          onClick={() => onFilterChange(filter.value)}
          aria-pressed={filterType === filter.value}
        >
          {filter.label}
        </Button>
      ))}
    </FilterBar>
  );
}
