import { api } from "encore.dev/api";

export interface UserInfo {
  id: string;
  email: string | null;
  imageUrl: string;
}

// Gets the current user's profile information.
export const getProfile = api<void, UserInfo>(
  { expose: true, method: "GET", path: "/user/profile" },
  async () => {
    return {
      id: "default-user",
      email: "user@example.com",
      imageUrl: "https://via.placeholder.com/40"
    };
  }
);
