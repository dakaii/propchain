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
            <div class="relative">
              <button
                @click="showWalletInfo = !showWalletInfo"
                class="bg-primary-100 text-primary-700 px-3 py-2 rounded-md hover:bg-primary-200 transition-colors"
              >
                💳 Wallet
              </button>
              <div
                v-if="showWalletInfo"
                class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div class="py-4 px-4">
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Your Wallet</h3>
                  <div class="space-y-2">
                    <div>
                      <label class="text-xs text-gray-500">Mock Wallet Address</label>
                      <div class="flex items-center space-x-2">
                        <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {{ authStore.user?.walletAddress || 'Not connected' }}
                        </code>
                        <button
                          v-if="authStore.user?.walletAddress"
                          @click="copyToClipboard(authStore.user.walletAddress)"
                          class="text-xs text-primary-600 hover:text-primary-800"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 pt-2">
                      <p>🔐 This is a simulated wallet address for demo purposes.</p>
                      <p>✨ Yellow Protocol zkLogin integration ready!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const showWalletInfo = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>