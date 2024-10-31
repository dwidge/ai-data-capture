import React, { useEffect, useRef } from "react";
import { FilterTags } from "./FilterTags";
import { downloadBlob } from "./utils/downloadBlob";
import { updateCumulativeCSV } from "./utils/updateCumulativeCSV";

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
  listName: string;
}

const CSVTable: React.FC<CSVTableProps> = ({
  cumulativeCSV,
  setCumulativeCSV,
  filters,
  setFilters,
  filterText,
  setFilterText,
  clearCSVData,
  highlightedRows,
  listName,
}) => {
  const bottomRef = useRef<HTMLTableSectionElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const importCSV = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const csvText = reader.result as string;
      setCumulativeCSV(updateCumulativeCSV(csvText, cumulativeCSV));
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const filteredCSVToExport = applyFiltersToCSV(
      cumulativeCSV,
      filters,
      filterText
    );
    const csvContent = filteredCSVToExport
      .map((row) => row.map(wrapInQuotes).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, `${listName || "list"}.csv`);
  };

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [cumulativeCSV]);

  return (
    <div className="csv-container">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => importCSV(e.target.files?.[0])}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <div
        className="csv-table-buttons"
        style={{ display: "flex", alignItems: "center", gap: "1em" }}
      >
        <input
          type="text"
          value={filterText}
          onChange={handleFilterChange}
          className="input-field"
          placeholder="Search"
        />
        <button onClick={clearCSVData} className="danger-button">
          Clear Data
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="action-button"
        >
          Import CSV
        </button>
        <button onClick={exportCSV} className="action-button">
          Export CSV
        </button>
      </div>
      {!!Object.entries(filters).length && (
        <FilterTags filters={filters} setFilters={setFilters} />
      )}
      <div className="csv-table-container">
        <table className="csv-table">
          <thead>
            <tr>
              {filteredCSV.length > 0 &&
                filteredCSV[0].map((header, index) => (
                  <th
                    key={index}
                    onClick={() => handleCellClick(header, header)}
                  >
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
        <div ref={bottomRef}></div>
      </div>
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
    const excludesFilters = Object.entries(excludes).some(
      ([column, columnFilters]) => {
        const colIndex = headers.indexOf(column);
        if (colIndex === -1) return false;

        return columnFilters.some(
          (filter) => row[colIndex].toLowerCase() === filter.toLowerCase()
        );
      }
    );

    const matchesFilterText = row.some((cell) =>
      cell.toLowerCase().includes(include.toLowerCase())
    );

    return !excludesFilters && matchesFilterText;
  };

export default CSVTable;
