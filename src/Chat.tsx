import React, { useState } from "react";
import { useOpenaiKey } from "./hooks/useOpenaiKey";
import { useSystemPrompt } from "./hooks/useSystemPrompt";
import OpenAi from "openai";
import "./Chat.css";
import { parseCSVLine } from "./utils/parseCSVLine";

export const OpenAIChat: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useOpenaiKey();
  const [systemPrompt, setSystemPrompt] = useSystemPrompt();
  const [userPrompt, setUserPrompt] = useState<string | null>("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [collectCSV, setCollectCSV] = useState<boolean>(false);
  const [cumulativeCSV, setCumulativeCSV] = useState<string[][]>([]);

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string | null>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value || null);
    };

  const handleCollectCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectCSV(e.target.checked);
    if (!e.target.checked) {
      setCumulativeCSV([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!openaiKey) throw new Error("Please set an OpenAI API key.");
      const openai = createOpenAiInstance(openaiKey);

      const effectiveSystemPrompt = prepareSystemPrompt();

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: effectiveSystemPrompt },
          { role: "user", content: userPrompt || "" },
        ],
      });

      handleResponse(completion.choices[0]?.message?.content || "No response");
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

  const csvHeaderRow = cumulativeCSV[0]?.join(",");
  const prepareSystemPrompt = () => {
    const headersString = cumulativeCSV.length > 0 ? csvHeaderRow : "";

    return collectCSV
      ? `${
          systemPrompt || ""
        }\nalways respond in csv\nexisting headers:\n${headersString}`
      : systemPrompt || "";
  };

  const handleResponse = (newResponse: string) => {
    setResponse(newResponse);
    if (collectCSV) {
      updateCumulativeCSV(newResponse);
    }
  };

  const handleError = (error: unknown) => {
    setResponse("Error: " + (error as Error).message);
  };

  const updateCumulativeCSV = (newData: string) => {
    const lines = newData.trim().split("\n").map(parseCSVLine);

    if (lines.length === 0) return;

    if (isLineHeaders(cumulativeCSV[0] ?? [], lines[0])) {
      const newHeaders = lines[0];
      const newRows = lines.slice(1);
      setCumulativeCSV((prevCSV) =>
        createUpdatedCSV(prevCSV, newHeaders, newRows)
      );
    } else {
      const newHeaders = cumulativeCSV[0];
      const newRows = lines;
      setCumulativeCSV((prevCSV) =>
        createUpdatedCSV(prevCSV, newHeaders, newRows)
      );
    }
  };

  const isLineHeaders = (currentHeaders: string[], line: string[]) =>
    currentHeaders.length === 0 ||
    currentHeaders.some((col) => line.includes(col));

  const createUpdatedCSV = (
    prevCSV: string[][],
    newHeaders: string[],
    lines: string[][]
  ) => {
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
  const renderCSVTable = () => (
    <div className="csv-table-container">
      <table className="csv-table">
        <thead>
          <tr>
            {cumulativeCSV[0].map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cumulativeCSV.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="main-container">
      <div className="chat-container">
        <h1>AI Chat</h1>
        <div className="input-group">
          <label>
            OpenAI API Key:
            <input
              type="text"
              value={openaiKey || ""}
              onChange={handleInputChange(setOpenaiKey)}
              className="input-field"
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            System Prompt:
            <textarea
              value={systemPrompt || ""}
              onChange={handleInputChange(setSystemPrompt)}
              className="input-field"
              rows={4}
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            User Prompt:
            <textarea
              value={userPrompt || ""}
              onChange={handleInputChange(setUserPrompt)}
              className="input-field"
              rows={4}
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            <input
              type="checkbox"
              checked={collectCSV}
              onChange={handleCollectCSVChange}
            />{" "}
            CSV
          </label>
        </div>
        <button onClick={handleSubmit} className="send-button">
          Send
        </button>
        <div className="response-area break-word">
          {loading ? "Busy..." : response}
        </div>
      </div>
      {collectCSV && cumulativeCSV.length > 0 && renderCSVTable()}
    </div>
  );
};
