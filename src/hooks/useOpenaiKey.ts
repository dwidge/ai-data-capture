import { useLocalStorage } from "./useLocalStorage";

export const useOpenaiKey = () => useLocalStorage("openai_key", null);
