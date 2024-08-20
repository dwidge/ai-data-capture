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
      style={{ display: "flex", flexDirection: "column", gap: ".5em" }}
    >
      <div
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
                color: "white",
                backgroundColor: "darkred",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
              onClick={() => removeFilter(column, filter)}
              aria-label={`Remove filter ${filter} from ${column}`}
            >
              <div style={{ fontStyle: "italic" }}>{`${column}`}</div>
              <div>{`"${filter}"`}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
