import { Product } from "./types";

const KEY_AUTH = "gogo_stock_auth_v1";

export const storage = {
  setAuth(payload: { username: string; remember: boolean }) {
    localStorage.setItem(KEY_AUTH, JSON.stringify(payload));
  },
  getAuth(): { username: string; remember: boolean } | null {
    try {
      const raw = localStorage.getItem(KEY_AUTH);
      return raw ? (JSON.parse(raw) as { username: string; remember: boolean }) : null;
    } catch {
      return null;
    }
  },
  clearAuth() {
    localStorage.removeItem(KEY_AUTH);
  },
};
