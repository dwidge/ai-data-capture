import React from "react";

interface SettingsContainerProps {
  openaiKey: string | null;
  systemPrompt: string | null;
  onOpenaiKeyChange: (value: string | null) => void;
  onSystemPromptChange: (value: string | null) => void;
}

export const SettingsContainer: React.FC<SettingsContainerProps> = ({
  openaiKey,
  systemPrompt,
  onOpenaiKeyChange,
  onSystemPromptChange,
}) => (
  <div className="settings-container">
    <label>
      OpenAI API Key:
      <input
        type="text"
        value={openaiKey || ""}
        onChange={(e) => onOpenaiKeyChange(e.target.value || null)}
        className="input-field"
      />
    </label>
    <label className="stretch">
      System Prompt:
      <textarea
        value={systemPrompt || ""}
        onChange={(e) => onSystemPromptChange(e.target.value || null)}
        className="input-field"
        rows={4}
      />
    </label>
  </div>
);
