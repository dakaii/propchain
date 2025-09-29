import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    try {
      const response = await api.login(email, password);
      token.value = response.access_token;
      user.value = response.user;
      localStorage.setItem('token', response.access_token);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Invalid email or password' };
    }
  }

  async function register(email: string, password: string) {
    try {
      await api.register(email, password);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    api.logout();
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
  };
});