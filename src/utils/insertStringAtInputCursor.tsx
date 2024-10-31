export const insertStringAtInputCursor = (stringToInsert: string) => {
  const element = document.querySelector(
    'textarea[name="template"], input[name="body"]'
  ) as HTMLTextAreaElement | HTMLInputElement;
  console.log("insertStringAtInputCursor1", element);

  if (!element) return;

  const start = element.selectionStart ?? 0;
  const end = element.selectionEnd ?? 0;

  const oldString = element.value;
  console.log("insertStringAtInputCursor2", oldString);
  const newString =
    oldString.substring(0, start) +
    `{${stringToInsert}}` +
    oldString.substring(end);

  console.log("insertStringAtInputCursor3", newString);
  element.value = newString;
  element.focus();
  // Select the inserted string
  element.setSelectionRange(start, start + stringToInsert.length + 2);
};
