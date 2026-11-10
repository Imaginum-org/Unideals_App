import { api } from "./client";
import type { User } from "@/types";

const A = "/api/auth";

type SessionPayload = { user: Partial<User> & { id?: string }; accessToken?: string; refreshToken?: string };

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ data: SessionPayload }>(`${A}/login`, { email, password }),
  register: (data: { name: string; email: string; password: string; gender?: "female" | "male" }) =>
    api.post<{ message: string }>(`${A}/register`, data),
  googleIdToken: (credential: string) =>
    api.post<{ data: SessionPayload }>(`${A}/google/one-tap`, { credential }),
  logout: (refreshToken?: string | null) =>
    api.post(`${A}/logoutUser`, refreshToken ? { refreshToken } : {}),
  forgotPassword: (email: string) => api.post<{ message: string }>(`${A}/forgot-password`, { email }),
  verifyEmail: (code: string) => api.post<{ message: string }>(`${A}/verify-email`, { code }),
  checkVerification: (email: string) =>
    api.get<{ verified: boolean }>(`${A}/check-verification`, { params: { email } }),
  resendVerification: (email: string) =>
    api.post<{ message: string }>(`${A}/resend-verification`, { email }),
  checkResetToken: (token: string) => api.get(`${A}/reset-password/${token}`),
  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>(`${A}/reset-password/${token}`, { password }),
};
