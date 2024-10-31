import React from "react";
import "./SwitchButton.css";

export const SwitchButton = <T extends string>({
  value,
  setValue,
  options,
}: {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  options: { label: string; value: T }[];
}) => (
  <div style={{ display: "flex", gap: "1em" }}>
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => setValue(option.value)}
        className={value === option.value ? "switch-button" : ""}
      >
        {option.label}
      </button>
    ))}
  </div>
);
