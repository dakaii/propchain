<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
          <span class="text-white text-xl font-bold">₿</span>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">
          Connect Your Wallet
        </h2>
        <p class="text-slate-300 text-sm">
          Access fractional real estate investing with zkLogin
        </p>
      </div>

      <!-- Main Auth Card -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">

        <!-- Web3 Auth Options -->
        <div class="space-y-4">
          <!-- Google zkLogin (Mock) -->
          <button
            @click="handleGoogleAuth"
            :disabled="loading"
            class="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google zkLogin
          </button>

          <!-- Mock Wallet Buttons -->
          <button
            @click="handleWalletConnect('metamask')"
            :disabled="loading"
            class="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div class="w-5 h-5 mr-3 bg-white rounded-full flex items-center justify-center">
              🦊
            </div>
            Connect with MetaMask
          </button>

          <button
            @click="handleWalletConnect('walletconnect')"
            :disabled="loading"
            class="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div class="w-5 h-5 mr-3 bg-white rounded-full flex items-center justify-center">
              🔗
            </div>
            WalletConnect
          </button>
        </div>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/20"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-transparent text-slate-300">Or continue with email</span>
          </div>
        </div>

        <!-- Traditional Login (Collapsed by default) -->
        <div class="space-y-4">
          <button
            @click="showEmailLogin = !showEmailLogin"
            class="w-full text-slate-300 text-sm hover:text-white transition-colors"
          >
            {{ showEmailLogin ? 'Hide' : 'Show' }} email login (demo)
          </button>

          <div v-if="showEmailLogin" class="space-y-4 pt-2">
            <div>
              <input
                v-model="email"
                type="email"
                placeholder="Email address"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                v-model="password"
                type="password"
                placeholder="Password"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              @click="handleEmailLogin"
              :disabled="loading"
              class="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-200 border border-white/20 disabled:opacity-50"
            >
              {{ loading ? 'Signing in...' : 'Sign in with Email' }}
            </button>
          </div>
        </div>

        <div v-if="error" class="mt-4 text-red-400 text-sm text-center">
          {{ error }}
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-slate-400 text-sm">
          Don't have an account?
          <RouterLink to="/register" class="text-purple-400 hover:text-purple-300 transition-colors">
            Create wallet
          </RouterLink>
        </p>
        <div class="mt-4 text-xs text-slate-500">
          <p>🔐 Demo mode: All wallet connections are simulated</p>
          <p>✨ Powered by Yellow Protocol</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showEmailLogin = ref(false)

// Mock Google Auth / zkLogin
async function handleGoogleAuth() {
  loading.value = true
  error.value = ''

  try {
    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock login with demo user account (simulating Google-derived account)
    const result = await authStore.login('demo@fractional.property', 'demo123')

    if (result.success) {
      router.push('/portfolio')
    } else {
      error.value = 'zkLogin authentication failed'
    }
  } catch (err) {
    error.value = 'Authentication error'
  }

  loading.value = false
}

// Mock wallet connections
async function handleWalletConnect(wallet: string) {
  loading.value = true
  error.value = ''

  try {
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // For demo, just log in with demo account
    const result = await authStore.login('demo@fractional.property', 'demo123')

    if (result.success) {
      router.push('/portfolio')
    } else {
      error.value = `${wallet} connection failed`
    }
  } catch (err) {
    error.value = 'Wallet connection error'
  }

  loading.value = false
}

// Traditional email login
async function handleEmailLogin() {
  loading.value = true
  error.value = ''

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    router.push('/portfolio')
  } else {
    error.value = result.error || 'Login failed'
  }

  loading.value = false
}
</script>