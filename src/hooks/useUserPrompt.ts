import { useState, useEffect } from "react";

export function useUserPrompt() {
  const [prompt, setPrompt] = useState<string | null>(() => {
    return localStorage.getItem("user_prompt");
  });

  useEffect(() => {
    if (prompt) {
      localStorage.setItem("user_prompt", prompt);
    }
  }, [prompt]);

  return [prompt, setPrompt] as const;
}
