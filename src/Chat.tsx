import React, { useState } from "react";
import { useOpenaiKey } from "./hooks/useOpenaiKey";
import { useSystemPrompt } from "./hooks/useSystemPrompt";
import OpenAi from "openai";
import "./Chat.css"; // Import the CSS file

export const OpenAIChat: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useOpenaiKey();
  const [systemPrompt, setSystemPrompt] = useSystemPrompt();
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (!openaiKey) throw new Error("Please set an OpenAI API key.");

      const openai = new OpenAi({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true,
      });
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt || "" },
          { role: "user", content: userPrompt },
        ],
      });
      setResponse(completion.choices[0]?.message?.content || "No response");
    } catch (error) {
      setResponse("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1>AI Chat</h1>
      <div className="input-group">
        <label>
          OpenAI API Key:
          <input
            type="text"
            value={openaiKey || ""}
            onChange={(e) => setOpenaiKey(e.target.value)}
            className="input-field"
          />
        </label>
      </div>
      <div className="input-group">
        <label>
          System Prompt:
          <textarea
            value={systemPrompt || ""}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="input-field"
            rows={4}
          />
        </label>
      </div>
      <div className="input-group">
        <label>
          User Prompt:
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="input-field"
            rows={4}
          />
        </label>
      </div>
      <button onClick={handleSubmit} className="send-button">
        Send
      </button>
      <div className="response-area">{loading ? "Busy..." : response}</div>
    </div>
  );
};
