import React, { useState } from "react";
import { useTemplateUpdater } from "../hooks/useTemplateUpdater";
import { createEmlTemplate } from "../utils/createEmlTemplate";
import { EmailTemplate } from "./EmailTemplate";
import { PlaceholderButtons } from "./PlaceholderButtons";

export const EmailTemplateComposer = ({
  templateString: [, setTemplate] = useState(""),
  templateData: [templateData, setTemplateData] = useState<EmailTemplate>({
    type: "email",
    data: {
      from: "{from}",
      to: "{to}",
      cc: "{cc}",
      bcc: "{bcc}",
      subject: "{subject}",
      body: "{body}",
    },
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
    keyof EmailTemplate["data"] | null
  >(null),
}) => (
  useTemplateUpdater(templateData, setTemplate, createEmlTemplate),
  (
    <div className="Composer">
      <PlaceholderButtons
        headers={headers}
        name={focusName}
        setField={setField}
      />
      <label>
        From:
        <input
          type="text"
          name="from"
          value={templateData.data.from ?? ""}
          onChange={handleChange}
          onFocus={() => setFocusName("from")}
        />
      </label>
      <label>
        To:
        <input
          type="text"
          name="to"
          value={templateData.data.to ?? ""}
          onChange={handleChange}
          onFocus={() => setFocusName("to")}
        />
      </label>
      <label>
        Cc:
        <input
          type="text"
          name="cc"
          value={templateData.data.cc ?? ""}
          onChange={handleChange}
          onFocus={() => setFocusName("cc")}
        />
      </label>
      <label>
        Bcc:
        <input
          type="text"
          name="bcc"
          value={templateData.data.bcc ?? ""}
          onChange={handleChange}
          onFocus={() => setFocusName("bcc")}
        />
      </label>
      <label>
        Read Receipt:
        <input
          type="text"
          name="readReceipt"
          value={templateData.data.readReceipt ?? ""}
          onChange={handleChange}
          onFocus={() => setFocusName("readReceipt")}
        />
      </label>
      <label>
        Delivery Receipt:
        <input
          type="text"
          name="deliveryReceipt"
          value={templateData.data.deliveryReceipt ?? ""}
          onChange={handleChange}
          onFocus={() => setFocusName("deliveryReceipt")}
        />
      </label>
      <label>
        Subject:
        <input
          type="text"
          name="subject"
          value={templateData.data.subject ?? ""}
          onChange={handleChange}
          onFocus={() => setFocusName("subject")}
        />
      </label>
      <label className="stretch">
        Body:
        <textarea
          name="body"
          value={templateData.data.body ?? ""}
          onChange={handleChange}
          onFocus={() => setFocusName("body")}
        />
      </label>
    </div>
  )
);
