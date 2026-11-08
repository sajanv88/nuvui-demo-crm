// Labels shared by server and client code. Nothing here touches the data.

export const PROVIDERS = ["gmail", "yahoo", "hotmail", "other"] as const;
export type Provider = (typeof PROVIDERS)[number];

export const providerLabels: Record<Provider, string> = {
  gmail: "Gmail",
  yahoo: "Yahoo",
  hotmail: "Hotmail",
  other: "Other",
};

export const providerIntent = {
  gmail: "primary",
  yahoo: "warning",
  hotmail: "success",
  other: "neutral",
} as const satisfies Record<Provider, string>;

export const COMPANY_KINDS = [
  "partnership",
  "three-partner",
  "group",
  "inc",
  "family",
  "llc",
] as const;
export type CompanyKind = (typeof COMPANY_KINDS)[number];

export const companyKindLabels: Record<CompanyKind, string> = {
  partnership: "Two-name partnership",
  "three-partner": "Three-name partnership",
  group: "Group",
  inc: "Incorporated",
  family: "Family business (& Sons)",
  llc: "LLC",
};
