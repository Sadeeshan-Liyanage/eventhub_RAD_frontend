import { User } from "../types";

const ACCESS = "eventhub_access";
const REFRESH = "eventhub_refresh";
const USER = "eventhub_user";

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const getAccessToken = () => localStorage.getItem(ACCESS);
export const getRefreshToken = () => localStorage.getItem(REFRESH);

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const saveSession = (s: Session) => {
  localStorage.setItem(ACCESS, s.accessToken);
  localStorage.setItem(REFRESH, s.refreshToken);
  localStorage.setItem(USER, JSON.stringify(s.user));
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(USER);
};
