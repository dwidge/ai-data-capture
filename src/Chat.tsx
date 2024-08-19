import React, { useState, useRef, useEffect } from "react";
import { useOpenaiKey } from "./hooks/useOpenaiKey";
import { useSystemPrompt } from "./hooks/useSystemPrompt";
import { useUserPrompt } from "./hooks/useUserPrompt";
import { useSettings } from "./hooks/useSettings";
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
  const [settings, setSettings] = useSettings();
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

  const handleSubmit = async (userPrompt: string | null) => {
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
      <div className="user-input-container">
        <div className="input-group">
          <label>
            <textarea
              ref={textareaRef}
              value={userPrompt || ""}
              onChange={handleInputChange(setUserPrompt)}
              onPaste={handlePaste}
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
            onClick={() => handleSubmit(userPrompt)}
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
