import { useState } from 'react';
import { Filter, X, Calendar, Hash, Type } from 'lucide-react';
import { ParsedData } from '@/utils/dataParser';

interface AdvancedFiltersProps {
  data: ParsedData;
  onFilter: (filteredRows: any[]) => void;
}

export const AdvancedFilters = ({ data, onFilter }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);

  const applyFilters = () => {
    const filtered = data.rows.filter(row => {
      return Object.entries(filters).every(([column, value]) => {
        if (!value) return true;
        const cellValue = String(row[column]).toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });
    onFilter(filtered);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter(data.rows);
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-accent flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
        </button>
        {Object.keys(filters).some(k => filters[k]) && (
          <button onClick={clearFilters} className="text-sm text-destructive flex items-center gap-1">
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {data.headers.map(header => {
            const type = data.types[header];
            const Icon = type === 'number' ? Hash : type === 'date' ? Calendar : Type;
            
            return (
              <div key={header} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  {header}
                </label>
                <input
                  type="text"
                  placeholder={`Filter ${header}...`}
                  value={filters[header] || ''}
                  onChange={(e) => {
                    const newFilters = { ...filters, [header]: e.target.value };
                    setFilters(newFilters);
                  }}
                  onKeyUp={applyFilters}
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
