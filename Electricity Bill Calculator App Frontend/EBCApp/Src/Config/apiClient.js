import { apiEndPoint } from "./ApiEndpoint";
import { auth } from "./FirebaseConfig";

const buildUrl = (path) => {
  if (!path) return apiEndPoint;
  if (path.startsWith("http")) return path;
  return `${apiEndPoint}${path.startsWith("/") ? "" : "/"}${path}`;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let body = null;
  try {
    body = isJson ? await response.json() : await response.text();
  } catch {
    body = null;
  }

  return body;
};

const normalizeResponse = (response, parsed) => {
  if (!response.ok) {
    const message =
      (parsed && typeof parsed === "object" && parsed.detail) ||
      (parsed && typeof parsed === "object" && parsed.message) ||
      `Request failed with status ${response.status}`;

    return {
      success: false,
      status: response.status,
      message,
      data: null,
      raw: parsed,
    };
  }

  const data =
    parsed && typeof parsed === "object" ? parsed : { value: parsed };

  return {
    success: true,
    status: response.status,
    message: data.message || "Success",
    data: data.data ?? data,
    raw: data,
  };
};

// ---------- Firebase fresh-token helper ----------
// Firebase caches the token internally, so the common case returns instantly.
// It only hits the network when the token is close to expiry.
const getFreshToken = async () => {
  try {
    const user = auth?.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
};

// ---------- JSON request ----------
const requestJson = async (method, path, body, extraHeaders = {}) => {
  const url = buildUrl(path);
  const token = await getFreshToken();

  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (token) headers.authToken = `Bearer_${token}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });

    const parsed = await parseResponse(response);
    return normalizeResponse(response, parsed);
  } catch (networkErr) {
    return {
      success: false,
      status: 0,
      message:
        networkErr?.message === "Network request failed"
          ? "Network error. Please check your internet connection."
          : networkErr?.message || "Something went wrong. Please try again.",
      data: null,
      raw: null,
    };
  }
};

// ---------- FormData request ----------
const requestForm = async (method, path, formData, extraHeaders = {}) => {
  const url = buildUrl(path);
  const token = await getFreshToken();

  // ⚠️ Do NOT set Content-Type for FormData — the browser/RN sets it
  //    automatically with the correct multipart boundary.
  const headers = { ...extraHeaders };
  if (token) headers.authToken = `Bearer_${token}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    const parsed = await parseResponse(response);
    return normalizeResponse(response, parsed);
  } catch (networkErr) {
    return {
      success: false,
      status: 0,
      message:
        networkErr?.message === "Network request failed"
          ? "Network error. Please check your internet connection."
          : networkErr?.message || "Something went wrong. Please try again.",
      data: null,
      raw: null,
    };
  }
};

export const apiClient = {
  get: (path, headers) => requestJson("GET", path, null, headers),
  post: (path, body, headers) => requestJson("POST", path, body, headers),
  put: (path, body, headers) => requestJson("PUT", path, body, headers),
  patch: (path, body, headers) => requestJson("PATCH", path, body, headers),
  delete: (path, headers) => requestJson("DELETE", path, null, headers),
  postForm: (path, formData, headers) =>
    requestForm("POST", path, formData, headers),
};

export default apiClient;
