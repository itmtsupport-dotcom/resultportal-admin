import axios from "axios";
import { getToken } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchDashboardSummary = async () => {
  const response = await api.get("/admin/analytics/summary");
  return response.data;
};

export const fetchDepartments = async () => {
  const response = await api.get("/admin/academics/departments");
  return response.data;
};

export const fetchSessions = async () => {
  const response = await api.get("/admin/sessions");
  return response.data;
};

export const fetchSemesters = async () => {
  const response = await api.get("/admin/academics/semesters");
  return response.data;
};

export const fetchLevels = async () => {
  const response = await api.get("/admin/levels");
  return response.data;
};

export const fetchCourses = async (departmentId, classId) => {
  const params = {};
  if (departmentId) {
    params.departmentId = departmentId;
  }
  if (classId) {
    params.classId = classId;
  }
  const response = await api.get("/admin/courses", { params });
  return response.data;
};

export const createCourse = async (payload) => {
  const response = await api.post("/admin/courses", payload);
  return response.data;
};

export const updateCourse = async (courseId, payload) => {
  const response = await api.put(`/admin/courses/${courseId}`, payload);
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/admin/courses/${courseId}`);
  return response.data;
};

export const createDepartment = async (payload) => {
  const response = await api.post("/admin/academics/departments", payload);
  return response.data;
};

export const updateDepartment = async (departmentId, payload) => {
  const response = await api.put(
    `/admin/academics/departments/${departmentId}`,
    payload
  );
  return response.data;
};

export const deleteDepartment = async (departmentId) => {
  const response = await api.delete(
    `/admin/academics/departments/${departmentId}`
  );
  return response.data;
};

export const fetchStudents = async (params) => {
  const response = await api.get("/admin/students", { params });
  return response.data;
};

export const fetchStudentProfile = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}`);
  return response.data;
};

export const createStudent = async (payload) => {
  const response = await api.post("/admin/students", payload);
  return response.data;
};

export const fetchStudentResults = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}/results`);
  return response.data;
};

export const fetchStudentTokens = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}/tokens`);
  return response.data;
};

export const fetchStudentTokenUsageLogs = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}/token-usage`);
  return response.data;
};

export const uploadStudentsCsv = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/admin/students/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const downloadStudentsTemplate = async () => {
  const response = await api.get("/admin/students/template", {
    responseType: "blob"
  });
  return response;
};

export const createManualResult = async (payload) => {
  const response = await api.post("/admin/results/manual", payload);
  return response.data;
};

export const uploadBulkResults = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/admin/results/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const downloadBulkResultsCsvTemplate = async () => {
  const response = await api.get("/admin/results/bulk-upload/template.csv", {
    responseType: "blob"
  });
  return response;
};

export const downloadBulkResultsExcelTemplate = async () => {
  const response = await api.get("/admin/results/bulk-upload/template.xlsx", {
    responseType: "blob"
  });
  return response;
};

export const fetchResults = async (params) => {
  const response = await api.get("/admin/results", { params });
  return response.data;
};

export const updateResult = async (id, payload) => {
  const response = await api.put(`/admin/results/${id}`, payload);
  return response.data;
};

export const fetchResultDetail = async (resultId) => {
  const response = await api.get(`/admin/results/${resultId}`);
  return response.data;
};

export const fetchResultEditLogs = async (resultId) => {
  const response = await api.get(`/admin/results/${resultId}/edit-logs`);
  return response.data;
};

export const updateResultItemScore = async (resultItemId, score) => {
  const response = await api.put(`/admin/results/items/${resultItemId}`, {
    score
  });
  return response.data;
};

export const fetchResultPdf = async (resultId) => {
  const response = await api.get(`/admin/results/${resultId}/pdf`, {
    responseType: "blob"
  });
  return response;
};

export const generateToken = async (payload) => {
  const response = await api.post("/admin/tokens/generate", payload);
  return response.data;
};

export const generateBulkTokens = async (payload) => {
  const response = await api.post("/admin/tokens/bulk", payload);
  return response.data;
};

export const exportTokensPdf = async (tokens) => {
  const response = await api.post("/admin/tokens/export-pdf", { tokens }, {
    responseType: "blob"
  });
  return response;
};

export const performBulkAction = async (action, tokenIds) => {
  const response = await api.post("/admin/tokens/bulk-action", { action, tokenIds });
  return response.data;
};

export const fetchTokens = async () => {
  const response = await api.get("/admin/tokens");
  return response.data;
};

export const fetchTokenDetail = async (tokenId) => {
  const response = await api.get(`/admin/tokens/${tokenId}`);
  return response.data;
};

export const disableToken = async (tokenId) => {
  const response = await api.patch(`/admin/tokens/${tokenId}/disable`);
  return response.data;
};

export const extendTokenExpiry = async (tokenId, extraDays) => {
  const response = await api.patch(`/admin/tokens/${tokenId}/extend-expiry`, {
    extraDays
  });
  return response.data;
};

export const resetTokenUsage = async (tokenId) => {
  const response = await api.patch(`/admin/tokens/${tokenId}/reset-usage`);
  return response.data;
};

export const deleteToken = async (tokenId) => {
  const response = await api.delete(`/admin/tokens/${tokenId}`);
  return response.data;
};

export const verifyResultCode = async (verificationCode) => {
  const response = await api.get(`/admin/verify/${verificationCode}`);
  return response.data;
};

export const createSession = async (payload) => {
  const response = await api.post("/admin/sessions", payload);
  return response.data;
};

export const updateSession = async (sessionId, payload) => {
  const response = await api.put(`/admin/sessions/${sessionId}`, payload);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/admin/sessions/${sessionId}`);
  return response.data;
};

export const createLevel = async (payload) => {
  const response = await api.post("/admin/levels", payload);
  return response.data;
};

export const updateLevel = async (levelId, payload) => {
  const response = await api.put(`/admin/levels/${levelId}`, payload);
  return response.data;
};

export const deleteLevel = async (levelId) => {
  const response = await api.delete(`/admin/levels/${levelId}`);
  return response.data;
};

export const fetchYears = async () => {
  const response = await api.get("/admin/years");
  return response.data;
};

export const createYear = async (payload) => {
  const response = await api.post("/admin/years", payload);
  return response.data;
};

export const updateYear = async (id, payload) => {
  const response = await api.put(`/admin/years/${id}`, payload);
  return response.data;
};

export const deleteYear = async (id) => {
  const response = await api.delete(`/admin/years/${id}`);
  return response.data;
};

export const fetchExams = async () => {
  const response = await api.get("/admin/exams");
  return response.data;
};

export const createExam = async (payload) => {
  const response = await api.post("/admin/exams", payload);
  return response.data;
};

export const updateExam = async (id, payload) => {
  const response = await api.put(`/admin/exams/${id}`, payload);
  return response.data;
};

export const deleteExam = async (id) => {
  const response = await api.delete(`/admin/exams/${id}`);
  return response.data;
};

export const fetchClasses = async () => {
  const response = await api.get("/admin/classes");
  return response.data;
};

export const createClass = async (payload) => {
  const response = await api.post("/admin/classes", payload);
  return response.data;
};

export const updateClass = async (id, payload) => {
  const response = await api.put(`/admin/classes/${id}`, payload);
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await api.delete(`/admin/classes/${id}`);
  return response.data;
};

export const fetchAdminProfile = async () => {
  const response = await api.get("/admin/auth/profile");
  return response.data;
};

export const updateAdminProfile = async (payload) => {
  const response = await api.put("/admin/auth/profile", payload);
  return response.data;
};

// Settings
export const fetchEmailSettings = async () => {
  const response = await api.get("/admin/settings/email");
  return response.data;
};

export const saveEmailSettings = async (payload) => {
  const response = await api.post("/admin/settings/email", payload);
  return response.data;
};

export const fetchSchoolSettings = async () => {
  const response = await api.get("/admin/settings/school");
  return response.data;
};

export const saveSchoolSettings = async (formData) => {
  const response = await api.post("/admin/settings/school", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const fetchIntegrationSettings = async () => {
  const response = await api.get("/admin/settings/integrations");
  return response.data;
};

export const saveIntegrationSettings = async (payload) => {
  const response = await api.post("/admin/settings/integrations", payload);
  return response.data;
};

export const testPaystackConnection = async (payload) => {
  const response = await api.post("/admin/settings/integrations/paystack/test", payload);
  return response.data;
};

export const testSmtpConnection = async (payload) => {
  const response = await api.post("/admin/settings/integrations/smtp/test", payload);
  return response.data;
};

// Logs
export const fetchLogs = async (params) => {
  const response = await api.get("/admin/logs", { params });
  return response.data;
};

export const fetchLogStats = async () => {
  const response = await api.get("/admin/logs/stats");
  return response.data;
};

// Payments
export const fetchPayments = async (params) => {
  const response = await api.get("/admin/payments", { params });
  return response.data;
};

export const fetchPaymentStats = async () => {
  const response = await api.get("/admin/payments/stats");
  return response.data;
};

export const fetchPaymentDetails = async (id) => {
  const response = await api.get(`/admin/payments/${id}`);
  return response.data;
};

// Notifications
export const fetchNotifications = async (params) => {
  const response = await api.get("/admin/notifications", { params });
  return response.data;
};

export const fetchUnreadCount = async () => {
  const response = await api.get("/admin/notifications/unread-count");
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/admin/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/admin/notifications/read-all");
  return response.data;
};

// Certificates
export const fetchCertificateTemplates = async () => {
  const response = await api.get("/admin/certificates");
  return response.data;
};

export const createCertificateTemplate = async (payload) => {
  const response = await api.post("/admin/certificates", payload);
  return response.data;
};

export const updateCertificateTemplate = async (id, payload) => {
  const response = await api.put(`/admin/certificates/${id}`, payload);
  return response.data;
};

export const deleteCertificateTemplate = async (id) => {
  const response = await api.delete(`/admin/certificates/${id}`);
  return response.data;
};

export const activateCertificateTemplate = async (id) => {
  const response = await api.post(`/admin/certificates/${id}/activate`);
  return response.data;
};

export default api;
