export type Language = string & { __type__: "language" };
export const getLanguage = (language: "en" = "en"): Promise<Language> => {
  switch (language) {
    case "en":
      return import("./lang-en").then(r => r.langEN as Language);
    default:
      return import("./lang-en").then(r => r.langEN as Language);
  }
};
