import "./PlaceholderButtons.css";

export const PlaceholderButtons = ({
  headers = [] as string[],
  name = null as string | null,
  setField = (_name?: string, _value?: string) => {},
}) => {
  const handleButtonClick = (header: string) => {
    if (!name) return;

    const element = document.querySelector(
      'textarea[name="' + name + '"], input[name="' + name + '"]'
    ) as HTMLTextAreaElement | HTMLInputElement;

    if (!element) return;

    const start = element.selectionStart ?? 0;
    const end = element.selectionEnd ?? 0;

    const oldString = element.value;
    const newString =
      oldString.substring(0, start) + `{${header}}` + oldString.substring(end);

    element.value = newString;
    element.focus();
    element.setSelectionRange(start, start + header.length + 2);

    setField(name, newString);
  };

  return (
    <div className="placeholder-buttons">
      {headers.map((header) => (
        <button key={header} onClick={() => handleButtonClick(header)}>
          {header}
        </button>
      ))}
    </div>
  );
};
