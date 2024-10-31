import React from "react";

export const useJson = <T>(
  [value, setValue]: readonly [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ],
  init: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // Parse the JSON value if available, otherwise use `init` as the initial value.
  const parsedValue = value != null ? (JSON.parse(value) as T) : init;

  // Define the setter function with correct type handling.
  const setJsonValue: React.Dispatch<React.SetStateAction<T>> = (newValue) => {
    setValue((_prevValue) => {
      const resolvedValue =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(parsedValue)
          : newValue;

      return resolvedValue != null ? JSON.stringify(resolvedValue) : null;
    });
  };

  return [parsedValue, setJsonValue] as const;
};
