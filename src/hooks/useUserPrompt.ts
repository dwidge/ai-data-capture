import { useLocalStorage } from "./useLocalStorage";

export const useUserPrompt = () => useLocalStorage("user_prompt", null);
