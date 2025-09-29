<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <!-- Success Notification -->
    <NotificationPopup
      v-if="showNotification"
      :type="notificationType"
      :title="notificationTitle"
      :message="notificationMessage"
      @close="showNotification = false"
    />
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Available Properties</h1>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Loading properties...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 p-4 rounded-lg">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="property in properties" :key="property.id"
             class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
          <img v-if="property.images?.[0]"
               :src="property.images[0]"
               :alt="property.name"
               class="w-full h-48 object-cover" />
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-2">{{ property.name }}</h2>
            <p class="text-gray-600 text-sm mb-4">{{ property.description }}</p>

            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Total Value:</span>
                <span class="font-semibold">${{ property.totalValue.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Price per Share:</span>
                <span class="font-semibold">${{ property.pricePerShare }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Available Shares:</span>
                <span class="font-semibold">{{ property.availableShares.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Annual Yield:</span>
                <span class="font-semibold text-green-600">{{ property.metrics.annualYield }}%</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm mb-4">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {{ property.type.charAt(0).toUpperCase() + property.type.slice(1) }}
              </span>
              <span :class="getStatusClass(property.status)">
                {{ getStatusLabel(property.status) }}
              </span>
            </div>

            <button
              @click="openBuyModal(property)"
              :disabled="property.status !== 'active'"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              {{ property.status === 'active' ? 'Buy Shares' : 'Fully Funded' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Buy Modal -->
    <div v-if="showBuyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-semibold mb-4">Buy Shares - {{ selectedProperty?.name }}</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Number of Shares</label>
            <input
              v-model.number="buyShares"
              type="number"
              min="1"
              :max="selectedProperty?.availableShares"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number of shares"
            />
          </div>

          <div class="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Price per share:</span>
              <span>${{ selectedProperty?.pricePerShare }}</span>
            </div>
            <div class="flex justify-between">
              <span>Number of shares:</span>
              <span>{{ buyShares || 0 }}</span>
            </div>
            <div class="flex justify-between font-semibold text-base">
              <span>Total Investment:</span>
              <span>${{ ((buyShares || 0) * (selectedProperty?.pricePerShare || 0)).toLocaleString() }}</span>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              @click="confirmBuy"
              :disabled="!buyShares || buyShares < 1"
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              Confirm Purchase
            </button>
            <button
              @click="closeBuyModal"
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/api';
import NotificationPopup from '@/components/NotificationPopup.vue';
import AppHeader from '@/components/AppHeader.vue';

const router = useRouter();
const authStore = useAuthStore();

const properties = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const showBuyModal = ref(false);
const selectedProperty = ref<any>(null);
const buyShares = ref(1);

// Notification state
const showNotification = ref(false);
const notificationType = ref<'success' | 'error'>('success');
const notificationTitle = ref('');
const notificationMessage = ref('');

const getStatusClass = (status: string) => {
  return status === 'active'
    ? 'px-2 py-1 bg-green-100 text-green-800 rounded'
    : 'px-2 py-1 bg-gray-100 text-gray-800 rounded';
};

const getStatusLabel = (status: string) => {
  return status === 'active' ? 'Active' : 'Fully Funded';
};

const openBuyModal = (property: any) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  selectedProperty.value = property;
  buyShares.value = 1;
  showBuyModal.value = true;
};

const closeBuyModal = () => {
  showBuyModal.value = false;
  selectedProperty.value = null;
  buyShares.value = 1;
};

const confirmBuy = async () => {
  if (!selectedProperty.value || !buyShares.value) return;

  try {
    await api.createOrder(selectedProperty.value.id, buyShares.value, 'buy');

    // Show success notification
    notificationType.value = 'success';
    notificationTitle.value = 'Purchase Successful!';
    notificationMessage.value = `You've purchased ${buyShares.value} shares of ${selectedProperty.value.name}`;
    showNotification.value = true;

    closeBuyModal();
    fetchProperties(); // Refresh data
  } catch (err) {
    // Show error notification
    notificationType.value = 'error';
    notificationTitle.value = 'Purchase Failed';
    notificationMessage.value = 'Failed to complete purchase. Please try again.';
    showNotification.value = true;
    console.error(err);
  }
};

const fetchProperties = async () => {
  try {
    loading.value = true;
    error.value = '';
    properties.value = await api.getProperties();
  } catch (err) {
    error.value = 'Failed to load properties. Please try again later.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProperties();
});
</script>