export type Language = string & { __type__: "language" };

export const getLanguage = (language: "en" | "zh" = "zh"): Promise<Language> => {
  switch (language) {
    case "en":
      return import("./lang-en").then(r => r.langEN as Language);
    case "zh":
      return import("./lang-zh").then(r => r.langEN as Language);
    default:
      return import("./lang-en").then(r => r.langEN as Language);
  }
};
