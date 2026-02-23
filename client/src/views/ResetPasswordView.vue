<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const token = ref((route.query.token as string) || '');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);
const error = ref('');

onMounted(() => {
  if (!token.value) {
    error.value = 'Token de réinitialisation manquant.';
  }
});

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }
  
  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit faire au moins 6 caractères.';
    return;
  }

  isLoading.value = true;
  error.value = '';
  try {
    await api.post('/auth/reset-password', { token: token.value, password: password.value });
    isSuccess.value = true;
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#fcf9f4] flex flex-col justify-center py-12 px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <h1 class="text-4xl font-black text-[#8b5e3c] italic tracking-tighter">DwalaBook</h1>
      <h2 class="mt-6 text-3xl font-extrabold text-[#4a3728]">
        Choisir un nouveau mot de passe
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 shadow-xl rounded-[2.5rem] border border-gray-100">
        <div v-if="!isSuccess">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
              <div class="mt-1 relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock class="w-5 h-5" />
                </div>
                <input 
                  v-model="password"
                  type="password" 
                  required 
                  class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]/20 focus:border-[#8b5e3c]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
              <div class="mt-1 relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock class="w-5 h-5" />
                </div>
                <input 
                  v-model="confirmPassword"
                  type="password" 
                  required 
                  class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]/20 focus:border-[#8b5e3c]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div v-if="error" class="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle class="w-4 h-4" />
              {{ error }}
            </div>

            <button 
              type="submit" 
              :disabled="isLoading || !!error && !token"
              class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#8b5e3c] hover:bg-[#4a3728] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5e3c] transition-all active:scale-95 disabled:opacity-70"
            >
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin mr-2" />
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>

        <div v-else class="text-center py-4 space-y-4">
          <div class="flex justify-center">
            <CheckCircle2 class="w-16 h-16 text-green-500" />
          </div>
          <p class="text-xl font-bold text-[#4a3728]">Mot de passe mis à jour !</p>
          <p class="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    </div>
  </div>
</template>
