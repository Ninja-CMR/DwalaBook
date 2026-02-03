<script setup lang="ts">
import { useNotificationStore } from '../stores/notifications.store';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next';

const notificationStore = useNotificationStore();
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
    <TransitionGroup name="toast">
      <div 
        v-for="notification in notificationStore.notifications" 
        :key="notification.id"
        class="pointer-events-auto min-w-[320px] max-w-sm rounded-xl p-4 shadow-lg border-l-4 overflow-hidden bg-white flex items-start gap-3 transform transition-all data-[loaded=true]:opacity-100"
        :class="{
          'border-green-500': notification.type === 'success',
          'border-red-500': notification.type === 'error',
          'border-blue-500': notification.type === 'info',
          'border-yellow-500': notification.type === 'warning'
        }"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <CheckCircle v-if="notification.type === 'success'" class="w-5 h-5 text-green-500" />
          <AlertCircle v-else-if="notification.type === 'error'" class="w-5 h-5 text-red-500" />
          <AlertTriangle v-else-if="notification.type === 'warning'" class="w-5 h-5 text-yellow-500" />
          <Info v-else class="w-5 h-5 text-blue-500" />
        </div>

        <!-- Content -->
        <div class="flex-1">
          <p class="font-bold text-[#4a3728] text-sm">{{ notification.message }}</p>
        </div>

        <!-- Close -->
        <button @click="notificationStore.remove(notification.id)" class="text-gray-400 hover:text-gray-600">
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
