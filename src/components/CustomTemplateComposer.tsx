import React, { useState } from "react";
import { PlaceholderButtons } from "./PlaceholderButtons";
import { useTemplateUpdater } from "../hooks/useTemplateUpdater";

export interface CustomTemplate {
  type: "custom";
  data: {
    template: string;
  };
}

export const CustomTemplateComposer = ({
  templateString: [, setTemplate] = useState(""),
  templateData: [templateData, setTemplateData] = useState<CustomTemplate>({
    type: "custom",
    data: { template: "" },
  }),
  handleChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setField(name, value),
  setField = (name = "", value = "") => {
    setTemplateData((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  },
  headers = [] as string[],
  focusName: [focusName, setFocusName] = useState<
    keyof CustomTemplate["data"] | null
  >(null),
}) => (
  useTemplateUpdater(templateData, setTemplate, (data) => data.template),
  (
    <div className="Composer">
      <PlaceholderButtons
        headers={headers}
        name={focusName}
        setField={setField}
      />
      <label className="stretch">
        Template:
        <textarea
          name="template"
          value={templateData.data.template}
          onChange={handleChange}
          onFocus={() => setFocusName("template")}
        />
      </label>
    </div>
  )
);
