import React, { useState, useRef } from "react"; // Added import for useRef
import { useOpenaiKey } from "./hooks/useOpenaiKey";
import { useSystemPrompt } from "./hooks/useSystemPrompt";
import { useUserPrompt } from "./hooks/useUserPrompt";
import { useSettings } from "./hooks/useSettings";
import OpenAi from "openai";
import "./Chat.css";
import { parseCSVLine } from "./utils/parseCSVLine";
import CSVTable from "./CSVTable";
import { SettingsContainer } from "./Settings";

export const OpenAIChat: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useOpenaiKey();
  const [systemPrompt, setSystemPrompt] = useSystemPrompt();
  const [userPrompt, setUserPrompt] = useUserPrompt();
  const [settings, setSettings] = useSettings();
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cumulativeCSV, setCumulativeCSV] = useState<string[][]>([]);
  const [filters, setFilters] = useState<{ [column: string]: string[] }>({});
  const [filterText, setFilterText] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [highlightedRows, setHighlightedRows] = useState<number[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string | null>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value || null);
    };

  const handleCollectCSVChange = (checked: boolean) => {
    setSettings({ ...settings, csv: checked });
    if (!checked) {
      setCumulativeCSV([]);
      setFilters({});
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!openaiKey) throw new Error("Please set an OpenAI API key.");
      const openai = createOpenAiInstance(openaiKey);

      const effectiveSystemPrompt = prepareSystemPrompt(
        systemPrompt,
        settings?.csv ?? false,
        cumulativeCSV
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: effectiveSystemPrompt },
          { role: "user", content: userPrompt || "" },
        ],
      });

      const trimmedResponse =
        completion.choices[0]?.message?.content?.replace(/^```|```$/g, "") ||
        "No response";
      handleResponse(trimmedResponse);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const createOpenAiInstance = (openaiKey: string) => {
    return new OpenAi({
      apiKey: openaiKey,
      dangerouslyAllowBrowser: true,
    });
  };

  const handleResponse = (newResponse: string) => {
    setResponse(newResponse);
    if (settings)
      setCumulativeCSV(updateCumulativeCSV(newResponse, cumulativeCSV));

    const newRowsCount = newResponse.trim().split("\n").length;
    setHighlightedRows(
      [...Array(newRowsCount).keys()].map((i) => cumulativeCSV.length + i)
    );
  };

  const handleError = (error: unknown) => {
    setResponse("Error: " + (error as Error).message);
  };

  const clearCSVData = () => {
    setCumulativeCSV([]);
    setFilters({});
    setFilterText("");
    setHighlightedRows([]); // Reset highlighted rows
  };

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  const handleTextareaFocus = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
  };

  const deleteHighlightedRows = () => {
    const newCumulativeCSV = cumulativeCSV.filter(
      (_, index) => !highlightedRows.includes(index)
    );
    setCumulativeCSV(newCumulativeCSV);
    setHighlightedRows([]);
  };

  return (
    <div className="main-container">
      <div className="user-input-container">
        <div className="input-group">
          <label>
            <textarea
              ref={textareaRef}
              value={userPrompt || ""}
              onChange={handleInputChange(setUserPrompt)}
              className="input-field"
              rows={4}
              onFocus={handleTextareaFocus}
            />
          </label>
        </div>
        <div className="csv-table-buttons">
          <button
            onClick={toggleSettings}
            className="expander-button"
            style={{ flex: 0 }}
          >
            Settings
          </button>
          <button
            onClick={deleteHighlightedRows}
            className={highlightedRows.length > 0 ? "undo-button" : ""}
            disabled={highlightedRows.length === 0}
          >
            Undo
          </button>
          <button
            onClick={handleSubmit}
            className="send-button"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : "Submit"}
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsContainer
          openaiKey={openaiKey}
          systemPrompt={systemPrompt}
          settings={settings}
          onOpenaiKeyChange={setOpenaiKey}
          onSystemPromptChange={setSystemPrompt}
          onCollectCSVChange={handleCollectCSVChange}
        />
      )}

      {settings?.csv ? (
        <CSVTable
          cumulativeCSV={cumulativeCSV}
          setCumulativeCSV={setCumulativeCSV}
          filters={filters}
          setFilters={setFilters}
          filterText={filterText}
          setFilterText={setFilterText}
          clearCSVData={clearCSVData}
          highlightedRows={highlightedRows}
        />
      ) : (
        <div className="response-area break-word">
          {loading ? "Busy..." : response}
        </div>
      )}
    </div>
  );
};

const prepareSystemPrompt = (
  systemPrompt: string | null,
  collectCSV: boolean,
  cumulativeCSV: string[][]
): string => {
  const headersString =
    cumulativeCSV.length > 0 ? cumulativeCSV[0]?.join(",") : "";
  return collectCSV
    ? `${
        systemPrompt || ""
      }\nalways respond in csv\nexisting headers:\n${headersString}`
    : systemPrompt || "";
};

const updateCumulativeCSV = (
  newData: string,
  cumulativeCSV: string[][]
): string[][] => {
  const lines = newData.trim().split("\n").map(parseCSVLine);
  if (lines.length === 0) return cumulativeCSV;

  const isLineHeaders = (currentHeaders: string[], line: string[]) =>
    currentHeaders.length === 0 ||
    currentHeaders.some((col) => line.includes(col));

  const createUpdatedCSV = (
    prevCSV: string[][],
    newHeaders: string[],
    lines: string[][]
  ): string[][] => {
    const existingHeaders = new Set(prevCSV.length > 0 ? prevCSV[0] : []);
    const existingContent = prevCSV.slice(1);
    const headerList = [...existingHeaders].concat(
      newHeaders.filter((header) => !existingHeaders.has(header))
    );

    const updatedCSV: string[][] = [headerList];

    existingContent.forEach((row) => {
      const updatedRow = headerList.map((_, idx) => {
        return row[idx] ?? "";
      });
      updatedCSV.push(updatedRow);
    });

    lines.forEach((row) => {
      const updatedRow = headerList.map((header) => {
        const idx = newHeaders.indexOf(header);
        return idx !== -1 ? row[idx] ?? "" : "";
      });
      updatedCSV.push(updatedRow);
    });

    return updatedCSV;
  };

  if (isLineHeaders(cumulativeCSV[0] ?? [], lines[0])) {
    const newHeaders = lines[0];
    const newRows = lines.slice(1);
    return createUpdatedCSV(cumulativeCSV, newHeaders, newRows);
  } else {
    const newHeaders = cumulativeCSV[0];
    const newRows = lines;
    return createUpdatedCSV(cumulativeCSV, newHeaders, newRows);
  }
};
