const rawBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

const trimTrailingSlashes = (value) => value.replace(/\/+$/, "");

const normalizeBaseUrl = (value) => {
  const trimmed = trimTrailingSlashes(value);
  return trimmed.replace(/\/query$/, "");
};

export const API_BASE_URL = normalizeBaseUrl(rawBaseUrl);

export const buildApiUrl = (path) => {
  if (!path) return API_BASE_URL;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
};
