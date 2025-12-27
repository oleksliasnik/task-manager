import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "../router";
import { User } from "../types/user";
import { authApi } from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const token = ref(localStorage.getItem("token") || null);

  const isAuthenticated = computed(() => !!token.value);

  function setUser(userData: User, authToken: string) {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function updateProfile(
    username: string,
    avatarFile?: File,
    firstName?: string,
    lastName?: string
  ) {
    if (!token.value) return;

    try {
      const formData = new FormData();
      formData.append("username", username);
      if (firstName !== undefined) {
        formData.append("firstName", firstName);
      }
      if (lastName !== undefined) {
        formData.append("lastName", lastName);
      }
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await authApi.updateProfile(token.value, formData);
      // Update local user state
      if (user.value) {
        user.value = {
          ...user.value,
          username: response.user.username,
          avatar: response.user.avatar,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
        };
        localStorage.setItem("user", JSON.stringify(user.value));
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    if (!token.value) return;

    try {
      await authApi.updatePassword(token.value, currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    logout,
    updateProfile,
    updatePassword,
  };
});
