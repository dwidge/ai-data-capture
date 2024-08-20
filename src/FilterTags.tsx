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
    <div
      className="filter-tags"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(15em, 1fr))",
        gap: ".5em",
      }}
    >
      {Object.entries(filters).flatMap(([column, columnFilters]) =>
        columnFilters.map((filter, index) => (
          <button
            key={`${column}-${index}`}
            className="filter-tag"
            style={{
              padding: 0,
              color: "white",
              backgroundColor: "transparent",
              borderRadius: "5px",
              borderColor: "darkred",
              borderWidth: 2,
              flex: 1,
              display: "flex",
              gap: ".5em",
            }}
            onClick={() => removeFilter(column, filter)}
            aria-label={`Remove filter ${filter} from ${column}`}
          >
            <div
              style={{
                fontSize: "0.9em",
                fontStyle: "italic",
                padding: ".3em .5em",
                backgroundColor: "darkred",
              }}
            >
              {column}
            </div>
            <div
              style={{
                flex: 1,
                fontSize: "0.9em",
                padding: ".3em .5em",
              }}
            >
              {filter}
            </div>
          </button>
        ))
      )}
    </div>
  );
};
