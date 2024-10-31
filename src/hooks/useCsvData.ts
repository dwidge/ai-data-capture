import { useJson } from "./useJson";
import { useLocalStorage } from "./useLocalStorage";

export const useCsvData = () =>
  useJson<string[][]>(useLocalStorage("csv_data", null), []);
