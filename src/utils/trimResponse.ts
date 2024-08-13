/**
 * Trims the provided completion string by removing Markdown code block backticks
 * and optional language specifiers. It cleans up the string by removing any leading
 * and trailing whitespace after processing.
 *
 * This function specifically targets:
 * - The starting triple backticks (```), optionally followed by a language specifier,
 *   and any leading spaces or newlines.
 * - The ending triple backticks (```), allowing for any whitespace or newlines
 *   that may follow the content.
 *
 * @param {string} completion - The string containing the completion text, which may include
 *                              Markdown code blocks that need to be trimmed.
 * @returns {string} - The trimmed string with any Markdown code block formatting removed
 *                    and no leading or trailing whitespace.
 */
export const trimResponse = (completion: string) =>
  completion
    .replace(/^\s*```(?:\w+)?\s*\n/, "") // Remove starting backticks and optional language specifier, and any leading spaces/newline
    .replace(/\s*```[\s\S]*$/, "") // Remove entire ending backticks (if any), accounting for whitespace/newlines anywhere after initial content
    .trim(); // Trim any remaining leading/trailing whitespace
