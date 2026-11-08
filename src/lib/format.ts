// Dates are stored in UTC and written in UTC, so the server that renders a
// page and the browser that reads it agree on the day.

export const formatDay = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export const formatDayAndTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
});

export const formatShortDateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export const formatPercent = (part: number, whole: number) =>
  `${whole > 0 ? Math.round((part / whole) * 100) : 0}%`;

export const hostOf = (website: string) => {
  try {
    return new URL(website).hostname;
  } catch {
    return website;
  }
};
