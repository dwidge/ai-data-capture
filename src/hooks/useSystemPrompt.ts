import { useLocalStorage } from "./useLocalStorage";

export const useSystemPrompt = () => useLocalStorage("system_prompt", null);
