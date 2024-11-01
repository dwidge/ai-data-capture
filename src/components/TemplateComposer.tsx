import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useState } from "react";
import { useCsvData } from "../hooks/useCsvData";
import { useTemplateData } from "../hooks/useTemplateData";
import { State } from "../utils/State";
import {
  CustomTemplate,
  CustomTemplateComposer,
} from "./CustomTemplateComposer";
import { EmailTemplate } from "./EmailTemplate";
import { EmailTemplateComposer } from "./EmailTemplateComposer";
import { SwitchButton } from "./SwitchButton";
import "./TemplateComposer.css";

export const TemplateComposer = ({
  csv: [csv] = useCsvData(),
  listName = "template",
  templateData: [templateData, setTemplateData] = useTemplateData(),
  templateString: [templateString, setTemplateString] = useState(""),
  handleDownload = async () => {
    const zipBlob = await createBulkZip(
      templateString,
      csv,
      templateData.filename
    );
    saveAs(zipBlob, listName + ".zip");
  },
  csvHeaders = (csv[0] ?? []) as string[],
}) => (
  <div className="Composer">
    <div
      style={{
        justifyContent: "space-between",
        gap: "1em",
        flexWrap: "wrap",
      }}
    >
      <SwitchButton
        value={templateData.type}
        setValue={(type) =>
          setTemplateData(
            (prev) => ({ ...prev, type } as CustomTemplate | EmailTemplate)
          )
        }
        options={[
          { value: "custom", label: "Custom" },
          { value: "email", label: "Email" },
        ]}
      />
      <div style={{ gap: 10 }}>
        <label>
          Filename
          <input
            type="text"
            value={templateData.filename}
            onChange={(e) =>
              setTemplateData((prev) => ({
                ...prev,
                filename: e.target.value || "",
              }))
            }
          />
        </label>
        <button className="action-button" onClick={handleDownload}>
          Download {Math.max(0, csv.length - 1)}{" "}
          {templateData.type.toLocaleUpperCase()} as ZIP
        </button>
      </div>
    </div>
    {templateData.type === "custom" ? (
      <CustomTemplateComposer
        templateData={[templateData, setTemplateData] as State<CustomTemplate>}
        templateString={[templateString, setTemplateString]}
        headers={csvHeaders}
      />
    ) : (
      <EmailTemplateComposer
        templateData={[templateData, setTemplateData] as State<EmailTemplate>}
        templateString={[templateString, setTemplateString]}
        headers={csvHeaders}
      />
    )}
  </div>
);

const createBulkZip = async (
  template: string,
  csv: string[][],
  filenamePattern = "template{#}.txt"
) => {
  const zip = new JSZip();

  for (let i = 1; i < csv.length; i++) {
    const headers = ["#", ...csv[0]];
    const row = ["" + i, ...csv[i]];
    const templateData = replacePlaceholders(template, row, headers);
    const filename = replacePlaceholders(filenamePattern, row, headers);
    zip.file(filename, templateData);
  }

  return await zip.generateAsync({ type: "blob" });
};

const replacePlaceholders = (
  template: string,
  row: string[],
  headers: string[]
): string =>
  template.replace(/\{([^}]+)\}/g, (_, placeholder) => {
    const index = headers.indexOf(placeholder.trim());
    return index !== -1 ? row[index] || "" : "";
  });
