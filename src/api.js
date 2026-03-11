import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: BASE_URL });

function getCurrentUserSync() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);

    const user = getCurrentUserSync();

    
    if (
      original.url?.includes("/auth/login/") ||
      original.url?.includes("/auth/register/") ||
      original.url?.includes("/member/")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (user?.role === "member") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh token");
        const { data } = await axios.post(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh }
        );
        localStorage.setItem("access_token", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Staff Auth 

export async function login(email, password) {
  const { data } = await api.post("/auth/login/", { email, password });
  localStorage.setItem("access_token", data.tokens.access);
  localStorage.setItem("refresh_token", data.tokens.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export async function register(name, email, password) {
  const { data } = await api.post("/auth/register/", {
    name, email, password, role: "librarian",
  });
  localStorage.setItem("access_token", data.tokens.access);
  localStorage.setItem("refresh_token", data.tokens.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

// Books (Staff)

export async function getBooks(params = {}) {
  const { data } = await api.get("/books/", { params });
  return data;
}

export async function createBook(book) {
  const { data } = await api.post("/books/", book);
  return data;
}

export async function updateBook(id, book) {
  const { data } = await api.patch(`/books/${id}/`, book);
  return data;
}

export async function deleteBook(id) {
  await api.delete(`/books/${id}/`);
}

// Members (Staff)
export async function getMembers(params = {}) {
  const { data } = await api.get("/members/", { params });
  return data;
}

export async function createMember(member) {
  const { data } = await api.post("/members/", member);
  return data;
}

export async function updateMember(id, member) {
  const { data } = await api.patch(`/members/${id}/`, member);
  return data;
}

export async function deleteMember(id) {
  await api.delete(`/members/${id}/`);
}

// Borrowings (Staff)

export async function getBorrowings(params = {}) {
  const { data } = await api.get("/borrowings/", { params });
  return data;
}

export async function issueBorrowing(borrowing) {
  const { data } = await api.post("/borrowings/", borrowing);
  return data;
}

export async function returnBorrowing(id) {
  const { data } = await api.patch(`/borrowings/${id}/return/`);
  return data;
}

// Fines (Staff)

export async function getFines(params = {}) {
  const { data } = await api.get("/fines/", { params });
  return data;
}

export async function payFine(id) {
  const { data } = await api.patch(`/fines/${id}/pay/`);
  return data;
}

// Reservations (Staff)

export async function getReservations(params = {}) {
  const { data } = await api.get("/reservations/", { params });
  return data;
}

export async function createReservation(reservation) {
  const { data } = await api.post("/reservations/", reservation);
  return data;
}

export async function cancelReservation(id) {
  const { data } = await api.patch(`/reservations/${id}/cancel/`);
  return data;
}

// Dashboard & Admin (Staff)

export async function getDashboardStats() {
  const { data } = await api.get("/dashboard/stats/");
  return data;
}

export async function getStaffList() {
  const { data } = await api.get("/admin/staff/");
  return data;
}

export async function updateStaff(id, updates) {
  const { data } = await api.patch(`/admin/staff/${id}/`, updates);
  return data;
}

export async function getActivityLogs() {
  const { data } = await api.get("/admin/logs/");
  return data;
}

export async function getAdminReports() {
  const { data } = await api.get("/admin/reports/");
  return data;
}

// Member Auth

export async function memberRegister(name, email, password, phone = "", address = "") {
  const { data } = await api.post("/member/auth/register/", {
    name, email, password, phone, address,
  });
  localStorage.setItem("access_token", data.token);
  localStorage.setItem("user", JSON.stringify({ ...data.member, role: "member" }));
  return data;
}

export async function memberLogin(email, password) {
  const { data } = await api.post("/member/auth/login/", { email, password });
  localStorage.setItem("access_token", data.token);
  localStorage.setItem("user", JSON.stringify({ ...data.member, role: "member" }));
  return data;
}

export async function getMemberProfile() {
  const { data } = await api.get("/member/auth/profile/");
  return data;
}

export async function updateMemberProfile(updates) {
  const { data } = await api.patch("/member/auth/profile/", updates);
  return data;
}

// Member Borrowings 

export async function getMyBorrowings() {
  const { data } = await api.get("/member/borrowings/");
  return data;
}

export async function renewBorrowing(id) {
  const { data } = await api.patch(`/member/borrowings/${id}/renew/`);
  return data;
}

// Member Fines 

export async function getMyFines() {
  const { data } = await api.get("/member/fines/");
  return data;
}

// Member Reservations 

export async function getMyReservations() {
  const { data } = await api.get("/member/reservations/");
  return data;
}

export async function makeReservation(bookId) {
  const { data } = await api.post("/member/reservations/", { book: bookId });
  return data;
}

export async function cancelMyReservation(id) {
  const { data } = await api.delete(`/member/reservations/${id}/`);
  return data;
}

// Member Books 

export async function browseBooks(params = {}) {
  const { data } = await api.get("/member/books/", { params });
  return data;
}