import { useState, useEffect } from "react";

export function useSystemPrompt() {
  const [prompt, setPrompt] = useState<string | null>(() => {
    return localStorage.getItem("system_prompt");
  });

  useEffect(() => {
    if (prompt) {
      localStorage.setItem("system_prompt", prompt);
    }
  }, [prompt]);

  return [prompt, setPrompt] as const;
}
