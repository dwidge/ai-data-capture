import React, { useState, useRef, useEffect } from "react";
import { useOpenaiKey } from "./hooks/useOpenaiKey";
import { useSystemPrompt } from "./hooks/useSystemPrompt";
import { useUserPrompt } from "./hooks/useUserPrompt";
import OpenAi from "openai";
import "./Chat.css";
import CSVTable from "./CSVTable";
import { SettingsContainer } from "./Settings";
import { trimResponse } from "./utils/trimResponse";
import { updateCumulativeCSV } from "./utils/updateCumulativeCSV";

export const OpenAIChat: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useOpenaiKey();
  const [systemPrompt, setSystemPrompt] = useSystemPrompt();
  const [userPrompt, setUserPrompt] = useUserPrompt();
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cumulativeCSV, setCumulativeCSV] = useState<string[][]>([]);
  const [filters, setFilters] = useState<{ [column: string]: string[] }>({});
  const [filterText, setFilterText] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [highlightedRows, setHighlightedRows] = useState<number[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Use effect to focus on the textarea when the component mounts or when the window gets focused
  useEffect(() => {
    const handleFocus = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleSubmit = async (userPrompt: string | null) => {
    setLoading(true);
    try {
      if (!openaiKey) throw new Error("Please set an OpenAI API key.");
      const openai = createOpenAiInstance(openaiKey);

      const effectiveSystemPrompt = prepareSystemPrompt(
        systemPrompt,
        cumulativeCSV
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: effectiveSystemPrompt },
          { role: "user", content: userPrompt || "" },
        ],
      });

      handleResponse(
        trimResponse(completion.choices[0]?.message?.content ?? "")
      );
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
    const newRows = updateCumulativeCSV(newResponse, cumulativeCSV);
    setCumulativeCSV(newRows);
    const oldWithoutHeader =
      cumulativeCSV.length > 0 ? cumulativeCSV.length - 1 : 0;
    const newWithoutHeader = newRows.length > 0 ? newRows.length - 1 : 0;
    const newRowsCount = newWithoutHeader - oldWithoutHeader;
    setHighlightedRows(
      [...Array(newRowsCount).keys()].map((i) => 1 + oldWithoutHeader + i)
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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.length > 100) {
      e.preventDefault();
      setUserPrompt(pastedText);
      handleSubmit(pastedText);
    }
  };

  return (
    <div className="main-container">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1em",
        }}
      >
        <div>All: {(cumulativeCSV.length || 1) - 1}</div>
        <div>New: {highlightedRows.length}</div>
        <button
          onClick={toggleSettings}
          className="expander-button"
          style={{ flex: 0 }}
        >
          Settings
        </button>
      </div>

      {isSettingsOpen ? (
        <>
          <SettingsContainer
            openaiKey={openaiKey}
            systemPrompt={systemPrompt}
            onOpenaiKeyChange={setOpenaiKey}
            onSystemPromptChange={setSystemPrompt}
          />
          <div className="response-area break-word">
            {loading ? "Busy..." : response}
          </div>
        </>
      ) : (
        <ChatContainer
          cumulativeCSV={cumulativeCSV}
          setCumulativeCSV={setCumulativeCSV}
          filters={filters}
          setFilters={setFilters}
          filterText={filterText}
          setFilterText={setFilterText}
          clearCSVData={clearCSVData}
          highlightedRows={highlightedRows}
          loading={loading}
          response={response}
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          handleSubmit={handleSubmit}
          deleteHighlightedRows={deleteHighlightedRows}
          handleTextareaFocus={handleTextareaFocus}
          handlePaste={handlePaste}
          textareaRef={textareaRef}
        />
      )}
    </div>
  );
};

const ChatContainer: React.FC<{
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
  loading: boolean;
  response: string | null;
  userPrompt: string | null;
  setUserPrompt: React.Dispatch<React.SetStateAction<string | null>>;
  handleSubmit: (userPrompt: string | null) => void;
  deleteHighlightedRows: () => void;
  handleTextareaFocus: () => void;
  handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}> = ({
  cumulativeCSV,
  setCumulativeCSV,
  filters,
  setFilters,
  filterText,
  setFilterText,
  clearCSVData,
  highlightedRows,
  loading,
  userPrompt,
  setUserPrompt,
  handleSubmit,
  deleteHighlightedRows,
  handleTextareaFocus,
  handlePaste,
  textareaRef,
}) => (
  <>
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
    <div className="user-input-container">
      <div
        className="input-group"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: "1em",
        }}
      >
        <label
          style={{
            flexGrow: 1,
            flex: 1,
            display: "flex",
            padding: 0,
            margin: 0,
          }}
        >
          <textarea
            ref={textareaRef}
            value={userPrompt || ""}
            onChange={(e) => setUserPrompt(e.target.value || null)}
            onPaste={handlePaste}
            className="input-field"
            style={{ height: "100%", margin: 0 }}
            onFocus={handleTextareaFocus}
          />
        </label>
        <div
          className="csv-table-buttons"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            onClick={deleteHighlightedRows}
            className={highlightedRows.length > 0 ? "undo-button" : ""}
            disabled={highlightedRows.length === 0}
          >
            Undo
          </button>
          <button
            onClick={() => handleSubmit(userPrompt)}
            className="send-button"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : "Submit"}
          </button>
        </div>
      </div>
    </div>
  </>
);

const prepareSystemPrompt = (
  systemPrompt: string | null,
  cumulativeCSV: string[][]
): string => {
  const headersString =
    cumulativeCSV.length > 0 ? cumulativeCSV[0]?.join(",") : "";
  return `${
    systemPrompt || ""
  }\nalways respond in csv\nexisting headers:\n${headersString}`;
};
