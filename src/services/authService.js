import api from "./api";
import { setToken } from "../utils/storage";

export const loginAdmin = async (payload) => {
  const response = await api.post("/admin/auth/login", payload);
  const token = response.data?.token;
  setToken(token);
  return response.data;
};

export const logoutAdmin = () => {
  setToken(null);
};
