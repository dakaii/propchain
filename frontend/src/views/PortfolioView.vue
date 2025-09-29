<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <!-- Success/Error Notification -->
    <NotificationPopup
      v-if="showNotification"
      :type="notificationType"
      :title="notificationTitle"
      :message="notificationMessage"
      @close="showNotification = false"
    />
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">My Portfolio</h1>

      <!-- Portfolio Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600 mb-1">Total Invested</p>
          <p class="text-2xl font-bold text-gray-900">${{ totalInvested.toLocaleString() }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600 mb-1">Current Value</p>
          <p class="text-2xl font-bold text-gray-900">${{ totalValue.toLocaleString() }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600 mb-1">Unrealized Gain</p>
          <p :class="unrealizedGainClass">
            ${{ Math.abs(totalUnrealizedGain).toLocaleString() }}
            <span class="text-sm">
              ({{ totalUnrealizedGain >= 0 ? '+' : '-' }}{{ Math.abs(unrealizedGainPercent).toFixed(2) }}%)
            </span>
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600 mb-1">Properties Owned</p>
          <p class="text-2xl font-bold text-gray-900">{{ positions.length }}</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Loading portfolio...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 p-4 rounded-lg">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="positions.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-gray-600 mb-4">Your property investments will appear here</p>
        <router-link to="/properties"
                     class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Browse Properties
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <h2 class="text-xl font-semibold mb-4">Your Investments</h2>

        <div v-for="position in positions" :key="position.id"
             class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ position.property.name }}</h3>
                <p class="text-sm text-gray-600">{{ position.property.tokenSymbol }}</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {{ position.property.type.charAt(0).toUpperCase() + position.property.type.slice(1) }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p class="text-sm text-gray-600">Shares Owned</p>
                <p class="font-semibold">{{ position.shares.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Avg Price</p>
                <p class="font-semibold">${{ position.averagePrice }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Total Invested</p>
                <p class="font-semibold">${{ position.totalInvested.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Current Value</p>
                <p class="font-semibold">${{ position.currentValue.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Unrealized Gain</p>
                <p :class="position.unrealizedGain >= 0 ? 'font-semibold text-green-600' : 'font-semibold text-red-600'">
                  ${{ Math.abs(position.unrealizedGain).toLocaleString() }}
                  <span class="text-xs">
                    ({{ position.unrealizedGain >= 0 ? '+' : '-' }}{{ Math.abs((position.unrealizedGain / position.totalInvested) * 100).toFixed(2) }}%)
                  </span>
                </p>
              </div>
            </div>

            <div class="mt-4 flex space-x-3">
              <button @click="openSellModal(position)"
                      class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
                Sell Shares
              </button>
              <button @click="viewProperty(position.property.id)"
                      class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                View Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sell Modal -->
    <div v-if="showSellModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-semibold mb-4">Sell Shares - {{ selectedPosition?.property.name }}</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Number of Shares to Sell</label>
            <input
              v-model.number="sellShares"
              type="number"
              min="1"
              :max="selectedPosition?.shares"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter number of shares"
            />
            <p class="text-xs text-gray-600 mt-1">You own {{ selectedPosition?.shares }} shares</p>
          </div>

          <div class="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Current price per share:</span>
              <span>${{ selectedPosition?.property.pricePerShare }}</span>
            </div>
            <div class="flex justify-between">
              <span>Number of shares:</span>
              <span>{{ sellShares || 0 }}</span>
            </div>
            <div class="flex justify-between font-semibold text-base">
              <span>Total Sale Value:</span>
              <span>${{ ((sellShares || 0) * (selectedPosition?.property.pricePerShare || 0)).toLocaleString() }}</span>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              @click="confirmSell"
              :disabled="!sellShares || sellShares < 1"
              class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              Confirm Sale
            </button>
            <button
              @click="closeSellModal"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/services/api';
import NotificationPopup from '@/components/NotificationPopup.vue';
import AppHeader from '@/components/AppHeader.vue';

const router = useRouter();

const positions = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const showSellModal = ref(false);
const selectedPosition = ref<any>(null);
const sellShares = ref(1);

// Notification state
const showNotification = ref(false);
const notificationType = ref<'success' | 'error'>('success');
const notificationTitle = ref('');
const notificationMessage = ref('');

const totalInvested = computed(() =>
  positions.value.reduce((sum, p) => sum + p.totalInvested, 0)
);

const totalValue = computed(() =>
  positions.value.reduce((sum, p) => sum + p.currentValue, 0)
);

const totalUnrealizedGain = computed(() =>
  positions.value.reduce((sum, p) => sum + p.unrealizedGain, 0)
);

const unrealizedGainPercent = computed(() => {
  if (totalInvested.value === 0) return 0;
  return (totalUnrealizedGain.value / totalInvested.value) * 100;
});

const unrealizedGainClass = computed(() => {
  return totalUnrealizedGain.value >= 0
    ? 'text-2xl font-bold text-green-600'
    : 'text-2xl font-bold text-red-600';
});

const openSellModal = (position: any) => {
  selectedPosition.value = position;
  sellShares.value = 1;
  showSellModal.value = true;
};

const closeSellModal = () => {
  showSellModal.value = false;
  selectedPosition.value = null;
  sellShares.value = 1;
};

const confirmSell = async () => {
  if (!selectedPosition.value || !sellShares.value) return;

  try {
    await api.createOrder(selectedPosition.value.property.id, sellShares.value, 'sell');

    // Show success notification
    notificationType.value = 'success';
    notificationTitle.value = 'Sale Successful!';
    notificationMessage.value = `You've sold ${sellShares.value} shares of ${selectedPosition.value.property.name}`;
    showNotification.value = true;

    closeSellModal();
    fetchPortfolio(); // Refresh data
  } catch (err) {
    // Show error notification
    notificationType.value = 'error';
    notificationTitle.value = 'Sale Failed';
    notificationMessage.value = 'Failed to complete sale. Please try again.';
    showNotification.value = true;
    console.error(err);
  }
};

const viewProperty = (propertyId: string) => {
  router.push('/properties');
};

const fetchPortfolio = async () => {
  try {
    loading.value = true;
    error.value = '';
    positions.value = await api.getPortfolio();
  } catch (err) {
    error.value = 'Failed to load portfolio. Please try again later.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPortfolio();
});
</script>