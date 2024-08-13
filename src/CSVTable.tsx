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
}

const CSVTable: React.FC<CSVTableProps> = ({
  cumulativeCSV,
  // setCumulativeCSV,
  filters,
  setFilters,
  filterText,
  setFilterText,
  clearCSVData,
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
        style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px" }}
      >
        {Object.entries(filters).flatMap(([column, columnFilters]) =>
          columnFilters.map((filter, index) => (
            <div
              key={`${column}-${index}`}
              className="filter-tag"
              style={{ color: "red", margin: "0 5px" }}
            >
              {`${column} = "${filter}"`}{" "}
              <button onClick={() => removeFilter(column, filter)}>x</button>
            </div>
          ))
        )}
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
        <button onClick={downloadCSV} className="export-button">
          Export CSV
        </button>
        <button onClick={clearCSVData} className="clear-button">
          Clear
        </button>
      </div>
      {renderFilters()}
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
          {filteredCSV.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
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
          ))}
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
  rows.filter((row, rowIndex) => {
    // Always include the header row
    if (rowIndex === 0) return true;

    // Check for excluded filters
    const excludesFilters = Object.entries(excludes).some(
      ([column, columnFilters]) => {
        const headers = rows[0];
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
  });

export default CSVTable;