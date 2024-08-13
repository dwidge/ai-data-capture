export const useJson = <T>([value, setValue]: [
  string | null,
  React.Dispatch<React.SetStateAction<string | null>>
]) =>
  [
    value != null ? (JSON.parse(value) as T) : null,
    (value: T | null) => setValue(value != null ? JSON.stringify(value) : null),
  ] as const;
