import { useJson } from "./useJson";
import { useLocalStorage } from "./useLocalStorage";

export const useSettings = () =>
  useJson<{ csv?: boolean }>(useLocalStorage("checkbox_state", null));
