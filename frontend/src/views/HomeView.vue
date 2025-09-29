<template>
  <div class="min-h-screen">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex">
            <div class="flex flex-shrink-0 items-center">
              <h1 class="text-xl font-bold text-primary-600">PropChain</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <RouterLink to="/properties" class="text-gray-700 hover:text-primary-600">Properties</RouterLink>
            <template v-if="isAuthenticated">
              <RouterLink to="/portfolio" class="text-gray-700 hover:text-primary-600">Portfolio</RouterLink>
              <RouterLink to="/orders" class="text-gray-700 hover:text-primary-600">Orders</RouterLink>
              <button @click="logout" class="text-gray-700 hover:text-primary-600">Logout</button>
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

    <!-- Hero Section -->
    <div class="bg-gradient-to-b from-primary-50 to-white">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Invest in Real Estate from $50
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            Fractional property investment powered by Yellow Network's instant settlement technology.
            Buy, trade, and earn rental income from premium properties.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <RouterLink to="/register" class="rounded-md bg-primary-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-primary-700">
              Start Investing
            </RouterLink>
            <RouterLink to="/properties" class="text-lg font-semibold leading-6 text-gray-900">
              Browse Properties <span aria-hidden="true">→</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div class="text-center">
            <div class="mx-auto h-12 w-12 text-primary-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-xl font-semibold">Low Minimum Investment</h3>
            <p class="mt-2 text-gray-600">Start with just $50 and build your real estate portfolio</p>
          </div>
          <div class="text-center">
            <div class="mx-auto h-12 w-12 text-primary-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="mt-4 text-xl font-semibold">Instant Settlement</h3>
            <p class="mt-2 text-gray-600">Yellow Network state channels enable near-instant trades</p>
          </div>
          <div class="text-center">
            <div class="mx-auto h-12 w-12 text-primary-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-xl font-semibold">Passive Income</h3>
            <p class="mt-2 text-gray-600">Earn monthly rental income proportional to your ownership</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Yellow Network Integration -->
    <div class="bg-gray-50 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Powered by Yellow Network</h2>
        <p class="text-lg text-gray-600 mb-8">
          Using ERC-7824 state channels and Nitrolite SDK for gasless, instant property trading
        </p>
        <div class="inline-flex items-center space-x-2 text-sm text-gray-500">
          <span class="inline-block h-2 w-2 bg-green-500 rounded-full"></span>
          <span>Yellow Network Connected</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = authStore.isAuthenticated

function logout() {
  authStore.logout()
  router.push('/')
}
</script>