import { describe, it, expect } from "vitest";
import { trimResponse } from "./trimResponse";

describe("trimResponse", () => {
  it("removes triple backticks with no language specified", () => {
    const input = "```\nHello World\n```";
    const expectedOutput = "Hello World";
    expect(trimResponse(input)).toEqual(expectedOutput);
  });

  it("removes triple backticks with a language specified", () => {
    const input = "```js\nconst a = 1;\n```";
    const expectedOutput = "const a = 1;";
    expect(trimResponse(input)).toEqual(expectedOutput);
  });

  it("handles input with leading and trailing spaces", () => {
    const input = "   ```\n   Some code here   \n   ```   ";
    const expectedOutput = "Some code here";
    expect(trimResponse(input)).toEqual(expectedOutput);
  });

  it("returns empty string when input is just backticks", () => {
    const input = "```";
    const expectedOutput = "";
    expect(trimResponse(input)).toEqual(expectedOutput);
  });

  it("returns empty string when input is completely empty", () => {
    const input = "";
    const expectedOutput = "";
    expect(trimResponse(input)).toEqual(expectedOutput);
  });
});
