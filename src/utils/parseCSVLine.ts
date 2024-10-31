export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result.map((value) => value.trim().replace(/^"(.*)"$/, "$1"));
};

export const parseCsvDoc = (text: string): string[][] => {
  return text
    .trim()
    .split("\n")
    .map((row) => parseCSVLine(row));
};
