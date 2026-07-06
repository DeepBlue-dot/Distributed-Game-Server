import axios from "axios";
import { getToken } from "@/lib/session";
import type {
  AuthTokenResponse,
  CurrentPlayerState,
  LoginPayload,
  MatchHistoryResponse,
  MatchDetail,
  RegisterPayload,
} from "@/lib/types";

export const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.replace(
  /\/$/,
  "",
) || "";

export const api = axios.create({
  baseURL: backendOrigin ? `${backendOrigin}/api` : "/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";

    return Promise.reject(new Error(message));
  },
);

export const authApi = {
  async register(payload: RegisterPayload) {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  async login(payload: LoginPayload) {
    const res = await api.post<AuthTokenResponse | { token?: string }>(
      "/auth/login",
      payload,
    );
    const token =
      typeof res.data === "string"
        ? res.data
        : res.data?.token;

    if (!token) {
      throw new Error("No authentication token was returned by the server.");
    }

    return { token };
  },

  async logout() {
    const res = await api.post<{ message: string }>("/auth/logout");
    return res.data;
  },

  async refresh() {
    const res = await api.post<AuthTokenResponse>("/auth/refresh");
    return res.data;
  },
};

export const playerApi = {
  async me() {
    const res = await api.get<CurrentPlayerState>("/player/me");
    return res.data;
  },

  async updateProfile(payload: {
    username?: string;
    avatarUrl?: string;
    bio?: string;
  }) {
    const res = await api.put("/player/me/profile", payload);
    return res.data;
  },

  async updateEmail(payload: { email: string }) {
    const res = await api.put<{ message: string }>("/player/me/email", payload);
    return res.data;
  },

  async updatePassword(payload: { oldPassword: string; newPassword: string }) {
    const res = await api.put<{ message: string }>(
      "/player/me/password",
      payload,
    );
    return res.data;
  },

  async deleteMe() {
    const res = await api.delete<{ message: string }>("/player/me");
    return res.data;
  },
};

export const matchmakingApi = {
  async join() {
    const res = await api.post<{ message: string; rating?: number }>(
      "/matchmaking/join",
    );
    return res.data;
  },

  async leave() {
    const res = await api.post<{ message: string }>("/matchmaking/leave");
    return res.data;
  },
};

export const historyApi = {
  async mine(params?: {
    page?: number;
    limit?: number;
    result?: "WIN" | "LOSS" | "DRAW";
    sortBy?: "endedAt" | "durationMs" | "turnCount";
    order?: "asc" | "desc";
    search?: string;
  }) {
    const res = await api.get<MatchHistoryResponse>("/history/me", {
      params,
    });
    return res.data;
  },

  async byId(matchId: string) {
    const res = await api.get<MatchDetail>(`/history/${matchId}`);
    return res.data;
  },
};

export function getWebSocketUrl(token: string) {
  const url = new URL(backendOrigin || "http://127.0.0.1");
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.searchParams.set("token", token);
  return url.toString();
}
