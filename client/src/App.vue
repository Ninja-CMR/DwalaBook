<script setup lang="ts">
import { RouterView } from 'vue-router';
import { isConnectingError } from './api';
import { WifiOff, AlertCircle } from 'lucide-vue-next';
</script>

<template>
  <div class="min-h-screen">
    <!-- Global Connection Alert -->
    <div 
      v-if="isConnectingError"
      class="fixed font-outfit top-0 left-0 right-0 z-[1000] bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-3 shadow-lg animate-bounce"
    >
       <WifiOff class="w-5 h-5 flex-shrink-0" />
       <span class="text-sm font-black uppercase tracking-widest">Connexion au serveur perdue... Tentative de reconnexion en cours.</span>
       <AlertCircle class="w-4 h-4 ml-2" />
    </div>

    <RouterView />
  </div>
</template>

<style>
/* Global font and smoothness */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
