
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const layoutApi = {
  list: () => request("/layouts"),

  get: (id) => request(`/layouts/${id}`),

  create: (layout) =>
    request("/layouts", {
      method: "POST",
      body: JSON.stringify(layout),
    }),

  update: (id, layout) =>
    request(`/layouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(layout),
    }),

  remove: (id) =>
    request(`/layouts/${id}`, { method: "DELETE" }),
};
