import { useEffect, useState } from "react";

export function useLocalStorage(key: string, initialValue: string | null) {
  const [storedValue, setStoredValue] = useState<string | null>(
    () => window.localStorage.getItem(key) ?? initialValue
  );

  useEffect(() => {
    if (storedValue == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
