const API_URL = "http://127.0.0.1:5000"; // same address as before

export function saveToken(token) {
  localStorage.setItem("unispace_token", token);
}
export function getToken() {
  return localStorage.getItem("unispace_token");
}
export function clearToken() {
  localStorage.removeItem("unispace_token");
}

function offlineError() {
  const e = new Error("No internet connection.");
  e.offline = true;
  return e;
}

export async function api(path, options = {}) {
  const headers = {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw offlineError();
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || data.msg || "Something went wrong");
  }
  return data;
}

export async function apiFile(path) {
  const token = getToken();
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw offlineError();
  }
  if (!response.ok) throw new Error("Could not open this PDF.");
  return response.arrayBuffer();
}
