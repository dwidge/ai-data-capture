import { useLocalStorage } from "./useLocalStorage";

export const useListName = () => useLocalStorage("list_name", "");
