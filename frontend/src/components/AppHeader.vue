<template>
  <nav class="bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <RouterLink to="/" class="text-xl font-bold text-primary-600">PropChain</RouterLink>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <RouterLink to="/properties" class="text-gray-700 hover:text-primary-600">Properties</RouterLink>
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/portfolio" class="text-gray-700 hover:text-primary-600">Portfolio</RouterLink>
            <RouterLink to="/orders" class="text-gray-700 hover:text-primary-600">Orders</RouterLink>
            <button @click="handleLogout" class="text-gray-700 hover:text-primary-600">Logout</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="text-gray-700 hover:text-primary-600">Login</RouterLink>
            <RouterLink to="/register" class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
              Get Started
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>