// frontend/src/auth/api/authApi.js
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ── Helper: throw meaningful errors from API responses ── */
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

/* ── Token storage (localStorage) ── */
export const tokenStorage = {
  get:    ()    => localStorage.getItem("inv_token"),
  set:    (t)   => localStorage.setItem("inv_token", t),
  clear:  ()    => localStorage.removeItem("inv_token"),
};

/* ── Authenticated fetch wrapper ── */
export async function authFetch(endpoint, options = {}) {
  const token = tokenStorage.get();
  return fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
}

/* ────────────────────────────────────────────
   AUTH ENDPOINTS
──────────────────────────────────────────── */
export const authApi = {
  register: async ({ name, email, password }) => {
    const res = await fetch(`${BASE}/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse(res);
    tokenStorage.set(data.token);
    return data;
  },

  login: async ({ email, password }) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    tokenStorage.set(data.token);
    return data;
  },

  googleLogin: async (idToken) => {
    const res = await fetch(`${BASE}/auth/google`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ idToken }),
    });
    const data = await handleResponse(res);
    tokenStorage.set(data.token);
    return data;
  },

  getMe: async () => {
    const res  = await authFetch("/auth/me");
    return handleResponse(res);
  },

  logout: () => {
    tokenStorage.clear();
  },

  updateProfile: async ({ name, avatar }) => {
    const res = await authFetch("/auth/update-profile", {
      method: "PUT",
      body:   JSON.stringify({ name, avatar }),
    });
    return handleResponse(res);
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await authFetch("/auth/change-password", {
      method: "PUT",
      body:   JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },
};

/* ────────────────────────────────────────────
   INVOICE ENDPOINTS
──────────────────────────────────────────── */
export const invoiceApi = {
  getAll: async (params = {}) => {
    const qs  = new URLSearchParams(params).toString();
    const res = await authFetch(`/invoices${qs ? "?" + qs : ""}`);
    return handleResponse(res);
  },

  getOne: async (id) => {
    const res = await authFetch(`/invoices/${id}`);
    return handleResponse(res);
  },

  create: async (invoiceData) => {
    const res = await authFetch("/invoices", {
      method: "POST",
      body:   JSON.stringify(invoiceData),
    });
    return handleResponse(res);
  },

  update: async (id, invoiceData) => {
    const res = await authFetch(`/invoices/${id}`, {
      method: "PUT",
      body:   JSON.stringify(invoiceData),
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await authFetch(`/invoices/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },
};