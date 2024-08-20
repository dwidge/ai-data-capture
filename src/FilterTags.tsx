import React from 'react';
import './FilterTags.css';

interface FilterTagsProps {
  filters: { [column: string]: string[] };
  setFilters: React.Dispatch<
    React.SetStateAction<{ [column: string]: string[] }>
  >;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  filters,
  setFilters,
}) => {
  const removeFilter = (column: string, filter: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: prev[column].filter((f) => f !== filter),
    }));
  };

  return (
    <div className="filter-tags">
      {Object.entries(filters).flatMap(([column, columnFilters]) =>
        columnFilters.map((filter, index) => (
          <button
            key={`${column}-${index}`}
            className="filter-tag"
            onClick={() => removeFilter(column, filter)}
            aria-label={`Remove filter ${filter} from ${column}`}
          >
            <div className="filter-tag-column">{column}</div>
            <div className="filter-tag-filter">{filter}</div>
          </button>
        ))
      )}
    </div>
  );
};
