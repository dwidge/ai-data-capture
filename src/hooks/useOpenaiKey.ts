import { useState, useEffect } from "react";

export function useOpenaiKey() {
  const [key, setKey] = useState<string | null>(() => {
    return localStorage.getItem("openai_key");
  });

  useEffect(() => {
    if (key) {
      localStorage.setItem("openai_key", key);
    }
  }, [key]);

  return [key, setKey] as const;
}
