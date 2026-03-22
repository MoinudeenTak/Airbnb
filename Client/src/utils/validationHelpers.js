export const isEmpty = (value) => {
  return value === null || value === undefined || String(value).trim() === "";
};

export const toOptionalNumber = (value) => {
  if (isEmpty(value)) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseValidDate = (value) => {
  if (isEmpty(value)) return null;

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
};