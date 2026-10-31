const API_URL = "http://127.0.0.1:5000"; // copy the address your old health check used

export function saveToken(token) {
  localStorage.setItem("unispace_token", token);
}
export function getToken() {
  return localStorage.getItem("unispace_token");
}
export function clearToken() {
  localStorage.removeItem("unispace_token");
}

export async function api(path, options = {}) {
  const headers = {};
  if (!(options.body instanceof FormData)) {
     headers["Content-Type"] = "application/json";
}
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || data.msg || "Something went wrong");
  }
  return data;
}

export async function apiFile(path) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Could not open this PDF.");
  return response.arrayBuffer();
}