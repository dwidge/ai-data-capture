import { CustomTemplate } from "../components/CustomTemplateComposer";
import { EmailTemplate } from "../components/EmailTemplate";
import { useJson } from "./useJson";
import { useLocalStorage } from "./useLocalStorage";

export const useTemplateData = () =>
  useJson<CustomTemplate | EmailTemplate>(
    useLocalStorage("template_data", null),
    {
      type: "custom",
      data: { template: "" },
    }
  );
