import { useEffect } from "react";

export const useTemplateUpdater = (
  templateData: any,
  setTemplate: (template: string) => void,
  createTemplate: (data: any) => string
) => {
  useEffect(() => {
    setTemplate(createTemplate(templateData.data));
  }, [templateData, setTemplate]);
};
