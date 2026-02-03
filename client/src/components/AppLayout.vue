<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { Menu, X, LayoutDashboard, Calendar, CreditCard, LogOut, ChevronRight, Settings, CalendarDays, Users } from 'lucide-vue-next';
import ToastContainer from './ToastContainer.vue';

const authStore = useAuthStore();
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const logout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="flex h-screen bg-[#fcf9f4] font-outfit overflow-hidden">
    <ToastContainer />
    <!-- Desktop Sidebar -->
    <aside class="w-72 bg-[#4a3728] text-white hidden lg:flex flex-col shadow-2xl relative z-30">
      <div class="p-8 pb-12">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#8b5e3c] rounded-xl flex items-center justify-center shadow-lg">
            <Calendar class="w-6 h-6 text-white" />
          </div>
          <span class="text-2xl font-black tracking-tighter uppercase italic">DwalaBook</span>
        </div>
      </div>

      <nav class="flex-1 px-4 space-y-2">
        <router-link to="/dashboard" class="group flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-300 hover:bg-white/10" active-class="bg-[#8b5e3c] shadow-lg shadow-[#8b5e3c]/40">
          <LayoutDashboard class="w-5 h-5 opacity-70 group-hover:opacity-100" />
          <span class="font-bold">Tableau de bord</span>
        </router-link>
        
        <router-link to="/appointments" class="group flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-300 hover:bg-white/10" active-class="bg-[#8b5e3c] shadow-lg shadow-[#8b5e3c]/40">
          <CalendarDays class="w-5 h-5 opacity-70 group-hover:opacity-100" />
          <span class="font-bold">Rendez-vous</span>
        </router-link>

        <router-link to="/calendar" class="group flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-300 hover:bg-white/10" active-class="bg-[#8b5e3c] shadow-lg shadow-[#8b5e3c]/40">
          <Calendar class="w-5 h-5 opacity-70 group-hover:opacity-100" />
          <span class="font-bold">Agenda</span>
        </router-link>

        <router-link to="/clients" class="group flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-300 hover:bg-white/10" active-class="bg-[#8b5e3c] shadow-lg shadow-[#8b5e3c]/40">
          <Users class="w-5 h-5 opacity-70 group-hover:opacity-100" />
          <span class="font-bold">Clients</span>
        </router-link>

        <router-link to="/pricing" class="group flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-300 hover:bg-white/10" active-class="bg-[#8b5e3c] shadow-lg shadow-[#8b5e3c]/40">
          <CreditCard class="w-5 h-5 opacity-70 group-hover:opacity-100" />
          <span class="font-bold">Tarifs & Plans</span>
        </router-link>

        <router-link to="/settings" class="group flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-300 hover:bg-white/10" active-class="bg-[#8b5e3c] shadow-lg shadow-[#8b5e3c]/40">
          <Settings class="w-5 h-5 opacity-70 group-hover:opacity-100" />
          <span class="font-bold">Paramètres</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-white/5 space-y-4">
        <div class="bg-black/20 p-4 rounded-2xl flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#8b5e3c] flex items-center justify-center font-black text-sm">
            {{ authStore.user?.name.charAt(0) }}
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-sm font-black truncate">{{ authStore.user?.name }}</p>
            <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest">{{ authStore.user?.plan }}</p>
          </div>
        </div>

        <button @click="logout" class="w-full flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-300 hover:bg-red-500/10 text-white/70 hover:text-red-400">
          <LogOut class="w-5 h-5" />
          <span class="font-bold">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Navigation -->
    <div class="flex-1 flex flex-col min-w-0 relative">
      <!-- Mobile Header -->
      <header class="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-[#4a3728] rounded-lg flex items-center justify-center">
            <Calendar class="w-5 h-5 text-white" />
          </div>
          <span class="font-black text-xl tracking-tighter uppercase italic text-[#4a3728]">DwalaBook</span>
        </div>
        
        <button @click="toggleMenu" class="p-2 text-[#4a3728] hover:bg-gray-100 rounded-xl transition-colors">
          <Menu v-if="!isMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </header>

      <!-- Mobile Menu Overlay -->
      <transition 
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div v-if="isMenuOpen" class="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div class="absolute inset-0 bg-[#4a3728]/60 backdrop-blur-sm" @click="toggleMenu"></div>
          <aside class="absolute top-0 right-0 bottom-0 w-[80%] bg-[#4a3728] text-white p-8 flex flex-col shadow-2xl">
            <div class="flex justify-between items-center mb-12">
               <span class="font-black text-2xl tracking-tighter uppercase italic">Menu</span>
               <button @click="toggleMenu" class="p-2 bg-white/10 rounded-xl">
                 <X class="w-6 h-6" />
               </button>
            </div>

            <nav class="flex-1 space-y-4">
              <router-link to="/dashboard" @click="isMenuOpen = false" class="flex items-center justify-between py-4 px-6 bg-white/5 rounded-2xl active:bg-[#8b5e3c]">
                <div class="flex items-center gap-4">
                  <LayoutDashboard class="w-5 h-5 opacity-70" />
                  <span class="font-black">Dashboard</span>
                </div>
                <ChevronRight class="w-4 h-4 opacity-50" />
              </router-link>
              
              <router-link to="/appointments" @click="isMenuOpen = false" class="flex items-center justify-between py-4 px-6 bg-white/5 rounded-2xl active:bg-[#8b5e3c]">
                <div class="flex items-center gap-4">
                  <Calendar class="w-5 h-5 opacity-70" />
                  <span class="font-black">Rendez-vous</span>
                </div>
                <ChevronRight class="w-4 h-4 opacity-50" />
              </router-link>

              <router-link to="/pricing" @click="isMenuOpen = false" class="flex items-center justify-between py-4 px-6 bg-white/5 rounded-2xl active:bg-[#8b5e3c]">
                <div class="flex items-center gap-4">
                  <CreditCard class="w-5 h-5 opacity-70" />
                  <span class="font-black">Tarifs</span>
                </div>
                <ChevronRight class="w-4 h-4 opacity-50" />
              </router-link>
            </nav>

            <div class="mt-auto space-y-6">
              <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                <div class="w-12 h-12 rounded-full bg-[#8b5e3c] flex items-center justify-center font-black text-lg">
                  {{ authStore.user?.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-black text-lg">{{ authStore.user?.name }}</p>
                  <p class="text-xs font-bold text-white/40 uppercase tracking-widest">{{ authStore.user?.plan }}</p>
                </div>
              </div>
              <button @click="logout" class="w-full flex items-center justify-center gap-3 py-5 bg-red-500/20 text-red-100 rounded-2xl font-black">
                <LogOut class="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      </transition>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto bg-[#fcf9f4] p-6 md:p-12 lg:p-16">
        <slot />
      </main>
    </div>
  </div>
</template>
