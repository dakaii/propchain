<template>
  <Transition name="notification">
    <div v-if="visible" class="fixed top-4 right-4 z-50 max-w-sm">
      <div :class="notificationClass" class="rounded-lg shadow-lg p-4 flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg v-if="type === 'success'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <svg v-else-if="type === 'error'" class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1">
          <p :class="titleClass" class="text-sm font-medium">{{ title }}</p>
          <p :class="messageClass" class="mt-1 text-sm">{{ message }}</p>
        </div>
        <button @click="close" class="flex-shrink-0">
          <svg :class="closeButtonClass" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

export interface NotificationProps {
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const props = withDefaults(defineProps<NotificationProps>(), {
  type: 'success',
  duration: 5000
});

const emit = defineEmits<{
  close: []
}>();

const visible = ref(true);

const notificationClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 border border-green-200';
    case 'error':
      return 'bg-red-50 border border-red-200';
    default:
      return 'bg-blue-50 border border-blue-200';
  }
});

const titleClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800';
    case 'error':
      return 'text-red-800';
    default:
      return 'text-blue-800';
  }
});

const messageClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-700';
    case 'error':
      return 'text-red-700';
    default:
      return 'text-blue-700';
  }
});

const closeButtonClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-500 hover:text-green-600';
    case 'error':
      return 'text-red-500 hover:text-red-600';
    default:
      return 'text-blue-500 hover:text-blue-600';
  }
});

const close = () => {
  visible.value = false;
  setTimeout(() => {
    emit('close');
  }, 300);
};

// Auto-close after duration
if (props.duration > 0) {
  setTimeout(() => {
    close();
  }, props.duration);
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>