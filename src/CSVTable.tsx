import React from "react";

interface CSVTableProps {
  cumulativeCSV: string[][];
  setCumulativeCSV: React.Dispatch<React.SetStateAction<string[][]>>;
  filters: { [column: string]: string[] };
  setFilters: React.Dispatch<
    React.SetStateAction<{ [column: string]: string[] }>
  >;
  filterText: string;
  setFilterText: React.Dispatch<React.SetStateAction<string>>;
  clearCSVData: () => void;
  highlightedRows: number[];
}

const CSVTable: React.FC<CSVTableProps> = ({
  cumulativeCSV,
  filters,
  setFilters,
  filterText,
  setFilterText,
  clearCSVData,
  highlightedRows,
}) => {
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };

  const filteredCSV = applyFiltersToCSV(cumulativeCSV, filters, filterText);

  const handleCellClick = (cell: string, column: string) => {
    if (!filters[column]?.includes(cell)) {
      setFilters((prev) => ({
        ...prev,
        [column]: [...(prev[column] || []), cell],
      }));
    }
  };

  const downloadCSV = () => {
    const filteredCSVToExport = applyFiltersToCSV(
      cumulativeCSV,
      filters,
      filterText
    );
    const csvContent = filteredCSVToExport
      .map((row) => row.map(wrapInQuotes).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "cumulative.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFilters = () => {
    return (
      <div
        className="filter-tags"
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: ".5em",
        }}
      >
        <label>Exclude</label>
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

  const removeFilter = (column: string, filter: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: prev[column].filter((f) => f !== filter),
    }));
  };

  return (
    <div className="csv-table-container">
      <div className="csv-table-buttons">
        <button onClick={clearCSVData} className="clear-button">
          Clear Data
        </button>
        <button onClick={downloadCSV} className="export-button">
          Export CSV
        </button>
      </div>
      {!!Object.entries(filters).length && renderFilters()}
      <div className="input-group">
        <label>
          Search
          <input
            type="text"
            value={filterText}
            onChange={handleFilterChange}
            className="input-field"
          />
        </label>
      </div>
      <table className="csv-table">
        <thead>
          <tr>
            {filteredCSV.length > 0 &&
              filteredCSV[0].map((header, index) => (
                <th key={index} onClick={() => handleCellClick(header, header)}>
                  {header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {cumulativeCSV.slice(1).map((row, rowIndex) =>
            filterRow(cumulativeCSV[0], filters, filterText)(row) ? (
              <tr
                key={rowIndex}
                style={{
                  backgroundColor: highlightedRows.includes(rowIndex + 1)
                    ? "#aaaaaa44"
                    : "transparent",
                }}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    onClick={() =>
                      handleCellClick(cell, filteredCSV[0][cellIndex])
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ) : null
          )}
        </tbody>
      </table>
    </div>
  );
};

const wrapInQuotes = (value: string) => {
  return value.includes(",") ? `"${value}"` : value;
};

const applyFiltersToCSV = (
  rows: string[][],
  excludes: { [column: string]: string[] },
  include: string
): string[][] =>
  [rows[0] ?? []].concat(
    rows.slice(1).filter(filterRow(rows[0], excludes, include))
  );

const filterRow =
  (
    headers: string[],
    excludes: { [column: string]: string[] },
    include: string
  ) =>
  (row: string[]) => {
    // Check for excluded filters
    const excludesFilters = Object.entries(excludes).some(
      ([column, columnFilters]) => {
        const colIndex = headers.indexOf(column); // Find the index of the column
        if (colIndex === -1) return false; // Column doesn't exist

        // Check if any filter applies to this column
        return columnFilters.some(
          (filter) => row[colIndex].toLowerCase() === filter.toLowerCase()
        );
      }
    );

    // Check for search text in any cell
    const matchesFilterText = row.some((cell) =>
      cell.toLowerCase().includes(include.toLowerCase())
    );

    // Return true only if the row does not match any excludes AND does match the filter text
    return !excludesFilters && matchesFilterText;
  };

export default CSVTable;
